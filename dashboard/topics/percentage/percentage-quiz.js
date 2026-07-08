/* Percentage quiz — Pre S3 L04–06; paginated MC (10), progress bar */
(function () {
  "use strict";

  const QUIZ = [
    {
      id: 1,
      type: "mc",
      prompt: "A panda was originally 80 kg. Its weight first decreased by 10% due to illness, then increased by 10% after recovery.",
      stem: "\\text{What was the change in weight compared with the original?}",
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
      prompt: "Last Christmas, 40 postcards were sold at $90 each. This Christmas, price +30% and quantity sold −15%.",
      stem: "\\text{Find the percentage change in money to charity.}",
      choices: ["-15\\%", "+15\\%", "-10.5\\%", "+10.5\\%"],
      answer: 3,
    },
    {
      id: 3,
      type: "mc",
      prompt: "Bob deposits $50000 at 6% p.a. simple interest and $40000 at 7% p.a. simple interest for 10 years.",
      stem: "\\text{Find the total amount he will receive.}",
      choices: ["\\$148000", "\\$74000", "\\$58000", "\\$12000"],
      answer: 0,
    },
    {
      id: 4,
      type: "mc",
      prompt: "A sum is deposited at 12% p.a. compounded yearly. The interest after 7 years is $6000.",
      stem: "\\text{Find the principal (nearest \\$1000).}",
      choices: ["\\$3000", "\\$4000", "\\$5000", "\\$6000"],
      answer: 2,
    },
    {
      id: 5,
      type: "mc",
      prompt: "Tom has allowance $140000 and pays salaries tax $15300. His net chargeable income is between $150000 and $200000.",
      stem: "\\text{Find his annual income.}",
      choices: ["\\$109000", "\\$195000", "\\$249000", "\\$335000"],
      answer: 3,
    },
    {
      id: 6,
      type: "mc",
      prompt: "An antique painting increases by 25% every 5 years. Its present value is $150000.",
      stem: "\\text{Find its value 20 years ago.}",
      choices: ["\\$61440", "\\$614400", "\\$150000", "\\$88560"],
      answer: 0,
    },
    {
      id: 7,
      type: "mc",
      prompt: "An antique painting increases by 25% every 5 years. Its present value is $150000.",
      stem: "\\text{Find the increase in value over the past 20 years.}",
      choices: ["\\$61440", "\\$88560", "\\$150000", "\\$885600"],
      answer: 1,
    },
    {
      id: 8,
      type: "mc",
      prompt: "David borrows $5000 at 7.8% p.a. compounded monthly.",
      stem: "\\text{Find the amount to repay after 3 years (nearest dollar).}",
      choices: ["\\$5800", "\\$6000", "\\$6313", "\\$6500"],
      answer: 2,
    },
    {
      id: 9,
      type: "mc",
      prompt: "Bank X: 4% p.a. compounded half-yearly. Bank Y: 2% p.a. compounded quarterly. Both for 10 years.",
      stem: "\\text{Susan claims Bank X gives more interest. Do you agree?}",
      choices: [
        "\\text{Agree — Bank X gives more interest}",
        "\\text{Disagree — Bank Y gives more interest}",
        "\\text{Disagree — both give the same interest}",
        "\\text{Agree — Bank X gives less interest}",
      ],
      answer: 0,
    },
    {
      id: 10,
      type: "mc",
      prompt: "Bank X: 4% p.a. compounded half-yearly. Bank Y: 2% p.a. compounded quarterly. Both for 10 years.",
      stem: "\\text{Which bank gives more interest?}",
      choices: [
        "\\text{Bank X}",
        "\\text{Bank Y}",
        "\\text{Both give the same interest}",
        "\\text{Cannot be determined}",
      ],
      answer: 0,
    },
  ];

  function kx(el, tex, display) {
    try { katex.render(tex, el, { throwOnError: false, displayMode: !!display }); }
    catch (e) { el.textContent = tex; }
  }

  function checkQuestion(q, answers) {
    return answers[q.id] === q.answer;
  }

  function initQuiz() {
    const root = document.getElementById("quiz-root");
    const progressWrap = document.getElementById("quiz-progress-wrap");
    const progressLabel = document.getElementById("quiz-progress-label");
    const progressFill = document.getElementById("quiz-progress-fill");
    const backBtn = document.getElementById("quiz-back");
    const nextBtn = document.getElementById("quiz-next");
    if (!root || !nextBtn) return;

    const state = { index: 0, answers: {}, submitted: false, phase: "quiz" };

    function updateProgress() {
      if (!progressWrap) return;
      if (state.phase === "review") {
        progressWrap.classList.add("done");
        if (progressLabel) progressLabel.textContent = "Results";
        if (progressFill) progressFill.style.width = "100%";
        return;
      }
      progressWrap.classList.remove("done");
      const n = QUIZ.length;
      const cur = state.index + 1;
      if (progressLabel) progressLabel.textContent = "Question " + cur + " of " + n;
      if (progressFill) progressFill.style.width = Math.round((cur / n) * 100) + "%";
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
        const prompt = document.createElement("span");
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
        kx(stem, q.stem, true);
        content.appendChild(stem);
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
              quizId: 'math-percentages',
              questionId: 'pct-q' + q.id,
              section: 'percentages',
              difficulty: 'standard',
              stem: q.stem || null,
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
