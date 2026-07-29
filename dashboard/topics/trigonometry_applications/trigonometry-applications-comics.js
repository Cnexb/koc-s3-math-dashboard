(function () {
  "use strict";
  var COMICS = [
    { id: "ta1", title: "Sketch first", chapter: "Ch.1 · Page 1",
      text: "Always draw a **right triangle** and mark the angle of elevation or depression before choosing sin, cos or tan.",
      checks: [{ id: "ta1q", prompt: "You know adjacent distance and angle. Best ratio?",
        choices: ["\\(\\sin\\)", "\\(\\cos\\)", "\\(\\tan\\)", "None"], answer: 2, explain: "Tan uses opposite and adjacent." }] },
    { id: "ta2", title: "Depression equals elevation", chapter: "Ch.1 · Page 2",
      text: "The angle of depression from A to B equals the angle of elevation from B to A (**alternate angles**).",
      checks: [{ id: "ta2q", prompt: "\\(\\tan 30^\\circ\\) is about \\(0.577\\). Height if \\(d=10\\) m?",
        choices: ["\\(5.77\\) m", "\\(10\\) m", "\\(17.3\\) m", "\\(0.577\\) m"], answer: 0, explain: "\\(h = 10 \\times 0.577 \\approx 5.77\\) m." }] }
  ];
  function boot() { if (window.initJmComics) window.initJmComics(COMICS); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
