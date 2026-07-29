(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var PRESETS = {
    square: [{ x: 150, y: 80 }, { x: 350, y: 80 }, { x: 350, y: 260 }, { x: 150, y: 260 }],
    parallelogram: [{ x: 120, y: 100 }, { x: 380, y: 80 }, { x: 400, y: 250 }, { x: 140, y: 270 }],
    trapezium: [{ x: 130, y: 90 }, { x: 370, y: 90 }, { x: 420, y: 260 }, { x: 80, y: 260 }],
    kite: [{ x: 250, y: 60 }, { x: 380, y: 180 }, { x: 250, y: 280 }, { x: 120, y: 180 }],
  };
  var verts = PRESETS.parallelogram.map(function (v) { return { x: v.x, y: v.y }; });
  var drag = null;
  var svg, badges, caption;

  function E(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    return el;
  }
  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function slope(p, q) {
    var dx = q.x - p.x, dy = q.y - p.y;
    if (Math.abs(dx) < 1e-6) return Infinity;
    return dy / dx;
  }
  function parallel(s1, s2) {
    if (s1 === Infinity && s2 === Infinity) return true;
    if (s1 === Infinity || s2 === Infinity) return false;
    return Math.abs(s1 - s2) < 0.08;
  }
  function angleAt(i) {
    var prev = verts[(i + 3) % 4], cur = verts[i], next = verts[(i + 1) % 4];
    var u = { x: prev.x - cur.x, y: prev.y - cur.y };
    var v = { x: next.x - cur.x, y: next.y - cur.y };
    var dot = u.x * v.x + u.y * v.y;
    var m = Math.hypot(u.x, u.y) * Math.hypot(v.x, v.y);
    return Math.acos(Math.max(-1, Math.min(1, dot / m))) * 180 / Math.PI;
  }

  function analyse() {
    var sides = [0, 1, 2, 3].map(function (i) { return dist(verts[i], verts[(i + 1) % 4]); });
    var slopes = [0, 1, 2, 3].map(function (i) { return slope(verts[i], verts[(i + 1) % 4]); });
    var oppPar = parallel(slopes[0], slopes[2]) && parallel(slopes[1], slopes[3]);
    var onePar = parallel(slopes[0], slopes[2]) || parallel(slopes[1], slopes[3]);
    var allEq = Math.abs(sides[0] - sides[1]) < 8 && Math.abs(sides[1] - sides[2]) < 8;
    var oppEq = Math.abs(sides[0] - sides[2]) < 8 && Math.abs(sides[1] - sides[3]) < 8;
    var angles = [0, 1, 2, 3].map(angleAt);
    var all90 = angles.every(function (a) { return Math.abs(a - 90) < 6; });
    return {
      parallelogram: oppPar,
      rectangle: oppPar && all90,
      rhombus: oppPar && oppEq,
      square: oppPar && oppEq && all90,
      trapezium: onePar && !oppPar,
      sides: sides, slopes: slopes, oppPar: oppPar,
    };
  }

  function render() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var info = analyse();
    var sideCols = ["#38bdf8", "#34d399", "#38bdf8", "#34d399"];

    [0, 1, 2, 3].forEach(function (i) {
      var j = (i + 1) % 4;
      var par = (i % 2 === 0) ? parallel(info.slopes[i], info.slopes[(i + 2) % 4]) : parallel(info.slopes[i], info.slopes[(i + 2) % 4]);
      svg.appendChild(E("line", {
        x1: verts[i].x, y1: verts[i].y, x2: verts[j].x, y2: verts[j].y,
        stroke: par ? "#4ade80" : sideCols[i], "stroke-width": par ? 4 : 2,
      }));
    });

    svg.appendChild(E("polygon", {
      points: verts.map(function (v) { return v.x + "," + v.y; }).join(" "),
      fill: "rgba(56,189,248,.08)", stroke: "none",
    }));

    verts.forEach(function (v, i) {
      svg.appendChild(E("circle", { cx: v.x, cy: v.y, r: 8, fill: "#fbbf24", stroke: "#0f172a", "stroke-width": 2 }));
      svg.appendChild(E("circle", { cx: v.x, cy: v.y, r: 18, fill: "transparent", "data-i": i }));
      var t = E("text", { x: v.x + 10, y: v.y - 8, fill: "#e2e8f0", "font-size": 14, "font-weight": 700 });
      t.textContent = String.fromCharCode(65 + i);
      svg.appendChild(t);
    });

    var labels = [
      { key: "parallelogram", text: "Parallelogram" },
      { key: "rectangle", text: "Rectangle" },
      { key: "rhombus", text: "Rhombus" },
      { key: "square", text: "Square" },
      { key: "trapezium", text: "Trapezium" },
    ];
    badges.innerHTML = "";
    labels.forEach(function (L) {
      var b = document.createElement("span");
      b.className = "badge" + (info[L.key] ? " on" : "");
      b.textContent = L.text;
      badges.appendChild(b);
    });

    if (info.square) caption.textContent = "Square — parallelogram + equal sides + right angles.";
    else if (info.rectangle) caption.textContent = "Rectangle — parallelogram with all angles 90°.";
    else if (info.rhombus) caption.textContent = "Rhombus — parallelogram with all sides equal.";
    else if (info.parallelogram) caption.textContent = "Parallelogram — both pairs of opposite sides parallel.";
    else if (info.trapezium) caption.textContent = "Trapezium — exactly one pair of parallel sides.";
    else caption.textContent = "General quadrilateral — drag corners to explore properties.";
  }

  function pt(e) {
    var r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal;
    return { x: (e.clientX - r.left) * (vb.width / r.width), y: (e.clientY - r.top) * (vb.height / r.height) };
  }

  function init() {
    svg = document.getElementById("quad-svg");
    badges = document.getElementById("quad-badges");
    caption = document.getElementById("quad-caption");
    var row = document.getElementById("quad-presets");
    Object.keys(PRESETS).forEach(function (name) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "btn";
      b.textContent = name.charAt(0).toUpperCase() + name.slice(1);
      b.addEventListener("click", function () {
        verts = PRESETS[name].map(function (v) { return { x: v.x, y: v.y }; });
        render();
      });
      row.appendChild(b);
    });

    svg.addEventListener("pointerdown", function (e) {
      if (e.target.dataset.i != null) { drag = +e.target.dataset.i; e.target.setPointerCapture(e.pointerId); }
    });
    svg.addEventListener("pointermove", function (e) {
      if (drag == null) return;
      var p = pt(e);
      verts[drag].x = Math.max(30, Math.min(470, p.x));
      verts[drag].y = Math.max(30, Math.min(310, p.y));
      render();
    });
    svg.addEventListener("pointerup", function () { drag = null; });
    svg.addEventListener("pointercancel", function () { drag = null; });

    document.getElementById("quad-check-btn").addEventListener("click", function () {
      var fb = document.getElementById("quad-check-fb");
      var v = String(document.getElementById("quad-check-in").value).trim().toLowerCase();
      if (v.indexOf("trape") >= 0) {
        fb.className = "feedback ok";
        fb.textContent = "Correct — a trapezium (trapezoid) has one pair of parallel sides.";
      } else {
        fb.className = "feedback bad";
        fb.textContent = "One pair of parallel sides → trapezium.";
      }
    });
    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
