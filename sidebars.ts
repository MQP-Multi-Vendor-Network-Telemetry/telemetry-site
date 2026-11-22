import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

// One page per product (one per main repo), after the page on how they fit.
const sidebars: SidebarsConfig = {
  products: ['overview', 'pipeline', 'platform', 'sonic-lab'],
};

export default sidebars;
