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
