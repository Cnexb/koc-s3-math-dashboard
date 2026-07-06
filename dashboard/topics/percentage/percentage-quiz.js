/* Percentage quiz — Pre S3 L04–06 Percentage Quiz (QUE); paginated MC + short */
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
      type: "short",
      prompt: "An antique painting increases by 25% every 5 years. Its present value is $150000.",
      parts: [
        {
          tag: "a",
          stem: "\\text{Find its value 20 years ago.}",
          answer: "\\$61440",
          accept: ["61440", "$61440", "\\$61440", "61440 dollars"],
        },
        {
          tag: "b",
          stem: "\\text{Find the increase in value over the past 20 years.}",
          answer: "\\$88560",
          accept: ["88560", "$88560", "\\$88560"],
        },
      ],
    },
    {
      id: 7,
      type: "short",
      prompt: "David borrows $5000 at 7.8% p.a. compounded monthly.",
      stem: "\\text{Find the amount to repay after 3 years (nearest dollar).}",
      answer: "\\$6313",
      accept: ["6313", "$6313", "\\$6313"],
    },
    {
      id: 8,
      type: "short",
      prompt: "Bank X: 4% p.a. compounded half-yearly. Bank Y: 2% p.a. compounded quarterly. Both for 10 years.",
      stem: "\\text{Susan claims Bank X gives more interest. Do you agree?}",
      answer: "\\text{Agree}",
      accept: ["agree", "yes", "X", "bank X", "Bank X", "X gives more", "more in X"],
    },
  ];

  const SYMBOLS = [
    { label: "$", insert: "\\$" },
    { label: "%", insert: "\\%" },
    { label: "≤ frac", insert: "\\frac{}{}" },
    { label: "+", insert: "+" },
    { label: "−", insert: "-" },
    { label: "=", insert: "=" },
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
