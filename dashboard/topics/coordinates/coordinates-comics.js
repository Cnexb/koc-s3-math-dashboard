(function () {
  "use strict";
  var COMICS = [
    { id: "c1", title: "Reading gradient", chapter: "Ch.1 · Page 1",
      text: "Positive gradient → line goes **up** left to right. Negative → goes **down**.",
      checks: [{ id: "c1q", prompt: "Line through origin with gradient \\(3\\) passes \\((2, ?)\\)?",
        choices: ["\\(5\\)", "\\(6\\)", "\\(3\\)", "\\(1\\)"], answer: 1, explain: "\\(y = 3x \\Rightarrow y = 6\\)." }] },
    { id: "c2", title: "Distance formula", chapter: "Ch.1 · Page 2",
      text: "Horizontal change and vertical change form a right triangle — use Pythagoras.",
      checks: [{ id: "c2q", prompt: "Distance from \\((0,0)\\) to \\((3,4)\\)?",
        choices: ["\\(5\\)", "\\(7\\)", "\\(25\\)", "\\(1\\)"], answer: 0, explain: "\\(\\sqrt{9+16} = 5\\)." }] }
  ];
  function boot() { if (window.initJmComics) window.initJmComics(COMICS); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
