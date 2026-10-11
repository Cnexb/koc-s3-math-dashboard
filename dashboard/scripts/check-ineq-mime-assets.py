#!/usr/bin/env python3
"""Fail if inequality/index.html requests a script that is served as HTML."""
from __future__ import annotations

import http.client
import re
import sys
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "topics/inequality/index.html"


def local_scripts(html: str) -> list[str]:
    hrefs = []
    for raw in re.findall(r"<script[^>]+src=[\"']([^\"']+)", html):
        if raw.startswith(("http://", "https://")):
            continue
        hrefs.append(urlparse(raw).path)
    return hrefs


def resolve(href: str) -> Path:
    return (ROOT / "topics/inequality" / href).resolve()


def url_from_href(href: str) -> str:
    path = resolve(href)
    try:
        return "/" + str(path.relative_to(ROOT))
    except ValueError:
        return "/" + href.lstrip("./")


def main() -> int:
    html = PAGE.read_text(encoding="utf-8")
    hrefs = local_scripts(html)
    print("scripts:")
    missing = []
    for href in hrefs:
        path = resolve(href)
        ok = path.is_file() and path.stat().st_size > 0
        rel = path.relative_to(ROOT) if str(path).startswith(str(ROOT)) else path
        print(f"  {'OK ' if ok else 'MISS'} {href} -> {rel}")
        if not ok:
            missing.append(href)

    handler = partial(SimpleHTTPRequestHandler, directory=str(ROOT))
    httpd = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    port = httpd.server_address[1]
    mime_bad = []
    try:
        for href in hrefs:
            url = url_from_href(href)
            conn = http.client.HTTPConnection("127.0.0.1", port, timeout=3)
            conn.request("GET", url)
            res = conn.getresponse()
            body = res.read(80)
            ctype = res.getheader("Content-Type", "")
            print(f"  HTTP {res.status} {ctype} {url}")
            htmlish = (
                res.status != 200
                or "javascript" not in ctype
                and "ecmascript" not in ctype
                or body.lstrip().startswith((b"<!DOCTYPE", b"<html"))
            )
            if htmlish:
                mime_bad.append((href, res.status, ctype))
            conn.close()
    finally:
        httpd.shutdown()

    if missing or mime_bad:
        print("RED: a requested script is missing or served as text/html (browser MIME refuse).")
        return 1
    print("GREEN: every local inequality script exists and is served as JavaScript.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
