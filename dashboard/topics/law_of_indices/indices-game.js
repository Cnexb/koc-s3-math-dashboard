window.IndicesGame = (function () {
  var BEST_KEY = "jm24-indices-game-best";

  var canvas, ctx;
  var running = false;
  var rafId = null;
  var width = 900;
  var height = 520;
  var score = 0;
  var lives = 3;
  var combo = 0;
  var best = 0;
  var hits = 0;
  var shots = 0;
  var player = { x: 450, y: 460, w: 44, h: 28, speed: 6 };
  var bullets = [];
  var enemies = [];
  var particles = [];
  var keys = {};
  var touchDir = 0;
  var question = null;
  var questions = [];
  var questionIndex = 0;
  var presetId = "rules";
  var BASE_FALL = 0.35;
  var BASE_PLAYER = 6;
  var BASE_BULLET = 9;
  var SPEED_STEPS = [1, 2, 3];
  var speedStep = 0;
  var fallSpeed = BASE_FALL;
  var bulletSpeed = BASE_BULLET;
  var audioCtx = null;
  var toastTimer = null;
  var topicMisses = {};
  var lastWeakestTopic = null;
  var lastEndWasVictory = false;

  var onKeyDown = null;
  var onKeyUp = null;

  var STRINGS = {
    "game.ready": "Indices Space Shooter",
    "game.readyMsg": "Move with arrows or A/D. Shoot the falling box with the correct simplified answer.",
    "game.start": "Start Game",
    "game.again": "Play Again",
    "game.victory": "Victory!",
    "game.over": "Game Over",
    "game.victoryMsg": "You cleared every question.",
    "game.score": "Score",
    "game.accuracy": "Accuracy",
    "game.weakest": "Weakest topic",
    "game.weakestDetail": "{topic} ({count} miss)",
    "game.noWeakness": "No weak topic this round.",
    "game.reviewComics": "Review that topic",
    "game.wrong": "Wrong answer — see why below.",
    "game.missed": "The correct answer fell past you.",
  };

  function t(key) {
    if (window.I18n && typeof window.I18n.t === "function") {
      var translated = window.I18n.t(key);
      if (translated && translated !== key) return translated;
    }
    return STRINGS[key] || key;
  }

  function lang() {
    return window.I18n && window.I18n.lang === "zh" ? "zh" : "en";
  }

  function ensureAudio() {
    if (!audioCtx) {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
  }

  function playTone(type) {
    if (!audioCtx) return;
    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    var now = audioCtx.currentTime;
    var freq = 440;
    var dur = 0.08;

    if (type === "shoot") {
      freq = 880;
      dur = 0.05;
    } else if (type === "correct") {
      freq = 660;
      dur = 0.12;
    } else if (type === "wrong") {
      freq = 180;
      dur = 0.15;
    } else if (type === "life") {
      freq = 120;
      dur = 0.2;
    } else if (type === "win") {
      freq = 523;
      dur = 0.25;
    }

    osc.type = type === "wrong" || type === "life" ? "sawtooth" : "square";
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + dur);
  }

  function loadBest() {
    best = Number(localStorage.getItem(BEST_KEY) || 0);
  }

  function saveBest() {
    if (score > best) {
      best = score;
      localStorage.setItem(BEST_KEY, String(best));
    }
  }

  function updateHud() {
    var s = document.getElementById("hud-score");
    var l = document.getElementById("hud-lives");
    var c = document.getElementById("hud-combo");
    var b = document.getElementById("hud-best");
    var p = document.getElementById("hud-progress");
    if (s) s.textContent = String(score);
    if (l) l.textContent = String(lives);
    if (c) c.textContent = String(combo);
    if (b) b.textContent = String(best);
    if (p) {
      var total = questions.length || 0;
      var current = total ? Math.min(questionIndex + 1, total) : 0;
      p.textContent = total ? "Q " + current + "/" + total : "—";
    }
    updateSpeedHud();
  }

  function speedMultiplier() {
    return SPEED_STEPS[speedStep] || 1;
  }

  function updateSpeedHud() {
    var el = document.getElementById("btn-speed");
    if (el) el.textContent = "Speed " + speedMultiplier() + "×";
  }

  function applySpeed() {
    var mult = speedMultiplier();
    fallSpeed = BASE_FALL * mult;
    player.speed = BASE_PLAYER * (0.85 + 0.15 * mult);
    bulletSpeed = BASE_BULLET * (0.85 + 0.15 * mult);
    enemies.forEach(function (e) {
      e.vy = fallSpeed;
    });
    updateSpeedHud();
  }

  function speedUp() {
    if (speedStep < SPEED_STEPS.length - 1) speedStep += 1;
    applySpeed();
    return speedMultiplier();
  }

  function cycleSpeed() {
    speedStep = (speedStep + 1) % SPEED_STEPS.length;
    applySpeed();
    return speedMultiplier();
  }

  function setQuestionText() {
    var el = document.getElementById("game-question");
    if (!el || !question) return;
    el.textContent = lang() === "zh" ? question.questionZh : question.questionEn;
  }

  function correctChoice(q) {
    if (!q || !q.choices) return null;
    return q.choices.filter(function (c) {
      return c.correct;
    })[0] || null;
  }

  function explainQuestion(q) {
    if (!q) return "";
    var why = lang() === "zh" ? (q.whyZh || q.whyEn) : (q.whyEn || q.whyZh);
    var ans = correctChoice(q);
    var label = ans ? getChoiceLabel(ans) : "";
    if (why && label) return "Correct: " + label + " — " + why;
    if (why) return why;
    if (label) return "Correct answer: " + label;
    return "";
  }

  function setExplain(text, kind) {
    var el = document.getElementById("game-explain");
    if (!el) return;
    el.textContent = text || "";
    el.classList.remove("is-ok", "is-bad");
    if (kind) el.classList.add(kind);
  }

  function gamePanelVisible() {
    var panel = document.getElementById("panel-game");
    return !!(panel && !panel.classList.contains("hidden"));
  }

  function setOverlayVisible(on) {
    var overlay = document.getElementById("game-overlay");
    if (!overlay) return;
    overlay.classList.toggle("is-visible", !!on);
    overlay.classList.toggle("hidden", !on);
    overlay.style.display = on ? "flex" : "none";
  }

  function goToTopicLab(topicId) {
    var lab = "powers";
    if (topicId === "scientific-notation") lab = "scientific";
    else if (topicId === "binary") lab = "binary";
    var toolsTab = document.querySelector('.jm-tab[data-tab="tools"]');
    if (toolsTab) toolsTab.click();
    var chip = document.querySelector('.subnav .chip[data-lab="' + lab + '"]');
    if (chip) chip.click();
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  function getChoiceLabel(choice) {
    return lang() === "zh" ? choice.textZh : choice.textEn;
  }

  function spawnFourAnswers() {
    if (!question) return;
    var choices = shuffle(question.choices.slice());
    applySpeed();
    var laneW = width / 4;
    var boxW = Math.min(214, laneW - 10);
    enemies = choices.map(function (choice, i) {
      return {
        x: laneW * i + (laneW - boxW) / 2,
        y: 56,
        w: boxW,
        h: 58,
        vy: fallSpeed,
        vx: 0,
        textEn: choice.textEn,
        textZh: choice.textZh,
        label: getChoiceLabel(choice),
        isCorrect: !!choice.correct,
      };
    });
  }

  function loadCurrentQuestion() {
    if (questionIndex >= questions.length) {
      victory();
      return;
    }
    question = questions[questionIndex];
    setQuestionText();
    setExplain("", "");
    bullets = [];
    spawnFourAnswers();
    updateHud();
  }

  function showToast(key) {
    var el = document.getElementById("game-toast");
    if (!el) return;
    el.textContent = t(key);
    el.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.classList.remove("is-visible");
    }, 1200);
  }

  function fire() {
    if (!running) return;
    ensureAudio();
    playTone("shoot");
    bullets.push({ x: player.x, y: player.y - 16, r: 4, vy: -bulletSpeed });
  }

  function burst(x, y, color) {
    for (var i = 0; i < 14; i++) {
      particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 30 + Math.random() * 20,
        color: color,
      });
    }
  }

  function rectHit(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }

  function advanceQuestion() {
    questionIndex += 1;
    if (questionIndex >= questions.length) {
      victory();
      return;
    }
    loadCurrentQuestion();
  }

  function missWave() {
    combo = 0;
    lives -= 1;
    recordTopicMiss();
    ensureAudio();
    playTone("life");
    showToast("game.missed");
    setExplain(explainQuestion(question), "is-bad");
    updateHud();
    if (lives <= 0) {
      endGame();
      return;
    }
    window.setTimeout(function () {
      if (!running) return;
      advanceQuestion();
    }, 1600);
  }

  function endGame() {
    running = false;
    saveBest();
    updateHud();
    showEndSummary(false);
  }

  function victory() {
    running = false;
    saveBest();
    updateHud();
    ensureAudio();
    playTone("win");
    showEndSummary(true);
  }

  function update() {
    if (!running) return;

    if (keys["ArrowLeft"] || keys["a"] || keys["A"] || touchDir < 0) player.x -= player.speed;
    if (keys["ArrowRight"] || keys["d"] || keys["D"] || touchDir > 0) player.x += player.speed;
    player.x = Math.max(30, Math.min(width - 30, player.x));

    bullets.forEach(function (b) {
      b.y += b.vy;
    });
    bullets = bullets.filter(function (b) {
      return b.y > -20;
    });

    enemies.forEach(function (e) {
      e.y += fallSpeed;
    });

    if (enemies.length > 0 && enemies.every(function (e) {
      return e.y > height + 10;
    })) {
      var hadCorrect = enemies.some(function (e) {
        return e.isCorrect;
      });
      enemies = [];
      if (hadCorrect) {
        missWave();
        return;
      }
      advanceQuestion();
      return;
    }

    for (var i = enemies.length - 1; i >= 0; i--) {
      var e = enemies[i];
      for (var j = bullets.length - 1; j >= 0; j--) {
        var b = bullets[j];
        if (rectHit(b.x - b.r, b.y - b.r, b.r * 2, b.r * 2, e.x, e.y, e.w, e.h)) {
          bullets.splice(j, 1);
          shots += 1;
          if (e.isCorrect) {
            hits += 1;
            combo += 1;
            score += 100 + combo * 20 + (questionIndex + 1) * 5;
            ensureAudio();
            playTone("correct");
            burst(e.x + e.w / 2, e.y + e.h / 2, "#3dd68c");
            enemies = [];
            updateHud();
            advanceQuestion();
            return;
          }
          enemies.splice(i, 1);
          combo = 0;
          lives -= 1;
          recordTopicMiss();
          ensureAudio();
          playTone("wrong");
          showToast("game.wrong");
          setExplain(explainQuestion(question), "is-bad");
          burst(e.x + e.w / 2, e.y + e.h / 2, "#ff6b5a");
          updateHud();
          if (lives <= 0) {
            endGame();
            return;
          }
          if (!enemies.some(function (en) {
            return en.isCorrect;
          })) {
            advanceQuestion();
            return;
          }
          break;
        }
      }
    }

    particles.forEach(function (p) {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 1;
    });
    particles = particles.filter(function (p) {
      return p.life > 0;
    });
  }

  function drawPlane() {
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.fillStyle = "#4FC3F7";
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(18, 14);
    ctx.lineTo(0, 8);
    ctx.lineTo(-18, 14);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#0284c7";
    ctx.fillRect(-3, -6, 6, 12);
    ctx.restore();
  }

  function roundRect(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }

  function draw() {
    if (!ctx) return;
    var g = ctx.createLinearGradient(0, 0, 0, height);
    g.addColorStop(0, "#0b1c2e");
    g.addColorStop(1, "#163552");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "rgba(255,255,255,0.35)";
    for (var i = 0; i < 40; i++) {
      var sx = (i * 97 + questionIndex * 3) % width;
      var sy = (i * 53 + Math.floor(performance.now() / 40) + i * 7) % height;
      ctx.fillRect(sx, sy, 2, 2);
    }

    enemies.forEach(function (e) {
      ctx.fillStyle = "rgba(14, 116, 166, 0.96)";
      roundRect(ctx, e.x, e.y, e.w, e.h, 14);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.28)";
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.font = "700 26px 'DM Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      var label = e.label;
      if (ctx.measureText(label).width > e.w - 18) {
        ctx.font = "700 20px 'DM Sans', sans-serif";
      }
      ctx.fillText(label, e.x + e.w / 2, e.y + e.h / 2);
    });

    bullets.forEach(function (b) {
      ctx.beginPath();
      ctx.fillStyle = "#4FC3F7";
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    });

    particles.forEach(function (p) {
      ctx.globalAlpha = Math.max(0, p.life / 40);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 3, 3);
      ctx.globalAlpha = 1;
    });

    drawPlane();
  }

  function loop() {
    update();
    draw();
    if (running) rafId = requestAnimationFrame(loop);
  }

  function start() {
    presetId = "rules";
    questions = window.getJM24GameQuestions
      ? window.getJM24GameQuestions("rules")
      : [];
    if (!questions.length) return;

    score = 0;
    lives = 3;
    combo = 0;
    hits = 0;
    shots = 0;
    questionIndex = 0;
    bullets = [];
    enemies = [];
    particles = [];
    player.x = width / 2;
    applySpeed();
    resetTopicMisses();
    lastWeakestTopic = null;

    setOverlayVisible(false);
    setExplain("", "");

    loadCurrentQuestion();
    updateHud();
    running = true;
    ensureAudio();
    if (rafId) cancelAnimationFrame(rafId);
    loop();
  }

  function pause() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
  }

  function resize() {
    if (!canvas) return;
    width = canvas.width;
    height = canvas.height;
    player.y = height - 60;
  }

  function resetTopicMisses() {
    topicMisses = {};
    questions.forEach(function (q) {
      if (q.topic) topicMisses[q.topic] = 0;
    });
  }

  function recordTopicMiss() {
    if (!question || !question.topic) return;
    topicMisses[question.topic] = (topicMisses[question.topic] || 0) + 1;
  }

  function getWeakestTopic() {
    var weakest = null;
    var maxMisses = 0;
    Object.keys(topicMisses).forEach(function (topic) {
      var count = topicMisses[topic] || 0;
      if (count > maxMisses) {
        maxMisses = count;
        weakest = topic;
      }
    });
    return maxMisses > 0 ? weakest : null;
  }

  function formatWeakestDetail(topicId) {
    var count = topicMisses[topicId] || 0;
    var label = window.getJM24GameTopicLabel
      ? window.getJM24GameTopicLabel(topicId, lang())
      : topicId;
    return (t("game.weakestDetail") || "Weakest: {topic} ({count})")
      .replace("{topic}", label)
      .replace("{count}", String(count));
  }

  function hideReviewButton() {
    var reviewBtn = document.getElementById("btn-review-comics");
    if (reviewBtn) {
      reviewBtn.hidden = true;
      reviewBtn.onclick = null;
    }
  }

  function showEndSummary(isVictory) {
    lastEndWasVictory = !!isVictory;
    var overlay = document.getElementById("game-overlay");
    var title = document.getElementById("overlay-title");
    var msg = document.getElementById("overlay-msg");
    var weakestEl = document.getElementById("overlay-weakest");
    var btn = document.getElementById("btn-start");
    var reviewBtn = document.getElementById("btn-review-comics");
    var acc = shots ? Math.round((hits / shots) * 100) : 0;
    lastWeakestTopic = getWeakestTopic();

    setOverlayVisible(true);
    if (title) title.textContent = isVictory ? t("game.victory") : t("game.over");

    if (msg) {
      if (isVictory) {
        msg.textContent = (t("game.victoryMsg") || "Great job!") + " " + (t("game.score") || "Score") + ": " + score;
      } else {
        msg.textContent =
          (t("game.score") || "Score") + ": " + score + " · " + (t("game.accuracy") || "Accuracy") + ": " + acc + "%";
      }
    }

    if (weakestEl) {
      if (lastWeakestTopic) {
        weakestEl.hidden = false;
        weakestEl.textContent = (t("game.weakest") || "Weakest") + ": " + formatWeakestDetail(lastWeakestTopic);
      } else {
        weakestEl.hidden = false;
        weakestEl.textContent = t("game.noWeakness") || "No weaknesses detected!";
      }
    }

    if (btn) {
      btn.textContent = t("game.again") || "Play Again";
      btn.onclick = function () {
        start();
      };
    }

    if (reviewBtn) {
      if (lastWeakestTopic) {
        reviewBtn.hidden = false;
        reviewBtn.textContent = t("game.reviewComics") || "Review Comics";
        reviewBtn.onclick = function () {
          if (window.LessonComics && window.LessonComics.switchSubTopic) {
            window.LessonComics.switchSubTopic(lastWeakestTopic);
          }
          goToTopicLab(lastWeakestTopic);
        };
      } else {
        hideReviewButton();
      }
    }
  }

  function showReadyOverlay() {
    var overlay = document.getElementById("game-overlay");
    var title = document.getElementById("overlay-title");
    var msg = document.getElementById("overlay-msg");
    var weakestEl = document.getElementById("overlay-weakest");
    var btn = document.getElementById("btn-start");
    setOverlayVisible(true);
    if (title) title.textContent = t("game.ready");
    if (msg) msg.textContent = t("game.readyMsg");
    if (weakestEl) {
      weakestEl.hidden = true;
      weakestEl.textContent = "";
    }
    hideReviewButton();
    lastWeakestTopic = null;
    lastEndWasVictory = false;
    if (btn) {
      btn.textContent = t("game.start") || "Start Game";
      btn.onclick = function () {
        start();
      };
    }
  }

  function bindControls() {
    onKeyDown = function (e) {
      if (!gamePanelVisible()) return;
      keys[e.key] = true;
      if (e.code === "Space" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
        if (running) e.preventDefault();
      }
      if (e.code === "Space" && running) fire();
      if (e.key === "+" || e.key === "=") {
        speedUp();
        if (running) e.preventDefault();
      }
      if (e.key === "-" || e.key === "_") {
        if (speedStep > 0) speedStep -= 1;
        applySpeed();
        if (running) e.preventDefault();
      }
    };
    onKeyUp = function (e) {
      keys[e.key] = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    var left = document.getElementById("btn-left");
    var right = document.getElementById("btn-right");
    var fireBtn = document.getElementById("btn-fire");

    function hold(dir) {
      return {
        down: function (e) {
          e.preventDefault();
          touchDir = dir;
        },
        up: function (e) {
          e.preventDefault();
          touchDir = 0;
        },
      };
    }

    if (left) {
      var hL = hold(-1);
      left.addEventListener("pointerdown", hL.down);
      left.addEventListener("pointerup", hL.up);
      left.addEventListener("pointerleave", hL.up);
    }
    if (right) {
      var hR = hold(1);
      right.addEventListener("pointerdown", hR.down);
      right.addEventListener("pointerup", hR.up);
      right.addEventListener("pointerleave", hR.up);
    }
    if (fireBtn) {
      fireBtn.addEventListener("click", function (e) {
        e.preventDefault();
        fire();
      });
    }

    var speedBtn = document.getElementById("btn-speed");
    if (speedBtn) {
      speedBtn.addEventListener("click", function (e) {
        e.preventDefault();
        cycleSpeed();
      });
    }

    document.querySelectorAll(".game-preset-pill").forEach(function (pill) {
      pill.addEventListener("click", function () {
        if (running) return;
        document.querySelectorAll(".game-preset-pill").forEach(function (p) {
          p.classList.remove("is-active");
        });
        pill.classList.add("is-active");
        presetId = pill.getAttribute("data-preset") || "all";
      });
    });
  }

  function init() {
    canvas = document.getElementById("game-canvas");
    if (!canvas) return;
    ctx = canvas.getContext("2d");
    loadBest();
    resize();
    bindControls();
    showReadyOverlay();
    applySpeed();
    updateHud();
    draw();
  }

  function destroy() {
    pause();
    if (onKeyDown) window.removeEventListener("keydown", onKeyDown);
    if (onKeyUp) window.removeEventListener("keyup", onKeyUp);
    onKeyDown = null;
    onKeyUp = null;
    clearTimeout(toastTimer);
    canvas = null;
    ctx = null;
  }

  function onLangChange() {
    setQuestionText();
    enemies.forEach(function (e) {
      e.label = lang() === "zh" ? e.textZh : e.textEn;
    });
    if (!running) {
      if (lastWeakestTopic || lastEndWasVictory) {
        showEndSummary(lastEndWasVictory);
      } else {
        showReadyOverlay();
      }
    }
  }

  function onShow() {
    draw();
  }

  function onHide() {
    pause();
  }

  return {
    init: init,
    destroy: destroy,
    start: start,
    speedUp: speedUp,
    cycleSpeed: cycleSpeed,
    onLangChange: onLangChange,
    onShow: onShow,
    onHide: onHide,
  };
})();
