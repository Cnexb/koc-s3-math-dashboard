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
    { id: "cong", label: "Congruence" },
    { id: "angles", label: "Angle pairs" },
    { id: "sim", label: "Similarity" },
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
    acute: [{ x: 85, y: 300 }, { x: 395, y: 300 }, { x: 310, y: 72 }],
    right: [{ x: 100, y: 300 }, { x: 380, y: 300 }, { x: 100, y: 95 }],
    obtuse: [{ x: 70, y: 140 }, { x: 430, y: 140 }, { x: 320, y: 320 }],
    isosceles: [{ x: 150, y: 300 }, { x: 350, y: 300 }, { x: 250, y: 85 }],
    equilateral: [{ x: 130, y: 300 }, { x: 370, y: 300 }, { x: 250, y: 92 }],
  };

  var CONG = [
    { id: "SSS", cap: "**SSS** — three pairs of equal sides (same tick marks)." },
    { id: "SAS", cap: "**SAS** — two sides and the **included** angle equal." },
    { id: "ASA", cap: "**ASA** — two angles and the **included** side equal." },
    { id: "AAS", cap: "**AAS** — two angles and a **non-included** side equal." },
    { id: "RHS", cap: "**RHS** — right angle, hypotenuse and one other side equal." },
  ];

  var ANG = [
    { id: "corr", cap: "**Corresponding angles** are equal (same position at each intersection)." },
    { id: "alt", cap: "**Alternate angles** are equal (Z-shape between the parallel lines)." },
    { id: "int", cap: "**Interior angles on the same side** add up to \\(180^\\circ\\)." },
  ];

  var SIM = [
    { id: "AAA", cap: "**AAA** — all three angles equal ⇒ triangles similar." },
    { id: "3sides", cap: "**Three sides proportional** — corresponding sides in ratio \\(k\\)." },
    { id: "2side", cap: "**Two sides proportional** with **equal included angle** ⇒ similar." },
  ];

  var SIDE_TICKS = [1, 2, 3];
  var ANGLE_ARCS = [1, 2, 3];

  var verts = PRESETS.acute.map(function (v) { return { x: v.x, y: v.y }; });
  var mode = "altitude";
  var activePreset = "acute";
  var congMode = "SSS";
  var angMode = "corr";
  var simMode = "AAA";
  var simK = 1;
  var drag = null;

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

  function outwardArcs(V, P, Q, count, baseR) {
    var g = E("g", {});
    var a1 = Math.atan2(P.y - V.y, P.x - V.x);
    var a2 = Math.atan2(Q.y - V.y, Q.x - V.x);
    var da = a2 - a1;
    while (da <= -Math.PI) da += Math.PI * 2;
    while (da > Math.PI) da -= Math.PI * 2;
    var sweep = da > 0 ? 0 : 1;
    var large = Math.abs(da) > Math.PI ? 1 : 0;
    for (var k = 0; k < count; k++) {
      var r = baseR + k * 5;
      g.appendChild(E("path", {
        d: "M " + (V.x + r * Math.cos(a1)) + " " + (V.y + r * Math.sin(a1)) +
          " A " + r + " " + r + " 0 " + large + " " + sweep + " " +
          (V.x + r * Math.cos(a2)) + " " + (V.y + r * Math.sin(a2)),
        fill: "none", stroke: MARK, "stroke-width": 1.6,
      }));
    }
    return g;
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
    var mAB = mid(v[0], v[1]);
    var mBC = mid(v[1], v[2]);
    return intersectLines(mAB, v[2], mBC, v[0]) || mid(v[0], v[2]);
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

  function drawRightAngleAtVertex(g, v) {
    var ri = rightAngleVertexIndex(v);
    if (ri < 0) return;
    var prev = v[(ri + 2) % 3];
    var next = v[(ri + 1) % 3];
    g.appendChild(rightAngle(v[ri], prev, next, 11));
  }

  function sideMarkPlan(kind, sides) {
    var sorted = sides.map(function (s, i) { return { len: s, i: i }; }).sort(function (a, b) { return a.len - b.len; });
    var plan = [1, 2, 3];
    if (kind === "equilateral") return [1, 1, 1];
    if (kind === "isosceles") {
      if (Math.abs(sorted[0].len - sorted[1].len) < sorted[2].len * 0.04) {
        plan[sorted[0].i] = 2;
        plan[sorted[1].i] = 2;
        plan[sorted[2].i] = 1;
      } else {
        plan[sorted[1].i] = 2;
        plan[sorted[2].i] = 2;
        plan[sorted[0].i] = 1;
      }
      return plan;
    }
    return plan;
  }

  function drawSideEqualityMarks(g, v, kind) {
    if (kind !== "isosceles" && kind !== "equilateral") return;
    var sides = sideLengths(v);
    var plan = sideMarkPlan(kind, sides);
    [0, 1, 2].forEach(function (i) {
      var j = (i + 1) % 3;
      g.appendChild(sideHashes(v[i], v[j], plan[i], TICK));
    });
  }

  function angleArcPlan(kind) {
    if (kind === "equilateral") return [1, 1, 1];
    if (kind === "isosceles") return [1, 2, 2];
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

  function fitViewBox(svg, pts, pad) {
    pad = pad || 36;
    if (!pts.length) return;
    var xs = pts.map(function (p) { return p.x; });
    var ys = pts.map(function (p) { return p.y; });
    var minX = Math.min.apply(null, xs) - pad;
    var maxX = Math.max.apply(null, xs) + pad;
    var minY = Math.min.apply(null, ys) - pad;
    var maxY = Math.max.apply(null, ys) + pad;
    var w = Math.max(maxX - minX, 200);
    var h = Math.max(maxY - minY, 180);
    svg.setAttribute("viewBox", minX + " " + minY + " " + w + " " + h);
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
    var kind = triangleKind(verts);
    var viewPts = verts.slice();
    var c = triCenter(verts);

    drawTriOutline(svg, verts);
    drawSideEqualityMarks(svg, verts, kind);

    if (kind === "right") drawRightAngleAtVertex(svg, verts);

    if (mode === "altitude") {
      var H = orthocentre(verts);
      if (H) viewPts.push(H);
      verts.forEach(function (v, i) {
        var B = verts[(i + 1) % 3];
        var C = verts[(i + 2) % 3];
        var F = foot(v, B, C);
        var end = H || F;
        var tip = extendThrough(v, end, H ? 18 : 0);
        svg.appendChild(seg(v, tip, ACCENT));
        svg.appendChild(dot(F, MUTED, 3.5));
        svg.appendChild(rightAngle(F, v, B, 10));
      });
      if (H) {
        svg.appendChild(dot(H, "#2dd4bf", 6));
        svg.appendChild(labelAway(H, c, "H", "#2dd4bf", 22));
      }
      setPlacement("altitude", kind, H, verts);
    }

    if (mode === "median") {
      var G = centroid(verts);
      viewPts.push(G);
      verts.forEach(function (v, i) {
        var opp = [(i + 1) % 3, (i + 2) % 3];
        var p1 = verts[opp[0]];
        var p2 = verts[opp[1]];
        var M = mid(p1, p2);
        var tickLevel = SIDE_TICKS[i];
        svg.appendChild(seg(v, M, ACCENT));
        svg.appendChild(dot(M, MUTED, 3.5));
        svg.appendChild(medianHalfMarks(p1, M, p2, tickLevel));
        if (i === 0) svg.appendChild(labelAway(M, c, "D", MUTED, 16));
      });
      svg.appendChild(dot(G, MARK, 6));
      svg.appendChild(labelAway(G, c, "G", MARK, 22));
      setPlacement("median", kind, G, verts);
    }

    if (mode === "bisector") {
      var I = incentre(verts);
      viewPts.push(I);
      var arcPlan = angleArcPlan(kind);
      verts.forEach(function (v, i) {
        var B = verts[(i + 1) % 3];
        var C = verts[(i + 2) % 3];
        svg.appendChild(seg(v, I, "#a78bfa"));
        svg.appendChild(outwardArcs(v, B, I, arcPlan[i], 16));
        svg.appendChild(outwardArcs(v, I, C, arcPlan[i], 16));
      });
      svg.appendChild(dot(I, "#a78bfa", 6));
      svg.appendChild(labelAway(I, c, "I", "#a78bfa", 22));
      setPlacement("bisector", kind, I, verts);
    }

    if (mode === "perp") {
      var O = circumcentre(verts);
      if (O) viewPts.push(O);
      [[0, 1], [1, 2], [2, 0]].forEach(function (pair, idx) {
        var p1 = verts[pair[0]];
        var p2 = verts[pair[1]];
        var M = mid(p1, p2);
        var n = perp(unit(p1, p2));
        var toO = O ? { x: O.x - M.x, y: O.y - M.y } : n;
        var dir = (toO.x * n.x + toO.y * n.y) >= 0 ? n : { x: -n.x, y: -n.y };
        var far = O ? extendThrough(M, O, 28) : { x: M.x + dir.x * 80, y: M.y + dir.y * 80 };
        var near = { x: M.x - dir.x * 22, y: M.y - dir.y * 22 };
        svg.appendChild(seg(near, far, "#f87171"));
        svg.appendChild(dot(M, MUTED, 3.5));
        svg.appendChild(rightAngle(M, p1, p2, 10));
        svg.appendChild(medianHalfMarks(p1, M, p2, SIDE_TICKS[idx]));
      });
      if (O) {
        svg.appendChild(dot(O, "#f87171", 6));
        svg.appendChild(labelAway(O, c, "O", "#f87171", 22));
      }
      setPlacement("perp", kind, O, verts);
    }

    verts.forEach(function (v, i) {
      var h = E("circle", { cx: v.x, cy: v.y, r: 16, fill: "transparent", "data-i": i });
      h.style.cursor = "grab";
      svg.appendChild(h);
    });

    fitViewBox(svg, viewPts, kind === "obtuse" ? 48 : 32);

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

  function triPoints(x0, y0, w, h) {
    return [{ x: x0, y: y0 + h }, { x: x0 + w, y: y0 + h }, { x: x0 + w / 2, y: y0 }];
  }

  function angleArcAt(V, P, Q, r, col) {
    var a1 = Math.atan2(P.y - V.y, P.x - V.x);
    var a2 = Math.atan2(Q.y - V.y, Q.x - V.x);
    return E("path", {
      d: "M " + (V.x + r * Math.cos(a1)) + " " + (V.y + r * Math.sin(a1)) +
        " A " + r + " " + r + " 0 0 1 " + (V.x + r * Math.cos(a2)) + " " + (V.y + r * Math.sin(a2)),
      fill: "none", stroke: col || MARK, "stroke-width": 2,
    });
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

  function renderCong() {
    var svg = document.getElementById("cong-svg");
    clr(svg);
    var A = triPoints(40, 40, 120, 100);
    var D = triPoints(280, 40, 120, 100);
    if (congMode === "RHS") {
      A = [{ x: 50, y: 200 }, { x: 170, y: 200 }, { x: 50, y: 80 }];
      D = [{ x: 290, y: 200 }, { x: 410, y: 200 }, { x: 290, y: 80 }];
    }
    drawTri(svg, A, ["A", "B", "C"]);
    drawTri(svg, D, ["D", "E", "F"]);
    if (congMode === "SSS") {
      [[0, 1], [1, 2], [2, 0]].forEach(function (s, i) {
        svg.appendChild(sideHashes(A[s[0]], A[s[1]], i + 1, TICK));
        svg.appendChild(sideHashes(D[s[0]], D[s[1]], i + 1, TICK));
      });
    } else if (congMode === "SAS") {
      svg.appendChild(sideHashes(A[0], A[1], 1, TICK));
      svg.appendChild(sideHashes(A[1], A[2], 2, TICK));
      svg.appendChild(sideHashes(D[0], D[1], 1, TICK));
      svg.appendChild(sideHashes(D[1], D[2], 2, TICK));
      svg.appendChild(angleArcAt(A[1], A[0], A[2], 24, MARK));
      svg.appendChild(angleArcAt(D[1], D[0], D[2], 24, MARK));
    } else if (congMode === "ASA") {
      svg.appendChild(sideHashes(A[1], A[2], 1, TICK));
      svg.appendChild(sideHashes(D[1], D[2], 1, TICK));
      svg.appendChild(outwardArcs(A[1], A[0], A[2], 1, 22));
      svg.appendChild(outwardArcs(A[2], A[1], A[0], 1, 22));
      svg.appendChild(outwardArcs(D[1], D[0], D[2], 1, 22));
      svg.appendChild(outwardArcs(D[2], D[1], D[0], 1, 22));
    } else if (congMode === "AAS") {
      svg.appendChild(sideHashes(A[0], A[1], 1, TICK));
      svg.appendChild(sideHashes(D[0], D[1], 1, TICK));
      svg.appendChild(outwardArcs(A[0], A[1], A[2], 1, 22));
      svg.appendChild(outwardArcs(A[1], A[0], A[2], 1, 22));
      svg.appendChild(outwardArcs(D[0], D[1], D[2], 1, 22));
      svg.appendChild(outwardArcs(D[1], D[0], D[2], 1, 22));
    } else if (congMode === "RHS") {
      svg.appendChild(rightAngle(A[0], A[1], A[2], 14));
      svg.appendChild(rightAngle(D[0], D[1], D[2], 14));
      svg.appendChild(sideHashes(A[1], A[2], 1, TICK));
      svg.appendChild(sideHashes(D[1], D[2], 1, TICK));
      svg.appendChild(sideHashes(A[0], A[2], 2, TICK));
      svg.appendChild(sideHashes(D[0], D[2], 2, TICK));
    }
    renderMixed(document.getElementById("cong-caption"), CONG.find(function (c) { return c.id === congMode; }).cap);
  }

  function renderAngles() {
    var svg = document.getElementById("ang-svg");
    clr(svg);
    var y1 = 80, y2 = 220;
    svg.appendChild(seg({ x: 40, y: y1 }, { x: 480, y: y1 }, INK));
    svg.appendChild(seg({ x: 40, y: y2 }, { x: 480, y: y2 }, INK));
    var T1 = { x: 120, y: 20 }, T2 = { x: 400, y: 280 };
    svg.appendChild(seg(T1, T2, ACCENT));
    var pts = [
      { x: 170, y: y1, id: "1" }, { x: 320, y: y1, id: "2" },
      { x: 170, y: y2, id: "3" }, { x: 320, y: y2, id: "4" },
      { x: 230, y: 130, id: "5" }, { x: 260, y: 170, id: "6" },
    ];
    var pairs = { corr: [[0, 2], [1, 3]], alt: [[0, 5], [2, 4]], int: [[1, 4], [3, 5]] };
    var hi = pairs[angMode] || pairs.corr;
    var hiSet = {};
    hi.forEach(function (p) { hiSet[p[0]] = hiSet[p[1]] = true; });
    pts.forEach(function (p, i) {
      svg.appendChild(E("circle", {
        cx: p.x, cy: p.y, r: 16,
        fill: hiSet[i] ? "rgba(251,191,36,.35)" : "transparent",
        stroke: hiSet[i] ? MARK : "none", "stroke-width": 2,
      }));
      var tEl = E("text", {
        x: p.x, y: p.y + 5, fill: hiSet[i] ? MARK : MUTED,
        "font-size": 14, "font-weight": 700, "text-anchor": "middle",
      });
      tEl.textContent = p.id;
      svg.appendChild(tEl);
    });
    renderMixed(document.getElementById("ang-caption"), ANG.find(function (a) { return a.id === angMode; }).cap);
  }

  function renderSim() {
    var svg = document.getElementById("sim-svg");
    clr(svg);
    var k = simK;
    var A = triPoints(30, 50, 100, 90);
    var D = triPoints(260, 50 + 45 * (1 - k), 100 * k, 90 * k);
    drawTri(svg, A, ["A", "B", "C"]);
    drawTri(svg, D, ["D", "E", "F"]);
    if (simMode === "AAA") {
      [A, D].forEach(function (t) {
        var plan = [1, 2, 3];
        [0, 1, 2].forEach(function (i) {
          var prev = t[(i + 2) % 3];
          var cur = t[i];
          var next = t[(i + 1) % 3];
          svg.appendChild(outwardArcs(cur, prev, next, plan[i], 14));
        });
      });
    } else if (simMode === "3sides") {
      [[0, 1], [1, 2], [2, 0]].forEach(function (s, i) {
        svg.appendChild(sideHashes(A[s[0]], A[s[1]], i + 1, TICK));
        svg.appendChild(sideHashes(D[s[0]], D[s[1]], i + 1, TICK));
      });
    } else {
      svg.appendChild(sideHashes(A[0], A[1], 1, TICK));
      svg.appendChild(sideHashes(A[1], A[2], 2, TICK));
      svg.appendChild(sideHashes(D[0], D[1], 1, TICK));
      svg.appendChild(sideHashes(D[1], D[2], 2, TICK));
      svg.appendChild(outwardArcs(A[1], A[0], A[2], 1, 22));
      svg.appendChild(outwardArcs(D[1], D[0], D[2], 1, 22));
    }
    document.getElementById("sim-k-val").textContent = k.toFixed(1);
    renderMixed(document.getElementById("sim-caption"), SIM.find(function (s) { return s.id === simMode; }).cap);
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
    if (id === "cong") renderCong();
    if (id === "angles") renderAngles();
    if (id === "sim") renderSim();
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
    bindBtns("cong-mode-btns", CONG, congMode, function (id) { congMode = id; renderCong(); });
    bindBtns("ang-mode-btns", ANG, angMode, function (id) { angMode = id; renderAngles(); });
    bindBtns("sim-mode-btns", SIM, simMode, function (id) { simMode = id; renderSim(); });

    var svg = document.getElementById("tri-svg");
    svg.addEventListener("pointerdown", function (e) {
      if (e.target.dataset.i != null) {
        drag = +e.target.dataset.i;
        e.target.setPointerCapture(e.pointerId);
      }
    });
    svg.addEventListener("pointermove", function (e) {
      if (drag == null) return;
      var p = pt(e, svg);
      verts[drag].x = p.x;
      verts[drag].y = p.y;
      activePreset = "";
      renderLines();
    });
    svg.addEventListener("pointerup", function () { drag = null; });
    svg.addEventListener("pointercancel", function () { drag = null; });

    document.getElementById("sim-k").addEventListener("input", function (e) {
      simK = +e.target.value;
      renderSim();
    });

    showLab("lines");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
