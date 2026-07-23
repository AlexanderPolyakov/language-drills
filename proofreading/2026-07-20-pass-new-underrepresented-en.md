# Proof-reading pass — 2026-07-20 (new underrepresented-category EN items)

Targeted proof-read of only the **newly-authored** items in three EN exercise
files (identified by diffing `HEAD~1` against `HEAD`). Checked each new item for
content correctness (grammar rule, answer correctness in standard British
English, accuracy of `explanation`/`hint`), structure/schema conformance per
`js/types/{cloze,transform}.js`, and native-level naturalness. 10 items checked.

## reported-speech-b2.json — last 4 items (`transform`)

- Item 22 — *"Did you enjoy the concert last night?" → reported question* —
  **OK.** Yes/no question correctly reported with `if`/`whether` in statement
  order, auxiliary `did` dropped, `enjoy` → `had enjoyed`, `last night` → `the
  night before`. All four accepted variants parse as valid reported speech.
- Item 23 — *"Please hand in your essays by Friday" → reported command* —
  **OK.** Imperative → `told/asked us to hand in`, `your` → `our`. Both
  `tell`/`ask` variants correct; deadline `by Friday` rightly left unshifted.
- Item 24 — *"I locked the door and I am sure nobody can get in" → reported
  speech* — **OK.** Each verb backshifts one step (`locked` → `had locked`,
  `am` → `was`, `can` → `could`); `I` → `he`. Clean (no-paren) variants present
  so a naturally typed answer matches.
- Item 25 — *"I'll bring the documents here the day after tomorrow" → reported
  speech* — **OK.** `will` → `would`, `here` → `there`, `the day after
  tomorrow` → `two days later` / `in two days' time`. All five variants valid;
  apostrophe in `two days' time` is valid escaped JSON.

## ellipsis-substitution-c2.json — last 3 items (`cloze`)

- Item 22 — former/latter substitution — **FIXED: two defensible answers.**
  Original carrier *"The report offered two remedies, a tax rise and a spending
  freeze; the cabinet favoured {1} as less politically damaging."* left the
  referent undetermined — nothing in the sentence made `the former` (tax rise)
  preferable to `the latter` (spending freeze); both were fully grammatical and
  semantically defensible, so the item had two correct answers. Rewrote the
  carrier to *"The report proposed two remedies, a tax rise and a spending
  freeze; ministers favoured {1}, since raising taxes just before an election
  was unthinkable."* The added clause rules the tax rise out, fixing the answer
  as `the latter` (second-named). Updated `answer`, `hint`, and `explanation`
  accordingly; options set and structure unchanged.
- Item 23 — *"So {1} I, now that I've checked them twice."* (answer `am`) —
  **OK.** Original clause uses the verb `be`, so the inverted additive echo
  repeats that operator: *So am I*. `do` (needs a lexical verb) and `was`
  (wrong tense) are genuinely wrong.
- Item 24 — *"{1} carelessness could easily start a fire."* (answer `such`) —
  **OK.** `such carelessness` = category substitution. `so` cannot modify a
  noun; `that one` is a count pro-form that cannot precede uncountable
  `carelessness`. Distractors genuinely wrong.

## nuanced-modality-c2.json — last 3 items (`cloze`)

- Item 23 — *"he {1} hide my things and then deny all knowledge of it"*
  (answer `would`) — **OK.** `would` = characteristic/irritating repeated past
  behaviour. `should` expresses no past habit; `might` = mere possibility. Best
  and only fitting answer.
- Item 24 — *"the wind {1} fiercely all night"* (answer `must have been
  blowing`) — **OK.** Near-certain deduction about an ongoing past situation →
  continuous `must have been + -ing`. `must blow` is a present generalisation;
  `should have been blowing` = expectation/regret, not inference.
- Item 25 — *"they {1} landed by this time and will be collecting their
  luggage"* (answer `will have`) — **OK.** `will have + p.p.` = confident
  prediction of completion reasoned from the schedule; the parallel forward-
  looking `will be collecting` frames the sentence predictively rather than
  evidentially, so `will have` is clearly the intended answer over `must have`
  (which would rest on present evidence) and `should have` (weaker expectation).

## Validation

- `node scripts/build-manifest.mjs` → **OK — manifest regenerated.**
  (en: 48 exercises / 1205 items · fr: 41 exercises / 1355 items).
- Content-only change under `/content/en` (plus this report under
  `/proofreading`) per the project's hard rules — no engine/JS changes.

## Summary

10 new items checked. 1 fix: `ellipsis-substitution-c2.json` former/latter item
rewritten to remove a two-answer ambiguity. The other 9 items are correct as
authored.
