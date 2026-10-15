# SEO, Social Previews and Accessibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Branded link previews, complete SEO head metadata (canonical, JSON-LD, robots, sitemap), new favicon, and accessibility fixes for the Astro portfolio.

**Architecture:** SEO copy and the canonical URL live in `cv.json` (`basics.url`, `basics.seo`). `Layout.astro` renders all head tags from props plus `cv`. A `StructuredData.astro` component emits JSON-LD. Static endpoints emit `robots.txt` and `sitemap.xml`. A Playwright script renders the preview image and apple-touch icon into `public/`, and they are committed.

**Tech Stack:** Astro 4.3 (static output, `@astrojs/vercel/static`), TypeScript strict, Playwright (devDependency, script only), pnpm.

Spec: [docs/superpowers/specs/2026-10-15-seo-social-a11y-design.md](../specs/2026-10-15-seo-social-a11y-design.md)

## Global Constraints

- Canonical origin: `https://www.vlorente.dev`. Every absolute URL in head tags must start with it.
- `basics.seo.title`: `Valentín Lorente — Product Owner y Technical Product Manager`.
- `basics.seo.description`: `Product Owner y Technical Product Manager con base de ingeniería: producto de principio a fin, APIs e integraciones y resultados medibles. Madrid o remoto.`
- Preview image: `public/og.jpg`, 1200×630 JPEG, under 300 KB.
- No phone number anywhere on the website, including JSON-LD.
- UI text in Spanish. Colors: bg `#0b0b0c`, text `#ededed`, muted `#8a8a8a`, accent `#c6ff3d`.
- `docs/perfil_maestro.md` is the content source of truth; nothing marked `[PENDIENTE]` is published.
- Verification is `pnpm build` (astro check + build) with 0 errors. No test runner.
- Work on branch `feat/seo-social-a11y`. Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Never stage `docs/perfil_maestro.md`, `docs/*.pdf`, `pnpm-lock.yaml`.

---

### Task 1: SEO head, structured data, robots and sitemap

**Files:**
- Modify: `cv.json`, `src/cv.d.ts`, `src/data/cv.ts`, `src/layouts/Layout.astro`, `src/pages/index.astro`, `CLAUDE.md`
- Create: `src/components/StructuredData.astro`, `src/pages/robots.txt.ts`, `src/pages/sitemap.xml.ts`

**Interfaces:**
- Produces: `cv.basics.seo: { title: string; description: string }`; from `@/data/cv`: `OG_IMAGE = { path: "/og.jpg", width: 1200, height: 630, type: "image/jpeg" }` and `absoluteUrl(path: string): string`; `Layout` props `{ title: string; description: string }`.

- [ ] **Step 1: Types first (red).** In `src/cv.d.ts`, add `seo: Seo` to `Basics` (after `summary`) and:

```ts
export interface Seo {
  title: string
  description: string
}
```

Run `pnpm astro check`. Expected: FAIL in `src/data/cv.ts` (cv.json lacks `seo`).

- [ ] **Step 2: Data.** In `cv.json` `basics`, set `"url": "https://www.vlorente.dev"` and add after `summary`:

```json
"seo": {
  "title": "Valentín Lorente — Product Owner y Technical Product Manager",
  "description": "Product Owner y Technical Product Manager con base de ingeniería: producto de principio a fin, APIs e integraciones y resultados medibles. Madrid o remoto."
},
```

- [ ] **Step 3: Helpers.** Append to `src/data/cv.ts`:

```ts
export const OG_IMAGE = { path: "/og.jpg", width: 1200, height: 630, type: "image/jpeg" } as const

export function absoluteUrl(path: string): string {
  return new URL(path, cv.basics.url).href
}
```

- [ ] **Step 4: Create `src/components/StructuredData.astro`:**

```astro
---
import { absoluteUrl, cv } from "@/data/cv"

const { name, label, email, image, location, profiles, seo } = cv.basics
const currentJob = cv.work.find(({ endDate }) => endDate === null)

const person = {
  "@context": "https://schema.org",
  "@type": "Person",
  name,
  jobTitle: label.split(" · ")[0],
  description: seo.description,
  url: absoluteUrl("/"),
  image: absoluteUrl(image),
  email: `mailto:${email}`,
  address: {
    "@type": "PostalAddress",
    addressLocality: location.city,
    addressCountry: location.countryCode,
  },
  sameAs: profiles.map(({ url }) => url),
  ...(currentJob && { worksFor: { "@type": "Organization", name: currentJob.name } }),
  alumniOf: cv.education.map(({ institution }) => ({
    "@type": "EducationalOrganization",
    name: institution,
  })),
  knowsLanguage: cv.languages.map(({ language }) => language),
}
---

<script is:inline type="application/ld+json" set:html={JSON.stringify(person)} />
```

- [ ] **Step 5: Rewrite the head of `src/layouts/Layout.astro`.** Replace the frontmatter's data block and everything from `<meta charset>` up to (not including) the inline motion `<script is:inline>`:

```astro
---
import "@fontsource/instrument-serif/400.css"
import "@fontsource/instrument-serif/400-italic.css"
import "@fontsource-variable/inter-tight"
import "@/styles/global.css"

import StructuredData from "@/components/StructuredData.astro"
import { absoluteUrl, cv, OG_IMAGE } from "@/data/cv"

interface Props {
  title: string
  description: string
}

const { title, description } = Astro.props

const { name, label, image } = cv.basics
const canonical = absoluteUrl("/")
const ogImage = absoluteUrl(OG_IMAGE.path)
const ogImageAlt = `${name} — ${label}`
---

<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta name="author" content={name} />
    <link rel="canonical" href={canonical} />
    <meta name="theme-color" content="#0b0b0c" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
    <link rel="preload" as="image" href={image} />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content={name} />
    <meta property="og:locale" content="es_ES" />
    <meta property="og:url" content={canonical} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={ogImage} />
    <meta property="og:image:type" content={OG_IMAGE.type} />
    <meta property="og:image:width" content={String(OG_IMAGE.width)} />
    <meta property="og:image:height" content={String(OG_IMAGE.height)} />
    <meta property="og:image:alt" content={ogImageAlt} />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={ogImage} />
    <meta name="twitter:image:alt" content={ogImageAlt} />

    <StructuredData />
```

Keep the inline motion script, `</head>`, and the body exactly as they are.

- [ ] **Step 6: Page.** In `src/pages/index.astro`, change the data line to `const { seo } = cv.basics` and the layout tag to `<Layout title={seo.title} description={seo.description}>`.

- [ ] **Step 7: Create `src/pages/robots.txt.ts`:**

```ts
import type { APIRoute } from "astro"
import { absoluteUrl } from "@/data/cv"

export const GET: APIRoute = () =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl("/sitemap.xml")}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
```

- [ ] **Step 8: Create `src/pages/sitemap.xml.ts`:**

```ts
import type { APIRoute } from "astro"
import { absoluteUrl } from "@/data/cv"

export const GET: APIRoute = () => {
  const lastmod = new Date().toISOString().slice(0, 10)
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${absoluteUrl("/")}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>
</urlset>
`
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } })
}
```

- [ ] **Step 9: Verify (green).** Run `pnpm build` → 0 errors. Then check `.vercel/output/static/`: `robots.txt` and `sitemap.xml` exist; `index.html` contains `<link rel="canonical" href="https://www.vlorente.dev/">`, `og:image` = `https://www.vlorente.dev/og.jpg`, `twitter:card` = `summary_large_image`, and an `application/ld+json` script with no phone number.

- [ ] **Step 10: CLAUDE.md.** Under Architecture add: "SEO: `basics.seo` (title, description) and `basics.url` (canonical origin `https://www.vlorente.dev`) drive the head tags in `Layout.astro`; `StructuredData.astro` emits JSON-LD `Person`; `src/pages/robots.txt.ts` and `sitemap.xml.ts` are static endpoints."

- [ ] **Step 11: Commit** `feat: add SEO head metadata, JSON-LD, robots and sitemap` (stage only the files above).

---

### Task 2: Preview image, favicon and apple-touch icon

**Files:**
- Modify: `package.json` (devDependency + script), `public/favicon.svg`, `CLAUDE.md`
- Create: `scripts/social-images.mjs`, `public/og.jpg`, `public/apple-touch-icon.png`

**Interfaces:**
- Consumes: `OG_IMAGE.path` = `/og.jpg` (Task 1); `cv.json` `basics.name`, `headline`, `label`, `image`, `url`.

- [ ] **Step 1: devDependency.** `pnpm add -D playwright@1.62.1` (exact). Chromium is already installed locally; if the script reports a missing browser, run `pnpm exec playwright install chromium`. Add to `package.json` scripts: `"social-images": "node scripts/social-images.mjs"`.

- [ ] **Step 2: Create `scripts/social-images.mjs`:**

```js
// Renders the social preview card (public/og.jpg) and the apple-touch icon
// (public/apple-touch-icon.png) from cv.json. Re-run after changing the
// headline, label or photo: `pnpm social-images`.
import { readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"

const root = new URL("../", import.meta.url)
const cv = JSON.parse(await readFile(new URL("cv.json", root), "utf8"))
const { name, headline, label, image, url } = cv.basics

async function dataUri(relativePath, mime) {
  const bytes = await readFile(new URL(relativePath, root))
  return `data:${mime};base64,${bytes.toString("base64")}`
}

const serif = await dataUri(
  "node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff2",
  "font/woff2"
)
const sans = await dataUri(
  "node_modules/@fontsource-variable/inter-tight/files/inter-tight-latin-wght-normal.woff2",
  "font/woff2"
)
const photo = await dataUri(`public${image}`, "image/webp")

const role = label.split(" · ").slice(0, 2).join(" · ")
const host = new URL(url).host

const fonts = `
  @font-face { font-family: "Instrument Serif"; src: url(${serif}) format("woff2"); }
  @font-face { font-family: "Inter Tight"; src: url(${sans}) format("woff2"); font-weight: 100 900; }
  html, body { margin: 0; background: #0b0b0c; color: #ededed; }
`

const ogHtml = `<!doctype html><html><head><meta charset="utf-8"><style>${fonts}
  .card { box-sizing: border-box; width: 1200px; height: 630px; padding: 72px 80px;
    display: flex; align-items: center; justify-content: space-between; gap: 64px; }
  .text { display: flex; flex-direction: column; gap: 28px; max-width: 640px; }
  .name { margin: 0; font: 500 22px/1 "Inter Tight"; letter-spacing: 0.14em; text-transform: uppercase; color: #8a8a8a; }
  h1 { margin: 0; font: 400 84px/0.98 "Instrument Serif"; letter-spacing: -0.02em; }
  .role { margin: 0; font: 500 26px/1.3 "Inter Tight"; }
  .host { margin: 0; display: flex; align-items: center; gap: 16px; font: 500 22px/1 "Inter Tight"; color: #c6ff3d; }
  .bar { width: 48px; height: 3px; background: #c6ff3d; }
  img { width: 360px; height: 450px; object-fit: cover; border-radius: 20px; filter: grayscale(1) contrast(1.05); }
</style></head><body><main class="card">
  <div class="text">
    <p class="name">${name}</p>
    <h1>${headline}</h1>
    <p class="role">${role}</p>
    <p class="host"><span class="bar"></span>${host}</p>
  </div>
  <img src="${photo}" alt="">
</main></body></html>`

const iconHtml = `<!doctype html><html><head><meta charset="utf-8"><style>${fonts}
  .icon { width: 180px; height: 180px; display: grid; place-items: center;
    font: 400 104px/1 "Instrument Serif"; color: #c6ff3d; letter-spacing: -0.04em; }
</style></head><body><div class="icon">VL</div></body></html>`

const browser = await chromium.launch()
try {
  const og = await browser.newPage({ viewport: { width: 1200, height: 630 } })
  await og.setContent(ogHtml, { waitUntil: "load" })
  await og.evaluate(() => document.fonts.ready)
  await og.screenshot({ path: fileURLToPath(new URL("public/og.jpg", root)), type: "jpeg", quality: 88 })

  const icon = await browser.newPage({ viewport: { width: 180, height: 180 } })
  await icon.setContent(iconHtml, { waitUntil: "load" })
  await icon.evaluate(() => document.fonts.ready)
  await icon.screenshot({ path: fileURLToPath(new URL("public/apple-touch-icon.png", root)) })
} finally {
  await browser.close()
}

console.log("Wrote public/og.jpg and public/apple-touch-icon.png")
```

- [ ] **Step 3: Run it.** `pnpm social-images`. Expected output: `Wrote public/og.jpg and public/apple-touch-icon.png`. Then check that `og.jpg` is 1200×630 and under 300 KB, and look at both images (Read tool). The headline must not overflow, the photo must be visible, and accents (í, é) must render in the right fonts.

- [ ] **Step 4: Replace `public/favicon.svg`:**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#0b0b0c"/>
  <text x="32" y="44" text-anchor="middle" font-family="'Instrument Serif', Georgia, 'Times New Roman', serif" font-size="34" fill="#c6ff3d">VL</text>
</svg>
```

- [ ] **Step 5: CLAUDE.md.** Under Commands add: "`pnpm social-images` — regenerates `public/og.jpg` (link preview, 1200×630) and `public/apple-touch-icon.png` from `cv.json` with Playwright; run it after changing the headline, label or photo, and commit the images."

- [ ] **Step 6: Verify and commit.** `pnpm build` → 0 errors. Commit `feat: add branded link preview image and new favicon` with `package.json`, `scripts/social-images.mjs`, `public/og.jpg`, `public/apple-touch-icon.png`, `public/favicon.svg`, `CLAUDE.md`.

---

### Task 3: Accessibility fixes

**Files:**
- Modify: `src/styles/global.css`, `src/layouts/Layout.astro`, `src/pages/index.astro`, `src/icons/GitHub.astro`, `src/icons/LinkedIn.astro`, `src/icons/Mail.astro`, `src/icons/WorldMap.astro`, `src/components/SocialLinks.astro`, `src/components/Nav.astro`, `src/components/sections/Hero.astro`

- [ ] **Step 1: Utilities.** Append to `src/styles/global.css` (before the motion rules):

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.skip-link {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 100;
  padding: 0.75rem 1.25rem;
  border-radius: 999px;
  background: var(--accent);
  color: var(--accent-ink);
  font-weight: 500;
  transform: translateY(-200%);
  transition: transform 0.2s;
}

.skip-link:focus-visible {
  transform: none;
}
```

- [ ] **Step 2: Skip link.** In `Layout.astro`, make the first child of `<body>`: `<a class="skip-link" href="#contenido">Saltar al contenido</a>`. In `index.astro`, change `<main>` to `<main id="contenido" tabindex="-1">`.

- [ ] **Step 3: Decorative icons.** In each of `GitHub.astro`, `LinkedIn.astro`, `Mail.astro`, `WorldMap.astro`: add `aria-hidden="true" focusable="false"` to the root `<svg>` and delete its `<title>…</title>` element if present.

- [ ] **Step 4: New-tab labels.** In `SocialLinks.astro`, change the profile link label to ``aria-label={`Perfil de ${name} en ${network} (se abre en una pestaña nueva)`}``.

- [ ] **Step 5: CV links.** In `Nav.astro` and `Hero.astro`, each `href={CV_PDF} download` link gets `type="application/pdf"`, and its text becomes `Descargar CV<span class="sr-only"> (PDF)</span>`.

- [ ] **Step 6: Verify and commit.** `pnpm build` → 0 errors. In the built HTML: the skip link is first in body, `main#contenido` exists, no `<title>` inside icon SVGs. Commit `fix: add skip link and tidy accessible names`.

---

### Task 4: Verification pass

- [ ] **Step 1:** `pnpm build`, then serve `.vercel/output/static` on a free port in the background. Stop only that process at the end.
- [ ] **Step 2:** Lighthouse (desktop) with `--only-categories=seo,accessibility`. Expected: SEO 100, accessibility ≥ 95. Fix anything other than the known transient scrub-word contrast flag, and commit fixes as `fix:`.
- [ ] **Step 3:** Keyboard check with Playwright: the first Tab focuses "Saltar al contenido" and it is visible; Enter moves focus to `#contenido`.
- [ ] **Step 4:** Report the head tags found in the built `index.html` (title, description, canonical, all `og:*` and `twitter:*`, the JSON-LD body) and the Lighthouse scores.
