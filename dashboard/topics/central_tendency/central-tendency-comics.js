(function () {
  "use strict";
  var COMICS = [
    { id: "s1", title: "Mean balance point", chapter: "Ch.1 · Page 1",
      text: "The **mean** is the balance point of the data — every value pulls the average up or down.",
      checks: [{ id: "s1q", prompt: "Mean of \\(2, 4, 6\\)?",
        choices: ["\\(3\\)", "\\(4\\)", "\\(5\\)", "\\(6\\)"], answer: 1, explain: "\\(12 \\div 3 = 4\\)." }] },
    { id: "s2", title: "Median vs mean", chapter: "Ch.1 · Page 2",
      text: "With an **outlier**, the median is often more representative than the mean.",
      checks: [{ id: "s2q", prompt: "Data: \\(1, 2, 3, 100\\). Median?",
        choices: ["\\(2\\)", "\\(2.5\\)", "\\(26.5\\)", "\\(3\\)"], answer: 1, explain: "Middle pair 2 and 3 → median \\(2.5\\)." }] }
  ];
  function boot() { if (window.initJmComics) window.initJmComics(COMICS); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
