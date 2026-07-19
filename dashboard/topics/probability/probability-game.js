/* Probability — Builder Game.
 *
 * Two challenge modes share one tab (toggled by the .subnav chips):
 *
 *   A) Tree Challenge  — a random "draw 2 balls" scenario is shown with a blank
 *      probability tree. The learner DRAGS fraction chips onto each branch slot
 *      (the with/without-replacement traps are baked into the distractor chips),
 *      checks the branches, then picks the final answer from multiple choice.
 *
 *   B) Bag Designer    — the learner is given a TARGET like P(red) = 3/8 and must
 *      add / remove coloured balls until the chance of red matches. A live spinner
 *      and a "Spin 200×" experiment reinforce theoretical vs experimental probability.
 *
 * Colours / fonts match the rest of the probability dashboard. Maths renders via KaTeX.
 */
(function () {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";
  const C = { ink: "#e5e7eb", dim: "#94a3b8", fav: "#FFD54F", tot: "#66BB6A", a: "#4FC3F7", red: "#f06292", line: "#28365c" };
  const BALL = { R: "#ef4444", G: "#22c55e", B: "#3b82f6" };
  const BALL_NAME = { R: "red", G: "green", B: "blue" };

  /* ── tiny helpers ── */
  function E(tag, attrs) { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; }
  function clear(n) { while (n && n.firstChild) n.removeChild(n.firstChild); }
  function km(el, latex) { try { window.katex.render(latex, el, { throwOnError: false, displayMode: false }); } catch (e) { el.textContent = latex; } }
  // iPad / phone: WebKit (bug 23113) paints foreignObject content without the
  // svg's viewBox transform, so the dropped fractions drift to the top-left.
  // Workaround: position:fixed re-anchors the content to the foreignObject box,
  // and scale(k) matches the on-screen scale. Desktop is untouched.
  function isTouchUI() {
    const de = document.documentElement;
    return de.classList.contains("tablet-touch") || de.classList.contains("phone-compact") ||
      window.innerWidth <= 767 ||
      (window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
  }
  function isAppleWebKit() {
    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua)) return true;
    if (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) return true; // iPadOS desktop UA
    return /AppleWebKit/.test(ua) && !/Chrome|CriOS|Edg|Android/.test(ua);
  }
  function anchorFO(fo, div, w, h) {
    if (!isTouchUI() || !isAppleWebKit()) return;
    // position:fixed re-anchors the content to the foreignObject box; Safari
    // already applies the viewBox scale itself, so no extra transform needed.
    div.style.position = "fixed";
    div.style.width = w + "px";
    div.style.height = h + "px";
  }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { const t = a % b; a = b; b = t; } return a || 1; }
  function fr(n, d) { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d) || 1; return { n: n / g, d: d / g }; }
  function fmul(a, b) { return fr(a.n * b.n, a.d * b.d); }
  function fadd(a, b) { return fr(a.n * b.d + b.n * a.d, a.d * b.d); }
  function fsub(a, b) { return fr(a.n * b.d - b.n * a.d, a.d * b.d); }
  const feq = (a, b) => a.n * b.d === b.n * a.d;
  const fnum = (f) => f.n / f.d;
  const fracTex = (f) => (f.n === 0 ? "0" : f.d === 1 ? String(f.n) : `\\frac{${f.n}}{${f.d}}`);
  const fracKey = (f) => { const r = fr(f.n, f.d); return r.n + "/" + r.d; };
  function shuffle(arr) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; }
  const ri = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));

  /* shared ghost-drag (pointer based, like the area/volume builder) */
  function ghostDrag(label, e, onMove, onDrop) {
    const ghost = document.createElement("div");
    ghost.className = "drag-ghost";
    const span = document.createElement("span"); km(span, label); ghost.appendChild(span);
    const sx = e.clientX, sy = e.clientY; let moved = false;
    ghost.style.left = sx + "px"; ghost.style.top = sy + "px";
    document.body.appendChild(ghost);
    function mv(ev) {
      if (Math.abs(ev.clientX - sx) > 4 || Math.abs(ev.clientY - sy) > 4) moved = true;
      ghost.style.left = ev.clientX + "px"; ghost.style.top = ev.clientY + "px";
      if (onMove) onMove(ev, moved);
    }
    function cleanup() {
      window.removeEventListener("pointermove", mv);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cn);
      ghost.remove();
    }
    function up(ev) { cleanup(); onDrop(ev, moved); }
    // iOS Safari fires pointercancel when it steals the touch for scrolling;
    // without this the ghost stays stuck on screen and the drop never lands.
    function cn(ev) { cleanup(); onDrop(ev, true); }
    window.addEventListener("pointermove", mv); window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cn);
  }
  function slotUnder(ev) { const el = document.elementFromPoint(ev.clientX, ev.clientY); return el && el.closest ? el.closest(".pg-slot") : null; }

  /* ═══════════════════════════ MODE A: Tree Challenge ═══════════════════════════ */
  const TG = { mounted: false, score: 0, streak: 0, sel: null };

  // branch order: 0=P(R)  1=P(O)  2=P(R|R)  3=P(O|R)  4=P(R|O)  5=P(O|O)
  function expectedFor(a, b, total, replace) {
    if (replace) return [
      { n: a, d: total }, { n: b, d: total },
      { n: a, d: total }, { n: b, d: total }, { n: a, d: total }, { n: b, d: total },
    ];
    return [
      { n: a, d: total }, { n: b, d: total },
      { n: a - 1, d: total - 1 }, { n: b, d: total - 1 }, { n: a, d: total - 1 }, { n: b - 1, d: total - 1 },
    ];
  }
  const EVENTS = [
    { id: "RR", label: "both balls are red", legs: [[0, 2]], op: "mul" },
    { id: "OO", label: "both balls are OTHER", legs: [[1, 5]], op: "mul" },
    { id: "RO", label: "red first, then OTHER", legs: [[0, 3]], op: "mul" },
    { id: "OR", label: "OTHER first, then red", legs: [[1, 4]], op: "mul" },
    { id: "DIFF", label: "the two balls are different colours", legs: [[0, 3], [1, 4]], op: "add" },
    { id: "ALR", label: "at least one ball is red", legs: [[1, 5]], op: "complement" },
  ];
  function eventProb(exp, ev) {
    const rv = (i) => fr(exp[i].n, exp[i].d);
    const leaf = (pair) => fmul(rv(pair[0]), rv(pair[1]));
    if (ev.op === "mul") return leaf(ev.legs[0]);
    if (ev.op === "add") return ev.legs.reduce((acc, p) => fadd(acc, leaf(p)), fr(0, 1));
    return fsub(fr(1, 1), leaf(ev.legs[0]));   // complement
  }

  let tg = null;
  function newTree() {
    const a = ri(2, 5), b = ri(2, 5), total = a + b;
    const replace = Math.random() < 0.5;
    const otherCol = Math.random() < 0.5 ? "G" : "B";
    const exp = expectedFor(a, b, total, replace);
    const altExp = expectedFor(a, b, total, !replace);
    const ev = EVENTS[ri(0, EVENTS.length - 1)];

    // chip palette: the correct branch fractions + the opposite-assumption traps
    const map = {};
    const add = (f) => { if (f.d <= 0 || f.n < 0) return; const k = f.n + "/" + f.d; if (!map[k]) map[k] = f; };
    exp.forEach(add); altExp.forEach(add);
    add({ n: a, d: total - 1 }); add({ n: b, d: total - 1 });
    const chips = shuffle(Object.keys(map).map((k) => map[k]));

    tg = { a, b, total, replace, otherCol, exp, ev, chips, assigned: [null, null, null, null, null, null], checked: false, solved: false };
    TG.sel = null;
    renderTreeScenario();
    renderTree();
    renderChips();
    els.tgFinal.classList.add("hidden");
    els.tgFeedback.textContent = "";
    els.tgFeedback.className = "pg-feedback";
  }

  function renderTreeScenario() {
    const other = BALL_NAME[tg.otherCol];
    const how = tg.replace ? "<b>with replacement</b> (the first ball is put back before the second draw)"
                           : "<b>without replacement</b> (the first ball is kept out)";
    const evl = tg.ev.label.replace("OTHER", other);
    els.tgScenario.innerHTML = "A bag holds <b>" + tg.a + " red</b> and <b>" + tg.b + " " + other +
      "</b> balls. Two balls are drawn one after the other, " + how +
      ". Complete the tree, then find the probability that <b>" + evl + "</b>.";
  }

  // node + slot layout in the 660×360 viewBox
  const ROOT = [52, 180], N1 = { R: [300, 96], O: [300, 264] };
  const N2 = { RR: [566, 46], RO: [566, 146], OR: [566, 214], OO: [566, 314] };
  const SLOTS = [
    { i: 0, p: [176, 138] }, { i: 1, p: [176, 222] },
    { i: 2, p: [433, 71] }, { i: 3, p: [433, 121] },
    { i: 4, p: [433, 239] }, { i: 5, p: [433, 289] },
  ];
  function node(svg, xy, col, letter) {
    svg.appendChild(E("circle", { cx: xy[0], cy: xy[1], r: 16, fill: BALL[col], "fill-opacity": 0.9, stroke: "#0b1324", "stroke-width": 2 }));
    const t = E("text", { x: xy[0], y: xy[1] + 1, "text-anchor": "middle", "dominant-baseline": "middle",
      "font-size": 14, "font-weight": 700, fill: "#0b1324", "font-family": "Hanken Grotesk, sans-serif" });
    t.textContent = letter; svg.appendChild(t);
  }
  function leafLabel(svg, xy, txt, col) {
    svg.appendChild(E("circle", { cx: xy[0], cy: xy[1], r: 7, fill: BALL[col], stroke: "#0b1324", "stroke-width": 1.5 }));
    const t = E("text", { x: xy[0] + 14, y: xy[1] + 1, "text-anchor": "start", "dominant-baseline": "middle",
      "font-size": 12.5, fill: C.dim, "font-family": "JetBrains Mono, monospace" });
    t.textContent = txt; svg.appendChild(t);
  }
  function branch(svg, from, to) {
    svg.appendChild(E("line", { x1: from[0], y1: from[1], x2: to[0], y2: to[1], stroke: C.line, "stroke-width": 2 }));
  }
  function renderTree() {
    const svg = els.tgTree; clear(svg);
    const O = tg.otherCol, oL = O;   // letter for other colour = its key (G/B)
    branch(svg, ROOT, N1.R); branch(svg, ROOT, N1.O);
    branch(svg, N1.R, N2.RR); branch(svg, N1.R, N2.RO);
    branch(svg, N1.O, N2.OR); branch(svg, N1.O, N2.OO);
    svg.appendChild(E("circle", { cx: ROOT[0], cy: ROOT[1], r: 7, fill: C.dim }));
    node(svg, N1.R, "R", "R"); node(svg, N1.O, O, oL);
    leafLabel(svg, N2.RR, "R , R", "R"); leafLabel(svg, N2.RO, "R , " + oL, O);
    leafLabel(svg, N2.OR, oL + " , R", "R"); leafLabel(svg, N2.OO, oL + " , " + oL, O);
    // slots as foreignObject overlays so they scale with the svg
    SLOTS.forEach((s) => {
      const w = 60, h = 30;
      const fo = E("foreignObject", { x: s.p[0] - w / 2, y: s.p[1] - h / 2, width: w, height: h });
      const div = document.createElement("div");
      div.className = "pg-slot";
      div.dataset.idx = s.i;
      const v = tg.assigned[s.i];
      if (v) { km(div, fracTex(v)); div.classList.add("filled"); }
      else { div.classList.add("empty"); }
      if (tg.checked && v) div.classList.add(feq(v, fr(tg.exp[s.i].n, tg.exp[s.i].d)) ? "ok" : "bad");
      div.addEventListener("click", () => onSlotClick(s.i, div));
      fo.appendChild(div); svg.appendChild(fo);
      anchorFO(fo, div, w, h);
    });
  }
  function onSlotClick(idx, div) {
    if (TG.sel) { tg.assigned[idx] = TG.sel.val; clearSel(); afterEdit(); }
    else if (tg.assigned[idx]) { tg.assigned[idx] = null; afterEdit(); }
  }
  function afterEdit() { tg.checked = false; tg.solved = false; els.tgFinal.classList.add("hidden"); els.tgFeedback.textContent = ""; els.tgFeedback.className = "pg-feedback"; renderTree(); }
  function clearSel() { if (TG.sel) TG.sel.el.classList.remove("used"); TG.sel = null; }

  function renderChips() {
    const box = els.tgChips; clear(box);
    tg.chips.forEach((f) => {
      const chip = document.createElement("button");
      chip.className = "pg-chip"; km(chip, fracTex(f));
      chip.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        chip.classList.add("dragging");
        ghostDrag(fracTex(f), e,
          (ev) => {
            els.tgTree.querySelectorAll(".pg-slot").forEach((s) => s.classList.remove("hover"));
            const slot = slotUnder(ev); if (slot) slot.classList.add("hover");
          },
          (ev, moved) => {
            chip.classList.remove("dragging");
            els.tgTree.querySelectorAll(".pg-slot").forEach((s) => s.classList.remove("hover"));
            if (moved) { const slot = slotUnder(ev); if (slot) { tg.assigned[+slot.dataset.idx] = f; afterEdit(); } }
            else { // click = pick up / put down
              if (TG.sel && TG.sel.el === chip) clearSel();
              else { clearSel(); TG.sel = { val: f, el: chip }; chip.classList.add("used"); }
            }
          });
      });
      box.appendChild(chip);
    });
  }

  function checkBranches() {
    if (tg.assigned.some((v) => !v)) { els.tgFeedback.textContent = "Fill in every branch first."; els.tgFeedback.className = "pg-feedback bad"; return; }
    tg.checked = true;
    const wrong = tg.assigned.filter((v, i) => !feq(v, fr(tg.exp[i].n, tg.exp[i].d))).length;
    renderTree();
    if (wrong === 0) {
      els.tgFeedback.textContent = "All branches correct \u2713 now choose the final answer.";
      els.tgFeedback.className = "pg-feedback ok";
      revealFinal();
    } else {
      els.tgFeedback.textContent = wrong + (wrong === 1 ? " branch" : " branches") + " need a rethink \u2014 mind the replacement rule.";
      els.tgFeedback.className = "pg-feedback bad";
    }
  }

  function revealFinal() {
    const ev = tg.ev, exp = tg.exp, other = BALL_NAME[tg.otherCol];
    const prob = eventProb(exp, ev);
    const work = "P = " + fracTex(prob);
    // multiple-choice answers
    const altExp = expectedFor(tg.a, tg.b, tg.total, !tg.replace);
    const seen = {}; const opts = [];
    const push = (f) => { if (!f || f.d <= 0 || f.n < 0 || f.n > f.d) return; const k = fracKey(f); if (seen[k]) return; seen[k] = 1; opts.push(fr(f.n, f.d)); };
    push(prob);
    push(eventProb(altExp, ev));                          // wrong replacement assumption
    if (ev.op === "mul") push(fadd(fr(exp[ev.legs[0][0]].n, exp[ev.legs[0][0]].d), fr(exp[ev.legs[0][1]].n, exp[ev.legs[0][1]].d)));  // added instead of multiplied
    push(fsub(fr(1, 1), prob));                            // complement slip
    const dens = [tg.total, tg.total - 1, tg.total * (tg.total - 1), 2 * tg.total, 4, 6, 8];
    let guard = 0;
    while (opts.length < 4 && guard++ < 300) { const d = dens[ri(0, dens.length - 1)]; push(fr(ri(1, Math.max(1, d - 1)), d)); }
    const choices = shuffle(opts.slice(0, 4));

    const evl = ev.label.replace("OTHER", other);
    let html = '<h4>Final answer</h4><div class="pg-work" id="tg-work"></div>' +
      '<p class="pg-tray-label">P(' + evl + ') = ?</p><div class="pg-mc" id="tg-mc"></div>';
    els.tgFinal.innerHTML = html;
    els.tgFinal.classList.remove("hidden");
    km(document.getElementById("tg-work"), work);
    const mc = document.getElementById("tg-mc");
    choices.forEach((f) => {
      const b = document.createElement("button");
      b.className = "pg-mc-btn"; b._frac = f; km(b, fracTex(f));
      b.addEventListener("click", () => pickAnswer(b, f, prob, mc));
      mc.appendChild(b);
    });
  }
  function pickAnswer(btn, f, prob, mc) {
    if (tg.solved) return;
    tg.solved = true;
    Array.prototype.forEach.call(mc.children, (b) => {
      b.disabled = true;
      if (feq(b._frac, prob)) b.classList.add("ok");   // always reveal the right answer
    });
    if (feq(f, prob)) {
      TG.score++; TG.streak++;
      els.tgFeedback.textContent = "Correct! \uD83C\uDF89  +1"; els.tgFeedback.className = "pg-feedback ok";
    } else {
      btn.classList.add("bad"); TG.streak = 0;
      els.tgFeedback.textContent = "Not quite \u2014 check the final probability above."; els.tgFeedback.className = "pg-feedback bad";
    }
    els.tgScore.textContent = TG.score; els.tgStreak.textContent = TG.streak;
  }

  /* ═══════════════════════════ MODE B: Bag Designer ═══════════════════════════ */
  const BG = { mounted: false, score: 0 };
  const TARGETS = [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [3, 5], [1, 5], [3, 8], [5, 8], [1, 6], [5, 6]];
  let bg = null;
  function newTarget() {
    const t = TARGETS[ri(0, TARGETS.length - 1)];
    bg = { target: fr(t[0], t[1]), counts: { R: 1, G: 1, B: 0 }, solved: false };
    els.bgFeedback.textContent = ""; els.bgFeedback.className = "pg-feedback";
    els.bgSim.classList.add("hidden");
    renderTarget(); renderCounters(); renderBag();
  }
  function renderTarget() {
    els.bgTarget.innerHTML = 'Design a bag so the chance of drawing <b>red</b> is exactly <span id="bg-tt"></span>.';
    km(document.getElementById("bg-tt"), fracTex(bg.target));
  }
  function bagTotal() { return bg.counts.R + bg.counts.G + bg.counts.B; }
  function renderCounters() {
    const box = els.bgCounters; clear(box);
    ["R", "G", "B"].forEach((col) => {
      const row = document.createElement("div");
      row.className = "pg-counter";
      row.innerHTML = '<span class="lbl"><span class="bb-ball" style="width:16px;height:16px;background:' + BALL[col] + '"></span>' +
        BALL_NAME[col].charAt(0).toUpperCase() + BALL_NAME[col].slice(1) + '</span>';
      const step = document.createElement("div");
      step.className = "stepper";
      const minus = document.createElement("button"); minus.className = "step-btn"; minus.textContent = "\u2212";
      const val = document.createElement("span"); val.className = "step-val"; val.textContent = bg.counts[col];
      const plus = document.createElement("button"); plus.className = "step-btn"; plus.textContent = "+";
      minus.addEventListener("click", () => { if (bg.counts[col] > 0) { bg.counts[col]--; onBagEdit(); } });
      plus.addEventListener("click", () => { if (bg.counts[col] < 9) { bg.counts[col]++; onBagEdit(); } });
      step.appendChild(minus); step.appendChild(val); step.appendChild(plus);
      row.appendChild(step); box.appendChild(row);
    });
  }
  function onBagEdit() { bg.solved = false; els.bgFeedback.textContent = ""; els.bgFeedback.className = "pg-feedback"; els.bgSim.classList.add("hidden"); renderCounters(); renderBag(); }

  function polar(cx, cy, r, deg) { const a = (deg - 90) * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }
  function sector(svg, cx, cy, r, a0, a1, fill) {
    if (a1 - a0 >= 359.999) { svg.appendChild(E("circle", { cx, cy, r, fill })); return; }
    const p0 = polar(cx, cy, r, a0), p1 = polar(cx, cy, r, a1);
    const large = (a1 - a0) > 180 ? 1 : 0;
    svg.appendChild(E("path", { d: "M" + cx + " " + cy + " L" + p0[0] + " " + p0[1] + " A" + r + " " + r + " 0 " + large + " 1 " + p1[0] + " " + p1[1] + " Z",
      fill, stroke: "#0b1324", "stroke-width": 1.5 }));
  }
  function renderBag() {
    const total = bagTotal();
    const svg = els.bgSpinner; clear(svg);
    const cx = 110, cy = 110, r = 92;
    if (total === 0) {
      svg.appendChild(E("circle", { cx, cy, r, fill: "#1b2945", stroke: C.line, "stroke-width": 2 }));
      const t = E("text", { x: cx, y: cy, "text-anchor": "middle", "dominant-baseline": "middle", "font-size": 13, fill: C.dim });
      t.textContent = "empty"; svg.appendChild(t);
    } else {
      let ang = 0;
      ["R", "G", "B"].forEach((col) => {
        const frac = bg.counts[col] / total; if (frac <= 0) return;
        const span = frac * 360; sector(svg, cx, cy, r, ang, ang + span, BALL[col]); ang += span;
      });
    }
    svg.appendChild(E("circle", { cx, cy, r: 6, fill: "#0b1324", stroke: "#fff", "stroke-width": 1.5 }));

    // ball preview row
    const box = els.bgBalls; clear(box);
    if (total === 0) { const e = document.createElement("span"); e.className = "empty"; e.textContent = "Add balls with the steppers \u2192"; box.appendChild(e); }
    else ["R", "G", "B"].forEach((col) => { for (let i = 0; i < bg.counts[col]; i++) {
      const b = document.createElement("span"); b.className = "bb-ball"; b.style.cssText = "width:18px;height:18px;background:" + BALL[col]; box.appendChild(b);
    } });

    // readout
    clear(els.bgReadout);
    const sub = document.createElement("div"); sub.className = "pg-sub"; sub.textContent = "Chance of red"; els.bgReadout.appendChild(sub);
    const prob = document.createElement("div"); prob.className = "pg-prob";
    if (total === 0) km(prob, "P(\\text{red}) = \\text{--}");
    else { const p = fr(bg.counts.R, total); km(prob, "P(\\text{red}) = \\frac{" + bg.counts.R + "}{" + total + "} = " + fracTex(p) + " = " + fnum(p).toFixed(3)); }
    els.bgReadout.appendChild(prob);
  }
  function checkBag() {
    const total = bagTotal();
    if (total === 0) { els.bgFeedback.textContent = "The bag is empty \u2014 add some balls."; els.bgFeedback.className = "pg-feedback bad"; return; }
    const p = fr(bg.counts.R, total);
    if (feq(p, bg.target)) {
      if (!bg.solved) { bg.solved = true; BG.score++; els.bgScore.textContent = BG.score; }
      els.bgFeedback.textContent = "Perfect \u2014 that bag gives P(red) = " + bg.target.n + "/" + bg.target.d + " \u2713";
      els.bgFeedback.className = "pg-feedback ok";
    } else {
      const cmp = fnum(p) > fnum(bg.target) ? "too high" : "too low";
      els.bgFeedback.textContent = "Not yet \u2014 P(red) is " + cmp + ". Target is " + bg.target.n + "/" + bg.target.d + ".";
      els.bgFeedback.className = "pg-feedback bad";
    }
  }
  function spinBag() {
    const total = bagTotal();
    if (total === 0) { els.bgFeedback.textContent = "Add balls before spinning."; els.bgFeedback.className = "pg-feedback bad"; return; }
    const N = 200; let reds = 0;
    for (let i = 0; i < N; i++) { if (Math.random() * total < bg.counts.R) reds++; }
    const exp = (reds / N), theo = bg.counts.R / total;
    els.bgSim.classList.remove("hidden");
    els.bgSim.innerHTML = "Spun <span class=\"num\">" + N + "\u00d7</span>: drew red <span class=\"num\">" + reds + "</span> times \u2192 experimental P \u2248 <span class=\"num\">" + exp.toFixed(3) +
      "</span><br>Theoretical P(red) = <span class=\"num\">" + theo.toFixed(3) + "</span> \u00b7 target = <span class=\"num\">" + fnum(bg.target).toFixed(3) +
      "</span>. <span style=\"color:#94a3b8\">More spins \u2192 experimental gets closer to theoretical.</span>";
  }

  /* ═══════════════════════════ MODE C: Betting Game ═══════════════════════════ */
  const fmtNum = (x) => { const r = Math.round(x * 100) / 100; return Number.isInteger(r) ? String(r) : String(r); };
  let bet = null;
  function makeOption() {
    const lo = [20, 30, 40][ri(0, 2)];
    const hiPool = [50, 60, 70, 80, 100].filter((h) => h >= lo + 20);
    const hi = hiPool[ri(0, hiPool.length - 1)];
    const p = [30, 40, 50, 60, 70][ri(0, 4)];
    return { p, hi, lo, ev: p / 100 * hi + (100 - p) / 100 * lo };
  }
  function newBet(useExample) {
    let A, B;
    if (useExample) { A = { p: 50, hi: 100, lo: 30, ev: 65 }; B = { p: 70, hi: 50, lo: 30, ev: 44 }; }
    else {
      let guard = 0;
      do { A = makeOption(); B = makeOption(); guard++; }
      while ((Math.abs(A.ev - B.ev) < 6 || (A.p === B.p && A.hi === B.hi && A.lo === B.lo)) && guard < 200);
    }
    bet = { A, B, round: 1, total: 0, log: [], busy: false, done: false, chosenSide: null };
    els.btReveal.classList.add("hidden"); els.btReveal.innerHTML = "";
    els.btResult.className = "bt-result"; els.btResult.textContent = "Pick a side to spin the wheel.";
    els.btFeedback.textContent = ""; els.btFeedback.className = "pg-feedback";
    els.btNext.disabled = true; els.btNext.textContent = "Next round";
    renderBetCards(); drawWheel(null); updateBetStatus();
  }
  function updateBetStatus() {
    els.btRound.textContent = bet.round; els.btTotal.textContent = "$" + bet.total;
    els.btStatus.innerHTML = bet.done ? "Game over \u2014 see the expected-value verdict below."
      : "Round <b>" + bet.round + "</b> of 3: choose <b>Left</b> or <b>Right</b>. The wheel spins by the real odds.";
  }
  function optionCardHTML(side, o) {
    const name = side === "A" ? "Option A" : "Option B", sideLbl = side === "A" ? "Left" : "Right";
    return '<span class="bt-side">' + sideLbl + '</span><div class="bt-name">' + name + '</div>' +
      '<div class="bt-out"><span class="pct">' + o.p + '%</span><span class="arr">\u2192</span><span class="pay">$' + o.hi + '</span></div>' +
      '<div class="bt-out"><span class="pct">' + (100 - o.p) + '%</span><span class="arr">\u2192</span><span class="pay">$' + o.lo + '</span></div>' +
      '<div class="bt-bar"><i style="width:' + o.p + '%;background:#66BB6A"></i><i style="width:' + (100 - o.p) + '%;background:#FFD54F"></i></div>';
  }
  function renderBetCards() {
    els.btA.innerHTML = optionCardHTML("A", bet.A); els.btB.innerHTML = optionCardHTML("B", bet.B);
    [els.btA, els.btB].forEach((c) => { c.classList.remove("chosen"); c.disabled = bet.busy || bet.done; });
  }
  function secLabel(g, cx, cy, rr, deg, txt) {
    const p = polar(cx, cy, rr, deg);
    const t = E("text", { x: p[0], y: p[1], "text-anchor": "middle", "dominant-baseline": "middle",
      "font-size": 16, "font-weight": 700, fill: "#0b1324", "font-family": "JetBrains Mono, monospace" });
    t.textContent = txt; g.appendChild(t);
  }
  function drawWheel(o) {
    const svg = els.btWheel; clear(svg); const cx = 110, cy = 110, r = 92;
    if (!o) {
      svg.appendChild(E("circle", { cx, cy, r, fill: "#1b2945", stroke: C.line, "stroke-width": 2 }));
      const t = E("text", { x: cx, y: cy, "text-anchor": "middle", "dominant-baseline": "middle", "font-size": 30, fill: C.dim });
      t.textContent = "?"; svg.appendChild(t);
    } else {
      const g = E("g", { transform: "rotate(0 110 110)" });
      const hiSpan = o.p * 3.6;
      sector(g, cx, cy, r, 0, hiSpan, "#66BB6A");
      sector(g, cx, cy, r, hiSpan, 360, "#FFD54F");
      secLabel(g, cx, cy, r * 0.6, hiSpan / 2, "$" + o.hi);
      secLabel(g, cx, cy, r * 0.6, (hiSpan + 360) / 2, "$" + o.lo);
      svg.appendChild(g); svg._rot = g;
    }
    svg.appendChild(E("circle", { cx, cy, r: 8, fill: "#0b1324", stroke: "#fff", "stroke-width": 1.5 }));
    svg.appendChild(E("path", { d: "M110 30 L100 4 L120 4 Z", fill: "#f06292", stroke: "#0b1324", "stroke-width": 1.5 }));
  }
  function animateRot(g, from, to, dur, done) {
    if (!g) { if (done) done(); return; }
    const t0 = performance.now();
    (function frame(now) {
      const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      g.setAttribute("transform", "rotate(" + (from + (to - from) * e) + " 110 110)");
      if (k < 1) requestAnimationFrame(frame); else if (done) done();
    })(t0);
  }
  function pickBet(side) {
    if (bet.busy || bet.done) return;
    const o = bet[side];
    bet.busy = true; bet.chosenSide = side;
    renderBetCards();
    (side === "A" ? els.btA : els.btB).classList.add("chosen");
    els.btA.disabled = els.btB.disabled = true;
    els.btResult.className = "bt-result"; els.btResult.textContent = "Spinning\u2026";
    drawWheel(o);
    const hit = Math.random() * 100 < o.p;       // strict random by the real odds
    const payout = hit ? o.hi : o.lo;
    const hiSpan = o.p * 3.6;
    const a0 = hit ? 0 : hiSpan, a1 = hit ? hiSpan : 360;
    const mid = a0 + (a1 - a0) * (0.2 + Math.random() * 0.6);
    const R = 360 * 4 + ((360 - mid) % 360);
    animateRot(els.btWheel._rot, 0, R, 2100, () => finishSpin(side, o, hit, payout));
  }
  function finishSpin(side, o, hit, payout) {
    bet.total += payout;
    bet.log.push({ round: bet.round, side, payout });
    bet.busy = false;
    els.btResult.innerHTML = "Landed on <span class=\"win\">$" + payout + "</span> \u2014 the " +
      (hit ? o.p : 100 - o.p) + "% outcome of Option " + side + ".";
    updateBetStatus();
    els.btNext.disabled = false;
    els.btNext.textContent = bet.round >= 3 ? "Reveal expected value" : "Next round";
  }
  function nextBetRound() {
    if (bet.busy) return;
    if (bet.round >= 3) { revealBet(); return; }
    bet.round++; bet.chosenSide = null;
    els.btResult.className = "bt-result"; els.btResult.textContent = "Pick a side to spin the wheel.";
    els.btNext.disabled = true; els.btNext.textContent = "Next round";
    drawWheel(null); renderBetCards(); updateBetStatus();
  }
  function revealBet() {
    bet.done = true; els.btA.disabled = els.btB.disabled = true; updateBetStatus();
    const A = bet.A, B = bet.B, better = A.ev >= B.ev ? "A" : "B", worse = better === "A" ? "B" : "A";
    const bo = bet[better], wo = bet[worse];
    const evTex = (o) => "E = " + (o.p / 100) + "\\times" + o.hi + " + " + ((100 - o.p) / 100) + "\\times" + o.lo + " = \\$" + fmtNum(o.ev);
    const logHtml = bet.log.map((l) => "Round " + l.round + ": chose <span class=\"r\">" + l.side + "</span> \u2192 won <span class=\"r\">$" + l.payout + "</span>").join("<br>");
    const chosenBetter = bet.log.filter((l) => l.side === better).length;
    els.btReveal.innerHTML =
      '<h4>Expected value \u2014 which side was smarter?</h4>' +
      '<div class="bt-reveal-grid">' +
        '<div class="bt-ev ' + (better === "A" ? "best" : "") + '"><div class="ev-name">Option A' + (better === "A" ? ' <span class="tag">higher EV</span>' : '') + '</div><div class="ev-eq" id="bt-evA"></div></div>' +
        '<div class="bt-ev ' + (better === "B" ? "best" : "") + '"><div class="ev-name">Option B' + (better === "B" ? ' <span class="tag">higher EV</span>' : '') + '</div><div class="ev-eq" id="bt-evB"></div></div>' +
      '</div>' +
      '<div class="bt-log">' + logHtml + '<br><b>Your total over 3 rounds: $' + bet.total + '</b></div>' +
      '<div class="bt-verdict">Option <b>' + better + '</b> has the higher expected value ($' + fmtNum(bo.ev) + ' per round vs $' + fmtNum(wo.ev) +
        '). Always picking it averages <b>$' + fmtNum(3 * bo.ev) + '</b> over 3 rounds. You chose the higher-EV side in <b>' + chosenBetter +
        ' of 3</b> rounds. <span style="color:#94a3b8">Luck decides a single spin, but expected value is the smart long-run pathway.</span></div>';
    els.btReveal.classList.remove("hidden");
    km(document.getElementById("bt-evA"), evTex(A));
    km(document.getElementById("bt-evB"), evTex(B));
    els.btNext.disabled = true;
  }

  /* ═══════════════════════════ mount / wiring ═══════════════════════════ */
  let els = {};
  function bindOnce() {
    els = {
      // tree
      tgScenario: document.getElementById("tg-scenario"), tgTree: document.getElementById("tg-tree"),
      tgChips: document.getElementById("tg-chips"), tgCheck: document.getElementById("tg-check"),
      tgFeedback: document.getElementById("tg-feedback"), tgFinal: document.getElementById("tg-final"),
      tgScore: document.getElementById("tg-score"), tgStreak: document.getElementById("tg-streak"), tgNew: document.getElementById("tg-new"),
      // bag
      bgTarget: document.getElementById("bg-target"), bgSpinner: document.getElementById("bg-spinner"),
      bgBalls: document.getElementById("bg-balls"), bgCounters: document.getElementById("bg-counters"),
      bgReadout: document.getElementById("bg-readout"), bgCheck: document.getElementById("bg-check"),
      bgSpin: document.getElementById("bg-spin"), bgFeedback: document.getElementById("bg-feedback"),
      bgSim: document.getElementById("bg-sim"), bgScore: document.getElementById("bg-score"), bgNew: document.getElementById("bg-new"),
      // bet
      btStatus: document.getElementById("bt-status"), btRound: document.getElementById("bt-round"), btTotal: document.getElementById("bt-total"),
      btNew: document.getElementById("bt-new"), btA: document.getElementById("bt-A"), btB: document.getElementById("bt-B"),
      btWheel: document.getElementById("bt-wheel"), btResult: document.getElementById("bt-result"),
      btNext: document.getElementById("bt-next"), btFeedback: document.getElementById("bt-feedback"), btReveal: document.getElementById("bt-reveal"),
      modeBtns: Array.prototype.slice.call(document.querySelectorAll("[data-game]")),
      gameTree: document.getElementById("game-tree"), gameBag: document.getElementById("game-bag"), gameBet: document.getElementById("game-bet"),
    };
    els.tgCheck.addEventListener("click", checkBranches);
    els.tgNew.addEventListener("click", () => { tg.solved = false; newTree(); });
    els.bgCheck.addEventListener("click", checkBag);
    els.bgSpin.addEventListener("click", spinBag);
    els.bgNew.addEventListener("click", newTarget);
    els.btA.addEventListener("click", () => pickBet("A"));
    els.btB.addEventListener("click", () => pickBet("B"));
    els.btNext.addEventListener("click", nextBetRound);
    els.btNew.addEventListener("click", () => newBet(false));
    els.modeBtns.forEach((b) => b.addEventListener("click", () => setMode(b.dataset.game)));
  }
  function setMode(mode) {
    els.modeBtns.forEach((b) => b.classList.toggle("active", b.dataset.game === mode));
    els.gameTree.style.display = mode === "tree" ? "" : "none";
    els.gameBag.style.display = mode === "bag" ? "" : "none";
    els.gameBet.style.display = mode === "bet" ? "" : "none";
  }

  const Game = {
    mounted: false,
    mount() {
      if (this.mounted) return;
      if (!document.getElementById("tg-tree")) return;
      this.mounted = true;
      bindOnce();
      newTree();
      newTarget();
      newBet(true);
      setMode("tree");
    },
    show() { this.mount(); },
  };
  window.ProbGame = Game;
})();
