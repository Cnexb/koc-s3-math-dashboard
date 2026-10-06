# Math chapter packs

All-In-One lists MATH Learning Tools by scanning `CONTENT_PACK_ROOTS` for `*/manifest.json`.

S3 lessons **JM24–JM35** match the Maths Topics List. Each chapter keeps its files in that chapter folder: hub HTML and related JS/CSS directly in `tools/`, shared styles and scripts in `tools/shared/`, native Concept & Formula videos in `concepts/<topicId>/`. Tools, games, comics, summary, and quiz stay in the same pack.

Do not point `CONTENT_PACK_ROOT` at a single chapter folder. Do not nest packs under a year folder.

## Quiz JSON lint

`questions.json` is the source of truth for Uni+ quiz text. Lint it in this repo:

```bash
bun --cwd content-packs run lint:quizzes
bun --cwd content-packs run lint:quizzes -- --pack jm26-inequalities
```

The checker flags literal `\n`, unbalanced `$`, `$` glued to English (`$true`), raw TeX outside `$…$`, and bare currency `$30`. Fix the JSON; do not paper over it in All-In-One.
