"""Local static server that always serves index.html for topic folders (no bare listings)."""
from __future__ import annotations

import http.server
import os
import socketserver
import urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PORT = int(os.environ.get("KOC_PORT", "8765"))


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

        return super().do_GET()


class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True


if __name__ == "__main__":
    os.chdir(ROOT)
    with ReusableTCPServer(("127.0.0.1", PORT), Handler) as httpd:
        print("Serving FULL site at http://127.0.0.1:%s/dashboard/s3.html#lessons" % PORT)
        print("Root: %s" % ROOT)
        httpd.serve_forever()
