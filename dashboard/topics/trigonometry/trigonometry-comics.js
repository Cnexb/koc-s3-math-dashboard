(function () {
  "use strict";
  var COMICS = [
    { id: "tr1", title: "Label the triangle", chapter: "Ch.1 · Page 1",
      text: "Always mark \\(\\theta\\) first, then label **O**, **A**, **H** from that angle.",
      checks: [{ id: "tr1q", prompt: "\\(\\cos\\theta = ?\\)",
        choices: ["\\(\\frac{O}{H}\\)", "\\(\\frac{A}{H}\\)", "\\(\\frac{O}{A}\\)", "\\(\\frac{H}{A}\\)"],
        answer: 1, explain: "CAH — adjacent over hypotenuse." }] },
    { id: "tr2", title: "Identity check", chapter: "Ch.1 · Page 2",
      text: "If \\(\\sin\\theta = 0.6\\), then \\(\\cos\\theta = 0.8\\) on a right triangle because \\(0.6^2 + 0.8^2 = 1\\).",
      checks: [{ id: "tr2q", prompt: "\\(\\sin^2 30^\\circ + \\cos^2 30^\\circ = ?\\)",
        choices: ["\\(0\\)", "\\(1\\)", "\\(0.5\\)", "\\(2\\)"], answer: 1, explain: "Always 1 for any angle." }] }
  ];
  function boot() { if (window.initJmComics) window.initJmComics(COMICS); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
