(function () {
  "use strict";

  function renderKatex(root) {
    if (!root) root = document.body;
    root.querySelectorAll("[data-tex]").forEach(function (el) {
      if (!el.children.length && (!el.textContent || !el.textContent.trim())) {
        var tex = el.getAttribute("data-tex");
        if (tex) el.innerHTML = "\\(" + tex + "\\)";
      }
    });
    if (window.renderMathInElement) {
      window.renderMathInElement(root, {
        delimiters: [
          { left: "\\(", right: "\\)", display: false },
          { left: "\\[", right: "\\]", display: true },
        ],
      });
    }
  }

  window.initJmTabs = function () {
    function normalizeTab(tabName) {
      if (!tabName) return "concept";
      if (tabName === "slides" || tabName === "concept") return "concept";
      if (tabName === "games" || tabName === "game") return "game";
      if (tabName === "comics" || tabName === "comic") return "comic";
      return tabName;
    }

    function showTab(name) {
      var norm = normalizeTab(name);
      document.querySelectorAll(".jm-tab").forEach(function (btn) {
        var btnNorm = normalizeTab(btn.dataset.tab);
        btn.classList.toggle("active", btnNorm === norm);
      });
      document.querySelectorAll(".jm-panel").forEach(function (panel) {
        var pid = panel.id.replace(/^panel-/, "");
        var pidNorm = normalizeTab(pid);
        var isActive = pidNorm === norm;
        panel.classList.toggle("hidden", !isActive);
        panel.classList.toggle("active", isActive);
      });
      history.replaceState(null, "", "#" + norm);
      if (norm === "tools") {
        renderKatex(document.getElementById("panel-tools"));
        if (window.FZ_ACTIVATE_TOOL) {
          var activeChip = document.querySelector("#panel-tools [data-tool].active");
          window.FZ_ACTIVATE_TOOL(activeChip ? activeChip.dataset.tool : "sum");
        }
      }
      if (norm === "comic") renderKatex(document.getElementById("panel-comic") || document.getElementById("panel-comics"));
      if (norm === "concept") renderKatex(document.getElementById("panel-concept") || document.getElementById("panel-slides"));
    }

    document.querySelectorAll(".jm-tab").forEach(function (btn) {
      btn.addEventListener("click", function () {
        showTab(btn.dataset.tab);
      });
    });

    var hash = (location.hash || "").replace("#", "");
    var normHash = normalizeTab(hash);
    if (hash && (normHash === "comic" || normHash === "game" || normHash === "tools" || normHash === "summary" || normHash === "quiz")) {
      showTab(normHash);
    } else if (!hash || normHash === "concept") {
      showTab("concept");
    }
  };
})();

(function () {
  "use strict";
  function mayKeepFocus(el) {
    if (!el || el === document.body || el === document.documentElement) return true;
    var tag = el.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || tag === "BUTTON" || tag === "A") return true;
    if (el.isContentEditable) return true;
    var role = el.getAttribute("role");
    if (role === "button" || role === "tab" || role === "separator" || role === "checkbox" || role === "radio") return true;
    var ti = el.getAttribute("tabindex");
    if (ti != null && ti !== "-1") return true;
    return false;
  }
  var UI_BLOCK =
    ".slider-row, .tool-sliders, .figure-card, .legend, .lg-item, .chip, " +
    ".tab-row .tab, .tabs .tab, .pcard, .tiny-x, .cross-lab, .sf-card, .stat-card, " +
    ".stat-pill, .badge-row, .subnav, .deck-wrap, svg, .lab-svg, .numline-svg, " +
    ".bar-chart-fixed, .jm-tabs, .power-block, .times-sign, .one-mark, .bit-toggle, " +
    ".quiz-nav, .sf-progress-track, .count-row .btn, .tool-action, .cross-btn, " +
    ".method-chip, .step-dots, .nav-btn, .deck-nav-btn, .it-field, .transform-sliders";
  document.addEventListener("focusin", function (e) {
    if (mayKeepFocus(e.target)) return;
    e.target.blur();
  });
  document.addEventListener("mousedown", function (e) {
    if (e.button !== 0) return;
    var el = e.target;
    if (!el || el.closest("input, textarea, select, [contenteditable='true']")) return;
    if (el.closest("button, a, [role='button'], [role='tab'], [tabindex]:not([tabindex='-1'])")) return;
    if (el.closest(".hint, .lead, .feedback, .cross-step-note, .step-text, .intro, " +
        ".task-box p, .panel p, .no-sol, .quiz-stem, .eq-line, .step-title, .comic-check-card")) return;
    if (el.closest(UI_BLOCK)) e.preventDefault();
  });
})();
