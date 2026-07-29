(function () {
  "use strict";
  var COMICS = [
    { id: "q1", title: "Parallel pairs", chapter: "Ch.1 · Page 1",
      text: "In a parallelogram, **both pairs** of opposite sides are parallel. That is the defining property.",
      checks: [{ id: "q1q", prompt: "Which must be true in a parallelogram?",
        choices: ["All sides equal", "Opposite sides parallel", "All angles \\(90^\\circ\\)", "Diagonals perpendicular"],
        answer: 1, explain: "Opposite sides are parallel." }] },
    { id: "q2", title: "Square checklist", chapter: "Ch.1 · Page 2",
      text: "A **square** has equal sides, right angles, and equal diagonals that bisect at \\(90^\\circ\\).",
      checks: [{ id: "q2q", prompt: "A square is always a…",
        choices: ["Rhombus only", "Rectangle only", "Both rhombus and rectangle", "Neither"],
        answer: 2, explain: "Square satisfies both definitions." }] }
  ];
  function boot() { if (window.initJmComics) window.initJmComics(COMICS); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
