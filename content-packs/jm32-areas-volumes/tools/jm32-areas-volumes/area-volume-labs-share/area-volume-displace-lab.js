/* JM32 — teacher-paced water displacement lab (Q21). */
(function () {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";
  const WATER = "#0277BD";
  const WATER_PALE = "#BBDEFB";
  const WATER_BODY = "#90CAF9";
  const WATER_DEEP = "#1E88E5";
  const STONE = "#607D8B";
  const STONE_FILL = "#90A4AE";
  const NEW_STONE = "#E67E22";
  const NEW_FILL = "#FFB74D";
  const RISE = "#F9A825";
  const RISE_PALE = "#FFE082";
  const RISE_BODY = "#FFD54F";
  const RISE_DEEP = "#FFB300";
  const CUP = "#5D8AA8";
  const GREEN = "#2E7D32";
  const GREEN_TEX = "#2E7D32";
  const INK = "#372F2A";
  const DIM = "#70665E";

  const STEPS = [
    "Set the values",
    "Read the problem",
    "Immerse the stones",
    "Find original level h",
    "Check overflow",
    "Review quiz",
  ];

  function E(tag, attrs) {
    const el = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach((key) => el.setAttribute(key, attrs[key]));
    return el;
  }

  function clear(el) {
    while (el && el.firstChild) el.removeChild(el.firstChild);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function ease(value) {
    const t = clamp(value, 0, 1);
    return t * t * (3 - 2 * t);
  }

  function fmt(value) {
    if (!Number.isFinite(value)) return "?";
    if (Math.abs(value - Math.round(value)) < 1e-7) return String(Math.round(value));
    const t = Math.round(value * 1000) / 1000;
    return String(t);
  }

  function tc(colour, latex) {
    return "\\textcolor{" + colour + "}{" + latex + "}";
  }

  function km(el, latex, display) {
    try {
      katex.render(latex, el, { throwOnError: false, displayMode: !!display });
    } catch (error) {
      el.textContent = latex;
    }
  }

  function prose(container, parts) {
    const line = document.createElement("p");
    line.className = "recast-prose";
    parts.forEach((part) => {
      if (part.math) {
        const span = document.createElement("span");
        span.className = "recast-math";
        km(span, part.math);
        line.appendChild(span);
      } else {
        line.appendChild(document.createTextNode(part.text || ""));
      }
    });
    container.appendChild(line);
    return line;
  }

  function equation(container, latex) {
    const line = document.createElement("div");
    line.className = "recast-eq";
    km(line, latex, true);
    container.appendChild(line);
    return line;
  }

  function svgText(parent, x, y, text, attrs) {
    const el = E("text", Object.assign({
      x, y, fill: INK, "font-size": 14, "font-family": "Inter, Arial, sans-serif",
      "text-anchor": "middle",
    }, attrs || {}));
    el.textContent = text;
    parent.appendChild(el);
    return el;
  }

  function svgMath(parent, x, y, latex, options) {
    const opts = options || {};
    const width = opts.width || 100;
    const height = opts.height || 30;
    const fo = E("foreignObject", {
      x: x - width / 2, y: y - height / 2, width, height, overflow: "visible",
    });
    const div = document.createElement("div");
    div.style.cssText = [
      "width:" + width + "px",
      "height:" + height + "px",
      "display:flex",
      "align-items:center",
      "justify-content:center",
      "font-size:" + (opts.size || 15) + "px",
      "font-weight:" + (opts.weight || "600"),
      "white-space:nowrap",
      "color:" + (opts.colour || INK),
    ].join(";");
    km(div, latex);
    fo.appendChild(div);
    parent.appendChild(fo);
    return fo;
  }

  function drawSphere(parent, x, y, radius, strokeColour, opacity, fillColour) {
    const group = E("g", {});
    const fc = fillColour || strokeColour;
    group.appendChild(E("circle", {
      cx: x, cy: y, r: radius, fill: fc, "fill-opacity": opacity == null ? 0.42 : opacity,
      stroke: strokeColour, "stroke-width": 2.1,
    }));
    group.appendChild(E("ellipse", {
      cx: x, cy: y, rx: radius, ry: radius * 0.27, fill: "none", stroke: strokeColour,
      "stroke-width": 1.4, opacity: 0.75,
    }));
    group.appendChild(E("ellipse", {
      cx: x - radius * 0.27, cy: y - radius * 0.32, rx: radius * 0.2, ry: radius * 0.1,
      fill: "#fff", opacity: 0.34, transform: "rotate(-28 " + x + " " + y + ")",
    }));
    parent.appendChild(group);
    return group;
  }

  function yAt(baseY, cm, px) {
    return baseY - cm * px;
  }

  function scaleFor(H) {
    return 248 / Math.max(H, 8);
  }

  function cupGeom(cx, baseY, R, H, px) {
    const rx = R * px;
    const ry = Math.max(10, rx * 0.28);
    return { cx, baseY, rx, ry, topY: yAt(baseY, H, px), px, R, H };
  }

  function drawCup(parent, cx, baseY, R, H, waterH, px, opts) {
    opts = opts || {};
    const g = cupGeom(cx, baseY, R, H, px);
    const { rx, ry, topY } = g;
    const wH = clamp(waterH, 0, H);
    const waterY = yAt(baseY, wH, px);
    const showWater = wH > 0.08;

    if (showWater) {
      parent.appendChild(E("path", {
        d: "M " + (cx - rx) + " " + waterY +
          " A " + rx + " " + ry + " 0 0 1 " + (cx + rx) + " " + waterY +
          " L " + (cx + rx) + " " + baseY +
          " A " + rx + " " + ry + " 0 0 0 " + (cx - rx) + " " + baseY + " Z",
        fill: WATER_BODY,
      }));
      parent.appendChild(E("ellipse", {
        cx, cy: baseY, rx, ry, fill: WATER_DEEP, stroke: WATER, "stroke-width": 1.8,
      }));
      parent.appendChild(E("ellipse", {
        cx, cy: waterY, rx, ry, fill: WATER_PALE, stroke: WATER, "stroke-width": 1.8,
      }));
    } else {
      parent.appendChild(E("ellipse", {
        cx, cy: baseY, rx, ry, fill: "none", stroke: CUP, "stroke-width": 2.2,
      }));
    }

    if (opts.highlightFrom != null && opts.highlightTo != null && opts.highlightTo > opts.highlightFrom + 0.05) {
      const yTop = yAt(baseY, opts.highlightTo, px);
      const yBot = yAt(baseY, opts.highlightFrom, px);
      parent.appendChild(E("path", {
        d: "M " + (cx - rx) + " " + yTop +
          " A " + rx + " " + ry + " 0 0 1 " + (cx + rx) + " " + yTop +
          " L " + (cx + rx) + " " + yBot +
          " A " + rx + " " + ry + " 0 0 0 " + (cx - rx) + " " + yBot + " Z",
        fill: RISE_BODY,
      }));
      parent.appendChild(E("ellipse", {
        cx, cy: yBot, rx, ry, fill: RISE_DEEP, stroke: RISE, "stroke-width": 1.7,
      }));
      parent.appendChild(E("ellipse", {
        cx, cy: yTop, rx, ry, fill: RISE_PALE, stroke: RISE, "stroke-width": 1.7,
      }));
    }

    parent.appendChild(E("line", {
      x1: cx - rx, y1: topY, x2: cx - rx, y2: baseY, stroke: CUP, "stroke-width": 2.6, "stroke-linecap": "round",
    }));
    parent.appendChild(E("line", {
      x1: cx + rx, y1: topY, x2: cx + rx, y2: baseY, stroke: CUP, "stroke-width": 2.6, "stroke-linecap": "round",
    }));
    parent.appendChild(E("ellipse", {
      cx, cy: baseY, rx, ry, fill: "none", stroke: CUP, "stroke-width": 2.3,
    }));
    parent.appendChild(E("ellipse", {
      cx, cy: topY, rx, ry, fill: "#ffffff", "fill-opacity": 0.55, stroke: CUP, "stroke-width": 2.8,
    }));

    if (opts.overflow) {
      for (let i = -1; i <= 1; i++) {
        const dx = i * 16;
        parent.appendChild(E("path", {
          d: "M " + (cx + rx * 0.55 + dx) + " " + (topY + 8) +
            " Q " + (cx + rx * 0.7 + dx) + " " + (topY + 22) +
            " " + (cx + rx * 0.62 + dx) + " " + (topY + 36),
          fill: "none", stroke: WATER, "stroke-width": 3.2, "stroke-linecap": "round", opacity: 0.85,
        }));
      }
    }
    return g;
  }

  function dimLine(parent, x, y1, y2, label, colour, opts) {
    opts = opts || {};
    const col = colour || DIM;
    const side = opts.side === "left" ? "left" : "right";
    const gap = opts.gap == null ? 58 : opts.gap;
    parent.appendChild(E("line", {
      x1: x, y1, x2: x, y2, stroke: col, "stroke-width": 1.6,
    }));
    parent.appendChild(E("line", {
      x1: x - 6, y1, x2: x + 6, y2: y1, stroke: col, "stroke-width": 1.6,
    }));
    parent.appendChild(E("line", {
      x1: x - 6, y1: y2, x2: x + 6, y2, stroke: col, "stroke-width": 1.6,
    }));
    if (!opts.noLabel && label) {
      svgMath(parent, side === "left" ? x - gap : x + gap, (y1 + y2) / 2, label, {
        size: opts.size || 14, width: opts.width || 120, height: 28, colour: col,
      });
    }
  }

  function leader(parent, fx, fy, tx, ty, latex, colour, width) {
    const col = colour || DIM;
    const w = width || 110;
    const boxH = 28;
    const dx = tx - fx;
    const dy = ty - fy;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const pad = Math.abs(ux) >= Math.abs(uy) ? w / 2 + 6 : boxH / 2 + 8;
    parent.appendChild(E("line", {
      x1: fx, y1: fy, x2: tx - ux * pad, y2: ty - uy * pad,
      stroke: col, "stroke-width": 1.5,
    }));
    parent.appendChild(E("circle", { cx: fx, cy: fy, r: 2.6, fill: col }));
    svgMath(parent, tx, ty, latex, {
      size: 15, width: w, height: boxH, colour: col,
    });
  }

  function labelBaseR(parent, g, valueCm, colour) {
    const col = colour || CUP;
    leader(parent, g.cx, g.baseY + g.ry * 0.15, g.cx, g.baseY + g.ry + 46,
      tc(col, "R=" + fmt(valueCm) + "\\text{ cm}"), col, 140);
  }

  function labelHUnknown(parent, g, hCm, px) {
    const yWater = yAt(g.baseY, hCm, px);
    const barX = Math.max(36, g.cx - g.rx - 12);
    dimLine(parent, barX, yWater, g.baseY, tc(WATER, "h"), WATER, {
      side: "left", gap: 20, width: 44, size: 16,
    });
  }

  function labelHKnown(parent, g, hCm, px) {
    const yWater = yAt(g.baseY, hCm, px);
    dimLine(parent, g.cx - g.rx - 32, yWater, g.baseY, tc(GREEN, "h=" + fmt(hCm) + "\\text{ cm}"), GREEN, {
      side: "left", gap: 72, width: 130,
    });
  }

  function arrow(parent, x1, y1, x2, y2, colour) {
    const col = colour || DIM;
    parent.appendChild(E("line", {
      x1, y1, x2, y2, stroke: col, "stroke-width": 2.4, "stroke-linecap": "round",
    }));
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const a = 0.45;
    const len = 11;
    parent.appendChild(E("path", {
      d: "M " + (x2 - len * Math.cos(ang - a)) + " " + (y2 - len * Math.sin(ang - a)) +
        " L " + x2 + " " + y2 +
        " L " + (x2 - len * Math.cos(ang + a)) + " " + (y2 - len * Math.sin(ang + a)),
      fill: "none", stroke: col, "stroke-width": 2.4, "stroke-linecap": "round", "stroke-linejoin": "round",
    }));
  }

  function stoneSlots(n, cx, baseY, rPx) {
    const slots = [];
    if (n <= 0) return slots;
    if (n === 1) {
      slots.push({ x: cx, y: baseY - rPx });
    } else if (n === 2) {
      slots.push({ x: cx - rPx, y: baseY - rPx });
      slots.push({ x: cx + rPx, y: baseY - rPx });
    } else {
      slots.push({ x: cx - rPx, y: baseY - rPx });
      slots.push({ x: cx + rPx, y: baseY - rPx });
      slots.push({ x: cx, y: baseY - rPx - rPx * Math.sqrt(3) });
    }
    return slots;
  }

  function labelLiveWater(parent, g, waterH, px) {
    const y = yAt(g.baseY, waterH, px);
    dimLine(parent, g.cx - g.rx - 32, y, g.baseY, tc(WATER, fmt(waterH) + "\\text{ cm}"), WATER, {
      side: "left", gap: 70, width: 120,
    });
  }

  function derived(ctx) {
    const R = ctx.R;
    const H = ctx.H;
    const r = ctx.r;
    const n = ctx.n;
    const H2 = ctx.H2;
    const Rnew = ctx.Rnew;
    const stoneVolCoef = n * (4 / 3) * r * r * r;
    const oneStoneCoef = (4 / 3) * r * r * r;
    const rise = stoneVolCoef / (R * R);
    const h = H2 - rise;
    const waterVolCoef = R * R * h;
    const newStoneCoef = (4 / 3) * Rnew * Rnew * Rnew;
    const totalAfter = waterVolCoef + newStoneCoef;
    const capacity = R * R * H;
    const newLevel = totalAfter / (R * R);
    const overflows = totalAfter > capacity + 1e-9;
    return {
      stoneVolCoef, oneStoneCoef, rise, h, waterVolCoef, newStoneCoef, totalAfter, capacity, newLevel, overflows,
    };
  }

  /* ───────────────── Step diagrams ───────────────── */

  function drawSetup(svg, ctx) {
    clear(svg);
    const d = derived(ctx);
    const px = scaleFor(ctx.H);
    const cx = 250;
    const baseY = 430;
    const g = drawCup(svg, cx, baseY, ctx.R, ctx.H, d.h, px);
    dimLine(svg, cx + g.rx + 28, g.topY, baseY, tc(CUP, "H=" + fmt(ctx.H) + "\\text{ cm}"), CUP);
    labelBaseR(svg, g, ctx.R, CUP);
    labelHUnknown(svg, g, d.h, px);

    const sampleX = 560;
    const sampleY = 250;
    const sampleR = ctx.r * px;
    drawSphere(svg, sampleX, sampleY, sampleR, STONE, 0.42, STONE_FILL);
    leader(svg, sampleX, sampleY + sampleR, sampleX, sampleY + sampleR + 50,
      tc(STONE, "r=" + fmt(ctx.r) + "\\text{ cm}"), STONE, 120);
    svgText(svg, sampleX, sampleY + sampleR + 78, "stone sample", {
      fill: DIM, "font-size": 13, "font-weight": 700,
    });
  }

  function drawProblem(svg, ctx, t) {
    clear(svg);
    const p = ease(t == null ? 1 : t);
    const d = derived(ctx);
    const px = scaleFor(ctx.H) * 0.92;
    const baseY = 430;
    const left = 150;
    const right = 515;

    const gL = drawCup(svg, left, baseY, ctx.R, ctx.H, d.h, px);
    labelBaseR(svg, gL, ctx.R, CUP);
    dimLine(svg, left + gL.rx + 22, gL.topY, baseY, tc(CUP, "H=" + fmt(ctx.H) + "\\text{ cm}"), CUP, {
      gap: 48, width: 92,
    });
    labelHUnknown(svg, gL, d.h, px);

    const arrowY = (gL.topY + baseY) / 2;
    const ax1 = left + gL.rx + 124;
    const ax2 = right - gL.rx - 10;
    svg.appendChild(E("line", {
      x1: ax1, y1: arrowY, x2: ax1 + (ax2 - ax1) * p, y2: arrowY,
      stroke: DIM, "stroke-width": 2.8, "stroke-linecap": "round",
    }));
    if (p > 0.75) {
      svg.appendChild(E("path", {
        d: "M " + (ax2 - 11) + " " + (arrowY - 8) + " L " + ax2 + " " + arrowY +
          " L " + (ax2 - 11) + " " + (arrowY + 8),
        fill: "none", stroke: DIM, "stroke-width": 2.8, "stroke-linecap": "round", "stroke-linejoin": "round",
      }));
    }

    if (p > 0.28) {
      const q = ease((p - 0.28) / 0.72);
      const grp = E("g", { opacity: String(q) });
      svg.appendChild(grp);
      const gR = drawCup(grp, right, baseY, ctx.R, ctx.H, ctx.H2, px);
      dimLine(grp, right + gR.rx + 20, yAt(baseY, ctx.H2, px), baseY, tc(WATER, fmt(ctx.H2) + "\\text{ cm}"), WATER, {
        gap: 48, width: 80,
      });
      const slots = stoneSlots(ctx.n, right, baseY, ctx.r * px);
      slots.forEach((s) => drawSphere(grp, s.x, s.y, ctx.r * px, STONE, 0.42, STONE_FILL));
      if (slots[0]) {
        leader(grp, slots[0].x, slots[0].y + ctx.r * px, slots[0].x, gR.baseY + gR.ry + 46,
          tc(STONE, "r=" + fmt(ctx.r) + "\\text{ cm}"), STONE, 120);
      }
    }
  }

  function drawImmerse(svg, ctx, settled, dropT) {
    clear(svg);
    const d = derived(ctx);
    const px = scaleFor(ctx.H);
    const cx = 300;
    const baseY = 430;
    const rPx = ctx.r * px;
    const slots = stoneSlots(ctx.n, cx, baseY, rPx);
    const n = ctx.n;
    const gProbe = cupGeom(cx, baseY, ctx.R, ctx.H, px);
    const startY = gProbe.topY - rPx - 16;
    const drop = ease(dropT == null ? 0 : dropT);
    const falling = settled < n && dropT > 0;
    const waterFrac = (settled + (falling ? drop : 0)) / Math.max(n, 1);
    const waterNow = d.h + d.rise * waterFrac;

    const g = drawCup(svg, cx, baseY, ctx.R, ctx.H, waterNow, px, {
      highlightFrom: d.h,
      highlightTo: waterNow,
    });
    dimLine(svg, cx + g.rx + 92, g.topY, baseY, tc(CUP, "H=" + fmt(ctx.H) + "\\text{ cm}"), CUP);
    labelHUnknown(svg, g, d.h, px);
    if (waterNow > d.h + 0.05) {
      dimLine(svg, cx + g.rx + 24, yAt(baseY, waterNow, px), yAt(baseY, d.h, px), tc(RISE, "\\Delta h"), RISE, {
        side: "right", gap: 36, width: 70,
      });
    }

    for (let i = 0; i < settled && i < slots.length; i++) {
      drawSphere(svg, slots[i].x, slots[i].y, rPx, STONE, 0.42, STONE_FILL);
    }
    if (falling && slots[settled]) {
      const y = startY + (slots[settled].y - startY) * drop;
      drawSphere(svg, slots[settled].x, y, rPx, STONE, 0.42, STONE_FILL);
    } else if (settled < n && slots[settled] && !(dropT > 0)) {
      drawSphere(svg, slots[settled].x, startY, rPx, STONE, 0.42, STONE_FILL);
    }

    let tip = null;
    if (falling && slots[settled]) {
      tip = { x: slots[settled].x, y: startY + (slots[settled].y - startY) * drop };
    } else if (settled < n && slots[settled]) {
      tip = { x: slots[settled].x, y: startY };
    }
    if (settled >= n && slots[0]) {
      leader(svg, slots[0].x, slots[0].y + rPx, slots[0].x, g.baseY + g.ry + 46,
        tc(STONE, "r=" + fmt(ctx.r) + "\\text{ cm}"), STONE, 120);
    } else if (tip) {
      leader(svg, tip.x + rPx * 0.4, tip.y, tip.x + rPx + 88, tip.y - 8,
        tc(STONE, "r=" + fmt(ctx.r) + "\\text{ cm}"), STONE, 120);
    }

    svgText(svg, 40, 32, settled + " / " + n + " immersed", {
      fill: settled >= n ? GREEN : INK, "font-size": 15, "font-weight": 700, "text-anchor": "start",
    });
  }

  function drawFindH(svg, ctx, showH) {
    clear(svg);
    const d = derived(ctx);
    const px = scaleFor(ctx.H);
    const baseY = 430;
    const cupX = 250;

    const g = drawCup(svg, cupX, baseY, ctx.R, ctx.H, ctx.H2, px, {
      highlightFrom: d.h,
      highlightTo: ctx.H2,
    });
    const slots = stoneSlots(ctx.n, cupX, baseY, ctx.r * px);
    slots.forEach((s) => drawSphere(svg, s.x, s.y, ctx.r * px, STONE, 0.42, STONE_FILL));

    const yH2 = yAt(baseY, ctx.H2, px);
    const yH = yAt(baseY, d.h, px);
    const leftBar = cupX - g.rx - 30;
    dimLine(svg, leftBar, yH2, yH, tc(RISE, "\\Delta h"), RISE, {
      side: "left", gap: 32, width: 70,
    });
    if (showH) {
      dimLine(svg, leftBar, yH, baseY, tc(GREEN, "h=" + fmt(d.h) + "\\text{ cm}"), GREEN, {
        side: "left", gap: 72, width: 130,
      });
    } else {
      dimLine(svg, leftBar, yH, baseY, tc(WATER, "h"), WATER, {
        side: "left", gap: 26, width: 48,
      });
    }
    dimLine(svg, cupX + g.rx + 22, yH2, baseY, tc(WATER, fmt(ctx.H2) + "\\text{ cm}"), WATER, {
      gap: 50, width: 90,
    });

    if (slots[0]) {
      leader(svg, slots[0].x, slots[0].y + ctx.r * px, slots[0].x, baseY + g.ry + 46,
        tc(STONE, "r=" + fmt(ctx.r) + "\\text{ cm}"), STONE, 120);
    }

    arrow(svg, cupX + g.rx * 0.35, yH2, cupX + g.rx + 88, yH2 - 46, RISE);
    svgText(svg, cupX + g.rx + 168, yH2 - 58, "volume of stones", {
      fill: DIM, "font-size": 17, "font-weight": 700,
    });
    svgText(svg, cupX + g.rx + 168, yH2 - 34, "= volume of the rise", {
      fill: DIM, "font-size": 17, "font-weight": 700,
    });
  }

  function drawReplace(svg, ctx, t, showAnswer) {
    clear(svg);
    const d = derived(ctx);
    const px = scaleFor(ctx.H);
    const cx = 290;
    const baseY = 430;
    const rPx = ctx.r * px;
    const RnewPx = ctx.Rnew * px;
    const slots = stoneSlots(ctx.n, cx, baseY, rPx);
    const topY = yAt(baseY, ctx.H, px);

    let waterNow = ctx.H2;
    let drawOld = true;
    let oldLift = 0;
    let newY = topY - 52;
    let newVisible = false;
    let overflow = false;

    if (t < 0.32) {
      const p = ease(t / 0.32);
      oldLift = p * 70;
      waterNow = ctx.H2 - d.rise * p;
    } else if (t < 0.42) {
      drawOld = false;
      waterNow = d.h;
    } else {
      drawOld = false;
      const p = ease((t - 0.42) / 0.58);
      newVisible = true;
      const restY = baseY - RnewPx;
      newY = (topY - 52) + (restY - (topY - 52)) * p;
      const inFrac = clamp((p - 0.2) / 0.8, 0, 1);
      const target = Math.min(d.newLevel, ctx.H);
      waterNow = d.h + (target - d.h) * inFrac;
      overflow = d.overflows && p > 0.85;
    }

    const g = drawCup(svg, cx, baseY, ctx.R, ctx.H, waterNow, px, { overflow });
    dimLine(svg, cx + g.rx + 28, topY, baseY, tc(CUP, "H=" + fmt(ctx.H) + "\\text{ cm}"), CUP);
    labelLiveWater(svg, g, waterNow, px);

    if (drawOld) {
      slots.forEach((s) => drawSphere(svg, s.x, s.y - oldLift, rPx, STONE, 0.42, STONE_FILL));
      if (slots[0]) {
        leader(svg, slots[0].x, slots[0].y - oldLift + rPx, slots[0].x, g.baseY + g.ry + 46,
          tc(STONE, "r=" + fmt(ctx.r) + "\\text{ cm}"), STONE, 120);
      }
    }
    if (newVisible) {
      drawSphere(svg, cx, newY, RnewPx, NEW_STONE, 0.4, NEW_FILL);
      const fx = cx - RnewPx * 0.3;
      const fy = newY + RnewPx * 0.15;
      const tx0 = cx - RnewPx - 70;
      const ty0 = newY + RnewPx + 36;
      leader(svg, fx, fy,
        Math.max(48, fx + 1.5 * (tx0 - fx)),
        Math.min(505, fy + 1.5 * (ty0 - fy)),
        tc(NEW_STONE, "R=" + fmt(ctx.Rnew) + "\\text{ cm}"), NEW_STONE, 140);
    }
  }

  function drawReview(svg, ctx) {
    clear(svg);
    const d = derived(ctx);
    const px = scaleFor(ctx.H) * 0.55;
    const baseY = 445;
    const left = 172;
    const mid = 348;
    const right = 540;

    const g0 = drawCup(svg, left, baseY, ctx.R, ctx.H, d.h, px);
    svgText(svg, left, g0.topY - 22, "original", {
      fill: DIM, "font-size": 12, "font-weight": 700,
    });
    dimLine(svg, left - g0.rx - 14, yAt(baseY, d.h, px), baseY, tc(GREEN, "h=" + fmt(d.h) + "\\text{ cm}"), GREEN, {
      side: "left", gap: 50, width: 100, size: 13,
    });

    const g1 = drawCup(svg, mid, baseY, ctx.R, ctx.H, ctx.H2, px, {
      highlightFrom: d.h,
      highlightTo: ctx.H2,
    });
    const slots = stoneSlots(ctx.n, mid, baseY, ctx.r * px);
    slots.forEach((s) => {
      drawSphere(svg, s.x, s.y, ctx.r * px, STONE, 0.42, STONE_FILL);
    });
    const yH2 = yAt(baseY, ctx.H2, px);
    dimLine(svg, mid - g1.rx - 14, yH2, yAt(baseY, d.h, px), tc(RISE, "\\Delta h"), RISE, {
      side: "left", gap: 26, width: 56, size: 13,
    });
    dimLine(svg, mid + g1.rx + 6, yH2, baseY, "", WATER, { noLabel: true });
    if (slots[0]) {
      leader(svg, slots[0].x, slots[0].y + ctx.r * px, slots[0].x, baseY + g1.ry + 42,
        tc(STONE, "r=" + fmt(ctx.r) + "\\text{ cm}"), STONE, 100);
    }

    const newLevel = Math.min(d.newLevel, ctx.H);
    const g2 = drawCup(svg, right, baseY, ctx.R, ctx.H, newLevel, px, { overflow: d.overflows });
    drawSphere(svg, right, baseY - ctx.Rnew * px, ctx.Rnew * px, NEW_STONE, 0.4, NEW_FILL);
    leader(svg, right, baseY, right, baseY + g2.ry + 42,
      tc(NEW_STONE, "R=" + fmt(ctx.Rnew) + "\\text{ cm}"), NEW_STONE, 120);
    dimLine(svg, right + g2.rx + 14, yAt(baseY, newLevel, px), baseY,
      tc(d.overflows ? "#C62828" : NEW_STONE, d.overflows ? "\\text{overflows}" : "h'=" + fmt(d.newLevel) + "\\text{ cm}"),
      d.overflows ? "#C62828" : NEW_STONE, { gap: 54, width: 108, size: 13 });

    const ay = (g0.topY + baseY) / 2;
    const iBarX = mid + g1.rx + 6;
    const cupGap = 12;
    const arrow2X1 = mid + g1.rx + cupGap;
    const arrow2X2 = right - g2.rx - cupGap;
    svgMath(svg, iBarX + 22, ay - 20, tc(WATER, fmt(ctx.H2) + "\\text{ cm}"), {
      size: 14, width: 80, height: 26,
    });
    arrow(svg, left + g0.rx + cupGap, ay, mid - g1.rx - cupGap, ay, DIM);
    arrow(svg, arrow2X1, ay, arrow2X2, ay, DIM);
  }

  /* ───────────────── Notecard ───────────────── */

  function addRevealPrompt(cardBody, revealedCount, totalLines) {
    if (revealedCount < totalLines) {
      const promptBtn = document.createElement("div");
      promptBtn.className = "recast-reveal-prompt";
      promptBtn.innerHTML = "<span>Click card to reveal next step</span> <span>(" + revealedCount + " / " + totalLines + ")</span>";
      cardBody.appendChild(promptBtn);
    } else {
      const doneNote = document.createElement("div");
      doneNote.className = "recast-reveal-done";
      doneNote.textContent = "All calculation steps revealed";
      cardBody.appendChild(doneNote);
    }
  }

  function buildNotecardBody(step, ctx, cardBody, revealedCount) {
    const d = derived(ctx);
    const R = fmt(ctx.R);
    const H = fmt(ctx.H);
    const r = fmt(ctx.r);
    const n = ctx.n;
    const H2 = fmt(ctx.H2);
    const h = fmt(d.h);
    const Rnew = fmt(ctx.Rnew);
    const rise = fmt(d.rise);
    const stoneCoef = fmt(d.stoneVolCoef);
    const waterCoef = fmt(d.waterVolCoef);
    const newCoef = fmt(d.newStoneCoef);
    const total = fmt(d.totalAfter);
    const cap = fmt(d.capacity);
    const r3 = fmt(ctx.r * ctx.r * ctx.r);
    const Rnew3 = fmt(ctx.Rnew * ctx.Rnew * ctx.Rnew);
    const R2 = fmt(ctx.R * ctx.R);

    if (step === 0) {
      prose(cardBody, [
        { text: "Choose the cup and the stones. The rise in water level is the volume of the immersed object divided by the base area of the cup." },
      ]);
      const inputs = document.createElement("div");
      inputs.className = "recast-card-inputs";
      inputs.innerHTML =
        '<label class="recast-setup-field"><span>Cup radius <em>R</em></span>' +
        '<span class="recast-value-box"><input type="number" id="disp-R" min="5" max="8" step="1" value="' + ctx.R + '"><span class="recast-unit">cm</span></span></label>' +
        '<label class="recast-setup-field"><span>Cup height <em>H</em></span>' +
        '<span class="recast-value-box"><input type="number" id="disp-H" min="14" max="18" step="1" value="' + ctx.H + '"><span class="recast-unit">cm</span></span></label>' +
        '<label class="recast-setup-field"><span>Stone radius <em>r</em></span>' +
        '<span class="recast-value-box"><input type="number" id="disp-r" min="2" max="3.5" step="0.5" value="' + ctx.r + '"><span class="recast-unit">cm</span></span></label>' +
        '<label class="recast-setup-field"><span>Number of stones <em>n</em></span>' +
        '<span class="recast-value-box"><input type="number" id="disp-n" min="1" max="3" step="1" value="' + ctx.n + '"></span></label>' +
        '<label class="recast-setup-field"><span>Water after immersing</span>' +
        '<span class="recast-value-box"><input type="number" id="disp-H2" min="10" max="17" step="0.5" value="' + ctx.H2 + '"><span class="recast-unit">cm</span></span></label>' +
        '<label class="recast-setup-field"><span>New stone radius</span>' +
        '<span class="recast-value-box"><input type="number" id="disp-Rnew" min="3" max="5.5" step="0.5" value="' + ctx.Rnew + '"><span class="recast-unit">cm</span></span></label>' +
        '<p class="recast-range-note">Ranges keep the stones inside the cup with a visible water level. Defaults match Q21.</p>';
      cardBody.appendChild(inputs);
      return;
    }

    if (step === 1) {
      prose(cardBody, [
        { text: "A right cylindrical cup of base radius " },
        { math: tc(CUP, R) },
        { text: " cm and height " },
        { math: tc(CUP, H) },
        { text: " cm contains some water." },
      ]);
      prose(cardBody, [
        { text: "When " },
        { math: tc(STONE, String(n)) },
        { text: " spherical stones of radius " },
        { math: tc(STONE, r) },
        { text: " cm each are immersed, the water level rises to " },
        { math: tc(WATER, H2) },
        { text: " cm." },
      ]);
      prose(cardBody, [{ text: "Find (a) the original water level;" }]);
      prose(cardBody, [
        { text: "Find (b) whether the water overflows if the stones are replaced by one sphere of radius " },
        { math: tc(NEW_STONE, Rnew) },
        { text: " cm." },
      ]);
      return;
    }

    if (step === 2) {
      prose(cardBody, [
        { text: "Each stone pushes its own volume of water aside. In a cylindrical cup that extra volume can only go up, so the water level rises." },
      ]);
      prose(cardBody, [{ text: "Volume of the rise = total volume of the immersed stones:" }]);
      equation(cardBody, "\\pi R^2 \\Delta h = n \\times \\tfrac{4}{3}\\pi r^3");
      prose(cardBody, [
        { text: "So the rise " },
        { math: "\\Delta h" },
        { text: " varies with the volume of the object, and is smaller if the cup is wider." },
      ]);
      return;
    }

    if (step === 3) {
      const totalLines = 6;
      const block = document.createElement("div");
      block.className = "calc-line-block";

      const line1 = document.createElement("div");
      line1.className = "calc-line" + (revealedCount >= 1 ? " revealed" : "");
      prose(line1, [{ text: "Let " }, { math: "h" }, { text: " cm be the original water level." }]);
      block.appendChild(line1);

      const line2 = document.createElement("div");
      line2.className = "calc-line" + (revealedCount >= 2 ? " revealed" : "");
      prose(line2, [{ text: "Volume of the stones = volume of water that has risen:" }]);
      equation(line2, n + " \\times \\left(\\tfrac{4}{3}\\pi r^3\\right) = \\pi R^2(" + H2 + " - h)");
      block.appendChild(line2);

      const line3 = document.createElement("div");
      line3.className = "calc-line" + (revealedCount >= 3 ? " revealed" : "");
      prose(line3, [{ text: "Substitute " }, { math: "r=" + r }, { text: " and " }, { math: "R=" + R }, { text: ":" }]);
      equation(line3, n + " \\times \\left(\\tfrac{4}{3}\\pi \\times " + r3 + "\\right) = \\pi \\times " + R2 + "(" + H2 + " - h)");
      block.appendChild(line3);

      const line4 = document.createElement("div");
      line4.className = "calc-line" + (revealedCount >= 4 ? " revealed" : "");
      prose(line4, [{ text: "Divide both sides by " }, { math: "\\pi" }, { text: ":" }]);
      equation(line4, stoneCoef + " = " + R2 + "(" + H2 + " - h)");
      block.appendChild(line4);

      const line5 = document.createElement("div");
      line5.className = "calc-line" + (revealedCount >= 5 ? " revealed" : "");
      equation(line5, H2 + " - h = " + rise);
      block.appendChild(line5);

      const line6 = document.createElement("div");
      line6.className = "calc-line" + (revealedCount >= 6 ? " revealed" : "");
      equation(line6, "\\therefore h = " + tc(GREEN_TEX, h) + "\\text{ cm}");
      block.appendChild(line6);

      cardBody.appendChild(block);
      addRevealPrompt(cardBody, revealedCount, totalLines);
      return;
    }

    if (step === 4) {
      const totalLines = 6;
      const block = document.createElement("div");
      block.className = "calc-line-block";

      const line1 = document.createElement("div");
      line1.className = "calc-line" + (revealedCount >= 1 ? " revealed" : "");
      prose(line1, [{ text: "Original volume of water:" }]);
      equation(line1, "\\pi R^2 h = \\pi \\times " + R2 + " \\times " + h + " = " + waterCoef + "\\pi\\text{ cm}^3");
      block.appendChild(line1);

      const line2 = document.createElement("div");
      line2.className = "calc-line" + (revealedCount >= 2 ? " revealed" : "");
      prose(line2, [{ text: "Volume of the new stone:" }]);
      equation(line2, "\\tfrac{4}{3}\\pi (" + Rnew + ")^3 = \\tfrac{4}{3}\\pi \\times " + Rnew3 + " = " + newCoef + "\\pi\\text{ cm}^3");
      block.appendChild(line2);

      const line3 = document.createElement("div");
      line3.className = "calc-line" + (revealedCount >= 3 ? " revealed" : "");
      prose(line3, [{ text: "Total volume of water and the new stone:" }]);
      equation(line3, waterCoef + "\\pi + " + newCoef + "\\pi = " + total + "\\pi\\text{ cm}^3");
      block.appendChild(line3);

      const line4 = document.createElement("div");
      line4.className = "calc-line" + (revealedCount >= 4 ? " revealed" : "");
      prose(line4, [{ text: "Capacity of the cup:" }]);
      equation(line4, "\\pi R^2 H = \\pi \\times " + R2 + " \\times " + H + " = " + cap + "\\pi\\text{ cm}^3");
      block.appendChild(line4);

      const line5 = document.createElement("div");
      line5.className = "calc-line" + (revealedCount >= 5 ? " revealed" : "");
      if (d.overflows) {
        equation(line5, total + "\\pi > " + cap + "\\pi");
      } else {
        equation(line5, total + "\\pi < " + cap + "\\pi");
      }
      block.appendChild(line5);

      const line6 = document.createElement("div");
      line6.className = "calc-line" + (revealedCount >= 6 ? " revealed" : "");
      if (d.overflows) {
        equation(line6, "\\therefore " + tc("#C62828", "\\text{the water overflows}"));
      } else {
        equation(line6, "\\therefore " + tc(GREEN_TEX, "\\text{the water will not overflow}"));
      }
      block.appendChild(line6);

      cardBody.appendChild(block);
      addRevealPrompt(cardBody, revealedCount, totalLines);
      return;
    }

    if (step === 5) {
      prose(cardBody, [{ text: "When an object is immersed in a cylindrical cup, what decides how much the water level rises?" }]);
      const mcWrap = document.createElement("div");
      mcWrap.className = "recast-mc";
      const options = [
        { text: "The volume of the object and the base area of the cup", ok: true },
        { text: "The surface area of the object only", ok: false },
        { text: "The height of the cup only", ok: false },
      ];
      options.forEach((opt) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "recast-choice";
        btn.textContent = opt.text;
        btn.addEventListener("click", () => {
          const fb = cardBody.querySelector("#disp-fb");
          if (opt.ok) {
            btn.classList.remove("is-wrong");
            btn.classList.add("is-correct");
            mcWrap.querySelectorAll("button").forEach((b) => {
              b.disabled = true;
              if (b !== btn) b.classList.remove("is-wrong");
            });
            if (fb) {
              fb.className = "recast-fb ok";
              fb.textContent = "Correct! Rise Δh = volume of object ÷ base area of the cup.";
            }
          } else {
            btn.classList.add("is-wrong");
            if (fb) {
              fb.className = "recast-fb bad";
              fb.textContent = "Try again. The extra water has to fit as a cylindrical slab on top, so both the object’s volume and the cup’s base area matter.";
            }
          }
        });
        mcWrap.appendChild(btn);
      });
      cardBody.appendChild(mcWrap);
      const fbP = document.createElement("p");
      fbP.id = "disp-fb";
      fbP.className = "recast-fb";
      cardBody.appendChild(fbP);
    }
  }

  function postHeight() {
    if (!/[?&]jmTools=1(?:&|$)/.test(location.search || "")) return;
    const height = Math.max(
      document.documentElement.scrollHeight || 0,
      document.body ? document.body.scrollHeight : 0,
      500
    );
    try {
      parent.postMessage({ type: "jm-tools-height", height }, "*");
    } catch (e) {}
  }

  /* ───────────────── Controller ───────────────── */

  function initDisplaceLab() {
    const shell = document.getElementById("disp-tool-shell");
    if (!shell || shell.dataset.initialized === "1") return;
    shell.dataset.initialized = "1";

    const svg = document.getElementById("disp-svg");
    const cardBox = document.getElementById("disp-card");
    const backBtn = document.getElementById("disp-back");
    const nextBtn = document.getElementById("disp-next");
    const resetBtn = document.getElementById("disp-reset");
    const progress = document.getElementById("disp-progress");
    const preview = document.getElementById("disp-vol-preview");
    const stepList = document.getElementById("disp-step-list");
    const note = document.getElementById("disp-note");
    const stage = document.getElementById("disp-stage");
    if (!svg || !cardBox || !backBtn || !nextBtn || !note) return;

    let step = 0;
    let animFrame = null;
    let isTransitioning = false;
    let stageBtnEl = null;
    let immersedCount = 0;
    const revealedLines = { 3: 0, 4: 0 };
    const ctx = { R: 6, H: 15, r: 3, n: 3, H2: 14, Rnew: 4.5 };

    function sanitize() {
      ctx.R = clamp(Math.round(+ctx.R || 6), 5, 8);
      ctx.H = clamp(Math.round(+ctx.H || 15), 14, 18);
      ctx.n = clamp(Math.round(+ctx.n || 3), 1, 3);
      const rMax = Math.min(3.5, ctx.R / 2);
      ctx.r = clamp(Math.round((+ctx.r || 3) * 2) / 2, 2, rMax);
      ctx.Rnew = clamp(Math.round((+ctx.Rnew || 4.5) * 2) / 2, 3, Math.min(5.5, ctx.R - 0.5));
      const d = derived(ctx);
      const pileH = ctx.n <= 2 ? 2 * ctx.r : ctx.r * (2 + Math.sqrt(3));
      let H2 = +ctx.H2;
      if (!Number.isFinite(H2)) H2 = 14;
      const minH2 = Math.min(ctx.H - 1, Math.max(d.rise + 2.5, pileH + 1.5));
      const maxH2 = ctx.H - 1;
      ctx.H2 = clamp(Math.round(H2 * 2) / 2, minH2, Math.max(minH2, maxH2));
    }

    function stopAnim() {
      if (animFrame != null) cancelAnimationFrame(animFrame);
      animFrame = null;
    }

    function removeStageBtn() {
      if (stageBtnEl && stageBtnEl.parentNode) stageBtnEl.parentNode.removeChild(stageBtnEl);
      stageBtnEl = null;
    }

    function updatePreview() {
      clear(preview);
      sanitize();
      const d = derived(ctx);
      prose(preview, [
        { text: "Stone volume = " },
        { math: fmt(d.stoneVolCoef) + "\\pi" },
        { text: " cm³  →  rise = " },
        { math: fmt(d.rise) },
        { text: " cm" },
      ]);
    }

    function renderStepList() {
      clear(stepList);
      STEPS.forEach((label, index) => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "recast-step-link";
        if (index === step) item.classList.add("active");
        if (index < step) item.classList.add("complete");
        item.disabled = index > step;
        item.innerHTML = '<span class="recast-step-dot">' + (index < step ? "✓" : index + 1) +
          '</span><span>' + label + "</span>";
        if (index <= step) {
          item.addEventListener("click", () => goTo(index, index < step ? -1 : 1));
        }
        stepList.appendChild(item);
      });
    }

    function updateStageOnReveal() {
      if (step === 3) drawFindH(svg, ctx, revealedLines[3] >= 6);
      /* step 4: keep small stones until "Replace with one stone" animation */
    }

    function advanceLineReveal() {
      if (step === 3 && revealedLines[3] < 6) {
        revealedLines[3]++;
        renderCard();
        updateStageOnReveal();
        postHeight();
      } else if (step === 4 && revealedLines[4] < 6) {
        revealedLines[4]++;
        renderCard();
        updateStageOnReveal();
        postHeight();
      }
    }

    function renderCard() {
      clear(cardBox);
      const card = document.createElement("article");
      const isClickable = (step === 3 && revealedLines[3] < 6) || (step === 4 && revealedLines[4] < 6);
      card.className = "step-card active recast-notecard" + (isClickable ? " clickable-card" : "");
      const head = document.createElement("header");
      head.className = "step-head";
      head.innerHTML = '<span class="step-index">' + (step + 1) +
        '</span><span class="step-title">' + STEPS[step] + "</span>";
      card.appendChild(head);
      const body = document.createElement("div");
      body.className = "step-body";
      const curRevealed = step === 3 ? revealedLines[3] : (step === 4 ? revealedLines[4] : 0);
      buildNotecardBody(step, ctx, body, curRevealed);
      card.appendChild(body);
      cardBox.appendChild(card);

      if (isClickable) {
        card.addEventListener("click", (e) => {
          if (e.target.tagName === "INPUT" || e.target.tagName === "BUTTON") return;
          advanceLineReveal();
        });
      }

      if (step === 0) {
        const ids = ["disp-R", "disp-H", "disp-r", "disp-n", "disp-H2", "disp-Rnew"];
        const keys = ["R", "H", "r", "n", "H2", "Rnew"];
        const sync = () => {
          ids.forEach((id, i) => {
            const el = card.querySelector("#" + id);
            if (el && el.value !== "") ctx[keys[i]] = +el.value;
          });
          sanitize();
          ids.forEach((id, i) => {
            const el = card.querySelector("#" + id);
            if (el) el.value = ctx[keys[i]];
          });
          updatePreview();
          drawSetup(svg, ctx);
          postHeight();
        };
        ids.forEach((id) => {
          const el = card.querySelector("#" + id);
          if (!el) return;
          el.addEventListener("change", sync);
          el.addEventListener("input", () => { if (el.value !== "") sync(); });
        });
      }
    }

    function animateDiagram(drawFn, duration, onComplete) {
      stopAnim();
      const start = performance.now();
      function frame(now) {
        const t = clamp((now - start) / duration, 0, 1);
        drawFn(t);
        if (t < 1) {
          animFrame = requestAnimationFrame(frame);
        } else {
          animFrame = null;
          if (onComplete) onComplete();
          updateNav();
        }
      }
      animFrame = requestAnimationFrame(frame);
    }

    function startImmerse() {
      if (immersedCount >= ctx.n) return;
      removeStageBtn();
      const from = immersedCount;
      animateDiagram((t) => drawImmerse(svg, ctx, from, t), 900, () => {
        immersedCount = from + 1;
        drawImmerse(svg, ctx, immersedCount, 0);
        if (immersedCount < ctx.n) {
          addStageBtn("Immerse the stones (" + (immersedCount + 1) + " / " + ctx.n + ") &rsaquo;", startImmerse);
        }
        updateNav();
      });
    }

    function startReplace() {
      removeStageBtn();
      animateDiagram((t) => drawReplace(svg, ctx, t, revealedLines[4] >= 6, revealedLines[3] >= 6), 2800, updateNav);
    }

    function addStageBtn(label, onClick) {
      removeStageBtn();
      stageBtnEl = document.createElement("button");
      stageBtnEl.type = "button";
      stageBtnEl.className = "recast-stage-btn";
      stageBtnEl.innerHTML = label;
      stageBtnEl.addEventListener("click", onClick);
      stage.appendChild(stageBtnEl);
    }

    function renderStage() {
      removeStageBtn();
      stopAnim();
      if (step === 0) {
        drawSetup(svg, ctx);
      } else if (step === 1) {
        animateDiagram((t) => drawProblem(svg, ctx, t), 900);
      } else if (step === 2) {
        drawImmerse(svg, ctx, immersedCount, 0);
        if (immersedCount < ctx.n) {
          addStageBtn("Immerse the stones (" + (immersedCount + 1) + " / " + ctx.n + ") &rsaquo;", startImmerse);
        }
      } else if (step === 3) {
        drawFindH(svg, ctx, revealedLines[3] >= 6);
      } else if (step === 4) {
        drawReplace(svg, ctx, 0, false, revealedLines[3] >= 6);
        addStageBtn("Replace with one stone &rsaquo;", startReplace);
      } else if (step === 5) {
        drawReview(svg, ctx);
      }
    }

    function updateNav() {
      backBtn.disabled = step === 0 || isTransitioning;
      nextBtn.disabled = step === STEPS.length - 1 || isTransitioning;
      progress.textContent = "Step " + (step + 1) + " / " + STEPS.length;
    }

    function render() {
      stopAnim();
      sanitize();
      updatePreview();
      renderStepList();
      renderCard();
      renderStage();
      updateNav();
      postHeight();
    }

    function goTo(target, direction) {
      if (isTransitioning || target === step || target < 0 || target >= STEPS.length) return;
      isTransitioning = true;
      stopAnim();
      removeStageBtn();
      note.classList.remove("card-flip-out-right", "card-flip-out-top", "card-enter-from-top", "card-enter-from-right");
      note.classList.add(direction >= 0 ? "card-flip-out-right" : "card-flip-out-top");
      updateNav();
      window.setTimeout(() => {
        step = target;
        if (step === 2) immersedCount = 0;
        note.classList.remove("card-flip-out-right", "card-flip-out-top");
        note.classList.add(direction >= 0 ? "card-enter-from-top" : "card-enter-from-right");
        render();
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            note.classList.remove("card-enter-from-top", "card-enter-from-right");
            isTransitioning = false;
            updateNav();
          });
        });
      }, 300);
    }

    backBtn.addEventListener("click", () => goTo(step - 1, -1));
    nextBtn.addEventListener("click", () => goTo(step + 1, 1));
    resetBtn.addEventListener("click", () => {
      stopAnim();
      removeStageBtn();
      step = 0;
      ctx.R = 6; ctx.H = 15; ctx.r = 3; ctx.n = 3; ctx.H2 = 14; ctx.Rnew = 4.5;
      revealedLines[3] = 0;
      revealedLines[4] = 0;
      immersedCount = 0;
      isTransitioning = false;
      note.className = "recast-note";
      render();
    });

    sanitize();
    render();
  }

  window.AVDisplaceLab = { init: initDisplaceLab };

  function boot() {
    if (window.katex) initDisplaceLab();
    else window.setTimeout(boot, 30);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
