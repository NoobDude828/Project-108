---
name: project-108-design
description: Use this skill to generate well-branded interfaces and assets for Project 108 (the 108 Jangchub Chortens initiative by Gelephu Mindfulness City Authority, Bhutan), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick orientation

- `colors_and_type.css` — single source of truth for tokens. Import in every output.
- `assets/` — logos, brochure-extracted SVGs (chortens, scale figures, elevation, heights chart), the one photographic asset (`landscape_mau_chhu.jpg`).
- `fonts/` — Webfonts loaded via Google Fonts (`Cormorant Garamond` display, `Lora` body, `Inter Tight` utility); README documents the substitutions made vs. the brochure's print specimens.
- `ui_kits/website/` — high-fidelity React recreation of the gmc.bt/108 brochure site. Composable JSX components.
  - `ui_kits/website/index.html` — long-read brochure (nav, hero, sections, modal).
  - `ui_kits/website/scroll/index.html` — cinematic scrollytelling, 15 pinned scenes; per-scene `--p` (0..1) drives CSS-only motion. Use `window.__p108Tick()` to advance frames in headless contexts.
- `preview/` — design-system specimen cards (colors, type, components, brand) registered for the Design System tab.
- `README.md` — content fundamentals, visual foundations, iconography, full file index.

## Brand essentials

- **Voice**: ceremonial, third-person, "we" / "all are welcome". No emoji. No exclamation. Sentence case in body, UPPERCASE+wide-tracked for utility microtext only.
- **Palette**: deep maroon `#4A1A2C` ground, cream `#F2E9D8` text, gold `#C8A663` accents. Cream-light `#FAF6ED` for light pages. Never invent colors.
- **Type**: Cormorant Garamond Light for display + numerals (oldstyle figures), Lora for body, Inter Tight for eyebrows/buttons (uppercase, wide letter-spacing).
- **Motifs**: 36×1px gold hairline divider; oldstyle numerals at huge scale; brochure-extracted chorten silhouettes; pill-shaped CTA buttons; cream cards with subtle hairline borders.
