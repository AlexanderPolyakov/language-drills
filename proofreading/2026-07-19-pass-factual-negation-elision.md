# Proof-reading pass — 2026-07-19 (factual / negation / élision)

Two independent proof-reading agents (one per language) each reviewed a fresh
**random sample of 25 exercises** — 25 from `content/en`, 25 from `content/fr` —
checking both **content** (grammar, spelling/accents, élision, gender/number
agreement, conjugation, tense selection, answer correctness & uniqueness,
explanation/hint/cue accuracy, distractor validity, native-level naturalness,
and factual truth of example sentences) and **structure** (schema conformance
per `scripts/build-manifest.mjs`, and how each item actually renders per
`js/types/{cloze,fill,transform}.js`). A third specialized agent independently
re-verified every change in the currently-open proof-reading PR.

## Net-new fixes in this pass (3)

### EN — factual correction

- `en/superlatives-a2.json` item 12 (`fill`) — `Pluto is {1} planet from the
  sun.` → `Neptune is {1} planet from the sun.` Pluto was reclassified as a
  *dwarf planet* in 2006 (so it is not "a planet"), and even before that it was
  not reliably the farthest body from the sun. Neptune is unambiguously the
  outermost planet, so the carrier is now factually true. The cue (`far`) and
  accepted answers (`the furthest` / `the farthest`) are untouched — the
  superlative drill is identical. (A prior pass had flagged this Pluto item as
  "debatable, left for a maintainer"; it duplicates no in-flight PR.)

### FR — explétif *ne* élision

- `fr/concordance-des-temps-c2.json` item 3 (`fill`) — `Je craignais qu'il ne
  {1} déjà tout dépensé …` → `… qu'il n'{1} …`. After `craindre que`, the
  explétif *ne* is required; both accepted answers (`ait`, `eût`) are
  vowel-initial, so *ne* must elide to *n'*. Rendered: `qu'il n'ait / n'eût déjà
  tout dépensé`, matching the item's own explanation, which quotes « qu'il n'eût
  déjà tout dépensé ». This is a distinct class from the `je → j'` / `le → l'`
  carrier élisions handled in earlier passes.

### FR — negation word order

- `fr/hypothese-irreel-passe-b2.json` item 6, blank 2 (`fill`) — the carrier
  `… si les secours n'{2} (intervenir) pas si vite.` with answer
  `["étaient intervenus"]` rendered `n'étaient intervenus pas` — `pas` wrongly
  placed *after* the past participle. French compound-tense negation is
  `ne + AUX + pas + participe`. Fixed by moving the full negation into the answer
  (matching this file's own convention — cf. item 2's `n'aurions pas manqué`):
  - carrier → `… si les secours {2} (intervenir) si vite.`
  - answer  → `["n'étaient pas intervenus"]`
  Rendered: `les secours n'étaient pas intervenus si vite` — correct. Blank count
  and structure unchanged.

## Verification of the open proof-reading PR (#97)

A specialized verification agent independently re-checked **every one of the 11
content changes** in PR #97 ("fix FR élision/gender errors + EN spelling"),
reading each file to hunt for unfixed siblings. Result: **SAFE_TO_MERGE** —
every "before" was a genuine defect, every "after" is linguistically correct and
natural (élisions, `nouveau → nouvel`, article/adjective gender & number
agreement all correct), no structural regression is introduced (blank/`{n}`
counts intact, no cue gains a `(`, no cloze option/answer dropped, no
explanation lost), and no touched file leaves an unfixed sibling of the same
defect class. The `neighbors → neighbours` spelling claim was confirmed by grep
(sole US outlier in an otherwise British corpus). No changes needed.

## Notes / deliberately left

- `fr/negation-a1.json` item 0 (`Je ne mange {1} de viande …` → `jamais`) — the
  distractor `pas` is also grammatically valid ("je ne mange pas de viande").
  This non-uniqueness recurs across the file and is the intended "best-nuance"
  design (permanent habit → *jamais*); left as a teaching convention.
- `en/vocabulary-b2.json` — pervasive `-ize` spelling (`criticized`,
  `summarize`, `organize` …) against the corpus's British `-ise` norm. Systematic
  across the whole file and `-ize` is Oxford-acceptable; left for a maintainer
  rather than re-spelled piecemeal.
- `en/possessive-adjectives-a1` `apartment`, `en/quantifiers-a2` `downtown`,
  `fr/vocabulary-verbs-a2` item 20 (`to pack` → `ranger`) — register/translation
  nits that are understood and grammatical; left as stylistic.
- All FR conjugation files (`conjugation-a1/a2/b1`, `accord-participe-passe-c1`,
  `subjonctif-passe-b2`) were read in full and verified correct, including
  tricky forms (`riions/riiez`, `croyions`, invariable COI in the subjonctif
  passé). No defects.
- Recurring classes already covered by in-flight PRs (fill double-render,
  `je → j'` / `le → l'` carrier élision, vocabulary gender mismatches) were
  deliberately excluded to avoid conflicting edits.

## Standing recommendation

The open proof-reading PR backlog remains large and heavily overlapping, so
`master` still carries every defect those PRs fix and each scheduled pass keeps
re-surfacing the same known issues. Consolidating and merging the backlog would
let future passes converge on genuinely new findings (like the three above).

## Validation

- `node scripts/build-manifest.mjs` passes (en: 48 exercises / 1052 items ·
  fr: 41 exercises / 1128 items). Manifest byte-identical — only carrier `text`
  and one `answer` string changed, no item counts.
- Content-only changes under `/content` (plus this report under `/proofreading`)
  per the project's hard rules — no engine/JS changes.
