#!/usr/bin/env python3
"""Unify topic control panels to JM28 format while preserving content."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent / "dashboard"
TOPICS = ROOT / "topics"
SHARED = ROOT / "shared"
CSS_LINK = '<link rel="stylesheet" href="../../shared/jm28-panel.css?v=20260904-jm28">'
CSS_VER = "20260904-jm28"


def insert_css_link(html: str) -> str:
    if "jm28-panel.css" in html:
        html = re.sub(
            r'href="../../shared/jm28-panel\.css\?v=[^"]+"',
            f'href="../../shared/jm28-panel.css?v={CSS_VER}"',
            html,
        )
        return html
    for anchor in (
        '<link rel="stylesheet" href="../../shared/jm-lesson.css',
        '<link rel="stylesheet" href="../../shared/paper-labs.css',
        '<link rel="stylesheet" href="../../shared/topic-chrome.css',
    ):
        idx = html.find(anchor)
        if idx != -1:
            line_end = html.find("\n", idx)
            return html[: line_end + 1] + f"  {CSS_LINK}\n" + html[line_end + 1 :]
    head_end = html.lower().find("</head>")
    if head_end == -1:
        return html
    return html[:head_end] + f"  {CSS_LINK}\n" + html[head_end:]


def clean_panel_classes(html: str) -> str:
    def repl(m: re.Match[str]) -> str:
        classes = m.group(1).split()
        classes = [c for c in classes if c not in ("panel", "mode-panel", "active")]
        if "jm-panel" not in classes:
            classes.insert(0, "jm-panel")
        return f'class="{" ".join(classes)}"'

    return re.sub(r'class="([^"]*jm-panel[^"]*)"', repl, html)


def wrap_deck_panel(section_html: str, panel_id: str) -> str:
    if "jm-deck-panel" in section_html or "class=\"block\"" in section_html.split(">", 1)[0]:
        # already has block at top level
        first_block = re.search(
            rf'<section[^>]*id="{panel_id}"[^>]*>\s*<section class="block"',
            section_html,
            re.S,
        )
        if first_block:
            return section_html

    if ".deck-wrap" not in section_html and "deck-wrap" not in section_html:
        return section_html

    if re.search(rf'id="{panel_id}"[^>]*>[\s\n]*<section class="block jm-deck-panel"', section_html):
        return section_html

    inner_match = re.match(
        rf'(<section[^>]*id="{panel_id}"[^>]*>)([\s\S]*)(</section>)',
        section_html,
        re.M,
    )
    if not inner_match:
        return section_html

    open_tag, inner, close_tag = inner_match.groups()
    inner_stripped = inner.strip()
    if inner_stripped.startswith('<section class="block'):
        return section_html

    wrapped = f'{open_tag}\n      <section class="block jm-deck-panel">\n{inner}\n      </section>\n    {close_tag}'
    return wrapped


def process_panel_sections(html: str) -> str:
    for panel_id in ("panel-slides", "panel-concept"):
        pattern = rf'<section[^>]*id="{panel_id}"[^>]*>[\s\S]*?</section>'
        for match in list(re.finditer(pattern, html)):
            original = match.group(0)
            updated = wrap_deck_panel(original, panel_id)
            if updated != original:
                html = html.replace(original, updated, 1)
    return html


def ensure_jm_tabs_script(html: str) -> str:
    if "initJmTabs" in html or "initTabs()" in html or "inequality-tools.js" in html:
        return html
    if "jm-tabs.js" in html:
        return html
    if 'class="jm-tabs"' not in html and "jm-tabs" not in html:
        return html
    snippet = (
        '  <script defer src="../../shared/jm-tabs.js?v=20260904-jm28"></script>\n'
        "  <script>\n"
        "    document.addEventListener('DOMContentLoaded', function () {\n"
        "      if (window.initJmTabs) window.initJmTabs();\n"
        "    });\n"
        "  </script>\n"
    )
    marker = '<script src="../../shared/suppress-ui-caret.js'
    if marker in html:
        return html.replace(marker, snippet + "  " + marker, 1)
    return html.replace("</body>", snippet + "</body>", 1)


def fix_eyebrow(html: str) -> str:
    html = re.sub(
        r'(<p class="jm-eyebrow">[^<]*?)·([^<]*?</p>)',
        r'\1&middot;\2',
        html,
    )
    html = re.sub(
        r'(<p class="jm-eyebrow">[^<]*?)\?([^<]*?</p>)',
        lambda m: m.group(0).replace("?", "&middot;", 1) if "LESSON" in m.group(0).upper() else m.group(0),
        html,
    )
    return html


def process_file(path: Path) -> bool:
    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        text = path.read_text(encoding="utf-8", errors="replace")

    if "jm-page" not in text and 'class="jm-page"' not in text:
        return False
    if len(text) > 500_000 and "&larr; &&larr;" in text[:500]:
        print(f"  skip corrupted: {path.relative_to(ROOT)}")
        return False

    original = text
    text = insert_css_link(text)
    text = clean_panel_classes(text)
    text = process_panel_sections(text)
    text = fix_eyebrow(text)
    text = ensure_jm_tabs_script(text)

    if text != original:
        path.write_text(text, encoding="utf-8", newline="\n")
        return True
    return False


def patch_shared_files() -> None:
    deck = SHARED / "deck-touch-nav.js"
    if deck.exists():
        t = deck.read_text(encoding="utf-8")
        t2 = t.replace(
            'document.getElementById("panel-slides")',
            'document.getElementById("panel-concept") || document.getElementById("panel-slides")',
        )
        t2 = t2.replace(
            '#panel-slides .deck-wrap',
            '#panel-concept .deck-wrap, #panel-slides .deck-wrap',
        )
        if t2 != t:
            deck.write_text(t2, encoding="utf-8", newline="\n")
            print("  updated deck-touch-nav.js")

    shell = SHARED / "topic-shell.css"
    if shell.exists():
        t = shell.read_text(encoding="utf-8")
        if "#panel-concept .deck-wrap" not in t:
            t = t.replace("#panel-slides .subnav", "#panel-concept .subnav,\n#panel-slides .subnav")
            t = t.replace("#panel-slides .deck-wrap", "#panel-concept .deck-wrap,\n#panel-slides .deck-wrap")
            t = t.replace("#panel-slides .deck-wrap iframe", "#panel-concept .deck-wrap iframe,\n#panel-slides .deck-wrap iframe")
            t = t.replace("#panel-slides .hint", "#panel-concept .hint,\n#panel-slides .hint")
            t = t.replace("#panel-game >", "#panel-games >,\n#panel-game >")
            shell.write_text(t, encoding="utf-8", newline="\n")
            print("  updated topic-shell.css")


def main() -> None:
    changed = []
    for path in sorted(TOPICS.glob("*/index.html")):
        if process_file(path):
            changed.append(path.relative_to(ROOT))

    patch_shared_files()

    css_dst = Path(r"C:\Users\user\Downloads\s3-maths-web\shared\jm28-panel.css")
    if css_dst.parent.exists():
        css_dst.write_text((SHARED / "jm28-panel.css").read_text(encoding="utf-8"), encoding="utf-8", newline="\n")

    print(f"Updated {len(changed)} topic pages:")
    for p in changed:
        print(f"  - {p}")


if __name__ == "__main__":
    main()
