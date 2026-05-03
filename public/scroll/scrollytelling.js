/* ============================================================
   Project 108 — Cinematic Scrollytelling
   Scroll controller for index.html
   ============================================================ */
(function () {
  "use strict";

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion:reduce)",
  ).matches;

  /* ---------------- Helpers ---------------- */
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  /* ---------------- Scenes registry ----------------
     Each scene exposes a sticky `<div class="stage">` inside a
     tall section. We compute scroll progress (0..1) for the
     section's pinned region and call its `update(p)` handler.
  ---------------------------------------------------- */
  const sceneDefs = []; // {el, label, num, act, update}

  function registerScene({ selector, label, num, act, update }) {
    const el = document.querySelector(selector);
    if (!el) return;
    sceneDefs.push({ el, label, num, act, update: update || (() => {}) });
  }

  /* ---------------- Caption + rail ---------------- */
  const captionNum = document.querySelector(".caption-bar .num");
  const captionLbl = document.querySelector(".caption-bar .lbl");
  const railFill = document.querySelector(".rail__fill");

  let lastSceneIdx = -1;

  function setActiveScene(idx) {
    if (idx === lastSceneIdx) return;
    const s = sceneDefs[idx];
    if (!s) return;
    if (captionNum) captionNum.textContent = s.num;
    if (captionLbl) captionLbl.textContent = s.label;
    lastSceneIdx = idx;
  }

  /* ---------------- Scene-specific setup ---------------- */

  // Scene 01 — Title
  registerScene({
    selector: ".scene-title",
    label: "Project 108",
    num: "01 / 15",
    act: "I — The Sacred Object",
  });

  // Scene 02 — What is a chorten?
  registerScene({
    selector: ".scene-what",
    label: "What is a chorten?",
    num: "02 / 15",
    act: "I — The Sacred Object",
    update(p) {
      const stg = document.querySelector(".scene-what .what-chorten");
      if (stg) stg.style.setProperty("--p", clamp(p));
      const truths = document.querySelectorAll(".scene-what .truth");
      // Stagger four truths over progress 0.15..0.95
      truths.forEach((el, i) => {
        const start = 0.15 + i * 0.18;
        const lit = p > start;
        el.classList.toggle("show", lit);
      });
    },
  });

  // Scene 03 — Chorten Assembly (7 parts)
  registerScene({
    selector: ".scene-assembly",
    label: "Seven sacred elements",
    num: "03 / 15",
    act: "I — The Sacred Object",
    update(p) {
      const parts = document.querySelectorAll(".scene-assembly .assy-part");
      const items = document.querySelectorAll(".scene-assembly .assy-item");
      const N = 7;
      // Stagger each part across progress segments. Each part takes 1/N
      // of the scroll, with a small overlap.
      parts.forEach((el) => {
        const i = parseInt(el.dataset.part, 10) - 1; // 0..6
        const start = (i / N) * 0.9; // 0 .. 0.9
        const end = start + 0.15;
        const t = clamp((p - start) / (end - start));
        el.style.setProperty("--p", easeOut(t));
      });
      items.forEach((el) => {
        const i = parseInt(el.dataset.part, 10) - 1; // 0..6
        const start = (i / N) * 0.9 + 0.04;
        const t = clamp((p - start) / 0.12);
        el.style.setProperty("--p", t);
        el.classList.toggle("lit", t > 0.8);
      });
    },
  });

  // Scene 04 — How tall is 15 metres?
  registerScene({
    selector: ".scene-scale",
    label: "How tall is fifteen metres?",
    num: "04 / 15",
    act: "I — The Sacred Object",
    update(p) {
      const wrap = document.querySelector(".scene-scale .scale-scrolly");
      const art = document.querySelector(".scene-scale .scale-art");
      if (art) art.style.setProperty("--p", clamp(p));
      if (!wrap) return;
      // Figure reveal thresholds: person 0.10, building 0.40, chorten 0.70
      const figs = wrap.querySelectorAll(".scale-fig");
      const thresholds = [0.08, 0.38, 0.66];
      figs.forEach((f, i) => {
        const t = thresholds[i] || 0;
        const local = clamp((p - t) / 0.18);
        f.style.setProperty("--on", local);
      });
      // data-stage drives tick visibility
      let stage = 0;
      if (p >= thresholds[0]) stage = 1;
      if (p >= thresholds[1]) stage = 2;
      if (p >= thresholds[2]) stage = 3;
      wrap.setAttribute("data-stage", String(stage));
    },
  });

  // Scene 05 — Why 108? (multi-chapter pinned scene)
  // Five chapters: A astronomy, B buddhism, C hinduism, D math, E project
  const WHY_CHAPTERS = ["A", "B", "C", "D", "E"];
  registerScene({
    selector: ".scene-why",
    label: "Why 108?",
    num: "05 / 15",
    act: "II — The Sacred Number",
    update(p) {
      // Anchor visibility: hide during chapter content, return at hand-offs
      // Chapters span: A 0.05–0.22, B 0.24–0.41, C 0.43–0.58, D 0.60–0.75, E 0.78–0.98
      const ranges = [
        ["A", 0.05, 0.22],
        ["B", 0.24, 0.41],
        ["C", 0.43, 0.58],
        ["D", 0.6, 0.75],
        ["E", 0.78, 0.98],
      ];
      let anchorP = 1;
      let anchorS = 1;
      let activeChap = null;
      ranges.forEach(([id, a, b]) => {
        const inside = p >= a && p <= b;
        if (inside) activeChap = id;
        // Within a chapter, suppress the anchor (chapter visuals take over).
        if (inside) anchorP = 0.15;
      });

      // First & last beats: anchor is large + bold
      if (p < 0.05) {
        anchorP = 1;
        anchorS = 1;
      } else if (p > 0.98) {
        anchorP = 1;
        anchorS = 1.1;
      }

      const anchor = document.querySelector(".why-anchor");
      if (anchor) {
        anchor.style.setProperty("--p", anchorP);
        anchor.style.setProperty("--s", anchorS);
      }

      document.querySelectorAll(".why-chapter").forEach((c) => {
        const id = c.dataset.chap;
        c.classList.toggle("active", id === activeChap);
      });

      // Buddhism / Hinduism line ticking
      const tickLines = (chap, range) => {
        const c = document.querySelector(`.why-chapter[data-chap="${chap}"]`);
        if (!c) return;
        const lines = c.querySelectorAll(".lines span");
        const [a, b] = range;
        const local = clamp((p - a) / (b - a));
        lines.forEach((ln, i) => {
          const t = i / lines.length;
          ln.classList.toggle("lit", local > t);
        });
      };
      tickLines("B", [0.24, 0.41]);
      tickLines("C", [0.43, 0.58]);

      // Project chapter — 108 dots
      const projC = document.querySelector('.why-chapter[data-chap="E"]');
      if (projC) {
        const dots = projC.querySelectorAll(".dot");
        const [a, b] = [0.78, 0.98];
        const local = clamp((p - a) / (b - a));
        const litCount = Math.floor(local * dots.length);
        dots.forEach((d, i) => d.classList.toggle("lit", i < litCount));
      }
    },
  });

  // Scene 06 — One becomes 108 (12 cols × 9 rows = 108 cells)
  registerScene({
    selector: ".scene-multiply",
    label: "One sacred form, repeated",
    num: "06 / 15",
    act: "III — The Sacred Formation",
    update(p) {
      const cells = document.querySelectorAll(".scene-multiply .cg-cell");
      // Define multiplication waves: 1 → 3 → 9 → 27 → 54 → 108
      // Mapping each step to a progress range
      const steps = [
        { at: 0.05, n: 1 },
        { at: 0.22, n: 3 },
        { at: 0.38, n: 9 },
        { at: 0.54, n: 27 },
        { at: 0.7, n: 54 },
        { at: 0.86, n: 108 },
      ];
      // Determine current target count
      let target = 1;
      for (const s of steps) {
        if (p >= s.at) target = s.n;
      }
      // Sequence cells from center outwards
      const ordered = window.__multiplyOrder || [];
      cells.forEach((el, i) => {
        const order = ordered[i] != null ? ordered[i] : i;
        el.classList.toggle("lit", order < target);
      });
      // Update copy
      const numEl = document.querySelector(
        ".scene-multiply .multiply-copy .num",
      );
      if (numEl) numEl.textContent = target;
    },
  });

  // Scene 07 — 108 m apart
  registerScene({
    selector: ".scene-spacing",
    label: "108 metres apart",
    num: "07 / 15",
    act: "III — The Sacred Formation",
    update(p) {
      const tr = document.querySelector(".scene-spacing .spacing-track");
      const measure = document.querySelector(".scene-spacing .spacing-measure");

      // Three phases:
      // 0.00 → 0.35 : chortens zoom in (approach each other)
      // 0.35 → 0.65 : HOLD position — 108 m line appears
      // 0.65 → 1.00 : 108 m line fades, zoom-out resumes
      let trackP;
      if (p < 0.35) {
        // Approach: advance to ~45% of max zoom
        trackP = clamp(p / 0.35) * 0.45;
      } else if (p < 0.65) {
        // Pause: freeze position
        trackP = 0.45;
      } else {
        // Resume: continue from 45% to 100%
        trackP = 0.45 + clamp((p - 0.65) / 0.35) * 0.55;
      }
      if (tr) tr.style.setProperty("--p", trackP);

      // 108 m measure line: fades in at pause start, holds, fades out as zoom resumes
      if (measure) {
        const fadeIn = clamp((p - 0.32) / 0.08); // 0.32 → 0.40
        const fadeOut = 1 - clamp((p - 0.6) / 0.08); // 0.60 → 0.68
        const measureP = Math.min(fadeIn, fadeOut);
        measure.style.setProperty("--p", measureP);
        measure.style.setProperty("--zoom", 0);
      }
    },
  });

  // Scene 08 — A line along the Mau Chhu
  registerScene({
    selector: ".scene-river",
    label: "A line along the Mau Chhu",
    num: "08 / 15",
    act: "III — The Sacred Formation",
    update(p) {
      const photo = document.querySelector(".scene-river .river-photo");
      const path = document.querySelector(".scene-river .river-path");
      if (photo) photo.style.setProperty("--p", clamp((p - 0.05) / 0.3));
      if (path) path.style.setProperty("--p", clamp((p - 0.15) / 0.55));
      // Markers light along path
      const markers = document.querySelectorAll(".scene-river .river-marker");
      const isMobile = window.innerWidth <= 768;
      const litCount = Math.floor(clamp((p - 0.35) / 0.55) * markers.length);
      markers.forEach((m, i) =>
        m.classList.toggle(
          "lit",
          isMobile ? i < litCount : i >= markers.length - litCount,
        ),
      );
    },
  });

  // Scene 09 — Stacked height (1.62 km)
  registerScene({
    selector: ".scene-stack",
    label: "Stacked height: 1.62 km",
    num: "09 / 15",
    act: "IV — The Scale of the Offering",
    update(p) {
      const col = document.querySelector(".scene-stack .stack-column");
      const intro = document.querySelector(".scene-stack .stack-intro");
      const finalEl = document.querySelector(".scene-stack .stack-final");
      const counter = document.querySelector(".stack-counter");
      const units = document.querySelectorAll(".scene-stack .stack-unit");

      // Light units sequentially
      const N = units.length;
      const litCount = Math.floor(clamp((p - 0.03) / 0.85) * N);
      units.forEach((u, i) => u.classList.toggle("lit", i < litCount));

      // Translate the column upward as it fills, faster as we approach end.
      // Each unit is ~14px tall; total internal height ≈ N * 15.
      // We want the *top* of the stack to stay visible — so as the stack
      // grows, the column translates upward enough to keep the topmost unit
      // near the top of the viewport.
      const colTotal = N * 15; // px (matches CSS)
      const visibleH = window.innerHeight * 0.82;
      const overshoot = Math.max(0, colTotal - visibleH);
      const yPx = -overshoot * clamp((p - 0.15) / 0.7);
      if (col) col.style.setProperty("--y", yPx);

      // Reference markers (Pyramid / Eiffel / Burj) — fixed Y on the column.
      // Positions correspond to: pyramid 9, eiffel 22, burj 55, top 108
      const refs = document.querySelectorAll(".scene-stack .stack-ref");
      // Find the highest unit threshold the stack has crossed
      const refUnits = Array.from(refs).map(
        (r) => parseInt(r.dataset.unit, 10) || 0,
      );
      const activeUnit = refUnits.filter((u) => litCount >= u).pop() || null;
      refs.forEach((r) => {
        const u = parseInt(r.dataset.unit, 10) || 0;
        // Only light the most recently crossed ref
        r.classList.toggle("lit", u === activeUnit);
      });

      // Hide the stack column whenever any reference card is visible
      if (col) {
        col.style.opacity = activeUnit !== null ? "0" : "";
      }

      // Live counter
      if (counter) {
        counter.style.setProperty("--p", clamp((p - 0.04) / 0.15));
        const h = counter.querySelector(".h");
        if (h) {
          const meters = Math.floor(litCount * 15);
          if (meters >= 1000) {
            h.textContent = (meters / 1000).toFixed(2) + " km";
          } else {
            h.textContent = meters + " m";
          }
        }
      }

      // Intro fades out, final reveal fades in
      if (intro) intro.style.setProperty("--p", clamp(1 - (p - 0.25) / 0.2));
      if (finalEl) finalEl.style.setProperty("--p", clamp((p - 0.82) / 0.12));
    },
  });

  // Scene 10 — Time of construction
  registerScene({
    selector: ".scene-time",
    label: "Prepared over time, completed together",
    num: "10 / 15",
    act: "V — The Human Achievement",
    update(p) {
      const fill = document.querySelector(".scene-time .time-fill");
      if (fill) fill.style.setProperty("--p", clamp(p * 1.1));
      const markers = document.querySelectorAll(".scene-time .time-marker");
      markers.forEach((el, i) => {
        const at = parseFloat(el.dataset.at) || i / markers.length;
        const t = clamp((p - at + 0.04) / 0.12);
        el.style.setProperty("--p", t);
        el.classList.toggle("lit", t > 0.9);
      });
    },
  });

  // Scene 11 — Manpower comparison
  registerScene({
    selector: ".scene-manpower",
    label: "Manpower across history",
    num: "11 / 15",
    act: "V — The Human Achievement",
    update(p) {
      const rows = document.querySelectorAll(".scene-manpower .manpower-row");
      rows.forEach((el, i) => {
        const start = i * 0.14;
        const t = clamp((p - start) / 0.25);
        el.style.setProperty("--p", t);
      });
    },
  });

  // Scene 12 — 40,000 volunteers activate 108 sites
  registerScene({
    selector: ".scene-volunteers",
    label: "Forty thousand · one hundred and eight",
    num: "12 / 15",
    act: "V — The Human Achievement",
    update(p) {
      const sites = document.querySelectorAll(".vol-site");
      const flows = document.querySelectorAll(".vol-flow");
      const N = sites.length;
      const litCount = Math.floor(clamp((p - 0.05) / 0.85) * N);
      sites.forEach((s, i) => {
        // Activate clusters: 1, then 5, then 20, then 60, then all
        s.classList.toggle("active", i < litCount);
      });
      const fLit = Math.floor(clamp((p - 0.15) / 0.65) * flows.length);
      flows.forEach((f, i) => f.classList.toggle("active", i < fLit));

      // Counter
      const counterNum = document.querySelector(".vol-counter .num");
      if (counterNum) {
        const peopleTarget = 40000;
        const sitesActive = Math.min(N, litCount);
        // Show people OR sites depending on phase
        if (p < 0.55) {
          counterNum.textContent = sitesActive;
          counterNum.dataset.label = "sites lit";
        } else {
          // Tween up to 40,000 in the second half
          const t = clamp((p - 0.55) / 0.4);
          const v = Math.floor(easeOut(t) * peopleTarget);
          counterNum.textContent = v.toLocaleString();
        }
      }
      const denomEl = document.querySelector(".vol-counter .denom");
      if (denomEl) {
        denomEl.innerHTML =
          p < 0.55
            ? `<strong>108</strong> sites · across the corridor`
            : `volunteers · <strong>40,000</strong> across <strong>108</strong> sites`;
      }
    },
  });

  // Scene 13 — Completion (golden light sweeps the procession)
  registerScene({
    selector: ".scene-completion",
    label: "108 chortens · one day · one offering",
    num: "13 / 15",
    act: "VI — The Invitation",
    update(p) {
      const light = document.querySelector(".scene-completion .compl-light");
      const track = document.querySelector(".scene-completion .compl-track");
      const copy = document.querySelector(".scene-completion .compl-copy");
      if (light) light.style.setProperty("--p", clamp(p));
      // Light each chorten as the wave passes
      const chortens = document.querySelectorAll(".compl-chorten");
      const perRow = 36;
      const litCols = Math.floor(clamp(p * 1.05) * perRow);
      chortens.forEach((c) => {
        const col = parseInt(c.dataset.index) % perRow;
        c.classList.toggle("lit", col < litCols);
      });
      if (copy) copy.style.setProperty("--p", clamp((p - 0.15) / 0.2));
    },
  });

  // Scene 14 — His Majesty's quote (second-last)
  registerScene({
    selector: ".scene-gesture",
    label: "A Royal initiative",
    num: "14 / 15",
    act: "VI — The Invitation",
    update(p) {
      const block = document.querySelector(".scene-gesture .gesture-block");
      if (block) block.style.setProperty("--p", clamp(p));
    },
  });

  // Scene 15 — Invitation
  registerScene({
    selector: ".scene-invitation",
    label: "Two ways to take part",
    num: "15 / 15",
    act: "VI — The Invitation",
    update(p) {},
  });

  /* ---------------- Multiplication grid setup ---------------- */
  // Build cells in DOM and compute centre-out order so the wave
  // looks like petals opening from the middle.
  function buildMultiplyGrid() {
    const grid = document.querySelector(".scene-multiply .chorten-grid");
    if (!grid) return;
    const cols = 18,
      rows = 6; // 108 cells
    const cx = (cols - 1) / 2,
      cy = (rows - 1) / 2;
    const cells = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = document.createElement("div");
        cell.className = "cg-cell";
        if (r === Math.floor(cy) && c === Math.floor(cx))
          cell.classList.add("center");
        cell.innerHTML = window.__chortenMiniSVG;
        // Random positional offset on the img inside the cell (no rotation, stays upright)
        const img = cell.querySelector("img");
        if (img) {
          const rx = (Math.random() - 0.5) * 50; // ±25% horizontal
          const ry = (Math.random() - 0.5) * 50; // ±25% vertical
          img.style.transform = `translate(${rx}%, ${ry}%)`;
        }
        // Distance from centre with slight jitter to break perfect rings
        const dx = c - cx,
          dy = r - cy;
        const dist = Math.sqrt(dx * dx + dy * dy) + Math.random() * 0.15;
        cells.push({ el: cell, dist, idx: r * cols + c });
        grid.appendChild(cell);
      }
    }
    // Sort by dist, then assign order
    const sorted = [...cells].sort((a, b) => a.dist - b.dist);
    const order = new Array(cells.length);
    sorted.forEach((c, i) => {
      order[c.idx] = i;
    });
    window.__multiplyOrder = order;
  }

  /* ---------------- Spacing track setup ---------------- */
  function buildSpacingTrack() {
    const track = document.querySelector(".scene-spacing .spacing-row");
    if (!track) return;
    // Render ~25 chortens to suggest the procession; CSS scales the row
    const html = [];
    for (let i = 0; i < 27; i++) {
      html.push(`<div class="chorten-mini">${window.__chortenMiniSVG}</div>`);
    }
    track.innerHTML = html.join("");
  }

  /* ---------------- River SVG path setup ---------------- */
  function buildRiverPath() {
    const svg = document.querySelector(".scene-river .river-svg");
    if (!svg) return;
    const w = 1200,
      h = 700;
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    const isMobile = window.innerWidth <= 768;
    svg.setAttribute(
      "preserveAspectRatio",
      isMobile ? "xMidYMid meet" : "xMidYMid slice",
    );
    // Mobile path is rebuilt from scratch to match rectification3's trajectory;
    // desktop keeps the existing upper-left bend composition.
    const d = isMobile
      ? `M -40 ${h * 0.56}
        C 95 ${h * 0.6}, 250 ${h * 0.67}, 400 ${h * 0.78}
        C 520 ${h * 0.88}, 600 ${h * 0.98}, 660 ${h * 1.08}
        C 730 ${h * 1.19}, 805 ${h * 1.31}, 900 ${h * 1.37}
        C 980 ${h * 1.42}, 1080 ${h * 1.47}, ${w + 110} ${h * 1.49}`
      : `M ${w - 560} ${h * 0.76}
        C ${w - 600} ${h * 0.74}, ${w - 660} ${h * 0.64}, ${w - 800} ${h * 0.52}
        C ${w - 900} ${h * 0.43}, ${w - 965} ${h * 0.4}, ${w - 1015} ${h * 0.36}
        C ${w - 1060} ${h * 0.32}, ${w - 1085} ${h * 0.28}, ${w - 1035} ${h * 0.27}`;
    const ns = "http://www.w3.org/2000/svg";
    const path = document.createElementNS(ns, "path");
    path.setAttribute("d", d);
    path.setAttribute("class", "river-path");
    svg.appendChild(path);
    const len = path.getTotalLength();
    path.setAttribute("stroke-dasharray", len);
    path.style.setProperty("--len", len);
    const styleNode = document.createElement("style");
    styleNode.textContent = `.scene-river .river-path{stroke-dasharray:${len};stroke-dashoffset:calc(${isMobile ? "" : "-"}${len} * (1 - var(--p,0)))}`;
    document.head.appendChild(styleNode);

    // Place fewer chorten markers along the river path.
    const riverMarkerCount = isMobile ? 20 : 35;
    const markerSize = isMobile ? 58 : 18;
    for (let i = 0; i < riverMarkerCount; i++) {
      const t = i / (riverMarkerCount - 1);
      const pt = path.getPointAtLength(t * len);
      const m = document.createElementNS(ns, "image");
      m.setAttribute("href", "/assets/chorten.png");
      m.setAttribute("x", (pt.x - markerSize / 2).toFixed(1));
      m.setAttribute("y", (pt.y - markerSize / 2).toFixed(1));
      m.setAttribute("width", String(markerSize));
      m.setAttribute("height", String(markerSize));
      m.setAttribute("class", "river-marker");
      svg.appendChild(m);
    }
  }

  /* ---------------- Stack column setup ---------------- */
  function buildStackColumn() {
    const col = document.querySelector(".scene-stack .stack-column");
    if (!col) return;
    const N = 108;
    const html = [];
    for (let i = 0; i < N; i++) {
      html.push(`<div class="stack-unit">${window.__chortenMiniSVG}</div>`);
    }
    col.innerHTML = html.join("");
    // Stars
    const stars = document.querySelector(".stack-stars");
    if (stars) {
      const s = [];
      for (let i = 0; i < 60; i++) {
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const o = 0.4 + Math.random() * 0.5;
        s.push(
          `<div class="stack-star" style="left:${x}%;top:${y}%;opacity:${o}"></div>`,
        );
      }
      stars.innerHTML = s.join("");
    }
  }

  /* ---------------- Volunteers SVG setup ---------------- */
  function buildVolunteersSVG() {
    const svg = document.querySelector(".scene-volunteers .vol-svg");
    if (!svg) return;
    const w = 1200,
      h = 700;
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.setAttribute(
      "preserveAspectRatio",
      window.innerWidth <= 768 ? "xMidYMid meet" : "xMidYMid slice",
    );
    const ns = "http://www.w3.org/2000/svg";
    // Graceful corridor curve — same shape as river-svg
    const d = `M 30 ${h * 0.78}
               C 180 ${h * 0.74}, 280 ${h * 0.5}, 420 ${h * 0.52}
               C 560 ${h * 0.54}, 660 ${h * 0.66}, 800 ${h * 0.52}
               C 940 ${h * 0.4}, 1040 ${h * 0.36}, ${w - 30} ${h * 0.34}`;
    const guide = document.createElementNS(ns, "path");
    guide.setAttribute("d", d);
    guide.setAttribute("fill", "none");
    guide.setAttribute("stroke", "rgba(200,166,99,0.18)");
    guide.setAttribute("stroke-width", "1");
    guide.setAttribute("stroke-dasharray", "3 6");
    svg.appendChild(guide);
    const len = guide.getTotalLength();
    // 108 sites
    for (let i = 0; i < 108; i++) {
      const pt = guide.getPointAtLength((i / 107) * len);
      const c = document.createElementNS(ns, "circle");
      c.setAttribute("cx", pt.x.toFixed(1));
      c.setAttribute("cy", pt.y.toFixed(1));
      c.setAttribute("r", "3.2");
      c.setAttribute("class", "vol-site");
      svg.appendChild(c);
    }
    // Soft halo rings (no criss-crossing lines) — they pulse outward at each site
    for (let i = 0; i < 12; i++) {
      const idx = i * 9 + 4;
      const pt = guide.getPointAtLength((idx / 107) * len);
      const ring = document.createElementNS(ns, "circle");
      ring.setAttribute("cx", pt.x.toFixed(1));
      ring.setAttribute("cy", pt.y.toFixed(1));
      ring.setAttribute("r", "14");
      ring.setAttribute("class", "vol-flow");
      svg.appendChild(ring);
    }
  }

  /* ---------------- Completion track setup ---------------- */
  function buildCompletionTrack() {
    const track = document.querySelector(".scene-completion .compl-track");
    if (!track) return;
    const rows = 3;
    const perRow = 36; // 3 × 36 = 108
    let html = "";
    for (let r = 0; r < rows; r++) {
      html += `<div class="compl-row">`;
      for (let i = 0; i < perRow; i++) {
        html += `<div class="compl-chorten" data-index="${r * perRow + i}">${window.__chortenMiniSVG}</div>`;
      }
      html += `</div>`;
    }
    track.innerHTML = html;
  }

  /* ---------------- Why-108 dots ---------------- */
  function buildWhyDots() {
    const wrap = document.querySelector(
      '.why-chapter[data-chap="E"] .dots-field',
    );
    if (!wrap) return;
    const html = [];
    for (let i = 0; i < 108; i++) html.push('<div class="dot"></div>');
    wrap.innerHTML = html.join("");
  }

  /* ---------------- Main scroll loop ---------------- */
  function tick() {
    const scrollY = window.scrollY || window.pageYOffset;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    if (railFill) railFill.style.width = clamp(scrollY / docH) * 100 + "%";

    if (scrollY > 50) document.body.classList.add("scrolled");
    else document.body.classList.remove("scrolled");

    // For each scene, compute progress through its scrollable region.
    // Pinned region: scene's bounding-rect top is between 0 and -(scene.height - vh).
    let activeIdx = 0;
    sceneDefs.forEach((s, i) => {
      const r = s.el.getBoundingClientRect();
      const sceneH = s.el.offsetHeight;
      const vh = window.innerHeight;
      // Progress: how far past the top we are, vs how much can be travelled.
      const travelled = -r.top;
      const travel = Math.max(1, sceneH - vh);
      const p = clamp(travelled / travel);
      s.update(p);
      // Active scene = the one whose stage is currently pinned (top<=0<bottom)
      if (
        r.top <= window.innerHeight * 0.5 &&
        r.bottom > window.innerHeight * 0.5
      ) {
        activeIdx = i;
      }
      // Mark scenes that are fully past so their absolute children (e.g. stack-final)
      // don't bleed into following scenes.
      const isPast = r.bottom < window.innerHeight * 0.5;
      s.el.classList.toggle("is-past", isPast);
    });
    setActiveScene(activeIdx);

    requestAnimationFrame(tick);
  }

  /* ---------------- Init ---------------- */
  function init() {
    // Mini chorten image used throughout (multiplication, spacing, stack, completion)
    window.__chortenMiniSVG = `<img src="/assets/chorten.png" alt="" draggable="false" style="width:100%;height:100%;object-fit:contain;display:block;" />`;

    // Build dynamic content
    buildMultiplyGrid();
    buildSpacingTrack();
    buildRiverPath();
    buildStackColumn();
    buildVolunteersSVG();
    buildCompletionTrack();
    buildWhyDots();

    if (reducedMotion) {
      // Don't run the rAF loop; show captions for the very first scene only.
      setActiveScene(0);
      // Force final-state on each scene for clarity.
      sceneDefs.forEach((s) => {
        try {
          s.update(1);
        } catch (e) {}
      });
      return;
    }
    requestAnimationFrame(tick);
  }

  // Expose tick for screenshot harnesses where rAF is paused (document.hidden).
  window.__p108Tick = tick;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
