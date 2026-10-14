# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Single-page personal portfolio / CV built with Astro 4 + TypeScript (strict), designed as a dark, scroll-animated website. Forked from the `midudev/minimalist-portfolio-json` template. UI text is in Spanish.

## Commands

Package manager is pnpm (per README; `pnpm-lock.yaml` is gitignored).

- `pnpm dev` (or `pnpm start`) — dev server at http://localhost:4321
- `pnpm build` — runs `astro check` (type checking) then `astro build`; this is the only verification step, there are no tests or linter
- `pnpm preview` — preview the production build

## Architecture

- **All content lives in `cv.json`** (JSON Resume schema, https://jsonresume.org/schema/). Adding/editing experience, projects, skills, etc. is a data change only — no component edits needed. Components read it through `src/data/cv.ts` (imported as `@/data/cv`; only that file uses the `@cv` alias), which types `cv.json` as `CV` (`src/cv.d.ts`); `astro check` fails if the JSON drifts from the schema. Non-standard fields: `basics.headline`, `basics.metrics`, `basics.stack`, `work[].location`, `work[].groups`, `projects[].isActive`, `projects[].github`; keep `src/cv.d.ts` in sync when adding fields.
- `src/pages/index.astro` renders `<Nav />` followed by the sections in `src/components/sections/` in order: Hero, Impact, About, Experience, Skills, Projects, Education, Contact. Most are wrapped in the shared `src/components/Section.astro` (props `{ id?, index?, title? }`; renders a split heading and uses the global `.container`, max-width `--container` = 1100px, in `src/styles/global.css`). Path alias `@/*` maps to `src/*`.
- Social profiles (`basics.profiles[].network`) map to icons in `SOCIAL_ICONS` in `src/components/SocialLinks.astro`; a new network needs an icon there.
- Motion: components only declare `data-*` attributes (`data-reveal`, `data-stagger`, `data-split`, `data-scrub-words`, `data-counter`, `data-timeline`, `data-clip`, `data-progress`). Variants: `data-delay="<seconds>"` (with `data-reveal`), `data-timeline-line` (child of `data-timeline`), `data-split="load"` (plays on load instead of on scroll); `src/scripts/motion.ts` wires them with GSAP (ScrollTrigger, SplitText) and Lenis. Elements are hidden only under `html.motion`, set by an inline script in `Layout.astro` unless `prefers-reduced-motion` is on, so content stays visible without JS. A 3 s safety net in `Layout.astro` removes `html.motion` if the module never adds `motion-ready`.
- Design tokens (colors, fonts, spacing) live in `src/styles/global.css`.
- The downloadable CV is `public/cv-valentin-lorente.pdf`; the source docx in `docs/` is gitignored.
- Deployment: Vercel via `@astrojs/vercel/serverless` with `output: "hybrid"` and Vercel Web Analytics enabled (`astro.config.mjs`).
