# Math chapter packs

All-In-One lists MATH Learning Tools by scanning `CONTENT_PACK_ROOTS` for `*/manifest.json`.

S3 lessons **JM24–JM35** match the Maths Topics List and the dashboard gallery. Each chapter copies the topic HTML into `tools/<slug>/` plus shared CSS/JS. Concept, tools, games, comics, summary, and quiz are the same embed with `?embed=1&tab=`.

Do not point `CONTENT_PACK_ROOT` at a single chapter folder.

```bash
node scripts/build-content-packs.mjs
```
