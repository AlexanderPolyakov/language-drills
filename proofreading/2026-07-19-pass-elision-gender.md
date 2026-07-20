# Proof-reading pass — 2026-07-19

Two independent proof-reading agents (one per language) each reviewed a fresh
**random sample of 25 exercises** from `content/en` and `content/fr`, checking
both **content** (grammar, spelling/accents, élision, gender/number agreement,
conjugation, answer correctness & uniqueness, explanation/hint/cue accuracy,
distractor validity, native-level naturalness) and **structure** (schema
conformance per `scripts/build-manifest.mjs`, and how each item actually renders
per `js/types/{cloze,fill,transform}.js`). A third specialized agent
independently re-verified every change in the currently-open proof-reading PRs.

## Net-new fixes in this pass (11)

Every fix is a `fill` carrier-text correction: the renderer prints each blank's
`(cue)` next to the input box, so the literal words baked into the carrier — plus
the typed answer — must themselves form a grammatical sentence.

### EN — spelling consistency

- `en/pronouns.json` item 3 — `neighbors` → `neighbours`. The EN corpus is
  consistently British/Oxford spelling; every other occurrence of the word uses
  `neighbour(s)` (7 across the corpus), so `neighbors` was the sole American
  outlier.

### FR — `je → j'` élision before a vowel

- `fr/futur-simple-b1.json` item 6 — `Je {1} bientôt vingt ans.` → `J'{1} …`
  (answer `aurai`; rendered `Je aurai` → `J'aurai`).
- `fr/futur-simple-b1.json` item 24 — `Je {1} au cinéma …` → `J'{1} …`
  (answer `irai`; `Je irai` → `J'irai`).
- `fr/imparfait-vs-passe-compose-b1.json` item 0 — `… je {1} souvent au parc …`
  → `… j'{1} …` (answer `allais`; `je allais` → `j'allais`).
- `fr/imparfait-vs-passe-compose-b1.json` item 1 — `Hier soir, je {1} un film …`
  → `Hier soir, j'{1} …` (answer `ai regardé`; `je ai regardé` → `j'ai regardé`).
- `fr/imparfait-vs-passe-compose-b1.json` item 9 — `Je {1} déjà fini …` →
  `J'{1} …` (answer `avais`; `Je avais` → `J'avais`).

### FR — gender / agreement & élision in `vocabulary-nouns-a2.json`

Each of these items carried a teaching note stating the noun's gender, then
contradicted it in the carrier's article/adjective:

- item 12 — `un nouveau {1}` → `un nouvel {1}` (answer `emploi`; `nouveau` → `nouvel`
  before a vowel).
- item 14 — `La {1} est en panne …` → `L'{1} …` (answer `ascenseur`, masculine and
  vowel-initial; `La ascenseur` → `L'ascenseur`).
- item 25 — `un grand {1}` → `une grande {1}` (answer `vue`, feminine;
  `un grand vue` → `une grande vue`).
- item 27 — `La {1} … est trop élevée.` → `Le {1} … est trop élevé.` (answer
  `loyer`, masculine; both article and adjective corrected).
- item 32 — `Le {1} dure trois mois ici.` → `L'{1} …` (answer `hiver`;
  `Le hiver` → `L'hiver`).

## Verification of the open proof-reading PRs (#77, #88, #89, #94)

A specialized verification agent independently re-checked **every changed item**
in all four open proof-reading PRs, reading each file at the PR head to hunt for
unfixed siblings. Result: **all four are SAFE_TO_MERGE** — every stated defect is
fully resolved, each after-state is linguistically correct and natural, no new
error is introduced (no `{n}`/blanks mismatch, no cue containing `(`, no answer
dropped from its options, no lost explanation; élisions and `ne … pas` placement
correct), and no PR leaves an unfixed sibling of the same defect class.
No PR needs changes.

## Notes / deliberately left

- `fr/imparfait-vs-passe-compose-b1.json` is also touched by PR #77 (item 3,
  masculine-subject restriction). This pass edits items 0/1/9 (distinct lines),
  so the two changes merge cleanly.
- Duplicates of in-flight PRs (double-render in `adjective-agreement-a2` #89 /
  `hypothese-irreel-passe-b2` #88, `verbs-present-er` élision #94,
  `subject-pronouns-a1` élision #77, etc.) were deliberately excluded to avoid
  conflicting edits.
- Intentional/debatable items (e.g. `fr/negation-a1` `pas`-as-distractor teaching
  convention, `en/superlatives-a2` Pluto, sentence-initial answer casing in
  `fr/gerondif-participe-present-b2`) were reviewed and left for a maintainer.

## Standing recommendation

There is a large backlog of open, heavily-overlapping proof-reading PRs, so
`master` still carries every defect they fix and each scheduled pass keeps
re-surfacing the same known issues. Consolidating and merging the backlog would
let future passes converge on genuinely new findings.

## Validation

- `node scripts/build-manifest.mjs` passes (en: 48 exercises / 1052 items ·
  fr: 41 exercises / 1128 items). Manifest byte-identical — only carrier `text`
  strings changed, no item counts.
- Content-only changes under `/content` per the project's hard rules — no
  engine/JS changes.
