from pathlib import Path

dir = Path(__file__).resolve().parent
html = (dir / "sphere-recast-lab.html").read_text(encoding="utf-8")
js = (dir / "area-volume-recast-lab.js").read_text(encoding="utf-8")
standalone = html.replace(
    '<script src="area-volume-recast-lab.js"></script>',
    "<script>\n" + js + "\n</script>",
)
(dir / "sphere-recast-lab-standalone.html").write_text(standalone, encoding="utf-8")

share = dir / "sphere-recast-share"
share.mkdir(exist_ok=True)
(share / "sphere-recast-lab.html").write_text(html, encoding="utf-8")
(share / "area-volume-recast-lab.js").write_text(js, encoding="utf-8")
print("done")
