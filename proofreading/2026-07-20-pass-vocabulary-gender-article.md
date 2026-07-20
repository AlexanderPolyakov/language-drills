# Proof-reading pass — 2026-07-20

A scheduled proof-reading pass. Two independent proof-reading agents (one per
language) each reviewed a fresh **random sample of 25 exercises** — 25 from
`content/en`, 25 from `content/fr` — checking both **content** (grammar,
spelling/accents, élision, gender/number agreement, conjugation, tense/mood
selection, answer correctness & uniqueness, explanation/hint/cue accuracy,
distractor validity, native-level naturalness, and factual truth of examples)
and **structure** (schema conformance per `scripts/build-manifest.mjs`, and how
each item actually renders per `js/types/{cloze,fill,transform}.js`). A third
specialized agent independently re-verified every change in the currently-open
proof-reading PR (#99).

## Net-new fix in this pass (1)

### FR — article/gender agreement in a `fill` carrier

- `fr/vocabulary-b1.json` item 27 (`fill`) — carrier `Le {1} des emplois
  inquiète la région.` → `La {1} des emplois inquiète la région.` The blank's
  answer is `perte`, which is **feminine** — the item's own explanation says so
  verbatim: *"Note: 'perte' is feminine (la perte = the loss)."* The literal
  masculine article `Le` baked into the carrier therefore rendered the
  ungrammatical *"Le perte des emplois inquiète la région."* Fixing the article
  to `La` makes the rendered sentence agree with the noun and with the item's own
  explanation. The cue (`loss`), answer (`perte`), blank count and structure are
  unchanged. No open proof-reading PR touches `vocabulary-b1.json`, so this is a
  genuinely new finding, not a duplicate.

## EN sample — no findings

The English agent read all 25 assigned files in full and found **no must-fix
defects**. Cloze non-uniqueness risks it examined (e.g. `conditionals`
*melts / will melt*, `articles-a1` *An elephant* vs generic *The*, `modals`
*should / have to*) are all resolved by each blank's disambiguating hint —
standard hint-driven design. All `fill` carriers render grammatically with the
auto-added `(cue)` plus the inserted answer; no cue contains `(`; British/Oxford
spelling is internally consistent (`favourite`, `at the weekend`, `filled in`,
`flat`). `inversion-c1` item 3's compressed *"Not only did … but also offered"*
answer is acceptable and a fully standard alternate answer is also listed.

## Verification of the open proof-reading PR (#99)

A specialized verification agent independently re-checked **all 3 content
changes** in PR #99 (*"fix EN Pluto→Neptune fact + FR explétif-ne élision &
negation order"*), reading each file in full to hunt for unfixed siblings.
Verdict: **SAFE_TO_MERGE**.

- **EN `superlatives-a2` item 12** — `Pluto is … planet` → `Neptune is … planet`:
  before-state factually wrong (Pluto reclassified a dwarf planet in 2006, and
  never reliably the farthest body); after-state true (Neptune is the outermost
  planet). No other false example sentence in the file (Everest/highest,
  Nile/longest, Russia/largest all correct). Structure intact.
- **FR `concordance-des-temps-c2` item 3** — `qu'il ne {1}` → `qu'il n'{1}`:
  explétif *ne* after `craindre que`, both answers (`ait`, `eût`) vowel-initial,
  so *ne* must elide; matches the item's own explanation. The only other
  explétif *ne* in the file (`avant que … ne soit`) is consonant-initial, so no
  sibling élision is missing.
- **FR `hypothese-irreel-passe-b2` item 6 blank 2** — negation folded into the
  answer (`n'étaient pas intervenus`) so compound-tense negation is
  `ne + AUX + pas + participe`, matching item 3's `n'aurions pas manqué`. Blank
  count stays 2; the parallel `(intervenir)` double-render removal belongs to
  PR #88 and does not conflict.

No changes were needed to PR #99.

## Notes / deliberately left

- Classes already covered by in-flight PRs — `fill` double-render, `je → j'` /
  `le → l'` carrier élision, `vocabulary-nouns-a2` gender/article mismatches,
  `used-to-b1` answer duplication, `superlatives-a2` Pluto — were deliberately
  excluded from this pass's fixes to avoid conflicting edits.
- Known-intentional / debatable items (`fr/negation-a1` `pas`-as-distractor
  teaching convention, `en/possessive-adjectives-a1` collective `their` /
  `his·her` vs `its`, `en/vocabulary-b2` Oxford `-ize`, sentence-initial answer
  casing in `fr/gerondif-participe-present-b2`) were reviewed and left for a
  maintainer.

## Validation

- `node scripts/build-manifest.mjs` passes (en: 48 exercises / 1052 items ·
  fr: 41 exercises / 1128 items). The change is a single carrier `text` article
  (`Le` → `La`); no item counts, no answer, no schema change.
- Content-only change under `/content` (plus this report under `/proofreading`)
  per the project's hard rules — no engine/JS changes.

## Standing recommendation

The open proof-reading PR backlog (#77, #88, #89, #94, #97, #99) remains large
and heavily overlapping, so `master` still carries every defect those PRs fix
and each scheduled pass keeps re-surfacing the same known issues. Consolidating
and merging the backlog would let future passes converge on genuinely new
findings like the one here.
