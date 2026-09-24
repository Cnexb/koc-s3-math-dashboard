# Revert the JM24 Concept & Formula decks

The published decks before the 17 Sep 2026 overlap fix are frozen on:

- git branch: `backup/jm24-concept-slides-20260917`
- commit: `60a58a2`

To restore that version of the animations:

```bash
git checkout backup/jm24-concept-slides-20260917 -- \
  dashboard/slides/law_of_indices/_manim-deck.css \
  dashboard/slides/law_of_indices/_manim-boot.js \
  dashboard/slides/law_of_indices/positive-indices/index.html \
  dashboard/slides/law_of_indices/scientific-notation/index.html \
  dashboard/slides/law_of_indices/denary-binary/index.html
```

Then bump the `?v=` query on the Concept chips in `dashboard/topics/law_of_indices/index.html` and push `master`.
