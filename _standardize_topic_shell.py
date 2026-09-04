#!/usr/bin/env python3
"""Migrate legacy topic index.html shells to JM29 (Quadrilaterals) chrome."""

from __future__ import annotations

import re
import sys
from pathlib import Path

JM_LESSON = '<link rel="stylesheet" href="../../shared/jm-lesson.css?v=20260904-jm29">'
PAPER_LABS = '<link rel="stylesheet" href="../../shared/paper-labs.css?v=20260904-jm29">'

# (relative path from topics root, eyebrow, title, lead)
TOPIC_META: dict[str, tuple[str, str, str]] = {
    "factorization": (
        "JM25 · Lesson 25",
        "More about Factorization and Polynomials",
        "Interactive tools and comics for factorization and polynomials.",
    ),
    "inequality": (
        "JM26 · Lesson 26",
        "Inequalities I",
        "Classroom manga, quiz, Boundary Runner, and inequality labs.",
    ),
    "percentage": (
        "JM27 · Lesson 27",
        "Percentages II",
        "Change factor, interest, and tax: explorer, RPG games, comics, and quiz.",
    ),
    "probability": (
        "JM30 · Lesson 30",
        "Probabilities",
        "Formula, tree diagrams, and tabulation: tools, games, comics, and quiz.",
    ),
    "area_volume": (
        "JM32 · Lesson 32",
        "Areas and Volumes III",
        "Sectors, cylinders, cones, and spheres: tools, builder game, comics, and quiz.",
    ),
    "law_of_indices": (
        "JM24 · Lesson 24",
        "Law of Indices",
        "Powers, scientific notation, binary, comics, and quiz.",
    ),
    "factorization_polynomials": (
        "JM25 · Lesson 25",
        "More about Factorization and Polynomials",
        "Interactive tools and comics for factorization and polynomials.",
    ),
}


def ensure_stylesheet(html: str, href_fragment: str, tag: str) -> str:
    if href_fragment in html:
        return html
    insert_after = re.search(
        r'<link rel="stylesheet" href="../../shared/topic-chrome\.css[^"]*">',
        html,
    )
    if not insert_after:
        insert_after = re.search(r"</head>", html)
        if not insert_after:
            return html
        pos = insert_after.start()
        return html[:pos] + f"  {tag}\n" + html[pos:]
    pos = insert_after.end()
    return html[:pos] + f"\n  {tag}" + html[pos:]


def strip_jm12_chrome(html: str) -> str:
    html = re.sub(
        r'\s*<link rel="stylesheet" href="../../shared/jm12-chrome\.css[^"]*">\n?',
        "\n",
        html,
    )
    return html


def convert_tab_classes(html: str) -> str:
    html = re.sub(r'<nav class="tabs"', '<nav class="jm-tabs" aria-label="Lesson sections"', html)
    html = re.sub(r'<nav class="main-tabs"', '<nav class="jm-tabs" aria-label="Lesson sections"', html)
    html = re.sub(
        r'<button class="tab active"',
        '<button class="jm-tab active" type="button"',
        html,
    )
    html = re.sub(
        r'<button class="tab"',
        '<button class="jm-tab" type="button"',
        html,
    )
    html = re.sub(
        r'<button class="main-tab is-active"',
        '<button class="jm-tab active" type="button"',
        html,
    )
    html = re.sub(
        r'<button class="main-tab"',
        '<button class="jm-tab" type="button"',
        html,
    )
    return html


def convert_panels(html: str) -> str:
    html = re.sub(
        r'(<section id="panel-[^"]+" class=")panel(\s|")',
        r"\1jm-panel panel\2",
        html,
    )
    html = re.sub(
        r'(<section id="panel-[^"]+" class=")mode-panel(\s|")',
        r"\1jm-panel mode-panel\2",
        html,
    )
    html = re.sub(
        r'(<section id="panel-[^"]+" class=")view is-active(">)',
        r'\1jm-panel active"\2',
        html,
    )
    html = re.sub(
        r'(<section id="panel-[^"]+" class=")view(">)',
        r'\1jm-panel hidden"\2',
        html,
    )
    html = re.sub(r'class="jm-panel active""', 'class="jm-panel active"', html)
    html = re.sub(r'class="jm-panel hidden""', 'class="jm-panel hidden"', html)
    return html


def convert_page_shell(html: str) -> str:
    html = re.sub(r'<body class="jm12">', '<body class="paper-labs">', html)
    html = re.sub(r"<body>", '<body class="paper-labs">', html, count=1)
    html = re.sub(r'<main class="page">', '<main class="jm-page">', html)
    html = re.sub(r'href="../../index\.html#lessons"', 'href="../../index.html#lessons"', html)
    html = re.sub(r'class="back-link"', 'class="jm-back"', html)
    html = re.sub(r'class="back"', 'class="jm-back"', html)
    html = re.sub(r'class="eyebrow"', 'class="jm-eyebrow"', html)
    html = re.sub(r'class="lesson-kicker"', 'class="jm-eyebrow"', html)
    return html


def remove_uni_header(html: str, eyebrow: str, title: str, lead: str) -> str:
    """Remove Uni+ header and optional back-link wrapper; inject JM29 shell."""
    header_pat = re.compile(
        r"<header>.*?</header>\s*"
        r'(?:<div style="padding:[^"]*">\s*<a class="(?:back-link|jm-back|back)"[^>]*>.*?</a>\s*</div>\s*)?',
        re.DOTALL,
    )
    shell = f"""<main class="jm-page">
    <a class="jm-back" href="../../index.html#lessons">&larr; S3 Lessons</a>
    <p class="jm-eyebrow">{eyebrow}</p>
    <h1>{title}</h1>
    <p class="lead">{lead}</p>
"""
    if header_pat.search(html):
        html = header_pat.sub(shell, html, count=1)
    return html


def remove_factorization_header(html: str, eyebrow: str, title: str, lead: str) -> str:
    return remove_uni_header(html, eyebrow, title, lead)


def remove_tab_row_wrapper(html: str) -> str:
    html = re.sub(r'<div class="tab-row">\s*', "", html)
    html = re.sub(r"\s*</div>\s*(?=<!-- TAB|<section id=\"panel-|<nav class=\"jm-tabs\")", "\n", html, count=1)
    return html


def migrate_law_of_indices(html: str, eyebrow: str, title: str, lead: str) -> str:
    topbar_pat = re.compile(
        r"<header class=\"topbar\">.*?</header>\s*<main class=\"lesson-main\">",
        re.DOTALL,
    )
    shell = f"""<main class="jm-page">
    <a class="jm-back" href="../../index.html#lessons">&larr; S3 Lessons</a>
    <p class="jm-eyebrow">{eyebrow}</p>
    <h1>{title}</h1>
    <p class="lead">{lead}</p>
    <nav class="jm-tabs" aria-label="Lesson sections">
    <button class="jm-tab active" type="button" data-tab="concept">Concept &amp; Formula</button>
    <button class="jm-tab" type="button" data-tab="tools">Interactive Tool</button>
    <button class="jm-tab" type="button" data-tab="games">Games</button>
    <button class="jm-tab" type="button" data-tab="comics">Comics</button>
    <button class="jm-tab" type="button" data-tab="summary">Summary</button>
    <button class="jm-tab" type="button" data-tab="quiz">Quiz</button>
  </nav>
"""
    html = topbar_pat.sub(shell, html, count=1)
    html = html.replace("</main>\n</body>", "</main>\n</body>")
    html = convert_panels(html)
    html = html.replace(".main-tab", ".jm-tab")
    html = html.replace('"is-active"', '"active"')
    html = html.replace(
        """document.querySelectorAll(".view").forEach((panel) => {
        panel.classList.toggle("is-active", panel.id === "panel-" + name);
      });""",
        """document.querySelectorAll(".jm-panel").forEach((panel) => {
        panel.classList.toggle("hidden", panel.id !== "panel-" + name);
        panel.classList.toggle("active", panel.id === "panel-" + name);
      });""",
    )
    html = html.replace(
        'btn.classList.toggle("is-active", btn.dataset.tab === name);',
        'btn.classList.toggle("active", btn.dataset.tab === name);',
    )
    return html


def migrate_file(path: Path) -> bool:
    topic = path.parent.name
    if topic not in TOPIC_META:
        return False
    eyebrow, title, lead = TOPIC_META[topic]
    original = path.read_text(encoding="utf-8")
    html = original

    html = strip_jm12_chrome(html)
    html = ensure_stylesheet(html, "jm-lesson.css", JM_LESSON)
    html = ensure_stylesheet(html, "paper-labs.css", PAPER_LABS)

    if topic == "law_of_indices":
        if 'class="topbar"' in html:
            html = migrate_law_of_indices(html, eyebrow, title, lead)
        else:
            html = convert_page_shell(html)
            html = remove_tab_row_wrapper(html)
            html = convert_tab_classes(html)
            html = convert_panels(html)
    elif re.search(r"<header>", html):
        html = remove_uni_header(html, eyebrow, title, lead)
        html = remove_tab_row_wrapper(html)
        html = convert_page_shell(html)
        html = convert_tab_classes(html)
        html = convert_panels(html)
        if "</main>" not in html.split('<main class="jm-page">', 1)[-1][:4000]:
            html = html.replace("</body>", "  </main>\n</body>", 1)
    else:
        html = convert_page_shell(html)
        html = remove_tab_row_wrapper(html)
        html = convert_tab_classes(html)
        html = convert_panels(html)

    if html == original:
        return False
    path.write_text(html, encoding="utf-8")
    return True


def main() -> int:
    roots = [Path(p) for p in sys.argv[1:]] or [
        Path(__file__).resolve().parent / "dashboard" / "topics",
    ]
    changed = 0
    for root in roots:
        for topic in TOPIC_META:
            path = root / topic / "index.html"
            if path.is_file() and migrate_file(path):
                print(f"updated {path}")
                changed += 1
    print(f"done — {changed} file(s) updated")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
