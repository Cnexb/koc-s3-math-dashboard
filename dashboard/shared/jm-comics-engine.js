(function () {
  "use strict";

  function renderMixed(el, text) {
    if (!text) return;
    el.textContent = "";
    text.split(/\n\n+/).forEach(function (para) {
      var p = document.createElement("p");
      p.className = "comic-para";
      para.split(/(\*\*[^*]+\*\*)/).forEach(function (part) {
        if (!part) return;
        if (part.indexOf("**") === 0) {
          var strong = document.createElement("strong");
          strong.textContent = part.slice(2, -2);
          p.appendChild(strong);
        } else {
          var span = document.createElement("span");
          span.textContent = part;
          p.appendChild(span);
        }
      });
      el.appendChild(p);
    });
    if (window.renderMathInElement) {
      window.renderMathInElement(el, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "\\(", right: "\\)", display: false },
          { left: "\\[", right: "\\]", display: true },
          { left: "$", right: "$", display: false },
        ],
        throwOnError: false,
      });
    }
  }

  window.initJmComics = function (data) {
    var subnav = document.getElementById("comics-subnav");
    var stage = document.getElementById("comics-stage");
    var parts = data && data.parts;
    if (!subnav || !stage || !parts || !parts.length) return;

    var state = { part: 0, page: 0, answers: {} };
    var chips = [];

    function currentPart() { return parts[state.part]; }
    function currentPage() { return currentPart().pages[state.page]; }
    function isLastPage() { return state.page >= currentPart().pages.length - 1; }

    function checksDone(page) {
      if (!page.checks || !page.checks.length) return true;
      return page.checks.every(function (q) {
        return Object.prototype.hasOwnProperty.call(state.answers, q.id);
      });
    }

    function goPart(pi) {
      if (pi < 0 || pi >= parts.length) return;
      state.part = pi;
      state.page = 0;
      chips.forEach(function (c, j) { c.classList.toggle("active", j === pi); });
      render();
      stage.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function goPage(pj) {
      var n = currentPart().pages.length;
      if (pj < 0 || pj >= n) return;
      state.page = pj;
      render();
      stage.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    parts.forEach(function (part, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip" + (i === 0 ? " active" : "");
      btn.textContent = "Part " + (i + 1) + " · " + part.title;
      btn.addEventListener("click", function () { goPart(i); });
      subnav.appendChild(btn);
      chips.push(btn);
    });

    function buildCheck(q) {
      var card = document.createElement("article");
      card.className = "quiz-card";
      var answered = Object.prototype.hasOwnProperty.call(state.answers, q.id);
      var selected = state.answers[q.id];
      var ok = selected === q.answer;

      var head = document.createElement("div");
      head.className = "quiz-head";
      var prompt = document.createElement("div");
      prompt.className = "quiz-prompt";
      renderMixed(prompt, q.prompt);
      head.appendChild(prompt);
      if (answered) {
        var mark = document.createElement("span");
        mark.className = "quiz-mark " + (ok ? "ok" : "bad");
        mark.textContent = ok ? "\u2713" : "\u2717";
        head.appendChild(mark);
      }
      card.appendChild(head);

      var mc = document.createElement("div");
      mc.className = "quiz-mc";
      q.choices.forEach(function (choice, ci) {
        var label = document.createElement("label");
        label.className = "quiz-mc-opt";
        if (answered) {
          label.classList.add("locked");
          if (ci === q.answer) label.classList.add("reveal-ok");
          else if (ci === selected) label.classList.add("reveal-bad");
        }
        var input = document.createElement("input");
        input.type = "radio";
        input.name = "jm-comic-" + q.id;
        input.disabled = answered;
        if (selected === ci) input.checked = true;
        input.addEventListener("change", function () {
          state.answers[q.id] = ci;
          render();
        });
        var letter = document.createElement("span");
        letter.textContent = String.fromCharCode(65 + ci) + ".";
        var tex = document.createElement("span");
        renderMixed(tex, choice);
        label.appendChild(input);
        label.appendChild(letter);
        label.appendChild(tex);
        mc.appendChild(label);
      });
      card.appendChild(mc);

      if (answered) {
        var result = document.createElement("div");
        result.className = "quiz-result";
        renderMixed(result, (ok ? "Correct. " : "Not quite. ") + q.explain);
        card.appendChild(result);
      }
      return card;
    }

    function render() {
      var part = currentPart();
      var page = currentPage();
      var pageNo = state.page + 1;
      var pageTotal = part.pages.length;
      stage.innerHTML = "";

      var article = document.createElement("article");
      article.className = "comic-page";

      var head = document.createElement("div");
      head.className = "comic-page-head";
      var chap = document.createElement("div");
      chap.className = "comic-chapter";
      chap.textContent = "Part " + (state.part + 1) + " · " + part.chapter +
        " · " + pageNo + " / " + pageTotal;
      var title = document.createElement("h2");
      title.textContent = page.title;
      head.appendChild(chap);
      head.appendChild(title);
      article.appendChild(head);

      if (page.image) {
        var fig = document.createElement("figure");
        fig.className = "comic-figure";
        var img = document.createElement("img");
        img.src = page.image;
        img.alt = page.title + " — comic page";
        img.loading = "lazy";
        fig.appendChild(img);
        article.appendChild(fig);
      }

      // Official comics show pictures only. Set data.showScript to true to preview page.text.
      if (data.showScript && page.text) {
        var body = document.createElement("div");
        body.className = "comic-body";
        renderMixed(body, page.text);
        article.appendChild(body);
      }

      if (page.checks && page.checks.length) {
        var checks = document.createElement("div");
        checks.className = "comic-checks";
        var h3 = document.createElement("h3");
        h3.textContent = "Concept check";
        checks.appendChild(h3);
        page.checks.forEach(function (q) {
          checks.appendChild(buildCheck(q));
        });
        article.appendChild(checks);
      }

      var nav = document.createElement("div");
      nav.className = "comic-chapter-nav";

      if (!checksDone(page)) {
        var wait = document.createElement("p");
        wait.className = "comic-check-hint";
        wait.textContent = "Answer the concept check to continue.";
        nav.appendChild(wait);
      } else if (!isLastPage()) {
        var nextPage = document.createElement("button");
        nextPage.type = "button";
        nextPage.className = "comic-chapter-next";
        nextPage.textContent = "Next page: " + part.pages[state.page + 1].title + " \u2192";
        nextPage.addEventListener("click", function () { goPage(state.page + 1); });
        nav.appendChild(nextPage);
      } else if (state.part < parts.length - 1) {
        var nextPart = document.createElement("button");
        nextPart.type = "button";
        nextPart.className = "comic-chapter-next";
        nextPart.textContent = "Next part: " + parts[state.part + 1].title + " \u2192";
        nextPart.addEventListener("click", function () { goPart(state.part + 1); });
        nav.appendChild(nextPart);
      }

      if (nav.childNodes.length) article.appendChild(nav);
      stage.appendChild(article);

      if (window.renderMathInElement) {
        window.renderMathInElement(article, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "\\(", right: "\\)", display: false },
            { left: "\\[", right: "\\]", display: true },
            { left: "$", right: "$", display: false },
          ],
          throwOnError: false,
        });
      }
    }

    render();
  };
})();
