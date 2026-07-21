# Content + proof-reading pass — 2026-07-21 (round 3, further underrepresented complex categories)

Scheduled content-drill run. Added **20 new items** (10 EN + 10 FR) to the
most underrepresented **complex** (B2/C1/C2) grammar categories — chosen by
count relative to topic complexity, avoiding the categories a previous run on
this branch had already boosted. Existing types (`cloze`/`fill`/`transform`)
already cover every target topic, so **no engine change / new type** was
required.

## Items added

### English (Murphy *English Grammar in Use* · Hewings *Advanced Grammar in Use* · Swan *Practical English Usage*; British English)
| File | Level | Type | +items |
|---|---|---|---|
| `cleft-sentences-c1` | C1 | transform | +3 |
| `inversion-c1` | C1 | transform | +3 |
| `advanced-connectors-c1` | C1 | cloze | +2 |
| `formal-subjunctive-c2` | C2 | fill | +2 |

New patterns: it-cleft with plural human focus + reversed/`Where` wh-clefts;
`Only when…`, `Never before…`, `Not once…` fronted-adverbial inversions;
`conversely` / `on the grounds that` connectors; mandative subjunctive after
`require that` and past subjunctive after `would rather` + new subject.

### French (*Édito* B2/C1 · *Grammaire progressive du français* · *Bescherelle* · Grevisse *Le Bon Usage*)
| File | Level | Type | +items |
|---|---|---|---|
| `nominalisation-c1` | C1 | transform | +3 |
| `double-pronominalisation-c2` | C2 | transform | +3 |
| `mise-en-relief-c1` | C1 | transform | +2 |
| `gerondif-participe-present-b2` | B2 | fill | +2 |

New patterns: nominalisation via `-ation` / `-ment` / `-té` suffixes with
gender agreement; double pronouns `la leur`, `te l'` (+ participle agreement
`prescrite`), imperative `Explique-le-lui !`; `ce que` / `ce dont` mise en
relief; gérondif of simultaneity and the `-ant` (participe présent) vs `-ent`
(adjectif verbal) spelling contrast.

## Proof-reading

One proof-reading subagent per language checked every new item for both
content correctness (grammar, spelling/accents, answer uniqueness, explanation
accuracy against the cited sources) and structure (schema, placeholder/blank
counts, cloze answer∈options, valid JSON).

- **English** — 10/10 CLEAN, no edits.
- **French** — 10/10 CLEAN, no edits.

## Validation

`node scripts/build-manifest.mjs` → `OK — manifest regenerated.`
(en: 48 exercises / 1230 items · fr: 41 exercises / 1380 items).
