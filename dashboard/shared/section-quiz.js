/* Section quiz — paginated MC with a session picker, progress bar, submit on last → all results.
 *
 * A topic page loads this file, then calls:
 *   SectionQuiz.init({
 *     quizId: "Quad",                 // Excel topic symbol, stored as math_quiz_attempts.quiz_id
 *     section: "JM29 Quadrilaterals", // stored as math_quiz_attempts.section
 *     sets: [{ key, label, idPrefix, questions: [{ id, prompt, stem?, items?, choices, answer }] }]
 *   });
 *
 * prompt, items[].text and choices are text; wrap maths in \( … \).
 * stem is a KaTeX expression shown on its own line.
 */
(function () {
  "use strict";

  function kx(el, tex) {
    try { katex.render(tex, el, { throwOnError: false, displayMode: false }); }
    catch (e) { el.textContent = tex; }
  }

  function rich(el, str) {
    String(str).split(/\\\((.+?)\\\)/g).forEach(function (part, i) {
      if (!part) return;
      if (i % 2) {
        const span = document.createElement("span");
        kx(span, part);
        el.appendChild(span);
      } else {
        el.appendChild(document.createTextNode(part));
      }
    });
  }

  function init(config) {
    const sets = config.sets;
    let activeSet = sets[0];
    let QUIZ = activeSet.questions;

    const root = document.getElementById("quiz-root");
    const progressWrap = document.getElementById("quiz-progress-wrap");
    const progressLabel = document.getElementById("quiz-progress-label");
    const progressFill = document.getElementById("quiz-progress-fill");
    const progressOk = document.getElementById("quiz-progress-ok");
    const progressBad = document.getElementById("quiz-progress-bad");
    const backBtn = document.getElementById("quiz-back");
    const nextBtn = document.getElementById("quiz-next");
    if (!root || !nextBtn) return;

    const state = { index: 0, answers: {}, phase: "quiz" };

    function checkQuestion(q) { return state.answers[q.id] === q.answer; }

    function buildSetBar() {
      const wrap = document.createElement("div");
      wrap.className = "quiz-set-bar";
      sets.forEach(function (set) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "quiz-nav-btn quiz-set-btn";
        btn.dataset.set = set.key;
        btn.textContent = set.label;
        btn.addEventListener("click", function () { selectSet(set); });
        wrap.appendChild(btn);
      });
      const anchor = progressWrap || root;
      anchor.parentNode.insertBefore(wrap, anchor);
      return wrap;
    }

    function syncSetBar() {
      Array.prototype.forEach.call(setBar.children, function (btn) {
        const on = btn.dataset.set === activeSet.key;
        btn.classList.toggle("primary", on);
        btn.setAttribute("aria-pressed", on ? "true" : "false");
      });
    }

    // Each set reuses question ids 1-5, so answers must be dropped on switch.
    function selectSet(set) {
      if (set === activeSet) return;
      activeSet = set;
      QUIZ = set.questions;
      state.index = 0;
      state.answers = {};
      state.phase = "quiz";
      render();
    }

    const setBar = buildSetBar();

    function updateProgress() {
      if (!progressWrap) return;
      if (state.phase === "review") {
        progressWrap.classList.add("done");
        if (progressLabel) progressLabel.textContent = "Results";
        const total = QUIZ.length;
        const score = QUIZ.filter(checkQuestion).length;
        if (progressFill) {
          progressFill.style.width = "100%";
          progressFill.style.background = "transparent";
        }
        if (progressOk) progressOk.style.width = Math.round((score / total) * 100) + "%";
        if (progressBad) progressBad.style.width = Math.round(((total - score) / total) * 100) + "%";
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
      if (state.phase === "review") {
        if (backBtn) backBtn.classList.add("hidden");
        nextBtn.textContent = "Try again";
        nextBtn.classList.add("retry");
        return;
      }
      nextBtn.classList.remove("retry");
      if (backBtn) backBtn.classList.toggle("hidden", state.index === 0);
      nextBtn.textContent = state.index >= QUIZ.length - 1 ? "Submit" : "Next";
    }

    function render() {
      root.innerHTML = "";
      updateProgress();
      updateNav();
      syncSetBar();
      if (state.phase === "review") {
        renderReview();
        return;
      }
      const q = QUIZ[state.index];
      if (q) root.appendChild(buildCard(q, false));
    }

    function buildCard(q, reviewMode) {
      const card = document.createElement("article");
      card.className = "quiz-card" + (reviewMode ? " quiz-card-review" : "");
      const ok = checkQuestion(q);

      const head = document.createElement("div");
      head.className = "quiz-head";
      const num = document.createElement("span");
      num.className = "quiz-num";
      num.textContent = q.id + ".";
      head.appendChild(num);
      const prompt = document.createElement("span");
      prompt.className = "quiz-prompt";
      rich(prompt, q.prompt);
      head.appendChild(prompt);
      if (reviewMode) {
        const mark = document.createElement("span");
        mark.className = "quiz-mark " + (ok ? "ok" : "bad");
        mark.textContent = ok ? "\u2713" : "\u2717";
        head.appendChild(mark);
      }
      card.appendChild(head);

      if (q.stem) {
        const stem = document.createElement("div");
        stem.className = "quiz-stem";
        kx(stem, q.stem);
        card.appendChild(stem);
      }

      if (q.items) {
        const list = document.createElement("div");
        list.className = "quiz-item-list";
        q.items.forEach(function (item) {
          const row = document.createElement("div");
          row.className = "quiz-item-row";
          const tag = document.createElement("span");
          tag.className = "quiz-item-tag";
          tag.textContent = item.tag;
          row.appendChild(tag);
          const txt = document.createElement("span");
          txt.className = "quiz-item-tex";
          rich(txt, item.text);
          row.appendChild(txt);
          list.appendChild(row);
        });
        card.appendChild(list);
      }

      const body = document.createElement("div");
      body.className = "quiz-body";
      body.appendChild(buildMc(q, reviewMode));
      card.appendChild(body);

      if (reviewMode && !ok) {
        const block = document.createElement("div");
        block.className = "quiz-result";
        const msg = document.createElement("span");
        msg.className = "quiz-result-msg";
        msg.textContent = "Correct answer: ";
        const ans = document.createElement("span");
        ans.className = "quiz-ans-tex";
        rich(ans, "ABCD"[q.answer] + ". " + q.choices[q.answer]);
        msg.appendChild(ans);
        block.appendChild(msg);
        card.appendChild(block);
      }
      return card;
    }

    function buildMc(q, reviewMode) {
      const list = document.createElement("div");
      list.className = "quiz-mc";
      q.choices.forEach(function (text, i) {
        const label = document.createElement("label");
        label.className = "quiz-mc-opt";
        if (reviewMode) label.classList.add("locked");
        const inp = document.createElement("input");
        inp.type = "radio";
        inp.name = (reviewMode ? "review-q-" : "q-") + q.id;
        inp.value = String(i);
        inp.disabled = reviewMode;
        if (state.answers[q.id] === i) inp.checked = true;
        if (!reviewMode) inp.addEventListener("change", function () { state.answers[q.id] = i; });
        label.appendChild(inp);
        const letter = document.createElement("span");
        letter.className = "quiz-mc-letter";
        letter.textContent = "ABCD"[i] + ".";
        label.appendChild(letter);
        const txt = document.createElement("span");
        txt.className = "quiz-mc-tex";
        rich(txt, text);
        label.appendChild(txt);
        if (reviewMode) {
          if (i === q.answer) label.classList.add("reveal-ok");
          if (state.answers[q.id] === i && i !== q.answer) label.classList.add("reveal-bad");
        }
        list.appendChild(label);
      });
      return list;
    }

    function renderReview() {
      const score = QUIZ.filter(checkQuestion).length;
      const header = document.createElement("div");
      header.className = "quiz-review-header";
      const h2 = document.createElement("h2");
      h2.textContent = score + " / " + QUIZ.length + " correct";
      header.appendChild(h2);
      root.appendChild(header);
      QUIZ.forEach(function (q) { root.appendChild(buildCard(q, true)); });
    }

    function sendAttempts() {
      const meta = {
        quizId: config.quizId,
        idPrefix: activeSet.idPrefix,
        section: config.section,
        stemMode: "stem-or-prompt",
        answerTextMode: "always-choices",
      };
      if (window.MathQuizTracker) {
        window.MathQuizTracker.reportQuiz(meta, QUIZ, state.answers);
        return;
      }
      QUIZ.forEach(function (q) {
        const picked = state.answers[q.id];
        const payload = {
          type: "uniplus:quizAnswer",
          subject: "MATH",
          quizId: config.quizId,
          questionId: activeSet.idPrefix + q.id,
          section: config.section,
          difficulty: "standard",
          stem: q.stem || q.prompt || null,
          selectedAnswer: picked !== undefined ? String(picked) : null,
          selectedAnswerText: picked !== undefined ? (q.choices[picked] || null) : null,
          correctAnswer: String(q.answer),
          correctAnswerText: q.choices[q.answer] || null,
          isCorrect: picked === q.answer,
          attemptNumber: 1,
          msTaken: 0,
        };
        window.parent.postMessage(payload, "*");
        if (window.top !== window.parent) {
          try { window.top.postMessage(payload, "*"); } catch (_) {}
        }
      });
    }

    if (backBtn) {
      backBtn.addEventListener("click", function () {
        if (state.phase === "review" || state.index === 0) return;
        state.index--;
        render();
      });
    }

    nextBtn.addEventListener("click", function () {
      if (state.phase === "review") {
        state.index = 0;
        state.answers = {};
        state.phase = "quiz";
        render();
        return;
      }
      if (state.index >= QUIZ.length - 1) {
        state.phase = "review";
        try { sendAttempts(); } catch (_) {}
        render();
        return;
      }
      state.index++;
      render();
    });

    render();
  }

  window.SectionQuiz = {
    init: function (config) {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function () { init(config); });
      } else {
        init(config);
      }
    },
  };
})();
