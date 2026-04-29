# Project 108 — Scrollytelling Site · Handoff

**File:** `preview/index.html` (with `preview/styles.css` and `preview/scrollytelling.js`)
**Source content:** `prototype/index.html` (the long-form site that this scrollytelling experience is derived from)

A cinematic, scroll-driven retelling of Project 108 — 108 Jangchub Chortens, completed in a single day on 1 November 2026, along the Mau Chhu in Gelephu Mindfulness City, Bhutan.

---

## What this is

Fifteen pinned scenes that scroll-animate from the project's title, through the sacred object itself (a chorten and its seven assembled parts), through the meaning of the number 108, into the scale of the build (height, line, manpower, time), and out to a closing tableau and an invitation to participate.

Companion to the Brand Brief and the Scrollytelling Storyboard — every scene is a faithful interpretation of those documents, not a free invention.

## Scene map (15)

| #   | id                | What it does                                                                               |
| --- | ----------------- | ------------------------------------------------------------------------------------------ |
| 01  | scene-title       | Cover. The numeral 108 in gold, on a deep maroon ground, with date and place.              |
| 02  | scene-what        | "What is a chorten?" — a single chorten outline reveals as four truths fade in beside it.  |
| 02b | scene-gesture     | His Majesty's quote ("…no limit to what we can achieve when we stand together").           |
| 03  | scene-assembly    | The chorten built up part-by-part — seven sacred elements (thri, bangrim, bumpa, lhakhang, harmika, khorlo, nyim-da). |
| 04  | scene-scale       | "How tall is 15 metres?" — a person, a three-storey house, and a chorten, drawn to scale.  |
| 05  | scene-why         | Pinned multi-chapter scene on the meaning of 108 (mala, marmas, sacred sites, naming, Project 108). |
| 06  | scene-multiply    | One chorten becomes 108 — a grid radiates out from a single centre.                        |
| 07  | scene-spacing     | 108 metres apart — measured against a scaled human, a rugby pitch.                         |
| 08  | scene-river       | The Mau Chhu corridor — the line drawn on the river map.                                   |
| 09  | scene-stack       | Stacked, the 108 chortens reach 1.62 km — taller than Burj Khalifa.                        |
| 10  | scene-time        | A timeline from announcement (21 Feb 2026) to completion (1 Nov 2026).                     |
| 11  | scene-manpower    | Project 108 vs. the Pyramid, the Taj, the Great Wall — one day, 40,000 volunteers.         |
| 12  | scene-volunteers  | 40,000 hands across 108 sites — the body of the build.                                     |
| 13  | scene-completion  | The closing tableau: 108 chortens lit along the river at dusk. "One day. One offering."    |
| 14  | scene-invitation  | Two ways to take part — Patronage and Volunteer.                                           |

A sticky `.colophon` footer follows, with credits to His Majesty, the Gelephu Mindfulness City Authority, and contact lines.

## How the scrollytelling works

Each scene is a tall section (typically 1.5–3 viewport-heights) containing a `position: sticky` `.stage` that pins for the duration. A central rAF loop in `scrollytelling.js` computes a `0..1` progress value for every scene per frame and calls a per-scene `update(p)` handler that drives CSS custom properties (`--p`) on the parts that need to animate. Almost all motion is CSS-driven from those vars; the JS is just the conductor.

Caption bar (`top` of viewport) shows scene number / label / act, updated as the active pinned scene changes.

## Type & colour system

- **Display:** Cormorant Garamond — for headlines and the 108 numeral; old-style numerals (`onum`) where it shows.
- **Body:** Crimson Pro — for paragraph text and lede.
- **Utility:** IBM Plex Mono — for micro-labels, eyebrows, captions, and meta lines (uppercase, wide tracking).
- **Palette:** deep maroon ground (`--maroon-deep`, `--maroon-deeper`), warm gold (`--gold`, `--gold-bright`, `--gold-warm`), cream type (`--cream`). No bright primaries; everything sits in the maroon/gold/cream triad.

## What I'd polish next (out of scope for this pass)

These were on the working list and are partly addressed but worth a second pass:

1. **Title scene restraint** — the eyebrow + caption + meta block under the numeral is informative but slightly overloaded. Consider losing the meta strip and pushing it to the caption bar.
2. **What-is-a-chorten** — the four "truths" appear simultaneously; staggering them more dramatically (or replacing with one centred line that morphs) would feel less list-like.
3. **Assembly fidelity** — the seven parts are drawn as schematic boxes/arches. Replacing with traced silhouettes from the brochure's chorten illustration would lift this scene a lot.
4. **Why-108 chapter visuals** — the mala / marma diagrams are stylised dot-fields; could be replaced with proper anatomical diagrams.
5. **Three names / Why 108 in Bhutan** — the brochure devotes a section to the number 108's significance specifically in Bhutanese / Vajrayana practice (108 temples of King Songtsen Gampo). This could be its own beat.
6. **Volunteer activation density** — the 40,000-hands scene reads as a single image; it could carry small live counters or rolling site-by-site labels for more density.
7. **Completion tableau** — currently 108 small chortens light up along a river silhouette. With more time, a longer, more cinematic camera move (e.g. the line lighting from upstream to down across two screens of scroll) would pay off.

## Known gotcha

The page relies on `requestAnimationFrame` for the scroll loop; in headless screenshot environments where `document.hidden` is true, rAF is paused and per-scene progress doesn't advance. The page exposes `window.__p108Tick()` which can be called manually from any harness to advance one frame for verification. Real users in a real tab are unaffected.
