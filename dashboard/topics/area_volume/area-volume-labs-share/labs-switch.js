(function () {
  "use strict";
  function initLabSwitch() {
    var recastShell = document.getElementById("recast-tool-shell");
    var dispShell = document.getElementById("disp-tool-shell");
    var chips = document.querySelectorAll("[data-tool-mode]");
    if (!recastShell || !dispShell || !chips.length) return;

    function setMode(mode) {
      var isRecast = mode === "recast";
      var isDisp = mode === "displace";
      recastShell.classList.toggle("hidden", !isRecast);
      dispShell.classList.toggle("hidden", !isDisp);
      chips.forEach(function (c) {
        c.classList.toggle("active", c.dataset.toolMode === mode);
      });
    }

    chips.forEach(function (b) {
      b.addEventListener("click", function () { setMode(b.dataset.toolMode); });
    });
    setMode("recast");
  }

  document.addEventListener("DOMContentLoaded", initLabSwitch);
})();
