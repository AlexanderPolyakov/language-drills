# Proof-reading pass — 2026-07-18

Automated content **and** structure proof-reading of the exercise corpus. Two
language proof-readers (EN, FR) each independently reviewed **25 randomly
selected exercise files** for both linguistic content and structural/schema
correctness, checked against the real engine rendering rules in
`js/types/{cloze,fill,transform}.js`. A specialised verification agent
independently re-checked every change in the currently-open proof-reading PRs
#88 and #89. Findings were reconciled against the ~20 open proof-reading PRs so
only genuinely net-new defects are changed here.

## Net-new fix in this PR

### FR — `content/fr/verbs-present-er.json` · item 6 — élision error

`fill` item, carrier `"Je {1} la musique."`, cue `écouter`, answer `écoute`.
The answer is vowel-initial, so with a literal `Je ` in the carrier the item
rendered the ungrammatical **"Je écoute la musique."** French elides *je → j'*
before a vowel — the item's own explanation already says *"écouter → j'écoute"*.

Fix: carrier `"Je {1} la musique."` → `"J'{1} la musique."` (renders
**"J'écoute la musique."**). Cue and answer are unchanged. Item 6 is the only
`je` + vowel-initial item in the file — all other `je` items (`parle`) are
consonant-initial and correct; no sibling occurrence remains.

**No open proof-reading PR touches `verbs-present-er.json`**, so this defect is
not covered elsewhere and is fixed here.

## Verification of open proof-reading PRs (specialised agent)

Every change in the two most recent content-bearing proof-reading PRs was
independently re-checked against the engine's rendering rules and re-validated
with `scripts/build-manifest.mjs`:

- **PR #88** (`claude/awesome-thompson-jc5nyk`) — EN `mixed-conditionals-b2`
  (fill double-render, all 20 items), EN `formal-subjunctive-c2` item 8
  (semicolon → period before *Be that as it may*), FR `hypothese-irreel-passe-b2`
  (double-render all items + item-6 negation folded to `n'étaient pas
  intervenus`), FR `passe-simple-c1` (double-render all items) — **all changes
  CONFIRMED_GOOD**, no sibling defect left, manifest builds (en 48/1052,
  fr 41/1128). **Safe to merge as-is.**
- **PR #89** (`claude/awesome-thompson-n0b7l1`) — FR `adjective-agreement-a2`
  (fill double-render, all 12 items; redundant trailing `(base)` removed from
  carriers) — **CONFIRMED_GOOD**, no info lost (the richer cue keeps the lemma),
  manifest builds. **Safe to merge as-is.**

## Findings that duplicate in-flight PRs (deliberately NOT changed here)

The random samples overlapped files already fixed by open PRs; those defects are
real but left to their existing PRs to avoid duplicate/conflicting edits:

| File · item | Defect | Already fixed by (open PR / branch) |
|---|---|---|
| en/used-to-b1 · items 30, 31 | answer duplicates a word already in the carrier (`used to drink drink…`) | #21; branch `…-bz0r9g` |
| en/superlatives-a2 · item 12 | factual: Pluto is not a planet → Neptune | #31, #67; branches `…-a6idvy`, `…-ea73i0` |
| fr/adjective-agreement-a2 · all items | fill double-render (trailing `(base)`) | **#89** (verified above) |
| fr/hypothese-irreel-passe-b2 · all items | fill double-render | **#88** (verified above) |
| fr/hypothese-irreel-passe-b2 · item 6 | negation order `n'étaient intervenus pas` → `n'étaient pas intervenus` | **#88** (verified above) |
| fr/subject-pronouns-a1 · item 10 | élision: `J' suis` → `Je suis` | #67; branches `…-a6idvy`, `…-bz0r9g` (identical fix confirmed) |

## Findings reviewed but deliberately left (intentional design / debatable)

Recorded for a maintainer's call — no changes made:

- **fr/negation-a1** (items 0, 3, 7) — *jamais* / *plus* cloze items list `pas`
  as a distractor that is also grammatically valid; the semantic cue
  (végétarien / principes / "avant je fumais") disambiguates. Prior passes
  (#88) already logged this as standard teaching convention and left it.
- **en/possessive-adjectives-a1** (items 24, 28) — collective `their` for
  *company*, and `his/her` vs keyed `its` for *the baby*: grammatically
  defensible alternatives; pedagogically debatable.
- **en/modals**, **en/nuanced-modality-c2**, **en/phrasal-verbs**,
  **en/reported-speech-b2** — a few items rely on the hint for uniqueness where
  a distractor is well-formed in isolation (standard hint-driven design).
- **en/vocabulary-b2** — Oxford `-ize` spelling vs the corpus's British lean;
  internally consistent, a cross-file style call only.
- **fr/possessive-adjectives-a1** (item 27) — `vos colis` also grammatical
  (invariable `colis`); explanation pre-empts it with a singular reading.

## Result

- **1 net-new defect** found and fixed (`fr/verbs-present-er` item 6 élision).
- All other must-fix defects surfaced this pass are already addressed by open
  proof-reading PRs; both recent content-bearing ones (#88, #89) independently
  re-verified as correct and mergeable.
- `node scripts/build-manifest.mjs` passes (en 48/1052 · fr 41/1128); manifest
  byte-identical (only a carrier `text` string changed). Content-only change
  under `/content` per the project's hard rules — no engine/JS changes.

## Standing note

There is a large backlog of **~20 open proof-reading PRs** (oldest #21) that
overlap heavily and remain unmerged, so `master` still carries every defect they
fix and each scheduled pass keeps re-discovering the same handful of problems.
Merging the backlog (PR #21 is the broadest fix set and a sensible base) would
let future passes converge on genuinely new findings.
