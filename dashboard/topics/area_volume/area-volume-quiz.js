/* Area & Volume quiz — Pre S3 L07–09; paginated MC (10), figures beside stems */
(function () {
  "use strict";

  const FIG = "quiz-figures/";

  const QUIZ = [
    {
      id: 1,
      type: "mc",
      stem: "\\text{What is the volume of the pyramid?}",
      figures: [{ src: FIG + "q1-pyramid.png", alt: "Right pyramid with base 5 cm, 12 cm and height 16 cm" }],
      choices: ["320\\text{ cm}^3", "230\\text{ cm}^3", "160\\text{ cm}^3", "80\\text{ cm}^3"],
      answer: 2,
    },
    {
      id: 2,
      type: "mc",
      prompt: "The cone and cylinder have the same volume. Cone: height 4 cm, radius 3 cm. Cylinder: radius 2 cm.",
      stem: "\\text{Find the height of the cylinder.}",
      figures: [
        { src: FIG + "q2-cone.png", alt: "Cone height 4 cm, radius 3 cm" },
        { src: FIG + "q2-cylinder.png", alt: "Cylinder radius 2 cm" },
      ],
      choices: ["2\\text{ cm}", "3\\text{ cm}", "4\\text{ cm}", "6\\text{ cm}"],
      answer: 1,
    },
    {
      id: 3,
      type: "mc",
      prompt: "27 spheres of radius 3 cm are melted and recast into one large sphere.",
      stem: "\\text{Find the surface area of the large sphere (in terms of }\\pi\\text{).}",
      choices: ["36\\pi\\text{ cm}^2", "162\\pi\\text{ cm}^2", "324\\pi\\text{ cm}^2", "972\\pi\\text{ cm}^2"],
      answer: 2,
    },
    {
      id: 4,
      type: "mc",
      stem: "\\text{The surface area of a sphere is }64\\pi\\text{ cm}^2\\text{. Find its volume.}",
      choices: [
        "\\frac{64}{3}\\pi\\text{ cm}^3",
        "\\frac{128}{3}\\pi\\text{ cm}^3",
        "64\\pi\\text{ cm}^3",
        "\\frac{256}{3}\\pi\\text{ cm}^3",
      ],
      answer: 3,
    },
    {
      id: 5,
      type: "mc",
      prompt: "An inverted cone contains 324 cm³ of water. The depth of water is \\frac{3}{5} of the height of the vessel.",
      stem: "\\text{Find the capacity of the vessel.}",
      figures: [{ src: FIG + "q5-vessel.png", alt: "Inverted cone partially filled with water" }],
      choices: ["540\\text{ cm}^3", "750\\text{ cm}^3", "1250\\text{ cm}^3", "1500\\text{ cm}^3"],
      answer: 3,
    },
    {
      id: 6,
      type: "mc",
      prompt: "A hemisphere (upper) and a cylinder (lower) share base radius 4 mm. The cylinder height is 10 mm.",
      stem: "\\text{Find the volume of the component (3 s.f.).}",
      figures: [{ src: FIG + "q6-component.png", alt: "Hemisphere on top of a cylinder, radius 4 mm" }],
      choices: ["288\\text{ mm}^3", "503\\text{ mm}^3", "637\\text{ mm}^3", "800\\text{ mm}^3"],
      answer: 2,
    },
    {
      id: 7,
      type: "mc",
      prompt: "A solid right pyramid has a square base of side 10 cm and height 12 cm.",
      stem: "\\text{Find the total surface area of the pyramid.}",
      figures: [{ src: FIG + "q7-pyramid.png", alt: "Square-based right pyramid, base 10 cm, height 12 cm" }],
      choices: ["260\\text{ cm}^2", "300\\text{ cm}^2", "360\\text{ cm}^2", "400\\text{ cm}^2"],
      answer: 2,
    },
    {
      id: 8,
      type: "mc",
      prompt: "A vertical conical vessel contains water. The ratio of curved surface area (vessel) to curved surface area (water) is 36 : 25.",
      stem: "\\text{Find the ratio of the base radius of the vessel to the radius of the water surface.}",
      figures: [{ src: FIG + "q8-vessel.png", alt: "Conical vessel with water inside" }],
      choices: ["5:6", "6:5", "25:36", "36:25"],
      answer: 1,
    },
    {
      id: 9,
      type: "mc",
      prompt: "The vessel contains 600 cm³ of water. Alex claims that adding 300 cm³ will make the water overflow.",
      stem: "\\text{Do you agree?}",
      figures: [{ src: FIG + "q8-vessel.png", alt: "Conical vessel with water inside" }],
      choices: [
        "\\text{Agree — the water will overflow}",
        "\\text{Disagree — the water will not overflow}",
        "\\text{Agree — total water would be }900\\text{ cm}^3",
        "\\text{Disagree — capacity is only }600\\text{ cm}^3",
      ],
      answer: 1,
    },
    {
      id: 10,
      type: "mc",
      prompt: "The vessel contains 600 cm³ of water (same conical vessel as above).",
      stem: "\\text{Find the capacity of the vessel.}",
      figures: [{ src: FIG + "q8-vessel.png", alt: "Conical vessel with water inside" }],
      choices: ["900\\text{ cm}^3", "1040\\text{ cm}^3", "1250\\text{ cm}^3", "1500\\text{ cm}^3"],
      answer: 1,
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
      wrap.className = "quiz-figure" + (figs.length > 1 ? " quiz-figure-stack" : "");
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
        try {
          QUIZ.forEach(function(q) {
            var userAnswerIdx = state.answers[q.id];
            var isCorrect = userAnswerIdx === q.answer;
            var payload = {
              type: 'uniplus:quizAnswer',
              subject: 'MATH',
              quizId: 'math-area-volume',
              questionId: 'av-q' + q.id,
              section: 'area-volume',
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
            // Also broadcast to top, in case this file is ever loaded with a
            // different iframe depth than the current 3-level structure.
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
