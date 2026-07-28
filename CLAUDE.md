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
pnpm dev                # next dev (Turbopack) — http://localhost:3000
pnpm build              # next build
pnpm start              # next start (production)
pnpm lint               # eslint (eslint-config-next core-web-vitals + typescript)
```

There is no test suite.

## Critical config

- **The site is served at the root of its own subdomain: `https://108.gmc.bt`.** It used to be mounted at `gmc.bt/108`; that path now 301s to the subdomain (nginx `location ^~ /108`), so old links and QR codes keep working.
- **`basePath` is env-driven, not hardcoded.** `next.config.ts` reads `process.env.BASE_PATH` and only falls back to `/108` when the var is *undefined*. Both the server `.env` and `.env.development` set `BASE_PATH=` (empty), so the app builds at the root in prod and dev alike. Don't reintroduce a hardcoded prefix — flipping the mount point is an env change plus an nginx `proxy_pass`, nothing more.
- Client code detects the prefix at runtime (`pathname.startsWith("/108") ? "/108" : ""` in `public/scroll/form.js` and `components/ui/OrgFormModal.tsx`). On the subdomain this resolves to `""`; the `/108` branch is retained only so any still-cached page under the old path keeps calling the right API.
- TS path alias: `@/*` → repo root.

## Routes & architecture

A single cinematic scrollytelling page plus a thin API layer. There is no database and no auth in this app — form submissions are proxied to the gmc-app backend, which owns the data.

- **`app/page.tsx`** → `/` — cinematic scrollytelling. A client component composing the `components/scenes/Scene*.tsx` stages. Most SVG illustrations (chorten anatomy, scale figures, mountain silhouettes, "why 108" diagrams) are inlined in JSX, not imported as files. Styling lives in `app/scroll.css`. Behaviour is driven by **`public/scroll/scrollytelling.js`** (loaded via `<Script strategy="afterInteractive">`), which runs a `requestAnimationFrame` loop that sets a `--p` custom property (0..1) on each scene each frame; CSS interpolates from there. Headless tools can advance frames via `window.__p108Tick()` (rAF is paused when `document.hidden`).
- **Forms** are a hybrid: `public/scroll/form.js` (vanilla, drives the patron/volunteer modal via `[data-open-form]`) plus React modals in `components/ui/` — `FormModal.tsx` and `OrgFormModal.tsx`, the latter opened by the `p108:open-org-form` CustomEvent that `form.js` dispatches. `?form=patron|volunteer|volunteer-org` auto-opens a modal on load.
- **`app/api/submit/[role]/route.ts`** → same-origin proxy to `https://gmc.bt/api/{patrons|volunteers}`, which exists to sidestep upstream CORS preflight failures. It rate limits per IP and collapses upstream's 409 duplicate messages into one generic string (see the header comment — both are penetration-test remediations, don't remove them).
- **`app/api/online/route.ts`** → in-memory active-visitor counter (resets on restart).
- **`app/layout.tsx`** sets metadata, JSON-LD and GA4. Canonical/OG URLs point at `https://108.gmc.bt`; the organizer/publisher URLs deliberately stay `https://gmc.bt` (parent authority).
- **`lib/rateLimit.ts`** — shared in-memory per-IP limiter. Counters are per-process, which is fine because prod is a single PM2 fork; move to Redis or the nginx edge if it is ever scaled out.

There is no brochure route — `README.md`/`SKILL.md` may still reference one.

## Brand & design system

This is a design-led brand site for Project 108 (Gelephu Mindfulness City Authority, Bhutan). `README.md` and `SKILL.md` document the brand in depth — read them before touching visuals or copy.

Non-obvious rules that bite:
- **Palette is fixed.** Maroon `#4A1A2C`, gold `#C8A663`, cream `#F2E9D8`/`#FAF6ED`, ink `#2D1419`. Don't introduce other colours, gradients (beyond the maroon-deep radials already in use), or shadows beyond the modal/glow tokens already defined.
- **Three fonts, three jobs.** Cormorant Garamond Light (display + numerals, oldstyle figures `onum` on), Lora (body), Inter Tight (uppercase microtext, `letter-spacing: 0.18–0.32em`). Loaded from Google Fonts in `globals.css`.
- **No icons, no emoji.** Use brochure-extracted SVGs in `public/assets/` (`hero_chorten.svg`, `elevation.svg`, `scale_figures.svg`, `heights_chart.svg`, etc.). If a glyph is genuinely needed, use Lucide stroked at 1.5 and flag the substitution.
- **British spelling, no exclamation marks, em-dashes with spaces around them.** Voice is ceremonial third-person.
- **Sentence case** for body; **Title Case** for proper nouns and section eyebrows; **ALL CAPS only** for utility microtext (always wide-tracked).

## Deployment

GitHub Actions (`.github/workflows/deploy.yml`) deploys on push to `main` via SSH: resets to `origin/main` on the server, runs `npm run build`, and `pm2 restart project-108`. Server host/user/key are repo secrets. **Pushing to `main` deploys straight to production — there is no preview/staging environment**, so use a branch for anything unproven.

- Prod runs as PM2 process `project-108` on port **3003**, at `/home/ubuntu/Project-108`, fronted by nginx (`/etc/nginx/sites-available/108.gmc.bt` → `proxy_pass http://127.0.0.1:3003`).
- Server secrets live in `/home/ubuntu/Project-108/.env`, which is gitignored and therefore **never touched by a deploy** — add new env vars there manually.
- `.github/workflows/security.yml` runs Semgrep (SAST) + Trivy (deps/secrets/IaC) on PRs to `main`, report-only.
