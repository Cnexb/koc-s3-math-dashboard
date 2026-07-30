(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var SW = 2.5;
  var INK = "#e2e8f0";
  var ACCENT = "#38bdf8";
  var GOOD = "#4ade80";
  var MARK = "#fbbf24";
  var TICK = "#f87171";
  var VIOLET = "#a78bfa";
  var EPS_PAR = 0.22;   // ~13° — looser // detection
  var EPS_LEN = 18;
  var EPS_ANG = 12;

  var LABS = [
    { id: "detect", label: "Shape detector" },
    { id: "thm", label: "Mid-pt. / Intercept" },
    { id: "reasons", label: "Reason bank" },
  ];

  /* ── helpers ─────────────────────────────────────────────── */
  function E(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    return el;
  }
  function clr(svg) { while (svg && svg.firstChild) svg.removeChild(svg.firstChild); }
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
  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
  function lerp(a, b, t) { return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }; }
  function fmt(n, d) {
    var p = Math.pow(10, d == null ? 1 : d);
    return String(Math.round(n * p) / p);
  }

  function slope(a, b) {
    var dx = b.x - a.x;
    if (Math.abs(dx) < 1e-6) return Infinity;
    return (b.y - a.y) / dx;
  }
  function isParallel(a, b, c, d) {
    var u = sub(b, a), v = sub(d, c);
    var cross = Math.abs(u.x * v.y - u.y * v.x);
    var mag = (Math.hypot(u.x, u.y) * Math.hypot(v.x, v.y)) || 1;
    return cross / mag < EPS_PAR;
  }
  function isEqualLen(a, b, c, d) { return Math.abs(dist(a, b) - dist(c, d)) < EPS_LEN; }
  function isPerp(a, b, c, d) {
    var u = sub(b, a), v = sub(d, c);
    var dot = Math.abs(u.x * v.x + u.y * v.y);
    var mag = (Math.hypot(u.x, u.y) * Math.hypot(v.x, v.y)) || 1;
    return dot / mag < EPS_PAR; // |cos| small ⇒ near 90°
  }
  function angleAt(prev, cur, next) {
    var u = unit(cur, prev), v = unit(cur, next);
    var dot = clamp(u.x * v.x + u.y * v.y, -1, 1);
    return Math.acos(dot) * 180 / Math.PI;
  }
  function nearly(a, b, eps) { return Math.abs(a - b) < (eps == null ? EPS_ANG : eps); }

  function renderMixed(el, text) {
    if (!el) return;
    el.textContent = "";
    String(text || "").split(/(\*\*[^*]+\*\*)/).forEach(function (part) {
      if (!part) return;
      if (part.indexOf("**") === 0) {
        var s = document.createElement("strong");
        s.textContent = part.slice(2, -2);
        el.appendChild(s);
      } else el.appendChild(document.createTextNode(part));
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

  function svgPt(svg, e) {
    var r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal;
    return {
      x: (e.clientX - r.left) * (vb.width / r.width),
      y: (e.clientY - r.top) * (vb.height / r.height),
    };
  }

  function seg(a, b, col, w) {
    return E("line", {
      x1: a.x, y1: a.y, x2: b.x, y2: b.y,
      stroke: col || INK, "stroke-width": w || SW, "stroke-linecap": "round",
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
  /** Invisible drag target + tiny vertex dot (no orange spots). */
  function handle(p, key, fill) {
    var g = E("g", {});
    g.appendChild(E("circle", {
      cx: p.x, cy: p.y, r: 4, fill: fill || INK, stroke: "#0f172a", "stroke-width": 1,
    }));
    g.appendChild(E("circle", {
      cx: p.x, cy: p.y, r: 20, fill: "transparent", "data-drag": String(key),
    }));
    return g;
  }
  function dragOnly(p, key) {
    return E("circle", {
      cx: p.x, cy: p.y, r: 18, fill: "transparent", "data-drag": String(key),
    });
  }

  function tickMark(a, b, n, color) {
    var g = E("g", {});
    var m = mid(a, b), u = unit(a, b), nrm = perp(u);
    var count = Math.max(1, Math.min(2, n || 1)); // only 1 or 2 ticks
    for (var k = 0; k < count; k++) {
      var c = add(m, scale(u, (k - (count - 1) / 2) * 6));
      g.appendChild(seg(add(c, scale(nrm, 7)), add(c, scale(nrm, -7)), color || TICK, 2));
    }
    return g;
  }

  /** Arrowhead // marks: n=1 single chevron, n=2 double chevron on the side. */
  function parallelArrows(a, b, n, color) {
    var g = E("g", {});
    var m = mid(a, b), u = unit(a, b), nrm = perp(u);
    var col = color || GOOD;
    var count = Math.max(1, Math.min(2, n || 1));
    for (var set = 0; set < count; set++) {
      var base = add(m, scale(u, (set - (count - 1) / 2) * 11));
      var tip = add(base, scale(u, 7));
      var left = add(add(base, scale(u, -3)), scale(nrm, 6));
      var right = add(add(base, scale(u, -3)), scale(nrm, -6));
      g.appendChild(E("polygon", {
        points: [tip, left, right].map(function (p) { return p.x + "," + p.y; }).join(" "),
        fill: col,
      }));
    }
    return g;
  }
  // alias used by older call sites during edit
  function parallelSlash(a, b, n, color) { return parallelArrows(a, b, n, color); }

  function angleArc(vertex, pA, pB, r, color, doubles) {
    var g = E("g", {});
    var u = unit(vertex, pA), v = unit(vertex, pB);
    var a1 = Math.atan2(u.y, u.x), a2 = Math.atan2(v.y, v.x);
    var d = a2 - a1;
    while (d <= -Math.PI) d += 2 * Math.PI;
    while (d > Math.PI) d -= 2 * Math.PI;
    var large = Math.abs(d) > Math.PI ? 1 : 0;
    var sweep = d > 0 ? 1 : 0;
    function arc(rad) {
      var s = add(vertex, scale(u, rad));
      var e = add(vertex, scale(v, rad));
      return E("path", {
        d: "M " + s.x + " " + s.y + " A " + rad + " " + rad + " 0 " + large + " " + sweep + " " + e.x + " " + e.y,
        fill: "none", stroke: color || VIOLET, "stroke-width": 2.4,
      });
    }
    g.appendChild(arc(r));
    if (doubles) g.appendChild(arc(r + 5));
    return g;
  }

  function rightAngleMark(corner, fromA, fromB, size) {
    size = size || 12;
    var u = unit(corner, fromA), v = unit(corner, fromB);
    var p1 = add(corner, scale(u, size));
    var p2 = add(p1, scale(v, size));
    var p3 = add(corner, scale(v, size));
    return E("polyline", {
      points: [p1, p2, p3].map(function (p) { return p.x + "," + p.y; }).join(" "),
      fill: "none", stroke: MARK, "stroke-width": 2,
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
      b.disabled = !!it.disabled;
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

  function setActiveLab(id) {
    makeChips(document.getElementById("jm29-lab-nav"), LABS, id, setActiveLab);
    document.querySelectorAll("#panel-tools .lab").forEach(function (lab) {
      lab.classList.toggle("active", lab.id === "lab-" + id);
    });
    if (id === "detect") renderDetect();
    if (id === "thm") renderThm();
    if (id === "reasons") renderReasons();
  }

  /* ═══════════════════════════════════════════════════════════
     LAB 1 — Free-drag detector
     ═══════════════════════════════════════════════════════════ */
  var verts = [
    { x: 110, y: 250 }, { x: 360, y: 250 }, { x: 420, y: 90 }, { x: 160, y: 90 },
  ];
  var detDrag = null;
  var proveReasonId = null;
  var proveStep = 0;

  var SHAPE_ORDER = ["square", "rectangle", "rhombus", "parallelogram", "trapezium", "quad"];

  function analyseQuad(v) {
    var A = v[0], B = v[1], C = v[2], D = v[3];
    var parAB_DC = isParallel(A, B, D, C);
    var parAD_BC = isParallel(A, D, B, C);
    var eqAB_DC = isEqualLen(A, B, D, C);
    var eqAD_BC = isEqualLen(A, D, B, C);
    var eqAB_AD = isEqualLen(A, B, A, D);
    var eqAB_BC = isEqualLen(A, B, B, C);
    var eqBC_CD = isEqualLen(B, C, C, D);
    var allSidesEq = eqAB_AD && eqAB_BC && eqBC_CD && eqAB_DC;
    var angA = angleAt(D, A, B), angB = angleAt(A, B, C), angC = angleAt(B, C, D), angD = angleAt(C, D, A);
    var all90 = [angA, angB, angC, angD].every(function (a) { return nearly(a, 90, EPS_ANG); });
    var rightCount = [angA, angB, angC, angD].filter(function (a) { return nearly(a, 90, EPS_ANG); }).length;
    // Right angles ⇒ opposite sides // (rectangle / square)
    if (all90 || rightCount >= 3) {
      all90 = true;
      parAB_DC = true;
      parAD_BC = true;
    }
    // Adjacent sides nearly ⊥ also helps
    if (isPerp(A, B, B, C) && isPerp(B, C, C, D) && isPerp(C, D, D, A) && isPerp(D, A, A, B)) {
      all90 = true;
      parAB_DC = true;
      parAD_BC = true;
    }
    var bothPar = parAB_DC && parAD_BC;
    var onePar = (parAB_DC || parAD_BC) && !bothPar;
    var oppAngEq = nearly(angA, angC) && nearly(angB, angD);
    var Oac = mid(A, C), Obd = mid(B, D);
    var diagsBisect = dist(Oac, Obd) < 16;

    var names = { square: false, rectangle: false, rhombus: false, parallelogram: false, trapezium: false, quad: true };
    if (onePar) names.trapezium = true;
    if (bothPar) {
      names.parallelogram = true;
      if (allSidesEq || (eqAB_DC && eqAD_BC && eqAB_AD)) names.rhombus = true;
      if (all90) names.rectangle = true;
      if (names.rhombus && names.rectangle) names.square = true;
    }

    var primary = "quad";
    if (names.square) primary = "square";
    else if (names.rectangle) primary = "rectangle";
    else if (names.rhombus) primary = "rhombus";
    else if (names.parallelogram) primary = "parallelogram";
    else if (names.trapezium) primary = "trapezium";

    return {
      A: A, B: B, C: C, D: D,
      parAB_DC: parAB_DC, parAD_BC: parAD_BC, bothPar: bothPar, onePar: onePar,
      eqAB_DC: eqAB_DC, eqAD_BC: eqAD_BC, allSidesEq: allSidesEq,
      angA: angA, angB: angB, angC: angC, angD: angD, all90: all90, oppAngEq: oppAngEq,
      diagsBisect: diagsBisect, names: names, primary: primary,
      sides: [dist(A, B), dist(B, C), dist(C, D), dist(D, A)],
    };
  }

  var PROPS = {
    quad: {
      title: "General quadrilateral",
      list: ["No special // or equal-side pattern detected — keep dragging."],
    },
    trapezium: {
      title: "Trapezium",
      list: [
        "Exactly **one** pair of opposite sides //.",
        "Co-interior angles between the // sides sum to \\(180^\\circ\\).",
        "Reason: **[property of trapezium]**",
      ],
    },
    parallelogram: {
      title: "Parallelogram",
      list: [
        "Both pairs of opposite sides // (definition).",
        "Opposite sides equal — **[opp. sides of //gram]**",
        "Opposite angles equal — **[opp. ∠s of //gram]**",
        "Diagonals bisect each other — **[diags. of //gram]**",
      ],
    },
    rhombus: {
      title: "Rhombus",
      list: [
        "A parallelogram with **all four sides equal**.",
        "Diagonals are perpendicular bisectors of each other.",
        "Diagonals bisect the vertex angles.",
        "Reason: **[property of rhombus]**",
      ],
    },
    rectangle: {
      title: "Rectangle",
      list: [
        "A parallelogram with all angles \\(90^\\circ\\).",
        "Diagonals are equal in length.",
        "Reason: **[property of rectangle]**",
      ],
    },
    square: {
      title: "Square",
      list: [
        "A rectangle with equal sides — or a rhombus with right angles.",
        "Has every property of parallelogram, rectangle and rhombus.",
        "Reason: **[property of square]**",
      ],
    },
  };

  /** Prove recipes keyed by primary shape */
  function proveOptions(info) {
    var p = info.primary;
    if (p === "parallelogram") {
      return [
        {
          id: "def",
          label: "By definition (both //)",
          steps: [
            { t: "Observe both pairs", x: "From the figure, \\(AB\\)//\\(DC\\) and \\(AD\\)//\\(BC\\) (// marks)." },
            { t: "Definition", x: "A quadrilateral with both pairs of opposite sides // is a parallelogram." },
            { t: "Conclusion", x: "Therefore \\(ABCD\\) is a parallelogram." },
          ],
        },
        {
          id: "oppSides",
          label: "[opp. sides equal]",
          steps: [
            { t: "Given", x: "Opposite sides equal: \\(AB = DC\\), \\(AD = BC\\) (tick marks)." },
            { t: "Theorem", x: "A quadrilateral with both pairs of opposite sides equal is a parallelogram." },
            { t: "Conclusion", x: "\\(ABCD\\) is a parallelogram. Reason: **[opp. sides equal]**" },
          ],
        },
        {
          id: "diags",
          label: "[diags. bisect each other]",
          steps: [
            { t: "Diagonals", x: "Diagonals \\(AC\\), \\(BD\\) meet at their common mid-point (equal ticks on each half)." },
            { t: "Theorem", x: "If the diagonals of a quadrilateral bisect each other, it is a parallelogram." },
            { t: "Conclusion", x: "\\(ABCD\\) is a parallelogram. Reason: **[diags. bisect each other]**" },
          ],
        },
        {
          id: "onePair",
          label: "[2 sides equal and //]",
          steps: [
            { t: "Given", x: "One pair of opposite sides is both equal and //, e.g. \\(AB = DC\\) and \\(AB\\)//\\(DC\\)." },
            { t: "Theorem", x: "Then the quadrilateral is a parallelogram." },
            { t: "Conclusion", x: "\\(ABCD\\) is a parallelogram. Reason: **[2 sides equal and //]**" },
          ],
        },
      ];
    }
    if (p === "rhombus") {
      return [
        {
          id: "sides",
          label: "//gram + equal sides",
          steps: [
            { t: "Parallelogram", x: "Both pairs of opposite sides // ⇒ \\(ABCD\\) is a parallelogram." },
            { t: "Equal sides", x: "All four sides equal (same tick marks)." },
            { t: "Definition", x: "A parallelogram with all sides equal is a rhombus." },
            { t: "Conclusion", x: "\\(ABCD\\) is a rhombus. **[property of rhombus]**" },
          ],
        },
      ];
    }
    if (p === "rectangle") {
      return [
        {
          id: "right",
          label: "//gram + right angles",
          steps: [
            { t: "Parallelogram", x: "Both pairs of opposite sides // ⇒ parallelogram." },
            { t: "Right angles", x: "All interior angles are \\(90^\\circ\\) (right-angle marks)." },
            { t: "Definition", x: "A parallelogram with four right angles is a rectangle." },
            { t: "Conclusion", x: "\\(ABCD\\) is a rectangle. **[property of rectangle]**" },
          ],
        },
      ];
    }
    if (p === "square") {
      return [
        {
          id: "rectRhomb",
          label: "Rectangle + equal sides",
          steps: [
            { t: "Rectangle", x: "Four right angles and opposite sides // ⇒ rectangle." },
            { t: "Equal sides", x: "All sides equal ⇒ also a rhombus." },
            { t: "Definition", x: "A rectangle with equal sides (or rhombus with right angles) is a square." },
            { t: "Conclusion", x: "\\(ABCD\\) is a square. **[property of square]**" },
          ],
        },
        {
          id: "rhombRight",
          label: "Rhombus + right angle",
          steps: [
            { t: "Rhombus", x: "All sides equal and opposite sides // ⇒ rhombus." },
            { t: "Right angle", x: "One (hence all) angle is \\(90^\\circ\\)." },
            { t: "Conclusion", x: "\\(ABCD\\) is a square. **[property of square]**" },
          ],
        },
      ];
    }
    if (p === "trapezium") {
      return [
        {
          id: "onePar",
          label: "Exactly one pair //",
          steps: [
            { t: "Check //", x: "Exactly one pair of opposite sides is // (single // mark set)." },
            { t: "Definition", x: "A quadrilateral with exactly one pair of // sides is a trapezium." },
            { t: "Conclusion", x: "\\(ABCD\\) is a trapezium. **[property of trapezium]**" },
          ],
        },
      ];
    }
    return [
      {
        id: "none",
        label: "Keep exploring",
        steps: [
          { t: "Not special yet", x: "Drag vertices until a pair of sides becomes // or equal — badges will light up." },
          { t: "Tip", x: "Try making both pairs // for a parallelogram, or all sides equal for a rhombus." },
        ],
      },
    ];
  }

  function renderDetect() {
    var svg = document.getElementById("det-svg");
    if (!svg) return;
    clr(svg);
    var info = analyseQuad(verts);
    var A = info.A, B = info.B, C = info.C, D = info.D;

    svg.appendChild(E("polygon", {
      points: [A, B, C, D].map(function (p) { return p.x + "," + p.y; }).join(" "),
      fill: "rgba(56,189,248,.1)", stroke: "none",
    }));

    var sides = [[A, B], [B, C], [C, D], [D, A]];
    // Edges always white
    sides.forEach(function (s) {
      svg.appendChild(seg(s[0], s[1], INK, SW));
    });

    // Arrowhead // marks: single on first pair, double on second
    if (info.parAB_DC) {
      svg.appendChild(parallelArrows(A, B, 1));
      svg.appendChild(parallelArrows(D, C, 1));
    }
    if (info.parAD_BC) {
      svg.appendChild(parallelArrows(A, D, 2));
      svg.appendChild(parallelArrows(B, C, 2));
    }

    // Equal-length ticks: never stack. All-equal → 1 tick each; else opp. pairs use 1 then 2.
    if (info.allSidesEq) {
      sides.forEach(function (s) { svg.appendChild(tickMark(s[0], s[1], 1)); });
    } else {
      if (info.eqAB_DC) {
        svg.appendChild(tickMark(A, B, 1));
        svg.appendChild(tickMark(D, C, 1));
      }
      if (info.eqAD_BC) {
        svg.appendChild(tickMark(A, D, 2));
        svg.appendChild(tickMark(B, C, 2));
      }
    }

    // equal opposite angles (skip if right angles already shown)
    if (info.oppAngEq && info.bothPar && !info.all90) {
      svg.appendChild(angleArc(A, B, D, 26, VIOLET, false));
      svg.appendChild(angleArc(C, B, D, 26, VIOLET, false));
      svg.appendChild(angleArc(B, A, C, 22, MARK, true));
      svg.appendChild(angleArc(D, A, C, 22, MARK, true));
    }
    if (info.all90) {
      svg.appendChild(rightAngleMark(A, D, B));
      svg.appendChild(rightAngleMark(B, A, C));
      svg.appendChild(rightAngleMark(C, B, D));
      svg.appendChild(rightAngleMark(D, C, A));
    }

    if (info.diagsBisect && info.primary === "parallelogram") {
      var O = mid(A, C);
      svg.appendChild(seg(A, C, ACCENT, 1.8));
      svg.appendChild(seg(B, D, ACCENT, 1.8));
      svg.appendChild(tickMark(A, O, 1, ACCENT));
      svg.appendChild(tickMark(O, C, 1, ACCENT));
      svg.appendChild(tickMark(B, O, 2, TICK));
      svg.appendChild(tickMark(O, D, 2, TICK));
      svg.appendChild(E("circle", { cx: O.x, cy: O.y, r: 3, fill: INK }));
      svg.appendChild(labelAt(O, "O", 8, -8, INK));
    }

    ["A", "B", "C", "D"].forEach(function (name, i) {
      svg.appendChild(handle(verts[i], i, INK));
      var off = [{ x: -16, y: 18 }, { x: 10, y: 18 }, { x: 10, y: -10 }, { x: -16, y: -10 }][i];
      svg.appendChild(labelAt(verts[i], name, off.x, off.y));
    });

    // badges
    var badges = document.getElementById("det-badges");
    badges.innerHTML = "";
    [
      { key: "trapezium", text: "Trapezium" },
      { key: "parallelogram", text: "Parallelogram" },
      { key: "rhombus", text: "Rhombus" },
      { key: "rectangle", text: "Rectangle" },
      { key: "square", text: "Square" },
    ].forEach(function (L) {
      var b = document.createElement("span");
      b.className = "badge" + (info.names[L.key] ? " on" : "");
      b.textContent = L.text;
      badges.appendChild(b);
    });

    var P = PROPS[info.primary];
    renderMixed(document.getElementById("det-caption"), P.title);
    var propsEl = document.getElementById("det-props");
    propsEl.innerHTML = "<ul class=\"prop-list\"></ul>";
    var ul = propsEl.querySelector("ul");
    P.list.forEach(function (line) {
      var li = document.createElement("li");
      ul.appendChild(li);
      renderMixed(li, line);
    });

    renderProve(info);
    renderTable(info);
  }

  function isParSide(info, p, q) {
    var A = info.A, B = info.B, C = info.C, D = info.D;
    if ((p === A && q === B) || (p === B && q === A) || (p === D && q === C) || (p === C && q === D)) return info.parAB_DC;
    if ((p === A && q === D) || (p === D && q === A) || (p === B && q === C) || (p === C && q === B)) return info.parAD_BC;
    return false;
  }

  function renderProve(info) {
    var opts = proveOptions(info);
    if (!opts.some(function (o) { return o.id === proveReasonId; })) {
      proveReasonId = opts[0].id;
      proveStep = 0;
    }
    makeButtons(document.getElementById("prove-reason-btns"), opts, proveReasonId, function (id) {
      proveReasonId = id;
      proveStep = 0;
      renderDetect();
    });
    var recipe = opts.filter(function (o) { return o.id === proveReasonId; })[0] || opts[0];
    var steps = recipe.steps;
    proveStep = clamp(proveStep, 0, steps.length - 1);
    var S = steps[proveStep];
    var body = document.getElementById("prove-body");
    body.innerHTML = "";
    var lab = document.createElement("div");
    lab.className = "step-label";
    lab.textContent = "Step " + (proveStep + 1) + " of " + steps.length;
    var title = document.createElement("p");
    title.className = "step-title";
    var text = document.createElement("p");
    text.className = "step-text";
    body.appendChild(lab);
    body.appendChild(title);
    body.appendChild(text);
    renderMixed(title, S.t);
    renderMixed(text, S.x);

    var dots = document.getElementById("prove-dots");
    dots.innerHTML = "";
    steps.forEach(function (_, i) {
      var d = document.createElement("span");
      if (i === proveStep) d.className = "on";
      dots.appendChild(d);
    });
    document.getElementById("prove-prev").disabled = proveStep === 0;
    document.getElementById("prove-next").disabled = proveStep === steps.length - 1;
  }

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
  var FAMILY_COLS = ["trapezium", "parallelogram", "rhombus", "rectangle", "square"];
  var FAMILY_LABELS = { trapezium: "Trapezium", parallelogram: "Parallelogram", rhombus: "Rhombus", rectangle: "Rectangle", square: "Square" };

  function renderTable(info) {
    var table = document.getElementById("det-table");
    if (!table) return;
    var hl = info.primary === "quad" ? "" : info.primary;
    var head = "<tr><th>Property</th>" + FAMILY_COLS.map(function (c) {
      return "<th>" + FAMILY_LABELS[c] + "</th>";
    }).join("") + "</tr>";
    var rows = FAMILY_FEATURES.map(function (f) {
      return "<tr" + (hl ? "" : "") + " class=\"" + (hl ? "hl-check" : "") + "\" data-feat=\"" + f.key + "\"><td class=\"feat\">" + f.label + "</td>" +
        FAMILY_COLS.map(function (c) {
          var yes = FAMILY_MATRIX[c][f.key];
          var cls = (c === hl ? " hl" : "");
          return "<td class=\"" + (yes ? "yes" : "no") + (c === hl ? "\" style=\"background:rgba(2,132,199,.12)" : "") + "\">" + (yes ? "✓" : "—") + "</td>";
        }).join("") + "</tr>";
    }).join("");
    // highlight whole column via row cells — also mark rows
    table.innerHTML = head + FAMILY_FEATURES.map(function (f) {
      var cells = FAMILY_COLS.map(function (c) {
        var yes = FAMILY_MATRIX[c][f.key];
        var style = c === hl ? " style=\"background:rgba(2,132,199,.12)\"" : "";
        return "<td class=\"" + (yes ? "yes" : "no") + "\"" + style + ">" + (yes ? "✓" : "—") + "</td>";
      }).join("");
      return "<tr" + (hl ? " class=\"hl\"" : "") + "><td class=\"feat\">" + f.label + "</td>" + cells + "</tr>";
    }).join("");
    // Actually only highlight if primary matches a column — highlight those cells only, not all rows
    table.innerHTML = head + FAMILY_FEATURES.map(function (f) {
      var cells = FAMILY_COLS.map(function (c) {
        var yes = FAMILY_MATRIX[c][f.key];
        var style = c === hl ? " style=\"background:rgba(2,132,199,.12)\"" : "";
        return "<td class=\"" + (yes ? "yes" : "no") + "\"" + style + ">" + (yes ? "✓" : "—") + "</td>";
      }).join("");
      return "<tr><td class=\"feat\">" + f.label + "</td>" + cells + "</tr>";
    }).join("");
    if (window.renderMathInElement) {
      window.renderMathInElement(table, { delimiters: [{ left: "\\(", right: "\\)", display: false }] });
    }
  }

  function bindDetect() {
    var svg = document.getElementById("det-svg");
    if (!svg) return;
    svg.addEventListener("pointerdown", function (e) {
      if (e.target.dataset.drag != null) {
        detDrag = +e.target.dataset.drag;
        e.target.setPointerCapture(e.pointerId);
      }
    });
    svg.addEventListener("pointermove", function (e) {
      if (detDrag == null) return;
      var p = svgPt(svg, e);
      verts[detDrag].x = clamp(p.x, 30, 470);
      verts[detDrag].y = clamp(p.y, 30, 310);
      renderDetect();
    });
    svg.addEventListener("pointerup", function () { detDrag = null; });
    svg.addEventListener("pointercancel", function () { detDrag = null; });
    document.getElementById("prove-prev").addEventListener("click", function () {
      if (proveStep > 0) { proveStep--; renderDetect(); }
    });
    document.getElementById("prove-next").addEventListener("click", function () {
      proveStep++;
      renderDetect();
    });
  }

  /* ═══════════════════════════════════════════════════════════
     LAB 2 — Mid-pt / Intercept (3 horizontals + 2 transversals)
     ═══════════════════════════════════════════════════════════ */
  var thmMode = "midpt";
  var thmY = [90, 190, 300];
  // Each transversal: top handle (x at y≈40) and bottom handle (x at y≈350)
  var thmT = [
    { top: 120, bot: 160 },
    { top: 380, bot: 420 },
  ];
  var thmDrag = null; // { kind:'y'|'t', i, which }

  function thmLinePts(ti) {
    return [
      { x: thmT[ti].top, y: 40 },
      { x: thmT[ti].bot, y: 350 },
    ];
  }
  function hitY(p1, p2, y) {
    var t = (y - p1.y) / ((p2.y - p1.y) || 1);
    return { x: p1.x + (p2.x - p1.x) * t, y: y };
  }

  function ensureTransversalSpan() {
    // Keep top above first parallel and bottom below last so they always cut all three
    // Handles already at y=40 and y=350; horizontals between 70–320 — OK by construction.
    // Also keep the two transversals from becoming nearly horizontal.
    thmT.forEach(function (t) {
      t.top = clamp(t.top, 40, 480);
      t.bot = clamp(t.bot, 40, 480);
    });
  }

  function renderThm() {
    makeButtons(document.getElementById("thm-mode-btns"), [
      { id: "midpt", label: "Mid-pt. thm." },
      { id: "intercept", label: "Intercept thm." },
    ], thmMode, function (id) { thmMode = id; renderThm(); });

    var svg = document.getElementById("thm-svg");
    if (!svg) return;
    clr(svg);
    ensureTransversalSpan();

    // three horizontals
    thmY.forEach(function (y, i) {
      svg.appendChild(E("line", {
        x1: 30, y1: y, x2: 490, y2: y,
        stroke: GOOD, "stroke-width": 3, "stroke-linecap": "round",
      }));
      svg.appendChild(parallelArrows({ x: 70, y: y }, { x: 120, y: y }, 1, GOOD));
      // invisible drag on the line (no orange spots)
      svg.appendChild(E("circle", {
        cx: 48, cy: y, r: 18, fill: "transparent", "data-drag": "y" + i,
      }));
    });

    var L0 = thmLinePts(0), L1 = thmLinePts(1);
    // extend transversals fully across view but keep handles
    svg.appendChild(seg(L0[0], L0[1], ACCENT, 2.6));
    svg.appendChild(seg(L1[0], L1[1], VIOLET, 2.6));

    var P0 = thmY.map(function (y) { return hitY(L0[0], L0[1], y); });
    var P1 = thmY.map(function (y) { return hitY(L1[0], L1[1], y); });

    var names0 = ["A", "B", "C"], names1 = ["D", "E", "F"];
    P0.forEach(function (p, i) {
      svg.appendChild(E("circle", { cx: p.x, cy: p.y, r: 5, fill: ACCENT }));
      svg.appendChild(labelAt(p, names0[i], -16, -6, ACCENT));
    });
    P1.forEach(function (p, i) {
      svg.appendChild(E("circle", { cx: p.x, cy: p.y, r: 5, fill: VIOLET }));
      svg.appendChild(labelAt(p, names1[i], 8, -6, VIOLET));
    });

    // transversal handles — small ink dots, no orange
    svg.appendChild(handle(L0[0], "t0top", ACCENT));
    svg.appendChild(handle(L0[1], "t0bot", ACCENT));
    svg.appendChild(handle(L1[0], "t1top", VIOLET));
    svg.appendChild(handle(L1[1], "t1bot", VIOLET));

    var dAB = dist(P0[0], P0[1]), dBC = dist(P0[1], P0[2]);
    var dDE = dist(P1[0], P1[1]), dEF = dist(P1[1], P1[2]);
    var equalLeft = Math.abs(dAB - dBC) < 8;
    var equalRight = Math.abs(dDE - dEF) < 8;
    var midY = Math.abs((thmY[1] - thmY[0]) - (thmY[2] - thmY[1])) < 6;

    if (thmMode === "intercept") {
      if (equalLeft) {
        svg.appendChild(tickMark(P0[0], P0[1], 1, ACCENT));
        svg.appendChild(tickMark(P0[1], P0[2], 1, ACCENT));
      }
      if (equalRight) {
        svg.appendChild(tickMark(P1[0], P1[1], 1, VIOLET));
        svg.appendChild(tickMark(P1[1], P1[2], 1, VIOLET));
      }
      // segment BE (middle //)
      svg.appendChild(seg(P0[1], P1[1], MARK, 2));
    } else {
      // Mid-pt. thm. view: treat △ACF? Use apex = intersection of transversals
      var den = (L0[1].x - L0[0].x) * (L1[1].y - L1[0].y) - (L0[1].y - L0[0].y) * (L1[1].x - L1[0].x);
      var apex = null;
      if (Math.abs(den) > 1e-6) {
        var t = ((L1[0].x - L0[0].x) * (L1[1].y - L1[0].y) - (L1[0].y - L0[0].y) * (L1[1].x - L1[0].x)) / den;
        apex = { x: L0[0].x + t * (L0[1].x - L0[0].x), y: L0[0].y + t * (L0[1].y - L0[0].y) };
      }
      if (apex && apex.y < thmY[0] - 5 && apex.x > 20 && apex.x < 500) {
        svg.appendChild(E("circle", { cx: apex.x, cy: apex.y, r: 6, fill: MARK, stroke: "#0f172a", "stroke-width": 1.5 }));
        svg.appendChild(labelAt(apex, "P", 8, -8, MARK));
        // midpoints of PC and PF? Use mid of PA-PC along left: B is mid of AC when equal spacing
        svg.appendChild(seg(P0[0], P1[0], "#64748b", 1.5));
        svg.appendChild(seg(P0[2], P1[2], INK, 3));
        svg.appendChild(seg(P0[1], P1[1], GOOD, 3.5));
        svg.appendChild(parallelArrows(P0[1], P1[1], 1));
        svg.appendChild(parallelArrows(P0[2], P1[2], 1));
        if (equalLeft || midY) {
          svg.appendChild(tickMark(P0[0], P0[1], 1, ACCENT));
          svg.appendChild(tickMark(P0[1], P0[2], 1, ACCENT));
          svg.appendChild(tickMark(P1[0], P1[1], 1, VIOLET));
          svg.appendChild(tickMark(P1[1], P1[2], 1, VIOLET));
        }
      } else {
        svg.appendChild(seg(P0[1], P1[1], GOOD, 3));
        svg.appendChild(seg(P0[2], P1[2], INK, 3));
        svg.appendChild(parallelArrows(P0[1], P1[1], 1));
        svg.appendChild(parallelArrows(P0[2], P1[2], 1));
      }
    }

    var row = document.getElementById("thm-measures");
    row.innerHTML = "";
    [
      "\\(AB=" + fmt(dAB / 20, 1) + "\\)",
      "\\(BC=" + fmt(dBC / 20, 1) + "\\)",
      "\\(DE=" + fmt(dDE / 20, 1) + "\\)",
      "\\(EF=" + fmt(dEF / 20, 1) + "\\)",
    ].forEach(function (t) {
      var c = document.createElement("span");
      c.className = "measure-chip";
      row.appendChild(c);
      renderMixed(c, t);
    });

    if (thmMode === "intercept") {
      renderMixed(document.getElementById("thm-caption"),
        "Intercept thm.: if \\(AB = BC\\) on one transversal, then \\(DE = EF\\) on the other.");
      renderMixed(document.getElementById("thm-note"),
        "Space the three // lines so blue intercepts match (drag gold handles). Purple intercepts become equal too. Reason: **[intercept thm.]**. Notation: lines are **//**, not ∥.");
    } else {
      renderMixed(document.getElementById("thm-caption"),
        "Mid-pt. thm.: segment joining mid-points is // to the third side and half as long.");
      renderMixed(document.getElementById("thm-note"),
        "Make \\(AB = BC\\) and \\(DE = EF\\) (middle // line through the mid-points). Then \\(BE\\)//\\(CF\\) and \\(BE = \\dfrac{1}{2}CF\\). Example: \\(DE\\)//\\(BC\\), \\(DE = \\dfrac{1}{2}BC\\). Reason: **[mid-pt. thm.]**");
    }
  }

  function bindThm() {
    var svg = document.getElementById("thm-svg");
    if (!svg) return;
    svg.addEventListener("pointerdown", function (e) {
      var key = e.target.dataset.drag;
      if (key == null) return;
      thmDrag = key;
      e.target.setPointerCapture(e.pointerId);
    });
    svg.addEventListener("pointermove", function (e) {
      if (!thmDrag) return;
      var p = svgPt(svg, e);
      if (thmDrag.charAt(0) === "y") {
        var i = +thmDrag.slice(1);
        var y = clamp(p.y, 60, 330);
        if (i === 0) y = Math.min(y, thmY[1] - 35);
        if (i === 1) y = clamp(y, thmY[0] + 35, thmY[2] - 35);
        if (i === 2) y = Math.max(y, thmY[1] + 35);
        thmY[i] = y;
      } else if (thmDrag.indexOf("t0") === 0) {
        if (thmDrag.indexOf("top") >= 0) thmT[0].top = clamp(p.x, 40, 480);
        else thmT[0].bot = clamp(p.x, 40, 480);
      } else if (thmDrag.indexOf("t1") === 0) {
        if (thmDrag.indexOf("top") >= 0) thmT[1].top = clamp(p.x, 40, 480);
        else thmT[1].bot = clamp(p.x, 40, 480);
      }
      renderThm();
    });
    svg.addEventListener("pointerup", function () { thmDrag = null; });
    svg.addEventListener("pointercancel", function () { thmDrag = null; });
  }

  /* ═══════════════════════════════════════════════════════════
     LAB 3 — Reason bank + explainer frame
     ═══════════════════════════════════════════════════════════ */
  var reasonCat = "quad";
  var reasonActive = null;

  var REASON_CATS = [
    { id: "quad", label: "Quadrilaterals" },
    { id: "thm", label: "Mid-pt. / Intercept" },
    { id: "parallel", label: "Angles & // lines" },
    { id: "cong", label: "Congruence" },
  ];

  var REASONS = {
    quad: [
      { id: "oppSides", abbr: "[opp. sides of //gram]", desc: "Opposite sides of a parallelogram are equal.", draw: "paraSides" },
      { id: "oppAng", abbr: "[opp. ∠s of //gram]", desc: "Opposite angles of a parallelogram are equal.", draw: "paraAng" },
      { id: "diags", abbr: "[diags. of //gram]", desc: "Diagonals of a parallelogram bisect each other.", draw: "paraDiags" },
      { id: "proveSides", abbr: "[opp. sides equal]", desc: "Both pairs of opposite sides equal ⇒ parallelogram.", draw: "proveSides" },
      { id: "proveDiags", abbr: "[diags. bisect each other]", desc: "Diagonals bisect each other ⇒ parallelogram.", draw: "proveDiags" },
      { id: "prove2", abbr: "[2 sides equal and //]", desc: "One pair of opposite sides equal and // ⇒ parallelogram.", draw: "prove2" },
      { id: "rhombus", abbr: "[property of rhombus]", desc: "All sides equal; diagonals ⊥ each other.", draw: "rhombus" },
      { id: "rectangle", abbr: "[property of rectangle]", desc: "All angles \\(90^\\circ\\); diagonals equal.", draw: "rectangle" },
      { id: "square", abbr: "[property of square]", desc: "Equal sides and right angles.", draw: "square" },
      { id: "trap", abbr: "[property of trapezium]", desc: "Exactly one pair of // sides.", draw: "trap" },
    ],
    thm: [
      { id: "midpt", abbr: "[mid-pt. thm.]", desc: "Segment joining mid-points of two sides is // to the third side and half as long.", draw: "midpt" },
      { id: "convMid", abbr: "[converse of mid-pt. thm.]", desc: "Line through a mid-point // to a side meets the third side at its mid-point.", draw: "convMid" },
      { id: "intercept", abbr: "[intercept thm.]", desc: "Parallels cutting equal intercepts on one transversal cut equal intercepts on any other.", draw: "intercept" },
    ],
    parallel: [
      { id: "alt", abbr: "[alt. ∠s, // lines]", desc: "Alternate interior angles are equal (Z-shape).", draw: "alt" },
      { id: "corr", abbr: "[corr. ∠s, // lines]", desc: "Corresponding angles are equal (F-shape).", draw: "corr" },
      { id: "int", abbr: "[int. ∠s, // lines]", desc: "Consecutive interior angles sum to \\(180^\\circ\\) (C-shape).", draw: "int" },
    ],
    cong: [
      { id: "SAS", abbr: "[SAS]", desc: "Two sides and included angle equal ⇒ congruent.", draw: "SAS" },
      { id: "ASA", abbr: "[ASA]", desc: "Two angles and included side equal ⇒ congruent.", draw: "ASA" },
      { id: "SSS", abbr: "[SSS]", desc: "Three sides equal ⇒ congruent.", draw: "SSS" },
      { id: "corrS", abbr: "[corr. sides, ≅ △s]", desc: "Corresponding sides of congruent triangles are equal.", draw: "ASA" },
    ],
  };

  var REASON_EXPLAIN = {
    oppSides: {
      steps: [
        "In //gram \\(ABCD\\), opposite sides are equal.",
        "So \\(AB = CD\\) and \\(AD = BC\\).",
        "Write **[opp. sides of //gram]** after the statement.",
      ],
    },
    oppAng: {
      steps: [
        "Opposite angles of a //gram are equal: \\(\\angle A = \\angle C\\), \\(\\angle B = \\angle D\\).",
        "Consecutive angles are supplementary (int. ∠s, // lines).",
        "Reason: **[opp. ∠s of //gram]**",
      ],
    },
    diags: {
      steps: [
        "Diagonals meet at \\(O\\) with \\(AO = OC\\) and \\(BO = OD\\).",
        "Reason: **[diags. of //gram]**",
      ],
    },
    proveSides: {
      steps: [
        "Given both pairs of opposite sides equal.",
        "Conclude \\(ABCD\\) is a parallelogram.",
        "Reason: **[opp. sides equal]**",
      ],
    },
    proveDiags: {
      steps: [
        "Given diagonals bisect each other.",
        "Conclude parallelogram.",
        "Reason: **[diags. bisect each other]**",
      ],
    },
    prove2: {
      steps: [
        "Given one pair of opposite sides equal and //, e.g. \\(AB = DC\\) and \\(AB\\)//\\(DC\\).",
        "Conclude parallelogram.",
        "Reason: **[2 sides equal and //]**",
      ],
    },
    rhombus: {
      steps: [
        "All sides equal; diagonals are perpendicular.",
        "Reason: **[property of rhombus]**",
      ],
    },
    rectangle: {
      steps: [
        "All angles \\(90^\\circ\\); diagonals equal.",
        "Reason: **[property of rectangle]**",
      ],
    },
    square: {
      steps: [
        "Equal sides and four right angles.",
        "Reason: **[property of square]**",
      ],
    },
    trap: {
      steps: [
        "Exactly one pair of sides //.",
        "Co-interior angles with the bases sum to \\(180^\\circ\\).",
        "Reason: **[property of trapezium]**",
      ],
    },
    midpt: {
      steps: [
        "\\(D\\), \\(E\\) mid-points of \\(AB\\), \\(AC\\).",
        "Then \\(DE\\)//\\(BC\\) and \\(DE = \\dfrac{1}{2}BC\\).",
        "Reason: **[mid-pt. thm.]**",
      ],
    },
    convMid: {
      steps: [
        "\\(D\\) mid-point of \\(AB\\) and \\(DE\\)//\\(BC\\) meeting \\(AC\\) at \\(E\\).",
        "Then \\(E\\) is mid-point of \\(AC\\).",
        "Reason: **[converse of mid-pt. thm.]**",
      ],
    },
    intercept: {
      steps: [
        "Three // lines cut equal intercepts on one transversal.",
        "They cut equal intercepts on any other transversal.",
        "Reason: **[intercept thm.]**",
      ],
    },
    alt: {
      steps: [
        "Two // lines cut by a transversal.",
        "Alternate interior angles are equal (Z).",
        "Reason: **[alt. ∠s, // lines]**",
      ],
    },
    corr: {
      steps: [
        "Corresponding angles are equal (F).",
        "Reason: **[corr. ∠s, // lines]**",
      ],
    },
    int: {
      steps: [
        "Interior angles on the same side of the transversal sum to \\(180^\\circ\\) (C).",
        "Reason: **[int. ∠s, // lines]**",
      ],
    },
    SAS: { steps: ["Two sides and the included angle equal ⇒ △s congruent. **[SAS]**"] },
    ASA: { steps: ["Two angles and the included side equal ⇒ △s congruent. **[ASA]**"] },
    SSS: { steps: ["Three sides equal ⇒ △s congruent. **[SSS]**"] },
    corrS: { steps: ["After congruence, matching sides are equal. **[corr. sides, ≅ △s]**"] },
  };

  function drawReasonFigure(svg, drawId) {
    clr(svg);
    var A = { x: 90, y: 220 }, B = { x: 280, y: 220 }, C = { x: 330, y: 70 }, D = { x: 140, y: 70 };
    function poly(pts, fill) {
      svg.appendChild(E("polygon", {
        points: pts.map(function (p) { return p.x + "," + p.y; }).join(" "),
        fill: fill || "rgba(56,189,248,.1)", stroke: "none",
      }));
    }
    function outline(pts) {
      for (var i = 0; i < pts.length; i++) svg.appendChild(seg(pts[i], pts[(i + 1) % pts.length], INK));
    }
    function labs(pts, names) {
      pts.forEach(function (p, i) {
        svg.appendChild(E("circle", { cx: p.x, cy: p.y, r: 5, fill: MARK, stroke: "#0f172a", "stroke-width": 1.5 }));
        svg.appendChild(labelAt(p, names[i], i === 0 || i === 3 ? -14 : 8, i < 2 ? 16 : -8));
      });
    }

    if (drawId === "paraSides" || drawId === "proveSides") {
      poly([A, B, C, D]); outline([A, B, C, D]);
      svg.appendChild(parallelSlash(A, B, 1)); svg.appendChild(parallelSlash(D, C, 1));
      svg.appendChild(parallelSlash(A, D, 2)); svg.appendChild(parallelSlash(B, C, 2));
      svg.appendChild(tickMark(A, B, 1)); svg.appendChild(tickMark(D, C, 1));
      svg.appendChild(tickMark(A, D, 2)); svg.appendChild(tickMark(B, C, 2));
      labs([A, B, C, D], ["A", "B", "C", "D"]);
    } else if (drawId === "paraAng") {
      poly([A, B, C, D]); outline([A, B, C, D]);
      svg.appendChild(angleArc(A, B, D, 28, VIOLET)); svg.appendChild(angleArc(C, B, D, 28, VIOLET));
      svg.appendChild(angleArc(B, A, C, 22, MARK, true)); svg.appendChild(angleArc(D, A, C, 22, MARK, true));
      labs([A, B, C, D], ["A", "B", "C", "D"]);
    } else if (drawId === "paraDiags" || drawId === "proveDiags") {
      poly([A, B, C, D]); outline([A, B, C, D]);
      var O = mid(A, C);
      svg.appendChild(seg(A, C, ACCENT)); svg.appendChild(seg(B, D, ACCENT));
      svg.appendChild(tickMark(A, O, 1, ACCENT)); svg.appendChild(tickMark(O, C, 1, ACCENT));
      svg.appendChild(tickMark(B, O, 2, TICK)); svg.appendChild(tickMark(O, D, 2, TICK));
      svg.appendChild(E("circle", { cx: O.x, cy: O.y, r: 4, fill: MARK }));
      svg.appendChild(labelAt(O, "O", 8, -8, MARK));
      labs([A, B, C, D], ["A", "B", "C", "D"]);
    } else if (drawId === "prove2") {
      poly([A, B, C, D]); outline([A, B, C, D]);
      svg.appendChild(seg(A, B, INK, SW)); svg.appendChild(seg(D, C, INK, SW));
      svg.appendChild(parallelArrows(A, B, 1)); svg.appendChild(parallelArrows(D, C, 1));
      svg.appendChild(tickMark(A, B, 1)); svg.appendChild(tickMark(D, C, 1));
      labs([A, B, C, D], ["A", "B", "C", "D"]);
    } else if (drawId === "rhombus") {
      var R = [{ x: 210, y: 50 }, { x: 340, y: 150 }, { x: 210, y: 250 }, { x: 80, y: 150 }];
      poly(R); outline(R);
      R.forEach(function (_, i) { svg.appendChild(tickMark(R[i], R[(i + 1) % 4], 1)); });
      svg.appendChild(seg(R[0], R[2], ACCENT)); svg.appendChild(seg(R[1], R[3], ACCENT));
      svg.appendChild(rightAngleMark(mid(R[0], R[2]), R[0], R[1], 10));
      labs(R, ["A", "B", "C", "D"]);
    } else if (drawId === "rectangle" || drawId === "square") {
      var S = drawId === "square"
        ? [{ x: 120, y: 60 }, { x: 300, y: 60 }, { x: 300, y: 240 }, { x: 120, y: 240 }]
        : [{ x: 90, y: 80 }, { x: 330, y: 80 }, { x: 330, y: 220 }, { x: 90, y: 220 }];
      poly(S); outline(S);
      S.forEach(function (_, i) { svg.appendChild(rightAngleMark(S[i], S[(i + 3) % 4], S[(i + 1) % 4])); });
      if (drawId === "square") S.forEach(function (_, i) { svg.appendChild(tickMark(S[i], S[(i + 1) % 4], 1)); });
      labs(S, ["A", "B", "C", "D"]);
    } else if (drawId === "trap") {
      var T = [{ x: 130, y: 80 }, { x: 300, y: 80 }, { x: 360, y: 230 }, { x: 70, y: 230 }];
      poly(T); outline(T);
      svg.appendChild(parallelSlash(T[0], T[1], 1)); svg.appendChild(parallelSlash(T[3], T[2], 1));
      labs(T, ["A", "B", "C", "D"]);
    } else if (drawId === "midpt" || drawId === "convMid") {
      var TA = { x: 60, y: 250 }, TB = { x: 360, y: 250 }, TC = { x: 210, y: 50 };
      var TD = mid(TA, TB), TE = mid(TA, TC);
      if (drawId === "convMid") TE = lerp(TA, TC, 0.5);
      poly([TA, TB, TC]);
      svg.appendChild(seg(TA, TB, INK, 3)); svg.appendChild(seg(TB, TC, INK)); svg.appendChild(seg(TC, TA, INK));
      svg.appendChild(seg(TD, TE, GOOD, 3.5));
      svg.appendChild(parallelSlash(TD, TE, 1));
      svg.appendChild(parallelSlash(TA, TB, 1));
      svg.appendChild(tickMark(TA, TD, 1)); svg.appendChild(tickMark(TD, TB, 1));
      svg.appendChild(tickMark(TA, TE, 2)); svg.appendChild(tickMark(TE, TC, 2));
      [["A", TA], ["B", TB], ["C", TC], ["D", TD], ["E", TE]].forEach(function (L) {
        svg.appendChild(E("circle", { cx: L[1].x, cy: L[1].y, r: 5, fill: L[0] === "D" || L[0] === "E" ? GOOD : MARK, stroke: "#0f172a", "stroke-width": 1.5 }));
        svg.appendChild(labelAt(L[1], L[0], 8, -8));
      });
    } else if (drawId === "intercept") {
      [80, 150, 220].forEach(function (y) {
        svg.appendChild(E("line", { x1: 40, y1: y, x2: 380, y2: y, stroke: GOOD, "stroke-width": 3 }));
      });
      svg.appendChild(seg({ x: 100, y: 40 }, { x: 140, y: 260 }, ACCENT, 2.5));
      svg.appendChild(seg({ x: 300, y: 40 }, { x: 340, y: 260 }, VIOLET, 2.5));
      var ys = [80, 150, 220];
      var L = [{ x: 100, y: 40 }, { x: 140, y: 260 }];
      var R = [{ x: 300, y: 40 }, { x: 340, y: 260 }];
      ys.forEach(function (y, i) {
        var p = hitY(L[0], L[1], y), q = hitY(R[0], R[1], y);
        svg.appendChild(E("circle", { cx: p.x, cy: p.y, r: 4, fill: ACCENT }));
        svg.appendChild(E("circle", { cx: q.x, cy: q.y, r: 4, fill: VIOLET }));
        svg.appendChild(labelAt(p, "ABC"[i], -14, -4, ACCENT));
        svg.appendChild(labelAt(q, "DEF"[i], 8, -4, VIOLET));
      });
      var pA = hitY(L[0], L[1], 80), pB = hitY(L[0], L[1], 150), pC = hitY(L[0], L[1], 220);
      svg.appendChild(tickMark(pA, pB, 1, ACCENT)); svg.appendChild(tickMark(pB, pC, 1, ACCENT));
    } else if (drawId === "alt" || drawId === "corr" || drawId === "int") {
      svg.appendChild(E("line", { x1: 40, y1: 100, x2: 380, y2: 100, stroke: GOOD, "stroke-width": 3 }));
      svg.appendChild(E("line", { x1: 40, y1: 220, x2: 380, y2: 220, stroke: GOOD, "stroke-width": 3 }));
      svg.appendChild(seg({ x: 120, y: 40 }, { x: 300, y: 280 }, ACCENT, 2.5));
      var hit1 = hitY({ x: 120, y: 40 }, { x: 300, y: 280 }, 100);
      var hit2 = hitY({ x: 120, y: 40 }, { x: 300, y: 280 }, 220);
      svg.appendChild(angleArc(hit1, { x: 380, y: 100 }, { x: 300, y: 280 }, 22, VIOLET));
      svg.appendChild(angleArc(hit2, { x: 40, y: 220 }, { x: 120, y: 40 }, 22, VIOLET));
    } else {
      // SAS/ASA/SSS small triangles
      var U = [{ x: 70, y: 220 }, { x: 180, y: 220 }, { x: 110, y: 80 }];
      var V = [{ x: 240, y: 220 }, { x: 350, y: 220 }, { x: 300, y: 90 }];
      poly(U); poly(V, "rgba(167,139,250,.12)");
      outline(U); outline(V);
      svg.appendChild(tickMark(U[0], U[1], 1)); svg.appendChild(tickMark(V[0], V[1], 1));
      if (drawId !== "ASA") {
        svg.appendChild(tickMark(U[1], U[2], 2)); svg.appendChild(tickMark(V[1], V[2], 2));
      }
      if (drawId === "SSS" || drawId === "SAS") {
        svg.appendChild(tickMark(U[2], U[0], 3)); svg.appendChild(tickMark(V[2], V[0], 3));
      }
      if (drawId === "SAS" || drawId === "ASA") {
        svg.appendChild(angleArc(U[0], U[1], U[2], 20, MARK));
        svg.appendChild(angleArc(V[0], V[1], V[2], 20, MARK));
      }
    }
  }

  function renderReasons() {
    makeButtons(document.getElementById("reason-cat-btns"), REASON_CATS, reasonCat, function (id) {
      reasonCat = id;
      reasonActive = null;
      renderReasons();
    });
    var grid = document.getElementById("reason-grid");
    var list = REASONS[reasonCat] || [];
    grid.innerHTML = "";
    list.forEach(function (r, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "reason-card" + (reasonActive === i ? " active" : "");
      b.innerHTML = '<span class="abbr"></span><span class="desc"></span>';
      b.querySelector(".abbr").textContent = r.abbr;
      renderMixed(b.querySelector(".desc"), r.desc);
      b.addEventListener("click", function () {
        reasonActive = i;
        renderReasons();
      });
      grid.appendChild(b);
    });

    var svg = document.getElementById("reason-svg");
    var explain = document.getElementById("reason-explain");
    if (reasonActive == null || !list[reasonActive]) {
      clr(svg);
      svg.appendChild(labelAt({ x: 80, y: 150 }, "Pick a reason →", 0, 0, "#94a3b8"));
      explain.innerHTML = "<p>Pick a reason card to see an explanation with a figure.</p>";
      return;
    }
    var R = list[reasonActive];
    drawReasonFigure(svg, R.draw);
    var ex = REASON_EXPLAIN[R.id] || { steps: [R.desc] };
    explain.innerHTML = "<p><strong></strong></p><ol></ol>";
    renderMixed(explain.querySelector("strong"), R.abbr);
    // put abbr in strong via text
    explain.querySelector("strong").textContent = R.abbr;
    var ol = explain.querySelector("ol");
    ex.steps.forEach(function (s) {
      var li = document.createElement("li");
      ol.appendChild(li);
      renderMixed(li, s);
    });
  }

  /* ── init ────────────────────────────────────────────────── */
  function init() {
    setActiveLab("detect");
    bindDetect();
    bindThm();
    renderDetect();
    renderThm();
    renderReasons();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
