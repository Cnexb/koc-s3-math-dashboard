# -*- coding: utf-8 -*-
"""Build JM lesson wrapper pages (JM25-style iframe shell) for gallery tools."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent
TOPICS = ROOT / "dashboard" / "topics"

MAP = [
    {
        "src": "law_of_indices",
        "dest": "jm24_law_of_indices",
        "jm": "JM24",
        "lesson": "24",
        "title": "Law of Indices",
        "lead": "Interactive tools for powers and binary — prove the laws step by step.",
        "iframe_h": 920,
    },
    {
        "src": "factorization",
        "dest": "factorization_polynomials",
        "jm": "JM25",
        "lesson": "25",
        "title": "Factorization & Polynomials",
        "lead": "Area models for perfect squares and difference of squares, plus the cross method for factorising trinomials.",
        "iframe_h": 920,
    },
    {
        "src": "inequality",
        "dest": "jm26_inequalities",
        "jm": "JM26",
        "lesson": "26",
        "title": "Inequalities I",
        "lead": "Ascending practice: positive coefficients, then sign flips, then multi-step — Stage 3 asks you to enter the boundary of x as well as the sign and dot.",
        "iframe_h": 920,
    },
    {
        "src": "percentage",
        "dest": "jm27_percentages",
        "jm": "JM27",
        "lesson": "27",
        "title": "Percentages II",
        "lead": "Compare simple and compound interest with real dollar amounts — drag principal, rate and time, switch yearly/monthly compounding, and watch the stacks grow.",
        "iframe_h": 920,
    },
    {
        "src": "triangle_centres",
        "dest": "jm28_triangle_centres",
        "jm": "JM28",
        "lesson": "28",
        "title": "Special Line and Centres in Triangles",
        "lead": "Special lines & centres, angle pairs on parallel lines, then congruence and similarity — with standard geometry markings.",
        "iframe_h": 920,
    },
    {
        "src": "quadrilaterals",
        "dest": "jm29_quadrilaterals",
        "jm": "JM29",
        "lesson": "29",
        "title": "Quadrilaterals",
        "lead": "Drag freely to classify shapes, explore mid-pt. & intercept theorems, then tap a reason to see it in a figure.",
        "iframe_h": 920,
    },
    {
        "src": "probability",
        "dest": "jm30_probabilities",
        "jm": "JM30",
        "lesson": "30",
        "title": "Probabilities",
        "lead": "Explore probability with a 52-card deck and ball-drawing bags — formula, tree diagram and tabulation update together.",
        "iframe_h": 920,
    },
    {
        "src": "central_tendency",
        "dest": "jm31_central_tendency",
        "jm": "JM31",
        "lesson": "31",
        "title": "Measures of Central Tendencies",
        "lead": "Build a data set, compare mean, median and mode on the number line, explore frequency and weighted mean, then test which average fits each context.",
        "iframe_h": 920,
    },
    {
        "src": "area_volume",
        "dest": "jm32_areas_volumes",
        "jm": "JM32",
        "lesson": "32",
        "title": "Areas & Volumes III",
        "lead": "Similar shapes and solids: drag lengths to set the scale factor k, then step through area (k²) and volume (k³).",
        "iframe_h": 920,
    },
]

V = "20260821-displace9"


def html_text(s: str) -> str:
    return s.replace("&", "&amp;").replace("—", "&mdash;").replace("–", "&ndash;")


JM_TOOLS_CSS = """
/* JM S3 embed: show only Interactive Tools */
html.jm-tools-only body > header,
html.jm-tools-only body > .tab-row,
html.jm-tools-only body > nav,
html.jm-tools-only body > .tabs,
html.jm-tools-only body > section:not(#panel-tools) {
  display: none !important;
}
html.jm-tools-only .jm-back,
html.jm-tools-only .jm-eyebrow,
html.jm-tools-only main.jm-page > h1,
html.jm-tools-only main.jm-page > .lead,
html.jm-tools-only .jm-tabs,
html.jm-tools-only #panel-comics,
html.jm-tools-only main.page > .back,
html.jm-tools-only main.page > .eyebrow,
html.jm-tools-only main.page > h1,
html.jm-tools-only main.page > .lead,
html.jm-tools-only main.page > nav.tabs {
  display: none !important;
}
html.jm-tools-only #panel-tools,
html.jm-tools-only #panel-tools.hidden,
html.jm-tools-only #panel-tools.mode-panel,
html.jm-tools-only #panel-tools.jm-panel {
  display: block !important;
  visibility: visible !important;
  padding: 8px 12px 20px !important;
  max-width: none !important;
}
html.jm-tools-only main.jm-page,
html.jm-tools-only main.page {
  width: 100% !important;
  max-width: none !important;
  margin: 0 !important;
  padding: 0 !important;
}
html.jm-tools-only body {
  margin: 0 !important;
  min-height: 0 !important;
  background: #ffffff !important;
  overflow-x: hidden !important;
  overflow-y: auto !important;
  caret-color: transparent !important;
}
html.jm-tools-only input,
html.jm-tools-only textarea,
html.jm-tools-only select,
html.jm-tools-only [contenteditable="true"] {
  caret-color: auto !important;
}
html.jm-tools-only {
  background: #ffffff !important;
}
"""

JM_TOOLS_BOOT = """
<script>
(function () {
  if (!/[?&]jmTools=1(?:&|$)/.test(location.search || "")) return;
  document.documentElement.classList.add("jm-tools-only");
  function postH() {
    var h = Math.max(
      document.documentElement.scrollHeight || 0,
      document.body ? document.body.scrollHeight : 0,
      400
    );
    try { parent.postMessage({ type: "jm-tools-height", height: h }, "*"); } catch (e) {}
  }
  window.addEventListener("load", function () {
    postH();
    setTimeout(postH, 200);
    setTimeout(postH, 800);
    if (window.ResizeObserver) {
      new ResizeObserver(postH).observe(document.documentElement);
    }
  });
})();
</script>
"""


def needs_jm_tools_injection(src_index: Path) -> bool:
    text = src_index.read_text(encoding="utf-8")
    if 'id="jm-tools-only-css"' in text:
        return False
    if "jm-tools-only" in text and "__jmToolsPostHeight" in text:
        return False
    return True


def ensure_jm_tools_mode(src_index: Path) -> bool:
    if not needs_jm_tools_injection(src_index):
        return False
    text = src_index.read_text(encoding="utf-8")
    text2, n = re.subn(
        r"(<head[^>]*>)",
        r"\1\n" + JM_TOOLS_BOOT.strip(),
        text,
        count=1,
        flags=re.I,
    )
    if n != 1:
        raise SystemExit(f"Could not inject boot into {src_index}")
    css_block = '<style id="jm-tools-only-css">' + JM_TOOLS_CSS + "</style>\n"
    idx = text2.lower().rfind("</head>")
    if idx < 0:
        raise SystemExit(f"No </head> in {src_index}")
    text2 = text2[:idx] + css_block + text2[idx:]
    src_index.write_text(text2, encoding="utf-8")
    return True


def write_jm_page(cfg: dict) -> Path:
    dest_dir = TOPICS / cfg["dest"]
    dest_dir.mkdir(parents=True, exist_ok=True)
    src_rel = f"../{cfg['src']}/index.html?jmTools=1&v={V}"
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{cfg['title']} &mdash; {cfg['jm']}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
  <link rel="stylesheet" href="../../shared/jm-lesson.css?v={V}">
  <style>
    body {{
      margin: 0; min-height: 100vh; color: var(--text);
      font-family: "Hanken Grotesk", system-ui, sans-serif;
      background: linear-gradient(180deg, #f8fafc, #f1f5f9); caret-color: transparent;
    }}
    h1 {{ margin: 0 0 8px; font-size: clamp(26px, 4vw, 36px); }}
    .lead {{ margin: 0 0 18px; color: var(--muted); font-size: 15px; line-height: 1.55; }}
    .jm-page {{ width: min(1100px, 100%); }}
    .jm-tools-frame {{
      display: block; width: 100%; min-height: {cfg['iframe_h']}px; height: {cfg['iframe_h']}px;
      border: 0; border-radius: 16px; background: #fff;
    }}
    .jm-tools-shell {{
      margin: 0; padding: 0; overflow: hidden;
      border: 1px solid var(--line); border-radius: 16px; background: var(--surface);
    }}
  </style>
</head>
<body>
  <main class="jm-page">
    <a class="jm-back" href="../../s3.html#lessons">&larr; S3 Lessons</a>
    <p class="jm-eyebrow">{cfg['jm']} · Lesson {cfg['lesson']}</p>
    <h1>{cfg['title']}</h1>
    <p class="lead">{html_text(cfg['lead'])}</p>
    <nav class="jm-tabs" aria-label="Lesson sections">
      <button class="jm-tab active" type="button" data-tab="tools">Interactive Tools</button>
      <button class="jm-tab" type="button" data-tab="comics">Comics</button>
    </nav>
    <section id="panel-tools" class="jm-panel">
      <p class="part-title">Lab · Interactive tools</p>
      <div class="jm-tools-shell">
        <iframe id="jm-tools-frame" class="jm-tools-frame" title="{cfg['title']} interactive tools"
          src="{src_rel}" loading="eager"></iframe>
      </div>
    </section>
    <section id="panel-comics" class="jm-panel hidden">
      <section class="block">
        <h2>Comics</h2>
        <p class="hint">Comics for this topic are coming soon.</p>
      </section>
    </section>
  </main>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"></script>
  <script defer src="../../shared/jm-tabs.js?v={V}"></script>
  <script>
    document.addEventListener("DOMContentLoaded", function () {{
      if (window.initJmTabs) window.initJmTabs();
      var frame = document.getElementById("jm-tools-frame");
      window.addEventListener("message", function (e) {{
        if (!e.data || e.data.type !== "jm-tools-height" || !frame) return;
        var h = Math.max(420, Math.min(2400, Number(e.data.height) || 0));
        if (h) frame.style.height = h + "px";
      }});
    }});
  </script>
</body>
</html>
"""
    out = dest_dir / "index.html"
    out.write_text(html, encoding="utf-8")
    return out


def patch_s3() -> None:
    s3 = ROOT / "dashboard" / "s3.html"
    text = s3.read_text(encoding="utf-8")
    reps = [
        ('href="topics/law_of_indices/index.html"', 'href="topics/jm24_law_of_indices/index.html"'),
        ('href="topics/triangle_centres/index.html"', 'href="topics/jm28_triangle_centres/index.html"'),
        ('href="topics/quadrilaterals/index.html"', 'href="topics/jm29_quadrilaterals/index.html"'),
        ('href="topics/central_tendency/index.html"', 'href="topics/jm31_central_tendency/index.html"'),
    ]
    for a, b in reps:
        if a in text:
            text = text.replace(a, b, 1)
        else:
            print("WARN missing link:", a)
    s3.write_text(text, encoding="utf-8")
    print("Patched", s3)


def main():
    for cfg in MAP:
        src = TOPICS / cfg["src"] / "index.html"
        if not src.exists():
            raise SystemExit(f"Missing source {src}")
        changed = ensure_jm_tools_mode(src)
        out = write_jm_page(cfg)
        print(f"{cfg['jm']}: {'injected' if changed else 'skip inject'} {cfg['src']} -> {out.relative_to(ROOT)}")
    patch_s3()
    print("Done.")


if __name__ == "__main__":
    main()
