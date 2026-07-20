# Project: language drills (hobby)

## Hard rules — do not violate
- Exercise CONTENT lives only in JSON files under /content. Never hardcode
  exercises, sentences, or answers in JS.
- The ENGINE is generic: it renders an exercise and checks answers by
  looking up the exercise `type`. Adding content must require zero engine changes.
- Adding a language = adding a /content/<lang>/ folder. No engine changes.
- A new exercise *type* is the only reason to touch engine code, via one
  small module exposing render(item) and check(item, input).
- UI strings (button labels, instructions) live in a separate i18n file,
  never inline in the engine. Keep "target language" and "UI language" separate.
- No framework, no backend, no database. Vanilla HTML/CSS/JS + JSON.
  Progress in localStorage only. Deployable to GitHub Pages.

## Schema
Every exercise file: { id, lang, topic, level, type, title, items[] }.
Every item has an `explanation`. Types to support: cloze, transform, multiple-choice.
{
  "id": "en-articles-basic",
  "lang": "en",
  "topic": "articles",
  "level": "A2",
  "type": "cloze",
  "title": "A, an, the, or nothing?",
  "items": [
    {
      "text": "She is {1} honest person who studies at {2} university.",
      "blanks": [
        { "answer": "an", "options": ["a","an","the","—"], "hint": "follows the sound, not the letter" },
        { "answer": "a",  "options": ["a","an","the","—"], "hint": "'university' begins with a /j/ sound" }
      ],
      "explanation": "Article choice depends on the initial sound: 'honest' starts with a vowel sound, 'university' with a consonant sound."
    }
  ]
}

## Style
Small, readable, hobby-grade. Comments where intent isn't obvious. No premature abstraction.

## Content-drill automation — one open PR per kind of work
The scheduled routines must NOT open a new PR when an open PR of the same
kind already exists. Content authoring and proof-reading are SEPARATE
tracks — never fold one into the other; each converges on its own single
PR.
1. Before opening anything, list open PRs. Content-authoring PRs have
   titles starting `content:`; proof-reading PRs start `Proof-read`/
   `Proof-reading`.
2. If an open PR of the kind you're doing already exists, ADD your work on
   top of it: check out that PR's head branch, commit, and push to it. Do
   not open a second PR of that kind. (This is the one sanctioned case for
   pushing to a shared routine branch — it overrides "develop on your own
   branch" for these routines only.)
3. If there is genuinely NO open PR of that kind, create one on a FIXED
   branch name — `claude/content-drills` for authoring,
   `claude/proofreading` for proof-reading — so every future run of that
   routine converges on the same branch/PR instead of spawning duplicates.
4. If duplicates have already accumulated, consolidate each kind into its
   own single PR and close the rest — content stays separate from
   proof-reading.
