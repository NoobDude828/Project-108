# Project 108 — Design System

Design system for **Project 108**, a Royal initiative led by the Gelephu Mindfulness City Authority (GMC) to complete 108 Jangchub Chortens — each 15 metres tall, spaced 108 metres apart along the Mau Chhu in Gelephu, Bhutan — in a single coordinated day on **1 November 2026**.

The brand is contemplative, monumental, and rooted in Vajrayana Buddhist tradition. Its aesthetic is the print brochure: deep maroon, parchment cream, warm gold, set in Cormorant Garamond + Lora + Inter Tight.

---

## Sources

This system was built by reading the existing codebase in full:

- `Project 108-scroll/prototype/` — the canonical static website for `gmc.bt/108`. Long-form, single-page, ~64 KB hand-written HTML + inline CSS. **The source of truth for visual style and copy.**
- `Project 108-scroll/preview/` — a cinematic scrollytelling retelling of the same content, 15 pinned scenes. Same palette + type, but more theatrical (full-bleed maroon, animated SVG, 108 dot-fields, etc).
- `Project 108-scroll/Claude_Design_Notes.md` — handoff notes for the scrollytelling experience.
- `Project 108-scroll/prototype/Project_108.pdf` — the editable print brochure (1.4 MB, 16 pages). All SVG illustrations on the site were extracted from this.
- `Project 108-scroll/prototype/assets/` — extracted brochure SVGs (chorten silhouettes, elevation, scale figures, heights chart) plus the Mau Chhu landscape photo. Copied into `assets/` here.

There is **one product**: the public-facing campaign website at `gmc.bt/108`, presented in two registers — a long-read brochure and a scrolled cinematic. We treat both as a single visual system.

---

## Index

- [`README.md`](./README.md) — this file.
- [`colors_and_type.css`](./colors_and_type.css) — CSS variables for the full palette + type system. Import this into anything new.
- [`SKILL.md`](./SKILL.md) — Claude Skill descriptor. Read this if you're loading the system in Claude Code.
- [`assets/`](./assets/) — logos, chorten silhouettes, the architectural elevation, scale figures, heights chart, and the Mau Chhu landscape photo.
- [`preview/`](./preview/) — small cards rendered in the project's Design System tab.
- [`ui_kits/website/`](./ui_kits/website/) — UI kit reproducing the Project 108 website. Two registers:
  - [`ui_kits/website/index.html`](./ui_kits/website/index.html) — the long-read **brochure** site (nav, hero, sections, modal, contact).
  - [`ui_kits/website/scroll/index.html`](./ui_kits/website/scroll/index.html) — the cinematic **scrollytelling** retelling. 15 pinned scenes (cover → chorten anatomy → meaning of 108 → scale → completion → invitation). Driven by `scrollytelling.js`'s rAF loop, which sets a `0..1` `--p` custom property on each scene per frame; CSS interpolates the rest. Notable: caption bar at top tracks active scene; bottom progress rail; sticky `.colophon` footer. The page exposes `window.__p108Tick()` for headless verification (rAF is paused when `document.hidden` is true).

---

## Content fundamentals

Project 108's voice is **measured, declarative, and reverent**. It speaks the way a brochure for a sacred ceremony speaks — without irony, without marketing exuberance, without exclamation marks.

**Tone.** Quiet authority. Sentences are short and unhurried. Capable of being read aloud. The copy never sells; it explains, then invites. When ambition is named, it is followed immediately by humility ("It is, by any measure, extraordinary. But it is not merely an engineering feat.").

**Person.** Mostly impersonal third-person. "Project 108 is…", "Each chorten will…", "It is a collective offering to the world." The reader is addressed as "you" only at the moments of invitation ("If you've travelled in Asia, you've almost certainly seen a stupa.", "Two ways to take part."). "We" appears only in institutional voice — "We welcome all to this collective act of merit."

**Casing.** Sentence case for body. **Title Case for proper nouns and section eyebrows** ("Become a Patron", "Join the Build", "The Project", "Why a Single Day"). All-caps is reserved for utility microtext (eyebrows, badges, button labels, captions) and is always paired with **letter-spacing 0.18–0.32em**.

**Spelling.** British. *Symbolises*, not *symbolizes*. *Metres*, not *meters*.

**Numerals.** Old-style figures (`font-feature-settings: "onum"`) wherever a number appears in display type. The numeral 108 is a recurring motif and is set in Cormorant Garamond Light italic at huge sizes.

**Italics for sacred / vernacular terms.** *Zhābto*, *Jangchub Chorten*, *Bum-pa*, *Khorlo* — italicised when first introduced, set in Cormorant italic when given display treatment.

**No emoji. No exclamation marks. No "!" or "?" stacked. Em-dashes used sparingly, with spaces around — like this — never tight.**

**Examples.**
- Hero caption: *"108 Jangchub Chortens, each 15 metres tall, completed together in a single day."*
- Eyebrow: *"AN INVITATION TO PARTICIPATE"*
- Headline: *"In a world troubled by conflict, Bhutan offers a sacred gesture of peace."*
- CTA: *"Become a Patron"*, *"Join the Build"*, *"Take Part"*
- Section lede: *"Project 108 is shaped by two forces: those who offer the chortens and those who build them. Both are acts of merit. Both are needed."*

---

## Visual foundations

**Palette.** Three colours and one neutral. Deep **maroon** `#4A1A2C` for surfaces of weight; warm **gold** `#C8A663` for accent and numerals; **cream** `#F2E9D8` for type on maroon and as a soft page surface (`#FAF6ED` is the lighter page cream); **ink** `#2D1419` for body type on cream. Nothing else. No bright primaries, no saturated blues, no purple gradients. The brochure is monochromatic-warm by design.

**Type.** Three families, each with a clear job:
- **Cormorant Garamond Light** — display headlines, the 108 numeral, italic emphasis (the *poetic voice*).
- **Lora** — body text. Confirmed via `pdffonts` to match the print brochure exactly.
- **Inter Tight** — utility microtext (eyebrows, badges, buttons, captions). Always uppercase, always wide-tracked.

Old-style figures (`onum`) are on by default for headlines and stats — the date, the 108, the kilometre figures all use them.

**Backgrounds.** Almost no images and zero gradients in the brochure. The scrollytelling adds *subtle* radial gradients (maroon-deep → maroon-deeper) to give pinned scenes atmosphere, and one full-bleed photograph (the Mau Chhu valley aerial) used once. No patterns, no textures, no hand-drawn illustration. Every illustration is a **vector chorten silhouette extracted from the brochure**, never invented.

**Spacing.** Generous. Sections are `padding: 5rem 0`. Section headlines have `2.5rem` of breathing room beneath them. Body text caps at `38rem` to preserve reading rhythm.

**Borders & rules.** Hairlines, never thick borders. `1px solid rgba(74,26,44,0.15)` on cream; `1px solid rgba(242,233,216,0.18)` on maroon. A 36×1px gold hairline is a recurring divider motif.

**Corner radii.** Subtle. **4px** for inputs and small UI; **6px** for cards and figures; **8px** for modals; **999px (pill)** for buttons and badges. Never sharp, never heavy.

**Cards.** Cream surface (`var(--cream)`) on a lighter cream page. **No shadow, no border** — they sit on the page by colour difference alone. `padding: 1.75rem–2.25rem`, `border-radius: 6px`. Title in Cormorant uppercase + small caps feel; body in Lora.

**Shadows.** Used only for modals (`0 30px 60px rgba(45,20,25,0.4)`) and as soft glows on the gold numeral (`text-shadow: 0 0 80px rgba(200,166,99,.18)`). UI is otherwise flat.

**Buttons.** Pill-shaped (`border-radius: 999px`), uppercase Inter Tight at `0.75rem` with `0.22em` tracking. **Primary**: maroon fill, cream text. **Ghost**: transparent, maroon border + maroon text, fills to maroon on hover.

**Hover states.** Subtle. Background darkens (`--maroon` → `--maroon-deep`), or text color shifts to gold-bright. Never scaling, never glowing. Transitions are `0.15s–0.25s ease`.

**Press states.** `transform: translateY(1px)` on buttons. That's it.

**Animations.** Cinematic but restrained. `cubic-bezier(.22,1,.36,1)` (a gentle "slow-in") is the house easing. Fades are 0.55s–1.2s. Scrollytelling drives `--p` (0..1) custom properties on parts; CSS interpolates the rest. No bounces, no springs, no rotations beyond gentle drift. The title numeral animates in over 2.4s with a letter-spacing release.

**Transparency / blur.** The site nav uses a translucent cream (`rgba(250,246,237,0.92)`) with `backdrop-filter: blur(8px) saturate(120%)`. The participate modal backdrop uses `rgba(45,20,25,0.55)` with `blur(4px)`. Used sparingly — only for chrome that overlays content.

**Fixed elements.** The scrollytelling has a fixed top-left status strip ("PROJECT 108"), a bottom progress rail, and a bottom-left scene caption — all using `mix-blend-mode: difference` so they pass over both maroon and cream stages.

**Imagery vibe.** Warm and slightly desaturated — the Mau Chhu aerial photograph is the only photographic asset, and it carries the same maroon-cream-gold register. Illustrations are line art (gold strokes, cream fills) on maroon, or maroon strokes on cream. Never colourful, never glossy.

**Layout rules.** Single-column reading; multi-column only for stats (4-up), readiness cards (3-up at desktop), and take-part / glossary (2-up). Wide content is `72rem` max; medium reading is `52rem`; narrow body copy is `38rem`. Everything is mobile-first and breakpointed at `720 / 880 / 1000px`.

---

## Iconography

**There are no UI icons in the system.** Project 108 is a print-led brand and the website inherits that. There is no icon font, no icon sprite, no Lucide-style stroked glyphs anywhere in the codebase.

What the system does use, instead of icons, are **brochure-extracted vector silhouettes**:

- `assets/hero_chorten.svg` — the cover chorten silhouette, gold on maroon. The de-facto logo mark.
- `assets/back_chorten.svg` — a smaller decorative chorten used as a faded background ornament in the contact footer.
- `assets/elevation.svg` — the architectural elevation diagram with all 7 sacred parts labelled.
- `assets/scale_figures.svg` — the comparative scale: human, 3-storey building, chorten.
- `assets/heights_chart.svg` — the vertical comparison: Project 108 stack, Burj Khalifa, Eiffel Tower, Great Pyramid.
- `assets/favicon.svg` — a single chorten glyph at favicon size.

There is no logo wordmark. The brand mark is the **stacked numeral "108"** in Cormorant Garamond Light italic, often paired with the eyebrow "PROJECT" in Inter Tight 0.5em-tracked.

**Emoji.** Never used. Even the modal success state uses a typographic checkmark `✓` (U+2713) on a gold-pill background, not an emoji.

**Unicode glyphs.** Used sparingly: `·` (middle dot) as a separator in eyebrow strips, `×` (U+00D7) as the modal close button, `—` (em-dash) in copy.

**If you need a glyph the system doesn't have**, use a **Lucide** icon (CDN: `https://unpkg.com/lucide-static`) at stroke-width 1.5, sized 16–20px, and recolour to `var(--maroon)` on cream surfaces or `var(--gold)` on maroon surfaces. Flag the substitution.

---

## Caveats / known substitutions

- **Fonts** are loaded from Google Fonts (Cormorant Garamond, Lora, Inter Tight). No `.woff2` files are vendored in this system — Google Fonts is the source. If you need to host them, download from Google Fonts and place in a `fonts/` directory; the @font-face rules will need to be added to `colors_and_type.css`. Confirmed: **Lora is an exact match for the print brochure body face** (verified via `pdffonts` in the prototype README).
- The site has **no app product** — only the brochure website. UI kits in this system reproduce that website only.
