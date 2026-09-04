#!/usr/bin/env python3
"""Align legacy topic inline colors with JM29 palette."""

from __future__ import annotations

import re
import sys
from pathlib import Path

JM29_ROOT = """    :root {
      --surface: #ffffff;
      --surface-2: #eef2f7;
      --text: #1e293b;
      --muted: #64748b;
      --line: rgba(30, 41, 59, 0.12);
      --accent: #0284c7;
      --glow: #0369a1;
      --bg: #f1f5f9;
      --panel: var(--surface);
      --panel2: var(--surface-2);
      --ink: var(--text);
      --dim: var(--muted);
      --a: var(--accent);"""

JM29_BODY = """    body { margin: 0; min-height: 100vh; color: var(--text);
      font-family: "Hanken Grotesk", system-ui, sans-serif;
      background:
        radial-gradient(ellipse 80% 50% at 10% 0%, rgba(14,165,233,.12), transparent 55%),
        radial-gradient(ellipse 70% 45% at 92% 8%, rgba(56,189,248,.1), transparent 50%),
        linear-gradient(180deg,#f8fafc,#f1f5f9);
      background-attachment: fixed; }"""

CHIP_ACTIVE = ".chip.active { color: #fff; background: var(--accent); border-color: var(--accent); }"

TOPICS = [
    "inequality",
    "percentage",
    "probability",
    "area_volume",
    "factorization",
    "factorization_polynomials",
    "law_of_indices",
]

ROOT_PAT = re.compile(
    r"    :root \{[^}]+\}",
    re.DOTALL,
)

BODY_PAT = re.compile(
    r"    body \{ background: var\(--bg\); color: var\(--ink\);\s*"
    r'font-family: "Hanken Grotesk", system-ui, sans-serif; \}',
    re.DOTALL,
)

CHIP_PATS = [
    re.compile(r"\.chip\.active \{ color: #06283d; background: var\(--a\); border-color: var\(--a\); \}"),
    re.compile(r"\.chip\.active \{ color: #06283d; background: var\(--a-fill\); border-color: var\(--a-fill\); \}"),
]

LAW_INDICES_ACCENT = re.compile(
    r"--accent: #3d7ea6;\s*--glow: #3d7ea6;",
)


def extra_root_lines(topic: str) -> str:
    if topic == "inequality":
        return "\n      --ab: #66BB6A;\n      --gt: #66BB6A; --ge: #AB47BC; --lt: #FFD54F; --le: #0ea5e9; --red: #EF5350;"
    if topic == "percentage":
        return "\n      --old: #38bdf8; --new: #FFD54F; --factor: #CE93D8; --up: #66BB6A; --down: #F06292;"
    if topic == "probability":
        return "\n      --fav: #FFD54F; --tot: #66BB6A; --red: #f06292;"
    if topic == "area_volume":
        return "\n      --b: #FFD54F; --ab: #81C784; --down: #F06292;"
    if topic in ("factorization", "factorization_polynomials"):
        return (
            "\n      --b: #9A7209; --ab: #2E7D32;"
            "\n      --a-fill: #38bdf8; --b-fill: #FFB74D; --ab-fill: #81C784;"
        )
    return ""


def migrate(path: Path) -> bool:
    topic = path.parent.name
    html = path.read_text(encoding="utf-8")
    original = html

    if topic == "law_of_indices":
        html = LAW_INDICES_ACCENT.sub("--accent: #0284c7;\n      --glow: #0369a1;", html)
        html = BODY_PAT.sub(JM29_BODY, html) if BODY_PAT.search(html) else html
        if ":root {" in html and "--surface:" not in html:
            html = html.replace(
                "    :root {\n      --surface: #ffffff;",
                "    :root {\n      --surface: #ffffff;",
            )
    elif ROOT_PAT.search(html):
        block = JM29_ROOT + extra_root_lines(topic) + "\n    }"
        html = ROOT_PAT.sub(block, html, count=1)
        html = BODY_PAT.sub(JM29_BODY, html)
        for pat in CHIP_PATS:
            html = pat.sub(CHIP_ACTIVE, html)

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
        for topic in TOPICS:
            path = root / topic / "index.html"
            if path.is_file() and migrate(path):
                print(f"updated {path}")
                changed += 1
    print(f"done — {changed} file(s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
