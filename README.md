# telemetry-site

The project's public website: what we're building, one page for each of our
three products, and the dev log. It's built with
[Docusaurus](https://docusaurus.io/), which turns Markdown into a static site.

The product repos are private, so the site names them but doesn't link to
them. Each product shows "Source coming soon" instead (`src/components/Repo`).
When a repo goes public, pass its URL as `href` there.

---

## Running it

```bash
npm ci
npm start -- --port 3100
```

Opens a dev server at <http://localhost:3100/telemetry-site/> that reloads on
every edit. Every page is under `/telemetry-site/`, as on GitHub Pages. Use
3100 rather than Docusaurus's default 3000, because the pipeline's Grafana
takes 3000. The server listens on localhost only.

```bash
npm run build       # the static site, into build/
npm run serve       # serve build/ locally, to check it before deploying
npm run typecheck
```

`npm run build` fails on a broken internal link, so run it before pushing.

---

## Deploying

The site is live at
<https://mqp-multi-vendor-network-telemetry.github.io/telemetry-site/>.

Every push to `main` deploys it, through `.github/workflows/deploy.yml`, in
about two minutes. A pull request runs the same typecheck and build without
deploying, so a broken link fails the PR instead of the site. To redeploy
without a change, run the workflow from the Actions tab.

GitHub Pages serves this from a public repo only, because the org is on the
free plan. The repo's Settings > Pages must have its source set to "GitHub
Actions". With a custom domain, `baseUrl` in `docusaurus.config.ts` becomes
`'/'`.

---

## Layout

| Path | What's there |
|---|---|
| `src/pages/index.tsx` | The front page: the problem, the products, the design, status and team |
| `docs/` | The product pages, served under `/products`. The sidebar order is in `sidebars.ts` |
| `blog/` | The dev log, served under `/devlog` |
| `src/components/` | `Flow` (the two-paths diagram) and `Repo` (the "Source coming soon" chip) |
| `src/css/custom.css` | The theme |
| `static/img/` | The logo, which is also the favicon |

The look is the products' redesign (TeleNorm): Blueprint in light mode and
Night Watch in dark mode, with Inter and DM Mono. The colors come from
telemetry-platform's `web/src/theme.ts`. A change to the look goes there
first, then here.

---

## Writing a dev log post

Add a file to `blog/` named `YYYY-MM-DD-short-name.md`:

```markdown
---
slug: short-name
title: "What we tried"
description: One sentence for link previews and the post list.
authors: [nathan]
tags: [pipeline]
---

The opening, which shows on the post list.

<!-- truncate -->

The rest.
```

- `authors` are keys from `blog/authors.yml`, and `tags` are keys from
  `blog/tags.yml`. Add a new one there first, or the build warns.
- Everything above `<!-- truncate -->` is the excerpt on the post list.
- A `.md` file is plain Markdown, so a write-up from elsewhere can be pasted
  in. Name it `.mdx` only to import a component. In MDX a bare `<` or `{`
  breaks the build, and the excerpt marker is `{/* truncate */}`.

---

## Your profile

Each of us has a card on the front page and an entry for dev log bylines. Fill
in both, with the same headline.

In `src/pages/index.tsx`, add a `headline` and your `linkedin` URL to your
entry in `TEAM`:

```ts
{name: 'Nathan Cote', initials: 'NC',
 headline: 'One line about you',
 linkedin: 'https://www.linkedin.com/in/your-handle/'},
```

In `blog/authors.yml`, add the same headline as `title`, and your handle:

```yaml
nathan:
  name: Nathan Cote
  title: One line about you
  socials:
    linkedin: your-handle
```

Either field can be left out, and the card shows only what's there. External
links open in a new tab, because the site uses Docusaurus's `Link` for them.

---

## Updating the status

The front page's "Where we are" cards are `STATUS` in `src/pages/index.tsx`,
and each product page has a Status section. Update both when something ships.
