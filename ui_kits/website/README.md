# Project 108 — Website UI Kit

A high-fidelity recreation of the Project 108 brochure website (`gmc.bt/108`) — the long-read marketing site for the 108 Jangchub Chortens initiative.

This kit reproduces the canonical sections from `Project 108-scroll/prototype/index.html`: nav, hero, stat strip, project section with quote, cream chorten section, glossary (3 names), readiness cards, take-part split, contact, footer, and the participate modal.

## Files

- `index.html` — interactive demo. Click "Take Part" / "Become a Patron" / "Join the Build" to open the modal; pre-fills the radio based on which CTA you clicked. ESC / overlay click closes.
- `Nav.jsx`, `Hero.jsx`, `StatStrip.jsx`, `Section.jsx`, `Glossary.jsx`, `ReadinessCards.jsx`, `TakePart.jsx`, `Contact.jsx`, `Footer.jsx`, `Modal.jsx` — JSX components, each small and reusable.

## Source

Visuals lifted from the prototype HTML/CSS verbatim (palette, type, spacing, padding, hairlines). SVG assets are the brochure-extracted vectors copied into `/assets`. No invented design.
