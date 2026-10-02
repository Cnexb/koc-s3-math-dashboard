(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var H_LEN = 200;
  var theta = 35;
  var quizPick = null;
  var svg;

  function E(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    return el;
  }
  function fmt(x) { return (Math.round(x * 1000) / 1000).toFixed(3); }
  function rad(d) { return d * Math.PI / 180; }

  function renderKatex(root) {
    if (window.renderMathInElement && root) {
      window.renderMathInElement(root, {
        delimiters: [{ left: "\\(", right: "\\)", display: false }, { left: "\\[", right: "\\]", display: true }],
      });
    }
  }

  function render() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var th = rad(theta);
    var A = H_LEN * Math.cos(th);
    var O = H_LEN * Math.sin(th);
    var ox = 80, oy = 260;
    var ax = ox + A, ay = oy;
    var hx = ox + A, hy = oy - O;

    svg.appendChild(E("polygon", {
      points: ox + "," + oy + " " + ax + "," + ay + " " + hx + "," + hy,
      fill: "rgba(56,189,248,.2)", stroke: "#38bdf8", "stroke-width": 2,
    }));
    svg.appendChild(E("path", {
      d: "M " + (ox + 28) + " " + oy + " A 28 28 0 0 0 " + (ox + 28 * Math.cos(th)) + " " + (oy - 28 * Math.sin(th)),
      fill: "none", stroke: "#fbbf24", "stroke-width": 2,
    }));
    var tl = E("text", { x: ox + 38, y: oy - 8, fill: "#fbbf24", "font-size": 16, "font-weight": 700 });
    tl.textContent = "θ";
    svg.appendChild(tl);

    [[ox, oy, ax, ay, "#34d399", "A"], [ax, ay, hx, hy, "#f472b6", "O"], [ox, oy, hx, hy, "#a78bfa", "H"]].forEach(function (s) {
      svg.appendChild(E("line", { x1: s[0], y1: s[1], x2: s[2], y2: s[3], stroke: s[4], "stroke-width": 3 }));
      var mx = (s[0] + s[2]) / 2, my = (s[1] + s[3]) / 2;
      var t = E("text", { x: mx + (s[5] === "O" ? 8 : 0), y: my + (s[5] === "A" ? 18 : s[5] === "O" ? -8 : -10), fill: s[4], "font-size": 15, "font-weight": 700 });
      t.textContent = s[5];
      svg.appendChild(t);
    });

    var sin = O / H_LEN, cos = A / H_LEN, tan = O / A;
    document.getElementById("trig-sin").textContent = fmt(sin);
    document.getElementById("trig-cos").textContent = fmt(cos);
    document.getElementById("trig-tan").textContent = fmt(tan);
    document.getElementById("trig-id").textContent = fmt(sin * sin + cos * cos);
    document.getElementById("trig-angle-val").textContent = theta + "°";
    renderKatex(document.getElementById("panel-tools"));
  }

  function init() {
    svg = document.getElementById("trig-svg");
    document.getElementById("trig-angle").addEventListener("input", function (e) {
      theta = +e.target.value;
      render();
    });
    document.querySelectorAll("[data-trig-ans]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        quizPick = btn.dataset.trigAns;
        document.querySelectorAll("[data-trig-ans]").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
      });
    });
    document.getElementById("trig-check-btn").addEventListener("click", function () {
      var fb = document.getElementById("trig-check-fb");
      if (quizPick === "1") {
        fb.className = "feedback ok";
        fb.textContent = "Correct — sin²θ + cos²θ = 1 for every angle (Pythagoras on the unit circle).";
      } else if (quizPick != null) {
        fb.className = "feedback bad";
        fb.textContent = "Try moving θ — the identity sum stays at 1.";
      } else {
        fb.className = "feedback bad";
        fb.textContent = "Pick 0 or 1.";
      }
    });
    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
