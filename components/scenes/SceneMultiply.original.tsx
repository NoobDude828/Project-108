"use client";

/**
 * Dedicated controller for Scene 06 (One becomes 108).
 *
 * All multiply-scene behavior lives here so /public/scroll/scrollytelling.js
 * stays untouched (other devs are editing that file in parallel).
 *
 * The shared scrollytelling.js still has its own update for `.scene-multiply` —
 * it runs each frame and writes the old wave-reveal state into the cells. We
 * register our own rAF AFTER its init runs, which means our callback fires after
 * the framework's per frame, overwriting `.lit` classes and counter text with
 * our values. Last-write-wins per frame, no scrollytelling.js edits required.
 *
 * Progress `p` is computed using the same formula scrollytelling.js uses
 * (-rect.top / max(1, sceneH - vh)) so this scene stays in lockstep with the
 * framework's other scenes.
 */

import { useEffect } from "react";

export default function SceneMultiplyController() {
  useEffect(() => {
    const scene = document.querySelector<HTMLElement>(".scene-multiply");
    const grid = document.querySelector<HTMLElement>(
      ".scene-multiply .multiply-grid",
    );
    if (!scene || !grid) return;

    const clamp = (v: number, a = 0, b = 1) =>
      Math.max(a, Math.min(b, v));
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

    /* ---------------- Grid build ----------------
       Portrait phones get 9×12 (more square cells, bigger thumbnails);
       landscape desktops get 18×6. Both have a true centre cell forced to order 0.
       This rebuild replaces whatever scrollytelling.js's buildMultiplyGrid put in.
    --------------------------------------------- */
    const isMobile = window.innerWidth <= 760;
    const cols = isMobile ? 9 : 18;
    const rows = isMobile ? 12 : 6;
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
          Math.sqrt(dx * dx + dy * dy) +
          (isCentre ? -1 : Math.random() * 0.15);
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

    /* ---------------- Per-frame update ----------------
       Camera zoom (12→1 desktop, 18→1 mobile) over [0, 0.95];
       counter ticks 1→108 alongside; cells reveal centre-out, one per tick.
    --------------------------------------------------- */
    const update = (p: number) => {
      const mobile = window.innerWidth <= 760;
      const maxScale = mobile ? 18 : 12;
      const scaleP = clamp(p / 0.95);
      const gridScale = maxScale - (maxScale - 1) * easeOut(scaleP);
      grid.style.setProperty("--grid-scale", gridScale.toFixed(2));

      // Translate fades from full (centre cell at viewport centre at high scale)
      // to zero (grid naturally centred in stage at scale 1, all rows fit).
      const offsetFactor = (gridScale - 1) / (maxScale - 1);
      if (mobile) {
        // Mobile cell (5,4) is horizontally true-centre, so only Y needs offset.
        grid.style.setProperty(
          "--grid-ty",
          `${(2.84 * offsetFactor).toFixed(2)}vh`,
        );
      } else {
        grid.style.setProperty(
          "--grid-tx",
          `${(2.78 * offsetFactor).toFixed(2)}vw`,
        );
        grid.style.setProperty(
          "--grid-ty",
          `${(6.33 * offsetFactor).toFixed(2)}vh`,
        );
      }

      const target = Math.max(
        1,
        Math.min(108, Math.floor(1 + scaleP * 108)),
      );
      cellEls.forEach((el, i) => {
        const ord = order[i] != null ? order[i] : i;
        el.classList.toggle("lit", ord < target);
      });
      if (numEl) numEl.textContent = String(target);
    };

    /* ---------------- Self-driven rAF loop ----------------
       Mirror scrollytelling.js's stableVH + p formula so scene progress matches
       the framework's. Registering after the framework's init means this callback
       fires after the framework's per frame → our writes overwrite the framework's.
    ------------------------------------------------------- */
    let stableVH = window.innerHeight;
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        stableVH = window.innerHeight;
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
      // Static final state — no rAF loop needed.
      update(1);
    } else {
      rafId = requestAnimationFrame(loop);
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
