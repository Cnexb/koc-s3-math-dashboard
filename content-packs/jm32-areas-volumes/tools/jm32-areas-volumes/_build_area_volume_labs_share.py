"""Build a self-contained zip share package for Sphere recast (QB11) + Water displacement (Q21)."""
from __future__ import annotations

import re
import shutil
import zipfile
from pathlib import Path

DIR = Path(__file__).resolve().parent
REPO = DIR.parents[2]
SHARE = DIR / "area-volume-labs-share"
ZIP_PATH = DIR / "area-volume-labs-share.zip"

INDEX_HTML = DIR / "index.html"
SUPPRESS_JS = REPO / "dashboard" / "shared" / "suppress-ui-caret.js"

JS_FILES = (
    "area-volume-recast-lab.js",
    "area-volume-displace-lab.js",
)

SWITCH_JS = """\
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
"""

BAT = """@echo off
start "" "%~dp0index.html"
"""

README = """Area & Volume Labs — share package (QB11 + Q21)
====================================================

Included tools:
  • Sphere recast · QB11
  • Water displacement · Q21

Required files (keep together in one folder):
  index.html
  labs-switch.js
  suppress-ui-caret.js
  area-volume-recast-lab.js
  area-volume-displace-lab.js
  OPEN-LABS.bat

How to open:
  - Double-click OPEN-LABS.bat (Windows), or
  - Double-click index.html in Chrome / Edge / Firefox

Use the pill buttons at the top to switch between the two labs.

Internet connection required for:
  - KaTeX math rendering (cdn.jsdelivr.net)
  - Google Fonts (fonts.googleapis.com)

No web server is needed — opening the HTML file directly works.
UI clicks will not show a typing caret on buttons, labels, or diagrams.
"""


def extract_lab_css() -> str:
    text = INDEX_HTML.read_text(encoding="utf-8")
    m = re.search(r"/\* ── Sphere recast lab.*?@media \(prefers-reduced-motion", text, re.DOTALL)
    if not m:
        raise SystemExit("Could not extract lab CSS from index.html")
    block = m.group(0)
    # Include the reduced-motion media query through its closing brace
    rest = text[m.end() :]
    end = rest.find("    }\n\n    /* ───────────────── Builder")
    if end == -1:
        raise SystemExit("Could not find end of lab CSS block")
    return block + rest[: end + 6]


def build_html(lab_css: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Area &amp; Volume Labs · QB11 &amp; Q21</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" crossorigin="anonymous">
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js" crossorigin="anonymous"></script>
  <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
  <style>
    :root {{
      --bg: #fdfbf7; --panel: #ffffff; --panel2: #f5efe6; --ink: #2c2420; --dim: #5d544f;
      --a: #4FC3F7; --b: #FFD54F; --ab: #81C784; --line: rgba(0, 0, 0, 0.08);
    }}
    * {{ box-sizing: border-box; }}
    body {{
      margin: 0; background: var(--bg); color: var(--ink);
      font-family: "Hanken Grotesk", system-ui, sans-serif;
    }}
    header {{
      padding: 18px 24px; border-bottom: 1px solid var(--line);
      display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap;
    }}
    header h1 {{ font-size: 22px; margin: 0; font-weight: 700; }}
    header .crumb {{ color: var(--dim); font-size: 13px; }}
    main {{ padding: 20px 24px 32px; max-width: 1240px; margin: 0 auto; }}
    .subnav {{ display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; align-items: center; }}
    .chip {{
      background: var(--panel); border: 1px solid var(--line); color: var(--dim);
      font: inherit; font-weight: 600; padding: 8px 14px; border-radius: 999px; cursor: pointer;
      font-size: 14px; transition: all .15s;
      user-select: none; -webkit-user-select: none; caret-color: transparent;
    }}
    .chip:hover {{ color: var(--ink); }}
    .chip.active {{ color: #06283d; background: var(--a); border-color: var(--a); }}
    .control-card {{
      background: var(--panel); border: 1px solid var(--line); border-radius: 14px; padding: 18px;
    }}
    .control-card h3 {{ margin: 2px 0 14px; font-size: 15px; color: var(--dim); font-weight: 600;
      text-transform: uppercase; letter-spacing: .05em; }}
    .tool-instr {{ font-size: 14px; color: var(--dim); line-height: 1.5; margin: 0 0 14px; }}
    .tool-action {{ margin-top: 14px; width: 100%; background: var(--panel2); color: var(--ink); border: 1px solid var(--line);
      font: inherit; font-weight: 600; padding: 10px; border-radius: 9px; cursor: pointer;
      user-select: none; -webkit-user-select: none; caret-color: transparent; }}
    .tool-action:hover {{ border-color: var(--a); }}
    .tool-nav {{ display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 4px; }}
    .nav-btn {{ background: var(--panel2); border: 1px solid var(--line); color: var(--ink); font: inherit;
      font-weight: 600; padding: 8px 16px; border-radius: 9px; cursor: pointer;
      user-select: none; -webkit-user-select: none; caret-color: transparent; }}
    .nav-btn:hover:not(:disabled) {{ border-color: var(--a); }}
    .nav-btn:disabled {{ opacity: .4; cursor: default; }}
    .progress-label {{ color: var(--dim); font-size: 13px; font-weight: 700; user-select: none; }}
    button, .recast-step-link, .recast-choice, .recast-reveal-prompt, .recast-stage-btn {{
      user-select: none; -webkit-user-select: none; caret-color: transparent;
    }}
    .hidden {{ display: none !important; }}
{lab_css}
  </style>
</head>
<body>
  <header>
    <h1>Area &amp; Volume Labs</h1>
    <span class="crumb">JM32 &middot; QB11 &amp; Q21 &middot; Interactive teaching tools</span>
  </header>
  <main>
    <div class="subnav">
      <button class="chip active" type="button" data-tool-mode="recast">Sphere recast &middot; QB11</button>
      <button class="chip" type="button" data-tool-mode="displace">Water displacement &middot; Q21</button>
    </div>
    <div id="recast-tool-shell">
      <div class="recast-layout">
        <div class="recast-dashboard control-card">
          <h3>Sphere recasting</h3>
          <p class="tool-instr">Control the values and advance each teaching step here. The diagram responds on the right.</p>
          <div id="recast-vol-preview" class="recast-vol-preview" aria-live="polite"></div>
          <nav id="recast-step-list" class="recast-step-list" aria-label="Recasting steps"></nav>
          <div class="recast-note-viewport">
            <div id="recast-note" class="recast-note">
              <div id="recast-card"></div>
            </div>
          </div>
          <div class="tool-nav">
            <button id="recast-back" class="nav-btn" type="button">&lsaquo; Back</button>
            <span id="recast-progress" class="progress-label"></span>
            <button id="recast-next" class="nav-btn" type="button">Next &rsaquo;</button>
          </div>
          <button id="recast-reset" class="tool-action" type="button">Reset</button>
        </div>
        <div class="recast-stage">
          <svg id="recast-svg" viewBox="0 0 720 420" preserveAspectRatio="xMidYMid meet"
            role="img" aria-label="Animated sphere recasting diagram"></svg>
        </div>
      </div>
    </div>
    <div id="disp-tool-shell" class="hidden">
      <div class="recast-layout">
        <div class="recast-dashboard control-card">
          <h3>Water displacement</h3>
          <p class="tool-instr">The rise in water level matches the volume of the object put into the cup. Advance each teaching step here.</p>
          <div id="disp-vol-preview" class="recast-vol-preview" aria-live="polite"></div>
          <nav id="disp-step-list" class="recast-step-list" aria-label="Displacement steps"></nav>
          <div class="recast-note-viewport">
            <div id="disp-note" class="recast-note">
              <div id="disp-card"></div>
            </div>
          </div>
          <div class="tool-nav">
            <button id="disp-back" class="nav-btn" type="button">&lsaquo; Back</button>
            <span id="disp-progress" class="progress-label"></span>
            <button id="disp-next" class="nav-btn" type="button">Next &rsaquo;</button>
          </div>
          <button id="disp-reset" class="tool-action" type="button">Reset</button>
        </div>
        <div class="recast-stage" id="disp-stage">
          <svg id="disp-svg" viewBox="0 0 720 520" preserveAspectRatio="xMidYMid meet"
            role="img" aria-label="Animated water displacement diagram"></svg>
        </div>
      </div>
    </div>
  </main>
  <script>
    document.addEventListener("DOMContentLoaded", function () {{
      document.querySelectorAll("button").forEach(function (btn) {{
        btn.addEventListener("mousedown", function (e) {{
          if (e.button === 0) e.preventDefault();
        }});
      }});
    }});
  </script>
  <script defer src="suppress-ui-caret.js"></script>
  <script defer src="labs-switch.js"></script>
  <script defer src="area-volume-recast-lab.js"></script>
  <script defer src="area-volume-displace-lab.js"></script>
</body>
</html>
"""


def main() -> None:
    lab_css = extract_lab_css()
    if SHARE.exists():
        shutil.rmtree(SHARE)
    SHARE.mkdir()

    (SHARE / "index.html").write_text(build_html(lab_css), encoding="utf-8")
    (SHARE / "labs-switch.js").write_text(SWITCH_JS, encoding="utf-8")
    (SHARE / "OPEN-LABS.bat").write_text(BAT, encoding="utf-8")
    (SHARE / "README.txt").write_text(README, encoding="utf-8")

    if not SUPPRESS_JS.is_file():
        raise SystemExit(f"Missing {SUPPRESS_JS}")
    shutil.copy2(SUPPRESS_JS, SHARE / "suppress-ui-caret.js")

    for name in JS_FILES:
        src = DIR / name
        if not src.is_file():
            raise SystemExit(f"Missing {src}")
        shutil.copy2(src, SHARE / name)

    if ZIP_PATH.exists():
        ZIP_PATH.unlink()
    with zipfile.ZipFile(ZIP_PATH, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for path in sorted(SHARE.iterdir()):
            zf.write(path, arcname=f"area-volume-labs-share/{path.name}")

    print(f"Share folder: {SHARE}")
    print(f"Zip archive:  {ZIP_PATH}")


if __name__ == "__main__":
    main()
