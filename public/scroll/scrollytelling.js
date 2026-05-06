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
      let anchorP = 0;
      let anchorS = 1;
      let activeChap = null;
      ranges.forEach(([id, a, b]) => {
        const inside = p >= a && p <= b;
        if (inside) activeChap = id;
      });

      // Only show anchor before the first chapter
      if (p < 0.05) {
        anchorP = 1;
        anchorS = 1;
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
      const total = document.querySelector(".scene-spacing .spacing-total");
      const row = document.querySelector(".scene-spacing .spacing-row");
      const chortens = row ? row.querySelectorAll(".chorten-mini") : [];
      const N = chortens.length; // 108

      // Four phases:
      // 0.00 → 0.25 : zoom in to center 2 chortens
      // 0.25 → 0.45 : HOLD — show center 4, 108 m line appears between middle 2
      // 0.45 → 0.75 : reveal all 108 chortens from sides, gap shrinks
      // 0.75 → 1.00 : HOLD — all 108 shown, ~11.7km line appears across full row
      let trackP;
      if (p < 0.25) {
        trackP = clamp(p / 0.25) * 0.45;
      } else if (p < 0.45) {
        trackP = 0.45; // first hold
      } else if (p < 0.75) {
        trackP = 0.45 + clamp((p - 0.45) / 0.3) * 0.55;
      } else {
        trackP = 1.0; // second hold — fully zoomed out
      }
      if (tr) tr.style.setProperty("--p", trackP);

      // Gap: 38vw desktop / 40vw mobile through first hold, then shrinks to 1vw
      const isMobile = window.innerWidth <= 768;
      const maxGap = isMobile ? 65 : 38;

      // Reveal chortens symmetrically from center outward
      let revealRadius;
      if (p < 0.25) {
        revealRadius = 1; // show center 2
      } else if (p < 0.45) {
        revealRadius = isMobile ? 1 : 2; // mobile: keep 2; desktop: show 4
      } else {
        const t = clamp((p - 0.45) / 0.3);
        revealRadius = 2 + t * (N / 2 - 2); // 2 → 54 (all)
      }
      chortens.forEach((c, i) => {
        const dist = Math.abs(i - (N / 2 - 0.5));
        c.style.setProperty("--vis", dist < revealRadius ? 1 : 0);
      });

      let gapVw;
      if (p < 0.45) {
        gapVw = maxGap;
      } else {
        const t = clamp((p - 0.45) / 0.3);
        gapVw = maxGap - t * (maxGap - 1); // maxGap → 1vw
      }
      if (row) row.style.setProperty("--gap", gapVw + "vw");

      // 108 m measure line: fades in during first hold, fades out as zoom resumes
      if (measure) {
        const fadeIn = clamp((p - 0.27) / 0.06);
        const fadeOut = 1 - clamp((p - 0.42) / 0.06);
        const measureVis = Math.min(fadeIn, fadeOut);
        measure.style.setProperty("--vis", measureVis);
        measure.style.setProperty("--p", trackP);
      }

      // ~11.7 km total line: fades in during second hold
      if (total) {
        const fadeIn = clamp((p - 0.78) / 0.08);
        const fadeOut = 1 - clamp((p - 0.96) / 0.04);
        total.style.setProperty("--vis", Math.min(fadeIn, fadeOut));
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
    label: "Stacked: 1 → 108 chortens",
    num: "09 / 15",
    act: "IV — The Scale of the Offering",
    update(p) {
      const stageEl = document.querySelector(".scene-stack .sg-stage");
      if (!stageEl) return;
      const stageH = stageEl.offsetHeight;
      const stageW = stageEl.offsetWidth;
      const isMobile = stageW < 600;

      // Asset data — real height (m), image aspect ratio (w/h), phase start/end
      // Aspect ratios measured from actual PNG files:
      //   pyramid.png 1601×1163 → 1.3765
      //   eiffel-tower.png 1090×1588 → 0.6864
      //   building.png (Burj) 645×1454 → 0.4435
      //   stack.png 963×3508 → 0.2745
      const ASSETS = [
        {
          id: "pyramid",
          label: "Great Pyramid",
          meters: 138.5,
          aspect: 1.3765,
          start: 0.0,
          end: 0.2,
        },
        {
          id: "eiffel",
          label: "Eiffel Tower",
          meters: 330,
          aspect: 0.6864,
          start: 0.1,
          end: 0.32,
        },
        {
          id: "burj",
          label: "Burj Khalifa",
          meters: 828,
          aspect: 0.4435,
          start: 0.21,
          end: 0.46,
        },
        {
          id: "stack",
          label: "108 Chortens",
          meters: 1620,
          aspect: 0.2745,
          start: 0.335,
          end: 0.6,
        },
      ];

      const TOTAL_M = 1620;
      const GAP_PX = isMobile ? 10 : 120;
      const TOTAL_GAPS = GAP_PX * (ASSETS.length - 1);

      // Scale factor: pick the tighter of height-based or width-based constraints
      // so all four assets always fit on screen simultaneously at final sizes.
      const totalWidthM = ASSETS.reduce((s, a) => s + a.meters * a.aspect, 0);
      const pxPerM_h = (stageH * (isMobile ? 0.72 : 0.84)) / TOTAL_M;
      const pxPerM_w =
        (stageW * (isMobile ? 0.85 : 0.82) - TOTAL_GAPS) / totalWidthM;
      const pxPerM = Math.min(pxPerM_h, pxPerM_w);

      // Landmark assets enter tall then shrink; stack grows from tiny.
      const ENTER_H = stageH * (isMobile ? 0.55 : 0.7);

      // Rulers fade in during the "scroll-stop" hold phase (p 0.63 → 0.82)
      const RULER_P = clamp((p - 0.63) / 0.19);

      // Tally — label of the last asset whose phase has started
      const labelEl = document.querySelector(".scene-stack .sg-phase-label");
      const heightEl = document.querySelector(".scene-stack .sg-phase-h");
      if (labelEl && heightEl) {
        let active = ASSETS[0];
        for (const a of ASSETS) {
          if (p >= a.start) active = a;
        }
        labelEl.textContent = active.label;
        const m = active.meters;
        heightEl.textContent =
          m >= 1000 ? (m / 1000).toFixed(2) + " km" : m + " m";
      }

      // ── Container pan (keeps gaps uniform) ──────────────────────────────────
      // JS owns the full X position so CSS padding doesn't conflict.
      // On mobile: start offset centres the first asset on screen; end offset
      // centres the whole group. On desktop: simple left-to-right pan.
      const assetsEl = document.querySelector(".scene-stack .sg-assets");
      if (assetsEl) {
        let panFrac;
        if (p < 0.1) panFrac = 0;
        else if (p < 0.21) panFrac = clamp((p - 0.1) / 0.11) * 0.333;
        else if (p < 0.335) panFrac = 0.333 + clamp((p - 0.21) / 0.125) * 0.333;
        else panFrac = 0.667 + clamp((p - 0.335) / 0.265) * 0.333;

        const panEase = 1 - Math.pow(1 - panFrac, 2); // quad ease-out
        const contW = assetsEl.scrollWidth;

        if (isMobile) {
          // End position: whole group centred on screen, nudged right
          const endX = (stageW - contW) / 2 + stageW * 0.08;
          // Start position: enough to the right so the first asset is centred
          const firstW =
            (assetsEl.firstElementChild &&
              assetsEl.firstElementChild.offsetWidth) ||
            contW / 4;
          const startX = stageW / 2 - firstW / 2;
          const currentX = startX + (endX - startX) * panEase;
          assetsEl.style.transform = `translateX(${currentX.toFixed(1)}px)`;
        } else {
          const maxPan = Math.max(0, contW - stageW * 0.9);
          const desktopX = -maxPan * panEase + stageW * 0.06 * panEase;
          assetsEl.style.transform = `translateX(${desktopX.toFixed(1)}px)`;
        }
      }

      ASSETS.forEach(({ id, meters, aspect, start, end }) => {
        const el = document.querySelector(
          `.scene-stack .sg-asset[data-id="${id}"]`,
        );
        if (!el) return;

        const finalH = meters * pxPerM;
        const isStack = id === "stack";
        const enterH = isStack ? finalH * 0.08 : ENTER_H;

        if (p < start) {
          el.style.display = "none";
          return;
        }
        el.style.display = "";

        const raw = clamp((p - start) / (end - start));
        const ease = 1 - Math.pow(1 - raw, 3);
        const currentH = enterH + (finalH - enterH) * ease;
        const currentW = currentH * aspect;

        el.style.height = currentH.toFixed(2) + "px";
        el.style.width = currentW.toFixed(2) + "px";
        el.style.transform = ""; // no individual translate — container handles panning
        el.style.opacity = Math.min(1, raw / 0.1).toFixed(3);

        const ruler = el.querySelector(".sg-ruler");
        if (ruler) ruler.style.opacity = RULER_P.toFixed(3);
        const name = el.querySelector(".sg-asset__name");
        if (name) name.style.opacity = RULER_P.toFixed(3);
      });
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

  // Scene 12 — 40,000 volunteers
  registerScene({
    selector: ".scene-volunteers",
    label: "Forty thousand · one hundred and eight",
    num: "12 / 15",
    act: "V — The Human Achievement",
    update(p) {
      const canvas = document.querySelector(".scene-volunteers .vol-canvas");
      if (!canvas) return;

      const TARGET = 40000;
      const HAND_COUNT = 650;
      const t = clamp((p - 0.05) / 0.9);
      const count = Math.round(t * TARGET);
      // handsToShow scales with t so the last hand appears exactly at 40,000
      const poolSize = canvas._positions
        ? canvas._positions.length
        : HAND_COUNT;
      const handsToShow = count >= TARGET ? poolSize : Math.floor(t * poolSize);

      // Counter
      const counterNum = document.querySelector(".vol-counter .num");
      const denomEl = document.querySelector(".vol-counter .denom");
      if (counterNum) counterNum.textContent = count.toLocaleString();
      if (denomEl)
        denomEl.innerHTML = `volunteers · <strong>40,000</strong> across <strong>108</strong> sites`;

      // Init: size canvas, load SVG image, pre-compute positions
      if (!canvas._volInit || canvas._volInit !== 17) {
        canvas._volInit = 17;
        canvas._rendered = 0;
        const ctx2 = canvas.getContext("2d");
        if (ctx2) ctx2.clearRect(0, 0, canvas.width || 1, canvas.height || 1);

        const stage = canvas.parentElement;
        const W = stage.offsetWidth;
        const H = stage.offsetHeight;
        canvas.width = W;
        canvas.height = H;

        const isMobile = W < 600;
        const HAND_W = isMobile ? 36 : 56;
        const HAND_H = Math.round(HAND_W * (685.18 / 1028.19));

        // Text zone boundaries
        // Mobile: vol-copy is top:8%, left:4%, width≈92%
        //   — text (kicker+h2+paragraph) ends at roughly 50% height on a phone
        // Desktop: copy block is top-left ~30% width, ~62% height
        const copyX1 = 0;
        const copyY1 = 0;
        const copyX2 = isMobile ? W * 0.85 : W * 0.3;
        const copyY2 = isMobile ? H * 0.38 : H * 0.62;
        // Counter core — the actual number text (bottom-right)
        // Mobile: counter is bottom:8%, right:4%; num is ~10vw font
        const ctrCoreX1 = isMobile ? W * 0.22 : W * 0.72;
        const ctrCoreY1 = isMobile ? H * 0.84 : H * 0.78;
        const ctrX2 = W;
        const ctrY2 = H;
        // Fringe zone around counter (allow a small cluster)
        const ctrFringeX1 = isMobile ? W * 0.05 : W * 0.42;
        const ctrFringeY1 = isMobile ? H * 0.76 : H * 0.66;

        // Allow max 8 hands in copy zone on mobile (sparse overlay looks good), 2 on desktop
        let copyCount = 0,
          ctrFringeCount = 0;

        function isBlocked(cx, cy) {
          if (cx > copyX1 && cx < copyX2 && cy > copyY1 && cy < copyY2) {
            if (copyCount >= (isMobile ? 8 : 2)) return true;
            copyCount++;
          }
          // Hard block: the actual counter text box
          if (cx > ctrCoreX1 && cx < ctrX2 && cy > ctrCoreY1 && cy < ctrY2)
            return true;
          // Pocket zone: small gap just left of counter (desktop only)
          const pocketX1 = W * 0.48,
            pocketX2 = W * 0.68;
          const pocketY1 = H * 0.63,
            pocketY2 = H * 0.85;
          // we allow it — just don't block it, so hands fall here naturally
          // Soft cluster zone to the left of the counter (excluding the pocket)
          if (
            cx > ctrFringeX1 &&
            cx < ctrCoreX1 &&
            cy > ctrFringeY1 &&
            cy < ctrY2
          ) {
            // the pocket is free; only gate the rest of the fringe
            const inPocket =
              cx > pocketX1 && cx < pocketX2 && cy > pocketY1 && cy < pocketY2;
            if (!inPocket) {
              if (ctrFringeCount >= 14) return true;
              ctrFringeCount++;
            }
          }
          return false;
        }

        // Seeded PRNG
        let seed = 0xdeadbeef;
        function rand() {
          seed |= 0;
          seed = (seed + 0x6d2b79f5) | 0;
          let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
          t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
          return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        }

        const positions = [];
        const baseMinDist = HAND_W * (isMobile ? 1.15 : 1.25);
        let attempts = 0;

        while (positions.length < HAND_COUNT && attempts < HAND_COUNT * 120) {
          attempts++;
          const x = rand() * (W - HAND_W);
          const y = rand() * (H - HAND_H);
          const cx = x + HAND_W / 2;
          const cy = y + HAND_H / 2;

          if (isBlocked(cx, cy)) continue;

          // Variable spacing: tighter in the open right half, slightly looser overall
          const densityFactor = cx > W * 0.5 ? 0.9 : 1.15;
          const minD = baseMinDist * densityFactor;
          const minD2 = minD * minD;

          let tooClose = false;
          for (let k = 0; k < positions.length; k++) {
            const dx = positions[k].x - x;
            const dy = positions[k].y - y;
            if (dx * dx + dy * dy < minD2) {
              tooClose = true;
              break;
            }
          }
          if (tooClose) continue;

          // Opacity: fade near text zones so the edge feels soft, not cut
          let alpha = 0.5 + rand() * 0.42;
          const edgeCopy = Math.max(
            0,
            Math.min(1, (copyX2 - cx) / (HAND_W * 2)),
          );
          const edgeCtr = Math.max(
            0,
            Math.min(1, (cx - ctrFringeX1) / (HAND_W * 2)),
          );
          const edgeTop = Math.max(
            0,
            Math.min(1, (copyY2 - cy) / (HAND_H * 2)),
          );
          alpha *= 1 - edgeCopy * edgeTop * 0.5;
          alpha *= 1 - edgeCtr * 0.3;

          // Scale: slightly larger in centre of screen for depth illusion
          const distFromCentre =
            Math.hypot(cx - W / 2, cy - H / 2) / Math.hypot(W / 2, H / 2);
          const scale = 0.6 + (1 - distFromCentre * 0.4) * 0.7 * rand();

          const rot = (rand() - 0.5) * 56;

          positions.push({
            x,
            y,
            rot,
            scale,
            alpha: Math.max(0.35, Math.min(0.92, alpha)),
          });
        }

        canvas._positions = positions;
        canvas._handW = HAND_W;
        canvas._handH = HAND_H;

        const img = new Image();
        img.onload = () => {
          canvas._img = img;
        };
        img.src = "/assets/2Hand.svg";
      }

      if (!canvas._img || !canvas._positions) return;

      const rendered = canvas._rendered;
      if (handsToShow === rendered) return;

      const ctx = canvas.getContext("2d");
      const positions = canvas._positions;
      const W = canvas.width;
      const H = canvas.height;
      const hw = canvas._handW;
      const hh = canvas._handH;

      function drawHand(ctx, img, pos, hw, hh) {
        const { x, y, rot, scale, alpha } = pos;
        const w = hw * scale;
        const h = hh * scale;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(x + w / 2, y + h / 2);
        ctx.rotate((rot * Math.PI) / 180);
        // Soft golden glow underneath
        ctx.shadowColor = "rgba(200, 166, 99, 0.35)";
        ctx.shadowBlur = 8 * scale;
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      if (handsToShow > rendered) {
        const end = Math.min(handsToShow, positions.length);
        for (let j = rendered; j < end; j++)
          drawHand(ctx, canvas._img, positions[j], hw, hh);
      } else {
        ctx.clearRect(0, 0, W, H);
        const end = Math.min(handsToShow, positions.length);
        for (let j = 0; j < end; j++)
          drawHand(ctx, canvas._img, positions[j], hw, hh);
      }
      canvas._rendered = handsToShow;
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
    // Render all 108 chortens; CSS zooms out to reveal the full procession
    const html = [];
    for (let i = 0; i < 108; i++) {
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

  /* ---------------- Stable viewport height ---------------- */
  // Chrome mobile changes window.innerHeight when its address bar shows/hides,
  // causing scroll progress to jump. We lock vh at the smallest observed value
  // and only update on an actual orientation/resize event after a debounce.
  let stableVH = window.innerHeight;
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      stableVH = window.innerHeight;
    }, 200);
  });

  /* ---------------- Main scroll loop ---------------- */
  function tick() {
    const scrollY = window.scrollY || window.pageYOffset;
    const docH = document.documentElement.scrollHeight - stableVH;
    if (railFill) railFill.style.width = clamp(scrollY / docH) * 100 + "%";

    if (scrollY > 50) document.body.classList.add("scrolled");
    else document.body.classList.remove("scrolled");

    // Show floating back-to-top button after scrolling past the first viewport
    const floatBtn = document.getElementById("float-top-btn");
    if (floatBtn) {
      floatBtn.classList.toggle("visible", scrollY > stableVH * 0.8);
    }

    // For each scene, compute progress through its scrollable region.
    // Pinned region: scene's bounding-rect top is between 0 and -(scene.height - vh).
    let activeIdx = 0;
    sceneDefs.forEach((s, i) => {
      const r = s.el.getBoundingClientRect();
      const sceneH = s.el.offsetHeight;
      const vh = stableVH;
      // Progress: how far past the top we are, vs how much can be travelled.
      const travelled = -r.top;
      const travel = Math.max(1, sceneH - vh);
      const p = clamp(travelled / travel);
      s.update(p);
      // Active scene = the one whose stage is currently pinned (top<=0<bottom)
      if (r.top <= stableVH * 0.5 && r.bottom > stableVH * 0.5) {
        activeIdx = i;
      }
      // Mark scenes that are fully past so their absolute children (e.g. stack-final)
      // don't bleed into following scenes.
      const isPast = r.bottom < stableVH * 0.5;
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
