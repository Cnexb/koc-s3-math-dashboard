/* Percentage quiz  EPre S3 L04 E6; paginated MC (10), progress bar */
(function () {
  "use strict";

  const QUIZ_PRACTICE = [
    {
      id: 1,
      type: "mc",
      prompt:
        "The original weight of a panda was 80 kg. Its weight first decreased by 10% due to illness and then increased by 10% after recovery. After recovery, what was the change in its weight as compared to the original weight?",
      choices: [
        "\\text{no change}",
        "\\text{an increase of }0.8\\text{ kg}",
        "\\text{a decrease of }0.8\\text{ kg}",
        "\\text{a decrease of }8\\text{ kg}",
      ],
      answer: 2,
    },
    {
      id: 2,
      type: "mc",
      prompt:
        "Last Christmas, an artist sold 40 postcards at the price of $90 each for charity. This Christmas, the price of each postcard increases by 30% but the number of postcards sold decreases by 15%. Find the percentage change in the amount of money to charity.",
      choices: ["-15\\%", "+15\\%", "-10.5\\%", "+10.5\\%"],
      answer: 3,
    },
    {
      id: 3,
      type: "mc",
      prompt:
        "Bob deposits 50000 in bank A at a simple interest rate of 6% p.a. and $40000 in bank B at a simple interest rate of 7% p.a. Find the total amount he will receive after 10 years.",
      choices: ["\\$148000", "\\$74000", "\\$58000", "\\$12000"],
      answer: 0,
    },
    {
      id: 4,
      type: "mc",
      prompt:
        "A sum of money is deposited in a bank at an interest rate of 12% p.a. compounded yearly. If the interest received after 7 years is $6000, find the principal.\n(Give the answer correct to the nearest $1000.)",
      choices: ["\\$3000", "\\$4000", "\\$5000", "\\$6000"],
      answer: 2,
    },
    {
      id: 5,
      type: "mc",
      prompt:
        "In this financial year, Tom has a total allowance of $140000 and he has to pay a salaries tax of $15300. If his net chargeable income is greater than $150000 but less than $200000, find his annual income.",
      choices: ["\\$109000", "\\$195000", "\\$249000", "\\$335000"],
      answer: 3,
    },
    {
      id: 6,
      type: "mc",
      prompt:
        "The value of an antique oil painting increases at a steady rate of 25% every 5 years. Its present value is $150000.\nFind its value 20 years ago.",
      choices: ["\\$61440", "\\$614400", "\\$150000", "\\$88560"],
      answer: 0,
    },
    {
      id: 7,
      type: "mc",
      prompt:
        "A retailer buys goods for $480 and wants a profit of 25% on the selling price. Find the selling price.",
      choices: ["\\$600", "\\$520", "\\$640", "\\$720"],
      answer: 2,
    },
    {
      id: 8,
      type: "mc",
      prompt:
        "David borrows $5000 from a bank at an interest rate of 7.8% p.a. compounded monthly. Find the amount he should repay after 3 years.\n(Give the answer correct to the nearest dollar.)",
      choices: ["\\$5800", "\\$6000", "\\$6313", "\\$6500"],
      answer: 2,
    },
    {
      id: 9,
      type: "mc",
      prompt:
        "A dress is marked at $960. During a sale, a customer gets a discount of 25% off the marked price, followed by an extra 10% off the reduced price. Find the amount the customer pays.",
      choices: ["\\$648", "\\$720", "\\$672", "\\$864"],
      answer: 0,
    },
    {
      id: 10,
      type: "mc",
      prompt:
        "A car depreciates in value by 12% each year. If its present value is $50000, find its value after 2 years.",
      choices: ["\\$38720", "\\$40000", "\\$44000", "\\$38000"],
      answer: 0,
    },
  ];

  const QUIZ_L01 = [
    {
      id: 1,
      type: "mc",
      prompt: "A number is first decreased by 10% and then increased by 20%. The overall percentage change is",
      choices: ["+8\\%", "+10\\%", "+12\\%", "+18\\%"],
      answer: 0,
    },
    {
      id: 2,
      type: "mc",
      prompt: "After an increase of 15%, a hall has 92 seats. Find the original number of seats.",
      choices: ["78", "80", "85", "88"],
      answer: 1,
    },
    {
      id: 3,
      type: "mc",
      prompt: "Each side of a square is increased by 10%. The percentage change in its area is",
      choices: ["+10\\%", "+20\\%", "+21\\%", "+121\\%"],
      answer: 2,
    },
    {
      id: 4,
      type: "mc",
      prompt: "The value of an antique is $5000 now. If the value increases by 10% per year, find its value after 2 years.",
      choices: ["\\$5500", "\\$6000", "\\$6050", "\\$6100"],
      answer: 2,
    },
    {
      id: 5,
      type: "mc",
      prompt: "A machine is worth $4000 now and depreciates by 20% per year. Find its value after 2 years.",
      choices: ["\\$2400", "\\$2560", "\\$3200", "\\$3600"],
      answer: 1,
    },
  ];

  const QUIZ_L02 = [
    {
      id: 1,
      type: "mc",
      prompt: "$8000 is deposited at 6% p.a. simple interest for 3 years. Find the simple interest.",
      choices: ["\\$1440", "\\$1480", "\\$1520", "\\$9440"],
      answer: 0,
    },
    {
      id: 2,
      type: "mc",
      prompt: "A sum of money is deposited at 5% p.a. simple interest. After 4 years, the amount received is $4800. Find the principal.",
      choices: ["\\$3600", "\\$3840", "\\$4000", "\\$4560"],
      answer: 2,
    },
    {
      id: 3,
      type: "mc",
      prompt: "How many years will it take for $5000, deposited at 8% p.a. simple interest, to earn $1200 interest?",
      choices: ["2", "2.5", "3", "4"],
      answer: 2,
    },
    {
      id: 4,
      type: "mc",
      prompt: "$8000 is deposited at 5% p.a. compounded yearly. Find the compound interest after 2 years.",
      choices: ["\\$800", "\\$820", "\\$840", "\\$880"],
      answer: 1,
    },
    {
      id: 5,
      type: "mc",
      prompt: "$4000 is deposited at 10% p.a. compounded half-yearly. Find the amount after 1 year.",
      choices: ["\\$4400", "\\$4410", "\\$4420", "\\$4440"],
      answer: 1,
    },
  ];

  const QUIZ_L03 = [
    {
      id: 1,
      type: "mc",
      prompt: "Refer to the progressive tax rates below. Amy\u2019s net chargeable income is $30 000. Find her salaries tax.",
      items: [
        { tag: "", tex: "\\text{On the first }\\$50\\,000:\\ 2\\%" },
        { tag: "", tex: "\\text{On the next }\\$50\\,000:\\ 6\\%" },
        { tag: "", tex: "\\text{On the next }\\$50\\,000:\\ 10\\%" },
        { tag: "", tex: "\\text{On the next }\\$50\\,000:\\ 14\\%" },
        { tag: "", tex: "\\text{Remainder: }17\\%" },
      ],
      choices: ["\\$400", "\\$600", "\\$800", "\\$1\\,500"],
      answer: 1,
    },
    {
      id: 2,
      type: "mc",
      prompt: "Using the same tax rates as in Question 1, Ben\u2019s net chargeable income is $80 000. Find his salaries tax.",
      choices: ["\\$1\\,800", "\\$2\\,400", "\\$2\\,800", "\\$4\\,800"],
      answer: 2,
    },
    {
      id: 3,
      type: "mc",
      prompt: "Using the same tax rates as in Question 1, Chris has an annual income of $320 000 and an allowance of $170 000. Find his salaries tax.",
      choices: ["\\$7\\,000", "\\$8\\,000", "\\$9\\,000", "\\$10\\,500"],
      answer: 2,
    },
    {
      id: 4,
      type: "mc",
      prompt: "Using the same tax rates as in Question 1, Dora\u2019s monthly income is $15 000 and her allowance is $200 000. Find her salaries tax.",
      choices: ["\\$0", "\\$400", "\\$800", "\\$3\\,600"],
      answer: 0,
    },
    {
      id: 5,
      type: "mc",
      prompt: "Using the same tax rates as in Question 1, Eric\u2019s monthly income is $22 000 and his allowance is $164 000. Find his salaries tax.",
      choices: ["\\$3\\,000", "\\$4\\,000", "\\$5\\,000", "\\$6\\,400"],
      answer: 1,
    },
  ];

  const QUIZ_SETS = [
    { key: "l01", label: "L01 \u00b7 Percentage Change and Growth or Decay", idPrefix: "pct-l01-q", questions: QUIZ_L01 },
    { key: "l02", label: "L02 \u00b7 Simple Interest and Compound Interest", idPrefix: "pct-l02-q", questions: QUIZ_L02 },
    { key: "l03", label: "L03 \u00b7 Salaries Tax", idPrefix: "pct-l03-q", questions: QUIZ_L03 },
    { key: "practice", label: "Practice \u00b7 10 Questions", idPrefix: "pct-q", questions: QUIZ_PRACTICE },
  ];

  let activeSet = QUIZ_SETS[0];
  let QUIZ = activeSet.questions;

  function kx(el, tex, display) {
    try { katex.render(tex, el, { throwOnError: false, displayMode: !!display }); }
    catch (e) { el.textContent = tex; }
  }

  function checkQuestion(q, answers) {
    return answers[q.id] === q.answer;
  }

  function setReviewBar(progressFill, progressOk, progressBad, score, total) {
    const okShare = total ? score / total : 0;
    const badShare = total ? (total - score) / total : 0;
    if (progressFill) {
      progressFill.style.width = "100%";
      progressFill.style.background = "transparent";
    }
    if (progressOk) progressOk.style.width = Math.round(okShare * 100) + "%";
    if (progressBad) progressBad.style.width = Math.round(badShare * 100) + "%";
  }

  function initQuiz() {
    const root = document.getElementById("quiz-root");
    const progressWrap = document.getElementById("quiz-progress-wrap");
    const progressLabel = document.getElementById("quiz-progress-label");
    const progressFill = document.getElementById("quiz-progress-fill");
    const progressOk = document.getElementById("quiz-progress-ok");
    const progressBad = document.getElementById("quiz-progress-bad");
    const backBtn = document.getElementById("quiz-back");
    const nextBtn = document.getElementById("quiz-next");
    if (!root || !nextBtn) return;

    const state = { index: 0, answers: {}, submitted: false, phase: "quiz" };

    function buildSetBar() {
      const wrap = document.createElement("div");
      wrap.className = "quiz-set-bar";
      QUIZ_SETS.forEach((set) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "quiz-nav-btn quiz-set-btn";
        btn.dataset.set = set.key;
        btn.textContent = set.label;
        btn.addEventListener("click", () => selectSet(set));
        wrap.appendChild(btn);
      });
      const anchor = progressWrap || root;
      if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(wrap, anchor);
      return wrap;
    }

    function syncSetBar() {
      Array.prototype.forEach.call(setBar.children, (btn) => {
        const on = btn.dataset.set === activeSet.key;
        btn.classList.toggle("primary", on);
        btn.setAttribute("aria-pressed", on ? "true" : "false");
      });
    }

    // Each set reuses question ids from 1, so answers must be dropped on switch.
    function selectSet(set) {
      if (set === activeSet) return;
      activeSet = set;
      QUIZ = set.questions;
      state.index = 0;
      state.answers = {};
      state.submitted = false;
      state.phase = "quiz";
      state.activeInputId = null;
      render();
    }

    const setBar = buildSetBar();

    function updateProgress() {
      if (!progressWrap) return;
      if (state.phase === "review") {
        progressWrap.classList.add("done");
        if (progressLabel) progressLabel.textContent = "Results";
        const score = QUIZ.filter((q) => checkQuestion(q, state.answers)).length;
        setReviewBar(progressFill, progressOk, progressBad, score, QUIZ.length);
        return;
      }
      progressWrap.classList.remove("done");
      const n = QUIZ.length;
      const cur = state.index + 1;
      if (progressLabel) progressLabel.textContent = "Question " + cur + " of " + n;
      if (progressFill) {
        progressFill.style.width = Math.round((cur / n) * 100) + "%";
        progressFill.style.background = "";
      }
      if (progressOk) progressOk.style.width = "0%";
      if (progressBad) progressBad.style.width = "0%";
    }

    function updateNav() {
      const last = state.index >= QUIZ.length - 1;
      if (state.phase === "review") {
        if (backBtn) backBtn.classList.add("hidden");
        nextBtn.textContent = "Try again";
        nextBtn.classList.add("retry");
        return;
      }
      nextBtn.classList.remove("retry");
      if (backBtn) backBtn.classList.toggle("hidden", state.index === 0);
      nextBtn.textContent = last ? "Submit" : "Next";
    }

    function render() {
      root.innerHTML = "";
      updateProgress();
      updateNav();
      syncSetBar();
      if (state.phase === "review") { renderReview(); return; }
      const q = QUIZ[state.index];
      if (q) root.appendChild(buildCard(q, false));
    }

    function buildCard(q, reviewMode) {
      const card = document.createElement("article");
      card.className = "quiz-card" + (reviewMode ? " quiz-card-review" : "");
      const ok = checkQuestion(q, state.answers);

      const head = document.createElement("div");
      head.className = "quiz-head";
      const num = document.createElement("span");
      num.className = "quiz-num";
      num.textContent = q.id + ".";
      head.appendChild(num);
      if (q.prompt) {
        const prompt = document.createElement("div");
        prompt.className = "quiz-prompt";
        prompt.textContent = q.prompt;
        head.appendChild(prompt);
      }
      if (reviewMode) {
        const mark = document.createElement("span");
        mark.className = "quiz-mark " + (ok ? "ok" : "bad");
        mark.textContent = ok ? "\u2713" : "\u2717";
        head.appendChild(mark);
      }
      card.appendChild(head);

      const content = document.createElement("div");
      content.className = "quiz-content";
      if (q.stem) {
        const stem = document.createElement("div");
        stem.className = "quiz-stem";
        kx(stem, q.stem, false);
        content.appendChild(stem);
      }
      if (q.items) {
        const list = document.createElement("div");
        list.className = "quiz-item-list";
        q.items.forEach((item) => {
          const row = document.createElement("div");
          row.className = "quiz-item-row";
          if (item.tag) {
            const tag = document.createElement("span");
            tag.className = "quiz-item-tag";
            tag.textContent = item.tag;
            row.appendChild(tag);
          }
          const tex = document.createElement("span");
          tex.className = "quiz-item-tex";
          kx(tex, item.tex);
          row.appendChild(tex);
          list.appendChild(row);
        });
        content.appendChild(list);
      }
      const body = document.createElement("div");
      body.className = "quiz-body";
      body.appendChild(buildMc(q, reviewMode));
      content.appendChild(body);
      card.appendChild(content);

      if (reviewMode && !ok) card.appendChild(buildCorrectBlock(q));
      return card;
    }

    function buildCorrectBlock(q) {
      const block = document.createElement("div");
      block.className = "quiz-result";
      const msg = document.createElement("span");
      msg.className = "quiz-result-msg";
      msg.textContent = "Correct answer: ";
      const ans = document.createElement("span");
      ans.className = "quiz-ans-tex";
      kx(ans, q.choices[q.answer]);
      msg.appendChild(ans);
      block.appendChild(msg);
      return block;
    }

    function buildMc(q, reviewMode) {
      const list = document.createElement("div");
      list.className = "quiz-mc";
      const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      q.choices.forEach((tex, i) => {
        const label = document.createElement("label");
        label.className = "quiz-mc-opt";
        if (reviewMode) label.classList.add("locked");
        const inp = document.createElement("input");
        inp.type = "radio";
        inp.name = reviewMode ? "review-q-" + q.id : "q-" + q.id;
        inp.value = String(i);
        inp.disabled = reviewMode;
        if (state.answers[q.id] === i) inp.checked = true;
        if (!reviewMode) inp.addEventListener("change", () => { state.answers[q.id] = i; });
        label.appendChild(inp);
        const letter = document.createElement("span");
        letter.className = "quiz-mc-letter";
        letter.textContent = letters[i] + ".";
        label.appendChild(letter);
        const math = document.createElement("span");
        math.className = "quiz-mc-tex";
        kx(math, tex);
        label.appendChild(math);
        if (reviewMode) {
          if (i === q.answer) label.classList.add("reveal-ok");
          if (state.answers[q.id] === i && i !== q.answer) label.classList.add("reveal-bad");
        }
        list.appendChild(label);
      });
      return list;
    }

    function renderReview() {
      const score = QUIZ.filter((q) => checkQuestion(q, state.answers)).length;
      const header = document.createElement("div");
      header.className = "quiz-review-header";
      const h2 = document.createElement("h2");
      h2.textContent = score + " / " + QUIZ.length + " correct";
      header.appendChild(h2);
      root.appendChild(header);
      QUIZ.forEach((q) => root.appendChild(buildCard(q, true)));
    }

    if (backBtn) {
      backBtn.addEventListener("click", () => {
        if (state.phase === "review") return;
        if (state.index > 0) { state.index--; render(); }
      });
    }

    nextBtn.addEventListener("click", () => {
      if (state.phase === "review") {
        state.index = 0;
        state.answers = {};
        state.submitted = false;
        state.phase = "quiz";
        render();
        return;
      }
      if (state.index >= QUIZ.length - 1) {
        state.submitted = true;
        state.phase = "review";
        try {
          QUIZ.forEach(function(q) {
            var userAnswerIdx = state.answers[q.id];
            var isCorrect = userAnswerIdx === q.answer;
            var payload = {
              type: 'uniplus:quizAnswer',
              subject: 'MATH',
              quizId: 'Perc2',
              questionId: activeSet.idPrefix + q.id,
              section: 'JM27 Percentages II',
              difficulty: 'standard',
              stem: q.stem || q.prompt || null,
              selectedAnswer: userAnswerIdx !== undefined ? String(userAnswerIdx) : null,
              selectedAnswerText: userAnswerIdx !== undefined ? (q.choices[userAnswerIdx] || null) : null,
              correctAnswer: String(q.answer),
              correctAnswerText: q.choices[q.answer] || null,
              isCorrect: isCorrect,
              attemptNumber: 1,
              msTaken: 0
            };
            // Send to the immediate parent (dashboard/index.html, where the tracker
            // and session relay live). window.postMessage() alone only targets this
            // same window and never reaches the tracker in the outer frame.
            window.parent.postMessage(payload, '*');
            if (window.top !== window.parent) {
              try { window.top.postMessage(payload, '*'); } catch (_) {}
            }
          });
        } catch(_) {}
        render();
        return;
      }
      state.index++;
      render();
    });

    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initQuiz);
  } else {
    initQuiz();
  }
})();
