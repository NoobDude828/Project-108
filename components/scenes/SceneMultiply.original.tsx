"use client";

/**
 * Dedicated controller for Scene 06 (Buddha → chorten assembly → One becomes 108).
 *
 * Animation phases (p = 0..1 across the full scene scroll):
 *   0.00–0.18  Buddha zooms out (scale 4→1) and fades in
 *   0.15–0.24  3.png (dome) fades in around Buddha
 *   0.22–0.30  Buddha fades out; 4.png (niche) fades in
 *   0.30–0.46  1,2 slide up from below; 5,6,7 slide down from above — chorten assembles
 *   0.44–0.52  Intro fades out
 *   0.46–1.00  Grid zoom-out 1→108 (remapped from old 0→1)
 */

import { useEffect } from "react";

export default function SceneMultiplyController() {
  useEffect(() => {
    const scene = document.querySelector<HTMLElement>(".scene-multiply");
    const grid = document.querySelector<HTMLElement>(
      ".scene-multiply .multiply-grid",
    );
    const intro = document.querySelector<HTMLElement>(
      ".scene-multiply .multiply-intro",
    );
    if (!scene || !grid) return;

    const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
    /** Map v from [a,b] → [0,1] clamped */
    const rng = (v: number, a: number, b: number) => clamp((v - a) / (b - a));

    // ── Intro element refs ──────────────────────────────────────────────────
    const buddha = intro?.querySelector<HTMLElement>(".mi-buddha");
    const p3 = intro?.querySelector<HTMLElement>(".mi-p3");
    const p4 = intro?.querySelector<HTMLElement>(".mi-p4");
    const p1 = intro?.querySelector<HTMLElement>(".mi-p1");
    const p2 = intro?.querySelector<HTMLElement>(".mi-p2");
    const p5 = intro?.querySelector<HTMLElement>(".mi-p5");
    const p6 = intro?.querySelector<HTMLElement>(".mi-p6");
    const p7 = intro?.querySelector<HTMLElement>(".mi-p7");

    // ── Grid build ──────────────────────────────────────────────────────────
    const isMobile = window.innerWidth <= 760;
    const cols = isMobile ? 9 : 15;
    const rows = isMobile ? 12 : 7;
    const cx = (cols - 1) / 2;
    const cy = (rows - 1) / 2;
    const centreCol = Math.floor(cx);
    const centreRow = Math.floor(cy);

    const cellHTML = `<img src="/assets/jangchub-chorten.png" alt="" draggable="false" style="width:100%;height:100%;object-fit:contain;display:block;" />`;

    grid.innerHTML = "";
    type Built = { el: HTMLDivElement; dist: number; idx: number };
    const built: Built[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = document.createElement("div");
        cell.className = "mg-cell";
        const isCentre = r === centreRow && c === centreCol;
        if (isCentre) cell.classList.add("center");
        cell.innerHTML = cellHTML;
        const dx = c - cx;
        const dy = r - cy;
        const dist =
          Math.sqrt(dx * dx + dy * dy) + (isCentre ? -1 : Math.random() * 0.15);
        built.push({ el: cell, dist, idx: r * cols + c });
        grid.appendChild(cell);
      }
    }
    const sorted = [...built].sort((a, b) => a.dist - b.dist);
    const order = new Array<number>(built.length);
    sorted.forEach((c, i) => {
      order[c.idx] = i;
    });

    const numEl = document.querySelector<HTMLElement>(
      ".scene-multiply .multiply-copy .num",
    );
    const cellEls = grid.querySelectorAll<HTMLElement>(".mg-cell");

    // ── Centre-offset measurement (keeps grid's centre cell on stage centre) ─
    let centreOffsetX = 0;
    let centreOffsetY = 0;

    const measureCentreOffset = () => {
      const prev = grid.style.getPropertyValue("--grid-scale");
      grid.style.setProperty("--grid-scale", "1");
      grid.style.setProperty("--grid-tx", "0px");
      grid.style.setProperty("--grid-ty", "0px");

      const centreCell = grid.querySelector<HTMLElement>(".mg-cell.center");
      const stage = grid.parentElement as HTMLElement;
      if (centreCell && stage) {
        const cellR = centreCell.getBoundingClientRect();
        const stageR = stage.getBoundingClientRect();
        centreOffsetX =
          stageR.left + stageR.width / 2 - (cellR.left + cellR.width / 2);
        centreOffsetY =
          stageR.top + stageR.height / 2 - (cellR.top + cellR.height / 2);
      }
      grid.style.setProperty("--grid-scale", prev || "12");
    };

    // ── Phase constants ─────────────────────────────────────────────────────
    const GRID_P_START = 0.46;
    const INTRO_FADE_START = 0.38;
    const INTRO_FADE_END = 0.4;

    // ── Intro update ────────────────────────────────────────────────────────
    const updateIntro = (p: number) => {
      if (!intro) return;

      // Buddha: scale 4→0.45 over [0, 0.18] so final size matches 4.png (niche)
      // 4.png is 19% wide; mi-buddha is 42% wide → target scale = 19/42 ≈ 0.45
      const buddhaScale = 4 - 3.75 * easeOut(rng(p, 0, 0.18));
      const buddhaOpacity = Math.min(rng(p, 0, 0.05), 1 - rng(p, 0.2, 0.3));
      // Shift down when large; translate eases to 0 as scale reaches final size
      const buddhaShift = ((buddhaScale - 0.25) / 3.75) * 20 - 2;
      if (buddha) {
        buddha.style.transform = `translateY(${buddhaShift.toFixed(1)}vh) translateX(0.3vw) scale(${buddhaScale.toFixed(3)})`;
        buddha.style.opacity = buddhaOpacity.toFixed(3);
      }

      // 3.png: fade in [0.15, 0.24]
      if (p3) p3.style.opacity = easeOut(rng(p, 0.15, 0.24)).toFixed(3);

      // 4.png: fade in [0.27, 0.36]
      if (p4) p4.style.opacity = easeOut(rng(p, 0.27, 0.36)).toFixed(3);

      // 5, 6, 7: slide down from above + fade in [0.27, 0.46]
      const upperT = easeOut(rng(p, 0.27, 0.46));
      const upperDy = (-(1 - upperT) * 90).toFixed(1);
      [p5, p6, p7].forEach((el) => {
        if (!el) return;
        el.style.opacity = upperT.toFixed(3);
        el.style.transform = `translateY(${upperDy}px)`;
      });

      // 1, 2: slide up from below + fade in [0.27, 0.46]
      const lowerT = easeOut(rng(p, 0.27, 0.46));
      const lowerDy = ((1 - lowerT) * 90).toFixed(1);
      [p1, p2].forEach((el) => {
        if (!el) return;
        el.style.opacity = lowerT.toFixed(3);
        el.style.transform = `translateY(${lowerDy}px)`;
      });

      // Intro container: fade out [0.44, 0.52]
      intro.style.opacity = (
        1 - rng(p, INTRO_FADE_START, INTRO_FADE_END)
      ).toFixed(3);
    };

    // ── Grid update (remapped: scene-p [GRID_P_START, 1] → grid-p [0, 1]) ──
    const updateGrid = (p: number) => {
      const gridP = rng(p, GRID_P_START, 1.0);
      const mobile = window.innerWidth <= 760;
      const maxScale = mobile ? 18 : 12;
      const scaleP = clamp(gridP / 0.95);
      const gridScale = maxScale - (maxScale - 1) * easeOut(scaleP);
      grid.style.setProperty("--grid-scale", gridScale.toFixed(2));

      const offsetFactor = (gridScale - 1) / (maxScale - 1);
      grid.style.setProperty(
        "--grid-tx",
        `${(centreOffsetX * offsetFactor).toFixed(2)}px`,
      );
      grid.style.setProperty(
        "--grid-ty",
        `${(centreOffsetY * offsetFactor).toFixed(2)}px`,
      );

      const target = Math.max(1, Math.min(108, Math.floor(1 + scaleP * 108)));
      cellEls.forEach((el, i) => {
        const ord = order[i] != null ? order[i] : i;
        el.classList.toggle("lit", ord < target);
      });
      if (numEl) numEl.textContent = String(target);

      // Fade grid in exactly as intro fades out — seamless crossfade
      grid.style.opacity = easeOut(
        rng(p, INTRO_FADE_START, INTRO_FADE_END),
      ).toFixed(3);
    };

    const update = (p: number) => {
      updateIntro(p);
      updateGrid(p);
    };

    // ── rAF loop ────────────────────────────────────────────────────────────
    let stableVH = window.innerHeight;
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        stableVH = window.innerHeight;
        measureCentreOffset();
      }, 200);
    };
    window.addEventListener("resize", onResize);

    let rafId = 0;
    let stopped = false;
    const loop = () => {
      if (stopped) return;
      const r = scene.getBoundingClientRect();
      const sceneH = scene.offsetHeight;
      const travelled = -r.top;
      const travel = Math.max(1, sceneH - stableVH);
      const p = clamp(travelled / travel);
      update(p);
      rafId = requestAnimationFrame(loop);
    };

    if (window.matchMedia("(prefers-reduced-motion:reduce)").matches) {
      measureCentreOffset();
      update(1);
    } else {
      requestAnimationFrame(() => {
        measureCentreOffset();
        rafId = requestAnimationFrame(loop);
      });
    }

    return () => {
      stopped = true;
      cancelAnimationFrame(rafId);
      if (resizeTimer) clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return null;
}
