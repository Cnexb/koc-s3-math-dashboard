#!/usr/bin/env python3
"""Fix UTF-8 corruption (??) in topic HTML using HTML entities."""

from __future__ import annotations

import re
import sys
from pathlib import Path


def fix_content(text: str) -> str:
    # Nav arrows (broken tag: ??/button> missing <)
    text = re.sub(
        r'(<button class="nav-btn prev"[^>]*>)??/button>',
        r"\1&larr;</button>",
        text,
    )
    text = re.sub(
        r'(<button class="nav-btn next"[^>]*>)??/button>',
        r"\1&rarr;</button>",
        text,
    )
    text = re.sub(
        r'(<button class="btn"[^>]*id="sci-shift-left"[^>]*>)??',
        r"\1&larr; ",
        text,
    )
    text = re.sub(
        r'(shift decimal right )??/button>',
        r"\1&rarr;</button>",
        text,
    )
    text = re.sub(
        r'(<button class="btn"[^>]*id="(?:iso|half|id|idtan|co-geo|co-sin|co-tan-geo|co-tan)-prev"[^>]*>)??',
        r"\1&larr; ",
        text,
    )
    text = re.sub(
        r'(<button class="btn primary"[^>]*id="(?:iso|half|id|idtan|co-geo|co-sin|co-tan-geo|co-tan)-next"[^>]*>)Next ??',
        r"\1Next &rarr;",
        text,
    )
    text = re.sub(
        r'(<button class="btn primary"[^>]*id="hand-next-q"[^>]*>)Next Question ??',
        r"\1Next Question &rarr;",
        text,
    )
    text = re.sub(
        r'(<button class="btn"[^>]*disabled>)??Back</button>',
        r"\1&larr; Back</button>",
        text,
    )

    # Eyebrow / titles
    text = re.sub(r"JM(\d+) \?Lesson", r"JM\1 &middot; Lesson", text)
    text = re.sub(r" \?\? ", " &middot; ", text)
    text = re.sub(r" \?\?([A-Z#])", r" &middot; \1", text)

    # Em / en dashes
    text = re.sub(r"§(\d+)\?\?(\d+)", r"§\1&ndash;\2", text)
    text = re.sub(r"Q(\d+)\?\?(\d+)", r"Q\1&ndash;\2", text)
    text = re.sub(r"L01\?\?2", "L01&ndash;02", text)
    text = re.sub(r" laws \?\?product", " laws &mdash; product", text)
    text = re.sub(r" \?\?when ", " &mdash; when ", text)
    text = re.sub(r" \?\?it ", " &mdash; it ", text)
    text = re.sub(r" \?\?impossible", " &mdash; impossible", text)
    text = re.sub(r" \?\?multiply ", " &mdash; multiply ", text)
    text = re.sub(r" \?\?the same ", " &mdash; the same ", text)
    text = re.sub(r" \?\?step ", " &mdash; step ", text)
    text = re.sub(r" \?\?like ", " &mdash; like ", text)
    text = re.sub(r" \?\?short ", " &mdash; short ", text)
    text = re.sub(r" \?\?long ", " &mdash; long ", text)
    text = re.sub(r" \?\?positive ", " &mdash; positive ", text)
    text = re.sub(r" \?\?negative ", " &mdash; negative ", text)
    text = re.sub(r" \?\?that is ", " &mdash; that is ", text)
    text = re.sub(r" \?\?scientific", " &mdash; scientific", text)
    text = re.sub(r" \?\?ordinary", " &mdash; ordinary", text)
    text = re.sub(r" \?\?same rules", " &mdash; same rules", text)
    text = re.sub(r"smallest \?\?largest", "smallest &ndash; largest", text)
    text = re.sub(r"Correct \?\?", "Correct &mdash; ", text)
    text = re.sub(r"one shot per question \?\?", "one shot per question &mdash; ", text)
    text = re.sub(r"Step (\d+) \?\?", r"Step \1 &mdash; ", text)
    text = re.sub(r"summary \?\?Style", r"summary &mdash; Style", text)
    text = re.sub(r"Page (\d+) \?\?", r"Page \1 &mdash; ", text)

    # Index law list middots
    text = re.sub(
        r"\(add \?\?subtract \?\?multiply \?\?divide \?\?zero \?\?negative\)",
        "(add &middot; subtract &middot; multiply &middot; divide &middot; zero &middot; negative)",
        text,
    )

    # Curly quotes (specific patterns only)
    text = re.sub(r"either \?+on\?\?", 'either &ldquo;on&rdquo;', text)
    text = re.sub(r"or \?+off\?\?", 'or &ldquo;off&rdquo;', text)
    text = re.sub(r"Click \?+Divide", 'Click &ldquo;Divide', text)
    text = re.sub(r"2\?\?for", "2&rdquo; for", text)
    text = re.sub(r"same \?+proof\?\?", 'same &ldquo;proof&rdquo;', text)

    # Broken empty tags
    text = re.sub(r'(<p class="sci-convert-q"[^>]*>)??/p>', r"\1</p>", text)
    text = re.sub(r'(<p class="sci-arith-q"[^>]*>)??/p>', r"\1</p>", text)
    text = re.sub(r'(<div class="ladder-binary-result"[^>]*>)??/div>', r"\1</div>", text)
    text = re.sub(r'(<div class="val" id="gb-alt">)??/div>', r"\1&mdash;</div>", text)
    text = re.sub(r'(<div class="val" id="gb-shadow">)??/div>', r"\1&mdash;</div>", text)
    text = re.sub(r'(<div class="val" id="gb-tan">)??/div>', r"\1&mdash;</div>", text)
    text = re.sub(r'(<div class="val" id="gb-season">)??/div>', r"\1&mdash;</div>", text)

    # Comments in CSS
    text = re.sub(r"/\* \?\?\?\? ", "/* ---- ", text)
    text = re.sub(r" \?\?\?\? \*/", " ---- */", text)

    return text


def main() -> int:
    roots = [Path(p) for p in sys.argv[1:]] or [
        Path(__file__).resolve().parent / "dashboard" / "topics",
        Path(__file__).resolve().parent.parent / "s3-maths-web" / "topics",
    ]
    changed = 0
    for root in roots:
        if not root.is_dir():
            continue
        for path in sorted(root.glob("**/index.html")):
            original = path.read_text(encoding="utf-8", errors="surrogateescape")
            fixed = fix_content(original)
            if fixed != original:
                path.write_text(fixed, encoding="utf-8", errors="surrogateescape")
                print(f"fixed {path}")
                changed += 1
    print(f"done — {changed} file(s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
