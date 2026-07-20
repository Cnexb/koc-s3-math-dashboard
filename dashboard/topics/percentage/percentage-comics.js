/* Percentage comics — story concepts + per-page concept checks.
   Completely separate from percentage-quiz.js (does not touch QUIZ data). */
(function () {
  "use strict";

  const COMICS = [
    {
      id: "calculator-deal",
      title: "The Calculator Deal",
      chapter: "Ch.1 · Successive discounts",
      image: "comics/01-calculator-deal.png",
      checks: [
        {
          id: "c1q1",
          prompt:
            "A calculator costs HK$240. After 15% off, then another 10% off the discounted price, what is the final price?",
          choices: [
            "HK$180",
            "HK$183.60",
            "HK$204",
            "HK$216",
          ],
          answer: 1,
          explain:
            "Successive discounts: 240 × 85% × 90% = 204 × 0.9 = HK$183.60. Not 15% + 10% = 25% off.",
        },
        {
          id: "c1q2",
          prompt:
            "True or false: a 15% discount followed by a 10% discount is the same as a single 25% discount.",
          choices: ["True", "False"],
          answer: 1,
          explain:
            "False. The second 10% is taken from the reduced price, so the overall discount is less than 25%.",
        },
      ],
    },
    {
      id: "comic-con-sales",
      title: "Comic-Con Sales",
      chapter: "Ch.2 · Cost, marked & selling price",
      image: "comics/02-comic-con-sales.png",
      checks: [
        {
          id: "c2q1",
          prompt:
            "A bookmark has cost price HK$20 and marked price HK$40. After 25% off the marked price, what is the selling price?",
          choices: ["HK$10", "HK$20", "HK$30", "HK$40"],
          answer: 2,
          explain:
            "Discount = 40 × 25% = HK$10. Selling price = marked − discount = 40 − 10 = HK$30.",
        },
        {
          id: "c2q2",
          prompt:
            "With cost HK$20 and selling price HK$30, what is the profit percentage (based on cost)?",
          choices: ["25%", "33⅓%", "50%", "150%"],
          answer: 2,
          explain:
            "Profit = 30 − 20 = HK$10. Profit % = 10 ÷ 20 × 100% = 50%. The base is the cost price.",
        },
      ],
    },
    {
      id: "simple-interest",
      title: "Simple or Compound?",
      chapter: "Ch.3 · Simple interest",
      image: "comics/03-simple-interest.png",
      checks: [
        {
          id: "c3q1",
          prompt:
            "Principal HK$5,000 at 4% p.a. simple interest for 3 years. What is the final amount?",
          choices: ["HK$5,200", "HK$5,600", "HK$5,624.32", "HK$6,000"],
          answer: 1,
          explain:
            "I = P × r × t = 5000 × 4% × 3 = HK$600. Final amount = 5000 + 600 = HK$5,600.",
        },
        {
          id: "c3q2",
          prompt:
            "With simple interest, interest each year is calculated on:",
          choices: [
            "the original principal only",
            "the growing balance",
            "the previous year’s interest only",
            "the final amount",
          ],
          answer: 0,
          explain:
            "Simple interest always uses the original principal, so each year earns the same interest.",
        },
      ],
    },
    {
      id: "compound-interest",
      title: "Interest on Interest",
      chapter: "Ch.4 · Compound interest",
      image: "comics/04-compound-interest.png",
      checks: [
        {
          id: "c4q1",
          prompt:
            "HK$5,000 at 4% p.a. compounded annually for 3 years. End-of-year-2 balance is:",
          choices: ["HK$5,200.00", "HK$5,408.00", "HK$5,600.00", "HK$5,624.32"],
          answer: 1,
          explain:
            "Year 1: 5000 × 1.04 = 5200. Year 2: 5200 × 1.04 = HK$5,408.00.",
        },
        {
          id: "c4q2",
          prompt:
            "Same principal, rate and term. Which gives the most money?",
          choices: [
            "Simple interest",
            "Compounded annually",
            "Compounded monthly",
            "They are all equal",
          ],
          answer: 2,
          explain:
            "More frequent compounding lets interest earn interest sooner. Monthly (≈ HK$5,636.36) beats annual and simple.",
        },
      ],
    },
    {
      id: "who-is-the-base",
      title: "Who Is the Base?",
      chapter: "Ch.5 · Comparison base",
      image: "comics/05-who-is-the-base.png",
      checks: [
        {
          id: "c5q1",
          prompt:
            "Ava has HK$7,500. Ben has HK$5,000. Ava’s savings are 50% more than Ben’s. The difference HK$2,500 is 50% of:",
          choices: [
            "Ava’s HK$7,500",
            "Ben’s HK$5,000",
            "their total HK$12,500",
            "HK$10,000",
          ],
          answer: 1,
          explain:
            "“50% more than Ben’s” makes Ben’s amount the base: 5000 × 50% = 2500.",
        },
        {
          id: "c5q2",
          prompt:
            "If A is 50% more than B, then B is how much less than A?",
          choices: ["50% less", "33⅓% less", "25% less", "150% less"],
          answer: 1,
          explain:
            "Same difference, but now A is the base: 2500 ÷ 7500 × 100% = 33⅓%. The amount after “than” is the base.",
        },
      ],
    },
  ];

  function initComics() {
    const panel = document.getElementById("panel-comics");
    const subnav = document.getElementById("comics-subnav");
    const stage = document.getElementById("comics-stage");
    if (!panel || !subnav || !stage) return;

    const state = { index: 0, answers: {} };

    COMICS.forEach(function (comic, i) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip" + (i === 0 ? " active" : "");
      btn.dataset.comic = comic.id;
      btn.textContent = comic.title;
      btn.addEventListener("click", function () {
        state.index = i;
        subnav.querySelectorAll(".chip").forEach(function (c) {
          c.classList.toggle("active", c === btn);
        });
        render();
      });
      subnav.appendChild(btn);
    });

    function render() {
      const comic = COMICS[state.index];
      stage.innerHTML = "";

      const article = document.createElement("article");
      article.className = "comic-page";

      const head = document.createElement("div");
      head.className = "comic-page-head";
      const chap = document.createElement("span");
      chap.className = "comic-chapter";
      chap.textContent = comic.chapter;
      const title = document.createElement("h2");
      title.textContent = comic.title;
      head.appendChild(chap);
      head.appendChild(title);
      article.appendChild(head);

      const fig = document.createElement("figure");
      fig.className = "comic-figure";
      const img = document.createElement("img");
      img.src = comic.image;
      img.alt = comic.title + " — educational comic page";
      img.loading = "lazy";
      fig.appendChild(img);
      article.appendChild(fig);

      const checkWrap = document.createElement("div");
      checkWrap.className = "comic-checks";
      const checkTitle = document.createElement("h3");
      checkTitle.textContent = "Concept checking";
      checkWrap.appendChild(checkTitle);

      comic.checks.forEach(function (q, qi) {
        checkWrap.appendChild(buildCheckCard(comic, q, qi));
      });
      article.appendChild(checkWrap);
      stage.appendChild(article);
    }

    function buildCheckCard(comic, q, qi) {
      const card = document.createElement("article");
      card.className = "quiz-card comic-check-card";
      const answered = Object.prototype.hasOwnProperty.call(state.answers, q.id);
      const selected = state.answers[q.id];
      const ok = selected === q.answer;

      const head = document.createElement("div");
      head.className = "quiz-head";
      const num = document.createElement("span");
      num.className = "quiz-num";
      num.textContent = qi + 1 + ".";
      const prompt = document.createElement("div");
      prompt.className = "quiz-prompt";
      prompt.textContent = q.prompt;
      head.appendChild(num);
      head.appendChild(prompt);
      if (answered) {
        const mark = document.createElement("span");
        mark.className = "quiz-mark " + (ok ? "ok" : "bad");
        mark.textContent = ok ? "\u2713" : "\u2717";
        head.appendChild(mark);
      }
      card.appendChild(head);

      const mc = document.createElement("div");
      mc.className = "quiz-mc";
      q.choices.forEach(function (choice, ci) {
        const label = document.createElement("label");
        label.className = "quiz-mc-opt";
        if (answered) {
          label.classList.add("locked");
          if (ci === q.answer) label.classList.add("reveal-ok");
          else if (ci === selected) label.classList.add("reveal-bad");
        }
        const input = document.createElement("input");
        input.type = "radio";
        input.name = "comic-check-" + q.id;
        input.value = String(ci);
        input.disabled = answered;
        if (selected === ci) input.checked = true;
        input.addEventListener("change", function () {
          state.answers[q.id] = ci;
          render();
        });
        const letter = document.createElement("span");
        letter.className = "quiz-mc-letter";
        letter.textContent = String.fromCharCode(65 + ci) + ".";
        const tex = document.createElement("span");
        tex.className = "quiz-mc-tex";
        tex.textContent = choice;
        label.appendChild(input);
        label.appendChild(letter);
        label.appendChild(tex);
        mc.appendChild(label);
      });
      card.appendChild(mc);

      if (answered) {
        const result = document.createElement("div");
        result.className = "quiz-result";
        const msg = document.createElement("div");
        msg.className = "quiz-result-msg";
        msg.textContent = ok ? "Correct. " : "Not quite. ";
        const explain = document.createElement("span");
        explain.textContent = q.explain;
        msg.appendChild(explain);
        result.appendChild(msg);
        card.appendChild(result);
      }

      return card;
    }

    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initComics);
  } else {
    initComics();
  }
})();
