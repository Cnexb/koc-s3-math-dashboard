/* Percentage quiz  EPre S3 L04 E6; paginated MC (10), progress bar */
(function () {
  "use strict";

  const QUIZ = (window.MATH_QUIZ_BANKS || {})['percentages'];
  if (!QUIZ) return;


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
          if (window.MathQuizTracker) {
            window.MathQuizTracker.reportQuiz(
              window.MathQuizTracker.QUIZ_META['percentages'],
              QUIZ,
              state.answers,
              function (q, answers) {
                var userAnswerIdx = answers[q.id];
                return userAnswerIdx === q.answer;
              }
            );
          }
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
