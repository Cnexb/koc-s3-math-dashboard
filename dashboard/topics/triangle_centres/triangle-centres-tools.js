(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var SW = 2.5;
  var INK = "#e2e8f0";
  var MUTED = "#64748b";
  var ACCENT = "#38bdf8";
  var TICK = "#f87171";
  var MARK = "#fbbf24";
  var VB_W = 500;
  var VB_H = 400;

  var LABS = [
    { id: "lines", label: "Lines & centres" },
    { id: "angles", label: "Angle pairs" },
    { id: "match", label: "Congruence & similarity" },
  ];

  var MODES = [
    {
      id: "altitude",
      label: "Altitude → H",
      cap: "An **altitude** is perpendicular from a vertex to the opposite side (or its extension). Three altitudes meet at the **orthocentre**.",
    },
    {
      id: "median",
      label: "Median → G",
      cap: "A **median** joins a vertex to the **mid-point** of the opposite side (equal tick marks on the two halves). Three medians meet at the **centroid**, which divides each median in ratio \\(2:1\\) from the vertex. The centroid **must** lie inside the triangle.",
    },
    {
      id: "bisector",
      label: "Angle bisector → I",
      cap: "An **angle bisector** splits an angle into two equal parts (outward arc marks). Three meet at the **in-centre**, which **must** lie inside the triangle.",
    },
    {
      id: "perp",
      label: "Perp. bisector → O",
      cap: "A **perpendicular bisector** passes through the mid-point of a side at right angles (right-angle mark + equal half-ticks). Three meet at the **circumcentre**.",
    },
  ];

  var PRESETS = {
    // Scalene acute: three different side lengths, all angles < 90°
    acute: [{ x: 55, y: 320 }, { x: 440, y: 300 }, { x: 200, y: 55 }],
    right: [{ x: 100, y: 300 }, { x: 380, y: 300 }, { x: 100, y: 95 }],
    // Obtuse at A; H well clear of A; O well clear of midpoints (both in fixed box)
    obtuse: [{ x: 170, y: 220 }, { x: 400, y: 300 }, { x: 140, y: 60 }],
    // AC = BC (isosceles at C)
    isosceles: [{ x: 150, y: 300 }, { x: 350, y: 300 }, { x: 250, y: 85 }],
    equilateral: [{ x: 130, y: 300 }, { x: 370, y: 300 }, { x: 250, y: 92.2 }],
  };

  var PAD = 28;
  var I_COLOR = "#34d399";
  var I_LINE = "#a78bfa";

  var CONG = [
    { id: "SSS", label: "SSS", cap: "**SSS** — three pairs of equal sides (same tick marks) ⇒ congruent." },
    { id: "SAS", label: "SAS", cap: "**SAS** — two sides and the **included** angle equal ⇒ congruent." },
    { id: "ASA", label: "ASA", cap: "**ASA** — two angles and the **included** side equal ⇒ congruent." },
    { id: "AAS", label: "AAS", cap: "**AAS** — two angles and a **non-included** side equal ⇒ congruent." },
    { id: "RHS", label: "RHS", cap: "**RHS** — right angle, hypotenuse and one other side equal ⇒ congruent." },
  ];

  var ANG = [
    { id: "corr", label: "Corresponding", cap: "**Corresponding angles** are equal — same position relative to the transversal at each parallel." },
    { id: "alt", label: "Alternate interior", cap: "**Alternate interior angles** are equal — opposite sides of the transversal, between the parallels (Z-shape)." },
    { id: "int", label: "Interior same side", cap: "**Interior angles on the same side** of the transversal add up to \\(180^\\circ\\) (C-shape / co-interior)." },
  ];

  var SIM = [
    { id: "AAA", label: "AAA", cap: "**AAA** — all three angles equal ⇒ triangles similar (same shape, possibly different size)." },
    { id: "3sides", label: "3 sides ∝", cap: "**Three sides proportional** — corresponding sides in the same ratio \\(k\\) ⇒ similar." },
    { id: "2side", label: "2 sides + ∠", cap: "**Two sides proportional** with **equal included angle** ⇒ similar." },
  ];

  var MATCH_KINDS = [
    { id: "cong", label: "Congruent (≅)" },
    { id: "sim", label: "Similar (∼)" },
  ];

  var SIDE_TICKS = [1, 2, 3];
  var ANGLE_ARCS = [1, 2, 3];

  var verts = PRESETS.acute.map(function (v) { return { x: v.x, y: v.y }; });
  var mode = "altitude";
  var activePreset = "acute";
  var congMode = "SSS";
  var angMode = "corr";
  var simMode = "AAA";
  var matchKind = "cong";
  var simK = 0.8;
  var drag = null;
  var angDrag = null;
  var matchDrag = null;

  // Transversal endpoints for Lab 2 (parallel lines at fixed y)
  var angY1 = 90;
  var angY2 = 230;
  var angT = [{ x: 110, y: 30 }, { x: 410, y: 290 }];

  // Draggable left triangle for Lab 3
  var matchA = [{ x: 70, y: 230 }, { x: 200, y: 230 }, { x: 110, y: 80 }];

  function E(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    return el;
  }
  function clr(g) { while (g.firstChild) g.removeChild(g.firstChild); }
  function mid(p, q) { return { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 }; }
  function lerp(p, q, t) { return { x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t }; }
  function seg(p, q, col, w) {
    return E("line", {
      x1: p.x, y1: p.y, x2: q.x, y2: q.y,
      stroke: col || INK, "stroke-width": w || SW, "stroke-linecap": "round",
    });
  }
  function dashedSeg(p, q, col, w) {
    var el = seg(p, q, col, w || 1.8);
    el.setAttribute("stroke-dasharray", "8 6");
    el.setAttribute("stroke-linecap", "butt");
    return el;
  }
  function dot(p, col, r) {
    return E("circle", { cx: p.x, cy: p.y, r: r || 5, fill: col });
  }
  function unit(p, q) {
    var d = Math.hypot(q.x - p.x, q.y - p.y) || 1;
    return { x: (q.x - p.x) / d, y: (q.y - p.y) / d };
  }
  function perp(u) { return { x: -u.y, y: u.x }; }

  function hashMarks(p, q, t, count, col, len) {
    var g = E("g", {});
    var u = unit(p, q);
    var n = perp(u);
    var c = lerp(p, q, t);
    len = len || 10;
    var gap = 5;
    for (var i = 0; i < count; i++) {
      var off = (i - (count - 1) / 2) * gap;
      var a = { x: c.x + u.x * off - n.x * len / 2, y: c.y + u.y * off - n.y * len / 2 };
      var b = { x: c.x + u.x * off + n.x * len / 2, y: c.y + u.y * off + n.y * len / 2 };
      g.appendChild(seg(a, b, col || TICK, 2));
    }
    return g;
  }

  function sideHashes(p, q, count, col) {
    return hashMarks(p, q, 0.5, count, col, 12);
  }

  function medianHalfMarks(p1, m, p2, tickLevel) {
    var g = E("g", {});
    g.appendChild(hashMarks(p1, m, 0.5, tickLevel, TICK, 9));
    g.appendChild(hashMarks(m, p2, 0.5, tickLevel, TICK, 9));
    return g;
  }

  function rightAngle(V, P, Q, size) {
    size = size || 12;
    var u1 = unit(V, P);
    var u2 = unit(V, Q);
    var a = { x: V.x + u1.x * size, y: V.y + u1.y * size };
    var b = { x: V.x + u1.x * size + u2.x * size, y: V.y + u1.y * size + u2.y * size };
    var c = { x: V.x + u2.x * size, y: V.y + u2.y * size };
    return E("polyline", {
      points: [a.x, a.y, b.x, b.y, c.x, c.y].join(" "),
      fill: "none", stroke: MARK, "stroke-width": 1.8,
    });
  }

  function shortArcPath(V, a1, a2, r) {
    var da = a2 - a1;
    while (da <= -Math.PI) da += Math.PI * 2;
    while (da > Math.PI) da -= Math.PI * 2;
    // SVG y-down: sweep 1 = clockwise = positive atan2 direction
    var sweep = da >= 0 ? 1 : 0;
    return "M " + (V.x + r * Math.cos(a1)) + " " + (V.y + r * Math.sin(a1)) +
      " A " + r + " " + r + " 0 0 " + sweep + " " +
      (V.x + r * Math.cos(a2)) + " " + (V.y + r * Math.sin(a2));
  }

  function outwardArcs(V, P, Q, count, baseR) {
    var g = E("g", {});
    var a1 = Math.atan2(P.y - V.y, P.x - V.x);
    var a2 = Math.atan2(Q.y - V.y, Q.x - V.x);
    for (var k = 0; k < count; k++) {
      var r = baseR + k * 5;
      g.appendChild(E("path", {
        d: shortArcPath(V, a1, a2, r),
        fill: "none", stroke: MARK, "stroke-width": 1.6,
      }));
    }
    return g;
  }

  /** Equal-angle marks on both halves of a bisected angle — same curve direction. */
  function bisectorArcMarks(V, P, Q, I, count, baseR) {
    var g = E("g", {});
    var aP = Math.atan2(P.y - V.y, P.x - V.x);
    var aQ = Math.atan2(Q.y - V.y, Q.x - V.x);
    var aI = Math.atan2(I.y - V.y, I.x - V.x);
    for (var k = 0; k < count; k++) {
      var r = baseR + k * 5;
      g.appendChild(E("path", {
        d: shortArcPath(V, aP, aI, r),
        fill: "none", stroke: MARK, "stroke-width": 1.6,
      }));
      g.appendChild(E("path", {
        d: shortArcPath(V, aI, aQ, r),
        fill: "none", stroke: MARK, "stroke-width": 1.6,
      }));
    }
    return g;
  }

  function rayHitOpposite(V, through, B, C) {
    var hit = intersectLines(V, through, B, C);
    if (!hit) return through;
    var along = (hit.x - V.x) * (through.x - V.x) + (hit.y - V.y) * (through.y - V.y);
    if (along <= 0) return extendThrough(V, through, 40);
    return hit;
  }

  function foot(A, B, C) {
    var dx = C.x - B.x;
    var dy = C.y - B.y;
    var t = ((A.x - B.x) * dx + (A.y - B.y) * dy) / (dx * dx + dy * dy);
    return { x: B.x + t * dx, y: B.y + t * dy, t: t };
  }

  function intersectLines(p1, p2, p3, p4) {
    var d1 = { x: p2.x - p1.x, y: p2.y - p1.y };
    var d2 = { x: p4.x - p3.x, y: p4.y - p3.y };
    var det = d1.x * d2.y - d1.y * d2.x;
    if (Math.abs(det) < 1e-6) return null;
    var t = ((p3.x - p1.x) * d2.y - (p3.y - p1.y) * d2.x) / det;
    return { x: p1.x + t * d1.x, y: p1.y + t * d1.y };
  }

  function extendThrough(p, q, dist) {
    var u = unit(p, q);
    return { x: q.x + u.x * dist, y: q.y + u.y * dist };
  }

  function incentre(v) {
    var a = Math.hypot(v[1].x - v[2].x, v[1].y - v[2].y);
    var b = Math.hypot(v[0].x - v[2].x, v[0].y - v[2].y);
    var c = Math.hypot(v[0].x - v[1].x, v[0].y - v[1].y);
    var p = a + b + c;
    return {
      x: (a * v[0].x + b * v[1].x + c * v[2].x) / p,
      y: (a * v[0].y + b * v[1].y + c * v[2].y) / p,
    };
  }

  function centroid(v) {
    return { x: (v[0].x + v[1].x + v[2].x) / 3, y: (v[0].y + v[1].y + v[2].y) / 3 };
  }

  function orthocentre(v) {
    var F0 = foot(v[0], v[1], v[2]);
    var F1 = foot(v[1], v[0], v[2]);
    return intersectLines(v[0], F0, v[1], F1);
  }

  function circumcentre(v) {
    var A = v[0];
    var B = v[1];
    var C = v[2];
    var D = 2 * (A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y));
    if (Math.abs(D) < 1e-6) return null;
    var a2 = A.x * A.x + A.y * A.y;
    var b2 = B.x * B.x + B.y * B.y;
    var c2 = C.x * C.x + C.y * C.y;
    return {
      x: (a2 * (B.y - C.y) + b2 * (C.y - A.y) + c2 * (A.y - B.y)) / D,
      y: (a2 * (C.x - B.x) + b2 * (A.x - C.x) + c2 * (B.x - A.x)) / D,
    };
  }

  function sideLengths(v) {
    return [0, 1, 2].map(function (i) {
      var j = (i + 1) % 3;
      return Math.hypot(v[j].x - v[i].x, v[j].y - v[i].y);
    });
  }

  function angleAt(v, i) {
    var prev = v[(i + 2) % 3];
    var cur = v[i];
    var next = v[(i + 1) % 3];
    var u = { x: prev.x - cur.x, y: prev.y - cur.y };
    var w = { x: next.x - cur.x, y: next.y - cur.y };
    var dotp = u.x * w.x + u.y * w.y;
    var m = Math.hypot(u.x, u.y) * Math.hypot(w.x, w.y);
    return Math.acos(Math.max(-1, Math.min(1, dotp / m))) * 180 / Math.PI;
  }

  function triangleKind(v) {
    var angles = [0, 1, 2].map(function (i) { return angleAt(v, i); });
    var maxA = Math.max.apply(null, angles);
    var sides = sideLengths(v).slice().sort(function (a, b) { return a - b; });
    var avg = (sides[0] + sides[1] + sides[2]) / 3;
    var eqTol = avg * 0.04;
    if (Math.abs(sides[0] - sides[1]) < eqTol && Math.abs(sides[1] - sides[2]) < eqTol) return "equilateral";
    if (Math.abs(maxA - 90) < 3.5) return "right";
    if (maxA > 90) return "obtuse";
    if (Math.abs(sides[0] - sides[1]) < eqTol || Math.abs(sides[1] - sides[2]) < eqTol) return "isosceles";
    return "acute";
  }

  function pointInTri(p, v) {
    var signs = [0, 1, 2].map(function (i) {
      var j = (i + 1) % 3;
      var k = (i + 2) % 3;
      return (p.x - v[j].x) * (v[k].y - v[j].y) - (v[k].x - v[j].x) * (p.y - v[j].y);
    });
    return !(signs.some(function (s) { return s < 0; }) && signs.some(function (s) { return s > 0; }));
  }

  function triCenter(v) {
    return centroid(v);
  }

  function distPointToSeg(p, a, b) {
    var abx = b.x - a.x;
    var aby = b.y - a.y;
    var len2 = abx * abx + aby * aby || 1;
    var t = ((p.x - a.x) * abx + (p.y - a.y) * aby) / len2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p.x - (a.x + t * abx), p.y - (a.y + t * aby));
  }

  function labelAway(p, avoid, text, col, dist) {
    dist = dist || 18;
    var dx = p.x - avoid.x;
    var dy = p.y - avoid.y;
    var d = Math.hypot(dx, dy) || 1;
    var t = E("text", {
      x: p.x + (dx / d) * dist,
      y: p.y + (dy / d) * dist + 5,
      fill: col || INK,
      "font-size": 15,
      "font-weight": 700,
      "text-anchor": "middle",
    });
    t.textContent = text;
    return t;
  }

  /** Place centre label off nearby construction lines (try many offset angles). */
  function centreLabel(g, p, v, text, col, extraLines) {
    var lines = (extraLines || []).slice();
    v.forEach(function (vi) { lines.push([vi, p]); });
    for (var i = 0; i < 3; i++) lines.push([v[i], v[(i + 1) % 3]]);
    var best = null;
    var bestScore = -1;
    for (var k = 0; k < 16; k++) {
      var ang = (k / 16) * Math.PI * 2;
      var lp = { x: p.x + Math.cos(ang) * 30, y: p.y + Math.sin(ang) * 30 };
      var minD = Infinity;
      lines.forEach(function (L) {
        minD = Math.min(minD, distPointToSeg(lp, L[0], L[1]));
      });
      if (minD > bestScore) {
        bestScore = minD;
        best = lp;
      }
    }
    var t = E("text", {
      x: best.x, y: best.y + 5, fill: col || INK,
      "font-size": 15, "font-weight": 700, "text-anchor": "middle",
    });
    t.textContent = text;
    g.appendChild(t);
  }

  function vertexLabels(g, v) {
    var c = triCenter(v);
    ["A", "B", "C"].forEach(function (name, i) {
      g.appendChild(dot(v[i], "#94a3b8", 6));
      g.appendChild(labelAway(v[i], c, name, INK, 20));
    });
  }

  function rightAngleVertexIndex(v) {
    var angles = [0, 1, 2].map(function (i) { return angleAt(v, i); });
    for (var i = 0; i < 3; i++) {
      if (Math.abs(angles[i] - 90) < 3.5) return i;
    }
    return -1;
  }

  /** Side equality ticks for isosceles (equal legs) / equilateral (all three). */
  function equalSideTickPlan(v, kind) {
    if (kind === "equilateral") return [1, 1, 1];
    var sides = sideLengths(v);
    var avg = (sides[0] + sides[1] + sides[2]) / 3;
    var tol = avg * 0.04;
    var plan = [0, 0, 0];
    var pairs = [[0, 1], [1, 2], [0, 2]];
    var tick = 1;
    pairs.forEach(function (pr) {
      if (Math.abs(sides[pr[0]] - sides[pr[1]]) < tol) {
        if (!plan[pr[0]]) plan[pr[0]] = tick;
        if (!plan[pr[1]]) plan[pr[1]] = tick;
        tick++;
      }
    });
    return plan;
  }

  /**
   * Half-tick plan for median / perp bisector:
   * - scalene: 1,2,3 (different sides ≠)
   * - isosceles: equal legs share a count; base halves also marked (different count)
   * - equilateral: all 1
   */
  function halfTickPlan(v, kind) {
    if (kind === "equilateral") return [1, 1, 1];
    if (kind === "isosceles") {
      var sides = sideLengths(v);
      var avg = (sides[0] + sides[1] + sides[2]) / 3;
      var tol = avg * 0.04;
      var plan = [0, 0, 0];
      // Mark equal legs with 2; the remaining base with 1
      if (Math.abs(sides[1] - sides[2]) < tol) { plan[1] = 2; plan[2] = 2; plan[0] = 1; }
      else if (Math.abs(sides[0] - sides[2]) < tol) { plan[0] = 2; plan[2] = 2; plan[1] = 1; }
      else if (Math.abs(sides[0] - sides[1]) < tol) { plan[0] = 2; plan[1] = 2; plan[2] = 1; }
      else return SIDE_TICKS.slice();
      return plan;
    }
    return SIDE_TICKS.slice();
  }

  function drawSideEqualityMarks(g, v, kind) {
    if (kind !== "isosceles" && kind !== "equilateral") return;
    var plan = equalSideTickPlan(v, kind);
    [0, 1, 2].forEach(function (i) {
      if (!plan[i]) return;
      var j = (i + 1) % 3;
      g.appendChild(sideHashes(v[i], v[j], plan[i], TICK));
    });
  }

  /** Dashed extension of side BC to altitude foot when foot lies outside the segment. */
  function drawSideExtensionToFoot(g, B, C, F) {
    if (F.t >= -0.02 && F.t <= 1.02) return;
    if (F.t < 0) g.appendChild(dashedSeg(B, F, "#94a3b8", 1.8));
    else g.appendChild(dashedSeg(C, F, "#94a3b8", 1.8));
  }

  function angleArcPlan(kind, v) {
    if (kind === "equilateral") return [1, 1, 1];
    if (kind === "isosceles") {
      var sides = sideLengths(v);
      var avg = (sides[0] + sides[1] + sides[2]) / 3;
      var tol = avg * 0.04;
      if (Math.abs(sides[1] - sides[2]) < tol) return [2, 2, 1];
      if (Math.abs(sides[0] - sides[2]) < tol) return [2, 1, 2];
      if (Math.abs(sides[0] - sides[1]) < tol) return [1, 2, 2];
      return [1, 1, 1];
    }
    return ANGLE_ARCS.slice();
  }

  function centreLocationWord(modeId, kind, p, v) {
    if (modeId === "median" || modeId === "bisector") return "inside";
    if (!p) return "—";
    if (modeId === "altitude" && kind === "right") {
      var ri = rightAngleVertexIndex(v);
      if (ri >= 0 && Math.hypot(p.x - v[ri].x, p.y - v[ri].y) < 12) return "on (right)";
    }
    if (pointInTri(p, v)) return "inside (acute)";
    return kind === "obtuse" ? "outside (obtuse)" : "outside";
  }

  function setPlacement(modeId, kind, centreP, v) {
    var names = { altitude: "Orthocentre", median: "Centroid", bisector: "In-centre", perp: "Circumcentre" };
    var el = document.getElementById("tri-placement");
    var loc = centreLocationWord(modeId, kind, centreP, v);
    var parts = [names[modeId] + " may lie inside (acute), on (right), or outside (obtuse)."];
    if (kind === "equilateral") parts.push("Equilateral triangle: all four centres coincide.");
    else if (kind === "isosceles") parts.push("Isosceles triangle: all four centres lie on the axis of symmetry.");
    parts.push("Currently: " + loc + ".");
    el.textContent = parts.join(" ");
  }

  function setFixedViewBox(svg) {
    svg.setAttribute("viewBox", "0 0 " + VB_W + " " + VB_H);
  }

  function clampVert(p) {
    return {
      x: Math.max(PAD, Math.min(VB_W - PAD, p.x)),
      y: Math.max(PAD, Math.min(VB_H - PAD, p.y)),
    };
  }

  function renderMixed(el, text) {
    if (!el) return;
    el.textContent = "";
    text.split(/(\*\*[^*]+\*\*)/).forEach(function (part) {
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
        delimiters: [{ left: "\\(", right: "\\)", display: false }, { left: "\\[", right: "\\]", display: true }],
      });
    }
  }

  function drawTriOutline(g, v) {
    g.appendChild(E("polygon", {
      points: v.map(function (p) { return p.x + "," + p.y; }).join(" "),
      fill: "rgba(56,189,248,.12)", stroke: INK, "stroke-width": SW,
    }));
    vertexLabels(g, v);
  }

  function renderLines() {
    var svg = document.getElementById("tri-svg");
    clr(svg);
    setFixedViewBox(svg);
    var kind = triangleKind(verts);
    var c = triCenter(verts);

    drawTriOutline(svg, verts);

    if (kind === "right") {
      var raSize = mode === "bisector" ? 8 : 11;
      var ri = rightAngleVertexIndex(verts);
      if (ri >= 0) {
        var prev = verts[(ri + 2) % 3];
        var next = verts[(ri + 1) % 3];
        svg.appendChild(rightAngle(verts[ri], prev, next, raSize));
      }
    }

    if (mode === "altitude") {
      drawSideEqualityMarks(svg, verts, kind);
      var H = orthocentre(verts);
      var altLines = [];
      verts.forEach(function (v, i) {
        var B = verts[(i + 1) % 3];
        var C = verts[(i + 2) % 3];
        var F = foot(v, B, C);
        drawSideExtensionToFoot(svg, B, C, F);
        if (H) {
          var u = unit(v, F);
          var tH = (H.x - v.x) * u.x + (H.y - v.y) * u.y;
          var tF = (F.x - v.x) * u.x + (F.y - v.y) * u.y;
          var tMax = Math.max(tF, tH);
          var tMin = Math.min(0, Math.min(tF, tH));
          var p0 = { x: v.x + u.x * tMin, y: v.y + u.y * tMin };
          var p1 = { x: v.x + u.x * tMax, y: v.y + u.y * tMax };
          svg.appendChild(seg(p0, p1, ACCENT));
          altLines.push([p0, p1]);
        } else {
          svg.appendChild(seg(v, F, ACCENT));
          altLines.push([v, F]);
        }
        svg.appendChild(dot(F, MUTED, 3.5));
        svg.appendChild(rightAngle(F, v, B, 10));
      });
      if (H) {
        svg.appendChild(dot(H, "#2dd4bf", 6));
        centreLabel(svg, H, verts, "H", "#2dd4bf", altLines);
      }
      setPlacement("altitude", kind, H, verts);
    }

    if (mode === "median") {
      var G = centroid(verts);
      var sideTicks = halfTickPlan(verts, kind);
      var medLines = [];
      verts.forEach(function (v, i) {
        var opp = [(i + 1) % 3, (i + 2) % 3];
        var p1 = verts[opp[0]];
        var p2 = verts[opp[1]];
        var sideIdx = opp[0];
        var M = mid(p1, p2);
        svg.appendChild(seg(v, M, ACCENT));
        medLines.push([v, M]);
        svg.appendChild(dot(M, MUTED, 3.5));
        if (sideTicks[sideIdx] > 0) {
          svg.appendChild(medianHalfMarks(p1, M, p2, sideTicks[sideIdx]));
        }
        if (i === 0) svg.appendChild(labelAway(M, c, "D", MUTED, 18));
      });
      svg.appendChild(dot(G, MARK, 6));
      centreLabel(svg, G, verts, "G", MARK, medLines);
      setPlacement("median", kind, G, verts);
    }

    if (mode === "bisector") {
      drawSideEqualityMarks(svg, verts, kind);
      var I = incentre(verts);
      var arcPlan = angleArcPlan(kind, verts);
      var bisLines = [];
      verts.forEach(function (v, i) {
        var B = verts[(i + 1) % 3];
        var C = verts[(i + 2) % 3];
        var hit = rayHitOpposite(v, I, B, C);
        var tip = extendThrough(v, hit, 14);
        svg.appendChild(seg(v, tip, I_LINE));
        bisLines.push([v, tip]);
        svg.appendChild(bisectorArcMarks(v, B, C, I, arcPlan[i], 16));
      });
      svg.appendChild(dot(I, I_COLOR, 7));
      centreLabel(svg, I, verts, "I", I_COLOR, bisLines);
      setPlacement("bisector", kind, I, verts);
    }

    if (mode === "perp") {
      var O = circumcentre(verts);
      var sideTicks = halfTickPlan(verts, kind);
      var perpLines = [];
      [[0, 1], [1, 2], [2, 0]].forEach(function (pair, idx) {
        var p1 = verts[pair[0]];
        var p2 = verts[pair[1]];
        var M = mid(p1, p2);
        var n = perp(unit(p1, p2));
        var len = 90;
        if (O) {
          var dist = Math.hypot(O.x - M.x, O.y - M.y);
          len = Math.max(90, dist + 28);
          var toO = { x: O.x - M.x, y: O.y - M.y };
          if (toO.x * n.x + toO.y * n.y < 0) n = { x: -n.x, y: -n.y };
        }
        var far = { x: M.x + n.x * len, y: M.y + n.y * len };
        var near = { x: M.x - n.x * 28, y: M.y - n.y * 28 };
        svg.appendChild(seg(near, far, "#f87171"));
        perpLines.push([near, far]);
        svg.appendChild(dot(M, MUTED, 3.5));
        svg.appendChild(rightAngle(M, p2, { x: M.x + n.x * 40, y: M.y + n.y * 40 }, 10));
        if (sideTicks[idx] > 0) {
          svg.appendChild(medianHalfMarks(p1, M, p2, sideTicks[idx]));
        }
      });
      if (O) {
        svg.appendChild(dot(O, "#f87171", 6));
        centreLabel(svg, O, verts, "O", "#f87171", perpLines);
      }
      setPlacement("perp", kind, O, verts);
    }

    verts.forEach(function (v, i) {
      var h = E("circle", { cx: v.x, cy: v.y, r: 16, fill: "transparent", "data-i": i });
      h.style.cursor = "grab";
      svg.appendChild(h);
    });

    var badges = document.getElementById("tri-type-badges");
    badges.innerHTML = "";
    ["Acute", "Right", "Obtuse", "Isosceles", "Equilateral"].forEach(function (name) {
      var b = document.createElement("span");
      var key = name.toLowerCase();
      b.className = "badge" + (kind === key ? " on" : "");
      b.textContent = name;
      badges.appendChild(b);
    });

    document.querySelectorAll("#tri-preset-btns .btn").forEach(function (btn) {
      btn.classList.toggle("active", btn.dataset.preset === activePreset);
    });

    renderMixed(document.getElementById("tri-caption"), MODES.find(function (x) { return x.id === mode; }).cap);
  }

  function lineHitY(p1, p2, y) {
    var dy = p2.y - p1.y;
    if (Math.abs(dy) < 1e-6) return { x: p1.x, y: y };
    var t = (y - p1.y) / dy;
    return { x: p1.x + (p2.x - p1.x) * t, y: y };
  }

  function wedgePath(V, a0, a1, r) {
    var da = a1 - a0;
    while (da <= -Math.PI) da += Math.PI * 2;
    while (da > Math.PI) da -= Math.PI * 2;
    var sweep = da >= 0 ? 1 : 0;
    return "M " + V.x + " " + V.y +
      " L " + (V.x + r * Math.cos(a0)) + " " + (V.y + r * Math.sin(a0)) +
      " A " + r + " " + r + " 0 0 " + sweep + " " +
      (V.x + r * Math.cos(a1)) + " " + (V.y + r * Math.sin(a1)) + " Z";
  }

  function renderAngles() {
    var svg = document.getElementById("ang-svg");
    if (!svg) return;
    clr(svg);
    var x0 = 40, x1 = 480;
    svg.appendChild(seg({ x: x0, y: angY1 }, { x: x1, y: angY1 }, INK, 2.2));
    svg.appendChild(seg({ x: x0, y: angY2 }, { x: x1, y: angY2 }, INK, 2.2));
    // parallel marks (two ticks on each line)
    [angY1, angY2].forEach(function (y) {
      svg.appendChild(seg({ x: 95, y: y - 7 }, { x: 105, y: y + 7 }, MUTED, 1.5));
      svg.appendChild(seg({ x: 102, y: y - 7 }, { x: 112, y: y + 7 }, MUTED, 1.5));
    });

    var T1 = angT[0];
    var T2 = angT[1];
    var u = unit(T1, T2);
    var ext1 = { x: T1.x - u.x * 40, y: T1.y - u.y * 40 };
    var ext2 = { x: T2.x + u.x * 40, y: T2.y + u.y * 40 };
    svg.appendChild(seg(ext1, ext2, ACCENT, 2.4));

    var P = lineHitY(T1, T2, angY1);
    var Q = lineHitY(T1, T2, angY2);
    svg.appendChild(dot(P, "#94a3b8", 4));
    svg.appendChild(dot(Q, "#94a3b8", 4));

    function anglesAt(alongTrans) {
      var aE = 0;
      var aW = Math.PI;
      var aDown = Math.atan2(alongTrans.y, alongTrans.x);
      var aUp = Math.atan2(-alongTrans.y, -alongTrans.x);
      var rays = [
        { a: aE }, { a: aW }, { a: aDown }, { a: aUp },
      ];
      rays.forEach(function (r) {
        while (r.a < 0) r.a += Math.PI * 2;
        while (r.a >= Math.PI * 2) r.a -= Math.PI * 2;
      });
      rays.sort(function (a, b) { return a.a - b.a; });
      var wedges = [];
      for (var i = 0; i < 4; i++) {
        var a0 = rays[i].a;
        var a1 = rays[(i + 1) % 4].a;
        if (a1 <= a0) a1 += Math.PI * 2;
        wedges.push({ a0: a0, a1: a1, mid: (a0 + a1) / 2 });
      }
      return wedges;
    }

    var along = { x: T2.x - T1.x, y: T2.y - T1.y };
    var wP = anglesAt(along);
    var wQ = anglesAt(along);

    function classify(midA, isUpper) {
      var mx = Math.cos(midA);
      var my = Math.sin(midA);
      var interior = isUpper ? my > 0 : my < 0;
      var cross = along.x * my - along.y * mx;
      return { interior: interior, left: cross > 0, above: my < 0 };
    }

    var labeled = [];
    function addWedges(V, wedges, isUpper, startId) {
      wedges.forEach(function (w, i) {
        var cls = classify(w.mid, isUpper);
        labeled.push({
          id: startId + i,
          V: V,
          w: w,
          interior: cls.interior,
          left: cls.left,
          above: cls.above,
          isUpper: isUpper,
          labelPos: {
            x: V.x + Math.cos(w.mid) * 28,
            y: V.y + Math.sin(w.mid) * 28,
          },
        });
      });
    }
    addWedges(P, wP, true, 0);
    addWedges(Q, wQ, false, 4);

    var hiSet = {};
    var pairNote = "";

    if (angMode === "corr") {
      labeled.forEach(function (a) {
        if (!a.isUpper) return;
        labeled.forEach(function (b) {
          if (b.isUpper) return;
          if (a.left === b.left && a.above === b.above) {
            hiSet[a.id] = true;
            hiSet[b.id] = true;
          }
        });
      });
      pairNote = "Highlighted pairs are equal (corresponding angles).";
    } else if (angMode === "alt") {
      labeled.forEach(function (a) {
        if (!a.interior || !a.isUpper) return;
        labeled.forEach(function (b) {
          if (!b.interior || b.isUpper) return;
          if (a.left !== b.left) {
            hiSet[a.id] = true;
            hiSet[b.id] = true;
          }
        });
      });
      pairNote = "Highlighted pairs are equal (alternate interior angles).";
    } else {
      labeled.forEach(function (a) {
        if (!a.interior || !a.isUpper) return;
        labeled.forEach(function (b) {
          if (!b.interior || b.isUpper) return;
          if (a.left === b.left) {
            hiSet[a.id] = true;
            hiSet[b.id] = true;
          }
        });
      });
      pairNote = "Highlighted pairs add to 180° (interior angles on the same side).";
    }

    labeled.forEach(function (L, idx) {
      var on = !!hiSet[L.id];
      svg.appendChild(E("path", {
        d: wedgePath(L.V, L.w.a0, L.w.a1, 22),
        fill: on ? "rgba(251,191,36,.45)" : "rgba(148,163,184,.12)",
        stroke: on ? MARK : "rgba(148,163,184,.35)",
        "stroke-width": on ? 1.8 : 1,
      }));
      var tEl = E("text", {
        x: L.labelPos.x, y: L.labelPos.y + 4,
        fill: on ? MARK : MUTED,
        "font-size": 13, "font-weight": 700, "text-anchor": "middle",
      });
      tEl.textContent = String(idx + 1);
      svg.appendChild(tEl);
    });

    // Drag handles
    angT.forEach(function (p, i) {
      svg.appendChild(dot(p, ACCENT, 8));
      var h = E("circle", { cx: p.x, cy: p.y, r: 16, fill: "transparent", "data-ang": i });
      h.style.cursor = "grab";
      svg.appendChild(h);
    });

    renderMixed(document.getElementById("ang-caption"), ANG.find(function (a) { return a.id === angMode; }).cap);
    var note = document.getElementById("ang-note");
    if (note) note.textContent = pairNote + " Drag the blue endpoints to change the transversal.";
  }

  function matchSecondTriangle(A, k) {
    // Place DEF to the right, scaled by k about its own centroid-ish base
    var ox = 300;
    var oy = 230;
    return [
      { x: ox, y: oy },
      { x: ox + (A[1].x - A[0].x) * k, y: oy + (A[1].y - A[0].y) * k },
      { x: ox + (A[2].x - A[0].x) * k, y: oy + (A[2].y - A[0].y) * k },
    ];
  }

  function drawTri(g, v, labels) {
    g.appendChild(E("polygon", {
      points: v.map(function (p) { return p.x + "," + p.y; }).join(" "),
      fill: "rgba(56,189,248,.12)", stroke: INK, "stroke-width": SW,
    }));
    var c = triCenter(v);
    labels.forEach(function (L, i) {
      g.appendChild(dot(v[i], "#94a3b8", 6));
      g.appendChild(labelAway(v[i], c, L, INK, 18));
    });
  }

  function applyMatchMarks(svg, A, D, kind, cond) {
    if (kind === "cong") {
      if (cond === "SSS") {
        [[0, 1], [1, 2], [2, 0]].forEach(function (s, i) {
          svg.appendChild(sideHashes(A[s[0]], A[s[1]], i + 1, TICK));
          svg.appendChild(sideHashes(D[s[0]], D[s[1]], i + 1, TICK));
        });
      } else if (cond === "SAS") {
        svg.appendChild(sideHashes(A[0], A[1], 1, TICK));
        svg.appendChild(sideHashes(A[1], A[2], 2, TICK));
        svg.appendChild(sideHashes(D[0], D[1], 1, TICK));
        svg.appendChild(sideHashes(D[1], D[2], 2, TICK));
        svg.appendChild(outwardArcs(A[1], A[0], A[2], 1, 20));
        svg.appendChild(outwardArcs(D[1], D[0], D[2], 1, 20));
      } else if (cond === "ASA") {
        svg.appendChild(sideHashes(A[1], A[2], 1, TICK));
        svg.appendChild(sideHashes(D[1], D[2], 1, TICK));
        svg.appendChild(outwardArcs(A[1], A[0], A[2], 1, 20));
        svg.appendChild(outwardArcs(A[2], A[1], A[0], 2, 18));
        svg.appendChild(outwardArcs(D[1], D[0], D[2], 1, 20));
        svg.appendChild(outwardArcs(D[2], D[1], D[0], 2, 18));
      } else if (cond === "AAS") {
        svg.appendChild(sideHashes(A[0], A[1], 1, TICK));
        svg.appendChild(sideHashes(D[0], D[1], 1, TICK));
        svg.appendChild(outwardArcs(A[0], A[1], A[2], 1, 20));
        svg.appendChild(outwardArcs(A[1], A[0], A[2], 2, 18));
        svg.appendChild(outwardArcs(D[0], D[1], D[2], 1, 20));
        svg.appendChild(outwardArcs(D[1], D[0], D[2], 2, 18));
      } else if (cond === "RHS") {
        // Force right angle look at A/D by mark only (triangle may not be right — reset on RHS pick)
        svg.appendChild(rightAngle(A[0], A[1], A[2], 12));
        svg.appendChild(rightAngle(D[0], D[1], D[2], 12));
        svg.appendChild(sideHashes(A[1], A[2], 1, TICK));
        svg.appendChild(sideHashes(D[1], D[2], 1, TICK));
        svg.appendChild(sideHashes(A[0], A[2], 2, TICK));
        svg.appendChild(sideHashes(D[0], D[2], 2, TICK));
      }
    } else {
      if (cond === "AAA") {
        [A, D].forEach(function (t) {
          [0, 1, 2].forEach(function (i) {
            svg.appendChild(outwardArcs(t[i], t[(i + 2) % 3], t[(i + 1) % 3], i + 1, 14));
          });
        });
      } else if (cond === "3sides") {
        [[0, 1], [1, 2], [2, 0]].forEach(function (s, i) {
          svg.appendChild(sideHashes(A[s[0]], A[s[1]], i + 1, TICK));
          svg.appendChild(sideHashes(D[s[0]], D[s[1]], i + 1, TICK));
        });
      } else {
        svg.appendChild(sideHashes(A[0], A[1], 1, TICK));
        svg.appendChild(sideHashes(A[1], A[2], 2, TICK));
        svg.appendChild(sideHashes(D[0], D[1], 1, TICK));
        svg.appendChild(sideHashes(D[1], D[2], 2, TICK));
        svg.appendChild(outwardArcs(A[1], A[0], A[2], 1, 20));
        svg.appendChild(outwardArcs(D[1], D[0], D[2], 1, 20));
      }
    }
  }

  function renderMatch() {
    var svg = document.getElementById("match-svg");
    if (!svg) return;
    clr(svg);

    var k = matchKind === "cong" ? 1 : simK;
    var A = matchA;
    if (congMode === "RHS" && matchKind === "cong") {
      // Snap to a clear right triangle for RHS
      A = [{ x: 70, y: 230 }, { x: 210, y: 230 }, { x: 70, y: 90 }];
    }
    var D = matchSecondTriangle(A, k);
    drawTri(svg, A, ["A", "B", "C"]);
    drawTri(svg, D, ["D", "E", "F"]);

    var cond = matchKind === "cong" ? congMode : simMode;
    applyMatchMarks(svg, A, D, matchKind, cond);

    // Drag handles on ABC only (not when RHS snap unless we allow)
    if (!(matchKind === "cong" && congMode === "RHS")) {
      matchA.forEach(function (v, i) {
        var h = E("circle", { cx: v.x, cy: v.y, r: 16, fill: "transparent", "data-match": i });
        h.style.cursor = "grab";
        svg.appendChild(h);
      });
    }

    var sym = matchKind === "cong" ? "≅" : "∼";
    var list = matchKind === "cong" ? CONG : SIM;
    var item = list.find(function (c) { return c.id === cond; });
    renderMixed(document.getElementById("match-caption"), item ? item.cap : "");
    var note = document.getElementById("match-note");
    if (note) {
      note.textContent = matchKind === "cong"
        ? "△ABC " + sym + " △DEF when the highlighted parts match. Drag A, B, C to reshape."
        : "△ABC " + sym + " △DEF with scale factor k = " + k.toFixed(1) + ". Drag A, B, C; adjust k with the slider.";
    }

    var kRow = document.getElementById("match-k-row");
    if (kRow) kRow.hidden = matchKind !== "sim";
    var kv = document.getElementById("match-k-val");
    if (kv) kv.textContent = simK.toFixed(1);
  }

  function refreshMatchCondBtns() {
    var items = matchKind === "cong" ? CONG : SIM;
    var active = matchKind === "cong" ? congMode : simMode;
    bindBtns("match-cond-btns", items, active, function (id) {
      if (matchKind === "cong") {
        congMode = id;
        if (id === "RHS") {
          matchA = [{ x: 70, y: 230 }, { x: 210, y: 230 }, { x: 70, y: 90 }];
        }
      } else {
        simMode = id;
      }
      renderMatch();
    });
  }

  function pt(e, svg) {
    var r = svg.getBoundingClientRect();
    var vb = svg.viewBox.baseVal;
    return {
      x: (e.clientX - r.left) * (vb.width / r.width) + vb.x,
      y: (e.clientY - r.top) * (vb.height / r.height) + vb.y,
    };
  }

  function bindBtns(containerId, items, active, onPick) {
    var row = document.getElementById(containerId);
    if (!row) return;
    row.innerHTML = "";
    items.forEach(function (item) {
      var id = item.id || item;
      var b = document.createElement("button");
      b.type = "button";
      b.className = "btn" + (id === active ? " active" : "");
      b.textContent = item.label || item;
      b.addEventListener("click", function () {
        onPick(id);
        row.querySelectorAll(".btn").forEach(function (x) { x.classList.remove("active"); });
        b.classList.add("active");
      });
      row.appendChild(b);
    });
  }

  function showLab(id) {
    document.querySelectorAll("#panel-tools .lab").forEach(function (lab) {
      lab.classList.toggle("active", lab.id === "lab-" + id);
    });
    document.querySelectorAll("#jm28-lab-nav .chip").forEach(function (c) {
      c.classList.toggle("active", c.dataset.lab === id);
    });
    if (id === "lines") renderLines();
    if (id === "angles") renderAngles();
    if (id === "match") {
      refreshMatchCondBtns();
      renderMatch();
    }
  }

  function init() {
    var nav = document.getElementById("jm28-lab-nav");
    LABS.forEach(function (lab, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "chip" + (i === 0 ? " active" : "");
      b.dataset.lab = lab.id;
      b.textContent = lab.label;
      b.addEventListener("click", function () { showLab(lab.id); });
      nav.appendChild(b);
    });

    var presetRow = document.getElementById("tri-preset-btns");
    Object.keys(PRESETS).forEach(function (name) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "btn" + (name === activePreset ? " active" : "");
      b.dataset.preset = name;
      b.textContent = name.charAt(0).toUpperCase() + name.slice(1);
      b.addEventListener("click", function () {
        activePreset = name;
        verts = PRESETS[name].map(function (v) { return { x: v.x, y: v.y }; });
        renderLines();
      });
      presetRow.appendChild(b);
    });

    bindBtns("tri-mode-btns", MODES, mode, function (id) { mode = id; renderLines(); });
    bindBtns("ang-mode-btns", ANG, angMode, function (id) { angMode = id; renderAngles(); });
    bindBtns("match-kind-btns", MATCH_KINDS, matchKind, function (id) {
      matchKind = id;
      refreshMatchCondBtns();
      renderMatch();
    });
    refreshMatchCondBtns();

    var triSvg = document.getElementById("tri-svg");
    triSvg.addEventListener("pointerdown", function (e) {
      if (e.target.dataset.i != null) {
        drag = +e.target.dataset.i;
        triSvg.setPointerCapture(e.pointerId);
      }
    });
    triSvg.addEventListener("pointermove", function (e) {
      if (drag == null) return;
      var p = clampVert(pt(e, triSvg));
      verts[drag].x = p.x;
      verts[drag].y = p.y;
      activePreset = "";
      renderLines();
    });
    triSvg.addEventListener("pointerup", function () { drag = null; });
    triSvg.addEventListener("pointercancel", function () { drag = null; });

    // Capture on the SVG itself so redraw mid-drag does not drop the pointer
    var angSvg = document.getElementById("ang-svg");
    angSvg.addEventListener("pointerdown", function (e) {
      if (e.target.getAttribute("data-ang") == null) return;
      angDrag = +e.target.getAttribute("data-ang");
      angSvg.setPointerCapture(e.pointerId);
    });
    angSvg.addEventListener("pointermove", function (e) {
      if (angDrag == null) return;
      var p = pt(e, angSvg);
      angT[angDrag].x = Math.max(40, Math.min(480, p.x));
      angT[angDrag].y = Math.max(20, Math.min(300, p.y));
      renderAngles();
    });
    angSvg.addEventListener("pointerup", function () { angDrag = null; });
    angSvg.addEventListener("pointercancel", function () { angDrag = null; });

    var matchSvg = document.getElementById("match-svg");
    matchSvg.addEventListener("pointerdown", function (e) {
      if (e.target.getAttribute("data-match") == null) return;
      matchDrag = +e.target.getAttribute("data-match");
      matchSvg.setPointerCapture(e.pointerId);
    });
    matchSvg.addEventListener("pointermove", function (e) {
      if (matchDrag == null) return;
      var p = pt(e, matchSvg);
      matchA[matchDrag].x = Math.max(30, Math.min(250, p.x));
      matchA[matchDrag].y = Math.max(40, Math.min(270, p.y));
      renderMatch();
    });
    matchSvg.addEventListener("pointerup", function () { matchDrag = null; });
    matchSvg.addEventListener("pointercancel", function () { matchDrag = null; });

    var kEl = document.getElementById("match-k");
    if (kEl) {
      kEl.addEventListener("input", function (e) {
        simK = +e.target.value;
        renderMatch();
      });
    }

    showLab("lines");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
