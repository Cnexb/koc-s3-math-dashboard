(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var MODES = [
    {
      id: "altitude", label: "Altitude → H",
      cap: "An **altitude** is perpendicular from a vertex to the opposite side (or its extension). The three altitudes meet at the **orthocentre** \\(H\\).",
      placement: "Orthocentre \\(H\\) may lie inside, on, or outside the triangle (acute / right / obtuse).",
    },
    {
      id: "median", label: "Median → G",
      cap: "A **median** joins a vertex to the **mid-point** of the opposite side. The three medians meet at the **centroid** \\(G\\).",
      placement: "Centroid \\(G\\) **must** lie inside the triangle.",
    },
    {
      id: "centroid", label: "Centroid ratio",
      cap: "Along each median, the centroid splits \\(AG : GD = 2 : 1\\) (vertex to mid-point).",
      placement: "Centroid \\(G\\) **must** lie inside the triangle.",
    },
    {
      id: "bisector", label: "Angle bisector → I",
      cap: "An **angle bisector** divides an angle into two equal parts. The three angle bisectors meet at the **in-centre** \\(I\\).",
      placement: "In-centre \\(I\\) **must** lie inside the triangle.",
    },
    {
      id: "perp", label: "Perp. bisector → O",
      cap: "A **perpendicular bisector** of a side is perpendicular to the side and passes through its mid-point. The three meet at the **circumcentre** \\(O\\).",
      placement: "Circumcentre \\(O\\) may lie inside, on, or outside the triangle (acute / right / obtuse).",
    },
  ];
  var PRESETS = {
    acute: [{ x: 120, y: 280 }, { x: 380, y: 280 }, { x: 250, y: 70 }],
    right: [{ x: 100, y: 280 }, { x: 360, y: 280 }, { x: 100, y: 80 }],
    obtuse: [{ x: 80, y: 260 }, { x: 420, y: 260 }, { x: 200, y: 300 }],
    isosceles: [{ x: 150, y: 280 }, { x: 350, y: 280 }, { x: 250, y: 60 }],
    equilateral: [{ x: 130, y: 280 }, { x: 370, y: 280 }, { x: 250, y: 43 }],
  };

  var verts = PRESETS.acute.map(function (v) { return { x: v.x, y: v.y }; });
  var mode = "altitude";
  var propMode = "bisect";
  var drag = null;
  var mcPick = null;
  var svg, propSvg, caption, placement, propCap;

  function E(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    return el;
  }
  function mid(p, q) { return { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 }; }
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
  function bisectMeet() {
    var mAB = mid(verts[0], verts[1]), mBC = mid(verts[1], verts[2]);
    return intersectLines(mAB, verts[2], mBC, verts[0]) || mid(verts[0], verts[2]);
  }
  function incentre() {
    var a = Math.hypot(verts[1].x - verts[2].x, verts[1].y - verts[2].y);
    var b = Math.hypot(verts[0].x - verts[2].x, verts[0].y - verts[2].y);
    var c = Math.hypot(verts[0].x - verts[1].x, verts[0].y - verts[1].y);
    var p = a + b + c;
    return {
      x: (a * verts[0].x + b * verts[1].x + c * verts[2].x) / p,
      y: (a * verts[0].y + b * verts[1].y + c * verts[2].y) / p,
    };
  }
  function centroid() {
    var ms = [0, 1, 2].map(function (i) {
      var opp = [(i + 1) % 3, (i + 2) % 3];
      return mid(verts[i], mid(verts[opp[0]], verts[opp[1]]));
    });
    return { x: (ms[0].x + ms[1].x + ms[2].x) / 3, y: (ms[0].y + ms[1].y + ms[2].y) / 3 };
  }
  function orthocentre() {
    var F0 = foot(verts[0], verts[1], verts[2]);
    var F1 = foot(verts[1], verts[0], verts[2]);
    return intersectLines(verts[0], F0, verts[1], F1);
  }
  function angleAt(i) {
    var prev = verts[(i + 3) % 3], cur = verts[i], next = verts[(i + 1) % 3];
    var u = { x: prev.x - cur.x, y: prev.y - cur.y };
    var v = { x: next.x - cur.x, y: next.y - cur.y };
    var dot = u.x * v.x + u.y * v.y;
    var m = Math.hypot(u.x, u.y) * Math.hypot(v.x, v.y);
    return Math.acos(Math.max(-1, Math.min(1, dot / m))) * 180 / Math.PI;
  }
  function triangleKind() {
    var angles = [0, 1, 2].map(angleAt);
    var max = Math.max.apply(null, angles);
    if (Math.abs(max - 90) < 4) return "right";
    if (max > 90) return "obtuse";
    var sides = [
      Math.hypot(verts[1].x - verts[2].x, verts[1].y - verts[2].y),
      Math.hypot(verts[0].x - verts[2].x, verts[0].y - verts[2].y),
      Math.hypot(verts[0].x - verts[1].x, verts[0].y - verts[1].y),
    ].sort(function (a, b) { return a - b; });
    if (Math.abs(sides[0] - sides[1]) < 6 && Math.abs(sides[1] - sides[2]) < 6) return "equilateral";
    if (Math.abs(sides[0] - sides[1]) < 6 || Math.abs(sides[1] - sides[2]) < 6) return "isosceles";
    return "acute";
  }
  function pointInTri(p) {
    var x = p.x, y = p.y;
    var x1 = verts[0].x, y1 = verts[0].y;
    var x2 = verts[1].x, y2 = verts[1].y;
    var x3 = verts[2].x, y3 = verts[2].y;
    var d1 = (x - x2) * (y1 - y2) - (x1 - x2) * (y - y2);
    var d2 = (x - x3) * (y2 - y3) - (x2 - x3) * (y - y3);
    var d3 = (x - x1) * (y3 - y1) - (x3 - x1) * (y - y1);
    var hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
    var hasPos = d1 > 0 || d2 > 0 || d3 > 0;
    return !(hasNeg && hasPos);
  }
  function line(p, q, col, dash, w) {
    return E("line", {
      x1: p.x, y1: p.y, x2: q.x, y2: q.y,
      stroke: col, "stroke-width": w || 2,
      "stroke-dasharray": dash || "none", "stroke-linecap": "round",
    });
  }
  function dot(p, col, r) {
    return E("circle", { cx: p.x, cy: p.y, r: r || 5, fill: col });
  }
  function label(p, text, col) {
    var t = E("text", { x: p.x, y: p.y, fill: col || "#e2e8f0", "font-size": 16, "font-weight": 700 });
    t.textContent = text;
    return t;
  }
  function renderKatex(el) {
    if (!el || !window.renderMathInElement) return;
    window.renderMathInElement(el, {
      delimiters: [{ left: "\\(", right: "\\)", display: false }, { left: "\\[", right: "\\]", display: true }],
    });
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

  function drawTriangle(target) {
    while (target.firstChild) target.removeChild(target.firstChild);
    target.appendChild(E("polygon", {
      points: verts.map(function (v) { return v.x + "," + v.y; }).join(" "),
      fill: "rgba(56,189,248,.15)", stroke: "#38bdf8", "stroke-width": 2,
    }));
    ["A", "B", "C"].forEach(function (name, i) {
      var v = verts[i];
      var cols = ["#fbbf24", "#34d399", "#f472b6"];
      target.appendChild(dot(v, cols[i], 8));
      target.appendChild(label({ x: v.x + (i === 0 ? -14 : i === 1 ? 10 : 0), y: v.y + (i < 2 ? 22 : -10) }, name, cols[i]));
    });
  }

  function renderMain() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    drawTriangle(svg);

    if (mode === "altitude") {
      var feet = [];
      verts.forEach(function (v, i) {
        var B = verts[(i + 1) % 3], C = verts[(i + 2) % 3];
        var F = foot(v, B, C);
        feet.push(F);
        var ext = F.t < 0 || F.t > 1;
        svg.appendChild(line(v, F, "#2dd4bf", ext ? "5 4" : "none", 2));
        svg.appendChild(dot(F, "#64748b", 4));
      });
      var H = orthocentre();
      if (H) {
        svg.appendChild(dot(H, "#2dd4bf", 7));
        svg.appendChild(label({ x: H.x + 10, y: H.y - 6 }, "H", "#2dd4bf"));
      }
    }

    if (mode === "median" || mode === "centroid") {
      verts.forEach(function (v, i) {
        var opp = [(i + 1) % 3, (i + 2) % 3];
        var m = mid(verts[opp[0]], verts[opp[1]]);
        svg.appendChild(line(v, m, "#94a3b8", "6 4", 2));
        svg.appendChild(dot(m, "#64748b", 4));
      });
      var G = centroid();
      svg.appendChild(dot(G, "#fbbf24", 7));
      svg.appendChild(label({ x: G.x + 10, y: G.y - 8 }, "G", "#fbbf24"));
      if (mode === "centroid") {
        var D = mid(verts[1], verts[2]);
        svg.appendChild(line(verts[0], D, "#38bdf8", "none", 3));
        var split = { x: verts[0].x + (2 / 3) * (D.x - verts[0].x), y: verts[0].y + (2 / 3) * (D.y - verts[0].y) };
        svg.appendChild(dot(split, "#fb923c", 5));
        svg.appendChild(label({ x: split.x - 30, y: split.y - 6 }, "2", "#fb923c"));
        svg.appendChild(label({ x: (split.x + D.x) / 2 - 6, y: (split.y + D.y) / 2 + 14 }, "1", "#94a3b8"));
      }
    }

    if (mode === "bisector") {
      var I = incentre();
      verts.forEach(function (v) { svg.appendChild(line(v, I, "#a78bfa", "none", 2)); });
      svg.appendChild(dot(I, "#a78bfa", 7));
      svg.appendChild(label({ x: I.x + 8, y: I.y + 4 }, "I", "#a78bfa"));
    }

    if (mode === "perp") {
      var O = bisectMeet();
      [[0, 1], [1, 2], [2, 0]].forEach(function (pair) {
        var m = mid(verts[pair[0]], verts[pair[1]]);
        svg.appendChild(line(m, O, "#f87171", "4 3", 2));
        svg.appendChild(dot(m, "#64748b", 4));
      });
      svg.appendChild(dot(O, "#f87171", 7));
      svg.appendChild(label({ x: O.x + 8, y: O.y - 6 }, "O", "#f87171"));
    }

    verts.forEach(function (v, i) {
      var h = E("circle", { cx: v.x, cy: v.y, r: 16, fill: "transparent", stroke: "none", "data-i": i });
      h.style.cursor = "grab";
      svg.appendChild(h);
    });

    var kind = triangleKind();
    var badges = document.getElementById("tri-type-badges");
    badges.innerHTML = "";
    ["Acute", "Right", "Obtuse", "Isosceles", "Equilateral"].forEach(function (name) {
      var key = name.toLowerCase();
      var b = document.createElement("span");
      b.className = "badge" + (kind === key ? " on" : "");
      b.textContent = name;
      badges.appendChild(b);
    });

    var m = MODES.find(function (x) { return x.id === mode; });
    renderMixed(caption, m.cap);
    renderMixed(placement, m.placement);

    var H = orthocentre(), G = centroid(), I = incentre(), O = bisectMeet();
    var extra = "";
    if (kind === "equilateral") extra = " Equilateral △: all four centres coincide at the same point.";
    else if (kind === "isosceles") extra = " Isosceles △: all four centres lie on the line of reflectional symmetry.";
    if (mode === "altitude" && H) {
      extra += " Here, orthocentre H is " + (pointInTri(H) ? "inside" : "outside") + " the triangle.";
    }
    if (mode === "perp" && O) {
      extra += " Here, circumcentre O is " + (pointInTri(O) ? "inside" : "outside") + " the triangle.";
    }
    if (extra) {
      placement.textContent += extra;
      renderKatex(placement);
    }
  }

  function renderProp() {
    while (propSvg.firstChild) propSvg.removeChild(propSvg.firstChild);
    var A = { x: 80, y: 200 }, B = { x: 420, y: 200 }, C = { x: 260, y: 50 };
    propSvg.appendChild(E("polygon", {
      points: [A, B, C].map(function (p) { return p.x + "," + p.y; }).join(" "),
      fill: "rgba(56,189,248,.12)", stroke: "#38bdf8", "stroke-width": 2,
    }));
    [[A, "A"], [B, "B"], [C, "C"]].forEach(function (pair) {
      propSvg.appendChild(dot(pair[0], "#fbbf24", 7));
      propSvg.appendChild(label({ x: pair[0].x + (pair[1] === "B" ? 8 : -12), y: pair[0].y + 20 }, pair[1], "#fbbf24"));
    });

    if (propMode === "bisect") {
      var D = { x: 340, y: 200 };
      propSvg.appendChild(line(A, D, "#a78bfa", "none", 2));
      propSvg.appendChild(line(A, C, "#64748b", "6 4", 2));
      propSvg.appendChild(dot(D, "#a78bfa", 5));
      propSvg.appendChild(label({ x: D.x + 8, y: D.y + 16 }, "D", "#a78bfa"));
      propSvg.appendChild(E("path", {
        d: "M " + (A.x + 36) + " " + A.y + " A 36 36 0 0 0 " + (A.x + 36 * Math.cos(0.55)) + " " + (A.y - 36 * Math.sin(0.55)),
        fill: "none", stroke: "#fbbf24", "stroke-width": 2,
      }));
      propSvg.appendChild(E("path", {
        d: "M " + (A.x + 50) + " " + A.y + " A 50 50 0 0 0 " + (A.x + 50 * Math.cos(0.95)) + " " + (A.y - 50 * Math.sin(0.95)),
        fill: "none", stroke: "#fbbf24", "stroke-width": 2,
      }));
      propCap.textContent = "If \\(AD\\) is the angle bisector of \\(\\angle BAC\\), then \\(\\angle BAD = \\angle CAD\\).";
    } else {
      var M = mid(B, C);
      propSvg.appendChild(line(M, { x: M.x, y: 40 }, "#f87171", "none", 2));
      propSvg.appendChild(dot(M, "#64748b", 5));
      propSvg.appendChild(label({ x: M.x + 8, y: M.y + 16 }, "M", "#64748b"));
      var P = { x: M.x, y: 120 };
      propSvg.appendChild(dot(P, "#34d399", 7));
      propSvg.appendChild(label({ x: P.x + 10, y: P.y }, "P", "#34d399"));
      propSvg.appendChild(line(P, B, "#94a3b8", "4 3", 1.5));
      propSvg.appendChild(line(P, C, "#94a3b8", "4 3", 1.5));
      propCap.textContent = "If \\(PM\\) is the perpendicular bisector of \\(BC\\), then \\(PB = PC\\) (equidistant from the end-points).";
    }
    renderKatex(propCap);
  }

  function pt(e) {
    var r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal;
    return {
      x: (e.clientX - r.left) * (vb.width / r.width),
      y: (e.clientY - r.top) * (vb.height / r.height),
    };
  }

  function init() {
    svg = document.getElementById("tri-svg");
    propSvg = document.getElementById("tri-prop-svg");
    caption = document.getElementById("tri-caption");
    placement = document.getElementById("tri-placement");
    propCap = document.getElementById("tri-prop-cap");

    var presetRow = document.getElementById("tri-preset-btns");
    Object.keys(PRESETS).forEach(function (name) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "btn";
      b.textContent = name.charAt(0).toUpperCase() + name.slice(1);
      b.addEventListener("click", function () {
        verts = PRESETS[name].map(function (v) { return { x: v.x, y: v.y }; });
        renderMain();
      });
      presetRow.appendChild(b);
    });

    var row = document.getElementById("tri-mode-btns");
    MODES.forEach(function (m) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "btn" + (m.id === mode ? " active" : "");
      b.textContent = m.label;
      b.addEventListener("click", function () {
        mode = m.id;
        row.querySelectorAll(".btn").forEach(function (x) { x.classList.remove("active"); });
        b.classList.add("active");
        renderMain();
      });
      row.appendChild(b);
    });

    document.querySelectorAll("#tri-prop-btns [data-prop]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        propMode = btn.dataset.prop;
        document.querySelectorAll("#tri-prop-btns .btn").forEach(function (x) { x.classList.remove("active"); });
        btn.classList.add("active");
        renderProp();
      });
    });

    svg.addEventListener("pointerdown", function (e) {
      if (e.target.dataset.i != null) {
        drag = +e.target.dataset.i;
        e.target.setPointerCapture(e.pointerId);
      }
    });
    svg.addEventListener("pointermove", function (e) {
      if (drag == null) return;
      var p = pt(e);
      verts[drag].x = Math.max(40, Math.min(460, p.x));
      verts[drag].y = Math.max(40, Math.min(310, p.y));
      renderMain();
    });
    svg.addEventListener("pointerup", function () { drag = null; });
    svg.addEventListener("pointercancel", function () { drag = null; });

    document.getElementById("tri-check-btn").addEventListener("click", function () {
      var fb = document.getElementById("tri-check-fb");
      var v = String(document.getElementById("tri-check-in").value).trim().replace(/\s/g, "");
      if (v === "5" || v === "5cm") {
        fb.className = "feedback ok";
        fb.textContent = "Correct — AG : GD = 2 : 1, so GD = 10 ÷ 2 = 5 cm.";
      } else {
        fb.className = "feedback bad";
        fb.textContent = "The part from G to the mid-point is half of AG → GD = 5 cm.";
      }
    });
    document.getElementById("tri-check-reset").addEventListener("click", function () {
      document.getElementById("tri-check-in").value = "";
      var fb = document.getElementById("tri-check-fb");
      fb.className = "feedback";
      fb.textContent = "Use the 2:1 ratio from vertex to mid-point.";
    });

    document.querySelectorAll("[data-mc]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        mcPick = btn.dataset.mc;
        document.querySelectorAll("[data-mc]").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
      });
    });
    document.getElementById("tri-mc-check").addEventListener("click", function () {
      var fb = document.getElementById("tri-mc-fb");
      if (mcPick === "C") {
        fb.className = "feedback ok";
        fb.textContent = "Correct — circumcentre and orthocentre can lie outside (obtuse △). In-centre and centroid always lie inside.";
      } else if (mcPick) {
        fb.className = "feedback bad";
        fb.textContent = "Answer: C. Only circumcentre and orthocentre may lie outside.";
      } else {
        fb.className = "feedback bad";
        fb.textContent = "Pick an option first.";
      }
    });

    renderMain();
    renderProp();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
