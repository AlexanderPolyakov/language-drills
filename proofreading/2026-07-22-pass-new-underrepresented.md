# Proof-reading pass — 2026-07-22 (new underrepresented-category items)

Scope: the 20 items authored this run (10 EN + 10 FR), targeting the complex
(B2+) categories that were most underrepresented *relative to topic
complexity* — high-CEFR grammar files carrying only ~20–28 items each, well
below the vocabulary / A-level drills.

One proof-reading subagent per language checked every new item for:
answer correctness, ambiguity (exactly one defensible answer / clearly-wrong
distractors), schema + engine rendering (`{n}` placeholder count = number of
`blanks`, non-empty `explanation`), and spelling / accents / register.

## Items added (2 per file)

**English** (grounded in Murphy *English Grammar in Use* / Hewings
*Advanced Grammar in Use*, standard British English):

| File | Level | Type | +items |
|---|---|---|---|
| `advanced-connectors-c1` | C1 | cloze | +2 |
| `discourse-markers-c2` | C2 | cloze | +2 |
| `formal-subjunctive-c2` | C2 | fill | +2 |
| `phrasal-verbs` | B2 | cloze | +2 |
| `gerunds-infinitives-b2` | B2 | fill | +2 |

**French** (grounded in *Grammaire progressive du français* perfectionnement,
*Édito* B2, Grevisse/Bescherelle):

| File | Level | Type | +items |
|---|---|---|---|
| `connecteurs-logiques-b2` | B2 | cloze | +2 |
| `gerondif-participe-present-b2` | B2 | fill | +2 |
| `mise-en-relief-c1` | C1 | transform | +2 |
| `nominalisation-c1` | C1 | transform | +2 |
| `double-pronominalisation-c2` | C2 | transform | +2 |

## Result

- **EN: 10/10 clean** — no defects. Each new cloze/fill item has a single
  unambiguously-correct answer with clearly-wrong distractors, correct schema,
  and a teaching explanation.
- **FR: 10/10 clean** — no defects. Accents/orthography impeccable; transform
  answer-arrays follow each file's own convention (single accented answer for
  `mise-en-relief`; accented + de-punctuated/de-accented variants for
  `nominalisation` and `double-pronominalisation`); the `gerondif` adjectif
  verbal vs participe présent pair (`navigant` / `naviguant`) renders correctly
  as a two-blank `fill`.

No content edits were required by either proof-reader.

## Validation

`node scripts/build-manifest.mjs` → `OK — manifest regenerated.`
(en: 48 exercises / 1245 items · fr: 41 / 1395). All 89 content files valid JSON.
No engine/JS changes — existing `cloze`/`fill`/`transform` types already cover
these topics, so no new exercise type was needed.
