/**
 * JM24 Concept decks — Manim vocabulary (JM25–27 / 30 / 32):
 *
 * KINDS
 *   Write / FadeIn(shift)  — new definition or caption
 *   TransformFromCopy      — data-fly-from (provenance from example)
 *   TransformMatchingTex   — stage-pane replace-in-place
 *   Indicate               — one-beat pulse (cancel token / decimal)
 *   SurroundingRectangle   — .box-final on the takeaway only
 *   temporary note         — .note-proc / .note-sem / .note-warn under work
 *
 * HIGHLIGHT
 *   COL_A blue / COL_B amber / COL_AB green / COL_REMOVE red / operators INK
 *   Same quantity keeps its colour across morphs
 *
 * POINT SELECTION
 *   one click = one next_slide() beat; advance mid-anim finishes current beat only
 */
(function () {
  "use strict";

  var FLY_MS = 560;   /* ~TransformFromCopy 0.55–0.9s */
  var PEEL_MS = 640;
  var CANCEL_MS = 480;
  var JUMP_MS = 560;
  var autoTimers = [];
  var rafIds = [];
  var playToken = 0;

  var anim = { busy: false, skip: false, finish: null };

  function renderMath(root) {
    if (!window.renderMathInElement) return;
    renderMathInElement(root || document.body, {
      delimiters: [
        { left: "\\(", right: "\\)", display: false },
        { left: "\\[", right: "\\]", display: true }
      ],
      throwOnError: false
    });
  }

  function clearAutoTimers() {
    autoTimers.forEach(function (id) { window.clearTimeout(id); });
    autoTimers = [];
    rafIds.forEach(function (id) { try { cancelAnimationFrame(id); } catch (e) { /* */ } });
    rafIds = [];
    playToken += 1;
    anim.busy = false;
    anim.skip = false;
    anim.finish = null;
  }

  function later(fn, ms) {
    var token = playToken;
    var id = window.setTimeout(function () {
      if (token !== playToken) return;
      fn();
    }, ms);
    autoTimers.push(id);
    return id;
  }

  function raf(fn) {
    var id = window.requestAnimationFrame(fn);
    rafIds.push(id);
    return id;
  }

  function purgeGhosts() {
    document.querySelectorAll(
      ".fly-ghost, .peel-ghost, .times-ghost, .dp-ghost, .pv-drag-box"
    ).forEach(function (g) {
      if (g.parentNode) g.parentNode.removeChild(g);
    });
  }

  function clearSourceMarks() {
    document.querySelectorAll(".example-row .src").forEach(function (el) {
      el.classList.remove("is-source", "is-spent", "expand-framed");
    });
  }

  function clearAllExpandFrames(scope) {
    (scope || document).querySelectorAll(".expand-framed").forEach(function (el) {
      el.classList.remove("expand-framed");
    });
  }

  function markSource(sel, spent) {
    if (!sel) return;
    var src = document.querySelector(sel);
    if (!src) return;
    if (spent) {
      src.classList.remove("is-source");
      src.classList.add("is-spent");
    } else {
      src.classList.remove("is-spent");
      src.classList.add("is-source");
    }
  }

  function setExpandFrame(el, on) {
    if (!el) return;
    el.classList.toggle("expand-framed", !!on);
  }

  /** Yellow frame belongs on the Example-row term being expanded (not the work row). */
  function frameExampleSrc(pane) {
    clearAllExpandFrames();
    if (!pane) return null;
    var sel = pane.getAttribute("data-ex-src");
    if (!sel) {
      var fly = pane.querySelector("[data-fly-from]");
      if (fly) sel = fly.getAttribute("data-fly-from");
    }
    if (!sel) return null;
    var src = document.querySelector(sel);
    if (src) {
      setExpandFrame(src, true);
      markSource(sel, false);
    }
    return src;
  }

  /** Manim Indicate — one-beat flash */
  function indicate(el) {
    if (!el) return;
    el.classList.remove("indicate");
    void el.offsetWidth;
    el.classList.add("indicate");
    later(function () { el.classList.remove("indicate"); }, 720);
  }

  /** Manim title_bar: accent width = title.width + 0.6 */
  function syncTitleBars(scope) {
    (scope || document).querySelectorAll(".m-head").forEach(function (head) {
      var title = head.querySelector(".m-title");
      var line = head.querySelector(".m-line");
      if (!title || !line) return;
      var w = title.getBoundingClientRect().width;
      if (w > 40) line.style.width = Math.round(w + 36) + "px";
    });
  }

  function restoreVisualState(scope) {
    var root = scope || document;
    root.querySelectorAll(".token, .src, .c, .expand-term, .conv-extra, .sci-jump-eq").forEach(function (t) {
      t.classList.remove(
        "struck", "gather-left", "gather-right", "gather-mid", "is-remaining",
        "expand-framed", "framed", "dragged", "landed", "awaiting",
        "dragging", "spent", "is-on", "fly-wait", "fly-land", "combined", "combining"
      );
    });
    root.querySelectorAll(".frac-stack, .frac-build").forEach(function (f) {
      f.classList.remove(
        "cancelled", "cancel-done", "gathering", "gathered",
        "phase-bar", "phase-num", "phase-den", "phase-cancel", "phase-result"
      );
    });
    root.querySelectorAll("sup.pow, .pow").forEach(function (p) { p.style.opacity = ""; });
    root.querySelectorAll(".cancel-result, .gather-eq").forEach(function (r) {
      r.classList.remove("show");
    });
    clearSourceMarks();
    purgeGhosts();
  }

  function flyFromTo(fromEl, toEl, delay) {
    if (!fromEl || !toEl) {
      if (toEl) {
        toEl.classList.remove("fly-wait");
        toEl.classList.add("fly-land");
      }
      return;
    }
    toEl.classList.add("fly-wait");
    toEl.classList.remove("fly-land");
    later(function () {
      var from = fromEl.getBoundingClientRect();
      var to = toEl.getBoundingClientRect();
      if (!from.width || !to.width) {
        toEl.classList.remove("fly-wait");
        toEl.classList.add("fly-land");
        return;
      }
      var ghost = fromEl.cloneNode(true);
      ghost.classList.add("fly-ghost", "flying");
      ghost.style.left = from.left + "px";
      ghost.style.top = from.top + "px";
      ghost.style.width = from.width + "px";
      ghost.style.height = from.height + "px";
      document.body.appendChild(ghost);
      var dx = to.left - from.left + (to.width - from.width) / 2;
      var dy = to.top - from.top + (to.height - from.height) / 2;
      raf(function () {
        raf(function () {
          ghost.style.transform = "translate(" + dx + "px, " + dy + "px) scale(1.05)";
        });
      });
      later(function () {
        toEl.classList.remove("fly-wait");
        toEl.classList.add("fly-land");
        if (ghost.parentNode) ghost.parentNode.removeChild(ghost);
      }, FLY_MS);
    }, delay || 0);
  }

  function runFlyIns(root) {
    if (!root) return;
    var nodes = root.querySelectorAll("[data-fly-from]");
    Array.prototype.forEach.call(nodes, function (toEl, i) {
      var sel = toEl.getAttribute("data-fly-from");
      if (!sel) return;
      markSource(sel, false);
      flyFromTo(document.querySelector(sel), toEl, i * 50);
      later(function () { markSource(sel, true); }, FLY_MS + i * 50 + 40);
    });
  }

  function paneIndex(pane) {
    var frame = pane.parentElement;
    if (!frame) return 0;
    return Array.prototype.indexOf.call(frame.querySelectorAll(".stage-pane"), pane);
  }

  function activatePane(pane, opts) {
    opts = opts || {};
    var frame = pane && pane.parentElement;
    if (!frame) return;
    frame.querySelectorAll(".stage-pane").forEach(function (p) {
      p.classList.remove("is-active", "peel-arrive", "is-measure");
    });
    pane.classList.add("is-active");
    if (opts.peel) pane.classList.add("peel-arrive");
    frameExampleSrc(pane);
    renderMath(pane);
    var flyNodes = pane.querySelectorAll("[data-fly-from]");
    if (flyNodes.length) {
      Array.prototype.forEach.call(flyNodes, function (toEl, i) {
        var sel = toEl.getAttribute("data-fly-from");
        if (!sel) return;
        markSource(sel, false);
        flyFromTo(document.querySelector(sel), toEl, i * 50);
        later(function () { markSource(sel, true); }, FLY_MS + i * 50 + 40);
      });
    }
  }

  function peelBetween(fromPane, toPane, done) {
    if (!fromPane || !toPane) {
      activatePane(toPane);
      if (done) done();
      return;
    }
    /* Frame the Example-row term for the pane we are expanding from */
    frameExampleSrc(fromPane);

    var pow = fromPane.querySelector("sup.pow.outer");
    if (!pow) {
      var pows = fromPane.querySelectorAll("sup.pow");
      pow = pows.length ? pows[pows.length - 1] : null;
    }
    if (!pow) {
      activatePane(toPane, { peel: true });
      later(function () {
        if (done) done();
      }, 360);
      return;
    }

    toPane.classList.add("is-measure");
    var rightFactor = toPane.querySelector(".token.next-factor, .token.peel-target");
    if (!rightFactor) {
      var toks = toPane.querySelectorAll(".token:not(.op)");
      rightFactor = toks.length >= 2 ? toks[1] : toks[0];
    }
    var timesEl = toPane.querySelector(".token.op.peel-times");
    var fromR = pow.getBoundingClientRect();
    var targetEl = rightFactor
      ? (rightFactor.querySelector("sup.pow") || rightFactor)
      : null;
    var targetR = targetEl
      ? targetEl.getBoundingClientRect()
      : { left: fromR.left + 90, top: fromR.top, width: 20, height: 20 };
    var midX, midY;
    if (timesEl) {
      var tr = timesEl.getBoundingClientRect();
      midX = tr.left + tr.width / 2;
      midY = tr.top + tr.height / 2;
    } else {
      midX = (fromR.left + fromR.width / 2 + targetR.left + targetR.width / 2) / 2;
      midY = (fromR.top + targetR.top) / 2;
    }
    var landX = targetR.left + targetR.width / 2;
    var landY = targetR.top + targetR.height / 2;
    toPane.classList.remove("is-measure");

    var startX = fromR.left + fromR.width / 2;
    var startY = fromR.top + fromR.height / 2;
    /* Upward parabola (screen y decreases upward) */
    var lift = Math.max(56, Math.abs(landX - startX) * 0.48);

    var ghost = document.createElement("span");
    ghost.className = "peel-ghost";
    ghost.textContent = pow.textContent;
    ghost.style.left = (startX - fromR.width / 2) + "px";
    ghost.style.top = (startY - fromR.height / 2) + "px";
    ghost.style.fontSize = window.getComputedStyle(pow).fontSize;
    document.body.appendChild(ghost);
    pow.style.opacity = "0";

    var timesGhost = document.createElement("span");
    timesGhost.className = "times-ghost";
    timesGhost.textContent = "×";
    timesGhost.style.left = midX + "px";
    timesGhost.style.top = midY + "px";
    timesGhost.style.opacity = "0";
    document.body.appendChild(timesGhost);

    var peelToken = playToken;
    var finished = false;
    function cleanup(skip) {
      if (finished) return;
      finished = true;
      if (ghost.parentNode) ghost.parentNode.removeChild(ghost);
      if (timesGhost.parentNode) timesGhost.parentNode.removeChild(timesGhost);
      fromPane.classList.remove("is-active");
      pow.style.opacity = "";
      activatePane(toPane, { peel: true });
      later(function () {
        toPane.classList.remove("peel-arrive");
        anim.busy = false;
        anim.finish = null;
        if (done) done();
      }, skip ? 40 : 280);
    }

    anim.busy = true;
    anim.finish = function () { cleanup(true); };

    var t0 = null;
    var FADE_TAIL = 0.18;
    function frame(now) {
      if (playToken !== peelToken || finished) return;
      if (anim.skip) { cleanup(true); return; }
      if (t0 == null) t0 = now;
      var p = Math.min(1, (now - t0) / PEEL_MS);
      var ease = 1 - Math.pow(1 - Math.min(1, p / (1 - FADE_TAIL * 0.35)), 2.4);
      var x = (landX - startX) * ease;
      var y = (landY - startY) * ease - Math.sin(Math.PI * ease) * lift;
      var scale = 1 + 0.16 * Math.sin(Math.PI * Math.min(1, ease));
      var opacity = 1;
      if (p > 1 - FADE_TAIL) {
        opacity = Math.max(0, 1 - (p - (1 - FADE_TAIL)) / FADE_TAIL);
      }
      ghost.style.opacity = String(opacity);
      ghost.style.transform = "translate(" + x + "px, " + y + "px) scale(" + scale + ")";
      /* Mid × pops near the apex of the upward arc */
      if (ease >= 0.28 && ease <= 0.72) {
        timesGhost.style.opacity = String(Math.min(1, (ease - 0.28) / 0.12) * opacity);
        timesGhost.style.transform = "translate(-50%, -50%) scale(1)";
      } else if (ease > 0.72) {
        timesGhost.style.opacity = String(Math.max(0, 1 - (ease - 0.72) / 0.28) * opacity);
      }
      if (p < 1) raf(frame);
      else cleanup(false);
    }
    raf(frame);
  }

  /** One Manim next_slide: show this stage-pane (peel from previous if needed) */
  function runStageStep(pane) {
    if (!pane) return;
    clearAutoTimers();
    purgeGhosts();
    var frame = pane.parentElement;
    var panes = frame ? frame.querySelectorAll(".stage-pane") : [];
    var idx = paneIndex(pane);
    var prev = idx > 0 ? panes[idx - 1] : null;

    if (prev && prev.querySelector(".pow") && pane.querySelector(".peel-times, .next-factor, .peel-target")) {
      prev.classList.add("is-active");
      peelBetween(prev, pane, function () { /* stop — wait for next click */ });
      return;
    }
    if (pane.getAttribute("data-gather") === "1") {
      activatePane(pane);
      runGatherOnce(pane);
      return;
    }
    activatePane(pane);
  }

  function runGatherOnce(pane) {
    var list = Array.prototype.slice.call(pane.querySelectorAll(".token.factor"));
    if (list.length < 3) return;
    anim.busy = true;
    list[0].classList.add("gather-right");
    list[list.length - 1].classList.add("gather-left");
    function end() {
      list.forEach(function (t) {
        t.classList.remove("gather-left", "gather-right", "gather-mid");
      });
      anim.busy = false;
      anim.finish = null;
    }
    anim.finish = end;
    later(end, 640);
  }

  function runFracPhase(root) {
    var build = root.closest(".frac-build") || root;
    var phase = root.getAttribute("data-phase");
    var frac = build.querySelector(".frac-stack");
    if (!frac || !phase) return;
    if (phase === "bar" || phase === "compact") {
      frac.classList.add("phase-bar", "phase-compact");
      runFlyIns(frac.querySelector(".compact-view") || frac);
      return;
    }
    if (phase === "num" || phase === "expand") {
      frac.classList.remove("phase-compact");
      frac.classList.add("phase-bar", "phase-num", "phase-expand", "phase-den");
      runFlyIns(frac.querySelector(".num .expand-view") || frac.querySelector(".num"));
      runFlyIns(frac.querySelector(".den .expand-view") || frac.querySelector(".den"));
      return;
    }
    if (phase === "den") {
      frac.classList.add("phase-den");
      var denHost = frac.querySelector(".den .expand-view") || frac.querySelector(".den");
      runFlyIns(denHost);
      return;
    }
    if (phase === "cancel") {
      var cap = build.querySelector(".cancel-caption");
      if (cap) cap.classList.add("show");
      runCancelOnly(frac);
      return;
    }
    if (phase === "result") {
      var cap2 = build.querySelector(".cancel-caption");
      if (cap2) cap2.classList.remove("show");
      runGatherToResult(frac);
    }
  }

  function runCancelOnly(frac) {
    anim.busy = true;
    var numCancels = frac.querySelectorAll(".num .token.cancelable, .num .expand-view .token.cancelable");
    var denCancels = frac.querySelectorAll(".den .token.cancelable, .den .expand-view .token.cancelable");
    if (!numCancels.length) numCancels = frac.querySelectorAll(".num .token.cancelable");
    if (!denCancels.length) denCancels = frac.querySelectorAll(".den .token.cancelable");
    var pairs = Math.min(numCancels.length, denCancels.length);
    var steps = [];
    var i;
    for (i = 0; i < pairs; i++) {
      steps.push(numCancels[i]);
      steps.push(denCancels[i]);
    }
    var step = 0;
    function finishAll() {
      while (step < steps.length) {
        if (steps[step]) steps[step].classList.add("struck");
        step += 1;
      }
      frac.classList.add("cancelled", "cancel-done");
      frac.querySelectorAll(".token.remain").forEach(function (t) {
        t.classList.add("is-remaining");
      });
      anim.busy = false;
      anim.finish = null;
    }
    anim.finish = finishAll;
    function next() {
      if (anim.skip) { finishAll(); return; }
      if (step >= steps.length) { finishAll(); return; }
      if (steps[step]) {
        indicate(steps[step]);
        steps[step].classList.add("struck");
      }
      step += 1;
      later(next, CANCEL_MS);
    }
    later(next, 160);
  }

  function runGatherToResult(frac) {
    anim.busy = true;
    frac.classList.add("gathering");
    var rem = frac.querySelectorAll(".token.remain, .token.is-remaining");
    Array.prototype.forEach.call(rem, function (t) { t.classList.add("is-remaining"); });

    var side = frac.querySelector(".gather-side");
    var eq = frac.querySelector(".gather-eq");
    var result = frac.querySelector(".cancel-result");
    if (eq) eq.classList.add("show");

    /* Pull remaining factors down toward the = seat (right of fraction), then merge */
    var target = side || result || eq;
    var targetR = target ? target.getBoundingClientRect() : null;
    var ghosts = [];
    Array.prototype.forEach.call(rem, function (t, i) {
      if (!targetR) return;
      var r = t.getBoundingClientRect();
      var g = t.cloneNode(true);
      g.classList.add("fly-ghost", "flying");
      g.style.left = r.left + "px";
      g.style.top = r.top + "px";
      g.style.width = r.width + "px";
      g.style.height = r.height + "px";
      document.body.appendChild(g);
      ghosts.push(g);
      t.style.opacity = "0";
      var dx = targetR.left + targetR.width * 0.35 - r.left + i * 18;
      var dy = targetR.top + 8 - r.top;
      raf(function () {
        raf(function () {
          g.style.transform = "translate(" + dx + "px, " + dy + "px) scale(0.92)";
        });
      });
    });

    function end() {
      ghosts.forEach(function (g) {
        if (g.parentNode) g.parentNode.removeChild(g);
      });
      frac.classList.add("gathered");
      if (result) {
        result.classList.add("show");
        renderMath(result);
      }
      Array.prototype.forEach.call(rem, function (t) {
        t.classList.remove("gather-left", "gather-right", "gather-mid");
        t.style.opacity = "";
      });
      anim.busy = false;
      anim.finish = null;
    }
    anim.finish = end;
    later(end, 720);
  }

  /** One decimal-jump step — pendulum lower semicircle; direction from dx (left +n / right −n) */
  function runSciStep(eq) {
    if (!eq) return;
    var host = eq.parentElement;
    if (!host) return;
    var eqs = host.querySelectorAll(".sci-jump-eq");
    var idx = Array.prototype.indexOf.call(eqs, eq);
    var prev = idx > 0 ? eqs[idx - 1] : null;
    eqs.forEach(function (el) { el.classList.remove("is-on"); });
    if (prev) prev.classList.add("is-on");

    function show() {
      eqs.forEach(function (el) { el.classList.remove("is-on"); });
      eq.classList.add("is-on");
      anim.busy = false;
      anim.finish = null;
    }

    if (!prev) {
      eq.classList.add("is-on");
      return;
    }

    var dp = prev.querySelector(".dp-live");
    var dpTo = eq.querySelector(".dp-live");
    if (!dp || !dpTo) {
      show();
      return;
    }

    anim.busy = true;
    anim.finish = show;
    indicate(dp);
    var fr = dp.getBoundingClientRect();
    var tr = dpTo.getBoundingClientRect();
    var ghost = document.createElement("span");
    ghost.className = "dp-ghost";
    ghost.textContent = ".";
    ghost.style.left = fr.left + "px";
    ghost.style.top = fr.top + "px";
    document.body.appendChild(ghost);
    dp.style.opacity = "0";
    var dx = tr.left - fr.left;
    var dy = tr.top - fr.top;
    /* Lower semicircle (pendulum): parametric x linear, y dips below baseline */
    var radius = Math.max(36, Math.abs(dx) * 0.55);
    var t0 = null;
    var token = playToken;
    function frame(now) {
      if (token !== playToken) {
        if (ghost.parentNode) ghost.parentNode.removeChild(ghost);
        return;
      }
      if (anim.skip) {
        if (ghost.parentNode) ghost.parentNode.removeChild(ghost);
        dp.style.opacity = "";
        show();
        return;
      }
      if (t0 == null) t0 = now;
      var p = Math.min(1, (now - t0) / JUMP_MS);
      var ease = 1 - Math.pow(1 - p, 2.2);
      /* θ from π → 0 (left jump) or 0 → π mapped onto lower half via sin */
      var arcY = Math.sin(Math.PI * ease) * radius;
      ghost.style.transform =
        "translate(" + (dx * ease) + "px, " + (dy * ease + arcY) + "px)";
      if (p < 1) raf(frame);
      else {
        if (ghost.parentNode) ghost.parentNode.removeChild(ghost);
        dp.style.opacity = "";
        show();
      }
    }
    raf(frame);
  }

  /** One PV pair (one next_slide) */
  function runPvStep(term) {
    if (!term) return;
    var root = term.closest(".pv-stack") || term.parentElement;
    var i = parseInt(term.getAttribute("data-pv-i"), 10);
    if (isNaN(i)) {
      var terms = root.querySelectorAll(".expand-term");
      i = Array.prototype.indexOf.call(terms, term);
    }
    var cells = root.querySelectorAll('[data-pv-pair="' + i + '"]');
    if (!cells.length) {
      term.classList.add("landed");
      return;
    }
    var digit = cells[0];
    var place = cells[1] || cells[0];
    digit.classList.add("framed");
    place.classList.add("framed");
    anim.busy = true;

    function finish() {
      digit.classList.remove("framed");
      place.classList.remove("framed");
      digit.classList.add("dragged");
      place.classList.add("dragged");
      term.classList.remove("awaiting", "combining");
      term.classList.add("landed");
      document.querySelectorAll(".pv-drag-box").forEach(function (b) {
        if (b.parentNode) b.parentNode.removeChild(b);
      });
      anim.busy = false;
      anim.finish = null;
    }
    anim.finish = finish;

    later(function () {
      if (anim.skip) { finish(); return; }
      term.classList.add("awaiting");
      var dR = digit.getBoundingClientRect();
      var pR = place.getBoundingClientRect();
      var tR = term.getBoundingClientRect();
      function makeBox(rect, html) {
        var box = document.createElement("div");
        box.className = "pv-drag-box";
        box.innerHTML = html;
        box.style.left = rect.left + "px";
        box.style.top = rect.top + "px";
        box.style.width = rect.width + "px";
        box.style.height = rect.height + "px";
        document.body.appendChild(box);
        return box;
      }
      var boxD = makeBox(dR, digit.innerHTML);
      var boxP = makeBox(pR, place.innerHTML);
      raf(function () {
        raf(function () {
          boxD.style.transform = "translate(" + (tR.left - dR.left) + "px, " + (tR.top - dR.top) + "px)";
          boxP.style.transform = "translate(" + (tR.left - pR.left) + "px, " + (tR.top - pR.top + 8) + "px)";
        });
      });
      later(function () {
        if (anim.skip) { finish(); return; }
        term.classList.add("combining");
        boxP.style.transform =
          "translate(" + (tR.left - pR.left + dR.width * 0.85) + "px, " + (tR.top - pR.top) + "px)";
        boxD.classList.add("fade-frame");
        boxP.classList.add("fade-frame");
        later(finish, 450);
      }, FLY_MS);
    }, 280);
  }

  function runConvStep(row) {
    anim.busy = true;
    row.classList.add("rhs-in");
    var extra = row.querySelector(".conv-extra");
    var nextRow = row.nextElementSibling;
    while (nextRow && !nextRow.classList.contains("conv-row")) {
      nextRow = nextRow.nextElementSibling;
    }
    function end() {
      if (extra) {
        extra.classList.add("spent");
        if (nextRow) {
          var subj = nextRow.querySelector(".conv-subj");
          if (subj) flyFromTo(extra, subj, 0);
          nextRow.classList.add("recv-extra");
        }
      }
      anim.busy = false;
      anim.finish = null;
    }
    anim.finish = end;
    if (extra) {
      later(function () {
        extra.classList.add("dragging");
        later(end, 520);
      }, 400);
    } else {
      later(end, 280);
    }
  }

  function trySkipAnim() {
    if (!anim.busy) return false;
    anim.skip = true;
    if (typeof anim.finish === "function") anim.finish();
    return true;
  }

  function onFragmentShown(ev) {
    try {
      var frag = ev && ev.fragment;
      if (!frag) return;

      if (frag.classList.contains("stage-pane")) {
        runStageStep(frag);
        return;
      }
      if (frag.classList.contains("frac-phase") || frag.getAttribute("data-phase")) {
        runFracPhase(frag);
        return;
      }
      if (frag.classList.contains("sci-jump-eq")) {
        runSciStep(frag);
        return;
      }
      if (frag.classList.contains("expand-term") || frag.classList.contains("pv-step")) {
        runPvStep(frag);
        return;
      }
      if (frag.classList.contains("conv-row")) {
        runConvStep(frag);
        return;
      }
      clearSourceMarks();
      runFlyIns(frag);
    } catch (err) { /* */ }
  }

  function onFragmentHidden(ev) {
    clearAutoTimers();
    purgeGhosts();
    var frag = ev && ev.fragment;
    if (!frag) return;

    if (frag.classList.contains("stage-pane")) {
      frag.classList.remove("is-active", "peel-arrive");
      clearAllExpandFrames(frag.parentElement);
      var frame = frag.parentElement;
      if (frame) {
        var panes = frame.querySelectorAll(".stage-pane.visible");
        var last = panes[panes.length - 1];
        if (last && last !== frag) {
          last.classList.add("is-active");
          frameExampleSrc(last);
        }
      }
      return;
    }

    if (frag.classList.contains("frac-phase") || frag.getAttribute("data-phase")) {
      var build = frag.closest(".frac-build");
      var frac = build && build.querySelector(".frac-stack");
      if (!frac) return;
      var phase = frag.getAttribute("data-phase");
      var cap = build.querySelector(".cancel-caption");
      if (phase === "result") {
        frac.classList.remove("gathered", "gathering");
        frac.querySelectorAll(".cancel-result, .gather-eq").forEach(function (el) {
          el.classList.remove("show");
        });
        frac.querySelectorAll(".token.remain").forEach(function (t) {
          t.style.opacity = "";
          t.classList.add("is-remaining");
        });
      } else if (phase === "cancel") {
        frac.classList.remove("cancelled", "cancel-done");
        frac.querySelectorAll(".token.struck, .token.is-remaining").forEach(function (t) {
          t.classList.remove("struck", "is-remaining");
        });
        if (cap) cap.classList.remove("show");
      } else if (phase === "den") {
        frac.classList.remove("phase-den");
      } else if (phase === "num" || phase === "expand") {
        frac.classList.remove("phase-num", "phase-expand");
        frac.classList.add("phase-compact");
      } else if (phase === "bar" || phase === "compact") {
        frac.classList.remove("phase-bar", "phase-compact", "phase-num", "phase-expand", "phase-den");
      }
      return;
    }

    if (frag.classList.contains("sci-jump-eq")) {
      var host = frag.parentElement;
      if (!host) return;
      var eqs = host.querySelectorAll(".sci-jump-eq");
      frag.classList.remove("is-on");
      var visible = [];
      eqs.forEach(function (el) {
        if (el.classList.contains("visible") && el !== frag) visible.push(el);
      });
      eqs.forEach(function (el) { el.classList.remove("is-on"); });
      if (visible.length) visible[visible.length - 1].classList.add("is-on");
    }
  }

  function playTitleEnter(slide) {
    if (!slide) return;
    var head = slide.querySelector(".m-head");
    if (!head) return;
    head.classList.remove("title-enter");
    void head.offsetWidth;
    head.classList.add("title-enter");
    later(function () { syncTitleBars(slide); }, 80);
    later(function () { syncTitleBars(slide); }, 420);
  }

  Reveal.initialize({
    width: 1280,
    height: 720,
    margin: 0.04,
    minScale: 0.2,
    maxScale: 1.6,
    controls: false,
    progress: false,
    slideNumber: false,
    history: false,
    overview: false,
    keyboard: {
      27: null,       /* disable ESC overview */
      13: "next",
      32: "next",
      39: "next",
      37: "prev",
      8: "prev",       /* Backspace = go back one fragment */
      33: "prev",
      34: "next",
      38: null,
      40: null
    },
    touch: true,
    center: false,
    embedded: false,
    transition: "none",
    backgroundTransition: "none",
    fragments: true
  });

  function afterReady() {
    renderMath();
    syncTitleBars();
    try { Reveal.layout(); } catch (e) { /* */ }
    later(function () { syncTitleBars(); }, 80);
    playTitleEnter(Reveal.getCurrentSlide && Reveal.getCurrentSlide());

    if (Reveal.next) {
      var origNext = Reveal.next.bind(Reveal);
      Reveal.next = function () {
        if (trySkipAnim()) return;
        return origNext();
      };
    }
    if (Reveal.prev) {
      var origPrev = Reveal.prev.bind(Reveal);
      Reveal.prev = function () {
        clearAutoTimers();
        purgeGhosts();
        anim.busy = false;
        anim.skip = false;
        anim.finish = null;
        return origPrev();
      };
    }
  }

  if (Reveal.isReady && Reveal.isReady()) afterReady();
  else if (Reveal.on) Reveal.on("ready", afterReady);
  else setTimeout(afterReady, 60);

  if (Reveal.on) {
    Reveal.on("fragmentshown", onFragmentShown);
    Reveal.on("fragmenthidden", onFragmentHidden);
    Reveal.on("slidechanged", function (ev) {
      clearAutoTimers();
      restoreVisualState(document);
      syncTitleBars();
      document.querySelectorAll(".stage-pane").forEach(function (p) {
        p.classList.remove("is-active", "peel-arrive");
      });
      clearAllExpandFrames();
      playTitleEnter(ev && ev.currentSlide);
    });
  }

  document.addEventListener("selectstart", function (e) { e.preventDefault(); });
  document.addEventListener("mousedown", function (e) {
    if (e.detail > 1) e.preventDefault();
  });
})();
