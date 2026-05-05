# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Stack

- **Next.js 16.2.4** (App Router, Turbopack) + **React 19.2** + **TypeScript 5** + **Tailwind 4** (via `@tailwindcss/postcss`).
- Package manager: **pnpm** (lockfile is `pnpm-lock.yaml`).
- Read `node_modules/next/dist/docs/` before using Next APIs — this is Next 16, not the version in your training data.

## Commands

```bash
pnpm install            # install
pnpm dev                # next dev (Turbopack) — http://localhost:3000/108
pnpm build              # next build
pnpm start              # next start (production)
pnpm lint               # eslint (eslint-config-next core-web-vitals + typescript)
```

There is no test suite.

## Critical config

- **`basePath: "/108"`** in `next.config.ts` — the site is mounted at `/108`, not `/`. Local URLs are `http://localhost:3000/108` and `http://localhost:3000/108/brochure`. `next/link` prepends the basePath automatically; raw `<a href>` and asset URLs in JSX/CSS do not — references to `/assets/...` and `/scroll/...` work because the server serves `public/` under the basePath.
- TS path alias: `@/*` → repo root.

## Routes & architecture

The site is a **single product in two registers** — both render the same Project 108 brand content. There is no API layer, no database, no auth.

- **`app/page.tsx`** → `/108` — cinematic scrollytelling. One large client component with 15 inline `<section className="scene scene-*">` stages. Most SVG illustrations (chorten anatomy, scale figures, mountain silhouettes, "why 108" diagrams) are inlined in JSX, not imported as files. Styling lives in `app/scroll.css`. Behaviour is driven by **`public/scroll/scrollytelling.js`** (loaded via `<Script strategy="afterInteractive">`), which runs a `requestAnimationFrame` loop that sets a `--p` custom property (0..1) on each scene each frame; CSS interpolates from there. Headless tools can advance frames via `window.__p108Tick()` (rAF is paused when `document.hidden`). The signup form is wired up by **`public/scroll/form.js`** against the inline `<div id="form-modal">` markup at the bottom of the page.
- **`app/brochure/page.tsx`** → `/108/brochure` — long-read brochure, server component composed from `components/{Nav,Hero,StatStrip,Section,Glossary,ReadinessCards,TakePart,Contact,Footer,Modal}.tsx`. The brochure modal is a **React** component (`components/Modal.tsx`) that exposes `window.openP108Modal(role)` — a different mechanism from the scroll page's vanilla-JS form.
- **`app/layout.tsx`** sets metadata + favicon links and imports `app/globals.css` (which holds the design tokens).

The two pages cross-link via the top-bar "View as brochure" / nav link. They share design tokens but **not** components or JS — the scroll page is intentionally hand-written JSX + plain JS to keep the cinematic motion lean.

## Brand & design system

This is a design-led brand site for Project 108 (Gelephu Mindfulness City Authority, Bhutan). `README.md` and `SKILL.md` document the brand in depth — read them before touching visuals or copy.

Non-obvious rules that bite:
- **Palette is fixed.** Maroon `#4A1A2C`, gold `#C8A663`, cream `#F2E9D8`/`#FAF6ED`, ink `#2D1419`. Don't introduce other colours, gradients (beyond the maroon-deep radials already in use), or shadows beyond the modal/glow tokens already defined.
- **Three fonts, three jobs.** Cormorant Garamond Light (display + numerals, oldstyle figures `onum` on), Lora (body), Inter Tight (uppercase microtext, `letter-spacing: 0.18–0.32em`). Loaded from Google Fonts in `globals.css`.
- **No icons, no emoji.** Use brochure-extracted SVGs in `public/assets/` (`hero_chorten.svg`, `elevation.svg`, `scale_figures.svg`, `heights_chart.svg`, etc.). If a glyph is genuinely needed, use Lucide stroked at 1.5 and flag the substitution.
- **British spelling, no exclamation marks, em-dashes with spaces around them.** Voice is ceremonial third-person.
- **Sentence case** for body; **Title Case** for proper nouns and section eyebrows; **ALL CAPS only** for utility microtext (always wide-tracked).

## Deployment

GitHub Actions (`.github/workflows/deploy.yml`) deploys on push to `main` via SSH: pulls on the server, runs `npm run build`, and `pm2 restart project-108`. Server host/user/key are repo secrets. There is no preview/staging environment.
