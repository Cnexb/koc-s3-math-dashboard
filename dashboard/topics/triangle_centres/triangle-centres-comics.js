(function () {
  "use strict";
  var COMICS = [
    {
      id: "t1", title: "Meet the centroid", chapter: "Ch.1 · Page 1",
      text: "Draw all three medians. They cross at one point G — the **centroid** — always inside the triangle.",
      checks: [{ id: "t1q", prompt: "How many medians does a triangle have?",
        choices: ["1", "2", "3", "6"], answer: 2, explain: "One from each vertex." }]
    },
    {
      id: "t2", title: "Ratio on a median", chapter: "Ch.1 · Page 2",
      text: "The centroid splits each median so the part from the vertex is **twice** the part from the midpoint.",
      checks: [{ id: "t2q", prompt: "If \\(AG = 8\\) cm, find \\(GD\\).",
        choices: ["\\(2\\) cm", "\\(4\\) cm", "\\(8\\) cm", "\\(16\\) cm"], answer: 1, explain: "\\(AG:GD = 2:1 \\Rightarrow GD = 4\\) cm." }]
    }
  ];
  function boot() { if (window.initJmComics) window.initJmComics(COMICS); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
