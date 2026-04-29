/* ============================================================
   Project 108 — Cinematic Scrollytelling
   Scroll controller for index.html
   ============================================================ */
(function(){
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* ---------------- Helpers ---------------- */
  const clamp = (v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const lerp  = (a,b,t)=>a+(b-a)*t;
  const ease  = t=>t<.5 ? 2*t*t : 1-Math.pow(-2*t+2,2)/2;
  const easeOut = t=>1-Math.pow(1-t,3);

  /* ---------------- Scenes registry ----------------
     Each scene exposes a sticky `<div class="stage">` inside a
     tall section. We compute scroll progress (0..1) for the
     section's pinned region and call its `update(p)` handler.
  ---------------------------------------------------- */
  const sceneDefs = []; // {el, label, num, act, update}

  function registerScene({selector, label, num, act, update}){
    const el = document.querySelector(selector);
    if(!el) return;
    sceneDefs.push({el, label, num, act, update: update || (()=>{})});
  }

  /* ---------------- Caption + rail ---------------- */
  const captionNum  = document.querySelector('.caption-bar .num');
  const captionLbl  = document.querySelector('.caption-bar .lbl');
  const railFill    = document.querySelector('.rail__fill');

  let lastSceneIdx = -1;

  function setActiveScene(idx){
    if(idx === lastSceneIdx) return;
    const s = sceneDefs[idx];
    if(!s) return;
    if(captionNum) captionNum.textContent = s.num;
    if(captionLbl) captionLbl.textContent = s.label;
    lastSceneIdx = idx;
  }

  /* ---------------- Scene-specific setup ---------------- */

  // Scene 02 — What is a chorten?
  registerScene({
    selector:'.scene-what',
    label:'What is a chorten?',
    num:'02 / 15',
    act:'I — The Sacred Object',
    update(p){
      const stg = document.querySelector('.scene-what .what-chorten');
      if(stg) stg.style.setProperty('--p', clamp(p));
      const truths = document.querySelectorAll('.scene-what .truth');
      // Stagger four truths over progress 0.15..0.95
      truths.forEach((el,i)=>{
        const start = .15 + i*.18;
        const lit = p > start;
        el.classList.toggle('show', lit);
      });
    }
  });

  // Scene 03 — Chorten Assembly (7 parts)
  registerScene({
    selector:'.scene-assembly',
    label:'Seven sacred elements',
    num:'03 / 15',
    act:'I — The Sacred Object',
    update(p){
      const parts = document.querySelectorAll('.scene-assembly .assy-part');
      const items = document.querySelectorAll('.scene-assembly .assy-item');
      const N = 7;
      // Stagger each part across progress segments. Each part takes 1/N
      // of the scroll, with a small overlap.
      parts.forEach((el)=>{
        const i = parseInt(el.dataset.part, 10) - 1; // 0..6
        const start = i / N * .9;       // 0 .. 0.9
        const end   = start + .15;
        const t = clamp((p - start) / (end - start));
        el.style.setProperty('--p', easeOut(t));
      });
      items.forEach((el)=>{
        const i = parseInt(el.dataset.part, 10) - 1; // 0..6
        const start = i / N * .9 + .04;
        const t = clamp((p - start) / .12);
        el.style.setProperty('--p', t);
        el.classList.toggle('lit', t > .8);
      });
    }
  });

  // Scene 04 — How tall is 15 metres?
  registerScene({
    selector:'.scene-scale',
    label:'How tall is fifteen metres?',
    num:'04 / 15',
    act:'I — The Sacred Object',
    update(p){
      const wrap = document.querySelector('.scene-scale .scale-scrolly');
      const art = document.querySelector('.scene-scale .scale-art');
      if(art) art.style.setProperty('--p', clamp(p));
      if(!wrap) return;
      // Figure reveal thresholds: person 0.10, building 0.40, chorten 0.70
      const figs = wrap.querySelectorAll('.scale-fig');
      const thresholds = [0.08, 0.38, 0.66];
      figs.forEach((f,i)=>{
        const t = thresholds[i] || 0;
        const local = clamp((p - t) / 0.18);
        f.style.setProperty('--on', local);
      });
      // data-stage drives tick visibility
      let stage = 0;
      if(p >= thresholds[0]) stage = 1;
      if(p >= thresholds[1]) stage = 2;
      if(p >= thresholds[2]) stage = 3;
      wrap.setAttribute('data-stage', String(stage));
    }
  });

  // Scene 05 — Why 108? (multi-chapter pinned scene)
  // Five chapters: A astronomy, B buddhism, C hinduism, D math, E project
  const WHY_CHAPTERS = ['A','B','C','D','E'];
  registerScene({
    selector:'.scene-why',
    label:'Why 108?',
    num:'05 / 15',
    act:'II — The Sacred Number',
    update(p){
      // Anchor visibility: hide during chapter content, return at hand-offs
      // Chapters span: A 0.05–0.22, B 0.24–0.41, C 0.43–0.58, D 0.60–0.75, E 0.78–0.98
      const ranges = [
        ['A',.05,.22],
        ['B',.24,.41],
        ['C',.43,.58],
        ['D',.60,.75],
        ['E',.78,.98],
      ];
      let anchorP = 1;
      let anchorS = 1;
      let activeChap = null;
      ranges.forEach(([id,a,b])=>{
        const inside = p >= a && p <= b;
        if(inside) activeChap = id;
        // Within a chapter, suppress the anchor (chapter visuals take over).
        if(inside) anchorP = .15;
      });

      // First & last beats: anchor is large + bold
      if(p < .05){ anchorP = 1; anchorS = 1; }
      else if(p > .98){ anchorP = 1; anchorS = 1.1; }

      const anchor = document.querySelector('.why-anchor');
      if(anchor){
        anchor.style.setProperty('--p', anchorP);
        anchor.style.setProperty('--s', anchorS);
      }

      document.querySelectorAll('.why-chapter').forEach(c=>{
        const id = c.dataset.chap;
        c.classList.toggle('active', id === activeChap);
      });

      // Buddhism / Hinduism line ticking
      const tickLines = (chap, range) => {
        const c = document.querySelector(`.why-chapter[data-chap="${chap}"]`);
        if(!c) return;
        const lines = c.querySelectorAll('.lines span');
        const [a,b] = range;
        const local = clamp((p - a) / (b - a));
        lines.forEach((ln,i)=>{
          const t = i / lines.length;
          ln.classList.toggle('lit', local > t);
        });
      };
      tickLines('B',[.24,.41]);
      tickLines('C',[.43,.58]);

      // Project chapter — 108 dots
      const projC = document.querySelector('.why-chapter[data-chap="E"]');
      if(projC){
        const dots = projC.querySelectorAll('.dot');
        const [a,b] = [.78,.98];
        const local = clamp((p - a) / (b - a));
        const litCount = Math.floor(local * dots.length);
        dots.forEach((d,i)=>d.classList.toggle('lit', i < litCount));
      }
    }
  });

  // Scene 06 — One becomes 108 (12 cols × 9 rows = 108 cells)
  registerScene({
    selector:'.scene-multiply',
    label:'One sacred form, repeated',
    num:'06 / 15',
    act:'III — The Sacred Formation',
    update(p){
      const cells = document.querySelectorAll('.scene-multiply .cg-cell');
      // Define multiplication waves: 1 → 3 → 9 → 27 → 54 → 108
      // Mapping each step to a progress range
      const steps = [
        {at:.05, n:1},
        {at:.22, n:3},
        {at:.38, n:9},
        {at:.54, n:27},
        {at:.70, n:54},
        {at:.86, n:108},
      ];
      // Determine current target count
      let target = 1;
      for(const s of steps){
        if(p >= s.at) target = s.n;
      }
      // Sequence cells from center outwards
      const ordered = window.__multiplyOrder || [];
      cells.forEach((el,i)=>{
        const order = ordered[i] != null ? ordered[i] : i;
        el.classList.toggle('lit', order < target);
      });
      // Update copy
      const numEl = document.querySelector('.scene-multiply .multiply-copy .num');
      if(numEl) numEl.textContent = target;
    }
  });

  // Scene 07 — 108 m apart
  registerScene({
    selector:'.scene-spacing',
    label:'108 metres apart',
    num:'07 / 15',
    act:'III — The Sacred Formation',
    update(p){
      const tr = document.querySelector('.scene-spacing .spacing-track');
      const measure = document.querySelector('.scene-spacing .spacing-measure');
      if(tr) tr.style.setProperty('--p', clamp(p));
      // Measurement appears strong early (between 2 chortens), then scales down + fades as we pull back
      if(measure){
        const a = clamp((p - .05) / .12) * (1 - clamp((p - .75) / .2));
        measure.style.setProperty('--p', a);
        measure.style.setProperty('--zoom', clamp(p));
      }
    }
  });

  // Scene 08 — A line along the Mau Chhu
  registerScene({
    selector:'.scene-river',
    label:'A line along the Mau Chhu',
    num:'08 / 15',
    act:'III — The Sacred Formation',
    update(p){
      const photo = document.querySelector('.scene-river .river-photo');
      const path = document.querySelector('.scene-river .river-path');
      if(photo) photo.style.setProperty('--p', clamp((p - .05) / .3));
      if(path)  path.style.setProperty('--p', clamp((p - .15) / .55));
      // Markers light along path
      const markers = document.querySelectorAll('.scene-river .river-marker');
      const litCount = Math.floor(clamp((p - .35) / .55) * markers.length);
      markers.forEach((m,i)=>m.classList.toggle('lit', i < litCount));
    }
  });

  // Scene 09 — Stacked height (1.62 km)
  registerScene({
    selector:'.scene-stack',
    label:'Stacked height: 1.62 km',
    num:'09 / 15',
    act:'IV — The Scale of the Offering',
    update(p){
      const col = document.querySelector('.scene-stack .stack-column');
      const intro = document.querySelector('.scene-stack .stack-intro');
      const finalEl = document.querySelector('.scene-stack .stack-final');
      const counter = document.querySelector('.stack-counter');
      const units = document.querySelectorAll('.scene-stack .stack-unit');

      // Light units sequentially
      const N = units.length;
      const litCount = Math.floor(clamp((p - .03) / .85) * N);
      units.forEach((u,i)=>u.classList.toggle('lit', i < litCount));

      // Translate the column upward as it fills, faster as we approach end.
      // Each unit is ~14px tall; total internal height ≈ N * 15.
      // We want the *top* of the stack to stay visible — so as the stack
      // grows, the column translates upward enough to keep the topmost unit
      // near the top of the viewport.
      const colTotal = N * 15; // px (matches CSS)
      const visibleH = window.innerHeight * .82;
      const overshoot = Math.max(0, colTotal - visibleH);
      const yPx = -overshoot * clamp((p - .15) / .7);
      if(col) col.style.setProperty('--y', yPx);

      // Reference markers (Pyramid / Eiffel / Burj) — fixed Y on the column.
      // Positions correspond to: pyramid 9, eiffel 22, burj 55, top 108
      const refs = document.querySelectorAll('.scene-stack .stack-ref');
      refs.forEach(r=>{
        const u = parseInt(r.dataset.unit, 10) || 0;
        const refY = u * 15; // matches column unit pitch
        // The ref is anchored to the column, so it must move with it
        r.style.setProperty('--y', refY + yPx);
        // Light it up once the stack has reached this unit
        r.classList.toggle('lit', litCount >= u);
      });

      // Live counter
      if(counter){
        counter.style.setProperty('--p', clamp((p - .04) / .15));
        const h = counter.querySelector('.h');
        if(h){
          const meters = Math.floor(litCount * 15);
          if(meters >= 1000){
            h.textContent = (meters/1000).toFixed(2) + ' km';
          } else {
            h.textContent = meters + ' m';
          }
        }
      }

      // Intro fades out, final reveal fades in
      if(intro)   intro.style.setProperty('--p', clamp(1 - (p - .25) / .2));
      if(finalEl) finalEl.style.setProperty('--p', clamp((p - .82) / .12));
    }
  });

  // Scene 10 — Time of construction
  registerScene({
    selector:'.scene-time',
    label:'Prepared over time, completed together',
    num:'10 / 15',
    act:'V — The Human Achievement',
    update(p){
      const fill = document.querySelector('.scene-time .time-fill');
      if(fill) fill.style.setProperty('--p', clamp(p * 1.1));
      const markers = document.querySelectorAll('.scene-time .time-marker');
      markers.forEach((el,i)=>{
        const at = parseFloat(el.dataset.at) || (i / markers.length);
        const t = clamp((p - at + .04) / .12);
        el.style.setProperty('--p', t);
        el.classList.toggle('lit', t > .9);
      });
    }
  });

  // Scene 11 — Manpower comparison
  registerScene({
    selector:'.scene-manpower',
    label:'Manpower across history',
    num:'11 / 15',
    act:'V — The Human Achievement',
    update(p){
      const rows = document.querySelectorAll('.scene-manpower .manpower-row');
      rows.forEach((el,i)=>{
        const start = i * .14;
        const t = clamp((p - start) / .25);
        el.style.setProperty('--p', t);
      });
    }
  });

  // Scene 12 — 40,000 volunteers activate 108 sites
  registerScene({
    selector:'.scene-volunteers',
    label:'Forty thousand · one hundred and eight',
    num:'12 / 15',
    act:'V — The Human Achievement',
    update(p){
      const sites = document.querySelectorAll('.vol-site');
      const flows = document.querySelectorAll('.vol-flow');
      const N = sites.length;
      const litCount = Math.floor(clamp((p - .05) / .85) * N);
      sites.forEach((s,i)=>{
        // Activate clusters: 1, then 5, then 20, then 60, then all
        s.classList.toggle('active', i < litCount);
      });
      const fLit = Math.floor(clamp((p - .15) / .65) * flows.length);
      flows.forEach((f,i)=>f.classList.toggle('active', i < fLit));

      // Counter
      const counterNum = document.querySelector('.vol-counter .num');
      if(counterNum){
        const peopleTarget = 40000;
        const sitesActive = Math.min(N, litCount);
        // Show people OR sites depending on phase
        if(p < .55){
          counterNum.textContent = sitesActive;
          counterNum.dataset.label = 'sites lit';
        } else {
          // Tween up to 40,000 in the second half
          const t = clamp((p - .55) / .4);
          const v = Math.floor(easeOut(t) * peopleTarget);
          counterNum.textContent = v.toLocaleString();
        }
      }
      const denomEl = document.querySelector('.vol-counter .denom');
      if(denomEl){
        denomEl.innerHTML = p < .55
          ? `<strong>108</strong> sites · across the corridor`
          : `volunteers · <strong>40,000</strong> across <strong>108</strong> sites`;
      }
    }
  });

  // Scene 13 — Completion (golden light sweeps the procession)
  registerScene({
    selector:'.scene-completion',
    label:'108 chortens · one day · one offering',
    num:'13 / 15',
    act:'VI — The Invitation',
    update(p){
      const light = document.querySelector('.scene-completion .compl-light');
      const track = document.querySelector('.scene-completion .compl-track');
      const copy  = document.querySelector('.scene-completion .compl-copy');
      if(light) light.style.setProperty('--p', clamp(p));
      // Light each chorten as the wave passes
      const chortens = document.querySelectorAll('.compl-chorten');
      const litCount = Math.floor(clamp(p * 1.05) * chortens.length);
      chortens.forEach((c,i)=>c.classList.toggle('lit', i < litCount));
      if(copy) copy.style.setProperty('--p', clamp((p - .15) / .2));
    }
  });

  // Scene 14 — His Majesty's quote (second-last)
  registerScene({
    selector:'.scene-gesture',
    label:'A Royal initiative',
    num:'14 / 15',
    act:'VI — The Invitation',
    update(p){
      const block = document.querySelector('.scene-gesture .gesture-block');
      if(block) block.style.setProperty('--p', clamp(p));
    }
  });

  // Scene 15 — Invitation
  registerScene({
    selector:'.scene-invitation',
    label:'Two ways to take part',
    num:'15 / 15',
    act:'VI — The Invitation',
    update(p){}
  });

  /* ---------------- Multiplication grid setup ---------------- */
  // Build cells in DOM and compute centre-out order so the wave
  // looks like petals opening from the middle.
  function buildMultiplyGrid(){
    const grid = document.querySelector('.scene-multiply .chorten-grid');
    if(!grid) return;
    const cols = 12, rows = 9; // 108 cells
    const cx = (cols-1)/2, cy = (rows-1)/2;
    const cells = [];
    for(let r=0;r<rows;r++){
      for(let c=0;c<cols;c++){
        const cell = document.createElement('div');
        cell.className = 'cg-cell';
        if(r === Math.floor(cy) && c === Math.floor(cx)) cell.classList.add('center');
        cell.innerHTML = window.__chortenMiniSVG;
        // Distance from centre with slight jitter to break perfect rings
        const dx = c - cx, dy = r - cy;
        const dist = Math.sqrt(dx*dx + dy*dy) + Math.random() * .15;
        cells.push({el:cell,dist,idx:r*cols+c});
        grid.appendChild(cell);
      }
    }
    // Sort by dist, then assign order
    const sorted = [...cells].sort((a,b)=>a.dist-b.dist);
    const order = new Array(cells.length);
    sorted.forEach((c,i)=>{ order[c.idx] = i; });
    window.__multiplyOrder = order;
  }

  /* ---------------- Spacing track setup ---------------- */
  function buildSpacingTrack(){
    const track = document.querySelector('.scene-spacing .spacing-row');
    if(!track) return;
    // Render ~25 chortens to suggest the procession; CSS scales the row
    const html = [];
    for(let i=0;i<27;i++){
      html.push(`<div class="chorten-mini">${window.__chortenMiniSVG}</div>`);
    }
    track.innerHTML = html.join('');
  }

  /* ---------------- River SVG path setup ---------------- */
  function buildRiverPath(){
    const svg = document.querySelector('.scene-river .river-svg');
    if(!svg) return;
    const w = 1200, h = 700;
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.setAttribute('preserveAspectRatio','xMidYMid slice');
    // A graceful continuous curve with no sharp bends — uniform smooth control points
    const d = `M 30 ${h*.78}
               C 180 ${h*.74}, 280 ${h*.50}, 420 ${h*.52}
               C 560 ${h*.54}, 660 ${h*.66}, 800 ${h*.52}
               C 940 ${h*.40}, 1040 ${h*.36}, ${w-30} ${h*.34}`;
    const ns = 'http://www.w3.org/2000/svg';
    const path = document.createElementNS(ns,'path');
    path.setAttribute('d', d);
    path.setAttribute('class', 'river-path');
    svg.appendChild(path);
    const len = path.getTotalLength();
    path.setAttribute('stroke-dasharray', len);
    path.style.setProperty('--len', len);
    const styleNode = document.createElement('style');
    styleNode.textContent =
      `.scene-river .river-path{stroke-dasharray:${len};stroke-dashoffset:calc(${len} * (1 - var(--p,0)))}`;
    document.head.appendChild(styleNode);

    // Place exactly 108 markers along the path
    for(let i=0;i<108;i++){
      const t = i / 107;
      const pt = path.getPointAtLength(t * len);
      const c = document.createElementNS(ns,'circle');
      c.setAttribute('cx', pt.x.toFixed(1));
      c.setAttribute('cy', pt.y.toFixed(1));
      c.setAttribute('r', '3');
      c.setAttribute('class', 'river-marker');
      svg.appendChild(c);
    }
  }

  /* ---------------- Stack column setup ---------------- */
  function buildStackColumn(){
    const col = document.querySelector('.scene-stack .stack-column');
    if(!col) return;
    const N = 108;
    const html = [];
    for(let i=0;i<N;i++){
      html.push(`<div class="stack-unit">${window.__chortenMiniSVG}</div>`);
    }
    col.innerHTML = html.join('');
    // Stars
    const stars = document.querySelector('.stack-stars');
    if(stars){
      const s = [];
      for(let i=0;i<60;i++){
        const x = Math.random()*100;
        const y = Math.random()*100;
        const o = .4 + Math.random()*.5;
        s.push(`<div class="stack-star" style="left:${x}%;top:${y}%;opacity:${o}"></div>`);
      }
      stars.innerHTML = s.join('');
    }
  }

  /* ---------------- Volunteers SVG setup ---------------- */
  function buildVolunteersSVG(){
    const svg = document.querySelector('.scene-volunteers .vol-svg');
    if(!svg) return;
    const w = 1200, h = 700;
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.setAttribute('preserveAspectRatio','xMidYMid slice');
    const ns = 'http://www.w3.org/2000/svg';
    // Graceful corridor curve
    const d = `M 60 ${h*.55}
               C 240 ${h*.6}, 380 ${h*.4}, 540 ${h*.45}
               S 780 ${h*.65}, 940 ${h*.45}
               L ${w-60} ${h*.4}`;
    const guide = document.createElementNS(ns,'path');
    guide.setAttribute('d', d);
    guide.setAttribute('fill','none');
    guide.setAttribute('stroke','rgba(200,166,99,0.18)');
    guide.setAttribute('stroke-width','1');
    guide.setAttribute('stroke-dasharray','3 6');
    svg.appendChild(guide);
    const len = guide.getTotalLength();
    // 108 sites
    for(let i=0;i<108;i++){
      const pt = guide.getPointAtLength((i/107) * len);
      const c = document.createElementNS(ns,'circle');
      c.setAttribute('cx', pt.x.toFixed(1));
      c.setAttribute('cy', pt.y.toFixed(1));
      c.setAttribute('r', '3.2');
      c.setAttribute('class', 'vol-site');
      svg.appendChild(c);
    }
    // Soft halo rings (no criss-crossing lines) — they pulse outward at each site
    for(let i=0;i<12;i++){
      const idx = i * 9 + 4;
      const pt = guide.getPointAtLength((idx/107) * len);
      const ring = document.createElementNS(ns,'circle');
      ring.setAttribute('cx', pt.x.toFixed(1));
      ring.setAttribute('cy', pt.y.toFixed(1));
      ring.setAttribute('r', '14');
      ring.setAttribute('class','vol-flow');
      svg.appendChild(ring);
    }
  }

  /* ---------------- Completion track setup ---------------- */
  function buildCompletionTrack(){
    const track = document.querySelector('.scene-completion .compl-track');
    if(!track) return;
    const html = [];
    for(let i=0;i<108;i++){
      html.push(`<div class="compl-chorten">${window.__chortenMiniSVG}</div>`);
    }
    track.innerHTML = html.join('');
  }

  /* ---------------- Why-108 dots ---------------- */
  function buildWhyDots(){
    const wrap = document.querySelector('.why-chapter[data-chap="E"] .dots-field');
    if(!wrap) return;
    const html = [];
    for(let i=0;i<108;i++) html.push('<div class="dot"></div>');
    wrap.innerHTML = html.join('');
  }

  /* ---------------- Main scroll loop ---------------- */
  function tick(){
    const scrollY = window.scrollY || window.pageYOffset;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    if(railFill) railFill.style.width = (clamp(scrollY/docH) * 100) + '%';

    if(scrollY > 50) document.body.classList.add('scrolled');
    else document.body.classList.remove('scrolled');

    // For each scene, compute progress through its scrollable region.
    // Pinned region: scene's bounding-rect top is between 0 and -(scene.height - vh).
    let activeIdx = 0;
    sceneDefs.forEach((s,i)=>{
      const r = s.el.getBoundingClientRect();
      const sceneH = s.el.offsetHeight;
      const vh = window.innerHeight;
      // Progress: how far past the top we are, vs how much can be travelled.
      const travelled = -r.top;
      const travel = Math.max(1, sceneH - vh);
      const p = clamp(travelled / travel);
      s.update(p);
      // Active scene = the one whose stage is currently pinned (top<=0<bottom)
      if(r.top <= window.innerHeight * .5 && r.bottom > window.innerHeight * .5){
        activeIdx = i;
      }
      // Mark scenes that are fully past so their absolute children (e.g. stack-final)
      // don't bleed into following scenes.
      const isPast = r.bottom < window.innerHeight * .5;
      s.el.classList.toggle('is-past', isPast);
    });
    setActiveScene(activeIdx);

    requestAnimationFrame(tick);
  }

  /* ---------------- Init ---------------- */
  function init(){
    // Mini chorten SVG used throughout (multiplication, spacing, stack, completion)
    window.__chortenMiniSVG = `<svg viewBox="0 0 24 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g fill="currentColor" stroke="none" style="color:var(--gold);">
        <!-- flame & sun-moon -->
        <path d="M12 3 q1.4 -1 1.4 -2.4 q0 1.6 -1.4 3.2 q-1.4 -1.6 -1.4 -3.2 q0 1.4 1.4 2.4 z"/>
        <circle cx="12" cy="5.2" r=".9"/>
        <!-- spire -->
        <path d="M11 6 h2 l-.4 8.5 h-1.2 z"/>
        <!-- parasol -->
        <path d="M9.6 14.5 h4.8 l-.6 1.2 h-3.6 z"/>
        <!-- dome / vase -->
        <path d="M8.5 16 q3.5 -3 7 0 v6 h-7 z"/>
        <!-- niche -->
        <rect x="9.2" y="22" width="5.6" height="3"/>
        <!-- stepped base -->
        <rect x="8" y="25" width="8" height="3"/>
        <rect x="7" y="28" width="10" height="3"/>
        <rect x="6" y="31" width="12" height="4"/>
        <rect x="5" y="35" width="14" height="5"/>
        <!-- ground line -->
        <rect x="3" y="40" width="18" height="1.2" opacity=".6"/>
      </g>
    </svg>`;

    // Build dynamic content
    buildMultiplyGrid();
    buildSpacingTrack();
    buildRiverPath();
    buildStackColumn();
    buildVolunteersSVG();
    buildCompletionTrack();
    buildWhyDots();

    if(reducedMotion){
      // Don't run the rAF loop; show captions for the very first scene only.
      setActiveScene(0);
      // Force final-state on each scene for clarity.
      sceneDefs.forEach(s=>{ try{ s.update(1); } catch(e){} });
      return;
    }
    requestAnimationFrame(tick);
  }

  // Expose tick for screenshot harnesses where rAF is paused (document.hidden).
  window.__p108Tick = tick;

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
