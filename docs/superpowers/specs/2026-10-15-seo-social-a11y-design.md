# SEO, social previews and accessibility — design

Date: 2026-10-15
Status: approved in conversation

## Goal

Make shared links (LinkedIn, WhatsApp, Slack, X) show a branded preview, fix the SEO basics, and close the remaining accessibility gaps.

## Findings (production, 2026-10-15)

- The canonical host is `https://www.vlorente.dev`; the apex redirects (308). `cv.json` uses the apex, so `og:url` and `og:image` point at a redirect.
- `og:image` is the `.webp` portrait. LinkedIn does not accept webp, and the image is not 1200×630.
- The `<title>` is 110 characters. The meta description is the full ~600-character summary.
- No `robots.txt` (404), no sitemap, no canonical link, no structured data, no `og:locale`/`og:site_name`/image alt.
- The favicon is the template's generic icon.
- No skip link. Icon SVGs carry `<title>` text inside links that already have an `aria-label`. External links don't say they open a new tab.

## Decisions

| Topic | Decision |
|---|---|
| Preview image | Branded card with photo, 1200×630 JPEG at `public/og.jpg`. |
| Generation | `scripts/social-images.mjs` renders HTML with Playwright (devDependency) and writes `public/og.jpg` and `public/apple-touch-icon.png`. Both are committed. Re-run with `pnpm social-images` when the headline, label or photo changes. |
| Canonical URL | `basics.url` = `https://www.vlorente.dev`. |
| Title | `Valentín Lorente — Product Owner y Technical Product Manager` (60 chars), in `basics.seo.title`. |
| Description | `Product Owner y Technical Product Manager con base de ingeniería: producto de principio a fin, APIs e integraciones y resultados medibles. Madrid o remoto.` (155 chars), in `basics.seo.description`. |
| Sitemap / robots | Astro static endpoints `src/pages/sitemap.xml.ts` and `src/pages/robots.txt.ts`, built from `basics.url`. No `@astrojs/sitemap`: the site has one page. |
| Structured data | JSON-LD `Person` from `cv.json`: name, jobTitle, description, url, image, email, address, sameAs, current employer, alumniOf, knowsLanguage. |
| Favicon | New SVG "VL" in lime on `#0b0b0c`, plus a 180×180 `apple-touch-icon.png`. |

## Preview card layout (1200×630)

Background `#0b0b0c`, padding 72px/80px. Left column (max 640px):
- the name, uppercase, Inter Tight 22px, `#8a8a8a`, letter-spacing 0.14em;
- `basics.headline` in Instrument Serif 84px, `#ededed`;
- the first two parts of `basics.label` ("Technical Product Manager · Product Owner"), Inter Tight 26px;
- a 48×3px lime bar and the host (`www.vlorente.dev`) in lime, 22px.

Right: `me.webp`, 360×450, cover, radius 20px, grayscale. Fonts and photo are embedded as data URIs so the render doesn't depend on file-URL access.

## Head metadata (Layout)

`Layout` takes `{ title, description }`. It renders:
- `title`, the meta description, canonical, author, theme-color, the favicon, apple-touch-icon and sitemap links;
- `og:type=website`, `og:site_name`, `og:locale=es_ES`, `og:url`, `og:title`, `og:description`;
- `og:image` (absolute), `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`;
- `twitter:card=summary_large_image`, `twitter:title`, `twitter:description`, `twitter:image`, `twitter:image:alt`;
- JSON-LD `Person`.

The non-standard `twitter:domain` / `twitter:url` tags are removed.

## Accessibility

- A "Saltar al contenido" skip link, first in `<body>`, visible on focus; `<main id="contenido" tabindex="-1">`.
- `.sr-only` utility in `global.css`.
- Icon SVGs get `aria-hidden="true" focusable="false"` and lose their `<title>`. The links keep their `aria-label`.
- External links' `aria-label` ends with "(se abre en una pestaña nueva)".
- "Descargar CV" links get `type="application/pdf"` and a visually hidden " (PDF)".

Known and accepted: the "Sobre mí" scrub effect starts words at opacity 0.18. Lighthouse can flag that transient state as low contrast.

## Verification

- `pnpm build` passes with 0 errors.
- The built `index.html` contains every meta tag above, with absolute `https://www.vlorente.dev` URLs. `robots.txt` and `sitemap.xml` are emitted.
- `og.jpg` is 1200×630 and under 300 KB; it is inspected visually.
- Lighthouse SEO = 100 and accessibility ≥ 95 on the served build.
- After deploy, the user checks the preview with LinkedIn Post Inspector and opengraph.xyz.

## Out of scope

- i18n / English version, blog, analytics changes.
