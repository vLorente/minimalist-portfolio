# Dynamic portfolio redesign — design

Date: 2026-10-14
Status: approved in conversation, pending spec review

## Goal

Turn the static minimalist CV site into a dynamic, scroll-animated portfolio that impresses headhunters, and update its content to the latest CV (`docs/Valentin_Lorente_CV_Technical_Product_Manager_BETWEEN.docx`).

## Decisions

| Topic | Decision |
|---|---|
| Positioning | Technical Product Manager with an engineering background. Impact metrics lead; personal projects act as proof of technical skill. |
| Scroll technique | Code-based animations (GSAP + ScrollTrigger + SplitText + Lenis). The `scroll-world` skill (paid AI video) is not used. The `motion-design` skill guides timing and easing. |
| Contact data | Email, LinkedIn, GitHub. No phone. Location: Madrid, España. |
| Print mode | Removed (`.print` / `.no-print` classes and print styles). |
| Command palette | Removed (`KeyboardManager.astro`, `hotkeypad` dependency). |
| CV download | New "Descargar CV" button linking to `public/cv-valentin-lorente.pdf`. |
| Aesthetic | Dark editorial: background `#0b0b0c`, text `#ededed`, muted `#8a8a8a`, accent lime `#c6ff3d`. Display serif for headings, grotesk for body, self-hosted via `@fontsource`. |
| Framework | Stay on Astro 4 + TypeScript strict. No framework upgrade. |
| Language | UI text stays in Spanish. |

## Architecture

- **Content**: all content stays in `cv.json`, typed in `src/cv.d.ts`.
  - Remove template placeholders: `volunteer`, `awards`, `publications`, and the dummy `courses` / `highlights` values.
  - Update `basics` (label, summary, location Madrid, no phone), `work` (StopCardio, HealthPoint Europe 2018–2024, NTT Data 2016–2018), `education`, `certificates` (Microsoft GitHub Copilot 08/2025, IBM Python for Data Science 02/2024), `languages` (Inglés B2).
  - `work[].highlights` holds the achievement bullets from the CV. Add optional non-standard `work[].groups` (`{ title, highlights[] }[]`) for StopCardio's grouped achievements (Nuevas líneas de negocio, Contact center, Producto y captación).
  - New non-standard `basics.headline` (hero statement) and `basics.metrics` (`{ value: number, prefix?, suffix?, label }[]`) for the impact counters.
  - `skills` regrouped into the CV's five competency groups: each entry `{ name: group, keywords: [...] }`. Add `basics.stack` (string list) for the tech marquee.
  - `projects` kept as they are (personal technical projects).
- **Motion module** `src/scripts/motion.ts`: imported once from the layout. Registers GSAP plugins and Lenis, then wires behaviors declared in markup through `data-anim` attributes:
  - `reveal` — fade + translateY on enter, staggered for children marked `data-anim-item`.
  - `split` — heading split into words/lines, staggered reveal.
  - `scrub-words` — paragraph words go from muted to full color as the user scrolls.
  - `counter` — number counts from 0 to `data-value` on enter.
  - `timeline` — vertical line draws with scroll progress; entries reveal in sequence.
  - `marquee` — infinite horizontal stack strip.
  - Scroll progress bar in the nav.
  Components only declare attributes; all animation logic lives in this one module.
- **Progressive enhancement**: the hidden initial state applies only under `html.js` (class added by an inline script in `<head>`). Without JS, all content is visible. With `prefers-reduced-motion: reduce`, Lenis is disabled and every element is shown in its final state with no animation.

## Page sections (in order)

1. **Nav** — fixed, minimal: initials/name, section anchors, "Descargar CV". Scroll progress bar.
2. **Hero** (full viewport) — name, headline revealed word by word ("Convierto problemas de negocio en producto."), label "Technical Product Manager · Product Owner · Producto API", photo with a mask reveal, CTAs "Descargar CV" and "Contactar", scroll indicator.
3. **Impacto** — large counters: −75 % tiempo de implantación, <1 min contacto de lead (from 24 h), −40 % coste del CTI, −40 % CPL, plus "2 líneas de negocio, de idea a primera venta en <1 mes".
4. **Sobre mí** — summary with `scrub-words`.
5. **Experiencia** — timeline with drawing line; each role shows company, position, place, dates, role line, achievements (grouped for StopCardio).
6. **Competencias** — five groups as chip lists with staggered reveal; tech stack marquee below.
7. **Proyectos** — cards with staggered entry and hover lift/tilt; links to site and GitHub; "activo" badge from `isActive`.
8. **Formación** — education, certifications, languages in a compact grid.
9. **Footer CTA** — large "¿Hablamos?" with email, LinkedIn, GitHub.

Existing section components are rewritten; `Section.astro` is kept as the shared wrapper but widened (max-width ~1100px) for the editorial layout. Social icons map stays in one place (Hero/footer share a small `SocialLinks.astro`).

## Motion guidelines

- Easing: `expo.out` for entrances, `power3.inOut` for scrubbed movement.
- Durations: 0.6–1.2 s for entrances; stagger 0.05–0.08 s.
- Only animate `transform` and `opacity` (plus `color` for `scrub-words` and `scaleY` for the timeline line).
- Animations play once on enter; no reverse on scroll up except scrubbed ones.

## CV PDF

Convert the docx to `public/cv-valentin-lorente.pdf` (try `docx2pdf`, which uses the installed Microsoft Word). If conversion is not possible, the user exports it manually; the button links to that path either way.

## Verification

- `pnpm build` passes (`astro check` + build).
- Visual check in a browser at desktop (1440px) and mobile (390px) widths: all sections render, animations fire, no horizontal scroll.
- Reduced-motion check: content fully visible.
- Quick Lighthouse run: performance and accessibility not regressed below 90.

## Out of scope

- `scroll-world` AI video, 3D/WebGL.
- i18n / English version.
- Blog or CMS.
- Astro version upgrade.
