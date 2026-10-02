/* JM24 Scientific notation lab */
(function () {
  "use strict";

  function ri(lo, hi) {
    return lo + Math.floor(Math.random() * (hi - lo + 1));
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = arr[i];
      arr[i] = arr[j];
      arr[j] = t;
    }
    return arr;
  }

  function renderKatexIn(el) {
    if (window.renderMathInElement && el) {
      window.renderMathInElement(el, {
        delimiters: [
          { left: "\\(", right: "\\)", display: false },
          { left: "\\[", right: "\\]", display: true },
        ],
      });
    }
  }

  /** @returns {{ mantissa: number, exp: number, value: number }} */
  function toScientific(value) {
    if (value === 0) return { mantissa: 0, exp: 0, value: 0 };
    const sign = value < 0 ? -1 : 1;
    let v = Math.abs(value);
    let exp = 0;
    while (v >= 10) {
      v /= 10;
      exp++;
    }
    while (v > 0 && v < 1) {
      v *= 10;
      exp--;
    }
    const mantissa = Math.round(sign * v * 1e9) / 1e9;
    return { mantissa: mantissa, exp: exp, value: value };
  }

  function sciValue(m, e) {
    return m * Math.pow(10, e);
  }

  function formatOrdinary(n) {
    if (Math.abs(n) >= 1e6 || (Math.abs(n) > 0 && Math.abs(n) < 0.001)) {
      return n.toExponential(4).replace("e+", " × 10^").replace("e-", " × 10^{-") + (String(n).includes("e-") ? "}" : "");
    }
    const s = String(n);
    if (s.includes("e")) return s;
    return s;
  }

  function formatOrdinaryDisplay(n) {
    if (!isFinite(n)) return String(n);
    if (n === 0) return "0";
    const abs = Math.abs(n);
    if (abs >= 1e-6 && abs < 1e12) {
      return n.toLocaleString("en-US", { maximumFractionDigits: 12 });
    }
    if (abs >= 1e-18 && abs < 1e18) {
      const extra = Math.min(18, Math.max(0, Math.ceil(-Math.log10(abs)) + 6));
      return n.toFixed(extra).replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
    }
    const parts = n.toExponential(6).split("e");
    return Number(parts[0]) + " × 10^{" + Number(parts[1]) + "}";
  }

  function sciTex(m, e) {
    const em = e < 0 ? "10^{" + e + "}" : "10^{" + e + "}";
    return m + " \\times " + em;
  }

  function nearlyEqual(a, b, relTol) {
    if (!isFinite(a) || !isFinite(b)) return false;
    if (a === b) return true;
    var scale = Math.max(Math.abs(a), Math.abs(b));
    var rel = relTol == null ? 1e-6 : relTol;
    if (scale === 0) return true;
    return Math.abs(a - b) <= rel * scale;
  }

  function parseOrdinaryInput(raw) {
    if (raw == null) return NaN;
    var s = String(raw).trim().replace(/,/g, "").replace(/\s/g, "");
    if (!s) return NaN;
    s = s.replace(/[×xX]/g, "*");
    var m = s.match(/^([+-]?\d*\.?\d+(?:e[+-]?\d+)?)\*10\^?\{?([+-]?\d+)\}?$/i);
    if (m) return Number(m[1]) * Math.pow(10, Number(m[2]));
    return Number(s);
  }

  function inStandardForm(m) {
    if (!isFinite(m)) return false;
    if (m === 0) return true;
    return Math.abs(m) >= 1 && Math.abs(m) < 10;
  }

  function normalizeSciInput(m, e) {
    if (m === 0) return { mantissa: 0, exp: 0 };
    return toScientific(sciValue(m, e));
  }

  const CONVERT_POOL = [
    { n: 102000000, hint: "large" },
    { n: 243000, hint: "large" },
    { n: 9410000000, hint: "large" },
    { n: 16.033, hint: "medium" },
    { n: 0.000504, hint: "small" },
    { n: 0.000562, hint: "small" },
    { n: 3.08e-11, hint: "small" },
    { n: 1.4e-15, hint: "small" },
  ];

  const ARITH_POOL = [
    { tex: "(4.5\\times10^{3})\\times(2\\times10^{8})", m1: 4.5, e1: 3, m2: 2, e2: 8, op: "×" },
    { tex: "4\\times10^{9}\\div(2\\times10^{2})", m1: 4, e1: 9, m2: 2, e2: 2, op: "÷" },
    { tex: "3\\times10^{9}\\div(3\\times10^{-2})", m1: 3, e1: 9, m2: 3, e2: -2, op: "÷" },
    { tex: "(2.5\\times10^{3})\\times(3\\times10^{-8})", m1: 2.5, e1: 3, m2: 3, e2: -8, op: "×" },
    { tex: "4.5\\times10^{3}\\div(2\\times10^{8})", m1: 4.5, e1: 3, m2: 2, e2: 8, op: "÷" },
    { tex: "93\\times10^{3}\\div(6\\times10^{-8})", m1: 93, e1: 3, m2: 6, e2: -8, op: "÷" },
  ];

  const SORT_SETS = [
    {
      cards: [
        { label: "\\(95\\times10^{2}\\)", m: 95, e: 2 },
        { label: "\\(0.0756\\times10^{5}\\)", m: 0.0756, e: 5 },
        { label: "\\(0.0003595\\times10^{6}\\)", m: 0.0003595, e: 6 },
        { label: "\\(95\\,320\\)", m: 95320, e: 0, raw: 95320 },
      ],
      asc: true,
    },
    {
      cards: [
        { label: "\\(0.59\\times10^{-3}\\)", m: 0.59, e: -3 },
        { label: "\\(418\\times10^{-7}\\)", m: 418, e: -7 },
        { label: "\\(0.0461\\times10^{-4}\\)", m: 0.0461, e: -4 },
        { label: "\\(0.003246\\times10^{-2}\\)", m: 0.003246, e: -2 },
      ],
      asc: false,
    },
  ];

  function cardValue(c) {
    if (c.raw != null) return c.raw;
    return sciValue(c.m, c.e);
  }

  function sortedOrder(cards, asc) {
    const vals = cards.map(cardValue).slice().sort(function (a, b) {
      return asc ? a - b : b - a;
    });
    return vals;
  }

  let shiftState = null;
  let convertIdx = 0;
  let arithIdx = 0;
  let sortSetIdx = 0;
  let sortActiveSet = 0;
  let sortSlots = [null, null, null, null];
  let sortPool = [];

  function buildDigitDisplay(container, digits, decPos) {
    container.innerHTML = "";
    const row = document.createElement("div");
    row.className = "sci-digit-row";
    digits.forEach(function (ch, i) {
      if (i === decPos) {
        const dot = document.createElement("span");
        dot.className = "sci-decimal";
        dot.textContent = ".";
        row.appendChild(dot);
      }
      const span = document.createElement("span");
      span.className = "sci-digit" + (i === decPos - 1 || (decPos === 0 && i === 0) ? " sci-digit-mantissa" : "");
      span.textContent = ch;
      row.appendChild(span);
    });
    if (decPos === digits.length) {
      const dot = document.createElement("span");
      dot.className = "sci-decimal";
      dot.textContent = ".";
      row.appendChild(dot);
    }
    container.appendChild(row);
  }

  function digitsFromNumber(n) {
    if (!isFinite(n) || n === 0) return { digits: ["0"], decPos: 1, negative: n < 0 };
    const sci = toScientific(n);
    let ms = String(Math.abs(sci.mantissa));
    if (ms.indexOf("e") >= 0) {
      ms = Math.abs(sci.mantissa).toPrecision(8);
    }
    if (ms.indexOf(".") >= 0) {
      ms = ms.replace(/0+$/, "").replace(/\.$/, "");
    }
    const parts = ms.split(".");
    let digits = (parts[0] + (parts[1] || "")).replace(/^0+/, "");
    if (!digits) digits = "0";
    digits = digits.split("");
    let decPos = (parts[0] === "0" || parts[0] === "") ? 0 : parts[0].replace(/^0+/, "").length;
    decPos += sci.exp;
    while (decPos <= 0) {
      digits.unshift("0");
      decPos++;
    }
    while (decPos > digits.length) digits.push("0");
    return { digits: digits, decPos: decPos, negative: n < 0 };
  }

  function trimDigits(digits, decPos) {
    while (digits.length > 1 && digits[0] === "0" && decPos > 1) {
      digits.shift();
      decPos--;
    }
    while (digits.length > 1 && digits[digits.length - 1] === "0" && decPos < digits.length) {
      digits.pop();
    }
    return decPos;
  }

  function digitsToNumber(digits, decPos, expShift) {
    const intPart = digits.slice(0, decPos).join("") || "0";
    const fracPart = digits.slice(decPos).join("");
    let n = Number(intPart + (fracPart ? "." + fracPart : ""));
    if (expShift !== 0) n *= Math.pow(10, expShift);
    return n;
  }

  function resetShiftQuestion() {
    const item = CONVERT_POOL[convertIdx % CONVERT_POOL.length];
    convertIdx++;
    const parsed = digitsFromNumber(item.n);
    parsed.decPos = trimDigits(parsed.digits, parsed.decPos);
    const sci = toScientific(item.n);
    shiftState = {
      value: item.n,
      digits: parsed.digits,
      decPos: parsed.decPos,
      expShift: 0,
      target: sci,
    };
    const targetEl = document.getElementById("sci-shift-target");
    if (targetEl) {
      targetEl.innerHTML = "Convert: <strong>" + formatOrdinaryDisplay(item.n) + "</strong>";
    }
    renderShiftDisplay();
    const fb = document.getElementById("fb-sci-shift");
    fb.className = "feedback";
    fb.textContent = "Move the decimal until you have one non-zero digit before the point.";
    lockFormula("formula-sci-shift");
    document.getElementById("sci-shift-left").disabled = false;
    document.getElementById("sci-shift-right").disabled = false;
  }

  function updateShiftPower(exp) {
    const el = document.getElementById("sci-shift-power");
    if (!el) return;
    el.innerHTML = "Power: \\(10^{" + exp + "}\\)";
    renderKatexIn(el);
  }

  function renderShiftDisplay() {
    if (!shiftState) return;
    const display = document.getElementById("sci-shift-display");
    buildDigitDisplay(display, shiftState.digits, shiftState.decPos);
    updateShiftPower(shiftState.expShift);
    const m = digitsToNumber(shiftState.digits, shiftState.decPos, 0);
    const preview = document.getElementById("sci-shift-preview");
    if (preview) {
      preview.innerHTML = "\\(" + m + " \\times 10^{" + shiftState.expShift + "}\\)";
      renderKatexIn(preview);
    }
  }

  function shiftDecimal(dir) {
    if (!shiftState) return;
    const s = shiftState;
    if (dir < 0) {
      if (s.decPos <= 0) return;
      s.decPos--;
      s.expShift++;
    } else {
      if (s.decPos >= s.digits.length) return;
      s.decPos++;
      s.expShift--;
    }
    renderShiftDisplay();
  }

  function checkShift() {
    const fb = document.getElementById("fb-sci-shift");
    if (!shiftState) return;
    const m = digitsToNumber(shiftState.digits, shiftState.decPos, 0);
    const e = shiftState.expShift;
    const norm = normalizeSciInput(m, e);
    const okM = nearlyEqual(norm.mantissa, shiftState.target.mantissa, 1e-4);
    const okE = norm.exp === shiftState.target.exp;
    const okRange = Math.abs(m) >= 1 && Math.abs(m) < 10;
    if (okM && okE && (shiftState.target.mantissa === 0 || okRange)) {
      fb.className = "feedback ok";
      fb.innerHTML =
        "Correct — \\(" + formatOrdinaryDisplay(shiftState.value) + " = " +
        sciTex(norm.mantissa, norm.exp) + "\\).";
      revealFormula("formula-sci-shift", sciTex(norm.mantissa, norm.exp));
    } else if (!okRange && shiftState.target.mantissa !== 0) {
      fb.className = "feedback bad";
      fb.innerHTML = "The coefficient must satisfy \\(1 \\le a < 10\\). Keep shifting the decimal.";
    } else {
      fb.className = "feedback bad";
      fb.innerHTML = "Not yet — check the coefficient and the power of \\(10\\).";
    }
    renderKatexIn(fb);
  }

  function revealFormula(id, tex) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove("formula-locked");
    el.innerHTML = "\\[ " + tex + " \\]";
    renderKatexIn(el);
  }

  function lockFormula(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add("formula-locked");
  }

  function resetConvertQuiz() {
    const item = CONVERT_POOL[ri(0, CONVERT_POOL.length - 1)];
    const mode = Math.random() < 0.5 ? "toSci" : "fromSci";
    const sci = toScientific(item.n);
    window._sciConvertQuiz = { mode: mode, n: item.n, sci: sci };
    const q = document.getElementById("sci-convert-q");
    const fields = document.getElementById("sci-convert-fields");
    if (mode === "toSci") {
      q.innerHTML = "Write <strong>" + formatOrdinaryDisplay(item.n) + "</strong> in scientific notation.";
      fields.innerHTML =
        '<label>a = <input id="sci-cv-a" type="number" step="any"></label>' +
        '<label>× 10<sup>n</sup>, n = <input id="sci-cv-n" type="number" step="1"></label>';
    } else {
      q.innerHTML =
        "Write \\(" + sciTex(sci.mantissa, sci.exp) + "\\) as an ordinary number.";
      fields.innerHTML =
        '<label>Answer: <input id="sci-cv-val" type="text" inputmode="decimal" placeholder="e.g. 0.000504 or 5.04e-4" style="width:min(240px,100%)"></label>';
      renderKatexIn(q);
    }
    const fb = document.getElementById("fb-sci-convert");
    fb.className = "feedback";
    fb.textContent = "Enter your answer, then Check.";
    lockFormula("formula-sci-convert");
  }

  function checkConvertQuiz() {
    const fb = document.getElementById("fb-sci-convert");
    const q = window._sciConvertQuiz;
    if (!q) return;
    if (q.mode === "toSci") {
      const aEl = document.getElementById("sci-cv-a");
      const nEl = document.getElementById("sci-cv-n");
      const a = Number(aEl && aEl.value);
      const n = Number(nEl && nEl.value);
      if (!isFinite(a) || !isFinite(n) || String(aEl.value).trim() === "" || String(nEl.value).trim() === "") {
        fb.className = "feedback warn";
        fb.textContent = "Enter both the coefficient a and the index n.";
        return;
      }
      const valueOk = nearlyEqual(sciValue(a, n), q.n, 1e-6);
      if (valueOk && inStandardForm(a)) {
        const norm = normalizeSciInput(a, n);
        fb.className = "feedback ok";
        fb.innerHTML = "Correct — \\(" + sciTex(norm.mantissa, norm.exp) + "\\). One non-zero digit stands before the decimal.";
        revealFormula("formula-sci-convert", sciTex(norm.mantissa, norm.exp));
      } else if (valueOk) {
        fb.className = "feedback warn";
        fb.innerHTML = "Same value, but standard form needs \\(1 \\le a < 10\\). Rewrite as \\(" +
          sciTex(q.sci.mantissa, q.sci.exp) + "\\).";
        revealFormula("formula-sci-convert", sciTex(q.sci.mantissa, q.sci.exp));
      } else {
        fb.className = "feedback bad";
        fb.innerHTML = "Move the decimal until \\(1 \\le a < 10\\), then count the jumps. Answer: \\(" +
          sciTex(q.sci.mantissa, q.sci.exp) + "\\).";
      }
    } else {
      const valEl = document.getElementById("sci-cv-val");
      const val = parseOrdinaryInput(valEl && valEl.value);
      if (!isFinite(val)) {
        fb.className = "feedback warn";
        fb.textContent = "Enter the ordinary number (you can use 5.04e-4).";
        return;
      }
      if (nearlyEqual(val, q.n, 1e-6)) {
        fb.className = "feedback ok";
        fb.innerHTML = "Correct — \\(" + formatOrdinaryDisplay(q.n) + "\\).";
        revealFormula("formula-sci-convert", sciTex(q.sci.mantissa, q.sci.exp) + " = " + formatOrdinaryDisplay(q.n));
      } else {
        fb.className = "feedback bad";
        fb.innerHTML = "Multiply the coefficient by the power of 10. \\(" +
          sciTex(q.sci.mantissa, q.sci.exp) + " = " + formatOrdinaryDisplay(q.n) + "\\).";
      }
    }
    renderKatexIn(fb);
  }

  function resetArith() {
    const item = ARITH_POOL[arithIdx % ARITH_POOL.length];
    arithIdx++;
    window._sciArith = item;
    const ansM = item.op === "×" ? item.m1 * item.m2 : item.m1 / item.m2;
    const ansE = item.op === "×" ? item.e1 + item.e2 : item.e1 - item.e2;
    window._sciArithAnswer = normalizeSciInput(ansM, ansE);
    document.getElementById("sci-arith-q").innerHTML = "\\(" + item.tex + "\\)";
    renderKatexIn(document.getElementById("sci-arith-q"));
    document.getElementById("sci-arith-a").value = "";
    document.getElementById("sci-arith-n").value = "";
    const fb = document.getElementById("fb-sci-arith");
    fb.className = "feedback";
    fb.innerHTML = item.op === "×"
      ? "Multiply: add the indices. \\((a\\times10^m)(b\\times10^n)=ab\\times10^{m+n}\\)."
      : "Divide: subtract the indices. \\(\\dfrac{a\\times10^m}{b\\times10^n}=\\dfrac{a}{b}\\times10^{m-n}\\).";
    renderKatexIn(fb);
    lockFormula("formula-sci-arith");
  }

  function checkArith() {
    const fb = document.getElementById("fb-sci-arith");
    const ans = window._sciArithAnswer;
    const a = Number(document.getElementById("sci-arith-a").value);
    const n = Number(document.getElementById("sci-arith-n").value);
    const norm = normalizeSciInput(a, n);
    if (nearlyEqual(norm.mantissa, ans.mantissa, 1e-3) && norm.exp === ans.exp) {
      fb.className = "feedback ok";
      fb.innerHTML = "Correct — \\(" + sciTex(norm.mantissa, norm.exp) + "\\).";
      revealFormula("formula-sci-arith", sciTex(norm.mantissa, norm.exp));
    } else if (nearlyEqual(sciValue(a, n), sciValue(ans.mantissa, ans.exp), 1e-2)) {
      fb.className = "feedback warn";
      fb.innerHTML = "Value is right, but write in standard form: \\(1 \\le a < 10\\). Try \\(" +
        sciTex(ans.mantissa, ans.exp) + "\\).";
      revealFormula("formula-sci-arith", sciTex(ans.mantissa, ans.exp));
    } else {
      const item = window._sciArith;
      fb.className = "feedback bad";
      if (item && item.op === "×") {
        fb.innerHTML =
          "Multiply coefficients \\(" + item.m1 + "\\times" + item.m2 + "=" + (item.m1 * item.m2) +
          "\\), add indices \\(" + item.e1 + "+" + item.e2 + "=" + (item.e1 + item.e2) +
          "\\). Standard form: \\(" + sciTex(ans.mantissa, ans.exp) + "\\).";
      } else if (item) {
        fb.innerHTML =
          "Divide coefficients \\(" + item.m1 + "\\div" + item.m2 + "=" + (item.m1 / item.m2) +
          "\\), subtract indices \\(" + item.e1 + "-(" + item.e2 + ")=" + (item.e1 - item.e2) +
          "\\). Standard form: \\(" + sciTex(ans.mantissa, ans.exp) + "\\).";
      } else {
        fb.textContent = "Combine coefficients, then add or subtract the indices.";
      }
    }
    renderKatexIn(fb);
  }

  function ghostDrag(sourceEl, e, onMove, onDrop) {
    const ghost = document.createElement("div");
    ghost.className = "drag-ghost";
    ghost.innerHTML = sourceEl.innerHTML;
    const sx = e.clientX;
    const sy = e.clientY;
    let moved = false;
    ghost.style.left = sx + "px";
    ghost.style.top = sy + "px";
    document.body.appendChild(ghost);
    sourceEl.classList.add("dragging");

    function mv(ev) {
      if (Math.abs(ev.clientX - sx) > 4 || Math.abs(ev.clientY - sy) > 4) moved = true;
      ghost.style.left = ev.clientX + "px";
      ghost.style.top = ev.clientY + "px";
      if (onMove) onMove(ev, moved);
    }

    function cleanup() {
      window.removeEventListener("pointermove", mv);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cn);
      ghost.remove();
      sourceEl.classList.remove("dragging");
    }

    function up(ev) {
      cleanup();
      onDrop(ev, moved);
    }

    function cn(ev) {
      cleanup();
      onDrop(ev, true);
    }

    window.addEventListener("pointermove", mv);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cn);
  }

  function slotUnder(ev) {
    const wrap = document.getElementById("sci-sort-wrap");
    const el = document.elementFromPoint(ev.clientX, ev.clientY);
    if (!el || !el.closest || !wrap || !wrap.contains(el)) return null;
    return el.closest(".sort-slot, .sort-pool");
  }

  function placeSortCard(idx, target) {
    if (target && target.classList.contains("sort-pool")) {
      sortSlots = sortSlots.map(function (x) {
        return x === idx ? null : x;
      });
    } else if (target && target.classList.contains("sort-slot")) {
      const slot = Number(target.dataset.slot);
      sortSlots.forEach(function (x, i) {
        if (x === idx) sortSlots[i] = null;
      });
      if (sortSlots[slot] != null && sortSlots[slot] !== idx) {
        sortPool.push(sortSlots[slot]);
      }
      sortSlots[slot] = idx;
      sortPool = sortPool.filter(function (x) {
        return sortSlots.indexOf(x) < 0;
      });
    } else {
      const empty = sortSlots.indexOf(null);
      if (empty >= 0 && sortSlots.indexOf(idx) < 0) {
        sortSlots[empty] = idx;
        sortPool = sortPool.filter(function (x) {
          return x !== idx;
        });
      } else if (sortSlots.indexOf(idx) >= 0) {
        sortSlots = sortSlots.map(function (x) {
          return x === idx ? null : x;
        });
        if (sortPool.indexOf(idx) < 0) sortPool.push(idx);
      }
    }
    renderSortUI();
  }

  function makeSortCard(card, idx) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "sort-card";
    btn.dataset.idx = String(idx);
    btn.innerHTML = card.label;
    btn.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      ghostDrag(btn, e, function (ev, moved) {
        const wrap = document.getElementById("sci-sort-wrap");
        if (!wrap) return;
        wrap.querySelectorAll(".sort-slot").forEach(function (s) {
          s.classList.toggle("drag-over", slotUnder(ev) === s);
        });
      }, function (ev, moved) {
        const wrap = document.getElementById("sci-sort-wrap");
        if (wrap) {
          wrap.querySelectorAll(".sort-slot").forEach(function (s) {
            s.classList.remove("drag-over");
          });
        }
        const target = slotUnder(ev);
        if (!moved) {
          placeSortCard(idx, null);
          return;
        }
        if (!target) return;
        placeSortCard(idx, target);
      });
    });
    return btn;
  }

  function renderSortUI() {
    const set = SORT_SETS[sortActiveSet];
    const poolEl = document.getElementById("sci-sort-pool");
    const slotsEl = document.getElementById("sci-sort-slots");
    if (!poolEl || !slotsEl) return;
    poolEl.innerHTML = "";
    sortPool.forEach(function (idx) {
      poolEl.appendChild(makeSortCard(set.cards[idx], idx));
    });
    slotsEl.querySelectorAll(".sort-slot").forEach(function (slot, i) {
      slot.innerHTML = "";
      const idx = sortSlots[i];
      if (idx != null) slot.appendChild(makeSortCard(set.cards[idx], idx));
    });
    renderKatexIn(document.getElementById("sci-sort-wrap"));
  }

  function resetSort(advance) {
    if (advance) sortSetIdx = (sortSetIdx + 1) % SORT_SETS.length;
    sortActiveSet = sortSetIdx;
    const set = SORT_SETS[sortActiveSet];
    sortSlots = [null, null, null, null];
    sortPool = shuffle(set.cards.map(function (_, i) {
      return i;
    }));
    const label = document.getElementById("sci-sort-label");
    if (label) {
      label.textContent = set.asc
        ? "Drag into ascending order (smallest → largest)."
        : "Drag into descending order (largest → smallest).";
    }
    renderSortUI();
    const fb = document.getElementById("fb-sci-sort");
    fb.className = "feedback";
    fb.textContent = "Convert mentally to compare, then drag the cards.";
    lockFormula("formula-sci-sort");
  }

  function checkSort() {
    const fb = document.getElementById("fb-sci-sort");
    const set = SORT_SETS[sortActiveSet];
    if (sortSlots.some(function (x) {
      return x == null;
    })) {
      fb.className = "feedback warn";
      fb.textContent = "Fill all four slots first.";
      return;
    }
    const order = sortSlots.map(function (i) {
      return cardValue(set.cards[i]);
    });
    const expect = sortedOrder(set.cards, set.asc);
    const ok = order.every(function (v, i) {
      return nearlyEqual(v, expect[i], 1e-6);
    });
    if (ok) {
      fb.className = "feedback ok";
      fb.textContent = set.asc ? "Correct ascending order!" : "Correct descending order!";
      const tex = expect.map(function (v) {
        const s = toScientific(v);
        return sciTex(s.mantissa, s.exp);
      }).join(set.asc ? " < " : " > ");
      revealFormula("formula-sci-sort", tex);
    } else {
      fb.className = "feedback bad";
      const tex = expect.map(function (v) {
        const s = toScientific(v);
        return sciTex(s.mantissa, s.exp);
      }).join(set.asc ? " < " : " > ");
      fb.innerHTML = "Rewrite each as \\(a\\times10^n\\) with \\(1\\le a<10\\), then compare the powers. Order: \\(" + tex + "\\).";
      renderKatexIn(fb);
    }
  }

  function initScientificLab() {
    resetShiftQuestion();
    resetConvertQuiz();
    resetArith();
    resetSort();

    document.getElementById("sci-shift-left").addEventListener("click", function () {
      shiftDecimal(-1);
    });
    document.getElementById("sci-shift-right").addEventListener("click", function () {
      shiftDecimal(1);
    });
    document.getElementById("sci-shift-check").addEventListener("click", checkShift);
    document.getElementById("sci-shift-reset").addEventListener("click", resetShiftQuestion);

    document.getElementById("sci-convert-check").addEventListener("click", checkConvertQuiz);
    document.getElementById("sci-convert-reset").addEventListener("click", resetConvertQuiz);

    document.getElementById("sci-arith-check").addEventListener("click", checkArith);
    document.getElementById("sci-arith-reset").addEventListener("click", resetArith);

    document.getElementById("sci-sort-check").addEventListener("click", checkSort);
    document.getElementById("sci-sort-reset").addEventListener("click", function () {
      resetSort(true);
    });

    if (window.initStepper) {
      window.initStepper("sci-intro");
    }
    var walkHost = document.getElementById("sci-walkthrough-host");
    if (walkHost && window.SciNotationTool && !walkHost.dataset.ready) {
      window.SciNotationTool.init(walkHost);
      walkHost.dataset.ready = "1";
    }
  }

  window.initScientificLab = initScientificLab;
})();
