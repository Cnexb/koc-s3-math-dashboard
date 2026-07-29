(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var MODES = [
    { id: "median", label: "Medians", cap: "Medians join each vertex to the midpoint of the opposite side." },
    { id: "centroid", label: "Centroid", cap: "Three medians meet at \\(G\\). Along each median, \\(AG:GD = 2:1\\)." },
    { id: "bisector", label: "Angle bisectors", cap: "Angle bisectors meet at the incentre \\(I\\) — centre of the inscribed circle." },
    { id: "altitude", label: "Altitudes", cap: "Altitudes are perpendicular from each vertex to the opposite side (or its extension)." },
    { id: "perp", label: "Perp. bisectors", cap: "Perpendicular bisectors of the sides meet at the circumcentre \\(O\\)." },
  ];

  var verts = [{ x: 120, y: 280 }, { x: 380, y: 280 }, { x: 250, y: 70 }];
  var mode = "centroid";
  var drag = null;
  var svg, caption;

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
  function bisectMeet() {
    var mAB = mid(verts[0], verts[1]), mBC = mid(verts[1], verts[2]);
    var d1 = { x: verts[2].x - mAB.x, y: verts[2].y - mAB.y };
    var d2 = { x: verts[0].x - mBC.x, y: verts[0].y - mBC.y };
    var det = d1.x * d2.y - d1.y * d2.x;
    if (Math.abs(det) < 1e-6) return mid(verts[0], verts[2]);
    var t = ((mBC.x - mAB.x) * d2.y - (mBC.y - mAB.y) * d2.x) / det;
    return { x: mAB.x + t * d1.x, y: mAB.y + t * d1.y };
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

  function render() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var tri = E("polygon", {
      points: verts.map(function (v) { return v.x + "," + v.y; }).join(" "),
      fill: "rgba(56,189,248,.15)", stroke: "#38bdf8", "stroke-width": 2,
    });
    svg.appendChild(tri);

    var names = ["A", "B", "C"];
    var cols = ["#fbbf24", "#34d399", "#f472b6"];
    verts.forEach(function (v, i) {
      svg.appendChild(dot(v, cols[i], 8));
      svg.appendChild(label({ x: v.x + (i === 0 ? -14 : i === 1 ? 10 : 0), y: v.y + (i < 2 ? 22 : -10) }, names[i], cols[i]));
    });

    if (mode === "median" || mode === "centroid") {
      verts.forEach(function (v, i) {
        var opp = [(i + 1) % 3, (i + 2) % 3];
        var m = mid(verts[opp[0]], verts[opp[1]]);
        svg.appendChild(line(v, m, "#94a3b8", "6 4", 2));
        svg.appendChild(dot(m, "#64748b", 4));
      });
      if (mode === "centroid") {
        var ms = [0, 1, 2].map(function (i) {
          var opp = [(i + 1) % 3, (i + 2) % 3];
          return mid(verts[i], mid(verts[opp[0]], verts[opp[1]]));
        });
        var G = { x: (ms[0].x + ms[1].x + ms[2].x) / 3, y: (ms[0].y + ms[1].y + ms[2].y) / 3 };
        svg.appendChild(dot(G, "#fbbf24", 7));
        svg.appendChild(label({ x: G.x + 10, y: G.y - 8 }, "G", "#fbbf24"));
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
      verts.forEach(function (v, i) {
        svg.appendChild(line(v, I, "#a78bfa", "none", 2));
      });
      svg.appendChild(dot(I, "#a78bfa", 7));
      svg.appendChild(label({ x: I.x + 8, y: I.y + 4 }, "I", "#a78bfa"));
    }

    if (mode === "altitude") {
      verts.forEach(function (v, i) {
        var B = verts[(i + 1) % 3], C = verts[(i + 2) % 3];
        var F = foot(v, B, C);
        svg.appendChild(line(v, F, "#2dd4bf", "none", 2));
        svg.appendChild(dot(F, "#64748b", 4));
      });
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

    var m = MODES.find(function (x) { return x.id === mode; });
    caption.textContent = m.cap;
    if (window.renderMathInElement) {
      window.renderMathInElement(caption, {
        delimiters: [{ left: "\\(", right: "\\)", display: false }, { left: "\\[", right: "\\]", display: true }],
      });
    }
  }

  function pt(e) {
    var r = svg.getBoundingClientRect();
    var vb = svg.viewBox.baseVal;
    return {
      x: (e.clientX - r.left) * (vb.width / r.width),
      y: (e.clientY - r.top) * (vb.height / r.height),
    };
  }

  function init() {
    svg = document.getElementById("tri-svg");
    caption = document.getElementById("tri-caption");
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
        render();
      });
      row.appendChild(b);
    });

    svg.addEventListener("pointerdown", function (e) {
      var t = e.target;
      if (t.dataset.i != null) {
        drag = +t.dataset.i;
        t.setPointerCapture(e.pointerId);
      }
    });
    svg.addEventListener("pointermove", function (e) {
      if (drag == null) return;
      var p = pt(e);
      verts[drag].x = Math.max(40, Math.min(460, p.x));
      verts[drag].y = Math.max(40, Math.min(310, p.y));
      render();
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
        fb.textContent = "The part from G to the midpoint is half of AG → GD = 5 cm.";
      }
    });
    document.getElementById("tri-check-reset").addEventListener("click", function () {
      document.getElementById("tri-check-in").value = "";
      var fb = document.getElementById("tri-check-fb");
      fb.className = "feedback";
      fb.textContent = "Use the 2:1 ratio from vertex to midpoint.";
    });

    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
