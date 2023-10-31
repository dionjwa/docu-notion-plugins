import {
  blobToBase64String,
  getHashParamValueJson,
  setHashValueInUrl,
} from '@metapages/hash-query';
import { MetapageDefinitionV3 } from '@metapages/metapage';
import {
  IDocuNotionContext,
  IPlugin,
} from '@sillsdev/docu-notion';

const fetch = require('node-fetch');

export const embedToIframe: IPlugin = {
  name: "embed-to-iframe",

  regexMarkdownModifications: [
    // replace embeds with iframes
    {
      regex: /\[embed\]\((\S+)\)/,
      getReplacement: async (
        context: IDocuNotionContext,
        match: RegExpExecArray
      ): Promise<string> => {
        const urlString = match[1];
        if (!urlString) {
          return match[0];
        }

        const url = new URL(urlString);

        let possibleMetapageDefinition :MetapageDefinitionV3 | undefined = undefined;
        let iframeHeight = 300;
        if (url.hostname.includes("metapage")) {
            // We can get more info
            possibleMetapageDefinition = getHashParamValueJson(urlString, "definition");
            
            if (!possibleMetapageDefinition) {
                // We can get more info
                const urlBLobToFetchJson = new URL(urlString);
                if (!urlBLobToFetchJson.pathname.endsWith("metapage.json")) {
                    urlBLobToFetchJson.pathname = urlBLobToFetchJson.pathname + (urlBLobToFetchJson.pathname.endsWith("/") ? "" : "/") + "metapage.json";
                }
                try {
                    const r = await fetch(urlBLobToFetchJson.href);
                    possibleMetapageDefinition = await r.json() as MetapageDefinitionV3;
                } catch(err) {
                    //ignored
                }
            }
            if (possibleMetapageDefinition) {
                // We can get better layout info
                const gridlayout = possibleMetapageDefinition?.meta?.layouts?.["react-grid-layout"];
                if (gridlayout) {
                    const rowHeight :number = gridlayout?.rowHeight || 100;
                    const maxHeightBlocks = gridlayout?.layout.reduce((acc :number, cur :{h:number, y:number}) => {
                        return Math.max(acc, cur.h + cur.y);
                    }, 1);
                    const height = maxHeightBlocks * rowHeight;
                    iframeHeight = height;
                }

                const newMetapageUrl = `https://app.metapages.org/#?definition=${blobToBase64String(possibleMetapageDefinition)}&hide-header=true`;
                url.href = newMetapageUrl;
            }
            // fudge
            iframeHeight += 150; // for the header plus padding, currently not part of the compute
        }

        // Check for redirects
        try {
            const maybeRedirectResponse = await fetch(urlString, {redirect: "manual"});
            if (maybeRedirectResponse.status === 302) {
                const location = maybeRedirectResponse.headers.get("location");
                if (location) {
                    url.href = location;
                }
            }
        } catch(err) {
            // ignored
        }

        // put js metaframes in edit mode
        if (url.hostname === "js.mtfm.io") {
            url.href = setHashValueInUrl(url.href, "edit", "1");
        }

        return `\n<iframe scrolling="no" allow="fullscreen *; camera *; speaker *;" style={{width:"100%",height:"${iframeHeight}px",overflow:"hidden"}} src="${url.href}"></iframe>\n`
      },
    },
  ],
};
