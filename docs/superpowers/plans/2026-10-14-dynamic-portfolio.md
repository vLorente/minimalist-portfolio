# Dynamic Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the static minimalist CV site as a dark, editorial, scroll-animated portfolio that positions Valentín Lorente as a Technical Product Manager, with content from the latest CV.

**Architecture:** Astro 4 renders every section from `cv.json` (typed through `src/data/cv.ts`). Components only declare `data-*` motion attributes; a single client module, `src/scripts/motion.ts`, wires GSAP (ScrollTrigger, SplitText) and Lenis to those attributes. The hidden initial state only applies when `html.motion` is set, so content stays visible without JS and with reduced motion.

**Tech Stack:** Astro 4.3 + TypeScript strict, GSAP 3.13+ (ScrollTrigger, SplitText), Lenis, `@fontsource/instrument-serif`, `@fontsource-variable/inter-tight`, pnpm.

Spec: [docs/superpowers/specs/2026-10-14-dynamic-portfolio-design.md](../specs/2026-10-14-dynamic-portfolio-design.md)

## Global Constraints

- Package manager is pnpm. `pnpm-lock.yaml` is gitignored; do not commit it.
- Stay on Astro 4 (`astro@4.3.2`). No framework upgrade.
- All UI text in Spanish.
- No phone number anywhere on the website.
- Colors: background `#0b0b0c`, surface `#131315`, line `#26262a`, text `#ededed`, muted `#8a8a8a`, accent `#c6ff3d`.
- Fonts: display "Instrument Serif", body "Inter Tight Variable", self-hosted via `@fontsource`.
- Animate only `transform`, `opacity`/`autoAlpha`, `clipPath`. Entrance easing `expo.out`, 0.6–1.2 s, stagger 0.05–0.08 s.
- Content must be fully visible without JS and with `prefers-reduced-motion: reduce`.
- No print mode (`.print` / `.no-print`) and no command palette (`hotkeypad`).
- CV download path: `/cv-valentin-lorente.pdf`.
- The only automated check is `pnpm build` (`astro check` + `astro build`). There is no test runner; visual checks use a browser.
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Work on branch `feat/dynamic-portfolio`.

## File Map

| File | Status | Responsibility |
|---|---|---|
| `package.json` | modify | drop `hotkeypad`; add `gsap`, `lenis`, fonts |
| `.gitignore` | modify | ignore `docs/*.docx` (contains the phone number) |
| `src/styles/global.css` | create | design tokens, reset, buttons, motion hidden states |
| `src/layouts/Layout.astro` | modify | fonts, global CSS, `html.motion` boot script, loads motion module |
| `src/scripts/motion.ts` | create | every scroll/entrance animation, keyed by `data-*` attributes |
| `src/components/Section.astro` | modify | section wrapper: id, index number, split heading |
| `src/cv.d.ts` | rewrite | schema of `cv.json` |
| `src/data/cv.ts` | create | typed `cv` export (compile-time schema check) + `CV_PDF` path |
| `src/lib/dates.ts` | create | `year()` and `monthYear()` formatters |
| `cv.json` | rewrite | content from the new CV |
| `src/components/Nav.astro` | create | fixed nav + scroll progress bar |
| `src/components/SocialLinks.astro` | create | email / LinkedIn / GitHub icon links |
| `src/components/sections/Hero.astro` | rewrite | full-screen intro |
| `src/components/sections/Impact.astro` | create | metric counters |
| `src/components/sections/About.astro` | rewrite | scrubbed summary |
| `src/components/sections/Experience.astro` | rewrite | drawing timeline |
| `src/components/sections/Skills.astro` | rewrite | competency groups + stack marquee |
| `src/components/sections/Projects.astro` | rewrite | project cards |
| `src/components/sections/Education.astro` | rewrite | studies, certifications, languages |
| `src/components/sections/Contact.astro` | create | closing CTA + footer |
| `src/pages/index.astro` | modify | section order |
| `src/components/KeyboardManager.astro`, `src/icons/Phone.astro`, `src/icons/X.astro` | delete | unused |
| `public/cv-valentin-lorente.pdf` | create | downloadable CV |
| `CLAUDE.md` | modify | architecture notes |

---

### Task 1: Foundation — dependencies, design tokens, layout, motion engine

**Files:**
- Modify: `package.json`, `.gitignore`, `src/layouts/Layout.astro`, `src/components/Section.astro`, `src/pages/index.astro`
- Create: `src/styles/global.css`, `src/scripts/motion.ts`
- Delete: `src/components/KeyboardManager.astro`

**Interfaces:**
- Produces: CSS custom properties (`--bg`, `--surface`, `--line`, `--text`, `--muted`, `--accent`, `--accent-ink`, `--font-display`, `--font-body`, `--container`, `--gutter`, `--radius`); global classes `.container`, `.eyebrow`, `.btn`, `.btn-primary`; motion attributes `data-reveal` (+ optional `data-delay="<seconds>"`), `data-stagger`, `data-split` (`="load"` plays on page load), `data-scrub-words`, `data-counter` + `data-value="<number>"`, `data-timeline` + child `data-timeline-line`, `data-clip`, `data-progress`; `Section` props `{ id?: string; index?: string; title?: string }`.

- [ ] **Step 1: Install dependencies**

```bash
pnpm install
pnpm remove hotkeypad
pnpm add gsap lenis @fontsource/instrument-serif @fontsource-variable/inter-tight
```

Confirm `node_modules/gsap/package.json` reports version 3.13.0 or later (SplitText `onSplit`/`mask`/`autoSplit` need it):

```bash
node -p "require('./node_modules/gsap/package.json').version"
```

- [ ] **Step 2: Ignore the source CV**

Append to `.gitignore`:

```gitignore

# source CV (contains private contact data)
docs/*.docx
```

- [ ] **Step 3: Remove the command palette**

Delete `src/components/KeyboardManager.astro`. In `src/pages/index.astro`, remove the `import KeyboardManager ...` line and the `<KeyboardManager />` element, and delete the whole `<style>` block (padding now comes from sections).

- [ ] **Step 4: Create `src/styles/global.css`**

```css
:root {
  --bg: #0b0b0c;
  --surface: #131315;
  --line: #26262a;
  --text: #ededed;
  --muted: #8a8a8a;
  --accent: #c6ff3d;
  --accent-ink: #0b0b0c;
  --font-display: "Instrument Serif", Georgia, "Times New Roman", serif;
  --font-body: "Inter Tight Variable", system-ui, -apple-system, "Segoe UI", sans-serif;
  --container: 1100px;
  --gutter: clamp(1.25rem, 4vw, 3rem);
  --radius: 14px;
  color-scheme: dark;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
}

body {
  margin: 0;
  overflow-x: clip;
}

h1,
h2,
h3,
h4,
p,
figure,
ul,
ol {
  margin: 0;
  padding: 0;
}

ul,
ol {
  list-style: none;
}

a {
  color: inherit;
  text-decoration: none;
}

img {
  display: block;
  max-width: 100%;
  height: auto;
}

::selection {
  background: var(--accent);
  color: var(--accent-ink);
}

:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
  border-radius: 4px;
}

.container {
  width: 100%;
  max-width: var(--container);
  margin-inline: auto;
  padding-inline: var(--gutter);
}

.eyebrow {
  color: var(--muted);
  font-size: 0.8rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.85rem 1.4rem;
  border: 1px solid var(--line);
  border-radius: 999px;
  font-size: 0.95rem;
  font-weight: 500;
  transition:
    transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
    background-color 0.3s,
    border-color 0.3s,
    color 0.3s;
}

.btn:hover {
  border-color: var(--text);
  transform: translateY(-2px);
}

.btn-primary {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--accent-ink);
}

.btn-primary:hover {
  background: var(--text);
  border-color: var(--text);
}

/* Hidden only while the motion module is in charge (see Layout.astro). */
html.motion [data-reveal],
html.motion [data-stagger] > *,
html.motion [data-split],
html.motion [data-clip] {
  visibility: hidden;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 5: Create `src/scripts/motion.ts`**

```ts
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { SplitText } from "gsap/SplitText"
import Lenis from "lenis"
import "lenis/dist/lenis.css"

const ENTER = "top 85%"
const NAV_OFFSET = -80

function initSmoothScroll() {
  const lenis = new Lenis({ anchors: { offset: NAV_OFFSET } })
  lenis.on("scroll", ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
}

function initClips() {
  gsap.utils.toArray<HTMLElement>("[data-clip]").forEach((el) => {
    gsap.fromTo(
      el,
      { autoAlpha: 1, clipPath: "inset(100% 0% 0% 0%)" },
      { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "expo.out", delay: 0.3 }
    )
  })
}

function initReveals() {
  gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 40 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 1,
        ease: "expo.out",
        delay: Number(el.dataset.delay ?? 0),
        scrollTrigger: { trigger: el, start: ENTER, once: true },
      }
    )
  })

  gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((el) => {
    gsap.fromTo(
      el.children,
      { autoAlpha: 0, y: 30 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.07,
        scrollTrigger: { trigger: el, start: ENTER, once: true },
      }
    )
  })
}

function initSplitHeadings() {
  gsap.utils.toArray<HTMLElement>("[data-split]").forEach((el) => {
    const playOnLoad = el.dataset.split === "load"

    SplitText.create(el, {
      type: "lines, words",
      mask: "lines",
      autoSplit: true,
      onSplit(self) {
        gsap.set(el, { autoAlpha: 1 })
        return gsap.from(self.words, {
          yPercent: 110,
          duration: 1.1,
          ease: "expo.out",
          stagger: 0.06,
          delay: playOnLoad ? 0.15 : 0,
          scrollTrigger: playOnLoad ? undefined : { trigger: el, start: ENTER, once: true },
        })
      },
    })
  })
}

function initScrubWords() {
  gsap.utils.toArray<HTMLElement>("[data-scrub-words]").forEach((el) => {
    SplitText.create(el, {
      type: "words",
      onSplit(self) {
        return gsap.fromTo(
          self.words,
          { opacity: 0.18 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.1,
            scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 50%", scrub: true },
          }
        )
      },
    })
  })
}

function initCounters() {
  gsap.utils.toArray<HTMLElement>("[data-counter]").forEach((el) => {
    const target = Number(el.dataset.value)
    const state = { value: 0 }
    el.textContent = "0"
    gsap.to(state, {
      value: target,
      duration: 1.6,
      ease: "power2.out",
      scrollTrigger: { trigger: el, start: ENTER, once: true },
      onUpdate: () => {
        el.textContent = String(Math.round(state.value))
      },
    })
  })
}

function initTimelines() {
  gsap.utils.toArray<HTMLElement>("[data-timeline]").forEach((el) => {
    const line = el.querySelector<HTMLElement>("[data-timeline-line]")
    if (!line) return
    gsap.fromTo(
      line,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top 70%", end: "bottom 70%", scrub: true },
      }
    )
  })
}

function initProgress() {
  const bar = document.querySelector<HTMLElement>("[data-progress]")
  if (!bar) return
  gsap.fromTo(
    bar,
    { scaleX: 0 },
    { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } }
  )
}

const root = document.documentElement

if (root.classList.contains("motion")) {
  gsap.registerPlugin(ScrollTrigger, SplitText)
  initSmoothScroll()
  initClips()
  initReveals()
  initSplitHeadings()
  initScrubWords()
  initCounters()
  initTimelines()
  initProgress()
  root.classList.add("motion-ready")
}
```

- [ ] **Step 6: Rewrite `src/layouts/Layout.astro`**

Keep `import { basics } from "@cv"` for now (Task 2 switches it). Replace the file with:

```astro
---
import "@fontsource/instrument-serif/400.css"
import "@fontsource/instrument-serif/400-italic.css"
import "@fontsource-variable/inter-tight"
import "@/styles/global.css"

import { basics } from "@cv"

interface Props {
  title: string
}

const { title } = Astro.props

const { image, summary, url } = basics
---

<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>{title}</title>
    <meta name="description" content={summary} />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#0b0b0c" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="preload" as="image" href={image} />

    <meta property="og:url" content={url} />
    <meta property="og:type" content="website" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={summary} />

    <meta name="twitter:card" content="summary_large_image" />
    <meta property="twitter:domain" content={url.split("//")[1] ?? ""} />
    <meta property="twitter:url" content={url} />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={summary} />

    <script is:inline>
      ;(() => {
        const root = document.documentElement
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
        root.classList.add("motion")
        // Safety net: if the motion module never boots, show the content anyway.
        setTimeout(() => {
          if (!root.classList.contains("motion-ready")) root.classList.remove("motion")
        }, 3000)
      })()
    </script>
  </head>
  <body>
    <slot />
    <script>
      import "@/scripts/motion"
    </script>
  </body>
</html>
```

- [ ] **Step 7: Rewrite `src/components/Section.astro`**

```astro
---
interface Props {
  id?: string
  index?: string
  title?: string
}

const { id, index, title } = Astro.props
---

<section id={id}>
  <div class="container">
    {
      title && (
        <header>
          {index && <span class="eyebrow">{index}</span>}
          <h2 data-split>{title}</h2>
        </header>
      )
    }
    <slot />
  </div>
</section>

<style>
  section {
    padding-block: clamp(5rem, 12vw, 9rem);
  }

  header {
    display: flex;
    align-items: baseline;
    gap: 1rem;
    margin-bottom: clamp(2.5rem, 6vw, 4rem);
    padding-top: 1.25rem;
    border-top: 1px solid var(--line);
  }

  h2 {
    font-family: var(--font-display);
    font-size: clamp(2.75rem, 7vw, 5.5rem);
    font-weight: 400;
    letter-spacing: -0.02em;
    line-height: 1;
  }
</style>
```

- [ ] **Step 8: Verify build**

Run: `pnpm build`
Expected: `astro check` reports 0 errors, build completes. (Old sections still render with their light-theme styles; that is expected until they are rewritten.)

- [ ] **Step 9: Verify motion boots**

Run `pnpm dev`, open http://localhost:4321. Expected: dark background, section headings slide up word by word on scroll, smooth (Lenis) scrolling, no console errors, `<html>` has classes `motion motion-ready`.

- [ ] **Step 10: Commit**

```bash
git add package.json .gitignore src/styles/global.css src/scripts/motion.ts src/layouts/Layout.astro src/components/Section.astro src/pages/index.astro src/components/KeyboardManager.astro
git commit -m "feat: add dark design tokens and GSAP/Lenis motion engine

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Content model, nav and hero

**Files:**
- Rewrite: `src/cv.d.ts`, `cv.json`, `src/components/sections/Hero.astro`
- Create: `src/data/cv.ts`, `src/lib/dates.ts`, `src/components/Nav.astro`, `src/components/SocialLinks.astro`
- Modify: `src/layouts/Layout.astro` (import source), `src/pages/index.astro` (add `<Nav />`)

**Interfaces:**
- Consumes: Task 1 tokens, `.btn`, motion attributes.
- Produces: `import { cv, CV_PDF } from "@/data/cv"` where `cv: CV` and `CV_PDF = "/cv-valentin-lorente.pdf"`; types `CV`, `Basics`, `Metric`, `Work`, `WorkGroup`, `Education`, `Certificate`, `SkillGroup`, `Language`, `Project` from `@/cv`; `year(date: string | null): number | "Actualidad"` and `monthYear(date: string): string` from `@/lib/dates`; `<SocialLinks />` component (no props); section ids `inicio`, `impacto`, `sobre-mi`, `experiencia`, `competencias`, `proyectos`, `formacion`, `contacto`.

- [ ] **Step 1: Rewrite `src/cv.d.ts`**

```ts
export interface CV {
  basics: Basics
  work: Array<Work>
  education: Array<Education>
  certificates: Array<Certificate>
  skills: Array<SkillGroup>
  languages: Array<Language>
  projects: Array<Project>
}

export interface Basics {
  name: string
  label: string
  headline: string
  image: string
  email: string
  url: string
  summary: string
  location: Location
  profiles: Array<Profile>
  metrics: Array<Metric>
  stack: Array<string>
}

export interface Location {
  city: string
  region: string
  countryCode: string
}

export interface Profile {
  network: string
  username: string
  url: string
}

export interface Metric {
  value: number
  prefix?: string
  suffix?: string
  label: string
  detail: string
}

export interface Work {
  name: string
  position: string
  location: string
  url: string
  startDate: string
  endDate: string | null
  summary: string
  highlights: Array<string>
  groups?: Array<WorkGroup>
}

export interface WorkGroup {
  title: string
  highlights: Array<string>
}

export interface Education {
  institution: string
  url: string
  area: string
  studyType: string
  startDate: string
  endDate: string
  summary?: string
}

export interface Certificate {
  name: string
  issuer: string
  date: string
}

export interface SkillGroup {
  name: string
  keywords: Array<string>
}

export interface Language {
  language: string
  fluency: string
}

export interface Project {
  name: string
  isActive: boolean
  description: string
  highlights: Array<string>
  url: string
  github?: string
}
```

- [ ] **Step 2: Create `src/data/cv.ts` (the schema check)**

```ts
import data from "@cv"
import type { CV } from "@/cv"

// Typing the export as CV makes `astro check` fail whenever cv.json drifts from the schema.
export const cv: CV = data

export const CV_PDF = "/cv-valentin-lorente.pdf"
```

- [ ] **Step 3: Run the check and watch it fail**

Run: `pnpm astro check`
Expected: FAIL in `src/data/cv.ts` — the old `cv.json` is missing `headline`, `metrics`, `stack` and `work[].location`.

- [ ] **Step 4: Rewrite `cv.json`**

```json
{
  "basics": {
    "name": "Valentín Lorente Jiménez",
    "label": "Technical Product Manager · Product Owner · Producto API",
    "headline": "Convierto problemas de negocio en producto.",
    "image": "/me.webp",
    "email": "vlorentejimenez@gmail.com",
    "url": "https://vlorente.dev",
    "summary": "Product Owner / Product Manager desde 2018, con base de ingeniería de software. He definido producto desde cero: un ERP estandarizado para PYMEs y su API, consumida por aplicaciones web, móviles y otros sistemas, con contrato en OpenAPI/Swagger y versionado para mantener la retrocompatibilidad. Gestiono roadmap y backlog, escribo historias de usuario con criterios de aceptación y tomo decisiones basadas en datos (KPIs, tests A/B). En StopCardio he lanzado dos líneas de negocio nuevas y he liderado la migración del CTI del contact center, alineando a stakeholders de negocio, proveedores y equipo técnico.",
    "location": {
      "city": "Madrid",
      "region": "España",
      "countryCode": "ES"
    },
    "profiles": [
      {
        "network": "LinkedIn",
        "username": "vlorente",
        "url": "https://www.linkedin.com/in/vlorente"
      },
      {
        "network": "GitHub",
        "username": "vLorente",
        "url": "https://github.com/vLorente"
      }
    ],
    "metrics": [
      {
        "value": 75,
        "prefix": "−",
        "suffix": "%",
        "label": "tiempo de implantación por cliente",
        "detail": "De unas 4 semanas a 1, automatizando el despliegue del ERP."
      },
      {
        "value": 1,
        "prefix": "<",
        "suffix": " min",
        "label": "para contactar un lead nuevo",
        "detail": "Antes hasta 24 horas, tras migrar el CTI de más de 50 agentes."
      },
      {
        "value": 40,
        "prefix": "−",
        "suffix": "%",
        "label": "coste del sistema de contact center",
        "detail": "Nuevo CTI elegido, integrado con el CRM y sin parar la operación."
      },
      {
        "value": 40,
        "prefix": "−",
        "suffix": "%",
        "label": "coste por lead (CPL)",
        "detail": "Entre un 20 % y un 40 % con landings segmentadas, tests A/B y mapas de calor."
      },
      {
        "value": 2,
        "label": "líneas de negocio lanzadas",
        "detail": "De la idea a la primera venta en menos de 1 mes cada una."
      }
    ],
    "stack": [
      "Python",
      "FastAPI",
      "TypeScript",
      "Angular",
      "Ionic",
      "Astro",
      "React",
      "PostgreSQL",
      "OpenAPI / Swagger",
      "CI/CD",
      "GitHub Actions",
      "SAP ABAP",
      "Jira",
      "Notion"
    ]
  },
  "work": [
    {
      "name": "StopCardio",
      "position": "Growth Engineer / Technical Product Strategist",
      "location": "España",
      "url": "",
      "startDate": "2025-01-01",
      "endDate": null,
      "summary": "Rol de Product Owner / Product Manager: roadmap, KPIs, presupuesto publicitario y proveedores. Coordino a 4–6 personas de desarrollo, BI, ventas y contact center.",
      "highlights": [],
      "groups": [
        {
          "title": "Nuevas líneas de negocio",
          "highlights": [
            "Lideré el lanzamiento de 2 líneas de venta a nuevos targets, centros educativos y administración pública: de la idea a la primera venta en menos de 1 mes cada una.",
            "Hice el estudio de mercado: análisis normativo de la obligatoriedad de cardioprotección por comunidad autónoma, censo de más de 10.000 entidades desde fuentes oficiales y penetración actual del mercado.",
            "Segmenté la base, diseñé el flujo de venta completo (teleconcertación → visita comercial) y monté los sistemas que lo soportan: pipeline en el CRM, automatizaciones y dashboards de KPIs."
          ]
        },
        {
          "title": "Contact center",
          "highlights": [
            "Evalué proveedores, elegí el nuevo CTI y lideré su migración e implantación para más de 50 agentes en 3–4 meses, con integración con el CRM y formación del equipo, sin parar la operación.",
            "El tiempo de contacto de un lead nuevo pasó de hasta 24 horas a menos de 1 minuto, y el coste del sistema bajó más de un 40 %."
          ]
        },
        {
          "title": "Producto y captación",
          "highlights": [
            "Reduje el coste por lead (CPL) entre un 20 % y un 40 % con landings segmentadas por campaña y público, iteradas con tests A/B y mapas de calor.",
            "Diseñé un ecosistema web propio para crear landing pages dinámicas: lanzar una campaña con landing pasó de 1–2 semanas a horas."
          ]
        }
      ]
    },
    {
      "name": "HealthPoint Europe",
      "position": "Full Stack & Product Engineer",
      "location": "Murcia",
      "url": "",
      "startDate": "2018-01-01",
      "endDate": "2024-12-31",
      "summary": "Product Owner / Product Manager y jefe de proyecto con clientes. Lideré un equipo de 3 personas.",
      "highlights": [
        "Definí desde cero un ERP estandarizado para PYMEs, con discovery directo con clientes y usuarios, para pasar de desarrollo a medida a un modelo de producto.",
        "Fui responsable de la API del ERP como producto: contrato documentado en OpenAPI/Swagger, versionado con retrocompatibilidad y cambios acordados con las aplicaciones web, móviles (Angular/Ionic) y sistemas que la consumían.",
        "Llevaba el backlog en Jira y escribía las historias de usuario con criterios de aceptación para el equipo de desarrollo, con metodología Agile/Scrum.",
        "Automaticé el despliegue: el tiempo de implantación por cliente bajó un 75 %, de unas 4 semanas a 1.",
        "Dirigí proyectos de ERP a medida para grandes cuentas de industria y logística: relación con el cliente, arranque del proyecto y traducción de requisitos a arquitectura."
      ]
    },
    {
      "name": "NTT Data",
      "position": "Consultor SAP & Backend Developer",
      "location": "Murcia",
      "url": "",
      "startDate": "2016-01-01",
      "endDate": "2018-01-01",
      "summary": "Consultoría SAP para grandes cuentas.",
      "highlights": [
        "Análisis de requisitos y personalizaciones SAP (ABAP; módulos SD, MM y PP) para grandes cuentas.",
        "Desarrollo de informes y reporting para cliente."
      ]
    }
  ],
  "education": [
    {
      "institution": "UCAM · Universidad Católica San Antonio de Murcia",
      "url": "https://www.ucam.edu",
      "area": "Grado en Ingeniería Informática",
      "studyType": "Grado",
      "startDate": "2015-01-01",
      "endDate": "2019-01-01",
      "summary": "Matrícula de Honor en Programación Orientada a Objetos, en Aplicaciones Móviles y en Auditoría y Peritaje de Proyectos Informáticos."
    },
    {
      "institution": "CES Vega Media",
      "url": "https://ces-vegamedia.es/",
      "area": "CFGS Administración de Sistemas Informáticos en Red",
      "studyType": "CFGS",
      "startDate": "2013-01-01",
      "endDate": "2015-01-01"
    }
  ],
  "certificates": [
    {
      "name": "GitHub Copilot",
      "issuer": "Microsoft",
      "date": "2025-08-01"
    },
    {
      "name": "Python for Data Science",
      "issuer": "IBM",
      "date": "2024-02-01"
    }
  ],
  "skills": [
    {
      "name": "Gestión de producto",
      "keywords": ["Roadmap", "Gestión del backlog", "Priorización", "Discovery", "Historias de usuario", "Criterios de aceptación", "KPIs", "Tests A/B", "Gestión de stakeholders"]
    },
    {
      "name": "Negocio y operaciones",
      "keywords": ["Go-to-market", "Estudio de mercado", "Segmentación", "Diseño de flujo de venta", "Selección de proveedores", "CTI / contact center"]
    },
    {
      "name": "Metodologías y herramientas",
      "keywords": ["Agile / Scrum", "Jira", "Confluence", "Notion", "Trello", "Asana", "Monday"]
    },
    {
      "name": "APIs y desarrollo",
      "keywords": ["OpenAPI / Swagger", "Versionado de APIs", "Python", "FastAPI", "TypeScript", "SQL", "PostgreSQL", "Angular", "Ionic", "CI/CD"]
    },
    {
      "name": "ERP",
      "keywords": ["SAP", "ABAP", "SD / MM / PP", "Tryton"]
    }
  ],
  "languages": [
    { "language": "Español", "fluency": "Nativo" },
    { "language": "Inglés", "fluency": "B2 (MCER)" }
  ],
  "projects": []
}
```

Then paste the existing `projects` array from the previous `cv.json` (`git show HEAD:cv.json`) unchanged in place of `[]` — all 7 entries: Thirtys Album, Página Web Boda, vLorente Blog, La Fede Teams Analytics, Django TicTacToe, React Cookie Guard, SeriTracker.

- [ ] **Step 5: Create `src/lib/dates.ts`**

```ts
export function year(date: string | null): number | "Actualidad" {
  return date ? new Date(date).getFullYear() : "Actualidad"
}

const MONTH_YEAR = new Intl.DateTimeFormat("es-ES", { month: "2-digit", year: "numeric" })

export function monthYear(date: string): string {
  return MONTH_YEAR.format(new Date(date))
}
```

- [ ] **Step 6: Point Layout at the typed data**

In `src/layouts/Layout.astro` replace `import { basics } from "@cv"` with:

```ts
import { cv } from "@/data/cv"
```

and `const { image, summary, url } = basics` with `const { image, summary, url } = cv.basics`.

- [ ] **Step 7: Create `src/components/SocialLinks.astro`**

```astro
---
import { cv } from "@/data/cv"
import GitHub from "@/icons/GitHub.astro"
import LinkedIn from "@/icons/LinkedIn.astro"
import Mail from "@/icons/Mail.astro"
import type { SocialIcon } from "@/types"

const { name, email, profiles } = cv.basics

const SOCIAL_ICONS: SocialIcon = {
  GitHub,
  LinkedIn,
}
---

<ul class="social">
  <li>
    <a href={`mailto:${email}`} aria-label={`Enviar un correo a ${name}`}>
      <Mail />
    </a>
  </li>
  {
    profiles.map(({ network, url }) => {
      const Icon = SOCIAL_ICONS[network]
      return (
        Icon && (
          <li>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Perfil de ${name} en ${network}`}
            >
              <Icon />
            </a>
          </li>
        )
      )
    })
  }
</ul>

<style>
  .social {
    display: flex;
    gap: 0.5rem;
  }

  a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border: 1px solid var(--line);
    border-radius: 999px;
    color: var(--muted);
    transition:
      color 0.3s,
      border-color 0.3s;
  }

  a:hover {
    border-color: var(--accent);
    color: var(--accent);
  }
</style>
```

- [ ] **Step 8: Create `src/components/Nav.astro`**

```astro
---
import { cv, CV_PDF } from "@/data/cv"

const initials = cv.basics.name
  .split(" ")
  .slice(0, 2)
  .map((word) => word[0])
  .join("")

const LINKS = [
  { href: "#experiencia", label: "Experiencia" },
  { href: "#proyectos", label: "Proyectos" },
  { href: "#contacto", label: "Contacto" },
]
---

<header class="nav">
  <div class="container inner">
    <a href="#inicio" class="logo" aria-label="Ir al inicio">{initials}</a>
    <nav aria-label="Secciones">
      <ul>
        {LINKS.map(({ href, label }) => <li><a href={href}>{label}</a></li>)}
      </ul>
    </nav>
    <a class="btn btn-primary cv" href={CV_PDF} download>Descargar CV</a>
  </div>
  <span class="progress" data-progress aria-hidden="true"></span>
</header>

<style>
  .nav {
    position: fixed;
    inset: 0 0 auto;
    z-index: 50;
    background: rgb(11 11 12 / 0.6);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--line);
  }

  .inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    height: 64px;
  }

  .logo {
    font-family: var(--font-display);
    font-size: 1.6rem;
  }

  ul {
    display: flex;
    gap: 2rem;
  }

  nav a {
    color: var(--muted);
    font-size: 0.9rem;
    transition: color 0.3s;
  }

  nav a:hover {
    color: var(--text);
  }

  .cv {
    padding: 0.55rem 1rem;
    font-size: 0.85rem;
  }

  .progress {
    display: none;
    position: absolute;
    inset: auto 0 -1px;
    height: 2px;
    background: var(--accent);
    transform-origin: left;
  }

  :global(html.motion) .progress {
    display: block;
  }

  @media (width <= 700px) {
    nav {
      display: none;
    }
  }
</style>
```

- [ ] **Step 9: Rewrite `src/components/sections/Hero.astro`**

```astro
---
import { cv, CV_PDF } from "@/data/cv"
import SocialLinks from "@/components/SocialLinks.astro"
import WorldMap from "@/icons/WorldMap.astro"

const { name, label, headline, image, location } = cv.basics
---

<section class="hero" id="inicio">
  <div class="container grid">
    <div class="intro">
      <p class="eyebrow" data-reveal>{name}</p>
      <h1 data-split="load">{headline}</h1>
      <p class="label" data-reveal data-delay="0.4">{label}</p>
      <p class="location" data-reveal data-delay="0.5">
        <WorldMap />
        {location.city}, {location.region}
      </p>
      <div class="actions" data-reveal data-delay="0.6">
        <a class="btn btn-primary" href={CV_PDF} download>Descargar CV</a>
        <a class="btn" href="#contacto">Contactar</a>
        <SocialLinks />
      </div>
    </div>
    <figure data-clip>
      <img src={image} alt={`Retrato de ${name}`} width="320" height="400" />
    </figure>
  </div>
  <a class="scroll-hint" href="#impacto" aria-label="Ir a la sección de impacto"><span></span></a>
</section>

<style>
  .hero {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 100svh;
    padding-block: 7rem 4rem;
  }

  .grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: end;
    gap: clamp(2rem, 5vw, 4rem);
  }

  .intro {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  h1 {
    font-family: var(--font-display);
    font-size: clamp(3rem, 9vw, 7.5rem);
    font-weight: 400;
    letter-spacing: -0.03em;
    line-height: 0.95;
    text-wrap: balance;
  }

  .label {
    font-size: clamp(1rem, 1.6vw, 1.2rem);
  }

  .location {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    color: var(--muted);
    font-size: 0.9rem;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem;
    margin-top: 0.75rem;
  }

  figure {
    width: clamp(180px, 24vw, 320px);
    aspect-ratio: 4 / 5;
    border-radius: var(--radius);
    overflow: hidden;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: grayscale(1) contrast(1.05);
    transition: filter 0.6s;
  }

  figure:hover img {
    filter: none;
  }

  .scroll-hint {
    position: absolute;
    left: 50%;
    bottom: 2rem;
    translate: -50% 0;
    display: flex;
    justify-content: center;
    width: 24px;
    height: 40px;
    padding-top: 8px;
    border: 1px solid var(--line);
    border-radius: 999px;
  }

  .scroll-hint span {
    width: 3px;
    height: 8px;
    border-radius: 2px;
    background: var(--accent);
    animation: scroll-hint 1.8s cubic-bezier(0.16, 1, 0.3, 1) infinite;
  }

  @keyframes scroll-hint {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(14px);
    }
  }

  @media (width <= 700px) {
    .grid {
      grid-template-columns: 1fr;
    }

    figure {
      order: -1;
      width: 140px;
    }

    .scroll-hint {
      display: none;
    }
  }
</style>
```

- [ ] **Step 10: Add the nav to the page**

In `src/pages/index.astro` add `import Nav from "@/components/Nav.astro"` and render `<Nav />` right before `<main>`. Change the page data import to `import { cv } from "@/data/cv"` with `const { name, label } = cv.basics`, and the title to `` title={`${name} — ${label}`} ``.

- [ ] **Step 11: Run the check and watch it pass**

Run: `pnpm build`
Expected: 0 errors. The old About/Experience/Education/Projects/Skills components still import from `@cv` and only use fields that still exist, so they compile.

- [ ] **Step 12: Visual check**

`pnpm dev` → http://localhost:4321. Expected: fixed nav with "VL", headline words slide up on load, photo reveals from bottom with a clip, CTA row fades in, progress bar fills while scrolling, "Contactar" anchor scrolls smoothly.

- [ ] **Step 13: Commit**

```bash
git add src/cv.d.ts src/data/cv.ts src/lib/dates.ts cv.json src/layouts/Layout.astro src/components/Nav.astro src/components/SocialLinks.astro src/components/sections/Hero.astro src/pages/index.astro
git commit -m "feat: update CV content and add nav and animated hero

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Impact, About and Experience sections

**Files:**
- Create: `src/components/sections/Impact.astro`
- Rewrite: `src/components/sections/About.astro`, `src/components/sections/Experience.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `cv`, `year()`, `Section` props, attributes `data-stagger`, `data-counter`/`data-value`, `data-scrub-words`, `data-timeline`/`data-timeline-line`, `data-reveal`.

- [ ] **Step 1: Create `src/components/sections/Impact.astro`**

```astro
---
import Section from "@/components/Section.astro"
import { cv } from "@/data/cv"

const { metrics } = cv.basics
---

<Section id="impacto" index="01" title="Impacto">
  <ul class="metrics" data-stagger>
    {
      metrics.map(({ value, prefix, suffix, label, detail }) => (
        <li>
          {/* Kept on one line so Astro does not insert spaces around the number. */}
          <p class="value">{prefix}<span data-counter data-value={value}>{value}</span>{suffix}</p>
          <p class="label">{label}</p>
          <p class="detail">{detail}</p>
        </li>
      ))
    }
  </ul>
</Section>

<style>
  .metrics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
    gap: 3rem 2rem;
  }

  li {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--line);
  }

  .value {
    color: var(--accent);
    font-family: var(--font-display);
    font-size: clamp(3.5rem, 8vw, 6rem);
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }

  .label {
    font-size: 1.05rem;
    font-weight: 500;
  }

  .detail {
    color: var(--muted);
    font-size: 0.92rem;
    line-height: 1.5;
  }
</style>
```

- [ ] **Step 2: Rewrite `src/components/sections/About.astro`**

```astro
---
import Section from "@/components/Section.astro"
import { cv } from "@/data/cv"

const { summary } = cv.basics
---

<Section id="sobre-mi" index="02" title="Sobre mí">
  <p class="summary" data-scrub-words>{summary}</p>
</Section>

<style>
  .summary {
    font-family: var(--font-display);
    font-size: clamp(1.5rem, 3vw, 2.5rem);
    letter-spacing: -0.01em;
    line-height: 1.2;
  }
</style>
```

- [ ] **Step 3: Rewrite `src/components/sections/Experience.astro`**

```astro
---
import Section from "@/components/Section.astro"
import { cv } from "@/data/cv"
import { year } from "@/lib/dates"

const { work } = cv
---

<Section id="experiencia" index="03" title="Experiencia">
  <div class="timeline" data-timeline>
    <span class="line" data-timeline-line aria-hidden="true"></span>
    <ol>
      {
        work.map(({ name, position, location, startDate, endDate, summary, highlights, groups }) => (
          <li class="job" data-reveal>
            <header>
              <p class="dates">
                {year(startDate)} — {year(endDate)}
              </p>
              <h3>{name}</h3>
              <p class="position">
                {position} · {location}
              </p>
            </header>
            <div class="body">
              {summary && <p class="summary">{summary}</p>}
              {highlights.length > 0 && (
                <ul class="highlights">
                  {highlights.map((item) => (
                    <li>{item}</li>
                  ))}
                </ul>
              )}
              {groups?.map(({ title, highlights }) => (
                <div>
                  <h4>{title}</h4>
                  <ul class="highlights">
                    {highlights.map((item) => (
                      <li>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </li>
        ))
      }
    </ol>
  </div>
</Section>

<style>
  .timeline {
    --indent: clamp(1.5rem, 4vw, 3rem);
    position: relative;
    padding-left: var(--indent);
  }

  .timeline::before,
  .line {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 1px;
  }

  .timeline::before {
    background: var(--line);
  }

  .line {
    background: var(--accent);
    transform-origin: top;
  }

  ol {
    display: flex;
    flex-direction: column;
    gap: clamp(3.5rem, 8vw, 6rem);
  }

  .job {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.6fr);
    gap: 1.5rem 3rem;
  }

  .job::before {
    content: "";
    position: absolute;
    top: 0.6rem;
    left: calc(-1 * var(--indent) - 5px);
    width: 11px;
    height: 11px;
    border: 2px solid var(--accent);
    border-radius: 50%;
    background: var(--bg);
  }

  .dates {
    color: var(--accent);
    font-size: 0.85rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  h3 {
    margin-top: 0.5rem;
    font-family: var(--font-display);
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 400;
    line-height: 1.05;
  }

  .position {
    margin-top: 0.5rem;
    color: var(--muted);
  }

  .body {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .summary {
    font-size: 1.05rem;
    line-height: 1.6;
  }

  h4 {
    margin-bottom: 0.75rem;
    color: var(--muted);
    font-size: 0.8rem;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .highlights {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .highlights li {
    position: relative;
    padding-left: 1.25rem;
    color: #c9c9c9;
    font-size: 0.98rem;
    line-height: 1.6;
  }

  .highlights li::before {
    content: "";
    position: absolute;
    top: 0.8em;
    left: 0;
    width: 0.5rem;
    height: 1px;
    background: var(--accent);
  }

  @media (width <= 800px) {
    .job {
      grid-template-columns: 1fr;
    }
  }
</style>
```

- [ ] **Step 4: Wire into the page**

In `src/pages/index.astro` import `Impact` from `@/components/sections/Impact.astro` and order `<main>` as: `<Hero />`, `<Impact />`, `<About />`, `<Experience />`, `<Education />`, `<Projects />`, `<Skills />` (final order is fixed in Task 4).

- [ ] **Step 5: Verify**

Run: `pnpm build` → 0 errors.
`pnpm dev`: counters count up once when the Impact block enters; Sobre mí words brighten as you scroll; the timeline accent line grows with scroll and each job slides in; StopCardio shows three grouped lists with headings.

- [ ] **Step 6: Commit**

```bash
git add src/components/sections/Impact.astro src/components/sections/About.astro src/components/sections/Experience.astro src/pages/index.astro
git commit -m "feat: add impact counters, scrubbed summary and experience timeline

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Skills, Projects, Education and Contact sections

**Files:**
- Rewrite: `src/components/sections/Skills.astro`, `src/components/sections/Projects.astro`, `src/components/sections/Education.astro`
- Create: `src/components/sections/Contact.astro`
- Modify: `src/pages/index.astro`
- Delete: `src/icons/Phone.astro`, `src/icons/X.astro`

**Interfaces:**
- Consumes: `cv`, `year()`, `monthYear()`, `Section`, `SocialLinks`, `data-reveal`, `data-stagger`, `data-split`.

- [ ] **Step 1: Rewrite `src/components/sections/Skills.astro`**

```astro
---
import Section from "@/components/Section.astro"
import { cv } from "@/data/cv"

const { skills } = cv
const { stack } = cv.basics
---

<Section id="competencias" index="04" title="Competencias">
  <div class="groups">
    {
      skills.map(({ name, keywords }) => (
        <div>
          <h3 data-reveal>{name}</h3>
          <ul class="chips" data-stagger>
            {keywords.map((keyword) => (
              <li>{keyword}</li>
            ))}
          </ul>
        </div>
      ))
    }
  </div>
</Section>

<div class="marquee" role="region" aria-label="Stack técnico">
  <div class="track">
    {
      [...stack, ...stack].map((item, i) => (
        <span aria-hidden={i >= stack.length ? "true" : undefined}>{item}</span>
      ))
    }
  </div>
</div>

<style>
  .groups {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 420px), 1fr));
    gap: 3rem 4rem;
  }

  h3 {
    margin-bottom: 1rem;
    font-size: 1.1rem;
    font-weight: 500;
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .chips li {
    padding: 0.45rem 0.9rem;
    border: 1px solid var(--line);
    border-radius: 999px;
    color: #cfcfcf;
    font-size: 0.88rem;
    transition:
      border-color 0.3s,
      color 0.3s;
  }

  .chips li:hover {
    border-color: var(--accent);
    color: var(--text);
  }

  .marquee {
    overflow: hidden;
    padding-block: 1.5rem;
    border-block: 1px solid var(--line);
    mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent);
  }

  .track {
    display: flex;
    width: max-content;
    animation: marquee 40s linear infinite;
  }

  .marquee:hover .track {
    animation-play-state: paused;
  }

  .track span {
    padding-inline: 1.5rem;
    color: var(--muted);
    font-family: var(--font-display);
    font-size: clamp(2rem, 5vw, 3.5rem);
    white-space: nowrap;
  }

  .track span::after {
    content: "✦";
    margin-left: 3rem;
    color: var(--accent);
    font-size: 0.5em;
    vertical-align: middle;
  }

  @keyframes marquee {
    to {
      transform: translateX(-50%);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .track {
      flex-wrap: wrap;
      width: auto;
      animation: none;
    }
  }
</style>
```

- [ ] **Step 2: Rewrite `src/components/sections/Projects.astro`**

```astro
---
import Section from "@/components/Section.astro"
import GitHub from "@/icons/GitHub.astro"
import { cv } from "@/data/cv"

const { projects } = cv
---

<Section id="proyectos" index="05" title="Proyectos">
  <p class="intro" data-reveal>
    Proyectos personales donde sigo construyendo con mis propias manos: producto de principio a fin,
    del diseño al despliegue.
  </p>
  <ul class="grid" data-stagger>
    {
      projects.map(({ name, description, highlights, url, github, isActive }) => (
        <li>
          <article class="card">
            <header>
              <h3>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  {name}
                  <span aria-hidden="true">↗</span>
                </a>
              </h3>
              {isActive && <span class="badge">Activo</span>}
            </header>
            <p class="desc">{description}</p>
            <ul class="tags">
              {highlights.slice(0, 5).map((tag) => (
                <li>{tag}</li>
              ))}
            </ul>
            {github && (
              <a class="code" href={github} target="_blank" rel="noopener noreferrer">
                <GitHub /> Código
              </a>
            )}
          </article>
        </li>
      ))
    }
  </ul>
</Section>

<style>
  .intro {
    max-width: 60ch;
    margin-bottom: 2.5rem;
    color: var(--muted);
    line-height: 1.6;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
    gap: 1.25rem;
  }

  .card {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    height: 100%;
    padding: 1.75rem;
    border: 1px solid var(--line);
    border-radius: var(--radius);
    background: var(--surface);
    transition:
      transform 0.5s cubic-bezier(0.16, 1, 0.3, 1),
      border-color 0.3s;
  }

  .card:hover {
    border-color: var(--accent);
    transform: translateY(-6px);
  }

  .card header {
    display: flex;
    align-items: start;
    justify-content: space-between;
    gap: 1rem;
  }

  h3 {
    font-family: var(--font-display);
    font-size: 1.9rem;
    font-weight: 400;
    line-height: 1.05;
  }

  /* Stretched link: the whole card is clickable. */
  h3 a::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
  }

  h3 a span {
    display: inline-block;
    margin-left: 0.35rem;
    color: var(--accent);
    font-size: 0.6em;
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .card:hover h3 a span {
    transform: translate(3px, -3px);
  }

  .badge {
    padding: 0.25rem 0.6rem;
    border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
    border-radius: 999px;
    color: var(--accent);
    font-size: 0.72rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .desc {
    flex: 1;
    color: var(--muted);
    font-size: 0.95rem;
    line-height: 1.6;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .tags li {
    padding: 0.25rem 0.6rem;
    border-radius: 999px;
    background: #1d1d20;
    color: #bdbdbd;
    font-size: 0.75rem;
  }

  .code {
    position: relative;
    z-index: 1;
    display: inline-flex;
    align-self: flex-start;
    align-items: center;
    gap: 0.4rem;
    color: var(--muted);
    font-size: 0.85rem;
  }

  .code:hover {
    color: var(--text);
  }
</style>
```

- [ ] **Step 3: Rewrite `src/components/sections/Education.astro`**

```astro
---
import Section from "@/components/Section.astro"
import { cv } from "@/data/cv"
import { monthYear, year } from "@/lib/dates"

const { education, certificates, languages } = cv
---

<Section id="formacion" index="06" title="Formación">
  <div class="cols">
    <div data-reveal>
      <h3>Estudios</h3>
      <ul class="list">
        {
          education.map(({ institution, area, startDate, endDate, summary }) => (
            <li>
              <p class="dates">
                {year(startDate)} — {year(endDate)}
              </p>
              <p class="title">{area}</p>
              <p class="meta">{institution}</p>
              {summary && <p class="note">{summary}</p>}
            </li>
          ))
        }
      </ul>
    </div>
    <div data-reveal data-delay="0.1">
      <h3>Certificaciones</h3>
      <ul class="list">
        {
          certificates.map(({ name, issuer, date }) => (
            <li>
              <p class="dates">{monthYear(date)}</p>
              <p class="title">{name}</p>
              <p class="meta">{issuer}</p>
            </li>
          ))
        }
      </ul>
    </div>
    <div data-reveal data-delay="0.2">
      <h3>Idiomas</h3>
      <ul class="list">
        {
          languages.map(({ language, fluency }) => (
            <li>
              <p class="title">{language}</p>
              <p class="meta">{fluency}</p>
            </li>
          ))
        }
      </ul>
    </div>
  </div>
</Section>

<style>
  .cols {
    display: grid;
    grid-template-columns: 1.4fr 1fr 0.8fr;
    gap: 3rem;
  }

  h3 {
    margin-bottom: 1.5rem;
    color: var(--muted);
    font-size: 0.8rem;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
  }

  .dates {
    color: var(--accent);
    font-size: 0.8rem;
    letter-spacing: 0.08em;
  }

  .title {
    margin-top: 0.35rem;
    font-size: 1.1rem;
    font-weight: 500;
  }

  .meta {
    margin-top: 0.2rem;
    color: var(--muted);
    font-size: 0.92rem;
  }

  .note {
    margin-top: 0.5rem;
    color: #bdbdbd;
    font-size: 0.88rem;
    line-height: 1.5;
  }

  @media (width <= 800px) {
    .cols {
      grid-template-columns: 1fr;
    }
  }
</style>
```

- [ ] **Step 4: Create `src/components/sections/Contact.astro`**

```astro
---
import SocialLinks from "@/components/SocialLinks.astro"
import { cv } from "@/data/cv"

const { name, email } = cv.basics
const currentYear = new Date().getFullYear()
---

<section id="contacto" class="contact">
  <div class="container">
    <p class="eyebrow" data-reveal>¿Buscas a alguien que una negocio, producto y tecnología?</p>
    <h2 data-split>¿Hablamos?</h2>
    <div class="links" data-reveal>
      <a class="email" href={`mailto:${email}`}>
        {email}
        <span aria-hidden="true">↗</span>
      </a>
      <SocialLinks />
    </div>
  </div>
  <footer class="container footer">
    <p>© {currentYear} {name}</p>
    <p>Hecho con Astro y GSAP</p>
  </footer>
</section>

<style>
  .contact {
    padding-block: clamp(6rem, 14vw, 10rem) 2rem;
    border-top: 1px solid var(--line);
  }

  h2 {
    margin-block: 1.5rem 2.5rem;
    font-family: var(--font-display);
    font-size: clamp(4rem, 14vw, 12rem);
    font-weight: 400;
    letter-spacing: -0.03em;
    line-height: 0.9;
  }

  .links {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1.5rem;
  }

  .email {
    padding-bottom: 0.25rem;
    border-bottom: 1px solid var(--accent);
    font-size: clamp(1.25rem, 3vw, 2rem);
    transition: color 0.3s;
  }

  .email:hover {
    color: var(--accent);
  }

  .email span {
    margin-left: 0.25rem;
    color: var(--accent);
  }

  .footer {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 1rem;
    margin-top: clamp(5rem, 10vw, 8rem);
    padding-top: 1.5rem;
    border-top: 1px solid var(--line);
    color: var(--muted);
    font-size: 0.85rem;
  }
</style>
```

- [ ] **Step 5: Final page order**

`src/pages/index.astro` becomes:

```astro
---
import Layout from "@/layouts/Layout.astro"
import Nav from "@/components/Nav.astro"
import About from "@/components/sections/About.astro"
import Contact from "@/components/sections/Contact.astro"
import Education from "@/components/sections/Education.astro"
import Experience from "@/components/sections/Experience.astro"
import Hero from "@/components/sections/Hero.astro"
import Impact from "@/components/sections/Impact.astro"
import Projects from "@/components/sections/Projects.astro"
import Skills from "@/components/sections/Skills.astro"

import { cv } from "@/data/cv"

const { name, label } = cv.basics
---

<Layout title={`${name} — ${label}`}>
  <Nav />
  <main>
    <Hero />
    <Impact />
    <About />
    <Experience />
    <Skills />
    <Projects />
    <Education />
    <Contact />
  </main>
</Layout>
```

- [ ] **Step 6: Remove unused icons and the old data import path**

Delete `src/icons/Phone.astro` and `src/icons/X.astro`. Then confirm only `src/data/cv.ts` imports `@cv`:

Run: `grep -rn '"@cv"' src`
Expected: one hit, `src/data/cv.ts`.

- [ ] **Step 7: Verify**

Run: `pnpm build` → 0 errors.
`pnpm dev`: chips appear in a stagger per group, marquee scrolls and pauses on hover, project cards stagger in and lift with an accent border on hover (whole card clickable, "Código" link still opens GitHub), Formación shows three columns (one on mobile), "¿Hablamos?" splits in.

- [ ] **Step 8: Commit**

```bash
git add -A src
git commit -m "feat: add skills marquee, project cards, education and contact sections

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Downloadable CV PDF

**Files:**
- Create: `public/cv-valentin-lorente.pdf`
- Scratch (not committed): `<scratchpad>/make_cv_pdf.py`

The web hides the phone number, so the PDF strips it too. **Confirm with the user before running.** If they want the phone kept, skip Steps 2–3 and convert the docx as-is.

- [ ] **Step 1: Install converters**

```bash
python -m pip install python-docx docx2pdf pypdf
```

`docx2pdf` drives the installed Microsoft Word (`C:\Program Files\Microsoft Office\root\Office16\WINWORD.EXE`).

- [ ] **Step 2: Write `<scratchpad>/make_cv_pdf.py`**

```python
import sys
from pathlib import Path

from docx import Document
from docx.oxml.ns import qn
from docx2pdf import convert
from pypdf import PdfReader

PHONE = "+34 690 76 01 13"
TARGET = PHONE + " · "


def strip_span(paragraph, target):
    """Delete `target` from a paragraph even when Word split it across runs."""
    nodes = list(paragraph.iter(qn("w:t")))
    text = "".join(node.text or "" for node in nodes)
    start = text.find(target)
    if start < 0:
        return False
    end = start + len(target)
    pos = 0
    for node in nodes:
        chunk = node.text or ""
        lo, hi = max(pos, start), min(pos + len(chunk), end)
        if lo < hi:
            node.text = chunk[: lo - pos] + chunk[hi - pos :]
        pos += len(chunk)
    return True


def all_paragraphs(doc):
    yield from doc.element.body.iter(qn("w:p"))
    for section in doc.sections:
        for part in (section.header, section.footer):
            yield from part._element.iter(qn("w:p"))


src, out_pdf = Path(sys.argv[1]), Path(sys.argv[2])
tmp_docx = Path(sys.argv[3])

doc = Document(src)
removed = sum(strip_span(p, TARGET) for p in all_paragraphs(doc))
if removed == 0:
    sys.exit(f"Phone '{TARGET}' not found; check the separator in the docx")
doc.save(tmp_docx)

convert(str(tmp_docx), str(out_pdf))

pdf_text = "".join(page.extract_text() for page in PdfReader(out_pdf).pages)
if "690" in pdf_text:
    sys.exit("Phone still present in the PDF")
print(f"OK: removed {removed} occurrence(s), wrote {out_pdf}")
```

- [ ] **Step 3: Run it**

```bash
python -I "<scratchpad>/make_cv_pdf.py" "docs/Valentin_Lorente_CV_Technical_Product_Manager_BETWEEN.docx" "public/cv-valentin-lorente.pdf" "<scratchpad>/cv-no-phone.docx"
```

Expected: `OK: removed 1 occurrence(s), wrote public/cv-valentin-lorente.pdf`.
Fallback if Word automation fails: ask the user to open the docx, delete the phone, and use *Guardar como → PDF* to `public/cv-valentin-lorente.pdf`.

- [ ] **Step 4: Verify**

Open `public/cv-valentin-lorente.pdf`: layout matches the docx, contact line reads `Madrid, España · vlorentejimenez@gmail.com · es.linkedin.com/in/vlorente`. With `pnpm dev` running, "Descargar CV" in nav and hero downloads it.

- [ ] **Step 5: Commit**

```bash
git add public/cv-valentin-lorente.pdf
git commit -m "feat: add downloadable CV PDF

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Verification pass and docs

**Files:**
- Modify: `CLAUDE.md`
- Modify (only if a check fails): the component at fault

- [ ] **Step 1: Production build**

Run: `pnpm build`
Expected: 0 errors, 0 warnings from `astro check`; static output in `.vercel/output/static/index.html`.

- [ ] **Step 2: Serve the production output**

```bash
npx serve .vercel/output/static -l 4322
```

- [ ] **Step 3: Desktop and mobile visual pass**

With the playwright-cli skill (or a browser), load http://localhost:4322 at 1440×900 and at 390×844. Scroll top to bottom and screenshot each section. Check:
- every section renders and every animation fires once;
- no horizontal scrollbar at 390px (`document.documentElement.scrollWidth === 390`);
- nav anchors land with the heading below the fixed nav (adjust `NAV_OFFSET` in `src/scripts/motion.ts` if not);
- no console errors.

- [ ] **Step 4: Reduced-motion and no-JS pass**

Emulate `prefers-reduced-motion: reduce` (DevTools → Rendering, or Playwright `reducedMotion: "reduce"`): all content visible immediately, no smooth scroll, marquee static. Then disable JavaScript: all content visible.

- [ ] **Step 5: Lighthouse**

```bash
npx lighthouse http://localhost:4322 --only-categories=performance,accessibility --preset=desktop --quiet --chrome-flags="--headless" --output=json --output-path="<scratchpad>/lh.json"
node -e "const r=require(process.argv[1]);for(const[k,v]of Object.entries(r.categories))console.log(k,Math.round(v.score*100))" "<scratchpad>/lh.json"
```

Expected: performance ≥ 90 and accessibility ≥ 90. If accessibility fails on contrast, lighten `--muted` (e.g. `#9a9a9a`) and re-run.

- [ ] **Step 6: Update `CLAUDE.md`**

Replace the Architecture bullets about social icons, `KeyboardManager`, and print mode with:

```markdown
- Content is read through `src/data/cv.ts`, which types `cv.json` as `CV` (`src/cv.d.ts`); `astro check` fails if the JSON drifts from the schema. Non-standard fields: `basics.headline`, `basics.metrics`, `basics.stack`, `work[].location`, `work[].groups`, `projects[].isActive`, `projects[].github`.
- Social profiles (`basics.profiles[].network`) map to icons in `SOCIAL_ICONS` in `src/components/SocialLinks.astro`; a new network needs an icon there.
- Motion: components only declare `data-*` attributes (`data-reveal`, `data-stagger`, `data-split`, `data-scrub-words`, `data-counter`, `data-timeline`, `data-clip`, `data-progress`); `src/scripts/motion.ts` wires them with GSAP (ScrollTrigger, SplitText) and Lenis. Elements are hidden only under `html.motion`, set by an inline script in `Layout.astro` unless `prefers-reduced-motion` is on, so content stays visible without JS.
- Design tokens (colors, fonts, spacing) live in `src/styles/global.css`.
- The downloadable CV is `public/cv-valentin-lorente.pdf`; the source docx in `docs/` is gitignored.
```

Also change the Overview line to drop "and as a printable PDF".

- [ ] **Step 7: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for the motion architecture

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
