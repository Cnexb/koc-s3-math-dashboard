/** iPad / tablet slide-deck touch nav (swipe + arrows). Desktop unchanged — gated by html.tablet-touch. */
(function () {
  "use strict";

  const TABLET_MAX_W = 1366;
  let resizeBound = false;

  function isTouchTabletDevice() {
    if (navigator.maxTouchPoints < 1) return false;
    const w = window.innerWidth;
    if (w < 768 || w > TABLET_MAX_W) return false;
    const ua = navigator.userAgent || "";
    if (/iPad/i.test(ua)) return true;
    if (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) return true;
    if (window.matchMedia("(pointer: coarse)").matches) return true;
    if (window.matchMedia("(hover: none)").matches) return true;
    return false;
  }

  function isTabletTouch() {
    return document.documentElement.classList.contains("tablet-touch");
  }

  function initTabletClass() {
    document.documentElement.classList.toggle("tablet-touch", isTouchTabletDevice());
  }

  function initTabletMode(onChange) {
    function apply() {
      initTabletClass();
      if (onChange) onChange();
    }
    apply();
    if (!resizeBound) {
      resizeBound = true;
      window.addEventListener("resize", apply);
      window.addEventListener("orientationchange", () => setTimeout(apply, 120));
    }
  }

  function initDeckTouchNav(frame) {
    const wrap = document.querySelector("#panel-slides .deck-wrap");
    const prevBtn = document.getElementById("deck-prev");
    const nextBtn = document.getElementById("deck-next");
    if (!wrap || !frame) return;

    const SWIPE_MIN = 48;

    function deckStep(dir) {
      if (!isTabletTouch()) return;
      try {
        const r = frame.contentWindow && frame.contentWindow.Reveal;
        if (r && r.isReady && r.isReady()) {
          if (dir === "next") r.next();
          else r.prev();
          return;
        }
      } catch (e) { /* not loaded */ }
      try {
        frame.contentWindow.postMessage(
          JSON.stringify({ method: dir === "next" ? "next" : "prev", args: [] }),
          "*"
        );
      } catch (e2) {}
    }

    function focusFrame() {
      if (!isTabletTouch()) return;
      try { frame.focus(); } catch (e) {}
    }

    if (isTouchTabletDevice()) frame.setAttribute("tabindex", "-1");

    let startX = 0;
    let startY = 0;
    let tracking = false;

    wrap.addEventListener("touchstart", (e) => {
      if (!isTabletTouch() || e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      tracking = true;
      focusFrame();
    }, { passive: true });

    wrap.addEventListener("touchend", (e) => {
      if (!tracking || !isTabletTouch()) {
        tracking = false;
        return;
      }
      tracking = false;
      const t = e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (Math.abs(dx) < SWIPE_MIN) return;
      if (Math.abs(dy) > Math.abs(dx) * 0.6) return;
      e.preventDefault();
      if (dx < 0) deckStep("next");
      else deckStep("prev");
    }, { passive: false });

    wrap.addEventListener("pointerdown", (e) => {
      if (!isTabletTouch() || e.pointerType !== "touch") return;
      focusFrame();
    });

    if (prevBtn) prevBtn.addEventListener("click", (e) => { e.preventDefault(); focusFrame(); deckStep("prev"); });
    if (nextBtn) nextBtn.addEventListener("click", (e) => { e.preventDefault(); focusFrame(); deckStep("next"); });
  }

  window.KOCDeckTouch = {
    isTouchTabletDevice,
    isTabletTouch,
    initTabletClass,
    initTabletMode,
    initDeckTouchNav,
  };
})();
