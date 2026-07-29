(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var SW = 2.5;
  var INK = "#e2e8f0";
  var MUTED = "#64748b";
  var ACCENT = "#38bdf8";
  var TICK = "#f87171";
  var MARK = "#fbbf24";

  var LABS = [
    { id: "lines", label: "Lines & centres" },
    { id: "cong", label: "Congruence" },
    { id: "angles", label: "Angle pairs" },
    { id: "sim", label: "Similarity" },
  ];

  var MODES = [
    { id: "altitude", label: "Altitude → H", cap: "An **altitude** is perpendicular from a vertex to the opposite side (or its extension). Three altitudes meet at the **orthocentre** \\(H\\).", placement: "Orthocentre \\(H\\) may lie inside, on, or outside (acute / right / obtuse)." },
    { id: "median", label: "Median → G", cap: "A **median** joins a vertex to the **mid-point** of the opposite side (equal tick marks on the two halves). Three medians meet at the **centroid** \\(G\\).", placement: "Centroid \\(G\\) **must** lie inside the triangle." },
    { id: "centroid", label: "Centroid 2:1", cap: "The centroid divides each median in ratio \\(AG:GD = 2:1\\) from vertex to mid-point.", placement: "Centroid \\(G\\) **must** lie inside the triangle." },
    { id: "bisector", label: "Angle bisector → I", cap: "An **angle bisector** splits an angle into two equal parts (equal arc marks). Three meet at the **in-centre** \\(I\\).", placement: "In-centre \\(I\\) **must** lie inside the triangle." },
    { id: "perp", label: "Perp. bisector → O", cap: "A **perpendicular bisector** is perpendicular to a side at its mid-point (right-angle mark). Three meet at the **circumcentre** \\(O\\).", placement: "Circumcentre \\(O\\) may lie inside, on, or outside (acute / right / obtuse)." },
  ];

  var PRESETS = {
    acute: [{ x: 120, y: 280 }, { x: 380, y: 280 }, { x: 250, y: 70 }],
    right: [{ x: 100, y: 280 }, { x: 360, y: 280 }, { x: 100, y: 80 }],
    obtuse: [{ x: 80, y: 260 }, { x: 420, y: 260 }, { x: 200, y: 300 }],
    isosceles: [{ x: 150, y: 280 }, { x: 350, y: 280 }, { x: 250, y: 60 }],
    equilateral: [{ x: 130, y: 280 }, { x: 370, y: 280 }, { x: 250, y: 43 }],
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
    { id: "3sides", cap: "**Three sides proportional** — \\(\\dfrac{AB}{DE}=\\dfrac{BC}{EF}=\\dfrac{CA}{FD}=k\\)." },
    { id: "2side", cap: "**Two sides proportional** with **equal included angle** ⇒ similar." },
  ];

  var verts = PRESETS.acute.map(function (v) { return { x: v.x, y: v.y }; });
  var mode = "altitude";
  var congMode = "SSS";
  var angMode = "corr";
  var simMode = "AAA";
  var simK = 1;
  var drag = null;
  var mcPick = null;

  function E(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    return el;
  }
  function clr(g) { while (g.firstChild) g.removeChild(g.firstChild); }
  function mid(p, q) { return { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 }; }
  function lerp(p, q, t) { return { x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t }; }
  function seg(p, q, col, w) {
    return E("line", { x1: p.x, y1: p.y, x2: q.x, y2: q.y, stroke: col || INK, "stroke-width": w || SW, "stroke-linecap": "round" });
  }
  function dot(p, col, r) {
    return E("circle", { cx: p.x, cy: p.y, r: r || 5, fill: col });
  }
  function txt(p, s, col, off) {
    var t = E("text", { x: p.x + (off ? off.x : 0), y: p.y + (off ? off.y : 0), fill: col || INK, "font-size": 15, "font-weight": 700 });
    t.textContent = s;
    return t;
  }
  function unit(p, q) {
    var d = Math.hypot(q.x - p.x, q.y - p.y) || 1;
    return { x: (q.x - p.x) / d, y: (q.y - p.y) / d };
  }
  function perp(u) { return { x: -u.y, y: u.x }; }

  function hashMarks(p, q, t, count, col, len) {
    var g = E("g", {});
    var u = unit(p, q), n = perp(u);
    var c = lerp(p, q, t);
    len = len || 9;
    for (var i = 0; i < count; i++) {
      var off = (i - (count - 1) / 2) * 4;
      var a = { x: c.x + u.x * off - n.x * len / 2, y: c.y + u.y * off - n.y * len / 2 };
      var b = { x: c.x + u.x * off + n.x * len / 2, y: c.y + u.y * off + n.y * len / 2 };
      g.appendChild(seg(a, b, col || TICK, 2));
    }
    return g;
  }

  function sideHashes(p, q, count, col) {
    return hashMarks(p, q, 0.5, count, col, 11);
  }

  function equalHalfMarks(B, D, C) {
    var g = E("g", {});
    g.appendChild(hashMarks(B, D, 0.5, 1, TICK, 8));
    g.appendChild(hashMarks(D, C, 0.5, 1, TICK, 8));
    return g;
  }

  function rightAngle(V, P, Q, size) {
    size = size || 14;
    var u1 = unit(V, P), u2 = unit(V, Q);
    var a = { x: V.x + u1.x * size, y: V.y + u1.y * size };
    var b = { x: V.x + u1.x * size + u2.x * size, y: V.y + u1.y * size + u2.y * size };
    var c = { x: V.x + u2.x * size, y: V.y + u2.y * size };
    var g = E("g", {});
    g.appendChild(E("polyline", { points: [a.x, a.y, b.x, b.y, c.x, c.y].join(" "), fill: "none", stroke: MARK, "stroke-width": 2 }));
    return g;
  }

  function angleArcAt(V, P, Q, r, col, dash) {
    var a1 = Math.atan2(P.y - V.y, P.x - V.x);
    var a2 = Math.atan2(Q.y - V.y, Q.x - V.x);
    var g = E("g", {});
    var path = E("path", {
      d: "M " + (V.x + r * Math.cos(a1)) + " " + (V.y + r * Math.sin(a1)) +
        " A " + r + " " + r + " 0 0 1 " + (V.x + r * Math.cos(a2)) + " " + (V.y + r * Math.sin(a2)),
      fill: "none", stroke: col || MARK, "stroke-width": 2,
    });
    if (dash) path.setAttribute("stroke-dasharray", dash);
    g.appendChild(path);
    return g;
  }

  function foot(A, B, C) {
    var dx = C.x - B.x, dy = C.y - B.y;
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
  function incentre(v) {
    var a = Math.hypot(v[1].x - v[2].x, v[1].y - v[2].y);
    var b = Math.hypot(v[0].x - v[2].x, v[0].y - v[2].y);
    var c = Math.hypot(v[0].x - v[1].x, v[0].y - v[1].y);
    var p = a + b + c;
    return { x: (a * v[0].x + b * v[1].x + c * v[2].x) / p, y: (a * v[0].y + b * v[1].y + c * v[2].y) / p };
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
    var mAB = mid(v[0], v[1]), mBC = mid(v[1], v[2]);
    return intersectLines(mAB, v[2], mBC, v[0]) || mid(v[0], v[2]);
  }
  function angleAt(v, i) {
    var prev = v[(i + 2) % 3], cur = v[i], next = v[(i + 1) % 3];
    var u = { x: prev.x - cur.x, y: prev.y - cur.y };
    var w = { x: next.x - cur.x, y: next.y - cur.y };
    var dot = u.x * w.x + u.y * w.y;
    var m = Math.hypot(u.x, u.y) * Math.hypot(w.x, w.y);
    return Math.acos(Math.max(-1, Math.min(1, dot / m))) * 180 / Math.PI;
  }
  function triangleKind(v) {
    var angles = [0, 1, 2].map(function (i) { return angleAt(v, i); });
    var max = Math.max.apply(null, angles);
    if (Math.abs(max - 90) < 4) return "right";
    if (max > 90) return "obtuse";
    var sides = [0, 1, 2].map(function (i) {
      var j = (i + 1) % 3;
      return Math.hypot(v[j].x - v[i].x, v[j].y - v[i].y);
    }).sort(function (a, b) { return a - b; });
    if (Math.abs(sides[0] - sides[1]) < 6 && Math.abs(sides[1] - sides[2]) < 6) return "equilateral";
    if (Math.abs(sides[0] - sides[1]) < 6 || Math.abs(sides[1] - sides[2]) < 6) return "isosceles";
    return "acute";
  }
  function pointInTri(p, v) {
    var signs = [0, 1, 2].map(function (i) {
      var j = (i + 1) % 3, k = (i + 2) % 3;
      return (p.x - v[j].x) * (v[k].y - v[j].y) - (v[k].x - v[j].x) * (p.y - v[j].y);
    });
    return !(signs.some(function (s) { return s < 0; }) && signs.some(function (s) { return s > 0; }));
  }

  function renderKatex(el) {
    if (el && window.renderMathInElement) {
      window.renderMathInElement(el, {
        delimiters: [{ left: "\\(", right: "\\)", display: false }, { left: "\\[", right: "\\]", display: true }],
      });
    }
  }
  function renderMixed(el, text) {
    if (!el) return;
    el.textContent = "";
    text.split(/(\*\*[^*]+\*\*)/).forEach(function (part) {
      if (!part) return;
      var span = document.createElement("span");
      if (part.indexOf("**") === 0) {
        var s = document.createElement("strong");
        s.textContent = part.slice(2, -2);
        span.appendChild(s);
      } else span.textContent = part;
      el.appendChild(span);
    });
    renderKatex(el);
  }

  function drawTri(g, v, labels, fill) {
    g.appendChild(E("polygon", {
      points: v.map(function (p) { return p.x + "," + p.y; }).join(" "),
      fill: fill || "rgba(56,189,248,.12)", stroke: INK, "stroke-width": SW,
    }));
    var offs = [{ x: -12, y: 20 }, { x: 10, y: 20 }, { x: -6, y: -12 }];
    labels.forEach(function (L, i) {
      g.appendChild(dot(v[i], "#94a3b8", 6));
      g.appendChild(txt(v[i], L, INK, offs[i]));
    });
  }

  function renderLines() {
    var svg = document.getElementById("tri-svg");
    clr(svg);
    drawTri(svg, verts, ["A", "B", "C"]);

    if (mode === "altitude") {
      verts.forEach(function (v, i) {
        var B = verts[(i + 1) % 3], C = verts[(i + 2) % 3];
        var F = foot(v, B, C);
        svg.appendChild(seg(v, F, ACCENT));
        svg.appendChild(dot(F, MUTED, 4));
        var onSide = verts[(i + 1) % 3];
        svg.appendChild(rightAngle(F, v, onSide, 12));
        if (i === 0) {
          var H = orthocentre(verts);
          if (H) {
            svg.appendChild(dot(H, "#2dd4bf", 7));
            svg.appendChild(txt(H, "H", "#2dd4bf", { x: 10, y: -6 }));
          }
        }
      });
    }

    if (mode === "median" || mode === "centroid") {
      verts.forEach(function (v, i) {
        var opp = [(i + 1) % 3, (i + 2) % 3];
        var D = mid(verts[opp[0]], verts[opp[1]]);
        svg.appendChild(seg(v, D, ACCENT));
        svg.appendChild(dot(D, MUTED, 4));
        svg.appendChild(equalHalfMarks(verts[opp[0]], D, verts[opp[1]]));
        if (i === 0) svg.appendChild(txt(D, "D", MUTED, { x: 8, y: 16 }));
      });
      var G = centroid(verts);
      svg.appendChild(dot(G, MARK, 7));
      svg.appendChild(txt(G, "G", MARK, { x: 10, y: -8 }));
      if (mode === "centroid") {
        var D = mid(verts[1], verts[2]);
        var split = lerp(verts[0], D, 2 / 3);
        svg.appendChild(hashMarks(verts[0], D, 2 / 3, 2, MARK, 8));
        svg.appendChild(hashMarks(verts[0], D, 5 / 6, 1, MUTED, 8));
      }
    }

    if (mode === "bisector") {
      var I = incentre(verts);
      verts.forEach(function (v, i) {
        var B = verts[(i + 1) % 3], C = verts[(i + 2) % 3];
        svg.appendChild(seg(v, I, "#a78bfa"));
        svg.appendChild(angleArcAt(v, B, I, 22, MARK));
        svg.appendChild(angleArcAt(v, I, C, 22, MARK));
      });
      svg.appendChild(dot(I, "#a78bfa", 7));
      svg.appendChild(txt(I, "I", "#a78bfa", { x: 8, y: 4 }));
    }

    if (mode === "perp") {
      var O = circumcentre(verts);
      [[0, 1], [1, 2], [2, 0]].forEach(function (pair) {
        var M = mid(verts[pair[0]], verts[pair[1]]);
        svg.appendChild(seg(M, O, "#f87171"));
        svg.appendChild(dot(M, MUTED, 4));
        svg.appendChild(rightAngle(M, verts[pair[0]], O, 11));
      });
      svg.appendChild(dot(O, "#f87171", 7));
      svg.appendChild(txt(O, "O", "#f87171", { x: 8, y: -6 }));
    }

    verts.forEach(function (v, i) {
      var h = E("circle", { cx: v.x, cy: v.y, r: 16, fill: "transparent", "data-i": i });
      h.style.cursor = "grab";
      svg.appendChild(h);
    });

    var kind = triangleKind(verts);
    var badges = document.getElementById("tri-type-badges");
    badges.innerHTML = "";
    ["Acute", "Right", "Obtuse", "Isosceles", "Equilateral"].forEach(function (name) {
      var b = document.createElement("span");
      b.className = "badge" + (kind === name.toLowerCase() ? " on" : "");
      b.textContent = name;
      badges.appendChild(b);
    });

    var m = MODES.find(function (x) { return x.id === mode; });
    renderMixed(document.getElementById("tri-caption"), m.cap);
    var place = document.getElementById("tri-placement");
    renderMixed(place, m.placement);
    var extra = "";
    if (kind === "equilateral") extra = " Equilateral △: all four centres coincide.";
    else if (kind === "isosceles") extra = " Isosceles △: all four centres lie on the axis of symmetry.";
    if (mode === "altitude") {
      var H = orthocentre(verts);
      if (H) extra += " Orthocentre H is " + (pointInTri(H, verts) ? "inside" : "outside") + ".";
    }
    if (mode === "perp") {
      var O = circumcentre(verts);
      if (O) extra += " Circumcentre O is " + (pointInTri(O, verts) ? "inside" : "outside") + ".";
    }
    if (extra) { place.textContent += extra; renderKatex(place); }
  }

  function triPoints(x0, y0, w, h) {
    return [{ x: x0, y: y0 + h }, { x: x0 + w, y: y0 + h }, { x: x0 + w / 2, y: y0 }];
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

    var sidesA = [[0, 1], [1, 2], [2, 0]];
    var sidesD = [[0, 1], [1, 2], [2, 0]];

    if (congMode === "SSS") {
      sidesA.forEach(function (s, i) {
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
      svg.appendChild(angleArcAt(A[1], A[0], A[2], 22, MARK));
      svg.appendChild(angleArcAt(A[2], A[1], A[0], 22, MARK));
      svg.appendChild(angleArcAt(D[1], D[0], D[2], 22, MARK));
      svg.appendChild(angleArcAt(D[2], D[1], D[0], 22, MARK));
    } else if (congMode === "AAS") {
      svg.appendChild(sideHashes(A[0], A[1], 1, TICK));
      svg.appendChild(sideHashes(D[0], D[1], 1, TICK));
      svg.appendChild(angleArcAt(A[0], A[1], A[2], 22, MARK));
      svg.appendChild(angleArcAt(A[1], A[0], A[2], 22, MARK));
      svg.appendChild(angleArcAt(D[0], D[1], D[2], 22, MARK));
      svg.appendChild(angleArcAt(D[1], D[0], D[2], 22, MARK));
    } else if (congMode === "RHS") {
      svg.appendChild(rightAngle(A[0], A[1], A[2], 16));
      svg.appendChild(rightAngle(D[0], D[1], D[2], 16));
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
    svg.appendChild(txt({ x: 460, y: y1 - 8 }, "l₁", MUTED));
    svg.appendChild(txt({ x: 460, y: y2 - 8 }, "l₂", MUTED));
    var T1 = { x: 120, y: 20 }, T2 = { x: 400, y: 280 };
    svg.appendChild(seg(T1, T2, ACCENT));

    var pts = [
      { x: 170, y: y1, id: "∠1" }, { x: 320, y: y1, id: "∠2" },
      { x: 170, y: y2, id: "∠3" }, { x: 320, y: y2, id: "∠4" },
      { x: 230, y: 130, id: "∠5" }, { x: 260, y: 170, id: "∠6" },
    ];
    var pairs = {
      corr: [[0, 2], [1, 3]],
      alt: [[0, 5], [2, 4]],
      int: [[1, 4], [3, 5]],
    };
    var hi = pairs[angMode] || pairs.corr;
    var hiSet = {};
    hi.forEach(function (p) { hiSet[p[0]] = hiSet[p[1]] = true; });

    pts.forEach(function (p, i) {
      svg.appendChild(E("circle", { cx: p.x, cy: p.y, r: 18, fill: hiSet[i] ? "rgba(251,191,36,.35)" : "transparent", stroke: hiSet[i] ? MARK : "none", "stroke-width": 2 }));
      svg.appendChild(txt(p, p.id, hiSet[i] ? MARK : MUTED, { x: -10, y: 5 }));
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
        [0, 1, 2].forEach(function (i) {
          var prev = t[(i + 2) % 3], cur = t[i], next = t[(i + 1) % 3];
          svg.appendChild(angleArcAt(cur, prev, next, 20, MARK));
        });
      });
    } else if (simMode === "3sides") {
      [[0, 1], [1, 2], [2, 0]].forEach(function (s, i) {
        var lenA = Math.hypot(A[s[1]].x - A[s[0]].x, A[s[1]].y - A[s[0]].y).toFixed(0);
        var lenD = Math.hypot(D[s[1]].x - D[s[0]].x, D[s[1]].y - D[s[0]].y).toFixed(0);
        var mA = mid(A[s[0]], A[s[1]]);
        var mD = mid(D[s[0]], D[s[1]]);
        svg.appendChild(txt(mA, lenA, ACCENT, { x: -8, y: -8 }));
        svg.appendChild(txt(mD, lenD, ACCENT, { x: -8, y: -8 }));
        svg.appendChild(sideHashes(A[s[0]], A[s[1]], i + 1, TICK));
        svg.appendChild(sideHashes(D[s[0]], D[s[1]], i + 1, TICK));
      });
    } else {
      svg.appendChild(sideHashes(A[0], A[1], 1, TICK));
      svg.appendChild(sideHashes(A[1], A[2], 2, TICK));
      svg.appendChild(sideHashes(D[0], D[1], 1, TICK));
      svg.appendChild(sideHashes(D[1], D[2], 2, TICK));
      svg.appendChild(angleArcAt(A[1], A[0], A[2], 24, MARK));
      svg.appendChild(angleArcAt(D[1], D[0], D[2], 24, MARK));
    }

    document.getElementById("sim-k-val").textContent = k.toFixed(1);
    renderMixed(document.getElementById("sim-caption"), SIM.find(function (s) { return s.id === simMode; }).cap);
  }

  function pt(e, svg) {
    var r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal;
    return { x: (e.clientX - r.left) * (vb.width / r.width), y: (e.clientY - r.top) * (vb.height / r.height) };
  }

  function bindBtns(containerId, items, key, active, onPick) {
    var row = document.getElementById(containerId);
    row.innerHTML = "";
    items.forEach(function (item) {
      var id = item.id || item;
      var b = document.createElement("button");
      b.type = "button";
      b.className = "btn" + ((item.id || item) === active ? " active" : "");
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
    renderKatex(document.getElementById("panel-tools"));
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
      b.className = "btn";
      b.textContent = name.charAt(0).toUpperCase() + name.slice(1);
      b.addEventListener("click", function () {
        verts = PRESETS[name].map(function (v) { return { x: v.x, y: v.y }; });
        renderLines();
      });
      presetRow.appendChild(b);
    });

    bindBtns("tri-mode-btns", MODES, "id", mode, function (id) { mode = id; renderLines(); });
    bindBtns("cong-mode-btns", CONG, "id", congMode, function (id) { congMode = id; renderCong(); });
    bindBtns("ang-mode-btns", ANG, "id", angMode, function (id) { angMode = id; renderAngles(); });
    bindBtns("sim-mode-btns", SIM, "id", simMode, function (id) { simMode = id; renderSim(); });

    var svg = document.getElementById("tri-svg");
    svg.addEventListener("pointerdown", function (e) {
      if (e.target.dataset.i != null) { drag = +e.target.dataset.i; e.target.setPointerCapture(e.pointerId); }
    });
    svg.addEventListener("pointermove", function (e) {
      if (drag == null) return;
      var p = pt(e, svg);
      verts[drag].x = Math.max(40, Math.min(460, p.x));
      verts[drag].y = Math.max(40, Math.min(310, p.y));
      renderLines();
    });
    svg.addEventListener("pointerup", function () { drag = null; });
    svg.addEventListener("pointercancel", function () { drag = null; });

    document.getElementById("sim-k").addEventListener("input", function (e) {
      simK = +e.target.value;
      renderSim();
    });

    document.getElementById("tri-check-btn").addEventListener("click", function () {
      var fb = document.getElementById("tri-check-fb");
      var v = String(document.getElementById("tri-check-in").value).trim().replace(/\s/g, "");
      fb.className = "feedback " + (v === "5" || v === "5cm" ? "ok" : "bad");
      fb.textContent = v === "5" || v === "5cm" ? "Correct — AG : GD = 2 : 1 → GD = 5 cm." : "GD = 5 cm (half of AG).";
    });

    document.getElementById("tri-mc-check").addEventListener("click", function () {
      var fb = document.getElementById("tri-mc-fb");
      fb.className = "feedback ok";
      fb.textContent = "Correct — circumcentre and orthocentre may lie outside; in-centre and centroid always inside.";
    });

    showLab("lines");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
