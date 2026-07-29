/* JM24 Binary lab — interactive base-2 tool (separate from powers lab) */
(function () {
  "use strict";

  const BIT_COUNT = 10;
  const POWER_BIT_COUNT = 8;

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

  function denaryToBinaryString(n) {
    if (n === 0) return "0";
    let s = "";
    while (n > 0) {
      s = (n % 2) + s;
      n = Math.floor(n / 2);
    }
    return s;
  }

  function bitsToDenary(bits) {
    let n = 0;
    for (let i = 0; i < bits.length; i++) {
      if (bits[i]) n += Math.pow(2, bits.length - 1 - i);
    }
    return n;
  }

  function denaryToBits(n, width) {
    width = width || BIT_COUNT;
    const bits = new Array(width).fill(0);
    for (let i = width - 1; i >= 0 && n > 0; i--) {
      bits[i] = n % 2;
      n = Math.floor(n / 2);
    }
    return bits;
  }

  function bitsToBinaryString(bits) {
    return bits.map(String).join("");
  }

  function expandedFormHtml(bits, base) {
    base = base || 2;
    const terms = [];
    for (let i = 0; i < bits.length; i++) {
      if (!bits[i]) continue;
      const exp = bits.length - 1 - i;
      terms.push("1 \\times " + base + "^{" + exp + "}");
    }
    if (!terms.length) return "\\(0\\)";
    return "\\(" + terms.join(" + ") + "\\)";
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

  function buildBitRow(container, bits, onChange, compact) {
    container.innerHTML = "";
    const wrap = document.createElement("div");
    wrap.className = "bit-row" + (compact ? " compact" : "");
    bits.forEach(function (bit, i) {
      const col = document.createElement("div");
      col.className = "bit-col";
      const pv = document.createElement("span");
      pv.className = "bit-pv";
      pv.innerHTML = "\\(2^{" + (bits.length - 1 - i) + "}\\)";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "bit-toggle" + (bit ? " on" : "");
      btn.setAttribute("aria-label", "Bit " + (bits.length - 1 - i));
      btn.innerHTML =
        '<span class="bit-bulb"></span><span class="bit-digit">' + bit + "</span>";
      btn.addEventListener("click", function () {
        bits[i] = bits[i] ? 0 : 1;
        btn.classList.toggle("on", !!bits[i]);
        btn.querySelector(".bit-digit").textContent = String(bits[i]);
        if (onChange) onChange(bits);
      });
      col.appendChild(pv);
      col.appendChild(btn);
      wrap.appendChild(col);
    });
    container.appendChild(wrap);
    renderKatexIn(container);
    return bits;
  }

  function updateBitReadout(bits, targets) {
    const den = bitsToDenary(bits);
    const binStr = bitsToBinaryString(bits);
    if (targets.binary) targets.binary.textContent = binStr + "(2)";
    if (targets.denary) targets.denary.innerHTML = "\\(= " + den + "_{(10)}\\)";
    if (targets.expanded) targets.expanded.innerHTML = expandedFormHtml(bits);
    if (targets.denary && targets.denary.parentElement) {
      renderKatexIn(targets.denary.parentElement);
    }
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
    const el = document.elementFromPoint(ev.clientX, ev.clientY);
    return el && el.closest ? el.closest(".sort-slot, .sort-pool") : null;
  }

  function genPowerChallenge() {
    const count = ri(3, 4);
    const pool = shuffle([0, 1, 2, 3, 4, 5, 6, 7]).slice(0, count);
    pool.sort(function (a, b) {
      return b - a;
    });
    const sum = pool.reduce(function (s, e) {
      return s + Math.pow(2, e);
    }, 0);
    const label =
      "\\(" +
      pool
        .map(function (e) {
          return "2^{" + e + "}";
        })
        .join(" + ") +
      "\\)";
    return {
      label: label,
      bits: denaryToBits(sum, POWER_BIT_COUNT),
      sum: sum,
      formula:
        pool.map(function (e) { return "2^{" + e + "}"; }).join("+") +
        " = " +
        denaryToBinaryString(sum) +
        "_{(2)}",
    };
  }

  function genArithQuestion() {
    const isAdd = Math.random() < 0.5;
    let a = ri(25, 110);
    let b = ri(12, 75);
    if (!isAdd && b >= a) {
      const t = a;
      a = b + ri(5, 30);
      b = t;
    }
    const binA = denaryToBinaryString(a);
    const binB = denaryToBinaryString(b);
    const answer = isAdd ? a + b : a - b;
    const opSym = isAdd ? "+" : "-";
    return {
      isAdd: isAdd,
      a: a,
      b: b,
      binA: binA,
      binB: binB,
      answer: answer,
      qHtml:
        "\\(" +
        binA +
        "_{(2)} " +
        opSym +
        " " +
        binB +
        "_{(2)}\\)",
      stepsHtml:
        "\\(" +
        binA +
        "_{(2)}=" +
        a +
        "\\), \\(" +
        binB +
        "_{(2)}=" +
        b +
        "\\), \\(" +
        a +
        opSym +
        b +
        "=" +
        answer +
        "_{(10)}\\)",
      formula: a + " " + opSym + " " + b + " = " + answer + "_{(10)}",
    };
  }

  function genOrderQuestion() {
    const values = [];
    while (values.length < 3) {
      const v = ri(18, 115);
      if (values.indexOf(v) >= 0) continue;
      values.push(v);
    }
    const sorted = values.slice().sort(function (a, b) {
      return a - b;
    });
    const cards = values.map(function (v, i) {
      const asBinary = Math.random() < 0.55;
      return {
        id: "c" + i + "_" + v,
        value: v,
        label: asBinary
          ? "\\(" + denaryToBinaryString(v) + "_{(2)}\\)"
          : "\\(" + v + "_{(10)}\\)",
        denaryLabel: "\\(" + v + "_{(10)}\\)",
        binaryLabel: "\\(" + denaryToBinaryString(v) + "_{(2)}\\)",
      };
    });
    shuffle(cards);
    return { cards: cards, sorted: sorted };
  }

  const MATCH_TARGETS = [20, 35, 114, 127, 316];

  function initBinaryLab() {
    const root = document.getElementById("lab-binary");
    if (!root) return;

    if (window.initStepper) window.initStepper("binary-intro");

    const playBits = new Array(BIT_COUNT).fill(0);
    playBits[BIT_COUNT - 1] = 1;
    const playRow = document.getElementById("bin-play-row");
    const readBinary = document.getElementById("bin-read-binary");
    const readDenary = document.getElementById("bin-read-denary");
    const readExpanded = document.getElementById("bin-read-expanded");

    function syncPlay() {
      updateBitReadout(playBits, {
        binary: readBinary,
        denary: readDenary,
        expanded: readExpanded,
      });
    }

    buildBitRow(playRow, playBits, syncPlay);
    syncPlay();

    document.getElementById("bin-random").addEventListener("click", function () {
      for (let i = 0; i < playBits.length; i++) {
        playBits[i] = Math.random() < 0.45 ? 1 : 0;
      }
      buildBitRow(playRow, playBits, syncPlay);
      syncPlay();
    });

    document.getElementById("bin-clear").addEventListener("click", function () {
      playBits.fill(0);
      buildBitRow(playRow, playBits, syncPlay);
      syncPlay();
    });

    let powerChallenge = genPowerChallenge();
    const powerBits = new Array(POWER_BIT_COUNT).fill(0);
    const powerRow = document.getElementById("bin-power-row");
    const powerExpr = document.getElementById("bin-power-expr");
    const fbPower = document.getElementById("fb-bin-power");
    const formulaPower = document.getElementById("formula-bin-power");

    function showPowerChallenge() {
      powerChallenge = genPowerChallenge();
      powerBits.fill(0);
      powerExpr.innerHTML = powerChallenge.label;
      buildBitRow(powerRow, powerBits, null, true);
      fbPower.className = "feedback";
      fbPower.textContent = "Flip bits to match the expression, then Check.";
      formulaPower.innerHTML = "\\[ " + powerChallenge.formula + " \\]";
      if (window.lockFormula) window.lockFormula("formula-bin-power");
      renderKatexIn(powerExpr.parentElement);
    }

    document.getElementById("bin-power-check").addEventListener("click", function () {
      const ok = powerChallenge.bits.every(function (b, i) {
        return b === powerBits[i];
      });
      const got = bitsToDenary(powerBits);
      if (ok) {
        fbPower.className = "feedback ok";
        fbPower.innerHTML =
          "Correct — \\(" +
          bitsToBinaryString(powerBits) +
          "_{(2)} = " +
          got +
          "_{(10)}\\).";
        if (window.revealFormula) window.revealFormula("formula-bin-power");
      } else {
        fbPower.className = "feedback bad";
        fbPower.innerHTML =
          "Not quite — answer: \\(" +
          bitsToBinaryString(powerChallenge.bits) +
          "_{(2)} = " +
          powerChallenge.sum +
          "_{(10)}\\). Each \\(2^{n}\\) turns on one bit.";
        if (window.revealFormula) window.revealFormula("formula-bin-power");
      }
      renderKatexIn(fbPower);
    });
    document.getElementById("bin-power-reset").addEventListener("click", showPowerChallenge);
    showPowerChallenge();

    let matchIdx = 0;
    let matchStreak = 0;
    const matchBits = new Array(BIT_COUNT).fill(0);
    const matchRow = document.getElementById("bin-match-row");
    const matchTarget = document.getElementById("bin-match-target");
    const fbMatch = document.getElementById("fb-bin-match");

    function showMatchChallenge() {
      const t = MATCH_TARGETS[matchIdx % MATCH_TARGETS.length];
      matchTarget.innerHTML = "\\(" + t + "_{(10)}\\)";
      matchBits.fill(0);
      buildBitRow(matchRow, matchBits);
      fbMatch.className = "feedback";
      fbMatch.textContent = "Flip bits to match the target, then Check.";
      if (window.lockFormula) window.lockFormula("formula-bin-match");
      renderKatexIn(matchTarget.parentElement);
    }

    document.getElementById("bin-match-check").addEventListener("click", function () {
      const target = MATCH_TARGETS[matchIdx % MATCH_TARGETS.length];
      const got = bitsToDenary(matchBits);
      if (got === target) {
        matchStreak++;
        fbMatch.className = "feedback ok";
        fbMatch.innerHTML =
          "Correct — \\(" +
          target +
          "_{(10)} = " +
          bitsToBinaryString(matchBits) +
          "_{(2)}\\). Streak: " +
          matchStreak +
          ".";
        if (window.revealFormula) window.revealFormula("formula-bin-match");
        matchIdx++;
        setTimeout(showMatchChallenge, 1400);
      } else {
        matchStreak = 0;
        fbMatch.className = "feedback bad";
        fbMatch.innerHTML =
          "Your bits give \\(" +
          got +
          "_{(10)}\\). Answer: \\(" +
          target +
          "_{(10)} = " +
          denaryToBinaryString(target) +
          "_{(2)}\\).";
      }
      renderKatexIn(fbMatch);
    });
    document.getElementById("bin-match-reset").addEventListener("click", function () {
      matchStreak = 0;
      matchIdx = ri(0, MATCH_TARGETS.length - 1);
      showMatchChallenge();
    });
    showMatchChallenge();

    let arithQ = genArithQuestion();
    const arithQEl = document.getElementById("bin-arith-q");
    const arithInput = document.getElementById("bin-arith-input");
    const fbArith = document.getElementById("fb-bin-arith");
    const formulaArith = document.getElementById("formula-bin-arith");

    function showArithQuestion() {
      arithQ = genArithQuestion();
      arithQEl.innerHTML = arithQ.qHtml;
      arithInput.value = "";
      fbArith.className = "feedback";
      fbArith.textContent = "Answer the question above.";
      formulaArith.innerHTML = "\\[ " + arithQ.formula + " \\]";
      if (window.lockFormula) window.lockFormula("formula-bin-arith");
      renderKatexIn(arithQEl.parentElement);
    }

    function showArithFeedback(ok) {
      fbArith.className = ok ? "feedback ok" : "feedback bad";
      fbArith.innerHTML =
        (ok ? "Correct — " : "Not quite — ") + arithQ.stepsHtml + ".";
      if (window.revealFormula) window.revealFormula("formula-bin-arith");
      renderKatexIn(fbArith);
    }

    document.getElementById("bin-arith-check").addEventListener("click", function () {
      const val = Number(arithInput.value);
      showArithFeedback(val === arithQ.answer);
    });
    document.getElementById("bin-arith-reset").addEventListener("click", showArithQuestion);
    showArithQuestion();

    let orderQ = genOrderQuestion();
    let orderPlacements = { pool: [], slots: [null, null, null] };
    const orderPool = document.getElementById("bin-order-pool");
    const orderSlotEls = document.querySelectorAll("#bin-order-slots .sort-slot");
    const fbOrder = document.getElementById("fb-bin-order");
    const formulaOrder = document.getElementById("formula-bin-order");

    function cardById(id) {
      return orderQ.cards.find(function (c) {
        return c.id === id;
      });
    }

    function makeSortCard(card) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "sort-card";
      btn.dataset.id = card.id;
      btn.innerHTML = card.label;
      btn.addEventListener("pointerdown", function (e) {
        e.preventDefault();
        ghostDrag(
          btn,
          e,
          function (ev) {
            document.querySelectorAll(".sort-slot.drag-over").forEach(function (n) {
              n.classList.remove("drag-over");
            });
            const hit = slotUnder(ev);
            if (hit && hit.classList.contains("sort-slot")) {
              hit.classList.add("drag-over");
            }
          },
          function (ev, moved) {
            document.querySelectorAll(".sort-slot.drag-over").forEach(function (n) {
              n.classList.remove("drag-over");
            });
            if (!moved) return;
            const hit = slotUnder(ev);
            const cardId = card.id;
            orderPlacements.pool = orderPlacements.pool.filter(function (id) {
              return id !== cardId;
            });
            orderPlacements.slots = orderPlacements.slots.map(function (id) {
              return id === cardId ? null : id;
            });
            if (hit && hit.classList.contains("sort-slot")) {
              const slotIdx = Number(hit.dataset.slot);
              const displaced = orderPlacements.slots[slotIdx];
              if (displaced) orderPlacements.pool.push(displaced);
              orderPlacements.slots[slotIdx] = cardId;
            } else if (hit && hit.classList.contains("sort-pool")) {
              orderPlacements.pool.push(cardId);
            }
            renderOrder();
          }
        );
      });
      return btn;
    }

    function renderOrder() {
      orderPool.innerHTML = "";
      orderSlotEls.forEach(function (slot, i) {
        slot.innerHTML = "";
        slot.classList.remove("drag-over");
        const id = orderPlacements.slots[i];
        if (id) {
          const card = cardById(id);
          if (card) slot.appendChild(makeSortCard(card));
        }
      });
      orderPlacements.pool.forEach(function (id) {
        const card = cardById(id);
        if (card) orderPool.appendChild(makeSortCard(card));
      });
      renderKatexIn(document.getElementById("bin-order-wrap"));
    }

    function resetOrderQuestion() {
      orderQ = genOrderQuestion();
      orderPlacements = {
        pool: orderQ.cards.map(function (c) {
          return c.id;
        }),
        slots: [null, null, null],
      };
      fbOrder.className = "feedback";
      fbOrder.textContent = "Drag cards into the slots left-to-right (smallest first).";
      formulaOrder.innerHTML =
        "\\[ " +
        orderQ.sorted.join(" < ") +
        " \\]";
      if (window.lockFormula) window.lockFormula("formula-bin-order");
      renderOrder();
    }

    document.getElementById("bin-order-check").addEventListener("click", function () {
      const values = orderPlacements.slots.map(function (id) {
        return id ? cardById(id).value : null;
      });
      const filled = values.every(function (v) {
        return v !== null;
      });
      const ok =
        filled &&
        values.every(function (v, i) {
          return v === orderQ.sorted[i];
        });
      const steps =
        orderQ.cards
          .slice()
          .sort(function (a, b) {
            return a.value - b.value;
          })
          .map(function (c) {
            return c.binaryLabel + "=" + c.denaryLabel;
          })
          .join(", ") +
        " \\(\\Rightarrow\\) \\(" +
        orderQ.sorted.join(" < ") +
        "\\)";
      fbOrder.className = ok ? "feedback ok" : "feedback bad";
      fbOrder.innerHTML = (ok ? "Correct — " : "Answer — ") + steps + ".";
      if (window.revealFormula) window.revealFormula("formula-bin-order");
      renderKatexIn(fbOrder);
    });
    document.getElementById("bin-order-reset").addEventListener("click", resetOrderQuestion);
    resetOrderQuestion();

    renderKatexIn(root);
  }

  window.initBinaryLab = initBinaryLab;
})();
