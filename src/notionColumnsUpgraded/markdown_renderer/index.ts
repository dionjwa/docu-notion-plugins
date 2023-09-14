// copied from https://github.com/lj-n/deno-markdown-renderer

import {
  He,
  Marked,
  Prismjs,
  sanitizeHTML,
} from './deps';

const TAGS = sanitizeHTML.defaults.allowedTags;
const ATTRIBUTES: { [key: string]: string[] } = {
  ...sanitizeHTML.defaults.allowedAttributes,
  a: ["href", "title", "rel", "tabindex", "aria-hidden", "class"],
  h1: ["id", "class"],
  h2: ["id", "class"],
  h3: ["id", "class"],
  h4: ["id", "class"],
  h5: ["id", "class"],
  h6: ["id", "class"],
};
const CLASSES: { [key: string]: string[] } = {
  a: ["anchor"],
  pre: ["highlight", "language-*"],
  span: [
    "atrule-id",
    "attr-name",
    "boolean",
    "cdata",
    "class-name",
    "comment",
    "control",
    "doctype",
    "function",
    "keyword",
    "namespace",
    "number",
    "operator",
    "plain-text",
    "prolog",
    "property",
    "punctuation",
    "regex",
    "regex-delimiter",
    "script",
    "script-punctuation",
    "selector",
    "statement",
    "string",
    "tag",
    "tag-id",
    "token",
    "unit",
  ],
};
interface CustomRenderOptions {
  anchorElement?: string;
  linkClass?: string;
  headingClass?: string;
  codeClass?: string;
}
class Renderer extends Marked.Renderer {
  customOptions: CustomRenderOptions = {};
  constructor(customOptions: CustomRenderOptions = {}) {
    super();
    this.customOptions = customOptions;
  }
  code(code: string, lang = "") {
    const { codeClass } = this.customOptions;
    const customClass = codeClass ? ` class="${codeClass}"` : "";
    if (!Object.hasOwnProperty.call(Prismjs.languages, lang)) {
      return `<pre${customClass}><code>${He.escape(code)}</code></pre$>`;
    }
    const html = Prismjs.highlight(code, Prismjs.languages[lang], lang);
    return `<pre class="highlight language-${lang}"${customClass}>${html}</pre>`;
  }
  
  heading(
    text: string,
    level: 1 | 2 | 3 | 4 | 5 | 6,
    raw: string,
    
    slugger: Marked.Slugger
  ) {
    const slug = slugger.slug(raw);
    const { anchorElement, headingClass } = this.customOptions;
    const customClass = headingClass ? ` class="${headingClass}"` : "";
    if (!anchorElement) {
      return `<h${level} id="${slug}"${customClass}>${text}</h${level}>`;
    }
    return `<h${level} id="${slug}"${customClass}><a class="anchor" aria-hidden="true" tabindex="-1" href="#${slug}">${anchorElement}</a>${text}</h${level}>`;
  }
  link(href: string, title: string, text: string) {
    const { linkClass } = this.customOptions;
    const customClass = linkClass ? ` class="${linkClass}"` : "";
    if (href.startsWith("#")) {
      return `<a href="${href}"${customClass}>${text}</a>`;
    }
    return `<a href="${href}" title="${title}" rel="noopener noreferrer"${customClass}>${text}</a>`;
  }
}
export interface Options
  extends Omit<
    sanitizeHTML.IOptions,
    "allowedTags" | "allowedAttributes" | "allowedClasses"
  > {
  gfm?: boolean;
  render?: CustomRenderOptions;
  allowedTags?: string[];
  allowedAttributes?: { [key: string]: string[] };
  allowedClasses?: { [key: string]: string[] };
  disableDefaults?: boolean;
}
export function renderMarkdown(markdown: string, options: Options = {}) {
  const {
    gfm = true,
    allowedTags = [],
    allowedAttributes = {},
    allowedClasses = {},
    ...rest
  } = options;
  const htmlString = Marked.marked(markdown, {
    renderer: new Renderer(options.render),
    gfm,
  });
  if (options.disableDefaults) {
    return sanitizeHTML(htmlString, {
      ...rest,
      allowedTags,
      allowedAttributes,
      allowedClasses,
    });
  }
  for (const key in allowedAttributes) {
    ATTRIBUTES[key] =
      ATTRIBUTES[key]?.concat(allowedAttributes[key]) || allowedAttributes[key];
  }
  for (const key in allowedClasses) {
    CLASSES[key] =
      CLASSES[key]?.concat(allowedClasses[key]) || allowedClasses[key];
  }
  return sanitizeHTML(htmlString, {
    ...rest,
    allowedTags: allowedTags.concat(TAGS),
    allowedAttributes: ATTRIBUTES,
    allowedClasses: CLASSES,
  });
}
