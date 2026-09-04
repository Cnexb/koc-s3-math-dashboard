# -*- coding: utf-8 -*-
"""Build S2 course level (JM11–JM23): topic placeholders + JM wrapper pages + s2.html hub."""
from __future__ import annotations

from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent
TOPICS = ROOT / "dashboard" / "topics"
DASH = ROOT / "dashboard"

V = "20260827-s2"

# Titles use HK/UK-friendly wording; folder names use US snake_case (repo convention).
# JM20: user "Therom" -> Pythagoras' Theorem (UK/HK); US schools often say Pythagorean Theorem.
S2_LESSONS = [
    {
        "lesson": "11",
        "jm": "JM11",
        "title": "Errors",
        "lead": "Rounding, significant figures, and bounds — estimate sensibly and spot when an answer is over-precise.",
        "src": "s2_errors",
        "dest": "jm11_errors",
        "cover": r"\pm 1",
        "css": "errors",
    },
    {
        "lesson": "12",
        "jm": "JM12",
        "title": "Identities and Factorization",
        "lead": "Expand and factorise using identities such as perfect squares and difference of squares.",
        "src": "s2_identities_factorization",
        "dest": "jm12_identities_factorization",
        "cover": r"(a+b)^2",
        "css": "polynomials",
    },
    {
        "lesson": "13",
        "jm": "JM13",
        "title": "Algebraic Functions and Formulae",
        "lead": "Substitute into formulae, rearrange a subject, and interpret function notation in context.",
        "src": "s2_algebraic_functions",
        "dest": "jm13_algebraic_functions",
        "cover": r"f(x)",
        "css": "algebra",
    },
    {
        "lesson": "14",
        "jm": "JM14",
        "title": "Angles Related to Figures",
        "lead": "Angle sums in triangles and polygons, parallel-line pairs, and exterior-angle results.",
        "src": "s2_angles_figures",
        "dest": "jm14_angles_figures",
        "cover": r"\angle ABC",
        "css": "triangle",
    },
    {
        "lesson": "15",
        "jm": "JM15",
        "title": "Congruence",
        "lead": "Match equal sides and angles, use congruence tests, and prove triangles are congruent.",
        "src": "s2_congruence",
        "dest": "jm15_congruence",
        "cover": r"\cong",
        "css": "triangle",
    },
    {
        "lesson": "16",
        "jm": "JM16",
        "title": "Rate, Ratio and Proportion",
        "lead": "Scale quantities with a common ratio, compare rates, and solve direct proportion problems.",
        "src": "s2_rate_ratio_proportion",
        "dest": "jm16_rate_ratio_proportion",
        "cover": r"a:b",
        "css": "percentage",
    },
    {
        "lesson": "17",
        "jm": "JM17",
        "title": "Similarity",
        "lead": "Similar figures, scale factor k, and how lengths, areas and volumes scale with k.",
        "src": "s2_similarity",
        "dest": "jm17_similarity",
        "cover": r"k",
        "css": "area-volume",
    },
    {
        "lesson": "18",
        "jm": "JM18",
        "title": "Statistics II",
        "lead": "Frequency tables, charts, and averages — read and compare data sets clearly.",
        "src": "s2_statistics_ii",
        "dest": "jm18_statistics_ii",
        "cover": r"\bar{x}",
        "css": "statistics",
    },
    {
        "lesson": "19",
        "jm": "JM19",
        "title": "Simultaneous Equations",
        "lead": "Solve pairs of linear equations by substitution or elimination, with graphical meaning.",
        "src": "s2_simultaneous_equations",
        "dest": "jm19_simultaneous_equations",
        "cover": r"x+y=5",
        "css": "algebra",
    },
    {
        "lesson": "20",
        "jm": "JM20",
        "title": "Pythagoras' Theorem",
        "lead": "Right-angled triangles: find a missing side and check whether a triangle is right-angled.",
        "src": "s2_pythagoras_theorem",
        "dest": "jm20_pythagoras_theorem",
        "cover": r"a^2+b^2=c^2",
        "css": "triangle",
    },
    {
        "lesson": "21",
        "jm": "JM21",
        "title": "Deductive Geometry",
        "lead": "Follow a logical chain of reasons — angles, parallel lines, and triangle properties.",
        "src": "s2_deductive_geometry",
        "dest": "jm21_deductive_geometry",
        "cover": r"\therefore",
        "css": "quadrilateral",
    },
    {
        "lesson": "22",
        "jm": "JM22",
        "title": "Trigonometric Ratios",
        "lead": "Sine, cosine and tangent in right-angled triangles — set up and solve ratio equations.",
        "src": "s2_trigonometric_ratios",
        "dest": "jm22_trigonometric_ratios",
        "cover": r"\sin\theta",
        "css": "trigonometry",
    },
    {
        "lesson": "23",
        "jm": "JM23",
        "title": "Areas and Volumes II",
        "lead": "Circles and cylinders: circumference, sector area, volume and total surface area — with step-by-step reasoning.",
        "src": "s2_areas_volumes_ii",
        "dest": "jm23_areas_volumes_ii",
        "cover": r"V=Ah",
        "css": "area-volume",
    },
]

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

JM_TOOLS_CSS = """
<style id="jm-tools-only-css">
html.jm-tools-only body > header,
html.jm-tools-only body > .tab-row,
html.jm-tools-only body > nav,
html.jm-tools-only body > .tabs,
html.jm-tools-only body > section:not(#panel-tools) {
  display: none !important;
}
html.jm-tools-only #panel-tools,
html.jm-tools-only #panel-tools.hidden {
  display: block !important;
  visibility: visible !important;
  padding: 8px 12px 20px !important;
  max-width: none !important;
}
html.jm-tools-only body {
  margin: 0 !important;
  min-height: 0 !important;
  background: #ffffff !important;
  overflow-x: hidden !important;
  overflow-y: auto !important;
}
</style>
"""


def html_text(s: str) -> str:
    return s.replace("&", "&amp;").replace("—", "&mdash;")


def write_source_topic(cfg: dict) -> Path:
    src_dir = TOPICS / cfg["src"]
    src_dir.mkdir(parents=True, exist_ok=True)
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
{JM_TOOLS_BOOT.strip()}
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{cfg['title']} &mdash; {cfg['jm']}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
  <link rel="stylesheet" href="../../shared/jm-lesson.css?v={V}">
{JM_TOOLS_CSS.strip()}
  <style>
    body {{
      margin: 0; min-height: 100vh; color: var(--text);
      font-family: "Hanken Grotesk", system-ui, sans-serif;
      background: linear-gradient(180deg, #f8fafc, #f1f5f9); caret-color: transparent;
    }}
    h1 {{ margin: 0 0 8px; font-size: clamp(26px, 4vw, 36px); }}
    .lead {{ margin: 0 0 18px; color: var(--muted); font-size: 15px; line-height: 1.55; }}
    .jm-page {{ width: min(1100px, 100%); margin: 0 auto; padding: 28px 22px 80px; }}
    .placeholder-tools {{
      padding: 28px 22px; border: 1px dashed var(--line); border-radius: 14px;
      background: var(--surface); text-align: center; color: var(--muted);
      font-size: 15px; line-height: 1.55;
    }}
    .placeholder-tools strong {{ color: var(--text); }}
  </style>
</head>
<body>
  <main class="jm-page">
    <a class="jm-back" href="../../s2.html#lessons">&larr; S2 Lessons</a>
    <p class="jm-eyebrow">{cfg['jm']} · Lesson {cfg['lesson']}</p>
    <h1>{cfg['title']}</h1>
    <p class="lead">{html_text(cfg['lead'])}</p>
    <nav class="jm-tabs" aria-label="Lesson sections">
      <button class="jm-tab active" type="button" data-tab="tools">Interactive Tools</button>
      <button class="jm-tab" type="button" data-tab="comics">Comics</button>
    </nav>
    <section id="panel-tools" class="jm-panel">
      <p class="part-title">Lab · Interactive tools</p>
      <div class="placeholder-tools">
        <strong>Interactive tools for this topic are coming soon.</strong><br>
        The lesson shell is ready — activities will appear here in a later update.
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
    }});
  </script>
</body>
</html>
"""
    out = src_dir / "index.html"
    out.write_text(html, encoding="utf-8")
    return out


def write_jm_wrapper(cfg: dict) -> Path:
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
      display: block; width: 100%; min-height: 420px; height: 420px;
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
    <a class="jm-back" href="../../s2.html#lessons">&larr; S2 Lessons</a>
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
        var h = Math.max(320, Math.min(2400, Number(e.data.height) || 0));
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


def lesson_cards_html() -> str:
    cards = []
    for cfg in S2_LESSONS:
        cover = cfg["cover"]
        cards.append(f"""
        <a class="card lesson {cfg['css']}" href="topics/{cfg['dest']}/index.html">
          <div class="cover">\\( {cover} \\)</div>
          <div class="body">
            <h2>{cfg['title']}</h2>
            <p>{cfg['jm']} · Lesson {cfg['lesson']}</p>
            <span class="tag">{cfg['jm']}</span>
          </div>
        </a>""")
    return "\n".join(cards)


def write_s2_hub() -> Path:
    s3 = (DASH / "s3.html").read_text(encoding="utf-8")
    # Extract shared styles block from s3.html (lines 11-279 approx)
    style_match = re.search(r"(<style>.*?</style>)", s3, re.DOTALL)
    if not style_match:
        raise SystemExit("Could not extract styles from s3.html")
    styles = style_match.group(1)
    # Add S2 mark colour
    styles = styles.replace(
        ".s3-mark {",
        ".s2-mark {\n      color: #0f766e;\n      font-size: 34px;\n      font-weight: 700;\n    }\n\n    .s3-mark {",
    )
    styles = styles.replace(
        ".lesson.indices .cover {",
        ".lesson.errors .cover {\n      color: #b45309;\n      background:\n        radial-gradient(circle at 35% 45%, rgba(251, 191, 36, .35), transparent 50%),\n        linear-gradient(135deg, #fef3c7, #fde68a);\n    }\n\n    .lesson.algebra .cover {\n      color: #7c3aed;\n      background:\n        radial-gradient(circle at 65% 40%, rgba(196, 181, 253, .4), transparent 50%),\n        linear-gradient(135deg, #ede9fe, #ddd6fe);\n    }\n\n    .lesson.indices .cover {",
    )

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>S2 Mathematics</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
  {styles}
</head>
<body>
  <main class="page">
    <section class="view active" id="home">
      <p class="eyebrow">Mathematics Gallery</p>
      <h1>Course Levels</h1>
      <p class="intro">Choose a level to view its lessons.</p>
      <div class="grid">
        <button class="card" type="button" data-go="lessons">
          <div class="cover"><span class="s2-mark">S2</span></div>
          <div class="body">
            <h2>S2</h2>
            <p>JM11–JM23 · S2 topics</p>
            <span class="tag">JM11–JM23</span>
          </div>
        </button>
        <a class="card" href="s3.html#lessons">
          <div class="cover"><span class="s3-mark">S3</span></div>
          <div class="body">
            <h2>S3</h2>
            <p>JM24–JM35 · S3 topics</p>
            <span class="tag">JM24–JM35</span>
          </div>
        </a>
      </div>
    </section>
    <section class="view" id="lessons">
      <button class="back" type="button" data-go="home">&larr; All levels</button>
      <p class="eyebrow">S2 Mathematics</p>
      <h1>S2 Lessons</h1>
      <div class="grid">
{lesson_cards_html()}
      </div>
    </section>
  </main>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"
    onload="renderMathInElement(document.body, {{
      delimiters: [
        {{ left: '\\\\(', right: '\\\\)', display: false }},
        {{ left: '\\\\[', right: '\\\\]', display: true }}
      ]
    }});"></script>
  <script>
    const views = document.querySelectorAll(".view");
    function show(id) {{
      views.forEach((v) => v.classList.toggle("active", v.id === id));
      const titles = {{ home: "S2 Mathematics", lessons: "S2 Lessons" }};
      document.title = titles[id] || "S2 Mathematics";
    }}
    document.querySelectorAll("[data-go]").forEach((el) => {{
      el.addEventListener("click", () => show(el.dataset.go));
    }});
    if (location.hash === "#lessons") show("lessons");
  </script>
  <script defer src="shared/suppress-ui-caret.js?v=20260827-legend"></script>
</body>
</html>
"""
    out = DASH / "s2.html"
    out.write_text(html, encoding="utf-8")
    return out


def patch_s3_home() -> None:
    s3_path = DASH / "s3.html"
    text = s3_path.read_text(encoding="utf-8")
    if 'href="s2.html#lessons"' in text:
        print("s3.html home already has S2 card")
        return
    old = """      <div class="grid">
        <button class="card" type="button" data-go="lessons">
          <div class="cover"><span class="s3-mark">S3</span></div>
          <div class="body">
            <h2>S3</h2>
            <p>JM24–JM35 · S3 topics</p>
            <span class="tag">JM24–JM35</span>
          </div>
        </button>
      </div>"""
    new = """      <div class="grid">
        <a class="card" href="s2.html#lessons">
          <div class="cover"><span class="s2-mark">S2</span></div>
          <div class="body">
            <h2>S2</h2>
            <p>JM11–JM23 · S2 topics</p>
            <span class="tag">JM11–JM23</span>
          </div>
        </a>
        <button class="card" type="button" data-go="lessons">
          <div class="cover"><span class="s3-mark">S3</span></div>
          <div class="body">
            <h2>S3</h2>
            <p>JM24–JM35 · S3 topics</p>
            <span class="tag">JM24–JM35</span>
          </div>
        </button>
      </div>"""
    if old not in text:
        raise SystemExit("Could not patch s3.html home grid")
    text = text.replace(old, new, 1)
    if ".s2-mark" not in text:
        text = text.replace(
            ".s3-mark {",
            ".s2-mark {\n      color: #0f766e;\n      font-size: 34px;\n      font-weight: 700;\n    }\n\n    .s3-mark {",
        )
        text = text.replace(
            ".lesson.indices .cover {",
            ".lesson.errors .cover {\n      color: #b45309;\n      background:\n        radial-gradient(circle at 35% 45%, rgba(251, 191, 36, .35), transparent 50%),\n        linear-gradient(135deg, #fef3c7, #fde68a);\n    }\n\n    .lesson.algebra .cover {\n      color: #7c3aed;\n      background:\n        radial-gradient(circle at 65% 40%, rgba(196, 181, 253, .4), transparent 50%),\n        linear-gradient(135deg, #ede9fe, #ddd6fe);\n    }\n\n    .lesson.indices .cover {",
        )
    s3_path.write_text(text, encoding="utf-8")
    print("Patched s3.html home with S2 card")


def write_s2_redirect() -> None:
    redirect_dir = DASH / "s2"
    redirect_dir.mkdir(parents=True, exist_ok=True)
    html = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0; url=../s2.html#lessons">
  <title>S2 Mathematics</title>
  <script>location.replace("../s2.html#lessons");</script>
</head>
<body>
  <p><a href="../s2.html#lessons">Continue to S2 Lessons</a></p>
</body>
</html>
"""
    (redirect_dir / "index.html").write_text(html, encoding="utf-8")


def patch_serve_json() -> None:
    path = ROOT / "serve.json"
    text = path.read_text(encoding="utf-8")
    if "/dashboard/s2" in text:
        return
    insert = (
        '    { "source": "/dashboard/s2", "destination": "/dashboard/s2.html#lessons", "type": 302 },\n'
        '    { "source": "/dashboard/s2/", "destination": "/dashboard/s2.html#lessons", "type": 302 },\n'
    )
    text = text.replace('  "redirects": [\n', '  "redirects": [\n' + insert)
    path.write_text(text, encoding="utf-8")
    print("Patched serve.json")


def main() -> None:
    for cfg in S2_LESSONS:
        src = write_source_topic(cfg)
        dest = write_jm_wrapper(cfg)
        print(f"{cfg['jm']}: {src.relative_to(ROOT)} + {dest.relative_to(ROOT)}")
    write_s2_hub()
    print(f"Wrote {DASH / 's2.html'}")
    write_s2_redirect()
    patch_s3_home()
    patch_serve_json()
    print("Done.")


if __name__ == "__main__":
    main()
