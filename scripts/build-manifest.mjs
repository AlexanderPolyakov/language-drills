// Dev utility (not shipped to the page): validate every content JSON file and
// regenerate content/manifest.json from the files themselves, so the manifest
// can never drift from the content. Run: node scripts/build-manifest.mjs
//
// Validation mirrors what the engine/type modules actually require:
//  - top-level: id, lang, topic, level, type, title, items[]
//  - type is one the registry knows (cloze | fill | transform)
//  - every item has a non-empty explanation
//  - cloze/fill: number of {n} placeholders == number of blanks
//  - cloze: each blank's answer is one of its options
//  - fill: each blank has a cue and a non-empty answer
//  - transform: a non-empty answer
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const CONTENT = join(ROOT, "content");
const CEFR = ["A1", "A2", "B1", "B2", "C1", "C2"];
const TYPES = new Set(["cloze", "fill", "transform"]);
// Language display names + the order languages appear in the manifest.
const LANGS = [["en", "English"], ["fr", "Français"]];

const placeholders = (text) =>
  new Set([...String(text ?? "").matchAll(/\{(\d+)\}/g)].map((m) => Number(m[1])));

const errors = [];
const summary = [];

function validateItem(file, i, type, item) {
  const where = `${file} item[${i}]`;
  if (!item.explanation || !String(item.explanation).trim())
    errors.push(`${where}: missing explanation`);

  if (type === "cloze" || type === "fill") {
    const blanks = item.blanks ?? [];
    const ph = placeholders(item.text);
    if (ph.size !== blanks.length)
      errors.push(`${where}: ${ph.size} placeholders but ${blanks.length} blanks`);
    blanks.forEach((b, bi) => {
      if (type === "cloze") {
        if (!Array.isArray(b.options) || b.options.length < 2)
          errors.push(`${where}.blank[${bi}]: needs >=2 options`);
        else if (!b.options.includes(b.answer))
          errors.push(`${where}.blank[${bi}]: answer "${b.answer}" not in options [${b.options}]`);
      } else {
        const ans = Array.isArray(b.answer) ? b.answer : [b.answer];
        if (!b.cue || !String(b.cue).trim()) errors.push(`${where}.blank[${bi}]: missing cue`);
        if (String(b.cue ?? "").includes("(")) errors.push(`${where}.blank[${bi}]: cue contains '(' which the renderer already adds`);
        if (!ans.length || ans.some((a) => !String(a ?? "").trim()))
          errors.push(`${where}.blank[${bi}]: empty answer`);
      }
    });
  } else if (type === "transform") {
    const ans = Array.isArray(item.answer) ? item.answer : [item.answer];
    if (!ans.length || ans.some((a) => !String(a ?? "").trim()))
      errors.push(`${where}: empty answer`);
  }
}

const languages = LANGS.map(([code, name]) => {
  const dir = join(CONTENT, code);
  const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
  const entries = [];
  for (const f of files) {
    const rel = `${code}/${f}`;
    let ex;
    try {
      ex = JSON.parse(readFileSync(join(dir, f), "utf8"));
    } catch (e) {
      errors.push(`${rel}: invalid JSON — ${e.message}`);
      continue;
    }
    for (const k of ["id", "lang", "topic", "level", "type", "title"])
      if (!ex[k]) errors.push(`${rel}: missing top-level "${k}"`);
    if (ex.lang !== code) errors.push(`${rel}: lang "${ex.lang}" != folder "${code}"`);
    if (!TYPES.has(ex.type)) errors.push(`${rel}: unknown type "${ex.type}"`);
    if (!CEFR.includes(ex.level)) errors.push(`${rel}: bad level "${ex.level}"`);
    if (!Array.isArray(ex.items) || ex.items.length === 0)
      errors.push(`${rel}: no items`);
    else ex.items.forEach((it, i) => validateItem(rel, i, ex.type, it));

    entries.push({ id: ex.id, topic: ex.topic, level: ex.level, title: ex.title, file: rel, count: ex.items?.length ?? 0 });
  }

  // Stable manifest order: by CEFR level, then topic name, then id.
  entries.sort((a, b) =>
    CEFR.indexOf(a.level) - CEFR.indexOf(b.level) ||
    a.topic.localeCompare(b.topic) ||
    a.id.localeCompare(b.id));

  summary.push(`${code}: ${entries.length} exercises, ${entries.reduce((s, e) => s + e.count, 0)} items`);
  return { code, name, exercises: entries };
});

// Duplicate id check across everything.
const ids = languages.flatMap((l) => l.exercises.map((e) => e.id));
const dups = ids.filter((id, i) => ids.indexOf(id) !== i);
if (dups.length) errors.push(`duplicate ids: ${[...new Set(dups)].join(", ")}`);

if (errors.length) {
  console.error(`VALIDATION FAILED (${errors.length}):`);
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}

writeFileSync(join(CONTENT, "manifest.json"), JSON.stringify({ languages }, null, 2) + "\n");
console.log("OK — manifest regenerated.");
for (const s of summary) console.log("  " + s);
