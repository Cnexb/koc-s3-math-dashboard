(function () {
  "use strict";

  function looksLikeTex(text) {
    return /\\[a-zA-Z]/.test(text);
  }

  function normalizeComicText(text) {
    if (!text) return text;
    return String(text).replace(/\$([^$\n]{1,80})\$/g, function (_, inner) {
      if (/^\d+(\.\d+)?$/.test(inner.trim()) || /\\|[A-Za-z]/.test(inner)) {
        return "\\(" + inner + "\\)";
      }
      return "$" + inner + "$";
    });
  }

  function renderMixed(el, text) {
    if (!text) return;
    text = normalizeComicText(text);
    if (window.katex && looksLikeTex(text) && text.indexOf("\\(") < 0 && text.indexOf("\\[") < 0) {
      try {
        katex.render(text, el, { throwOnError: false });
        return;
      } catch (e) { /* fall through */ }
    }
    el.textContent = "";
    text.split(/(\*\*[^*]+\*\*)/).forEach(function (part) {
      if (!part) return;
      if (part.indexOf("**") === 0) {
        var strong = document.createElement("strong");
        strong.textContent = part.slice(2, -2);
        el.appendChild(strong);
      } else {
        var span = document.createElement("span");
        span.textContent = part;
        el.appendChild(span);
      }
    });
    if (window.renderMathInElement) {
      window.renderMathInElement(el, {
        delimiters: [
          { left: "\\(", right: "\\)", display: false },
          { left: "\\[", right: "\\]", display: true },
        ],
      });
    }
  }

  function pageCaption(comic) {
    if (window.I18n && window.I18n.lang === "zh" && comic.captionZh) {
      return comic.captionZh;
    }
    return comic.caption || comic.captionEn || "";
  }

  window.jmComicsFromTopic = function (topic, checksById) {
    var pages = [];
    if (!topic) return pages;
    (topic.chapters || []).forEach(function (ch, i) {
      pages.push({
        id: ch.id,
        chip: "P" + (i + 1),
        title: String(ch.title || "").replace(/^Chapter\s+\d+\s+[—–-]\s+/, ""),
        chapter: ch.title,
        image: topic.basePath + ch.file,
        captionEn: ch.captionEn,
        captionZh: ch.captionZh,
        checks: checksById && checksById[ch.id],
      });
    });
    var cards = topic.lawCards || (topic.lawCard ? [topic.lawCard] : []);
    cards.forEach(function (card, i) {
      var id = card.id || ("law" + (i + 1));
      pages.push({
        id: id,
        chip: "P" + (pages.length + 1),
        title: card.title,
        chapter: "Summary",
        image: topic.basePath + card.file,
        checks: checksById && checksById[id],
      });
    });
    return pages;
  };

  function initLegacyParts(data) {
    var subnav = document.getElementById("comics-subnav");
    var stage = document.getElementById("comics-stage");
    var parts = data && data.parts;
    if (!subnav || !stage || !parts || !parts.length) return;
    subnav.innerHTML = "";
    stage.innerHTML = "";
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
    }
    function goPage(pj) {
      var n = currentPart().pages.length;
      if (pj < 0 || pj >= n) return;
      state.page = pj;
      render();
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
    function buildLegacyCheck(q) {
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
      stage.innerHTML = "";
      var article = document.createElement("article");
      article.className = "comic-page";
      var head = document.createElement("div");
      head.className = "comic-page-head";
      var chap = document.createElement("div");
      chap.className = "comic-chapter";
      chap.textContent = "Part " + (state.part + 1) + " · " + part.chapter +
        " · " + (state.page + 1) + " / " + part.pages.length;
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
        fig.appendChild(img);
        article.appendChild(fig);
      }
      if (page.checks && page.checks.length) {
        var checks = document.createElement("div");
        checks.className = "comic-checks";
        page.checks.forEach(function (q) { checks.appendChild(buildLegacyCheck(q)); });
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
        nextPage.textContent = "Next page \u2192";
        nextPage.addEventListener("click", function () { goPage(state.page + 1); });
        nav.appendChild(nextPage);
      } else if (state.part < parts.length - 1) {
        var nextPart = document.createElement("button");
        nextPart.type = "button";
        nextPart.className = "comic-chapter-next";
        nextPart.textContent = "Next part \u2192";
        nextPart.addEventListener("click", function () { goPart(state.part + 1); });
        nav.appendChild(nextPart);
      }
      if (nav.childNodes.length) article.appendChild(nav);
      stage.appendChild(article);
    }
    render();
  }

  window.initJmComics = function (comics) {
    if (comics && comics.parts && comics.parts.length) return initLegacyParts(comics);
    var subnav = document.getElementById("comics-subnav");
    var stage = document.getElementById("comics-stage");
    if (!subnav || !stage || !comics || !comics.length) return;

    subnav.innerHTML = "";
    stage.innerHTML = "";

    var state = { index: 0, answers: {} };
    var chips = [];

    function hasChecks(comic) {
      return !!(comic.checks && comic.checks.length);
    }

    function complete(comic) {
      if (!hasChecks(comic)) return true;
      return comic.checks.every(function (q) {
        return Object.prototype.hasOwnProperty.call(state.answers, q.id);
      });
    }

    function go(i) {
      if (i < 0 || i >= comics.length) return;
      state.index = i;
      chips.forEach(function (c, j) { c.classList.toggle("active", j === i); });
      render();
    }

    comics.forEach(function (comic, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip" + (i === 0 ? " active" : "");
      btn.textContent = comic.chip || ("P" + (i + 1));
      btn.title = (comic.chapter || "") + " \u2014 " + (comic.title || "");
      btn.addEventListener("click", function () { go(i); });
      subnav.appendChild(btn);
      chips.push(btn);
    });

    function buildCheck(q, qi) {
      var card = document.createElement("article");
      card.className = "quiz-card";
      var answered = Object.prototype.hasOwnProperty.call(state.answers, q.id);
      var selected = state.answers[q.id];
      var ok = selected === q.answer;

      var head = document.createElement("div");
      head.className = "quiz-head";
      var num = document.createElement("span");
      num.className = "quiz-num";
      num.textContent = qi + 1 + ".";
      var prompt = document.createElement("div");
      prompt.className = "quiz-prompt";
      renderMixed(prompt, q.prompt);
      head.appendChild(num);
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
      var comic = comics[state.index];
      stage.innerHTML = "";
      var article = document.createElement("article");
      article.className = "comic-page";

      var head = document.createElement("div");
      head.className = "comic-page-head";
      var chap = document.createElement("div");
      chap.className = "comic-chapter";
      chap.textContent = comic.chapter || "";
      var title = document.createElement("h2");
      title.textContent = comic.title || "";
      head.appendChild(chap);
      head.appendChild(title);
      article.appendChild(head);

      if (typeof comic.mount === "function") {
        var host = document.createElement("div");
        host.className = "comic-html";
        comic.mount(host);
        article.appendChild(host);
      } else if (comic.image) {
        var fig = document.createElement("figure");
        fig.className = "comic-figure";
        var img = document.createElement("img");
        img.src = comic.image;
        img.alt = (comic.title || "Comic") + " \u2014 educational comic page";
        img.loading = "lazy";
        fig.appendChild(img);
        article.appendChild(fig);
      }

      var caption = pageCaption(comic);
      if (caption) {
        var cap = document.createElement("p");
        cap.className = "comic-caption";
        renderMixed(cap, caption);
        article.appendChild(cap);
      }

      if (comic.text) {
        var body = document.createElement("div");
        body.className = "comic-body";
        renderMixed(body, comic.text);
        article.appendChild(body);
      }

      if (hasChecks(comic)) {
        var checks = document.createElement("div");
        checks.className = "comic-checks";
        var h3 = document.createElement("h3");
        h3.textContent = "Concept checking";
        checks.appendChild(h3);
        comic.checks.forEach(function (q, qi) {
          checks.appendChild(buildCheck(q, qi));
        });
        article.appendChild(checks);
      }

      if (complete(comic) && state.index < comics.length - 1) {
        var nav = document.createElement("div");
        nav.className = "comic-chapter-nav";
        var next = document.createElement("button");
        next.type = "button";
        next.className = "comic-chapter-next";
        next.textContent = "Next: " + comics[state.index + 1].title + " \u2192";
        next.addEventListener("click", function () { go(state.index + 1); });
        nav.appendChild(next);
        article.appendChild(nav);
      }

      stage.appendChild(article);
    }

    var pageQ = 0;
    try {
      pageQ = parseInt(new URLSearchParams(location.search).get("page") || "0", 10);
    } catch (e) {
      pageQ = 0;
    }
    if (pageQ >= 1 && pageQ <= comics.length) go(pageQ - 1);
    else render();
  };

  window.initJmComicsBundle = function (series, startIndex) {
    if (!series || !series.length) return;
    var seriesNav = document.getElementById("comics-series-nav");
    var current = Math.max(0, Math.min(series.length - 1, startIndex || 0));

    function show(i) {
      current = i;
      if (seriesNav) {
        [].forEach.call(seriesNav.querySelectorAll(".chip"), function (c, j) {
          c.classList.toggle("active", j === i);
        });
      }
      window.initJmComics(series[i].comics);
    }

    if (seriesNav) {
      seriesNav.innerHTML = "";
      if (series.length > 1) {
        series.forEach(function (s, i) {
          var btn = document.createElement("button");
          btn.type = "button";
          btn.className = "chip" + (i === 0 ? " active" : "");
          btn.textContent = s.label;
          btn.addEventListener("click", function () { show(i); });
          seriesNav.appendChild(btn);
        });
      }
    }

    show(current);
  };
})();
