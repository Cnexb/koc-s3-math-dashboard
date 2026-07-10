/**
 * On Cloudflare Pages, slide .mp4 files are not deployed (~800MB stripped).
 * Rewrite Reveal background-video URLs to GitHub Pages before Reveal.init.
 */
(function () {
  "use strict";

  var GH =
    "https://unipluseducationact-ctrl.github.io/koc-s3-math-dashboard/dashboard";
  // Only rewrite when not already on GitHub Pages (local / CF / custom domain).
  if (/github\.io$/i.test(location.hostname)) return;
  if (location.protocol === "file:") return;

  document.querySelectorAll("[data-background-video]").forEach(function (el) {
    var v = el.getAttribute("data-background-video");
    if (!v || /^https?:\/\//i.test(v)) return;
    el.setAttribute(
      "data-background-video",
      GH + new URL(v, location.href).pathname
    );
  });

  document.querySelectorAll("video source[src], video[src]").forEach(function (el) {
    var v = el.getAttribute("src");
    if (!v || /^https?:\/\//i.test(v)) return;
    el.setAttribute("src", GH + new URL(v, location.href).pathname);
  });
})();
