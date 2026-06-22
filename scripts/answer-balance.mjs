// Dev utility (not shipped to the page): audit and rebalance where the correct
// answer sits among a cloze blank's options.
//
// Why: some cloze sets list the right answer first in (almost) every blank, so a
// learner can "win" by always tapping the first chip without reading. This tool
// builds a histogram of the answer's position across all cloze blanks, flags
// sets skewed toward the first option, and can shuffle the options so the answer
// lands in a random spot.
//
// Natural order is preserved. Article exercises (a / an / the / —, and their
// French equivalents) have a conventional order learners expect, so any blank
// whose exercise `topic` contains "article" is left exactly as written. Sets
// with no natural order — verbs, nouns, adjectives, pronouns… — are the ones we
// rebalance.
//
// Usage:
//   node scripts/answer-balance.mjs            # report histogram + skew
//   node scripts/answer-balance.mjs --fix      # shuffle free-order options
//   node scripts/answer-balance.mjs --verify   # assert positions look random
//
// --fix edits options arrays in place (it only reorders the strings inside each
// "options": [ ... ], leaving all other formatting untouched) so diffs stay
// small and readable. Re-run scripts/build-manifest.mjs afterwards if needed
// (counts don't change, but it re-validates).
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const CONTENT = join(ROOT, "content");

const mode = process.argv[2] ?? "--report";
// Fixed seed so --fix is deterministic and reproducible across runs/machines.
const SEED = 0x9e3779b9;

// --- helpers ---------------------------------------------------------------

// A blank has a "natural order" we must keep when its exercise is about
// articles. Content-driven: we read the JSON's own topic, never a hardcoded
// list of words.
const isOrderedTopic = (topic) => /article/i.test(String(topic ?? ""));

// Small seeded PRNG (mulberry32) + Fisher-Yates, so a shuffle is repeatable.
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffled(arr, rnd) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Walk every content JSON (any language folder), skipping the manifest.
function* clozeFiles() {
  for (const lang of readdirSync(CONTENT, { withFileTypes: true })) {
    if (!lang.isDirectory()) continue;
    const dir = join(CONTENT, lang.name);
    for (const f of readdirSync(dir)) {
      if (!f.endsWith(".json")) continue;
      const path = join(dir, f);
      const raw = readFileSync(path, "utf8");
      let ex;
      try { ex = JSON.parse(raw); } catch { continue; }
      if (ex.type !== "cloze") continue;
      yield { rel: `${lang.name}/${f}`, path, raw, ex };
    }
  }
}

// Flatten an exercise's blanks in document order, tagging each as ordered
// (article) or free, with the answer's index among its options.
function blanksOf(ex) {
  const out = [];
  const ordered = isOrderedTopic(ex.topic);
  for (const item of ex.items ?? []) {
    for (const b of item.blanks ?? []) {
      out.push({
        ordered,
        options: b.options,
        answer: b.answer,
        pos: b.options.indexOf(b.answer),
        len: b.options.length,
      });
    }
  }
  return out;
}

// Bucket answer positions and compute first-position skew for a set of blanks.
// "expected" first rate under a fair shuffle is the mean of 1/len (a 3-option
// blank lands first 1/3 of the time, etc.).
function stats(blanks) {
  const hist = [];
  let firstCount = 0, expectedFirst = 0;
  for (const b of blanks) {
    hist[b.pos] = (hist[b.pos] ?? 0) + 1;
    if (b.pos === 0) firstCount++;
    expectedFirst += 1 / b.len;
  }
  const n = blanks.length;
  for (let i = 0; i < hist.length; i++) hist[i] = hist[i] ?? 0;
  return {
    n,
    hist,
    firstRate: n ? firstCount / n : 0,
    expectedRate: n ? expectedFirst / n : 0,
  };
}

// A free-order set is "skewed toward first" when the answer lands first far more
// often than a fair shuffle would produce. Needs a few blanks to be meaningful.
function isSkewed(s) {
  return s.n >= 4 && s.firstRate - s.expectedRate >= 0.15;
}

const bar = (count, max, width = 24) =>
  "█".repeat(max ? Math.round((count / max) * width) : 0);

// --- report ----------------------------------------------------------------

function report() {
  const all = { free: [], ordered: [] };
  const skewedFiles = [];

  for (const { rel, ex } of clozeFiles()) {
    const blanks = blanksOf(ex);
    const free = blanks.filter((b) => !b.ordered);
    const ordered = blanks.filter((b) => b.ordered);
    all.free.push(...free);
    all.ordered.push(...ordered);

    if (free.length) {
      const s = stats(free);
      const flag = isSkewed(s);
      if (flag) skewedFiles.push(rel);
      console.log(
        `${flag ? "⚠ " : "  "}${rel}  free=${s.n}` +
        `  first=${(s.firstRate * 100).toFixed(0)}% (fair ${(s.expectedRate * 100).toFixed(0)}%)` +
        `  positions[${s.hist.join(",")}]`
      );
    }
  }

  const s = stats(all.free);
  console.log("\n=== overall answer-position histogram (free-order blanks) ===");
  const max = Math.max(0, ...s.hist);
  s.hist.forEach((c, i) =>
    console.log(`  position ${i + 1}: ${String(c).padStart(4)} ${bar(c, max)}`)
  );
  console.log(
    `\n  free-order blanks: ${s.n}` +
    `  | answer-first ${(s.firstRate * 100).toFixed(1)}%  (fair shuffle ≈ ${(s.expectedRate * 100).toFixed(1)}%)`
  );
  console.log(`  article (ordered) blanks left untouched: ${all.ordered.length}`);
  console.log(`\n  skewed files (${skewedFiles.length}):`);
  for (const f of skewedFiles) console.log("    - " + f);
  return skewedFiles;
}

// --- fix -------------------------------------------------------------------

// Replace the inner of each "options": [ ... ] in document order. The i-th
// match is the i-th blank, so we reorder only the blanks we mean to.
const OPTIONS_RE = /("options"\s*:\s*)\[([^\]]*)\]/g;

function fix() {
  const skewed = new Set(reportSilent());
  let changedFiles = 0, changedBlanks = 0;

  for (const { rel, path, raw, ex } of clozeFiles()) {
    if (!skewed.has(rel)) continue;
    const rnd = mulberry32(SEED);
    const blanks = blanksOf(ex);
    let bi = 0;

    const next = raw.replace(OPTIONS_RE, (m, head, inner) => {
      const b = blanks[bi++];
      if (!b || b.ordered) return m; // keep article order untouched
      const order = shuffled(b.options, rnd);
      changedBlanks++;
      const body = order.map((o) => JSON.stringify(o)).join(", ");
      return `${head}[${body}]`;
    });

    if (next !== raw) {
      writeFileSync(path, next);
      changedFiles++;
      console.log(`rebalanced ${rel}`);
    }
  }
  console.log(`\nshuffled ${changedBlanks} free-order blanks across ${changedFiles} files.`);
}

// Same scan as report() but quiet — used by fix/verify to find skewed files.
function reportSilent() {
  const skewed = [];
  for (const { rel, ex } of clozeFiles()) {
    const free = blanksOf(ex).filter((b) => !b.ordered);
    if (free.length && isSkewed(stats(free))) skewed.push(rel);
  }
  return skewed;
}

// --- verify ----------------------------------------------------------------

function verify() {
  const all = [];
  let articleOrderOk = true;
  for (const { rel, ex } of clozeFiles()) {
    for (const b of blanksOf(ex)) {
      if (b.ordered) {
        // Articles must stay in their canonical order: the lowercased option
        // list should be non-decreasing against a known ranking where present.
        if (!articlesInOrder(b.options)) {
          articleOrderOk = false;
          console.log(`✗ article order changed in ${rel}: [${b.options.join(", ")}]`);
        }
      } else {
        all.push(b);
      }
    }
  }

  const s = stats(all);
  console.log("=== free-order answer positions after rebalance ===");
  const max = Math.max(0, ...s.hist);
  s.hist.forEach((c, i) =>
    console.log(`  position ${i + 1}: ${String(c).padStart(4)} ${bar(c, max)}`)
  );

  // Random ⇒ first-position rate sits near the fair-shuffle expectation, and no
  // single position dominates. Tolerances are generous: this is a sanity check,
  // not a statistical proof.
  const drift = Math.abs(s.firstRate - s.expectedRate);
  const fairFirst = drift <= 0.07;
  const topShare = max / s.n;
  const noDominant = topShare <= s.expectedRate + 0.1;

  console.log(
    `\n  free blanks: ${s.n}` +
    `  | answer-first ${(s.firstRate * 100).toFixed(1)}%  (fair ≈ ${(s.expectedRate * 100).toFixed(1)}%, drift ${(drift * 100).toFixed(1)}pp)` +
    `  | busiest position ${(topShare * 100).toFixed(1)}%`
  );

  const ok = fairFirst && noDominant && articleOrderOk;
  console.log(ok
    ? "\n✓ PASS — free-order answer positions look random; article order preserved."
    : "\n✗ FAIL — positions still skewed or article order disturbed.");
  process.exit(ok ? 0 : 1);
}

// English a<an<the<—, French le<la<l'<les. We only check that present tokens
// keep their relative order; absent ones are fine.
const RANK = { "a": 0, "an": 1, "the": 2, "—": 3, "le": 0, "la": 1, "l'": 2, "les": 3 };
function articlesInOrder(options) {
  const ranks = options.map((o) => RANK[o.toLowerCase()]).filter((r) => r !== undefined);
  for (let i = 1; i < ranks.length; i++) if (ranks[i] < ranks[i - 1]) return false;
  return true;
}

// --- dispatch --------------------------------------------------------------

if (mode === "--fix") fix();
else if (mode === "--verify") verify();
else report();
