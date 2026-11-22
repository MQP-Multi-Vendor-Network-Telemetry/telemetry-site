import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const ORG_URL = 'https://github.com/MQP-Multi-Vendor-Network-Telemetry';

const config: Config = {
  title: 'Multi-Vendor Network Telemetry',
  tagline: 'One view of a network, whatever brand its switches are.',
  favicon: 'img/favicon.svg',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Where the site is served: GitHub Pages, as a project site of the org, so
  // every page is under /telemetry-site/. With a custom domain, or a repo
  // renamed to <org>.github.io, baseUrl becomes '/'.
  url: 'https://mqp-multi-vendor-network-telemetry.github.io',
  baseUrl: '/telemetry-site/',
  trailingSlash: false,

  organizationName: 'MQP-Multi-Vendor-Network-Telemetry',
  projectName: 'telemetry-site',

  onBrokenLinks: 'throw',

  // A .md file is plain Markdown, so a dev log written elsewhere can be pasted
  // in as is. Only .mdx files (the product pages, which import components) are
  // parsed as MDX, where a bare `<` or `{` is code.
  markdown: {
    format: 'detect',
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  // Inter and DM Mono are the fonts of the products' redesign (TeleNorm).
  headTags: [
    {tagName: 'link', attributes: {rel: 'preconnect', href: 'https://fonts.googleapis.com'}},
    {tagName: 'link', attributes: {rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous'}},
  ],
  stylesheets: [
    'https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Inter:wght@400;500;600;700&display=swap',
  ],

  presets: [
    [
      'classic',
      {
        // The products, one page each. The repos are private, so there are no
        // "edit this page" links.
        docs: {
          routeBasePath: 'products',
          sidebarPath: './sidebars.ts',
        },
        blog: {
          routeBasePath: 'devlog',
          blogTitle: 'Dev log',
          blogDescription:
            'What we tried, what broke and what we learned building multi-vendor network telemetry.',
          blogSidebarTitle: 'All posts',
          blogSidebarCount: 'ALL',
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            title: 'Multi-Vendor Network Telemetry dev log',
            xslt: true,
          },
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Multi-Vendor Network Telemetry',
      logo: {
        alt: '',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'dropdown',
          label: 'Products',
          position: 'left',
          items: [
            {type: 'doc', docId: 'overview', label: 'How they fit together'},
            {type: 'doc', docId: 'pipeline', label: 'Telemetry pipeline'},
            {type: 'doc', docId: 'platform', label: 'Observability platform'},
            {type: 'doc', docId: 'sonic-lab', label: 'SONiC lab'},
          ],
        },
        {to: '/devlog', label: 'Dev log', position: 'left'},
        {to: '/#team', label: 'Team', position: 'left', activeBaseRegex: '^$'},
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Products',
          items: [
            {label: 'Telemetry pipeline', to: '/products/pipeline'},
            {label: 'Observability platform', to: '/products/platform'},
            {label: 'SONiC lab', to: '/products/sonic-lab'},
          ],
        },
        {
          title: 'Project',
          items: [
            {label: 'How they fit together', to: '/products'},
            {label: 'Dev log', to: '/devlog'},
            {label: 'Team', to: '/#team'},
          ],
        },
        {
          title: 'Code',
          items: [
            {label: 'GitHub organization', href: ORG_URL},
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} Nathan Cote, Shamit Soni and Thomas Gilbert. A WPI Major Qualifying Project.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.oneDark,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
