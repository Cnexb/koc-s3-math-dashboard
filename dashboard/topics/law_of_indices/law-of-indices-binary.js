/* JM24 Binary lab — interactive base-2 tool (separate from powers lab) */
(function () {
  "use strict";

  const BIT_COUNT = 10;

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

  function divideBy2Steps(n) {
    const steps = [];
    let q = n;
    while (q > 0) {
      steps.push({ q: Math.floor(q / 2), r: q % 2, n: q });
      q = Math.floor(q / 2);
    }
    return steps;
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

  function buildBitRow(container, bits, onChange) {
    container.innerHTML = "";
    const wrap = document.createElement("div");
    wrap.className = "bit-row";
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

  const MATCH_TARGETS = [20, 35, 114, 127, 316];
  const POWER_CHALLENGES = [
    { label: "\\(2^{6} + 2^{5} + 2^{1}\\)", bits: denaryToBits(98) },
    { label: "\\(2^{6} + 2^{4} + 2^{3} + 2^{1}\\)", bits: denaryToBits(90) },
    { label: "\\(128 + 32 + 16 + 1\\)", bits: denaryToBits(177) },
  ];
  const QUIZ_ITEMS = [
    {
      q: "Convert \\(110101_{(2)}\\) to a denary number.",
      choices: ["43", "53", "63", "107"],
      answer: 1,
    },
    {
      q: "Convert \\(101011_{(2)}\\) to a denary number.",
      choices: ["35", "43", "53", "126"],
      answer: 1,
    },
    {
      q: "What is the place value of the digit \\(0\\) in \\(10111_{(2)}\\)?",
      choices: ["\\(2^{0}\\)", "\\(2^{1}\\)", "\\(2^{2}\\)", "\\(2^{3}\\)"],
      answer: 3,
    },
    {
      q: "\\(110101_{(2)} + 1101011_{(2)}\\) in denary equals:",
      choices: ["150", "160", "170", "107"],
      answer: 1,
    },
    {
      q: "Which is smallest?",
      choices: ["\\(28_{(10)}\\)", "\\(110111_{(2)}\\)", "\\(111001_{(2)}\\)"],
      answer: 0,
    },
  ];

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
          "_{(10)}\\). Try the largest \\(2^{n}\\) that fits in \\(" +
          target +
          "\\).";
      }
      renderKatexIn(fbMatch);
    });
    document.getElementById("bin-match-reset").addEventListener("click", function () {
      matchStreak = 0;
      showMatchChallenge();
    });
    showMatchChallenge();

    let powerIdx = 0;
    const powerBits = new Array(BIT_COUNT).fill(0);
    const powerRow = document.getElementById("bin-power-row");
    const powerExpr = document.getElementById("bin-power-expr");
    const fbPower = document.getElementById("fb-bin-power");

    function showPowerChallenge() {
      const ch = POWER_CHALLENGES[powerIdx % POWER_CHALLENGES.length];
      powerExpr.innerHTML = ch.label;
      powerBits.fill(0);
      buildBitRow(powerRow, powerBits);
      fbPower.className = "feedback";
      fbPower.textContent = "Flip bits to match the expression, then Check.";
      if (window.lockFormula) window.lockFormula("formula-bin-power");
      renderKatexIn(powerExpr.parentElement);
    }

    document.getElementById("bin-power-check").addEventListener("click", function () {
      const ch = POWER_CHALLENGES[powerIdx % POWER_CHALLENGES.length];
      const ok = ch.bits.every(function (b, i) {
        return b === powerBits[i];
      });
      if (ok) {
        fbPower.className = "feedback ok";
        fbPower.innerHTML =
          "Correct — \\(" +
          bitsToBinaryString(powerBits) +
          "_{(2)} = " +
          bitsToDenary(powerBits) +
          "_{(10)}\\).";
        if (window.revealFormula) window.revealFormula("formula-bin-power");
        powerIdx++;
        setTimeout(showPowerChallenge, 1400);
      } else {
        fbPower.className = "feedback bad";
        fbPower.innerHTML =
          "Each \\(2^{n}\\) term turns on one bit. Compare with the playground above.";
      }
      renderKatexIn(fbPower);
    });
    document.getElementById("bin-power-reset").addEventListener("click", showPowerChallenge);
    showPowerChallenge();

    let ladderN = 316;
    let ladderStep = 0;
    let ladderDigits = [];
    const ladderTarget = document.getElementById("bin-ladder-target");
    const ladderTable = document.getElementById("bin-ladder-table");
    const fbLadder = document.getElementById("fb-bin-ladder");

    function resetLadder() {
      ladderN = [316, 35, 20, 127][Math.floor(Math.random() * 4)];
      ladderStep = 0;
      ladderDigits = [];
      ladderTarget.innerHTML = "\\(" + ladderN + "_{(10)}\\)";
      ladderTable.innerHTML = "";
      fbLadder.className = "feedback";
      fbLadder.textContent = "Click “Divide by 2” for each step. Stack remainders to build binary.";
      if (window.lockFormula) window.lockFormula("formula-bin-ladder");
      renderKatexIn(ladderTarget.parentElement);
    }

    document.getElementById("bin-ladder-step").addEventListener("click", function () {
      const steps = divideBy2Steps(ladderN);
      if (ladderStep >= steps.length) {
        fbLadder.className = "feedback warn";
        fbLadder.textContent = "Ladder complete — read remainders bottom-up, then Check.";
        return;
      }
      const s = steps[ladderStep];
      ladderDigits.push(s.r);
      const row = document.createElement("div");
      row.className = "ladder-row";
      row.innerHTML =
        "\\(" + s.n + " \\div 2 = " + s.q + "\\) remainder \\(" + s.r + "\\)";
      ladderTable.appendChild(row);
      renderKatexIn(row);
      ladderStep++;
      if (ladderStep >= steps.length) {
        fbLadder.className = "feedback";
        fbLadder.innerHTML =
          "Remainders (bottom-up): \\(" +
          ladderDigits.slice().reverse().join("") +
          "_{(2)}\\). Click Check.";
        renderKatexIn(fbLadder);
      }
    });

    document.getElementById("bin-ladder-check").addEventListener("click", function () {
      const expected = denaryToBinaryString(ladderN);
      const built = ladderDigits.slice().reverse().join("");
      if (built === expected) {
        fbLadder.className = "feedback ok";
        fbLadder.innerHTML =
          "Correct — \\(" + ladderN + "_{(10)} = " + expected + "_{(2)}\\).";
        if (window.revealFormula) window.revealFormula("formula-bin-ladder");
      } else {
        fbLadder.className = "feedback bad";
        fbLadder.innerHTML =
          "You built \\(" +
          built +
          "_{(2)}\\). Read remainders from last division to first.";
      }
      renderKatexIn(fbLadder);
    });
    document.getElementById("bin-ladder-reset").addEventListener("click", resetLadder);
    resetLadder();

    document.getElementById("bin-add-check").addEventListener("click", function () {
      const fb = document.getElementById("fb-bin-add");
      const val = Number(document.getElementById("bin-add-input").value);
      if (val === 160) {
        fb.className = "feedback ok";
        fb.innerHTML =
          "Correct — \\(110101_{(2)}=53\\), \\(1101011_{(2)}=107\\), \\(53+107=160\\).";
        if (window.revealFormula) window.revealFormula("formula-bin-add");
      } else {
        fb.className = "feedback bad";
        fb.innerHTML = "Convert each binary number to denary first, then add.";
      }
      renderKatexIn(fb);
    });
    document.getElementById("bin-add-reset").addEventListener("click", function () {
      document.getElementById("bin-add-input").value = "";
      document.getElementById("fb-bin-add").className = "feedback";
      document.getElementById("fb-bin-add").textContent = "Answer the question above.";
      if (window.lockFormula) window.lockFormula("formula-bin-add");
    });

    document.getElementById("bin-sub-check").addEventListener("click", function () {
      const fb = document.getElementById("fb-bin-sub");
      const val = Number(document.getElementById("bin-sub-input").value);
      if (val === 76) {
        fb.className = "feedback ok";
        fb.innerHTML =
          "Correct — \\(1010111_{(2)}=87\\), \\(1011_{(2)}=11\\), \\(87-11=76_{(10)}\\).";
        if (window.revealFormula) window.revealFormula("formula-bin-sub");
      } else {
        fb.className = "feedback bad";
        fb.innerHTML = "Convert each binary number to denary, then subtract.";
      }
      renderKatexIn(fb);
    });
    document.getElementById("bin-sub-reset").addEventListener("click", function () {
      document.getElementById("bin-sub-input").value = "";
      document.getElementById("fb-bin-sub").className = "feedback";
      document.getElementById("fb-bin-sub").textContent = "Answer the question above.";
      if (window.lockFormula) window.lockFormula("formula-bin-sub");
    });

    const orderCards = [
      { id: "a", label: "\\(28_{(10)}\\)", value: 28 },
      { id: "b", label: "\\(110111_{(2)}\\)", value: 55 },
      { id: "c", label: "\\(111001_{(2)}\\)", value: 57 },
    ];
    let orderSlots = [];
    const orderPool = document.getElementById("bin-order-pool");
    const orderRow = document.getElementById("bin-order-slots");

    function renderOrder() {
      orderPool.innerHTML = "";
      orderRow.innerHTML = "";
      orderCards.forEach(function (card) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "sort-card";
        btn.dataset.id = card.id;
        btn.innerHTML = card.label;
        btn.addEventListener("click", function () {
          const idx = orderSlots.indexOf(card.id);
          if (idx >= 0) {
            orderSlots.splice(idx, 1);
          } else if (orderSlots.length < 3) {
            orderSlots.push(card.id);
          }
          renderOrder();
        });
        if (orderSlots.indexOf(card.id) < 0) orderPool.appendChild(btn);
        else orderRow.appendChild(btn);
      });
      renderKatexIn(document.getElementById("bin-order-wrap"));
    }

    renderOrder();

    document.getElementById("bin-order-check").addEventListener("click", function () {
      const fb = document.getElementById("fb-bin-order");
      const values = orderSlots.map(function (id) {
        return orderCards.find(function (c) {
          return c.id === id;
        }).value;
      });
      const sorted = values.slice().sort(function (a, b) {
        return a - b;
      });
      const ok =
        orderSlots.length === 3 &&
        values.every(function (v, i) {
          return v === sorted[i];
        });
      if (ok) {
        fb.className = "feedback ok";
        fb.innerHTML = "Correct ascending order: \\(28 < 55 < 57\\).";
        if (window.revealFormula) window.revealFormula("formula-bin-order");
      } else {
        fb.className = "feedback bad";
        fb.innerHTML = "Convert each to denary, then compare.";
      }
      renderKatexIn(fb);
    });
    document.getElementById("bin-order-reset").addEventListener("click", function () {
      orderSlots = [];
      renderOrder();
      document.getElementById("fb-bin-order").className = "feedback";
      document.getElementById("fb-bin-order").textContent =
        "Click cards to place them left-to-right (smallest first).";
      if (window.lockFormula) window.lockFormula("formula-bin-order");
    });

    let quizIdx = 0;
    let quizScore = 0;
    const quizQ = document.getElementById("bin-quiz-q");
    const quizChoices = document.getElementById("bin-quiz-choices");
    const quizProg = document.getElementById("bin-quiz-prog");
    const fbQuiz = document.getElementById("fb-bin-quiz");

    function showQuiz() {
      if (quizIdx >= QUIZ_ITEMS.length) {
        quizQ.innerHTML = "Done!";
        quizChoices.innerHTML = "";
        fbQuiz.className = "feedback ok";
        fbQuiz.textContent = "Score: " + quizScore + " / " + QUIZ_ITEMS.length;
        return;
      }
      const item = QUIZ_ITEMS[quizIdx];
      quizQ.innerHTML = item.q;
      quizChoices.innerHTML = "";
      quizProg.textContent = "Question " + (quizIdx + 1) + " of " + QUIZ_ITEMS.length;
      item.choices.forEach(function (choice, ci) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn quiz-opt";
        btn.innerHTML = choice;
        btn.addEventListener("click", function () {
          if (ci === item.answer) {
            quizScore++;
            fbQuiz.className = "feedback ok";
            fbQuiz.textContent = "Correct!";
          } else {
            fbQuiz.className = "feedback bad";
            fbQuiz.textContent = "Not quite — try the next one.";
          }
          quizIdx++;
          setTimeout(showQuiz, 700);
        });
        quizChoices.appendChild(btn);
      });
      fbQuiz.className = "feedback";
      fbQuiz.textContent = "";
      renderKatexIn(document.getElementById("bin-quiz-wrap"));
    }

    document.getElementById("bin-quiz-reset").addEventListener("click", function () {
      quizIdx = 0;
      quizScore = 0;
      showQuiz();
    });
    showQuiz();

    renderKatexIn(root);
  }

  window.initBinaryLab = initBinaryLab;
})();
