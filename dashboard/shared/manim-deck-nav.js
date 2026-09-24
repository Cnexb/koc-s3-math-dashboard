/** Manim-Slides / Reveal: click & Enter → next; ← / Backspace → prev fragment; no ESC. */
(function () {
  "use strict";

  function install(Reveal) {
    if (!Reveal || Reveal.__kocManimNav) return;
    Reveal.__kocManimNav = true;

    Reveal.addKeyBinding(
      { keyCode: 13, key: "ENTER", description: "Next slide" },
      function () { Reveal.next(); }
    );
    Reveal.addKeyBinding(
      { keyCode: 37, key: "LEFT", description: "Previous fragment" },
      function () { Reveal.prev(); }
    );
    Reveal.addKeyBinding(
      { keyCode: 8, key: "BACKSPACE", description: "Previous fragment" },
      function () { Reveal.prev(); }
    );
    /* Cancel ESC overview */
    Reveal.addKeyBinding(
      { keyCode: 27, key: "ESC", description: "Disabled" },
      function () { /* no-op */ }
    );
    Reveal.addKeyBinding(
      { keyCode: 38, key: "UP", description: "Disabled" },
      function () { /* no-op */ }
    );
    Reveal.addKeyBinding(
      { keyCode: 40, key: "DOWN", description: "Disabled" },
      function () { /* no-op */ }
    );

    try {
      if (typeof Reveal.configure === "function") {
        Reveal.configure({ overview: false });
      }
    } catch (err) { /* ignore */ }

    document.addEventListener("click", function (e) {
      if (e.button !== 0) return;
      if (e.target.closest("a, button, .controls, .progress, .speaker-notes")) return;
      try {
        if (Reveal.isReady && Reveal.isReady()) Reveal.next();
      } catch (err2) { /* ignore */ }
    });
  }

  function boot() {
    var R = window.Reveal;
    if (!R) return;
    if (typeof R.isReady === "function" && R.isReady()) {
      install(R);
      return;
    }
    if (typeof R.on === "function") {
      R.on("ready", function () { install(window.Reveal); });
    } else {
      setTimeout(boot, 50);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
