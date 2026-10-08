"""Local static server that always serves index.html for topic folders (no bare listings)."""
from __future__ import annotations

import http.server
import os
import re
import socketserver
import urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PORT = int(os.environ.get("KOC_PORT", "8765"))
PLACEHOLDER = re.compile(r"%(VITE_[A-Z0-9_]+)%")


def load_env() -> dict:
    """.env.<KOC_ENV> (default production), overridden by .env.local; supports ${VAR}."""
    env: dict = {}
    for name in (".env." + os.environ.get("KOC_ENV", "production"), ".env.local"):
        f = ROOT / name
        if not f.is_file():
            continue
        for line in f.read_text(encoding="utf-8").splitlines():
            m = re.match(r"^\s*([A-Za-z_]\w*)\s*=\s*(.*?)\s*$", line)
            if m:
                env[m[1]] = re.sub(r"\$\{(\w+)\}", lambda k: env.get(k[1], ""), m[2])
    return env


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def list_directory(self, path):  # type: ignore[override]
        for name in ("index.html", "index.htm"):
            index = os.path.join(path, name)
            if os.path.isfile(index):
                self.send_response(302)
                self.send_header("Location", self.path.rstrip("/") + "/" + name)
                self.end_headers()
                return None
        return super().list_directory(path)

    def do_GET(self):  # type: ignore[override]
        parsed = urllib.parse.urlparse(self.path)
        path = urllib.parse.unquote(parsed.path)
        fs = ROOT / path.lstrip("/").replace("/", os.sep)

        if fs.is_dir():
            index = fs / "index.html"
            if index.is_file():
                dest = path.rstrip("/") + "/index.html"
                if parsed.query:
                    dest += "?" + parsed.query
                self.send_response(302)
                self.send_header("Location", dest)
                self.end_headers()
                return

        if path.rstrip("/") in ("/dashboard/s3",):
            self.send_response(302)
            self.send_header("Location", "/dashboard/s3.html#lessons")
            self.end_headers()
            return

        if fs.is_file() and fs.suffix == ".html":
            html = fs.read_text(encoding="utf-8", errors="surrogateescape")
            if PLACEHOLDER.search(html):
                env = load_env()
                body = PLACEHOLDER.sub(lambda m: env.get(m[1], m[0]), html).encode(
                    "utf-8", errors="surrogateescape"
                )
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
                return

        return super().do_GET()


class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True


if __name__ == "__main__":
    os.chdir(ROOT)
    with ReusableTCPServer(("127.0.0.1", PORT), Handler) as httpd:
        print("Serving FULL site at http://127.0.0.1:%s/dashboard/s3.html#lessons" % PORT)
        print("Root: %s" % ROOT)
        httpd.serve_forever()
