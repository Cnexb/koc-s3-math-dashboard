/* Area & Volume — Builder Game.
 *
 * A sandbox where the learner DRAGS 2D shapes (or 3D solids) from a palette onto a
 * canvas, resizes them with sliders, and watches a live step-by-step panel add up the
 * TOTAL AREA (2D mode) or TOTAL VOLUME (3D mode).  Every formula chip is hoverable and
 * clickable — clicking opens a popup with the general formula, a labelled diagram and the
 * substitution using this shape's current numbers.
 *
 * Colours follow the rest of the dashboard / Manim decks.  All maths renders via KaTeX
 * (figure dimension labels use SVG <foreignObject>).
 */
(function () {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";
  const PI = Math.PI;
  const SCALE = 18;                 // px per cm on the canvas
  const VB_W = 640, VB_H = 460;     // canvas viewBox
  const MARGIN = 34;

  // ── small svg helpers ──
  function E(tag, attrs) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }
  function poly(p, pts, fill, op, stroke, sw, dash) {
    const a = { points: pts.map((q) => q[0] + "," + q[1]).join(" "), fill,
      "fill-opacity": op, stroke: stroke || fill, "stroke-width": sw == null ? 2 : sw };
    if (dash) a["stroke-dasharray"] = dash;
    p.appendChild(E("polygon", a));
  }
  function line(p, x1, y1, x2, y2, col, w, dash) {
    const a = { x1, y1, x2, y2, stroke: col, "stroke-width": w || 2 };
    if (dash) a["stroke-dasharray"] = dash;
    p.appendChild(E("line", a));
  }
  function rect(p, x, y, w, h, fill, op, stroke, sw) {
    p.appendChild(E("rect", { x, y, width: Math.max(0, w), height: Math.max(0, h), fill,
      "fill-opacity": op, stroke: stroke || fill, "stroke-width": sw == null ? 2 : sw, rx: 2 }));
  }
  function circ(p, cx, cy, r, fill, op, stroke, sw, dash) {
    const a = { cx, cy, r: Math.max(0, r), fill, "fill-opacity": op, stroke: stroke || fill,
      "stroke-width": sw == null ? 2 : sw };
    if (dash) a["stroke-dasharray"] = dash;
    p.appendChild(E("circle", a));
  }
  function ell(p, cx, cy, rx, ry, fill, op, stroke, sw, dash) {
    const a = { cx, cy, rx: Math.max(0, rx), ry: Math.max(0, ry), fill, "fill-opacity": op,
      stroke: stroke || fill, "stroke-width": sw == null ? 1.6 : sw };
    if (dash) a["stroke-dasharray"] = dash;
    p.appendChild(E("ellipse", a));
  }
  function kx(el, latex) {
    try { window.katex.render(latex, el, { throwOnError: false, displayMode: false }); }
    catch (e) { el.textContent = latex; }
  }
  function renderTexAttrs(root) {
    (root || document).querySelectorAll("[data-tex]").forEach((el) => kx(el, el.getAttribute("data-tex")));
  }
  // iPad / phone: WebKit mishandles foreignObject content inside viewBox-scaled
  // SVGs (labels drift or fail to paint). On touch devices render plain SVG
  // <text> in white on the dark pill instead; desktop keeps KaTeX.
  function isTouchUI() {
    const de = document.documentElement;
    return de.classList.contains("tablet-touch") || de.classList.contains("phone-compact") ||
      window.innerWidth <= 767 ||
      (window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
  }
  const TEX_SUB = { 0: "\u2080", 1: "\u2081", 2: "\u2082", 3: "\u2083", 4: "\u2084" };
  function latexToPlain(latex) {
    let s = String(latex);
    for (let i = 0; i < 4; i++) {
      s = s
        .replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g, "$1/$2")
        .replace(/\\tfrac(\d)(\d)/g, "$1/$2")
        .replace(/\\text\{([^{}]*)\}/g, "$1")
        .replace(/\\textcolor\{[^{}]*\}\{([^{}]*)\}/g, "$1");
    }
    return s
      .replace(/\\pi/g, "\u03C0")
      .replace(/\\times/g, "\u00D7")
      .replace(/\\quad|\\qquad|\\[,;:! ]/g, " ")
      .replace(/\^\{?2\}?/g, "\u00B2")
      .replace(/\^\{?3\}?/g, "\u00B3")
      .replace(/_\{?(\d)\}?/g, (m, d) => TEX_SUB[d] || d)
      .replace(/[{}\\]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }
  // LaTeX label centred at local (x,y) inside an svg group. Dimension labels get a dark
  // pill background so they stay readable on top of any shape colour.
  function texAt(parent, x, y, latex, color, size, w, h) {
    w = w || 92; h = h || 26;
    if (isTouchUI()) {
      const str = latexToPlain(latex);
      let fs = size || 14;
      const maxTextW = w - 14;
      if (str.length * fs * 0.62 > maxTextW) fs = Math.max(8, Math.floor(maxTextW / (str.length * 0.62)));
      const bw = Math.min(w, str.length * fs * 0.62 + 14);
      const bh = fs + 10;
      parent.appendChild(E("rect", {
        x: x - bw / 2, y: y - bh / 2, width: bw, height: bh, rx: 7,
        fill: "rgba(7,13,28,.82)", stroke: "rgba(255,255,255,.14)", "stroke-width": 1,
      }));
      const t = E("text", {
        x, y, fill: "#ffffff", "font-size": fs,
        "text-anchor": "middle", "dominant-baseline": "middle",
        "font-family": "JetBrains Mono, monospace", "font-weight": "600",
      });
      t.textContent = str;
      parent.appendChild(t);
      return;
    }
    const fo = E("foreignObject", { x: x - w / 2, y: y - h / 2, width: w, height: h });
    fo.setAttribute("overflow", "visible");
    const div = document.createElement("div");
    div.style.cssText = "width:100%;height:100%;display:flex;align-items:center;justify-content:center;";
    const pill = document.createElement("span");
    pill.style.cssText = "color:" + color + ";font-size:" + (size || 14) + "px;line-height:1;white-space:nowrap;" +
      "background:rgba(7,13,28,.82);border:1px solid rgba(255,255,255,.14);border-radius:7px;padding:3px 7px;";
    kx(pill, latex);
    div.appendChild(pill);
    fo.appendChild(div);
    parent.appendChild(fo);
  }

  const r1 = (x) => Math.round(x * 10) / 10;
  const fmt = (x) => { const r = r1(x); return Number.isInteger(r) ? String(r) : r.toFixed(1); };
  const unitTex = (u) => (u === "cm^2" ? "\\text{cm}^2" : "\\text{cm}^3");
  const DIM = "#ffffff";   // dimension-label colour (kept neutral so it never matches a shape)

  /* ───────────────────────── shape geometry helpers ───────────────────────── */
  function boxCorners(W, H, D) {
    const dx = D * 0.72, dy = -D * 0.72, sx = -dx / 2, sy = -dy / 2;
    return {
      flb: [sx - W / 2, sy + H / 2], frb: [sx + W / 2, sy + H / 2],
      frt: [sx + W / 2, sy - H / 2], flt: [sx - W / 2, sy - H / 2],
      blt: [sx - W / 2 + dx, sy - H / 2 + dy], brt: [sx + W / 2 + dx, sy - H / 2 + dy],
      brb: [sx + W / 2 + dx, sy + H / 2 + dy], dx, dy, sx, sy,
    };
  }
  function drawBox(g, W, H, D, pal) {
    const c = boxCorners(W, H, D);
    poly(g, [c.flt, c.frt, c.brt, c.blt], pal[0], 0.55, pal[1], 2);  // top
    poly(g, [c.frt, c.frb, c.brb, c.brt], pal[0], 0.30, pal[1], 2);  // right
    poly(g, [c.flt, c.frt, c.frb, c.flb], pal[0], 0.50, pal[1], 2);  // front
  }
  function bboxFrom(pts) {
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const minx = Math.min.apply(null, xs), maxx = Math.max.apply(null, xs);
    const miny = Math.min.apply(null, ys), maxy = Math.max.apply(null, ys);
    return { x: minx, y: miny, w: maxx - minx, h: maxy - miny };
  }
  function boxBBox(W, H, D) {
    const c = boxCorners(W, H, D);
    return bboxFrom([c.flb, c.frb, c.frt, c.flt, c.blt, c.brt, c.brb]);
  }
  function drawCylinder(g, rx, H, pal) {
    const ry = rx * 0.32, top = -H / 2, bot = H / 2;
    poly(g, [[-rx, top], [rx, top], [rx, bot], [-rx, bot]], pal[0], 0.36, "none", 0);
    g.appendChild(E("path", { d: "M " + (-rx) + " " + bot + " A " + rx + " " + ry + " 0 0 0 " + rx + " " + bot,
      fill: pal[0], "fill-opacity": 0.5, stroke: pal[1], "stroke-width": 2 }));
    line(g, -rx, top, -rx, bot, pal[1], 2);
    line(g, rx, top, rx, bot, pal[1], 2);
    ell(g, 0, top, rx, ry, pal[0], 0.62, pal[1], 2);
  }
  function drawCone(g, rx, H, pal) {
    const ry = rx * 0.3, apex = [0, -H / 2];
    poly(g, [apex, [-rx, H / 2], [rx, H / 2]], pal[0], 0.45, pal[1], 2);
    ell(g, 0, H / 2, rx, ry, pal[0], 0.6, pal[1], 2);
  }
  function drawSphere(g, R, pal) {
    circ(g, 0, 0, R, pal[0], 0.4, pal[1], 2);
    ell(g, 0, 0, R, R * 0.3, "none", 1, pal[1], 1.4, "4 3");
  }
  function pyrCorners(bp, H) {
    // base is a square seen in oblique projection; apex sits straight above the base centroid
    const D = bp * 0.6, dx = D * 0.72, dy = -D * 0.72, sx = -dx / 2, sy = -dy / 2;
    const fl = [sx - bp / 2, sy + H / 2], fr = [sx + bp / 2, sy + H / 2];
    const bl = [fl[0] + dx, fl[1] + dy], br = [fr[0] + dx, fr[1] + dy];
    const cxb = (fl[0] + fr[0] + bl[0] + br[0]) / 4;   // base centroid x
    const cyb = (fl[1] + fr[1] + bl[1] + br[1]) / 4;   // base centroid y
    return { fl, fr, bl, br, apex: [cxb, cyb - H], baseC: [cxb, cyb] };
  }
  function drawPyramid(g, bp, H, pal) {
    const c = pyrCorners(bp, H);
    poly(g, [c.fl, c.fr, c.br, c.bl], pal[0], 0.32, pal[1], 2);     // base
    line(g, c.apex[0], c.apex[1], c.bl[0], c.bl[1], pal[1], 1.4, "5 4");
    poly(g, [c.fl, c.bl, c.apex], pal[0], 0.42, pal[1], 2);         // left back face
    poly(g, [c.fr, c.br, c.apex], pal[0], 0.3, pal[1], 2);          // right back face
    poly(g, [c.fl, c.fr, c.apex], pal[0], 0.52, pal[1], 2);         // front face
  }

  /* ───────────────────────── shape registry ───────────────────────── */
  // Each def: name, kind, color [fill, stroke], params, value(), latex pieces, draw, bbox, dims.
  const DEFS = {
    /* ---- 2D ---- */
    square: {
      name: "Square", kind: "2d", color: ["#4FC3F7", "#bfe9ff"],
      params: [{ key: "a", label: "side a", min: 1, max: 10, step: 1, def: 4 }],
      lhs: "A", rhsSym: "a^2", unit: "cm^2",
      rhsNum: (p) => p.a + "^2", value: (p) => p.a * p.a,
      note: "Area of a square = side \u00d7 side. All four sides are equal, so it is simply the side squared.",
      draw: (g, p, k, pal) => { const s = p.a * k; rect(g, -s / 2, -s / 2, s, s, pal[0], 0.5, pal[1], 2); },
      bbox: (p, k) => { const s = p.a * k; return { x: -s / 2, y: -s / 2, w: s, h: s }; },
      dims: (p, k) => ({ texts: [{ x: 0, y: p.a * k / 2 + 15, t: "a=" + p.a }], lines: [] }),
    },
    rectangle: {
      name: "Rectangle", kind: "2d", color: ["#81C784", "#c8efca"],
      params: [{ key: "l", label: "length l", min: 1, max: 10, step: 1, def: 6 },
               { key: "w", label: "width w", min: 1, max: 10, step: 1, def: 3 }],
      lhs: "A", rhsSym: "l \\times w", unit: "cm^2",
      rhsNum: (p) => p.l + " \\times " + p.w, value: (p) => p.l * p.w,
      note: "Area of a rectangle = length \u00d7 width.",
      draw: (g, p, k, pal) => { const W = p.l * k, H = p.w * k; rect(g, -W / 2, -H / 2, W, H, pal[0], 0.5, pal[1], 2); },
      bbox: (p, k) => { const W = p.l * k, H = p.w * k; return { x: -W / 2, y: -H / 2, w: W, h: H }; },
      dims: (p, k) => ({ texts: [{ x: 0, y: p.w * k / 2 + 15, t: "l=" + p.l },
                                  { x: p.l * k / 2 + 24, y: 0, t: "w=" + p.w }], lines: [] }),
    },
    triangle: {
      name: "Triangle", kind: "2d", color: ["#FFD54F", "#ffe9a3"],
      params: [{ key: "b", label: "base b", min: 1, max: 10, step: 1, def: 6 },
               { key: "h", label: "height h", min: 1, max: 10, step: 1, def: 4 }],
      lhs: "A", rhsSym: "\\tfrac12\\, b\\, h", unit: "cm^2",
      rhsNum: (p) => "\\tfrac12 \\times " + p.b + " \\times " + p.h, value: (p) => 0.5 * p.b * p.h,
      note: "Area of a triangle = \u00bd \u00d7 base \u00d7 perpendicular height (the height meets the base at a right angle).",
      draw: (g, p, k, pal) => { const B = p.b * k, H = p.h * k;
        poly(g, [[-B / 2, H / 2], [B / 2, H / 2], [0, -H / 2]], pal[0], 0.5, pal[1], 2); },
      bbox: (p, k) => { const B = p.b * k, H = p.h * k; return { x: -B / 2, y: -H / 2, w: B, h: H }; },
      dims: (p, k) => { const H = p.h * k; return { texts: [{ x: 0, y: H / 2 + 15, t: "b=" + p.b },
        { x: 16, y: 0, t: "h=" + p.h }], lines: [{ x1: 0, y1: H / 2, x2: 0, y2: -H / 2, dash: "4 3" }] }; },
    },
    circle: {
      name: "Circle", kind: "2d", color: ["#FF8A65", "#ffc6b0"],
      params: [{ key: "r", label: "radius r", min: 1, max: 6, step: 1, def: 3 }],
      lhs: "A", rhsSym: "\\pi r^2", unit: "cm^2",
      rhsNum: (p) => "\\pi \\times " + p.r + "^2", value: (p) => PI * p.r * p.r,
      note: "Area of a circle = \u03c0 \u00d7 radius\u00b2. The radius r is the distance from the centre to the edge.",
      draw: (g, p, k, pal) => { circ(g, 0, 0, p.r * k, pal[0], 0.5, pal[1], 2); },
      bbox: (p, k) => { const R = p.r * k; return { x: -R, y: -R, w: 2 * R, h: 2 * R }; },
      dims: (p, k) => { const R = p.r * k; return { texts: [{ x: R / 2, y: -11, t: "r=" + p.r }],
        lines: [{ x1: 0, y1: 0, x2: R, y2: 0 }] }; },
    },
    /* ---- 3D ---- */
    cube: {
      name: "Cube", kind: "3d", color: ["#4FC3F7", "#bfe9ff"],
      params: [{ key: "a", label: "side a", min: 1, max: 9, step: 1, def: 4 }],
      lhs: "V", rhsSym: "a^3", unit: "cm^3",
      rhsNum: (p) => p.a + "^3", value: (p) => p.a * p.a * p.a,
      note: "Volume of a cube = side\u00b3 (length \u00d7 width \u00d7 height, all equal).",
      draw: (g, p, k, pal) => { const s = p.a * k; drawBox(g, s, s, s * 0.85, pal); },
      bbox: (p, k) => { const s = p.a * k; return boxBBox(s, s, s * 0.85); },
      dims: (p, k) => { const s = p.a * k; return { texts: [{ x: 0, y: s / 2 + 15, t: "a=" + p.a }], lines: [] }; },
    },
    cuboid: {
      name: "Cuboid", kind: "3d", color: ["#81C784", "#c8efca"],
      params: [{ key: "l", label: "length l", min: 1, max: 10, step: 1, def: 6 },
               { key: "w", label: "width w", min: 1, max: 8, step: 1, def: 3 },
               { key: "h", label: "height h", min: 1, max: 9, step: 1, def: 4 }],
      lhs: "V", rhsSym: "l \\times w \\times h", unit: "cm^3",
      rhsNum: (p) => p.l + " \\times " + p.w + " \\times " + p.h, value: (p) => p.l * p.w * p.h,
      note: "Volume of a cuboid = length \u00d7 width \u00d7 height (the area of the base times how tall it is).",
      draw: (g, p, k, pal) => { drawBox(g, p.l * k, p.h * k, p.w * k * 0.9, pal); },
      bbox: (p, k) => boxBBox(p.l * k, p.h * k, p.w * k * 0.9),
      dims: (p, k) => { const W = p.l * k, H = p.h * k; return { texts: [
        { x: 0, y: H / 2 + 15, t: "l=" + p.l }, { x: W / 2 + 22, y: 0, t: "h=" + p.h }], lines: [] }; },
    },
    cylinder: {
      name: "Cylinder", kind: "3d", color: ["#FFD54F", "#ffe9a3"],
      params: [{ key: "r", label: "radius r", min: 1, max: 6, step: 1, def: 3 },
               { key: "h", label: "height h", min: 1, max: 10, step: 1, def: 5 }],
      lhs: "V", rhsSym: "\\pi r^2 h", unit: "cm^3",
      rhsNum: (p) => "\\pi \\times " + p.r + "^2 \\times " + p.h, value: (p) => PI * p.r * p.r * p.h,
      note: "Volume of a cylinder = base area \u00d7 height = \u03c0r\u00b2h.",
      draw: (g, p, k, pal) => { drawCylinder(g, p.r * k, p.h * k, pal); },
      bbox: (p, k) => { const rx = p.r * k, H = p.h * k, ry = rx * 0.32; return { x: -rx, y: -H / 2 - ry, w: 2 * rx, h: H + 2 * ry }; },
      dims: (p, k) => { const rx = p.r * k, H = p.h * k; return { texts: [
        { x: rx / 2, y: -H / 2 - 12, t: "r=" + p.r }, { x: rx + 22, y: 0, t: "h=" + p.h }], lines: [] }; },
    },
    cone: {
      name: "Cone", kind: "3d", color: ["#FF8A65", "#ffc6b0"],
      params: [{ key: "r", label: "radius r", min: 1, max: 6, step: 1, def: 3 },
               { key: "h", label: "height h", min: 1, max: 10, step: 1, def: 6 }],
      lhs: "V", rhsSym: "\\tfrac13\\pi r^2 h", unit: "cm^3",
      rhsNum: (p) => "\\tfrac13 \\times \\pi \\times " + p.r + "^2 \\times " + p.h, value: (p) => PI * p.r * p.r * p.h / 3,
      note: "Volume of a cone = \u2153 \u00d7 base area \u00d7 height = \u2153\u03c0r\u00b2h \u2014 a third of the cylinder with the same base and height.",
      draw: (g, p, k, pal) => { drawCone(g, p.r * k, p.h * k, pal); },
      bbox: (p, k) => { const rx = p.r * k, H = p.h * k, ry = rx * 0.3; return { x: -rx, y: -H / 2, w: 2 * rx, h: H + ry }; },
      dims: (p, k) => { const rx = p.r * k, H = p.h * k; return { texts: [
        { x: 0, y: H / 2 + 18, t: "r=" + p.r }, { x: 16, y: 0, t: "h=" + p.h }],
        lines: [{ x1: 0, y1: H / 2, x2: 0, y2: -H / 2, dash: "4 3" }] }; },
    },
    sphere: {
      name: "Sphere", kind: "3d", color: ["#BA68C8", "#e0bfe9"],
      params: [{ key: "r", label: "radius r", min: 1, max: 6, step: 1, def: 3 }],
      lhs: "V", rhsSym: "\\tfrac43\\pi r^3", unit: "cm^3",
      rhsNum: (p) => "\\tfrac43 \\times \\pi \\times " + p.r + "^3", value: (p) => 4 / 3 * PI * p.r * p.r * p.r,
      note: "Volume of a sphere = 4\u20443 \u03c0r\u00b3.",
      draw: (g, p, k, pal) => { drawSphere(g, p.r * k, pal); },
      bbox: (p, k) => { const R = p.r * k; return { x: -R, y: -R, w: 2 * R, h: 2 * R }; },
      dims: (p, k) => { const R = p.r * k; return { texts: [{ x: R / 2, y: -11, t: "r=" + p.r }],
        lines: [{ x1: 0, y1: 0, x2: R, y2: 0 }] }; },
    },
    pyramid: {
      name: "Pyramid", kind: "3d", color: ["#4DD0E1", "#bff0f5"],
      params: [{ key: "a", label: "base a", min: 1, max: 9, step: 1, def: 5 },
               { key: "h", label: "height h", min: 1, max: 10, step: 1, def: 6 }],
      lhs: "V", rhsSym: "\\tfrac13 a^2 h", unit: "cm^3",
      rhsNum: (p) => "\\tfrac13 \\times " + p.a + "^2 \\times " + p.h, value: (p) => p.a * p.a * p.h / 3,
      note: "Volume of a pyramid = \u2153 \u00d7 base area \u00d7 height. Here the base is a square of side a, so base area = a\u00b2.",
      draw: (g, p, k, pal) => { drawPyramid(g, p.a * k, p.h * k, pal); },
      bbox: (p, k) => { const c = pyrCorners(p.a * k, p.h * k); return bboxFrom([c.fl, c.fr, c.bl, c.br, c.apex]); },
      dims: (p, k) => { const H = p.h * k; return { texts: [{ x: 0, y: H / 2 + 15, t: "a=" + p.a },
        { x: 16, y: 0, t: "h=" + p.h }], lines: [{ x1: 0, y1: H / 2, x2: 0, y2: -H / 2, dash: "4 3" }] }; },
    },
  };

  const ORDER_2D = ["square", "rectangle", "triangle", "circle"];
  const ORDER_3D = ["cube", "cuboid", "cylinder", "cone", "sphere", "pyramid"];

  function defaults(type) {
    const o = {};
    DEFS[type].params.forEach((p) => { o[p.key] = p.def; });
    return o;
  }
  // full LaTeX chain shown on a calc chip
  function chipTex(s) {
    const d = DEFS[s.type];
    return d.lhs + " = " + d.rhsSym + " = " + d.rhsNum(s.params) + " = " +
      fmt(d.value(s.params)) + "\\," + unitTex(d.unit);
  }
  // worked solution split so each "=" step sits on its own line (avoids messy wrapping)
  function solutionLines(s) {
    const d = DEFS[s.type];
    return [
      d.lhs + " = " + d.rhsSym,
      "= " + d.rhsNum(s.params),
      "= " + fmt(d.value(s.params)) + "\\," + unitTex(d.unit),
    ];
  }
  function shapeValue(s) { return DEFS[s.type].value(s.params); }
  // mini palette icon
  function iconSvg(type) {
    const d = DEFS[type];
    const svg = E("svg", { viewBox: "0 0 40 40" });
    const p = defaults(type);
    const bb = d.bbox(p, 1);
    const k = Math.min(30 / Math.max(bb.w, 0.1), 30 / Math.max(bb.h, 0.1));
    const cx = -(bb.x + bb.w / 2) * k, cy = -(bb.y + bb.h / 2) * k;
    const g = E("g", { transform: "translate(" + (20 + cx) + "," + (20 + cy) + ")" });
    d.draw(g, p, k, d.color);
    svg.appendChild(g);
    return svg;
  }

  /* ───────────────────────── state ───────────────────────── */
  const state = { mode: "2d", shapes: { "2d": [], "3d": [] }, selected: null };
  let uid = 0;
  let els = {};

  function activeList() { return state.shapes[state.mode]; }
  function selectedShape() { return activeList().find((s) => s.id === state.selected) || null; }
  function unsolved() { return activeList().filter((s) => !s.solved); }

  function svgPoint(svg, evt) {
    const pt = svg.createSVGPoint();
    pt.x = evt.clientX; pt.y = evt.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }
  function clampPos(s) {
    const d = DEFS[s.type], bb = d.bbox(s.params, SCALE);
    s.x = Math.min(VB_W - MARGIN - (bb.x + bb.w), Math.max(MARGIN - bb.x, s.x));
    s.y = Math.min(VB_H - MARGIN - (bb.y + bb.h), Math.max(MARGIN - bb.y, s.y));
  }
  // full SVG transform for a placed shape: position then rotation about its own centre
  function shapeTransform(s) {
    return "translate(" + s.x + "," + s.y + ") rotate(" + (s.rot || 0) + ")";
  }
  // which shape (if any) is under a client point on the canvas
  function shapeAtPoint(cx, cy) {
    let el = document.elementFromPoint(cx, cy);
    const g = el && el.closest ? el.closest(".shape-g") : null;
    if (!g) return null;
    return activeList().find((s) => String(s.id) === g.dataset.id) || null;
  }

  /* ───────────────────────── canvas render ───────────────────────── */
  function badge(g, bb, kind, rot) {
    const bx = bb.x + bb.w + 4, by = bb.y - 4;
    // counter-rotate so the tick / question mark stays upright when the shape is turned
    const grp = E("g", { transform: "translate(" + bx + "," + by + ") rotate(" + (-(rot || 0)) + ")", "pointer-events": "none" });
    if (kind === "ok") {
      circ(grp, 0, 0, 11, "#81C784", 1, "#0b1324", 2);
      const t = E("text", { x: 0, y: 1, "text-anchor": "middle", "dominant-baseline": "middle",
        "font-size": 14, fill: "#06283d", "font-weight": "700", "font-family": "Hanken Grotesk, sans-serif" });
      t.textContent = "\u2713"; grp.appendChild(t);
    } else {
      circ(grp, 0, 0, 11, "#16213a", 1, "#FFB74D", 2);
      const t = E("text", { x: 0, y: 1, "text-anchor": "middle", "dominant-baseline": "middle",
        "font-size": 14, fill: "#FFB74D", "font-weight": "700", "font-family": "Hanken Grotesk, sans-serif" });
      t.textContent = "?"; grp.appendChild(t);
    }
    g.appendChild(grp);
  }
  function renderCanvas() {
    const svg = els.canvas;
    clear(svg);
    const list = activeList();
    if (!list.length) {
      const t = E("text", { x: VB_W / 2, y: VB_H / 2, "text-anchor": "middle", class: "canvas-empty", "font-size": 18 });
      t.textContent = "Drag a shape here \u2192 build your figure";
      svg.appendChild(t);
      return;
    }
    list.forEach((s) => {
      const d = DEFS[s.type];
      const g = E("g", { class: "shape-g" + (s.solved ? " solved" : ""), transform: shapeTransform(s) });
      g.dataset.id = s.id;
      const bb = d.bbox(s.params, SCALE);
      if (s.id === state.selected) {
        const pad = 8;
        g.appendChild(E("rect", { x: bb.x - pad, y: bb.y - pad, width: bb.w + 2 * pad, height: bb.h + 2 * pad,
          rx: 8, fill: "none", stroke: "#4FC3F7", "stroke-width": 1.6, "stroke-dasharray": "6 4" }));
      }
      d.draw(g, s.params, SCALE, d.color);
      badge(g, bb, s.solved ? "ok" : "q", s.rot);
      g.addEventListener("pointerdown", (e) => startShapePointer(s, e));
      svg.appendChild(g);
    });
  }

  /* ───────────────────────── formula-label tray ───────────────────────── */
  function renderTray() {
    const box = els.trayChips;
    clear(box);
    const list = activeList();
    const todo = unsolved().slice().sort((a, b) => a.tray - b.tray);
    if (!list.length) {
      els.trayLabel.textContent = "Add shapes, then drag each formula onto its matching shape.";
      return;
    }
    if (!todo.length) {
      els.trayLabel.textContent = "All shapes matched \u2014 nice work!";
      const done = document.createElement("div");
      done.className = "tray-done";
      done.textContent = "\u2713 every formula placed";
      box.appendChild(done);
      return;
    }
    els.trayLabel.textContent = "Drag each formula onto its matching " + (state.mode === "2d" ? "shape" : "solid") + ":";
    todo.forEach((s) => {
      const d = DEFS[s.type];
      const chip = document.createElement("button");
      chip.className = "tray-chip";
      chip.dataset.type = s.type;
      const tx = document.createElement("span");
      kx(tx, d.lhs + " = " + d.rhsSym);
      chip.appendChild(tx);
      chip.addEventListener("pointerdown", (e) => startTrayDrag(s.type, chip, e));
      box.appendChild(chip);
    });
  }

  /* ───────────────────────── calc / solution panel ───────────────────────── */
  function renderCalc() {
    const list = activeList(), is2d = state.mode === "2d";
    els.calcTitle.textContent = is2d ? "Total Area" : "Total Volume";
    els.calcSub.textContent = "Revealed as you match each formula to its shape";
    els.ctLabel.textContent = is2d ? "Total area" : "Total volume";
    els.count.textContent = list.length + (list.length === 1 ? " shape" : " shapes");

    clear(els.scroll);
    if (!list.length) {
      const e = document.createElement("div");
      e.className = "calc-empty";
      e.innerHTML = "No shapes yet.<br>Add some from the palette to start the puzzle.";
      els.scroll.appendChild(e);
      clear(els.ctVal); kx(els.ctVal, "\\text{--}");
      return;
    }
    list.forEach((s, i) => {
      const d = DEFS[s.type];
      const card = document.createElement("div");
      card.className = "calc-card" + (s.id === state.selected ? " sel" : "") + (s.solved ? " done" : " locked");
      card.dataset.id = s.id;
      const head = document.createElement("div");
      head.className = "cc-head";
      head.innerHTML = '<span class="cc-dot" style="background:' + d.color[0] + '"></span>' +
        '<span class="cc-title">' + d.name + '</span><span class="cc-idx">#' + (i + 1) + "</span>";
      card.appendChild(head);
      if (s.solved) {
        const sol = document.createElement("button");
        sol.className = "formula-chip";
        sol.title = "Click for the full diagram & explanation";
        solutionLines(s).forEach((ln) => { const r = document.createElement("div"); r.className = "eq-line"; kx(r, ln); sol.appendChild(r); });
        sol.addEventListener("click", (ev) => { ev.stopPropagation(); openSolution(s); });
        card.appendChild(sol);
      } else {
        const lock = document.createElement("div");
        lock.className = "cc-locked";
        lock.innerHTML = "\uD83D\uDD12 Drag this shape's formula onto it to reveal the working.";
        card.appendChild(lock);
      }
      card.addEventListener("click", () => selectShape(s.id));
      els.scroll.appendChild(card);
    });

    // total counts only the shapes that have been matched/solved so far
    const solved = list.filter((s) => s.solved);
    const u = unitTex(is2d ? "cm^2" : "cm^3");
    clear(els.ctVal);
    if (!solved.length) {
      kx(els.ctVal, "\\text{--}");
      els.ctLabel.textContent = (is2d ? "Total area" : "Total volume") + " (0 / " + list.length + " matched)";
    } else {
      const total = solved.reduce((a, s) => a + shapeValue(s), 0);
      const parts = solved.map((s) => fmt(shapeValue(s)));
      const latex = (solved.length > 1 ? parts.join(" + ") + " = " : "") + fmt(total) + "\\," + u;
      kx(els.ctVal, latex);
      const allDone = solved.length === list.length;
      els.ctLabel.textContent = (is2d ? "Total area" : "Total volume") +
        (allDone ? " \u2713 complete" : " (" + solved.length + " / " + list.length + " matched)");
    }
  }

  /* ───────────────────────── selected-shape controls ───────────────────────── */
  function renderControls() {
    const s = selectedShape();
    if (!s) { els.selControls.classList.add("hidden"); return; }
    const d = DEFS[s.type];
    els.selControls.classList.remove("hidden");
    els.selSwatch.style.background = d.color[0];
    els.selName.textContent = d.name;
    clear(els.selSliders);
    d.params.forEach((p) => {
      const row = document.createElement("div");
      row.className = "slider-row";
      const name = document.createElement("span");
      name.className = "sl-name"; name.textContent = p.label;
      const input = document.createElement("input");
      input.type = "range"; input.min = p.min; input.max = p.max; input.step = p.step; input.value = s.params[p.key];
      const val = document.createElement("span");
      val.className = "sl-val"; val.textContent = s.params[p.key] + " cm";
      input.addEventListener("input", () => {
        s.params[p.key] = +input.value;
        val.textContent = input.value + " cm";
        clampPos(s);
        renderCanvas();
        renderCalc();
      });
      row.appendChild(name); row.appendChild(input); row.appendChild(val);
      els.selSliders.appendChild(row);
    });
    // rotation control — turns the shape about its own centre on the canvas
    const rrow = document.createElement("div");
    rrow.className = "slider-row";
    const rname = document.createElement("span");
    rname.className = "sl-name"; rname.textContent = "rotation";
    const rinput = document.createElement("input");
    rinput.type = "range"; rinput.min = 0; rinput.max = 360; rinput.step = 5; rinput.value = s.rot || 0;
    const rval = document.createElement("span");
    rval.className = "sl-val"; rval.textContent = (s.rot || 0) + "\u00b0";
    rinput.addEventListener("input", () => {
      s.rot = +rinput.value;
      rval.textContent = rinput.value + "\u00b0";
      renderCanvas();
    });
    rrow.appendChild(rname); rrow.appendChild(rinput); rrow.appendChild(rval);
    els.selSliders.appendChild(rrow);
  }

  function renderAll() { renderCanvas(); renderTray(); renderCalc(); renderControls(); }

  /* ───────────────────────── interactions ───────────────────────── */
  function selectShape(id) { state.selected = id; renderCanvas(); renderCalc(); renderControls(); }
  function addShape(type, x, y) {
    const s = { id: ++uid, type, params: defaults(type), x: x, y: y, rot: 0, solved: false, tray: Math.random() };
    clampPos(s);
    activeList().push(s);
    state.selected = s.id;
    renderAll();
  }
  function deleteSelected() {
    const list = activeList(), i = list.findIndex((s) => s.id === state.selected);
    if (i >= 0) list.splice(i, 1);
    state.selected = null;
    renderAll();
  }
  function clearAll() { state.shapes[state.mode] = []; state.selected = null; renderAll(); }

  function solveShape(s) {
    if (s.solved) return;
    s.solved = true;
    state.selected = s.id;
    renderAll();
    flashCanvas(s, true);
    openSolution(s);
  }

  // green/red flash overlay on a shape after a match attempt
  function flashCanvas(s, ok) {
    const g = els.canvas.querySelector('.shape-g[data-id="' + s.id + '"]');
    if (!g) return;
    g.classList.add(ok ? "flash-ok" : "flash-bad");
    setTimeout(() => g.classList.remove("flash-ok", "flash-bad"), 600);
  }

  // pointer on a placed shape: drag to move, or (no drag) click to show its formula
  function startShapePointer(s, e) {
    e.preventDefault();
    selectShape(s.id);
    const g = els.canvas.querySelector('.shape-g[data-id="' + s.id + '"]');
    if (g) g.classList.add("dragging");
    const p0 = svgPoint(els.canvas, e), ox = p0.x - s.x, oy = p0.y - s.y;
    let moved = false;
    function move(ev) {
      const p = svgPoint(els.canvas, ev);
      if (Math.abs(p.x - p0.x) > 3 || Math.abs(p.y - p0.y) > 3) moved = true;
      s.x = p.x - ox; s.y = p.y - oy; clampPos(s);
      const node = els.canvas.querySelector('.shape-g[data-id="' + s.id + '"]');
      if (node) node.setAttribute("transform", shapeTransform(s));
    }
    function cleanup() {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      if (g) g.classList.remove("dragging");
    }
    function up() {
      cleanup();
      if (!moved) openFormula(s);   // a click (not a drag) opens the formula popup
    }
    function cancel() { cleanup(); }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
  }

  // shared ghost-drag helper. onDrop(ev, moved) decides what to do.
  function ghostDrag(ghostEl, e, onMove, onDrop) {
    const startX = e.clientX, startY = e.clientY;
    let moved = false;
    ghostEl.style.left = startX + "px"; ghostEl.style.top = startY + "px";
    document.body.appendChild(ghostEl);
    function cleanup() {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      ghostEl.remove();
    }
    function move(ev) {
      if (Math.abs(ev.clientX - startX) > 4 || Math.abs(ev.clientY - startY) > 4) moved = true;
      ghostEl.style.left = ev.clientX + "px"; ghostEl.style.top = ev.clientY + "px";
      if (onMove) onMove(ev);
    }
    function up(ev) {
      cleanup();
      onDrop(ev, moved);
    }
    // iOS Safari fires pointercancel when it steals the touch for scrolling;
    // without this the ghost stays stuck on screen and the drop never lands.
    function cancel(ev) {
      cleanup();
      onDrop(ev, true);
    }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
  }

  // drag a new shape from the palette onto the canvas
  function startPaletteDrag(type, e) {
    e.preventDefault();
    const ghost = document.createElement("div");
    ghost.className = "drag-ghost";
    const ic = iconSvg(type); ic.setAttribute("width", "52"); ic.setAttribute("height", "52");
    ghost.appendChild(ic);
    ghostDrag(ghost, e, null, (ev, moved) => {
      const r = els.canvas.getBoundingClientRect();
      const inside = ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom;
      if (inside) { const p = svgPoint(els.canvas, ev); addShape(type, p.x, p.y); }
      else if (!moved) addShape(type, VB_W / 2, VB_H / 2);
    });
  }

  // drag a formula label from the tray; only sticks if it lands on a matching, unsolved shape
  function startTrayDrag(type, chip, e) {
    e.preventDefault();
    const ghost = document.createElement("div");
    ghost.className = "drag-ghost tray-ghost";
    const inner = document.createElement("span");
    kx(inner, DEFS[type].lhs + " = " + DEFS[type].rhsSym);
    ghost.appendChild(inner);
    chip.classList.add("dragging");
    function hover(ev) {
      const t = shapeAtPoint(ev.clientX, ev.clientY);
      els.canvas.querySelectorAll(".shape-g").forEach((g) => g.classList.remove("drop-ok", "drop-bad"));
      if (t) {
        const g = els.canvas.querySelector('.shape-g[data-id="' + t.id + '"]');
        if (g) g.classList.add(t.type === type && !t.solved ? "drop-ok" : "drop-bad");
      }
    }
    ghostDrag(ghost, e, hover, (ev) => {
      chip.classList.remove("dragging");
      els.canvas.querySelectorAll(".shape-g").forEach((g) => g.classList.remove("drop-ok", "drop-bad"));
      const t = shapeAtPoint(ev.clientX, ev.clientY);
      if (t && t.type === type && !t.solved) { solveShape(t); }
      else if (t) { flashCanvas(t, false); }   // landed on a shape but wrong / already solved → no stick
      // otherwise: dropped on empty space → silently returns to the tray
    });
  }

  /* ───────────────────────── palette ───────────────────────── */
  function renderPalette() {
    els.palTitle.textContent = state.mode === "2d" ? "2D Shapes" : "3D Solids";
    clear(els.palList);
    (state.mode === "2d" ? ORDER_2D : ORDER_3D).forEach((type) => {
      const d = DEFS[type];
      const btn = document.createElement("button");
      btn.className = "pal-item"; btn.dataset.shape = type;
      btn.appendChild(iconSvg(type));
      const span = document.createElement("span"); span.textContent = d.name;
      btn.appendChild(span);
      btn.addEventListener("pointerdown", (e) => startPaletteDrag(type, e));
      els.palList.appendChild(btn);
    });
  }
  function setMode(mode) {
    if (state.mode === mode) return;
    state.mode = mode;
    state.selected = null;
    els.modeBtns.forEach((b) => b.classList.toggle("active", b.dataset.mode === mode));
    renderPalette(); renderAll();
  }

  /* ───────────────────────── popups ───────────────────────── */
  function buildDiagram(def, p) {
    const svg = E("svg", { viewBox: "0 0 300 200", class: "fx-svg" });
    const bb = def.bbox(p, 1);
    const k = Math.min(170 / Math.max(bb.w, 0.1), 110 / Math.max(bb.h, 0.1), 30);
    const g = E("g", { transform: "translate(150,100)" });
    def.draw(g, p, k, def.color);
    const dm = def.dims(p, k);
    (dm.lines || []).forEach((l) => line(g, l.x1, l.y1, l.x2, l.y2, DIM, 1.6, l.dash));
    svg.appendChild(g);
    const lg = E("g", { transform: "translate(150,100)" });
    (dm.texts || []).forEach((t) => texAt(lg, t.x, t.y, t.t, DIM, 14, 84, 24));
    svg.appendChild(lg);
    return svg;
  }
  // mini window shown when a shape is clicked — just the general formula (the hint)
  function openFormula(s) {
    const d = DEFS[s.type], is2d = d.kind === "2d";
    els.fxBody.innerHTML =
      '<p class="fx-tag">' + (is2d ? "Area formula" : "Volume formula") + '</p>' +
      '<h3>' + d.name + '</h3>' +
      '<div class="fx-diagram"></div>' +
      '<div class="fx-row"><span data-tex="' + d.lhs + " = " + d.rhsSym + '"></span></div>' +
      '<p class="fx-note">' + d.note + '</p>';
    els.fxBody.querySelector(".fx-diagram").appendChild(buildDiagram(d, s.params));
    renderTexAttrs(els.fxBody);
    els.fxModal.classList.remove("hidden");
  }
  // mini window shown after a correct match — the full worked solution, one "=" per line
  function openSolution(s) {
    const d = DEFS[s.type], is2d = d.kind === "2d";
    const lines = solutionLines(s).map((ln) =>
      '<div class="eq-line"><span data-tex="' + ln.replace(/"/g, "") + '"></span></div>').join("");
    els.fxBody.innerHTML =
      '<p class="fx-tag" style="color:#81C784">\u2713 Matched \u00b7 ' + (is2d ? "Area" : "Volume") + '</p>' +
      '<h3>' + d.name + '</h3>' +
      '<div class="fx-diagram"></div>' + lines +
      '<p class="fx-note">' + d.note + '</p>';
    els.fxBody.querySelector(".fx-diagram").appendChild(buildDiagram(d, s.params));
    renderTexAttrs(els.fxBody);
    els.fxModal.classList.remove("hidden");
  }
  function closeModal() { els.fxModal.classList.add("hidden"); }

  /* ───────────────────────── mount ───────────────────────── */
  const Game = {
    mounted: false,
    mount() {
      if (this.mounted) return;
      els = {
        canvas: document.getElementById("build-canvas"),
        palList: document.getElementById("pal-list"),
        palTitle: document.getElementById("pal-title"),
        count: document.getElementById("canvas-count"),
        clearBtn: document.getElementById("build-clear"),
        trayLabel: document.getElementById("tray-label"),
        trayChips: document.getElementById("tray-chips"),
        selControls: document.getElementById("sel-controls"),
        selSwatch: document.getElementById("sel-swatch"),
        selName: document.getElementById("sel-name"),
        selSliders: document.getElementById("sel-sliders"),
        selDelete: document.getElementById("sel-delete"),
        calcTitle: document.getElementById("calc-title"),
        calcSub: document.getElementById("calc-sub"),
        scroll: document.getElementById("calc-scroll"),
        ctLabel: document.getElementById("ct-label"),
        ctVal: document.getElementById("ct-val"),
        fxModal: document.getElementById("formula-modal"),
        fxBody: document.getElementById("fx-body"),
        fxClose: document.getElementById("fx-close"),
      };
      if (!els.canvas) return;
      els.modeBtns = Array.prototype.slice.call(document.querySelectorAll("[data-mode]"));
      this.mounted = true;

      els.modeBtns.forEach((b) => b.addEventListener("click", () => setMode(b.dataset.mode)));
      els.clearBtn.addEventListener("click", clearAll);
      els.selDelete.addEventListener("click", deleteSelected);
      els.fxClose.addEventListener("click", closeModal);
      els.fxModal.addEventListener("click", (e) => { if (e.target === els.fxModal) closeModal(); });
      els.canvas.addEventListener("pointerdown", (e) => { if (e.target === els.canvas) selectShape(null); });
      window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") { if (!els.fxModal.classList.contains("hidden")) closeModal(); else selectShape(null); }
        if ((e.key === "Delete" || e.key === "Backspace") && state.selected != null &&
            els.fxModal.classList.contains("hidden")) { e.preventDefault(); deleteSelected(); }
      });

      // seed each mode with a couple of shapes so the puzzle isn't empty on first open
      addShape("square", 170, 250); addShape("triangle", 420, 240);
      state.mode = "3d"; addShape("cuboid", 180, 250); addShape("cylinder", 430, 240); state.mode = "2d";
      state.selected = null;

      renderPalette(); renderAll();
    },
    show() { this.mount(); },
  };
  window.AVGame = Game;
})();
