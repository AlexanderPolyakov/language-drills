# Proof-reading routine — workflow

This folder holds the logs of the scheduled proof-reading passes. This file
documents **how the routine must behave** so it stops generating a new pull
request every run.

## The problem this fixes

Earlier runs accumulated a large backlog of open, heavily-overlapping
proof-reading PRs (at one point 9+). The cause: each run was told to *"add to an
existing proof-reading PR if one exists, or create a new one"*, but each run also
worked on its own fresh branch that it could only push to — so *"add to the
existing PR"* was never actually possible and every run opened a **new** PR.
Because none merged, `master` kept carrying the same defects and every pass
re-discovered them.

## Corrected workflow (do this every run)

1. **Look for an open proof-reading PR first.** Search open PRs for the
   proof-reading series (title starts with `Proof-read` / `Proof-reading`).
2. **If one already exists → reuse it. Do NOT open a new PR.**
   - Fetch and check out that PR's head branch.
   - Add this pass's fixes as new commit(s) on that branch and push to it.
     The existing PR updates in place.
   - If your run was assigned a different working branch, that constraint is
     **overridden for this routine**: push to the existing proof-reading PR's
     branch so everything stays in one PR.
3. **Only if NO open proof-reading PR exists → create one** (new branch + new
   PR). That PR then becomes the single rolling PR future runs append to.
4. **Verify, don't duplicate.** When an open proof-reading PR exists, run the
   verification agent over the changes *already in it*, and skip re-reporting a
   defect that PR already fixes — add only genuinely net-new findings.
5. **One PR at a time.** There should never be more than one open proof-reading
   PR. If you find several, consolidate them into one and close the rest.

## Unchanged parts of the routine

- One proof-reading agent **per language**, each given **25 random exercises**,
  checking both **content** (grammar/spelling/accents/answer correctness/facts)
  and **structure** (schema + how each item renders per
  `js/types/{cloze,fill,transform}.js`; `{n}` count == `blanks.length`; cloze
  `answer ∈ options`; every item has an `explanation`).
- Content-only edits under `/content` (plus a dated log here). No engine/JS
  changes — see the hard rules in the repo `CLAUDE.md`.
- Validate with `node scripts/build-manifest.mjs` before pushing.
