# Math content packs

This repo is the Maths teaching files for **Uni+ (All-In-One)**. Students do not open this site. Uni+ reads the `content-packs/` folder and shows notes, tools, games, comics, quizzes, and concept videos in Learning Tools.

## How Uni+ finds content

Each **lesson** is one folder. Uni+ only looks **one level** under `content-packs/`:

```
content-packs/
  jm24-law-of-indices/
    manifest.json          ← required. If this file is valid and published, Uni+ can list the lesson
    tools/<slug>/          ← lesson page (keep index.html here) plus its JS/CSS
    tools/shared/          ← CSS and JS shared by that lesson
    concepts/<topicId>/    ← native Concept & Formula videos
    quiz/
  jm25-factorization-polynomials/
  …
```

`manifest.json` is the table of contents. **A file that is not listed there is invisible** in Uni+.

Do **not** wrap lessons in year folders such as `content-packs/S3/…`. Uni+ will not see them. Do **not** point `CONTENT_PACK_ROOT` at a single lesson folder.

## S1–S6 is a label on a Topic, not a folder

The syllabus list is `content/topics/math-topics.json`. Each Topic has:

- a **Symbol** (short code), e.g. `Index`, `MFact`
- a **Topic Number**, e.g. `JM24 Laws of Indices`, `SM01 Number System`
- a **Level**, e.g. `(S1)` or `(S4)`
- **Sub-topics** from the syllabus CSV

Form (S1 vs S6) is **not** chosen by folder name. Do not invent Symbols.

## What teachers edit

| You want to change | Edit |
| --- | --- |
| Which items appear | that lesson’s `manifest.json` |
| The lesson page | `tools/<slug>/` (keep `index.html`) |
| A concept video | `concepts/<topicId>/` and the manifest row that points at it |
| A quiz | the quiz data inside that lesson folder, and the `quiz` list |
| Topic codes / year | `content/topics/math-topics.json` |

## Stop

Duplicate `scope`, year-folder wrappers, or quiz runner / tracking changes → ask the technical owner. Do not push.
