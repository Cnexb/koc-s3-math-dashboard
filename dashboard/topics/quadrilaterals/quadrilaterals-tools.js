(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var SW = 2.5;
  var INK = "#e2e8f0";
  var MUTED = "#94a3b8";
  var ACCENT = "#38bdf8";
  var GOOD = "#4ade80";
  var MARK = "#fbbf24";
  var TICK = "#f87171";
  var VIOLET = "#a78bfa";

  var LABS = [
    { id: "para", label: "Parallelogram" },
    { id: "family", label: "Shape family" },
    { id: "midpt", label: "Mid-pt. thm." },
    { id: "intercept", label: "Intercept thm." },
    { id: "reasons", label: "Reason bank" },
  ];

  /* ── helpers ─────────────────────────────────────────────── */
  function E(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    return el;
  }
  function clr(svg) { while (svg.firstChild) svg.removeChild(svg.firstChild); }
  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function mid(a, b) { return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; }
  function add(a, b) { return { x: a.x + b.x, y: a.y + b.y }; }
  function sub(a, b) { return { x: a.x - b.x, y: a.y - b.y }; }
  function scale(v, k) { return { x: v.x * k, y: v.y * k }; }
  function unit(a, b) {
    var d = dist(a, b) || 1;
    return { x: (b.x - a.x) / d, y: (b.y - a.y) / d };
  }
  function perp(v) { return { x: -v.y, y: v.x }; }
  function lerp(a, b, t) { return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function fmt(n, d) {
    d = d == null ? 1 : d;
    var p = Math.pow(10, d);
    return String(Math.round(n * p) / p);
  }
  function almost(a, b, eps) { return Math.abs(a - b) < (eps == null ? 1e-6 : eps); }

  function renderMixed(el, text) {
    if (!el) return;
    el.textContent = "";
    String(text || "").split(/(\*\*[^*]+\*\*)/).forEach(function (part) {
      if (!part) return;
      if (part.indexOf("**") === 0) {
        var s = document.createElement("strong");
        s.textContent = part.slice(2, -2);
        el.appendChild(s);
      } else {
        el.appendChild(document.createTextNode(part));
      }
    });
    if (window.renderMathInElement) {
      window.renderMathInElement(el, {
        delimiters: [
          { left: "\\(", right: "\\)", display: false },
          { left: "\\[", right: "\\]", display: true },
        ],
      });
    }
  }

  function setHtmlMath(el, html) {
    if (!el) return;
    el.innerHTML = html;
    if (window.renderMathInElement) {
      window.renderMathInElement(el, {
        delimiters: [
          { left: "\\(", right: "\\)", display: false },
          { left: "\\[", right: "\\]", display: true },
        ],
      });
    }
  }

  function svgPoint(svg, e) {
    var r = svg.getBoundingClientRect();
    var vb = svg.viewBox.baseVal;
    return {
      x: (e.clientX - r.left) * (vb.width / r.width),
      y: (e.clientY - r.top) * (vb.height / r.height),
    };
  }

  function seg(a, b, stroke, w) {
    return E("line", {
      x1: a.x, y1: a.y, x2: b.x, y2: b.y,
      stroke: stroke || INK, "stroke-width": w || SW, "stroke-linecap": "round",
    });
  }

  function labelAt(p, text, dx, dy, fill) {
    var t = E("text", {
      x: p.x + (dx || 0), y: p.y + (dy || 0),
      fill: fill || INK, "font-size": 14, "font-weight": 700,
    });
    t.textContent = text;
    return t;
  }

  function handle(p, i, fill) {
    var g = E("g", {});
    g.appendChild(E("circle", {
      cx: p.x, cy: p.y, r: 8,
      fill: fill || MARK, stroke: "#0f172a", "stroke-width": 2,
    }));
    g.appendChild(E("circle", {
      cx: p.x, cy: p.y, r: 18, fill: "transparent", "data-i": String(i),
    }));
    return g;
  }

  function tickMark(a, b, n, color) {
    var g = E("g", {});
    var m = mid(a, b);
    var u = unit(a, b);
    var nrm = perp(u);
    var len = 7;
    for (var k = 0; k < n; k++) {
      var c = add(m, scale(u, (k - (n - 1) / 2) * 5));
      var p1 = add(c, scale(nrm, len));
      var p2 = add(c, scale(nrm, -len));
      g.appendChild(seg(p1, p2, color || TICK, 2));
    }
    return g;
  }

  function arrowMark(a, b, color) {
    var g = E("g", {});
    var m = mid(a, b);
    var u = unit(a, b);
    var nrm = perp(u);
    var tip = add(m, scale(u, 6));
    var left = add(add(m, scale(u, -4)), scale(nrm, 5));
    var right = add(add(m, scale(u, -4)), scale(nrm, -5));
    g.appendChild(E("polygon", {
      points: [tip, left, right].map(function (p) { return p.x + "," + p.y; }).join(" "),
      fill: color || GOOD,
    }));
    return g;
  }

  function parallelMarks(a, b, c, d, n) {
    var g = E("g", {});
    g.appendChild(arrowMark(a, b, GOOD));
    if (n > 1) {
      var m1 = mid(a, b);
      var u1 = unit(a, b);
      var shift = scale(perp(u1), 0);
      // second chevron slightly offset along the side
      var a2 = add(a, scale(u1, 10));
      var b2 = add(b, scale(u1, -10));
      g.appendChild(arrowMark(a2, b2, GOOD));
    }
    g.appendChild(arrowMark(c, d, GOOD));
    if (n > 1) {
      var u2 = unit(c, d);
      var c2 = add(c, scale(u2, 10));
      var d2 = add(d, scale(u2, -10));
      g.appendChild(arrowMark(c2, d2, GOOD));
    }
    return g;
  }

  function rightAngleMark(corner, fromA, fromB, size) {
    size = size || 12;
    var u = unit(corner, fromA);
    var v = unit(corner, fromB);
    var p1 = add(corner, scale(u, size));
    var p2 = add(p1, scale(v, size));
    var p3 = add(corner, scale(v, size));
    return E("polyline", {
      points: [p1, p2, p3].map(function (p) { return p.x + "," + p.y; }).join(" "),
      fill: "none", stroke: MARK, "stroke-width": 2,
    });
  }

  function angleArc(vertex, pA, pB, r, color) {
    var u = unit(vertex, pA);
    var v = unit(vertex, pB);
    var a1 = Math.atan2(u.y, u.x);
    var a2 = Math.atan2(v.y, v.x);
    var d = a2 - a1;
    while (d <= -Math.PI) d += 2 * Math.PI;
    while (d > Math.PI) d -= 2 * Math.PI;
    var large = Math.abs(d) > Math.PI ? 1 : 0;
    var sweep = d > 0 ? 1 : 0;
    var start = add(vertex, scale(u, r));
    var end = add(vertex, scale(v, r));
    return E("path", {
      d: "M " + start.x + " " + start.y + " A " + r + " " + r + " 0 " + large + " " + sweep + " " + end.x + " " + end.y,
      fill: "none", stroke: color || VIOLET, "stroke-width": 2.5,
    });
  }

  function makeButtons(row, items, activeId, onClick) {
    if (!row) return;
    row.innerHTML = "";
    items.forEach(function (it) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "btn" + (it.id === activeId ? " active" : "");
      b.textContent = it.label;
      b.addEventListener("click", function () { onClick(it.id); });
      row.appendChild(b);
    });
  }

  function makeChips(row, items, activeId, onClick) {
    if (!row) return;
    row.innerHTML = "";
    items.forEach(function (it) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "chip" + (it.id === activeId ? " active" : "");
      b.textContent = it.label;
      b.addEventListener("click", function () { onClick(it.id); });
      row.appendChild(b);
    });
  }

  /* ── Lab nav ─────────────────────────────────────────────── */
  function setActiveLab(id) {
    var nav = document.getElementById("jm29-lab-nav");
    makeChips(nav, LABS, id, setActiveLab);
    document.querySelectorAll("#panel-tools .lab").forEach(function (lab) {
      lab.classList.toggle("active", lab.id === "lab-" + id);
    });
    if (id === "para") { renderPara(); renderProof(); renderProve(); }
    if (id === "family") { renderFamily(); }
    if (id === "midpt") { renderMid(); }
    if (id === "intercept") { renderInt(); renderProp(); }
    if (id === "reasons") { renderReasons(); }
  }

  /* ═══════════════════════════════════════════════════════════
     LAB 1 — Parallelogram
     ═══════════════════════════════════════════════════════════ */
  var PARA_PRESETS = {
    standard: [
      { x: 110, y: 240 }, { x: 330, y: 240 }, { x: 400, y: 90 }, { x: 180, y: 90 },
    ],
    skewed: [
      { x: 80, y: 250 }, { x: 300, y: 260 }, { x: 420, y: 80 }, { x: 200, y: 70 },
    ],
    tall: [
      { x: 150, y: 280 }, { x: 320, y: 280 }, { x: 380, y: 60 }, { x: 210, y: 60 },
    ],
  };

  var paraVerts = PARA_PRESETS.standard.map(function (p) { return { x: p.x, y: p.y }; });
  var paraProp = "oppSides";
  var paraDrag = null;

  var PARA_PROPS = [
    {
      id: "oppSides",
      label: "Opposite sides equal",
      code: "[opp. sides of //gram]",
      note: "In parallelogram \\(ABCD\\): \\(AB = CD\\) and \\(AD = BC\\). Write **[opp. sides of //gram]**.",
    },
    {
      id: "oppAng",
      label: "Opposite angles equal",
      code: "[opp. ∠s of //gram]",
      note: "\\(\\angle A = \\angle C\\) and \\(\\angle B = \\angle D\\). Consecutive angles are supplementary: \\(\\angle A + \\angle B = 180^\\circ\\) (int. ∠s, // lines).",
    },
    {
      id: "diags",
      label: "Diagonals bisect each other",
      code: "[diags. of //gram]",
      note: "Diagonals \\(AC\\) and \\(BD\\) meet at \\(O\\) with \\(AO = OC\\) and \\(BO = OD\\). Write **[diags. of //gram]**.",
    },
    {
      id: "parallel",
      label: "Opposite sides parallel",
      code: "definition",
      note: "**Definition:** a parallelogram has **both pairs** of opposite sides parallel: \\(AB \\parallel CD\\) and \\(AD \\parallel BC\\).",
    },
  ];

  function forceParallelogram(verts, dragIndex) {
    // ABCD is a parallelogram ⇔ A + C = B + D
    var A = verts[0], B = verts[1], C = verts[2], D = verts[3];
    if (dragIndex === 0) {
      verts[3] = { x: A.x + C.x - B.x, y: A.y + C.y - B.y };
    } else if (dragIndex === 1) {
      verts[2] = { x: B.x + D.x - A.x, y: B.y + D.y - A.y };
    } else if (dragIndex === 2) { // C moved → adjust D
      verts[3] = { x: A.x + C.x - B.x, y: A.y + C.y - B.y };
    } else if (dragIndex === 3) { // D moved → adjust C
      verts[2] = { x: B.x + D.x - A.x, y: B.y + D.y - A.y };
    }
    // clamp
    verts.forEach(function (p) {
      p.x = clamp(p.x, 40, 460);
      p.y = clamp(p.y, 40, 300);
    });
  }

  function renderParaProps() {
    var grid = document.getElementById("para-prop-btns");
    if (!grid) return;
    grid.innerHTML = "";
    PARA_PROPS.forEach(function (p) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "prop-card" + (p.id === paraProp ? " active" : "");
      b.innerHTML = p.label + '<span class="code">' + p.code + "</span>";
      b.addEventListener("click", function () {
        paraProp = p.id;
        renderParaProps();
        renderPara();
      });
      grid.appendChild(b);
    });
  }

  function renderPara() {
    var svg = document.getElementById("para-svg");
    if (!svg) return;
    clr(svg);
    var A = paraVerts[0], B = paraVerts[1], C = paraVerts[2], D = paraVerts[3];
    var O = mid(A, C);

    svg.appendChild(E("polygon", {
      points: [A, B, C, D].map(function (p) { return p.x + "," + p.y; }).join(" "),
      fill: "rgba(56,189,248,.1)", stroke: "none",
    }));

    var sides = [[A, B], [B, C], [C, D], [D, A]];
    sides.forEach(function (s, i) {
      var col = (paraProp === "parallel") ? GOOD : INK;
      svg.appendChild(seg(s[0], s[1], col, paraProp === "parallel" ? 3.5 : SW));
    });

    if (paraProp === "parallel" || paraProp === "oppSides") {
      svg.appendChild(parallelMarks(A, B, D, C, 1));
      svg.appendChild(parallelMarks(A, D, B, C, 2));
    }
    if (paraProp === "oppSides") {
      svg.appendChild(tickMark(A, B, 1));
      svg.appendChild(tickMark(D, C, 1));
      svg.appendChild(tickMark(A, D, 2));
      svg.appendChild(tickMark(B, C, 2));
    }
    if (paraProp === "oppAng") {
      svg.appendChild(angleArc(A, B, D, 28, VIOLET));
      svg.appendChild(angleArc(C, B, D, 28, VIOLET));
      svg.appendChild(angleArc(B, A, C, 22, MARK));
      svg.appendChild(angleArc(D, A, C, 22, MARK));
    }
    if (paraProp === "diags") {
      svg.appendChild(seg(A, C, ACCENT, 2));
      svg.appendChild(seg(B, D, ACCENT, 2));
      svg.appendChild(tickMark(A, O, 1, ACCENT));
      svg.appendChild(tickMark(O, C, 1, ACCENT));
      svg.appendChild(tickMark(B, O, 2, TICK));
      svg.appendChild(tickMark(O, D, 2, TICK));
      svg.appendChild(E("circle", { cx: O.x, cy: O.y, r: 5, fill: MARK }));
      svg.appendChild(labelAt(O, "O", 8, -8, MARK));
    }

    ["A", "B", "C", "D"].forEach(function (name, i) {
      var p = paraVerts[i];
      svg.appendChild(handle(p, i));
      var off = [
        { x: -18, y: 18 }, { x: 10, y: 18 }, { x: 10, y: -10 }, { x: -18, y: -10 },
      ][i];
      svg.appendChild(labelAt(p, name, off.x, off.y));
    });

    var prop = PARA_PROPS.filter(function (p) { return p.id === paraProp; })[0];
    renderMixed(document.getElementById("para-caption"), prop ? prop.label : "");
    renderMixed(document.getElementById("para-note"), prop ? prop.note : "");
  }

  function bindParaDrag() {
    var svg = document.getElementById("para-svg");
    if (!svg) return;
    svg.addEventListener("pointerdown", function (e) {
      if (e.target.dataset.i != null) {
        paraDrag = +e.target.dataset.i;
        e.target.setPointerCapture(e.pointerId);
      }
    });
    svg.addEventListener("pointermove", function (e) {
      if (paraDrag == null) return;
      var p = svgPoint(svg, e);
      paraVerts[paraDrag].x = clamp(p.x, 40, 460);
      paraVerts[paraDrag].y = clamp(p.y, 40, 300);
      forceParallelogram(paraVerts, paraDrag);
      renderPara();
    });
    svg.addEventListener("pointerup", function () { paraDrag = null; });
    svg.addEventListener("pointercancel", function () { paraDrag = null; });
  }

  /* Proof walk-through */
  var proofStep = 0;
  var PROOF_STEPS = [
    {
      label: "Step 1",
      title: "Start from the definition",
      text: "\\(ABCD\\) is a parallelogram, so \\(AB \\parallel DC\\) and \\(AD \\parallel BC\\).",
      math: "",
      draw: "base",
    },
    {
      label: "Step 2",
      title: "Draw diagonal \\(AC\\)",
      text: "Join \\(A\\) to \\(C\\). Now we have \\(\\triangle ABC\\) and \\(\\triangle CDA\\).",
      math: "",
      draw: "diag",
    },
    {
      label: "Step 3",
      title: "Equal alternate angles",
      text: "\\(AB \\parallel DC\\) with transversal \\(AC\\) ⇒ \\(\\angle BAC = \\angle DCA\\) (alt. ∠s, // lines). Similarly \\(\\angle BCA = \\angle DAC\\).",
      math: "",
      draw: "angles",
    },
    {
      label: "Step 4",
      title: "ASA congruence",
      text: "In \\(\\triangle ABC\\) and \\(\\triangle CDA\\): two angles and the included side \\(AC\\) (common) are equal ⇒ \\(\\triangle ABC \\cong \\triangle CDA\\) (ASA).",
      math: "",
      draw: "cong",
    },
    {
      label: "Step 5",
      title: "Corresponding sides",
      text: "Corresponding sides of congruent triangles: \\(AB = CD\\) and \\(AD = BC\\). Reason: **[opp. sides of //gram]** after the proof, or cite congruence.",
      math: "\\(AB = CD,\\quad AD = BC\\)",
      draw: "result",
    },
  ];

  function renderProof() {
    var body = document.getElementById("proof-body");
    var dots = document.getElementById("proof-dots");
    var svg = document.getElementById("proof-svg");
    var prev = document.getElementById("proof-prev");
    var next = document.getElementById("proof-next");
    if (!body || !svg) return;

    var S = PROOF_STEPS[proofStep];
    body.innerHTML = "";
    var lab = document.createElement("div");
    lab.className = "step-label";
    lab.textContent = S.label + " of " + PROOF_STEPS.length;
    var title = document.createElement("p");
    title.className = "step-title";
    var text = document.createElement("p");
    text.className = "step-text";
    body.appendChild(lab);
    body.appendChild(title);
    body.appendChild(text);
    renderMixed(title, S.title);
    renderMixed(text, S.text);
    if (S.math) {
      var m = document.createElement("p");
      m.className = "step-math";
      body.appendChild(m);
      renderMixed(m, S.math);
    }

    dots.innerHTML = "";
    PROOF_STEPS.forEach(function (_, i) {
      var d = document.createElement("span");
      if (i === proofStep) d.className = "on";
      dots.appendChild(d);
    });
    prev.disabled = proofStep === 0;
    next.disabled = proofStep === PROOF_STEPS.length - 1;

    // Fixed nice parallelogram for proof
    var A = { x: 120, y: 210 }, B = { x: 340, y: 210 }, C = { x: 400, y: 70 }, D = { x: 180, y: 70 };
    clr(svg);
    svg.appendChild(E("polygon", {
      points: [A, B, C, D].map(function (p) { return p.x + "," + p.y; }).join(" "),
      fill: "rgba(56,189,248,.08)", stroke: "none",
    }));
    svg.appendChild(seg(A, B, INK));
    svg.appendChild(seg(B, C, INK));
    svg.appendChild(seg(C, D, INK));
    svg.appendChild(seg(D, A, INK));
    if (S.draw !== "base") svg.appendChild(seg(A, C, ACCENT, 2.5));
    if (S.draw === "angles" || S.draw === "cong" || S.draw === "result") {
      svg.appendChild(angleArc(A, B, C, 26, VIOLET));
      svg.appendChild(angleArc(C, D, A, 26, VIOLET));
      svg.appendChild(angleArc(A, D, C, 36, MARK));
      svg.appendChild(angleArc(C, B, A, 36, MARK));
    }
    if (S.draw === "cong" || S.draw === "result") {
      svg.appendChild(tickMark(A, C, 1, ACCENT));
    }
    if (S.draw === "result") {
      svg.appendChild(tickMark(A, B, 1));
      svg.appendChild(tickMark(D, C, 1));
      svg.appendChild(tickMark(A, D, 2));
      svg.appendChild(tickMark(B, C, 2));
    }
    [["A", A, -16, 16], ["B", B, 8, 16], ["C", C, 8, -8], ["D", D, -16, -8]].forEach(function (L) {
      svg.appendChild(E("circle", { cx: L[1].x, cy: L[1].y, r: 5, fill: MARK, stroke: "#0f172a", "stroke-width": 1.5 }));
      svg.appendChild(labelAt(L[1], L[0], L[2], L[3]));
    });
  }

  /* Prove conditions */
  var proveCond = "oppSidesEq";
  var PROVE_CONDS = [
    {
      id: "oppSidesEq",
      label: "Opp. sides equal",
      cap: "If \\(AB = CD\\) and \\(AD = BC\\), then \\(ABCD\\) is a parallelogram.",
      note: "Reason code: **[opp. sides equal]**. Both pairs of opposite sides equal ⇒ parallelogram.",
      marks: "sides",
    },
    {
      id: "oppAngEq",
      label: "Opp. angles equal",
      cap: "If \\(\\angle A = \\angle C\\) and \\(\\angle B = \\angle D\\), then \\(ABCD\\) is a parallelogram.",
      note: "Reason code: **[opp. ∠s equal]**.",
      marks: "angles",
    },
    {
      id: "diagsBisect",
      label: "Diags. bisect",
      cap: "If diagonals bisect each other (\\(AO = OC\\), \\(BO = OD\\)), then \\(ABCD\\) is a parallelogram.",
      note: "Reason code: **[diags. bisect each other]**.",
      marks: "diags",
    },
    {
      id: "onePair",
      label: "One pair equal & //",
      cap: "If one pair of opposite sides is both equal and parallel (e.g. \\(AB = DC\\) and \\(AB \\parallel DC\\)), then \\(ABCD\\) is a parallelogram.",
      note: "Reason code: **[2 sides equal and //]**.",
      marks: "onepair",
    },
  ];

  function renderProve() {
    makeButtons(document.getElementById("prove-cond-btns"), PROVE_CONDS, proveCond, function (id) {
      proveCond = id;
      renderProve();
    });
    var svg = document.getElementById("prove-svg");
    if (!svg) return;
    clr(svg);
    var A = { x: 120, y: 230 }, B = { x: 340, y: 230 }, C = { x: 400, y: 80 }, D = { x: 180, y: 80 };
    var O = mid(A, C);
    var cond = PROVE_CONDS.filter(function (c) { return c.id === proveCond; })[0];

    svg.appendChild(E("polygon", {
      points: [A, B, C, D].map(function (p) { return p.x + "," + p.y; }).join(" "),
      fill: "rgba(74,222,128,.1)", stroke: "none",
    }));
    svg.appendChild(seg(A, B, INK));
    svg.appendChild(seg(B, C, INK));
    svg.appendChild(seg(C, D, INK));
    svg.appendChild(seg(D, A, INK));

    if (cond.marks === "sides") {
      svg.appendChild(tickMark(A, B, 1));
      svg.appendChild(tickMark(D, C, 1));
      svg.appendChild(tickMark(A, D, 2));
      svg.appendChild(tickMark(B, C, 2));
    }
    if (cond.marks === "angles") {
      svg.appendChild(angleArc(A, B, D, 28, VIOLET));
      svg.appendChild(angleArc(C, B, D, 28, VIOLET));
      svg.appendChild(angleArc(B, A, C, 22, MARK));
      svg.appendChild(angleArc(D, A, C, 22, MARK));
    }
    if (cond.marks === "diags") {
      svg.appendChild(seg(A, C, ACCENT));
      svg.appendChild(seg(B, D, ACCENT));
      svg.appendChild(tickMark(A, O, 1, ACCENT));
      svg.appendChild(tickMark(O, C, 1, ACCENT));
      svg.appendChild(tickMark(B, O, 2, TICK));
      svg.appendChild(tickMark(O, D, 2, TICK));
      svg.appendChild(E("circle", { cx: O.x, cy: O.y, r: 5, fill: MARK }));
      svg.appendChild(labelAt(O, "O", 8, -8, MARK));
    }
    if (cond.marks === "onepair") {
      svg.appendChild(seg(A, B, GOOD, 3.5));
      svg.appendChild(seg(D, C, GOOD, 3.5));
      svg.appendChild(tickMark(A, B, 1));
      svg.appendChild(tickMark(D, C, 1));
      svg.appendChild(parallelMarks(A, B, D, C, 1));
    }

    [["A", A, -16, 16], ["B", B, 8, 16], ["C", C, 8, -8], ["D", D, -16, -8]].forEach(function (L) {
      svg.appendChild(E("circle", { cx: L[1].x, cy: L[1].y, r: 5, fill: MARK, stroke: "#0f172a", "stroke-width": 1.5 }));
      svg.appendChild(labelAt(L[1], L[0], L[2], L[3]));
    });

    renderMixed(document.getElementById("prove-caption"), cond.cap);
    renderMixed(document.getElementById("prove-note"), cond.note);
  }

  /* ═══════════════════════════════════════════════════════════
     LAB 2 — Family
     ═══════════════════════════════════════════════════════════ */
  var familyId = "parallelogram";
  var FAMILY = [
    {
      id: "trapezium",
      label: "Trapezium",
      def: "**Trapezium:** a quadrilateral with **exactly one** pair of parallel sides (the bases).",
      extra: "Isosceles trapezium: non-parallel sides (legs) equal ⇒ base angles equal.",
      verts: [{ x: 120, y: 80 }, { x: 380, y: 80 }, { x: 440, y: 250 }, { x: 60, y: 250 }],
      parallel: [[0, 1]],
    },
    {
      id: "parallelogram",
      label: "Parallelogram",
      def: "**Parallelogram:** a quadrilateral with **both pairs** of opposite sides parallel.",
      extra: "Also: opp. sides equal, opp. ∠s equal, diags. bisect each other.",
      verts: [{ x: 110, y: 240 }, { x: 330, y: 240 }, { x: 400, y: 90 }, { x: 180, y: 90 }],
      parallel: [[0, 1], [1, 2]],
    },
    {
      id: "rhombus",
      label: "Rhombus",
      def: "**Rhombus:** a parallelogram with **all four sides equal**.",
      extra: "Diagonals are perpendicular bisectors of each other and bisect the vertex angles.",
      verts: [{ x: 250, y: 60 }, { x: 400, y: 170 }, { x: 250, y: 280 }, { x: 100, y: 170 }],
      parallel: [[0, 1], [1, 2]],
      equalSides: true,
      diagsPerp: true,
    },
    {
      id: "rectangle",
      label: "Rectangle",
      def: "**Rectangle:** a parallelogram with **all interior angles** \\(90^\\circ\\).",
      extra: "Diagonals are equal in length (\\(AC = BD\\)).",
      verts: [{ x: 110, y: 90 }, { x: 390, y: 90 }, { x: 390, y: 250 }, { x: 110, y: 250 }],
      parallel: [[0, 1], [1, 2]],
      rightAngles: true,
      equalDiags: true,
    },
    {
      id: "square",
      label: "Square",
      def: "**Square:** a rectangle with equal sides — or a rhombus with right angles.",
      extra: "Has every property of parallelogram, rectangle and rhombus.",
      verts: [{ x: 150, y: 70 }, { x: 350, y: 70 }, { x: 350, y: 270 }, { x: 150, y: 270 }],
      parallel: [[0, 1], [1, 2]],
      equalSides: true,
      rightAngles: true,
      diagsPerp: true,
      equalDiags: true,
    },
  ];

  var FAMILY_FEATURES = [
    { key: "onePara", label: "Exactly \\(1\\) pair //" },
    { key: "twoPara", label: "Both pairs //" },
    { key: "oppEq", label: "Opp. sides equal" },
    { key: "allEq", label: "All sides equal" },
    { key: "all90", label: "All angles \\(90^\\circ\\)" },
    { key: "diagBisect", label: "Diags. bisect" },
    { key: "diagPerp", label: "Diags. ⊥" },
    { key: "diagEq", label: "Diags. equal" },
  ];

  var FAMILY_MATRIX = {
    trapezium: { onePara: 1, twoPara: 0, oppEq: 0, allEq: 0, all90: 0, diagBisect: 0, diagPerp: 0, diagEq: 0 },
    parallelogram: { onePara: 0, twoPara: 1, oppEq: 1, allEq: 0, all90: 0, diagBisect: 1, diagPerp: 0, diagEq: 0 },
    rhombus: { onePara: 0, twoPara: 1, oppEq: 1, allEq: 1, all90: 0, diagBisect: 1, diagPerp: 1, diagEq: 0 },
    rectangle: { onePara: 0, twoPara: 1, oppEq: 1, allEq: 0, all90: 1, diagBisect: 1, diagPerp: 0, diagEq: 1 },
    square: { onePara: 0, twoPara: 1, oppEq: 1, allEq: 1, all90: 1, diagBisect: 1, diagPerp: 1, diagEq: 1 },
  };

  function renderFamily() {
    makeButtons(document.getElementById("family-btns"), FAMILY, familyId, function (id) {
      familyId = id;
      renderFamily();
    });
    var shape = FAMILY.filter(function (s) { return s.id === familyId; })[0];
    var svg = document.getElementById("family-svg");
    if (!svg || !shape) return;
    clr(svg);
    var V = shape.verts;
    svg.appendChild(E("polygon", {
      points: V.map(function (p) { return p.x + "," + p.y; }).join(" "),
      fill: "rgba(56,189,248,.12)", stroke: "none",
    }));
    for (var i = 0; i < 4; i++) {
      svg.appendChild(seg(V[i], V[(i + 1) % 4], INK, 3));
    }
    // parallel marks
    if (shape.parallel) {
      shape.parallel.forEach(function (pair, idx) {
        var i = pair[0], j = (pair[0] + 1) % 4;
        var k = (pair[0] + 2) % 4, m = (pair[0] + 3) % 4;
        if (pair[0] === 0) {
          svg.appendChild(parallelMarks(V[0], V[1], V[3], V[2], 1));
        } else {
          svg.appendChild(parallelMarks(V[1], V[2], V[0], V[3], 2));
        }
      });
    }
    if (shape.equalSides) {
      for (var s = 0; s < 4; s++) svg.appendChild(tickMark(V[s], V[(s + 1) % 4], 1));
    }
    if (shape.rightAngles) {
      for (var r = 0; r < 4; r++) {
        svg.appendChild(rightAngleMark(V[r], V[(r + 3) % 4], V[(r + 1) % 4], 14));
      }
    }
    if (shape.diagsPerp || shape.equalDiags) {
      svg.appendChild(seg(V[0], V[2], ACCENT, 2));
      svg.appendChild(seg(V[1], V[3], ACCENT, 2));
      var O = mid(V[0], V[2]);
      if (shape.diagsPerp) svg.appendChild(rightAngleMark(O, V[0], V[1], 10));
      if (shape.equalDiags) {
        svg.appendChild(tickMark(V[0], V[2], 2, ACCENT));
        svg.appendChild(tickMark(V[1], V[3], 2, ACCENT));
      }
    }
    ["A", "B", "C", "D"].forEach(function (name, i) {
      svg.appendChild(E("circle", { cx: V[i].x, cy: V[i].y, r: 6, fill: MARK, stroke: "#0f172a", "stroke-width": 1.5 }));
      svg.appendChild(labelAt(V[i], name, i === 0 || i === 3 ? -16 : 8, i < 2 ? -10 : 18));
    });

    renderMixed(document.getElementById("family-caption"), shape.label);
    renderMixed(document.getElementById("family-note"), shape.def + " " + shape.extra);

    // comparison table
    var table = document.getElementById("family-table");
    if (table) {
      var heads = ["Property"].concat(FAMILY.map(function (s) { return s.label; }));
      var thead = "<tr>" + heads.map(function (h) { return "<th>" + h + "</th>"; }).join("") + "</tr>";
      var rows = FAMILY_FEATURES.map(function (f) {
        var cells = FAMILY.map(function (s) {
          var yes = FAMILY_MATRIX[s.id][f.key];
          var hl = s.id === familyId ? " style=\"background:rgba(2,132,199,.12)\"" : "";
          return "<td class=\"" + (yes ? "yes" : "no") + "\"" + hl + ">" + (yes ? "✓" : "—") + "</td>";
        }).join("");
        return "<tr><td class=\"feat\">" + f.label + "</td>" + cells + "</tr>";
      }).join("");
      table.innerHTML = thead + rows;
      if (window.renderMathInElement) {
        window.renderMathInElement(table, {
          delimiters: [{ left: "\\(", right: "\\)", display: false }],
        });
      }
    }
  }

  var FAMILY_QUIZ = [
    {
      q: "A quadrilateral has exactly one pair of parallel sides. What is it?",
      opts: ["Parallelogram", "Trapezium", "Rhombus", "Rectangle"],
      ans: 1,
    },
    {
      q: "A parallelogram with all sides equal is a…",
      opts: ["Rectangle", "Trapezium", "Rhombus", "Kite"],
      ans: 2,
    },
    {
      q: "A parallelogram with all angles \\(90^\\circ\\) is a…",
      opts: ["Rhombus", "Trapezium", "Square", "Rectangle"],
      ans: 3,
    },
    {
      q: "Which shape has every property of both a rhombus and a rectangle?",
      opts: ["Trapezium", "Parallelogram", "Square", "Kite"],
      ans: 2,
    },
    {
      q: "In a rhombus (that is not a square), the diagonals are…",
      opts: ["Equal only", "Perpendicular bisectors of each other", "Never bisect", "Parallel"],
      ans: 1,
    },
  ];
  var familyQuizI = 0;
  var familyQuizLocked = false;

  function renderFamilyQuiz() {
    var Q = FAMILY_QUIZ[familyQuizI % FAMILY_QUIZ.length];
    renderMixed(document.getElementById("family-quiz-q"), Q.q);
    var opts = document.getElementById("family-quiz-opts");
    var fb = document.getElementById("family-quiz-fb");
    familyQuizLocked = false;
    fb.className = "feedback";
    fb.textContent = "";
    opts.innerHTML = "";
    Q.opts.forEach(function (text, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "quiz-opt";
      b.textContent = text;
      b.addEventListener("click", function () {
        if (familyQuizLocked) return;
        familyQuizLocked = true;
        if (i === Q.ans) {
          b.classList.add("ok");
          fb.className = "feedback ok";
          renderMixed(fb, "Correct!");
        } else {
          b.classList.add("bad");
          opts.children[Q.ans].classList.add("ok");
          fb.className = "feedback bad";
          renderMixed(fb, "Not quite — the answer is **" + Q.opts[Q.ans] + "**.");
        }
      });
      opts.appendChild(b);
    });
  }

  /* ═══════════════════════════════════════════════════════════
     LAB 3 — Mid-point theorem
     ═══════════════════════════════════════════════════════════ */
  var midVerts = [
    { x: 80, y: 300 }, { x: 420, y: 300 }, { x: 260, y: 60 },
  ];
  var midMode = "theorem";
  var midDrag = null;

  function renderMid() {
    makeButtons(document.getElementById("mid-mode-btns"), [
      { id: "theorem", label: "Mid-pt. thm." },
      { id: "converse", label: "Converse" },
      { id: "both", label: "Both mid-pts → //gram" },
    ], midMode, function (id) { midMode = id; renderMid(); });

    var svg = document.getElementById("mid-svg");
    if (!svg) return;
    clr(svg);
    var A = midVerts[0], B = midVerts[1], C = midVerts[2];
    var D = mid(A, B);
    var E = mid(A, C);
    var F = mid(B, C);

    svg.appendChild(E("polygon", {
      points: [A, B, C].map(function (p) { return p.x + "," + p.y; }).join(" "),
      fill: "rgba(56,189,248,.1)", stroke: "none",
    }));
    svg.appendChild(seg(A, B, INK));
    svg.appendChild(seg(B, C, INK, 3.5));
    svg.appendChild(seg(C, A, INK));

    // mid-point ticks
    svg.appendChild(tickMark(A, D, 1));
    svg.appendChild(tickMark(D, B, 1));
    svg.appendChild(tickMark(A, E, 2));
    svg.appendChild(tickMark(E, C, 2));

    if (midMode === "theorem" || midMode === "converse") {
      svg.appendChild(seg(D, E, GOOD, 3.5));
      svg.appendChild(parallelMarks(D, E, B, C, 1));
    }
    if (midMode === "both") {
      svg.appendChild(seg(D, E, GOOD, 3));
      svg.appendChild(seg(E, F, VIOLET, 3));
      svg.appendChild(seg(F, D, MARK, 3));
      svg.appendChild(E("polygon", {
        points: [D, F, E].map(function (p) { return p.x + "," + p.y; }).join(" "),
        fill: "rgba(167,139,250,.15)", stroke: "none",
      }));
      // DEFE is varignon - actually DEF midpoints form medial triangle
      svg.appendChild(labelAt(F, "F", 8, 16, MARK));
      svg.appendChild(E("circle", { cx: F.x, cy: F.y, r: 6, fill: MARK, stroke: "#0f172a", "stroke-width": 1.5 }));
    }

    [["D", D, -4, 20], ["E", E, -18, -6]].forEach(function (L) {
      svg.appendChild(E("circle", { cx: L[1].x, cy: L[1].y, r: 6, fill: GOOD, stroke: "#0f172a", "stroke-width": 1.5 }));
      svg.appendChild(labelAt(L[1], L[0], L[2], L[3], GOOD));
    });

    ["A", "B", "C"].forEach(function (name, i) {
      svg.appendChild(handle(midVerts[i], i));
      var off = [{ x: -16, y: 18 }, { x: 8, y: 18 }, { x: -6, y: -12 }][i];
      svg.appendChild(labelAt(midVerts[i], name, off.x, off.y));
    });

    var de = dist(D, E), bc = dist(B, C);
    var row = document.getElementById("mid-measures");
    if (row) {
      row.innerHTML = "";
      [
        "\\(BC = " + fmt(bc / 20, 1) + "\\) (units)",
        "\\(DE = " + fmt(de / 20, 1) + "\\)",
        "\\(DE / BC = " + fmt(de / bc, 2) + "\\)",
      ].forEach(function (t) {
        var c = document.createElement("span");
        c.className = "measure-chip";
        c.textContent = t;
        row.appendChild(c);
      });
      if (window.renderMathInElement) {
        window.renderMathInElement(row, {
          delimiters: [{ left: "\\(", right: "\\)", display: false }],
        });
      }
    }

    if (midMode === "theorem") {
      renderMixed(document.getElementById("mid-caption"),
        "Mid-point theorem: \\(DE \\parallel BC\\) and \\(DE = \\dfrac{1}{2}BC\\).");
      renderMixed(document.getElementById("mid-note"),
        "If \\(D\\), \\(E\\) are mid-points of \\(AB\\), \\(AC\\), then the segment joining them is parallel to the third side and half as long. Reason: **[mid-pt. thm.]**");
    } else if (midMode === "converse") {
      renderMixed(document.getElementById("mid-caption"),
        "Converse: if \\(D\\) is mid-point of \\(AB\\) and \\(DE \\parallel BC\\) meeting \\(AC\\) at \\(E\\), then \\(E\\) is mid-point of \\(AC\\).");
      renderMixed(document.getElementById("mid-note"),
        "Reason: **[converse of mid-pt. thm.]**. Useful when a line through a mid-point is parallel to a side.");
    } else {
      renderMixed(document.getElementById("mid-caption"),
        "The three mid-points \\(D\\), \\(E\\), \\(F\\) form the medial triangle; each side is parallel to a side of \\(\\triangle ABC\\) and half as long.");
      renderMixed(document.getElementById("mid-note"),
        "The three mid-points give three applications of **[mid-pt. thm.]**. Perimeter of the medial triangle = \\(\\dfrac{1}{2}\\) of the perimeter of \\(\\triangle ABC\\).");
    }
  }

  function bindMidDrag() {
    var svg = document.getElementById("mid-svg");
    if (!svg) return;
    svg.addEventListener("pointerdown", function (e) {
      if (e.target.dataset.i != null) {
        midDrag = +e.target.dataset.i;
        e.target.setPointerCapture(e.pointerId);
      }
    });
    svg.addEventListener("pointermove", function (e) {
      if (midDrag == null) return;
      var p = svgPoint(svg, e);
      midVerts[midDrag].x = clamp(p.x, 40, 460);
      midVerts[midDrag].y = clamp(p.y, 40, 330);
      renderMid();
    });
    svg.addEventListener("pointerup", function () { midDrag = null; });
    svg.addEventListener("pointercancel", function () { midDrag = null; });
  }

  /* ═══════════════════════════════════════════════════════════
     LAB 4 — Intercept theorem
     ═══════════════════════════════════════════════════════════ */
  var intMode = "equal";
  // Three horizontal parallels at y positions; two transversals
  var intY = [80, 180, 280];
  var intDrag = null; // index into intY
  // Transversal 1: x = 100 + t*20 roughly — use two lines from top
  var intT1 = [{ x: 90, y: 40 }, { x: 150, y: 330 }];
  var intT2 = [{ x: 380, y: 40 }, { x: 440, y: 330 }];

  function lineIntersectY(p1, p2, y) {
    var t = (y - p1.y) / (p2.y - p1.y);
    return { x: p1.x + (p2.x - p1.x) * t, y: y };
  }

  function renderInt() {
    makeButtons(document.getElementById("int-mode-btns"), [
      { id: "equal", label: "Equal intercepts" },
      { id: "ratio", label: "Proportional intercepts" },
    ], intMode, function (id) { intMode = id; renderInt(); });

    var svg = document.getElementById("int-svg");
    if (!svg) return;
    clr(svg);

    // Draw three parallels
    intY.forEach(function (y, i) {
      svg.appendChild(E("line", {
        x1: 40, y1: y, x2: 500, y2: y,
        stroke: GOOD, "stroke-width": 3, "stroke-linecap": "round",
      }));
      // drag handle on left
      svg.appendChild(E("circle", {
        cx: 55, cy: y, r: 8, fill: MARK, stroke: "#0f172a", "stroke-width": 2,
        "data-y": String(i),
      }));
      svg.appendChild(E("circle", {
        cx: 55, cy: y, r: 18, fill: "transparent", "data-y": String(i),
      }));
    });

    // Transversals
    svg.appendChild(seg(intT1[0], intT1[1], ACCENT, 2.5));
    svg.appendChild(seg(intT2[0], intT2[1], VIOLET, 2.5));

    var pts1 = intY.map(function (y) { return lineIntersectY(intT1[0], intT1[1], y); });
    var pts2 = intY.map(function (y) { return lineIntersectY(intT2[0], intT2[1], y); });

    pts1.forEach(function (p, i) {
      svg.appendChild(E("circle", { cx: p.x, cy: p.y, r: 5, fill: ACCENT }));
      svg.appendChild(labelAt(p, String.fromCharCode(65 + i), -16, -6, ACCENT));
    });
    pts2.forEach(function (p, i) {
      svg.appendChild(E("circle", { cx: p.x, cy: p.y, r: 5, fill: VIOLET }));
      svg.appendChild(labelAt(p, String.fromCharCode(68 + i), 8, -6, VIOLET));
    });

    // Intercept length marks
    var dAB = dist(pts1[0], pts1[1]), dBC = dist(pts1[1], pts1[2]);
    var dDE = dist(pts2[0], pts2[1]), dEF = dist(pts2[1], pts2[2]);

    if (intMode === "equal") {
      // Force equal spacing visually when in equal mode — already user-controlled;
      // show ticks if nearly equal
      svg.appendChild(tickMark(pts1[0], pts1[1], 1, ACCENT));
      svg.appendChild(tickMark(pts1[1], pts1[2], 1, ACCENT));
      svg.appendChild(tickMark(pts2[0], pts2[1], 1, VIOLET));
      svg.appendChild(tickMark(pts2[1], pts2[2], 1, VIOLET));
    }

    var row = document.getElementById("int-measures");
    if (row) {
      row.innerHTML = "";
      [
        "\\(AB = " + fmt(dAB / 20, 1) + "\\)",
        "\\(BC = " + fmt(dBC / 20, 1) + "\\)",
        "\\(DE = " + fmt(dDE / 20, 1) + "\\)",
        "\\(EF = " + fmt(dEF / 20, 1) + "\\)",
      ].forEach(function (t) {
        var c = document.createElement("span");
        c.className = "measure-chip";
        c.textContent = t;
        row.appendChild(c);
      });
      if (window.renderMathInElement) {
        window.renderMathInElement(row, {
          delimiters: [{ left: "\\(", right: "\\)", display: false }],
        });
      }
    }

    if (intMode === "equal") {
      renderMixed(document.getElementById("int-caption"),
        "If parallels cut equal intercepts on one transversal (\\(AB = BC\\)), they cut equal intercepts on any other (\\(DE = EF\\)).");
      renderMixed(document.getElementById("int-note"),
        "Drag the gold handles so \\(AB = BC\\). Watch \\(DE\\) and \\(EF\\) match. Reason: **[intercept thm.]**. (Space the parallels evenly along the blue transversal.)");
    } else {
      renderMixed(document.getElementById("int-caption"),
        "More generally: \\(\\dfrac{AB}{BC} = \\dfrac{DE}{EF}\\) when the three lines are parallel.");
      renderMixed(document.getElementById("int-note"),
        "The ratios of corresponding intercepts are equal. Move the parallels to unequal spacing and compare the ratios.");
    }
  }

  function bindIntDrag() {
    var svg = document.getElementById("int-svg");
    if (!svg) return;
    svg.addEventListener("pointerdown", function (e) {
      if (e.target.dataset.y != null) {
        intDrag = +e.target.dataset.y;
        e.target.setPointerCapture(e.pointerId);
      }
    });
    svg.addEventListener("pointermove", function (e) {
      if (intDrag == null) return;
      var p = svgPoint(svg, e);
      var y = clamp(p.y, 50, 330);
      // keep order
      if (intDrag === 0) y = Math.min(y, intY[1] - 30);
      if (intDrag === 1) y = clamp(y, intY[0] + 30, intY[2] - 30);
      if (intDrag === 2) y = Math.max(y, intY[1] + 30);
      intY[intDrag] = y;
      renderInt();
    });
    svg.addEventListener("pointerup", function () { intDrag = null; });
    svg.addEventListener("pointercancel", function () { intDrag = null; });
  }

  // Proportional form in a triangle
  var propVerts = [
    { x: 80, y: 300 }, { x: 420, y: 300 }, { x: 250, y: 50 },
  ];
  var propT = 0.45; // D divides CA? D on AB, E on AC
  var propDrag = null;

  function renderProp() {
    var svg = document.getElementById("prop-svg");
    if (!svg) return;
    clr(svg);
    var A = propVerts[2], B = propVerts[0], C = propVerts[1]; // A top, B left, C right
    // remap: use midVerts style A=left base, B=right base, C=apex
    A = propVerts[0];
    B = propVerts[1];
    C = propVerts[2];

    var D = lerp(A, C, propT); // on AC? Wait user said D on AB
    // D on AB, E on AC with DE // BC
    D = lerp(A, B, propT);
    var E = lerp(A, C, propT); // same ratio ⇒ DE // BC by similar / intercept

    svg.appendChild(E("polygon", {
      points: [A, B, C].map(function (p) { return p.x + "," + p.y; }).join(" "),
      fill: "rgba(56,189,248,.08)", stroke: "none",
    }));
    svg.appendChild(seg(A, B, INK));
    svg.appendChild(seg(B, C, INK, 3));
    svg.appendChild(seg(C, A, INK));
    svg.appendChild(seg(D, E, GOOD, 3.5));
    svg.appendChild(parallelMarks(D, E, B, C, 1));

    svg.appendChild(E("circle", { cx: D.x, cy: D.y, r: 7, fill: MARK, stroke: "#0f172a", "stroke-width": 2 }));
    svg.appendChild(E("circle", { cx: D.x, cy: D.y, r: 18, fill: "transparent", "data-d": "1" }));
    svg.appendChild(E("circle", { cx: E.x, cy: E.y, r: 6, fill: GOOD, stroke: "#0f172a", "stroke-width": 1.5 }));
    svg.appendChild(labelAt(D, "D", -14, 18, MARK));
    svg.appendChild(labelAt(E, "E", 8, -8, GOOD));

    ["A", "B", "C"].forEach(function (name, i) {
      var p = propVerts[i];
      svg.appendChild(E("circle", { cx: p.x, cy: p.y, r: 6, fill: MARK, stroke: "#0f172a", "stroke-width": 1.5 }));
      var off = [{ x: -16, y: 18 }, { x: 8, y: 18 }, { x: -6, y: -12 }][i];
      svg.appendChild(labelAt(p, name, off.x, off.y));
    });

    var AD = dist(A, D), DB = dist(D, B), AE = dist(A, E), EC = dist(E, C);
    var row = document.getElementById("prop-measures");
    if (row) {
      row.innerHTML = "";
      [
        "\\(\\dfrac{AD}{DB} = " + fmt(AD / DB, 2) + "\\)",
        "\\(\\dfrac{AE}{EC} = " + fmt(AE / EC, 2) + "\\)",
        "\\(\\dfrac{AD}{AB} = " + fmt(AD / dist(A, B), 2) + "\\)",
      ].forEach(function (t) {
        var c = document.createElement("span");
        c.className = "measure-chip";
        c.textContent = t;
        row.appendChild(c);
      });
      if (window.renderMathInElement) {
        window.renderMathInElement(row, {
          delimiters: [{ left: "\\(", right: "\\)", display: false }],
        });
      }
    }
    renderMixed(document.getElementById("prop-caption"),
      "Since \\(DE \\parallel BC\\): \\(\\dfrac{AD}{DB} = \\dfrac{AE}{EC}\\). Drag \\(D\\) along \\(AB\\).");
  }

  function bindPropDrag() {
    var svg = document.getElementById("prop-svg");
    if (!svg) return;
    svg.addEventListener("pointerdown", function (e) {
      if (e.target.dataset.d != null) {
        propDrag = true;
        e.target.setPointerCapture(e.pointerId);
      }
    });
    svg.addEventListener("pointermove", function (e) {
      if (!propDrag) return;
      var p = svgPoint(svg, e);
      var A = propVerts[0], B = propVerts[1];
      var ab = sub(B, A);
      var len2 = ab.x * ab.x + ab.y * ab.y;
      var t = ((p.x - A.x) * ab.x + (p.y - A.y) * ab.y) / len2;
      propT = clamp(t, 0.15, 0.85);
      renderProp();
    });
    svg.addEventListener("pointerup", function () { propDrag = false; });
    svg.addEventListener("pointercancel", function () { propDrag = false; });
  }

  /* ═══════════════════════════════════════════════════════════
     LAB 5 — Reasons
     ═══════════════════════════════════════════════════════════ */
  var reasonCat = "quad";
  var reasonActive = null;

  var REASONS = {
    quad: [
      { abbr: "[opp. sides of //gram]", desc: "Opposite sides of a parallelogram are equal.", eg: "From \\(ABCD\\) //gram ⇒ \\(AB = CD\\)." },
      { abbr: "[opp. ∠s of //gram]", desc: "Opposite angles of a parallelogram are equal.", eg: "\\(\\angle ABC = \\angle ADC\\)." },
      { abbr: "[diags. of //gram]", desc: "Diagonals of a parallelogram bisect each other.", eg: "\\(AO = OC\\), \\(BO = OD\\)." },
      { abbr: "[opp. sides equal]", desc: "Both pairs of opposite sides equal ⇒ parallelogram.", eg: "Prove condition." },
      { abbr: "[opp. ∠s equal]", desc: "Both pairs of opposite angles equal ⇒ parallelogram.", eg: "Prove condition." },
      { abbr: "[diags. bisect each other]", desc: "Diagonals bisect each other ⇒ parallelogram.", eg: "Prove condition." },
      { abbr: "[2 sides equal and //]", desc: "One pair of opposite sides equal and parallel ⇒ parallelogram.", eg: "Prove condition." },
      { abbr: "[property of rhombus]", desc: "All sides equal; diagonals ⊥ and bisect angles.", eg: "In a rhombus, \\(AC \\perp BD\\)." },
      { abbr: "[property of rectangle]", desc: "All angles \\(90^\\circ\\); diagonals equal.", eg: "\\(AC = BD\\)." },
      { abbr: "[property of square]", desc: "All sides equal and all angles \\(90^\\circ\\).", eg: "Combines rhombus + rectangle." },
      { abbr: "[property of trapezium]", desc: "Exactly one pair of parallel sides; use co-interior angles with the bases.", eg: "\\(\\angle A + \\angle D = 180^\\circ\\) if \\(AD \\parallel BC\\)." },
      { abbr: "[property of isos. trapezium]", desc: "Legs equal ⇒ base angles equal.", eg: "\\(AB = DC\\) in isos. trap. \\(ABCD\\) with \\(AD \\parallel BC\\)." },
    ],
    thm: [
      { abbr: "[mid-pt. thm.]", desc: "Segment joining mid-points of two sides is // to the third side and half as long.", eg: "\\(DE \\parallel BC\\), \\(DE = \\dfrac{1}{2}BC\\)." },
      { abbr: "[converse of mid-pt. thm.]", desc: "Line through mid-point // to a side meets the third side at its mid-point.", eg: "\\(D\\) mid of \\(AB\\), \\(DE \\parallel BC\\) ⇒ \\(E\\) mid of \\(AC\\)." },
      { abbr: "[intercept thm.]", desc: "Parallels that cut equal intercepts on one transversal cut equal intercepts on any other.", eg: "Also: line // to one side of a △ divides the other two sides proportionally." },
    ],
    parallel: [
      { abbr: "[alt. ∠s, // lines]", desc: "Alternate interior angles are equal.", eg: "Z-shape." },
      { abbr: "[corr. ∠s, // lines]", desc: "Corresponding angles are equal.", eg: "F-shape." },
      { abbr: "[int. ∠s, // lines]", desc: "Consecutive interior angles sum to \\(180^\\circ\\).", eg: "C-shape / co-interior." },
      { abbr: "[sides opp. eq. ∠s]", desc: "In a triangle, sides opposite equal angles are equal.", eg: "Isosceles △." },
      { abbr: "[base ∠s, isos. △]", desc: "Base angles of an isosceles triangle are equal.", eg: "\\(AB = AC\\) ⇒ \\(\\angle B = \\angle C\\)." },
    ],
    cong: [
      { abbr: "[SAS]", desc: "Two sides and included angle equal ⇒ congruent.", eg: "" },
      { abbr: "[ASA]", desc: "Two angles and included side equal ⇒ congruent.", eg: "" },
      { abbr: "[SSS]", desc: "Three sides equal ⇒ congruent.", eg: "" },
      { abbr: "[AAS]", desc: "Two angles and a non-included side equal ⇒ congruent.", eg: "" },
      { abbr: "[RHS]", desc: "Right angle, hypotenuse and one side equal ⇒ congruent.", eg: "" },
      { abbr: "[corr. sides, ≅ △s]", desc: "Corresponding sides of congruent triangles are equal.", eg: "" },
      { abbr: "[corr. ∠s, ≅ △s]", desc: "Corresponding angles of congruent triangles are equal.", eg: "" },
    ],
  };

  var REASON_CATS = [
    { id: "quad", label: "Quadrilaterals" },
    { id: "thm", label: "Mid-pt. / Intercept" },
    { id: "parallel", label: "Angles & // lines" },
    { id: "cong", label: "Congruence" },
  ];

  function renderReasons() {
    makeButtons(document.getElementById("reason-cat-btns"), REASON_CATS, reasonCat, function (id) {
      reasonCat = id;
      reasonActive = null;
      renderReasons();
    });
    var grid = document.getElementById("reason-grid");
    var detail = document.getElementById("reason-detail");
    if (!grid) return;
    grid.innerHTML = "";
    (REASONS[reasonCat] || []).forEach(function (r, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "reason-card" + (reasonActive === i ? " active" : "");
      b.innerHTML = '<span class="abbr"></span><span class="desc"></span>';
      b.querySelector(".abbr").textContent = r.abbr;
      b.querySelector(".desc").textContent = r.desc.replace(/\\\(|\\\)|\\dfrac\{1\}\{2\}|\\angle|\\parallel|\\triangle/g, function (m) {
        return m; // keep raw; we'll math-render detail
      });
      // plain desc without latex for card
      renderMixed(b.querySelector(".desc"), r.desc);
      b.addEventListener("click", function () {
        reasonActive = i;
        renderReasons();
      });
      grid.appendChild(b);
    });
    if (reasonActive != null && REASONS[reasonCat][reasonActive]) {
      var R = REASONS[reasonCat][reasonActive];
      renderMixed(detail, "**" + R.abbr + "** — " + R.desc + (R.eg ? " Example: " + R.eg : ""));
    } else {
      renderMixed(detail, "Pick a reason card above.");
    }
  }

  var REASON_QUIZ = [
    {
      q: "In //gram \\(ABCD\\), you write \\(AB = CD\\). Best reason?",
      opts: ["[opp. sides of //gram]", "[mid-pt. thm.]", "[SAS]", "[property of trapezium]"],
      ans: 0,
    },
    {
      q: "\\(D\\), \\(E\\) mid-points of \\(AB\\), \\(AC\\). You conclude \\(DE \\parallel BC\\). Reason?",
      opts: ["[intercept thm.]", "[mid-pt. thm.]", "[opp. ∠s of //gram]", "[ASA]"],
      ans: 1,
    },
    {
      q: "Three parallels cut equal segments on one transversal. You claim equal segments on another. Reason?",
      opts: ["[corr. ∠s, // lines]", "[diags. of //gram]", "[intercept thm.]", "[SSS]"],
      ans: 2,
    },
    {
      q: "Given \\(AB = CD\\), \\(AD = BC\\). You conclude \\(ABCD\\) is a //gram. Reason?",
      opts: ["[opp. sides equal]", "[opp. sides of //gram]", "[property of rhombus]", "[int. ∠s, // lines]"],
      ans: 0,
    },
    {
      q: "\\(AB \\parallel DC\\) with transversal \\(AC\\). \\(\\angle BAC = \\angle DCA\\). Reason?",
      opts: ["[corr. ∠s, // lines]", "[alt. ∠s, // lines]", "[base ∠s, isos. △]", "[diags. of //gram]"],
      ans: 1,
    },
  ];
  var reasonQuizI = 0;
  var reasonQuizLocked = false;

  function renderReasonQuiz() {
    var Q = REASON_QUIZ[reasonQuizI % REASON_QUIZ.length];
    renderMixed(document.getElementById("reason-quiz-q"), Q.q);
    var opts = document.getElementById("reason-quiz-opts");
    var fb = document.getElementById("reason-quiz-fb");
    reasonQuizLocked = false;
    fb.className = "feedback";
    fb.textContent = "";
    opts.innerHTML = "";
    Q.opts.forEach(function (text, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "quiz-opt";
      b.textContent = text;
      b.addEventListener("click", function () {
        if (reasonQuizLocked) return;
        reasonQuizLocked = true;
        if (i === Q.ans) {
          b.classList.add("ok");
          fb.className = "feedback ok";
          renderMixed(fb, "Correct!");
        } else {
          b.classList.add("bad");
          opts.children[Q.ans].classList.add("ok");
          fb.className = "feedback bad";
          renderMixed(fb, "The standard reason is **" + Q.opts[Q.ans] + "**.");
        }
      });
      opts.appendChild(b);
    });
  }

  /* ── init ────────────────────────────────────────────────── */
  function init() {
    setActiveLab("para");

    function setParaPreset(id) {
      paraVerts = PARA_PRESETS[id].map(function (p) { return { x: p.x, y: p.y }; });
      makeButtons(document.getElementById("para-preset-btns"), [
        { id: "standard", label: "Standard" },
        { id: "skewed", label: "Skewed" },
        { id: "tall", label: "Tall" },
      ], id, setParaPreset);
      renderPara();
    }
    setParaPreset("standard");

    renderParaProps();
    renderPara();
    bindParaDrag();

    document.getElementById("proof-prev").addEventListener("click", function () {
      if (proofStep > 0) { proofStep--; renderProof(); }
    });
    document.getElementById("proof-next").addEventListener("click", function () {
      if (proofStep < PROOF_STEPS.length - 1) { proofStep++; renderProof(); }
    });
    renderProof();
    renderProve();

    renderFamily();
    renderFamilyQuiz();
    document.getElementById("family-quiz-next").addEventListener("click", function () {
      familyQuizI++;
      renderFamilyQuiz();
    });

    renderMid();
    bindMidDrag();
    document.getElementById("mid-check-btn").addEventListener("click", function () {
      var v = String(document.getElementById("mid-check-in").value).trim();
      var fb = document.getElementById("mid-check-fb");
      var n = parseFloat(v.replace(/[^\d.]/g, ""));
      if (n === 6) {
        fb.className = "feedback ok";
        renderMixed(fb, "Yes — \\(DE = \\dfrac{1}{2} \\times 12 = 6\\) by **[mid-pt. thm.]**.");
      } else {
        fb.className = "feedback bad";
        renderMixed(fb, "Use mid-pt. thm.: \\(DE = \\dfrac{1}{2}BC = \\dfrac{1}{2} \\times 12 = 6\\).");
      }
    });

    renderInt();
    bindIntDrag();
    renderProp();
    bindPropDrag();

    renderReasons();
    renderReasonQuiz();
    document.getElementById("reason-quiz-next").addEventListener("click", function () {
      reasonQuizI++;
      renderReasonQuiz();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
