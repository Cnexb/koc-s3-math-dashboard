/** iPhone / narrow phone layout — gated by html.phone-compact (<=767px).
 * Desktop and iPad (tablet-touch, >=768px) are unchanged. */
(function () {
  "use strict";

  var PHONE_MAX_W = 767;

  function isPhoneCompact() {
    return window.innerWidth <= PHONE_MAX_W;
  }

  function applyPhoneClass() {
    document.documentElement.classList.toggle("phone-compact", isPhoneCompact());
  }

  function boot() {
    applyPhoneClass();
    window.addEventListener("resize", applyPhoneClass);
    window.addEventListener("orientationchange", function () {
      setTimeout(applyPhoneClass, 120);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.KOCPhone = { isPhoneCompact: isPhoneCompact, applyPhoneClass: applyPhoneClass };
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
