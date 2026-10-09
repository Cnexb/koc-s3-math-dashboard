---
name: port-master-to-content-pack
description: Ports new master dashboard content into existing content-pack slots on feat/content-packs. Use when merging or copying master lesson updates into content-packs/, when the user says port master, update the pack branch, put content in the slot, or fix quiz_id / question_id / section from the Topic List xlsx.
---

# Port master → content-pack slots

Work on `feat/content-packs` (or the current pack branch). Pull `origin/master` first. Uni+ reads **only** `content-packs/*/manifest.json`.

## Do not

- Overwrite pack `tools/index.html` with `dashboard/topics/.../index.html`.
- Copy `dashboard/shared/` into every chapter. Do not create `content-packs/<pack>/shared/`.
- Add teaching files under `dashboard/`, `slides/`, `media/`, `public/`, or `dist/`.
- Nest packs in `S1/` / `S3/`. Invent Symbols. Change quiz runners / `postMessage` / tracking.
- Add files that `manifest.json` does not list (they stay invisible).

## Pack shape

```
content-packs/<pack>/
  manifest.json
  tools/                 # this lesson only: HTML, JS, comics, slides, games
  tools/shared/          # already there — update in place only if that file already exists
  concepts/<topicId>/    # native concept mp4s listed in manifest
  quiz/<id>/questions.json
```

All-In-One embed: `tools/` (or `tools/<slug>/`) `index.html`.

## Slots (master → pack)

| Master | Pack slot |
|--------|-----------|
| `dashboard/topics/<topic>/*-comics.js`, `comics-manifest.js`, `comics/` | `tools/` + `tools/comics/` |
| `dashboard/topics/<topic>/game/`, `*-game.js` | existing `tools/game/` or chapter game JS |
| `dashboard/slides/<topic>/<deck>/` | existing `tools/slides/...` deck only |
| concept videos | `concepts/<topicId>/` + `manifest.json` `concepts[].videos` |
| quiz banks | `quiz/<id>/questions.json` (not `*-quiz.js` as source of truth) |
| `dashboard/shared/*` | skip (one shared, not per chapter) |

Compare **content**, not hub paths. After a copy, rewrite only that file’s paths so they hit **this pack’s** slot (`comics/`, `slides/…`). Leave pack-relative paths that already work.

`basePath` in `comics-manifest.js` must point at `tools/comics/` (e.g. `comics/` from `tools/index.html`, `../comics/` from `tools/game/`). Never `../../comics/<hub folder>/`.

If a master file has no matching slot, skip it (`concept-only.html`, unused proof decks, year wrappers).

## Topic codes (xlsx)

Do not invent codes. Read the subject list:

| Subject | File |
|---------|------|
| MATH | `/Users/parko/Desktop/Topic List 2026/Maths Topics List(Update 4).xlsx` — sheet `Syllabus Updated (V4)`, column **Topic Number** (`JM26 Inequalities I` → code `JM26`) |
| PHY | `/Users/parko/Desktop/Topic List 2026/Physics Topics List Draft.xlsx` — **Topic Number** (`JPHG01 Temperature…` → `JPHG01`) |
| CHEM | `/Users/parko/Desktop/Topic List 2026/Chem topic list - Updated.xlsx` — **Topic Code** (`CPE01`, `CMWA01`, `CM01`) |
| BIO | `/Users/parko/Desktop/Topic List 2026/BIO topic list_2026.xlsx` — **Topic code** (`BB01`) |

Excel JM24/JM30 subtopic rows can be misaligned. Use the **topic code + pedagogical name**, not a wrong Excel subtopic.

`manifest.json`: `subject` `MATH` / `PHY` / `CHEM` / `BIO`, `chapterCode` the topic code (`JM26`).

## Quiz JSON (latest ids)

Edit `quiz/<folder>/questions.json`. Keep the folder / manifest `slug` (`jm26-l01`). Keep published `id` values; new questions get new ids.

| Field | Latest value | Example (MATH JM26, 2nd quiz) |
|-------|----------------|--------------------------------|
| `quizId` | `{prefix}-{code}` lowercase; extra quizzes `-{n}` | `math-jm26-2` |
| item `id` (`question_id`) | `{code}-{n}` **continuous in the chapter** | L01 Q1 → `jm26-1`; L02 Q1 → `jm26-6` if L01 had 5 items |
| `section` | topic code only | `JM26` |
| `topic` | `{code} {English name}` from xlsx | `JM26 Inequalities I` |

Prefixes: MATH `math-`, PHY `phy-`, CHEM `chem-`, BIO `bio-`. Codes lowercased in `quizId` only (`math-jm26`, `phy-jphg01`, `chem-cpe01`, `bio-bb01`).

No math `subtopic`. Do not convert All-In-One options to `{ key, text }` if the file already uses that shape — keep the file’s existing option shape. Do not change runners.

KaTeX (All-In-One): math in `$…$`; real JSON newlines; money `\$30 000`. Then:

```bash
bun --cwd content-packs run lint:quizzes
```

## Check

- New comic / video / quiz is listed in `manifest.json`.
- No new `shared/` tree per chapter.
- `git diff` is slot files only, not a hub HTML dump.
