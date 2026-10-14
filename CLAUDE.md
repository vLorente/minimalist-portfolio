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

- **All content lives in `cv.json`** (JSON Resume schema, https://jsonresume.org/schema/). Adding/editing experience, projects, skills, etc. is a data change only — no component edits needed. It is imported via the `@cv` path alias (`tsconfig.json`), and its shape is typed in `src/cv.d.ts`. The schema is extended with non-standard fields, e.g. `projects[].isActive` and `projects[].github`; keep `src/cv.d.ts` in sync when adding fields.
- `src/pages/index.astro` composes the section components from `src/components/sections/` in order, each wrapped in the shared `Section.astro` (title + 700px max-width container). Path alias `@/*` maps to `src/*`.
- Content is read through `src/data/cv.ts`, which types `cv.json` as `CV` (`src/cv.d.ts`); `astro check` fails if the JSON drifts from the schema. Non-standard fields: `basics.headline`, `basics.metrics`, `basics.stack`, `work[].location`, `work[].groups`, `projects[].isActive`, `projects[].github`.
- Social profiles (`basics.profiles[].network`) map to icons in `SOCIAL_ICONS` in `src/components/SocialLinks.astro`; a new network needs an icon there.
- Motion: components only declare `data-*` attributes (`data-reveal`, `data-stagger`, `data-split`, `data-scrub-words`, `data-counter`, `data-timeline`, `data-clip`, `data-progress`); `src/scripts/motion.ts` wires them with GSAP (ScrollTrigger, SplitText) and Lenis. Elements are hidden only under `html.motion`, set by an inline script in `Layout.astro` unless `prefers-reduced-motion` is on, so content stays visible without JS.
- Design tokens (colors, fonts, spacing) live in `src/styles/global.css`.
- The downloadable CV is `public/cv-valentin-lorente.pdf`; the source docx in `docs/` is gitignored.
- Deployment: Vercel via `@astrojs/vercel/serverless` with `output: "hybrid"` and Vercel Web Analytics enabled (`astro.config.mjs`).
