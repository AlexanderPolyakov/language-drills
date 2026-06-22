# Language Drills

A tiny, framework-free web app for practising language grammar and vocabulary
one item at a time. It runs entirely in the browser — vanilla HTML, CSS and
JavaScript with exercise content in JSON — and deploys as static files (e.g. to
GitHub Pages).

Currently ships **82 exercises / ~1,900 items** across **English (A1–C2)** and
**French (A1–B1)**: grammar, vocabulary (nouns, verbs, adjectives) and
per-verb French conjugation drills.

## How it works

You browse **language → level → category → exercise**, and the chosen exercise
is handed to a generic engine that quizzes you one item at a time. After each
answer you get immediate feedback, the correct answer on a miss, and a short
explanation of the rule before moving on. Each sitting is capped at 10 items
(sampled from the pool), and a per-level **Mixed drill** pools items from every
category at that level into one session.

Which items a session shows isn't purely random: every item is tracked like an
**Anki card** (spaced repetition, SM-2 lite). The engine weights selection
toward items that are *due*, *overdue*, or simply *hard* — so material you keep
getting wrong, or haven't seen in a while, resurfaces more often, while items
you've answered correctly drift further apart over days. See `js/srs.js`.

The level and exercise menus show a **`<due> / <total> due`** badge so you can
see at a glance how much is waiting for review (new, never-seen items count as
due); `0 / N due` means everything has been reviewed and isn't due yet.

This per-item scheduling is saved in `localStorage` only — there is no backend,
account or database.

## Exercise types

The engine is generic and dispatches on each exercise's `type`. Three types
exist today:

- **cloze** — a sentence with numbered blanks; each blank is a row of tappable
  option chips (one tap to answer). Used for choices like articles, prepositions
  and vocabulary-in-context.
- **fill** — a sentence with a cued gap (`(write) ____`); you type the right
  form. Used for conjugation, plurals, comparatives, etc.
- **transform** — rewrite a whole sentence (e.g. into another tense) and the
  text is compared loosely against accepted answers.

Adding a brand-new type is the only reason to touch engine code: write one
module exposing `render(item)` and `check(item, input)` (plus an optional
`mark(body, result)`) and register it in `js/types/index.js`.

## Project layout

```
index.html            # mounts the app; loads js/app.js as a module
styles.css            # dark theme, single column, mobile-friendly
js/
  app.js              # bootstrap
  menu.js             # manifest-driven browse + hash routing (#/en/A2/articles)
  engine.js           # generic one-item-at-a-time runner (SESSION_SIZE cap)
  srs.js              # per-item spaced repetition (SM-2 lite): schedule + weighting
  i18n.js             # UI strings (kept separate from exercise content)
  types/
    index.js          # type registry
    cloze.js          # render / check / mark for cloze
    fill.js           # render / check / mark for fill
    transform.js      # render / check for transform
content/
  manifest.json       # generated index of every exercise (id, topic, level, file, count)
  en/ *.json          # English exercises
  fr/ *.json          # French exercises
scripts/
  build-manifest.mjs  # validates content and regenerates the manifest
```

## Content schema

Exercise content lives **only** in JSON under `content/`. Every file looks like:

```json
{
  "id": "en-articles-basic",
  "lang": "en",
  "topic": "articles",
  "level": "A2",
  "type": "cloze",
  "title": "A, an, the, or nothing?",
  "lesson": "Optional short rule shown once before the drill starts.",
  "items": [
    {
      "text": "She is {1} honest person who studies at {2} university.",
      "blanks": [
        { "answer": "an", "options": ["a", "an", "the", "—"], "hint": "follows the sound, not the letter" },
        { "answer": "a",  "options": ["a", "an", "the", "—"], "hint": "begins with a /j/ sound" }
      ],
      "explanation": "Article choice depends on the initial sound."
    }
  ]
}
```

Item shapes by type:

- **cloze** — `text` with `{1}`, `{2}` … blanks; each blank has `options[]`, an
  `answer` that must be one of those options, and an optional `hint`.
- **fill** — `text` with numbered blanks; each blank has a `cue` (the prompt
  shown in parentheses) and an `answer` (string or array of accepted strings).
- **transform** — a `prompt`, an `instruction`, and an `answer`
  (string or array), plus an optional `placeholder`.

Every item must have an `explanation`. `{n}` placeholders are 1-based and must
match the number of blanks.

### Adding content

- **New exercise:** drop a JSON file into `content/<lang>/`, then run
  `node scripts/build-manifest.mjs` to validate it and refresh the manifest.
- **New language:** add a `content/<lang>/` folder and exercises — no engine
  changes needed. (UI chrome stays in the configured UI language, which is kept
  separate from the content's target language in `js/i18n.js`.)

The build script checks that every exercise parses, every item has an
explanation, placeholder counts match blanks, every cloze answer is one of its
options, every fill blank has a cue and answer, and all ids are unique. It fails
loudly if anything is off, then rewrites `content/manifest.json`.

## Running locally

The app uses `fetch` to load JSON, so it needs to be served over HTTP — opening
`index.html` from `file://` won't work. Any static server does:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

No build step and no dependencies. `scripts/build-manifest.mjs` requires Node
(it's a dev/authoring tool only and is never loaded by the page).

## Deploying

It's static files, so GitHub Pages (or any static host) serves the repository
root directly — no configuration required.

## License

See [LICENSE](LICENSE).
