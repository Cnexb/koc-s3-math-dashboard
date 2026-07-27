/* Area & Volume comics — Area & Volume Quest Ch.1 + per-page concept checks.
   Completely separate from area-volume-quiz.js (does not touch QUIZ data). */
(function () {
  "use strict";

  const COMIC_ASSET_V = "20260727a";

  const COMICS = [
    {
      id: "enter-solid-city",
      title: "Enter Solid City",
      chapter: "Ch.1 · Page 1 · Pyramids & cones",
      image: "comics/01-enter-solid-city.png?v=" + COMIC_ASSET_V,
      checks: [],
    },
    {
      id: "why-one-third",
      title: "Why One Third?",
      chapter: "Ch.1 · Page 2 · Pyramid & cone volume",
      image: "comics/02-why-one-third.png?v=" + COMIC_ASSET_V,
      checks: [
        {
          id: "c2q1",
          prompt:
            "A square pyramid has base area B = 36 cm² and perpendicular height h = 10 cm. What is its volume?",
          choices: ["120 cm³", "360 cm³", "180 cm³", "36 cm³"],
          answer: 0,
          explain:
            "V(pyramid) = (1/3)Bh = (1/3) × 36 × 10 = 120 cm³. Do not forget the one-third.",
        },
        {
          id: "c2q2",
          prompt:
            "A cone has radius r = 3 and height h = 7. What is its volume? (Leave π in the answer.)",
          choices: ["21π", "63π", "7π", "9π"],
          answer: 0,
          explain:
            "A cone is a circular-base pyramid: V = (1/3)πr²h = (1/3)π(9)(7) = 21π.",
        },
      ],
    },
    {
      id: "born-flat",
      title: "Every Solid Is Born Flat",
      chapter: "Ch.1 · Page 3 · Nets & total surface area",
      image: "comics/03-every-solid-born-flat.png?v=" + COMIC_ASSET_V,
      checks: [],
    },
    {
      id: "net-maternity-ward",
      title: "The Net Maternity Ward",
      chapter: "Ch.1 · Page 4 · Prism, pyramid & cone surface area",
      image: "comics/04-net-maternity-ward.png?v=" + COMIC_ASSET_V,
      checks: [
        {
          id: "c4q1",
          prompt:
            "A right prism has base area B = 20, base perimeter P = 18 and height h = 5. What is its total surface area?",
          choices: ["130", "90", "110", "40"],
          answer: 0,
          explain:
            "TSA(right prism) = 2B + Ph = 2(20) + 18(5) = 40 + 90 = 130.",
        },
        {
          id: "c4q2",
          prompt:
            "A regular pyramid has base area B = 36, base perimeter P = 24 and slant height ℓ = 10. What is its total surface area?",
          choices: ["156", "120", "240", "96"],
          answer: 0,
          explain:
            "Lateral area = (1/2)Pℓ = (1/2)(24)(10) = 120. TSA = B + (1/2)Pℓ = 36 + 120 = 156.",
        },
      ],
    },
    {
      id: "sphere-district",
      title: "The Sphere District",
      chapter: "Ch.1 · Page 5 · Sphere & hemisphere volume",
      image: "comics/05-sphere-district.png?v=" + COMIC_ASSET_V,
      checks: [
        {
          id: "c5q1",
          prompt:
            "A sphere has radius r = 3. What is its volume? (Leave π in the answer.)",
          choices: ["36π", "12π", "9π", "4π"],
          answer: 0,
          explain:
            "V(sphere) = (4/3)πr³ = (4/3)π(27) = 36π.",
        },
        {
          id: "c5q2",
          prompt:
            "A solid hemisphere has radius r = 6. What is its volume? (Leave π in the answer.)",
          choices: ["144π", "288π", "72π", "216π"],
          answer: 0,
          explain:
            "V(hemisphere) = (2/3)πr³ = (2/3)π(216) = 144π. (Half of a sphere of the same radius.)",
        },
      ],
    },
    {
      id: "surface-of-sphere",
      title: "The Surface of a Sphere",
      chapter: "Ch.1 · Page 6 · Sphere & hemisphere surface area",
      image: "comics/06-surface-of-sphere.png?v=" + COMIC_ASSET_V,
      checks: [
        {
          id: "c6q1",
          prompt:
            "A sphere has radius r = 2. What is its surface area? (Leave π in the answer.)",
          choices: ["16π", "8π", "4π", "32π/3"],
          answer: 0,
          explain:
            "SA(sphere) = 4πr² = 4π(4) = 16π. (About four great circles of area πr².)",
        },
        {
          id: "c6q2",
          prompt:
            "A solid hemisphere has radius r = 5. What is its total surface area (curved surface + flat circular face)? (Leave π in the answer.)",
          choices: ["75π", "50π", "25π", "100π"],
          answer: 0,
          explain:
            "Curved SA = 2πr² = 50π; flat base = πr² = 25π. Total = 3πr² = 75π.",
        },
      ],
    },
  ];

  function renderMaybeTex(el, text) {
    if (text.indexOf("\\") >= 0 && window.katex) {
      try {
        katex.render(text, el, { throwOnError: false });
        return;
      } catch (e) {
        /* fall through */
      }
    }
    el.textContent = text;
  }

  function initComics() {
    const panel = document.getElementById("panel-comics");
    const subnav = document.getElementById("comics-subnav");
    const stage = document.getElementById("comics-stage");
    if (!panel || !subnav || !stage) return;

    const state = { index: 0, answers: {} };
    const chipButtons = [];

    function isChapterComplete(comic) {
      if (!comic.checks.length) return true;
      return comic.checks.every(function (q) {
        return Object.prototype.hasOwnProperty.call(state.answers, q.id);
      });
    }

    function goToChapter(index) {
      if (index < 0 || index >= COMICS.length) return;
      state.index = index;
      chipButtons.forEach(function (chip, j) {
        chip.classList.toggle("active", j === index);
      });
      render();
      stage.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    COMICS.forEach(function (comic, i) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip" + (i === 0 ? " active" : "");
      btn.dataset.comic = comic.id;
      btn.textContent = "P" + (i + 1) + " · " + comic.title;
      btn.addEventListener("click", function () {
        goToChapter(i);
      });
      subnav.appendChild(btn);
      chipButtons.push(btn);
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

      if (comic.checks.length) {
        const checkWrap = document.createElement("div");
        checkWrap.className = "comic-checks";
        const checkTitle = document.createElement("h3");
        checkTitle.textContent = "Concept checking";
        checkWrap.appendChild(checkTitle);

        comic.checks.forEach(function (q, qi) {
          checkWrap.appendChild(buildCheckCard(comic, q, qi));
        });
        article.appendChild(checkWrap);
      }

      if (isChapterComplete(comic) && state.index < COMICS.length - 1) {
        const nav = document.createElement("div");
        nav.className = "comic-chapter-nav";
        const nextComic = COMICS[state.index + 1];
        const nextBtn = document.createElement("button");
        nextBtn.type = "button";
        nextBtn.className = "quiz-nav-btn primary comic-chapter-next";
        nextBtn.textContent =
          "Next page: " + nextComic.title + " \u2192";
        nextBtn.addEventListener("click", function () {
          goToChapter(state.index + 1);
        });
        nav.appendChild(nextBtn);
        article.appendChild(nav);
      }

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
        renderMaybeTex(tex, choice);
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
