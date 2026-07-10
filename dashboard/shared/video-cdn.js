/**
 * On Cloudflare Pages, slide .mp4 files are not deployed.
 * Rewrite Reveal background-video URLs to GitHub Pages before init.
 * Also used as a client-side fallback if edge redirects are unavailable.
 */
(function () {
  "use strict";

  var GH =
    "https://unipluseducationact-ctrl.github.io/koc-s3-math-dashboard/dashboard";
  var onPagesDev = /\.pages\.dev$/i.test(location.hostname);
  if (!onPagesDev) return;

  var rewritten = 0;
  document.querySelectorAll("[data-background-video]").forEach(function (el) {
    var v = el.getAttribute("data-background-video");
    if (!v || /^https?:\/\//i.test(v)) return;
    var absPath = new URL(v, location.href).pathname;
    el.setAttribute("data-background-video", GH + absPath);
    rewritten += 1;
  });

  document.querySelectorAll("video source[src], video[src]").forEach(function (el) {
    var attr = el.hasAttribute("src") ? "src" : null;
    if (!attr) return;
    var v = el.getAttribute(attr);
    if (!v || /^https?:\/\//i.test(v)) return;
    var absPath = new URL(v, location.href).pathname;
    el.setAttribute(attr, GH + absPath);
    rewritten += 1;
  });

  // #region agent log
  fetch("http://127.0.0.1:7343/ingest/474a74ed-e86f-45eb-826b-6126cb6afa26", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "f6bb99",
    },
    body: JSON.stringify({
      sessionId: "f6bb99",
      runId: "post-fix",
      hypothesisId: "A",
      location: "shared/video-cdn.js",
      message: "rewrote slide video URLs for pages.dev",
      data: {
        host: location.hostname,
        path: location.pathname,
        rewritten: rewritten,
      },
      timestamp: Date.now(),
    }),
  }).catch(function () {});
  // #endregion
})();
