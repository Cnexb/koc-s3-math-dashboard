/* Probability quiz — Pre S3 L10–12; paginated MC (10), progress bar */
(function () {
  "use strict";

  const FIG = "quiz-figures/";

  const QUIZ = [
    {
      id: 1,
      type: "mc",
      prompt: "A letter is chosen at random from the word UNIVERSITY.",
      stem: "P(\\text{vowel})",
      choices: ["\\frac{1}{5}", "\\frac{3}{10}", "\\frac{2}{5}", "\\frac{1}{2}"],
      answer: 2,
    },
    {
      id: 2,
      type: "mc",
      prompt: "Samuel randomly chooses bus, taxi or MTR on each of two working days.",
      stem: "P(\\text{same transport on both days})",
      choices: ["\\frac{2}{3}", "\\frac{1}{3}", "\\frac{1}{4}", "\\frac{3}{5}"],
      answer: 1,
    },
    {
      id: 3,
      type: "mc",
      prompt: "A box has 20 basketballs and 35 tennis balls. A ball is drawn at random, replaced, and this is repeated 385 times.",
      stem: "\\text{Find the expected number of tennis balls drawn.}",
      choices: ["20", "35", "140", "245"],
      answer: 3,
    },
    {
      id: 4,
      type: "mc",
      prompt: "Dylan spins the fortune wheel once. He wins if the pointer lands on region c, e or g.",
      stem: "P(\\text{prize})",
      figures: [{ src: FIG + "q4-wheel.png", alt: "Circular fortune wheel with sectors a to g" }],
      choices: ["\\frac{1}{4}", "\\frac{1}{6}", "\\frac{1}{10}", "\\frac{1}{12}"],
      answer: 0,
    },
    {
      id: 5,
      type: "mc",
      prompt: "A bag contains five $1.4 stamps, five $0.2 stamps and ten $0.1 stamps.",
      stem: "\\text{Find the expected face value of one stamp drawn at random.}",
      choices: ["\\$0.35", "\\$0.4", "\\$0.45", "\\$0.5"],
      answer: 2,
    },
    {
      id: 6,
      type: "mc",
      prompt: "There are 24 bottles of water and x bottles of tea on a table.",
      stem: "P(\\text{tea})=\\dfrac{3}{5}\\text{. Find }x.",
      choices: ["36", "38", "40", "42"],
      answer: 0,
    },
    {
      id: 7,
      type: "mc",
      prompt: "6\\pi is a 2-digit number, where \\pi is an integer from 0 to 9 inclusive.",
      stem: "P(\\text{the number is divisible by 5})",
      choices: ["\\frac{1}{10}", "\\frac{1}{5}", "\\frac{2}{5}", "\\frac{1}{2}"],
      answer: 1,
    },
    {
      id: 8,
      type: "mc",
      prompt: "2000 candidates sit an examination.",
      stem: "P(\\text{female})=\\dfrac{11}{20}\\text{. Find the number of male candidates.}",
      choices: ["800", "900", "1000", "1100"],
      answer: 1,
    },
    {
      id: 9,
      type: "mc",
      prompt: "Two fair dice are thrown at the same time.",
      stem: "P(\\text{sum of the two numbers} < 9)",
      choices: ["\\frac{5}{9}", "\\frac{13}{18}", "\\frac{2}{3}", "\\frac{4}{9}"],
      answer: 1,
    },
    {
      id: 10,
      type: "mc",
      prompt: "Winnie's purse: two $2 coins, one $5 coin and one $10 coin. Two coins are taken out at random.",
      stem: "\\text{Find the expected donation amount.}",
      choices: ["\\$7", "\\$8.5", "\\$9.5", "\\$10"],
      answer: 2,
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

    function buildFigures(figs) {
      const wrap = document.createElement("div");
      wrap.className = "quiz-figure";
      figs.forEach((fig) => {
        const img = document.createElement("img");
        img.src = fig.src;
        img.alt = fig.alt || "Figure";
        img.loading = "lazy";
        wrap.appendChild(img);
      });
      return wrap;
    }

    function buildCard(q, reviewMode) {
      const card = document.createElement("article");
      card.className = "quiz-card" + (reviewMode ? " quiz-card-review" : "");
      if (q.figures && q.figures.length) card.classList.add("has-figure");
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

      if (q.figures && q.figures.length) {
        const main = document.createElement("div");
        main.className = "quiz-main";
        main.appendChild(content);
        main.appendChild(buildFigures(q.figures));
        card.appendChild(main);
      } else {
        card.appendChild(content);
      }

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
