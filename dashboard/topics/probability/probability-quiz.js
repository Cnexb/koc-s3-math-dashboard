/* Probability quiz — Pre S3 L10–12 Probability Quiz (QUE); paginated MC + short */
(function () {
  "use strict";

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
      prompt: "Refer to the fortune wheel in the quiz paper. Dylan wins if the pointer lands on region c, e or g.",
      stem: "P(\\text{prize})",
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
      type: "short",
      prompt: "6d is a 2-digit number, where d is an integer from 0 to 9 inclusive.",
      parts: [
        {
          tag: "a",
          stem: "P(\\text{the number is greater than 60})",
          answer: "\\frac{9}{10}",
          accept: ["9/10", "0.9", "0.90", "90%"],
        },
        {
          tag: "b",
          stem: "P(\\text{the number is divisible by 5})",
          answer: "\\frac{1}{5}",
          accept: ["1/5", "0.2", "20%"],
        },
      ],
    },
    {
      id: 8,
      type: "short",
      prompt: "2000 candidates sit an examination.",
      stem: "P(\\text{female})=\\dfrac{11}{20}\\text{. Find the number of male candidates.}",
      answer: "900",
      accept: ["900 males", "900 candidates"],
    },
    {
      id: 9,
      type: "short",
      prompt: "Two fair dice are thrown at the same time. Use tabulation.",
      parts: [
        {
          tag: "a",
          stem: "P(\\text{at least one number is a multiple of 3})",
          answer: "\\frac{5}{9}",
          accept: ["5/9", "20/36"],
        },
        {
          tag: "b",
          stem: "P(\\text{sum of the two numbers} < 9)",
          answer: "\\frac{13}{18}",
          accept: ["13/18", "26/36"],
        },
      ],
    },
    {
      id: 10,
      type: "short",
      prompt: "Winnie's purse: two $2 coins, one $5 coin and one $10 coin. Two coins are taken out at random.",
      parts: [
        {
          tag: "a",
          stem: "P(5 < \\text{donation amount} < 13)",
          answer: "\\frac{2}{3}",
          accept: ["2/3", "4/6"],
        },
        {
          tag: "b",
          stem: "\\text{Find the expected donation amount.}",
          answer: "\\$9.5",
          accept: ["9.5", "$9.5", "\\$9.5", "9.50"],
        },
      ],
    },
  ];

  const SYMBOLS = [
    { label: "$", insert: "\\$" },
    { label: "≤ frac", insert: "\\frac{}{}" },
    { label: "P", insert: "P(" },
    { label: "+", insert: "+" },
    { label: "−", insert: "-" },
    { label: "=", insert: "=" },
    { label: "<", insert: "<" },
    { label: ">", insert: ">" },
    { label: "(", insert: "(" },
    { label: ")", insert: ")" },
  ];

  function kx(el, tex, display) {
    try { katex.render(tex, el, { throwOnError: false, displayMode: !!display }); }
    catch (e) { el.textContent = tex; }
  }

  function partKey(qid, tag) { return qid + "-" + tag; }

  function normalizeTex(s) {
    return String(s || "")
      .replace(/\u2212/g, "-")
      .replace(/\u2013/g, "-")
      .replace(/\s+/g, "")
      .replace(/\\leq/g, "\\le")
      .replace(/\\geq/g, "\\ge")
      .replace(/≤/g, "\\le")
      .replace(/≥/g, "\\ge")
      .toLowerCase();
  }

  function parseIntList(s) {
    const t = String(s || "")
      .replace(/\band\b/gi, ",")
      .replace(/\u2212/g, "-")
      .replace(/;/g, ",");
    const nums = t.match(/-?\d+(?:\.\d+)?/g);
    if (!nums) return null;
    return nums.map(Number).sort((a, b) => a - b);
  }

  function intListsEqual(a, b) {
    const pa = parseIntList(a);
    const pb = parseIntList(b);
    if (!pa || !pb || pa.length !== pb.length) return false;
    return pa.every((v, i) => v === pb[i]);
  }

  function fracToDecimal(tex) {
    const m = tex.match(/\\frac\{(-?\d+(?:\.\d+)?)\}\{(-?\d+(?:\.\d+)?)\}/);
    if (!m) return null;
    const den = +m[2];
    if (!den) return null;
    return +m[1] / den;
  }

  function ineqBound(tex) {
    const n = normalizeTex(tex);
    const m = n.match(/^x([<>]|\\le|\\ge|\\leq|\\geq)(.+)$/);
    if (!m) return null;
    let op = m[1].replace("\\leq", "\\le").replace("\\geq", "\\ge");
    let val = m[2];
    const dec = fracToDecimal(val);
    if (dec != null) val = String(dec);
    else val = val.replace(/\\frac\{(\d+)\}\{(\d+)\}/g, (_, a, b) => String(+a / +b));
    return op + val;
  }

  function equivIneq(a, b) {
    if (normalizeTex(a) === normalizeTex(b)) return true;
    const ia = ineqBound(a);
    const ib = ineqBound(b);
    if (ia && ib && ia === ib) return true;
    return false;
  }

  function equivCount(a, b) {
    const na = normalizeTex(a).replace(/values?/g, "");
    const nb = normalizeTex(b);
    if (na === nb) return true;
    const da = na.match(/\d+/);
    const db = nb.match(/\d+/);
    if (da && db && da[0] === db[0]) {
      const list = parseIntList(a);
      if (list && list.length === +da[0]) return true;
    }
    return false;
  }

  function checkPart(part, ans) {
    if (ans == null || String(ans).trim() === "") return false;
    const targets = [part.answer].concat(part.accept || []);
    return targets.some((t) => {
      if (intListsEqual(ans, t)) return true;
      if (equivIneq(ans, t)) return true;
      if (equivCount(ans, t)) return true;
      return normalizeTex(ans) === normalizeTex(t);
    });
  }

  function checkQuestion(q, answers) {
    if (q.type === "mc") return answers[q.id] === q.answer;
    if (q.parts) {
      return q.parts.every((p) => checkPart(p, answers[partKey(q.id, p.tag)]));
    }
    return checkPart({ answer: q.answer, accept: q.accept }, answers[q.id]);
  }

  function initQuiz() {
    const root = document.getElementById("quiz-root");
    const progressWrap = document.getElementById("quiz-progress-wrap");
    const progressLabel = document.getElementById("quiz-progress-label");
    const progressFill = document.getElementById("quiz-progress-fill");
    const backBtn = document.getElementById("quiz-back");
    const nextBtn = document.getElementById("quiz-next");
    if (!root || !nextBtn) return;

    const state = {
      index: 0,
      answers: {},
      submitted: false,
      phase: "quiz",
      activeInputId: null,
    };

    function saveCurrentShort() {
      const q = QUIZ[state.index];
      if (!q || q.type !== "short") return;
      if (q.parts) {
        q.parts.forEach((p) => {
          const ta = document.getElementById("quiz-input-" + partKey(q.id, p.tag));
          if (ta) state.answers[partKey(q.id, p.tag)] = ta.value;
        });
      } else {
        const ta = document.getElementById("quiz-input-" + q.id);
        if (ta) state.answers[q.id] = ta.value;
      }
    }

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
      saveCurrentShort();
      root.innerHTML = "";
      updateProgress();
      updateNav();
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

      if (q.stem) {
        const stem = document.createElement("div");
        stem.className = "quiz-stem";
        kx(stem, q.stem, true);
        card.appendChild(stem);
      }

      const body = document.createElement("div");
      body.className = "quiz-body";
      if (q.type === "mc") body.appendChild(buildMc(q, reviewMode));
      else if (q.parts) body.appendChild(buildShortParts(q, reviewMode));
      else body.appendChild(buildShortSingle(q, reviewMode));
      card.appendChild(body);

      if (reviewMode && !ok) card.appendChild(buildCorrectBlock(q));
      return card;
    }

    function buildCorrectBlock(q) {
      const block = document.createElement("div");
      block.className = "quiz-result";
      if (q.parts) {
        q.parts.forEach((p) => {
          if (checkPart(p, state.answers[partKey(q.id, p.tag)])) return;
          const row = document.createElement("div");
          row.className = "quiz-part-result";
          const lbl = document.createElement("span");
          lbl.className = "quiz-part-result-lbl";
          lbl.textContent = "(" + p.tag + ") ";
          row.appendChild(lbl);
          const ans = document.createElement("span");
          ans.className = "quiz-ans-tex";
          kx(ans, p.answer);
          row.appendChild(ans);
          block.appendChild(row);
        });
      } else if (q.type === "mc") {
        const msg = document.createElement("span");
        msg.className = "quiz-result-msg";
        msg.textContent = "Correct answer: ";
        const ans = document.createElement("span");
        ans.className = "quiz-ans-tex";
        kx(ans, q.choices[q.answer]);
        msg.appendChild(ans);
        block.appendChild(msg);
      } else {
        const msg = document.createElement("span");
        msg.className = "quiz-result-msg";
        msg.textContent = "Correct answer: ";
        const ans = document.createElement("span");
        ans.className = "quiz-ans-tex";
        kx(ans, q.answer);
        msg.appendChild(ans);
        block.appendChild(msg);
      }
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

    function buildSymBar() {
      const toolbar = document.createElement("div");
      toolbar.className = "quiz-sym-bar";
      SYMBOLS.forEach((sym) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "quiz-sym-btn";
        btn.textContent = sym.label;
        btn.title = sym.insert;
        btn.addEventListener("click", () => insertIntoActive(sym.insert));
        toolbar.appendChild(btn);
      });
      return toolbar;
    }

    function buildShortParts(q, reviewMode) {
      const wrap = document.createElement("div");
      wrap.className = "quiz-short-wrap";
      if (!reviewMode) wrap.appendChild(buildSymBar());
      q.parts.forEach((p) => {
        const key = partKey(q.id, p.tag);
        const partOk = checkPart(p, state.answers[key]);
        const block = document.createElement("div");
        block.className = "quiz-part";
        const head = document.createElement("div");
        head.className = "quiz-part-head";
        const lbl = document.createElement("span");
        lbl.className = "quiz-part-label";
        lbl.textContent = "(" + p.tag + ")";
        head.appendChild(lbl);
        if (reviewMode) {
          const mark = document.createElement("span");
          mark.className = "quiz-mark quiz-part-mark " + (partOk ? "ok" : "bad");
          mark.textContent = partOk ? "\u2713" : "\u2717";
          head.appendChild(mark);
        }
        block.appendChild(head);
        if (p.prompt) {
          const pr = document.createElement("div");
          pr.className = "quiz-prompt";
          pr.textContent = p.prompt;
          block.appendChild(pr);
        }
        const stem = document.createElement("div");
        stem.className = "quiz-part-stem";
        kx(stem, p.stem, true);
        block.appendChild(stem);
        if (reviewMode) {
          const yours = document.createElement("div");
          yours.className = "quiz-yours";
          const yl = document.createElement("span");
          yl.className = "quiz-yours-lbl";
          yl.textContent = "Your answer: ";
          yours.appendChild(yl);
          const tex = document.createElement("span");
          tex.className = "quiz-ans-tex";
          kx(tex, String(state.answers[key] || "").trim() || "\\text{(blank)}");
          yours.appendChild(tex);
          block.appendChild(yours);
        } else {
          const ta = document.createElement("textarea");
          ta.className = "quiz-short-input";
          ta.id = "quiz-input-" + key;
          ta.rows = 2;
          ta.placeholder = "Answer for (" + p.tag + ")\u2026";
          ta.value = state.answers[key] || "";
          ta.addEventListener("focus", () => { state.activeInputId = ta.id; });
          ta.addEventListener("input", () => {
            state.answers[key] = ta.value;
            updatePreview(key, ta.value);
          });
          block.appendChild(ta);
          const preview = document.createElement("div");
          preview.className = "quiz-preview";
          preview.id = "quiz-preview-" + key;
          block.appendChild(preview);
          updatePreview(key, ta.value);
        }
        wrap.appendChild(block);
      });
      return wrap;
    }

    function buildShortSingle(q, reviewMode) {
      const wrap = document.createElement("div");
      wrap.className = "quiz-short-wrap";
      const key = String(q.id);
      if (!reviewMode) wrap.appendChild(buildSymBar());
      if (reviewMode) {
        const yours = document.createElement("div");
        yours.className = "quiz-yours";
        const lbl = document.createElement("span");
        lbl.className = "quiz-yours-lbl";
        lbl.textContent = "Your answer: ";
        yours.appendChild(lbl);
        const tex = document.createElement("span");
        tex.className = "quiz-ans-tex";
        kx(tex, String(state.answers[key] || "").trim() || "\\text{(blank)}");
        yours.appendChild(tex);
        wrap.appendChild(yours);
      } else {
        const ta = document.createElement("textarea");
        ta.className = "quiz-short-input";
        ta.id = "quiz-input-" + key;
        ta.rows = 2;
        ta.placeholder = "Type LaTeX or use buttons above\u2026";
        ta.value = state.answers[key] || "";
        ta.addEventListener("focus", () => { state.activeInputId = ta.id; });
        ta.addEventListener("input", () => {
          state.answers[key] = ta.value;
          updatePreview(key, ta.value);
        });
        wrap.appendChild(ta);
        const preview = document.createElement("div");
        preview.className = "quiz-preview";
        preview.id = "quiz-preview-" + key;
        wrap.appendChild(preview);
        updatePreview(key, ta.value);
      }
      return wrap;
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

    function insertIntoActive(text) {
      if (state.submitted || state.phase === "review") return;
      const id = state.activeInputId;
      if (!id) return;
      const ta = document.getElementById(id);
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const val = ta.value;
      let ins = text;
      if (text === "\\frac{}{}") {
        ta.value = val.slice(0, start) + "\\frac{}{}" + val.slice(end);
        ta.setSelectionRange(start + 6, start + 6);
      } else {
        ta.value = val.slice(0, start) + ins + val.slice(end);
        ta.setSelectionRange(start + ins.length, start + ins.length);
      }
      const key = id.replace("quiz-input-", "");
      state.answers[key] = ta.value;
      updatePreview(key, ta.value);
      ta.focus();
    }

    function updatePreview(key, tex) {
      const el = document.getElementById("quiz-preview-" + key);
      if (!el) return;
      el.innerHTML = "";
      if (!tex || !tex.trim()) {
        el.textContent = "Preview";
        el.classList.add("empty");
        return;
      }
      el.classList.remove("empty");
      kx(el, tex.trim());
    }

    if (backBtn) {
      backBtn.addEventListener("click", () => {
        if (state.phase === "review") return;
        saveCurrentShort();
        if (state.index > 0) {
          state.index--;
          render();
        }
      });
    }

    nextBtn.addEventListener("click", () => {
      if (state.phase === "review") {
        state.index = 0;
        state.answers = {};
        state.submitted = false;
        state.phase = "quiz";
        state.activeInputId = null;
        render();
        return;
      }
      saveCurrentShort();
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
