(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var ORIGIN = { x: 250, y: 250 };
  var SCALE = 22;
  var A = { x: 0, y: 2 };
  var B = { x: 4, y: 5 };
  var drag = null;
  var svg;

  function E(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    return el;
  }
  function toPx(p) { return { x: ORIGIN.x + p.x * SCALE, y: ORIGIN.y - p.y * SCALE }; }
  function fromPx(px) {
    return {
      x: Math.round((px.x - ORIGIN.x) / SCALE),
      y: Math.round((ORIGIN.y - px.y) / SCALE),
    };
  }
  function fmt(n) { return Math.round(n * 100) / 100; }

  function renderKatex(el) {
    if (window.renderMathInElement && el) {
      window.renderMathInElement(el, {
        delimiters: [{ left: "\\(", right: "\\)", display: false }, { left: "\\[", right: "\\]", display: true }],
      });
    }
  }

  function render() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    for (var i = -10; i <= 10; i++) {
      var gx = ORIGIN.x + i * SCALE;
      var gy = ORIGIN.y + i * SCALE;
      svg.appendChild(E("line", { x1: gx, y1: 20, x2: gx, y2: 480, stroke: i === 0 ? "#64748b" : "#1e293b", "stroke-width": i === 0 ? 1.5 : 0.5 }));
      svg.appendChild(E("line", { x1: 20, y1: gy, x2: 480, y2: gy, stroke: i === 0 ? "#64748b" : "#1e293b", "stroke-width": i === 0 ? 1.5 : 0.5 }));
    }
    svg.appendChild(E("text", { x: 462, y: ORIGIN.y - 6, fill: "#94a3b8", "font-size": 12 })).textContent = "x";
    svg.appendChild(E("text", { x: ORIGIN.x + 6, y: 28, fill: "#94a3b8", "font-size": 12 })).textContent = "y";

    var pa = toPx(A), pb = toPx(B);
    svg.appendChild(E("line", { x1: pa.x, y1: pa.y, x2: pb.x, y2: pb.y, stroke: "#38bdf8", "stroke-width": 3 }));

    var dx = B.x - A.x, dy = B.y - A.y;
    if (Math.abs(dx) > 0.01) {
      var m = dy / dx, c = A.y - m * A.x;
      var x1 = -10, x2 = 10;
      var p1 = toPx({ x: x1, y: m * x1 + c });
      var p2 = toPx({ x: x2, y: m * x2 + c });
      svg.appendChild(E("line", { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, stroke: "#38bdf8", "stroke-width": 1, "stroke-dasharray": "6 4", opacity: 0.5 }));
    }

    var mid = toPx({ x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 });
    svg.appendChild(E("circle", { cx: mid.x, cy: mid.y, r: 5, fill: "#a78bfa" }));

    [[pa, "#fbbf24", "A", 0], [pb, "#2dd4bf", "B", 1]].forEach(function (item) {
      svg.appendChild(E("circle", { cx: item[0].x, cy: item[0].y, r: 9, fill: item[1], stroke: "#0f172a", "stroke-width": 2 }));
      svg.appendChild(E("circle", { cx: item[0].x, cy: item[0].y, r: 18, fill: "transparent", "data-p": item[3] }));
      var t = E("text", { x: item[0].x + 12, y: item[0].y - 8, fill: item[1], "font-size": 14, "font-weight": 700 });
      t.textContent = item[2];
      svg.appendChild(t);
    });

    var mVal = Math.abs(dx) < 0.01 ? "∞" : fmt(dy / dx);
    var dist = fmt(Math.hypot(dx, dy));
    document.getElementById("coord-a").textContent = "(" + A.x + ", " + A.y + ")";
    document.getElementById("coord-b").textContent = "(" + B.x + ", " + B.y + ")";
    document.getElementById("coord-m").textContent = mVal;
    document.getElementById("coord-d").textContent = dist;

    var eq = document.getElementById("coord-eq");
    if (Math.abs(dx) < 0.01) eq.textContent = "x = " + A.x;
    else {
      var m = dy / dx, c = A.y - m * A.x;
      var cs = c >= 0 ? "+ " + fmt(c) : "− " + fmt(Math.abs(c));
      eq.textContent = "y = " + fmt(m) + "x " + cs;
    }
    document.getElementById("coord-mid").textContent =
      "Midpoint M = (" + fmt((A.x + B.x) / 2) + ", " + fmt((A.y + B.y) / 2) + ")";
    renderKatex(document.getElementById("panel-tools"));
  }

  function pt(e) {
    var r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal;
    return { x: (e.clientX - r.left) * (vb.width / r.width), y: (e.clientY - r.top) * (vb.height / r.height) };
  }

  function init() {
    svg = document.getElementById("coord-svg");
    svg.addEventListener("pointerdown", function (e) {
      if (e.target.dataset.p != null) { drag = +e.target.dataset.p; e.target.setPointerCapture(e.pointerId); }
    });
    svg.addEventListener("pointermove", function (e) {
      if (drag == null) return;
      var p = fromPx(pt(e));
      p.x = Math.max(-10, Math.min(10, p.x));
      p.y = Math.max(-10, Math.min(10, p.y));
      if (drag === 0) A = p; else B = p;
      render();
    });
    svg.addEventListener("pointerup", function () { drag = null; });
    svg.addEventListener("pointercancel", function () { drag = null; });

    document.getElementById("coord-setup").addEventListener("click", function () {
      A = { x: 0, y: 2 }; B = { x: 4, y: 6 }; render();
    });
    document.getElementById("coord-check-btn").addEventListener("click", function () {
      var fb = document.getElementById("coord-check-fb");
      var v = String(document.getElementById("coord-check-in").value).trim();
      if (v === "1" || v === "1.0") {
        fb.className = "feedback ok";
        fb.textContent = "Correct — rise 4, run 4 → gradient = 1.";
      } else {
        fb.className = "feedback bad";
        fb.textContent = "Gradient = (6 − 2) ÷ (4 − 0) = 1.";
      }
    });
    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
