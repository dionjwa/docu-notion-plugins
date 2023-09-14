# docu-notion plugins

Plugins for [docu-notion](https://www.npmjs.com/package/@sillsdev/docu-notion) (min version `0.14.0`)

 - adjusts mermaid links to other notion documents so they work in docusaurus
 - fixes paths when you have `./docs` and `./blog`
 - columns break, uses different column rendering that works with images and mermaid diagrams


## Usage:

Example `docu-notion.config.ts`:

```typescript
import {
  IDocuNotionConfig,
  Log,
} from '@sillsdev/docu-notion';

import {
  correctNotionUrlsInMermaid,
  modifiedStandardInternalLinkConversion,
  notionColumnsUpgraded,
} from '@dionjw/docu-notion-plugins';

const config: IDocuNotionConfig = {
  plugins: [
    notionColumnsUpgraded,
    correctNotionUrlsInMermaid(),
    modifiedStandardInternalLinkConversion,
  ],
};
export default config;
```

For the `notionColumnsUpgraded` plugin you will need this css added to your docusaurus:

```css
.custom-docunotion-row {
  display: flex;
  direction: row;
  min-height: 0;
  max-height: 100%;
  align-self: center;
  
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
  
.custom-docunotion-row-cell {
  /* Allow shrinkage */
  flex: 1 1 auto;
  height: 100%;
  text-align: center;
}

```