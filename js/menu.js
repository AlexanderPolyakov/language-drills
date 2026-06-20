// Menu + routing. Reads the content manifest and lets the learner browse by
// language → level → category → exercise, then hands the chosen exercise to the
// generic engine. The level and category screens carry inline switchers so the
// learner can change either facet without walking back up the tree. This is
// app-level navigation; the engine and the type modules are untouched. Routing
// is hash-based so it works on static hosting (GitHub Pages) and URLs are
// bookmarkable.

// CEFR levels in ascending order, used to present levels consistently regardless
// of the order exercises happen to appear in the manifest.
const CEFR = ["A1", "A2", "B1", "B2", "C1", "C2"];

import { renderExercise } from "./engine.js";
import { t } from "./i18n.js";
import * as progress from "./progress.js";

const MANIFEST_URL = "content/manifest.json";
const CONTENT_BASE = "content/";

let manifest = null;
let root = null;

export async function start(mountEl) {
  root = mountEl;
  const res = await fetch(MANIFEST_URL);
  if (!res.ok) throw new Error(`Failed to load manifest: ${res.status}`);
  manifest = await res.json();

  window.addEventListener("hashchange", route);
  route();
}

// "#/en/A2/articles" → ["en", "A2", "articles"].
function path() {
  const h = location.hash.replace(/^#\/?/, "");
  return h ? h.split("/").filter(Boolean) : [];
}

function lang(code) {
  return manifest.languages.find((l) => l.code === code);
}

// Levels a language offers, in CEFR order.
function levelsOf(l) {
  return CEFR.filter((lv) => l.exercises.some((e) => e.level === lv));
}

// Categories (topics) available at a given level, in manifest order.
function categoriesAt(l, level) {
  return uniq(l.exercises.filter((e) => e.level === level), "topic");
}

function route() {
  const parts = path();

  // Exercise route: #/x/<exercise-id>
  if (parts[0] === "x" && parts[1]) return showExercise(parts[1]);

  // Mixed drill route: #/r/<lang-code>/<level>
  if (parts[0] === "r" && parts[1] && parts[2]) return showRandomSession(parts[1], parts[2]);

  const [code, level, topic] = parts;
  if (!code) return showLanguages();
  if (!level) return showLevels(code);
  if (!topic) return showCategories(code, level);
  return showExercises(code, level, topic);
}

// --- rendering helpers -----------------------------------------------------

// A vertical list of links. Each entry: { href, label, note? } — note renders
// as a small muted badge (used to show best scores).
function list(entries) {
  const ul = document.createElement("ul");
  ul.className = "menu-list";
  for (const e of entries) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = e.href;
    if (e.featured) a.className = "featured";
    a.append(document.createTextNode(e.label));
    if (e.note) {
      a.append(Object.assign(document.createElement("span"), {
        className: "badge",
        textContent: e.note,
      }));
    }
    li.append(a);
    ul.append(li);
  }
  return ul;
}

// Breadcrumb / back link to a parent hash, plus a heading.
function screen(heading, backHref) {
  root.replaceChildren();
  if (backHref !== undefined) {
    const nav = document.createElement("nav");
    nav.className = "crumbs";
    const a = document.createElement("a");
    a.href = backHref;
    a.textContent = t("back");
    nav.append(a);
    root.append(nav);
  }
  // The exercise screen passes no heading — renderExercise supplies the title.
  if (heading) root.append(Object.assign(document.createElement("h2"), { textContent: heading }));
}

// Unique, order-preserving values pulled from a list of exercises.
function uniq(items, key) {
  return [...new Set(items.map((x) => x[key]))];
}

// A horizontal row of chips for switching one facet (level or category) in
// place. The active value renders as a plain highlighted chip; the others are
// links that change just that facet of the current route. hrefFor(value) maps a
// value to its destination hash.
function switcher(label, values, active, hrefFor) {
  const wrap = document.createElement("div");
  wrap.className = "switcher";
  wrap.append(Object.assign(document.createElement("span"), {
    className: "switcher-label",
    textContent: label,
  }));
  for (const v of values) {
    const isActive = v === active;
    const el = document.createElement(isActive ? "span" : "a");
    el.className = "switch-chip" + (isActive ? " active" : "");
    if (!isActive) el.href = hrefFor(v);
    el.textContent = v;
    wrap.append(el);
  }
  return wrap;
}

// --- screens ---------------------------------------------------------------

function showLanguages() {
  screen(t("chooseLanguage"));
  root.append(
    list(manifest.languages.map((l) => ({ href: `#/${l.code}`, label: l.name }))),
  );
}

// Load every exercise file for one level of a language, pool all items (each
// tagged with their type), and run a single mixed session through the engine.
// Mixing topics within a single level is useful practice; mixing levels is not,
// so the drill is scoped to a level rather than the whole language.
async function showRandomSession(code, level) {
  const l = lang(code);
  if (!l) return showLanguages();
  if (!levelsOf(l).includes(level)) return showLevels(code);

  const backHref = `#/${code}/${level}`;
  screen("", backHref);
  const body = document.createElement("div");
  root.append(body);

  // Fetch this level's exercise files in parallel.
  const atLevel = l.exercises.filter((e) => e.level === level);
  const files = await Promise.all(
    atLevel.map((e) => fetch(CONTENT_BASE + e.file).then((r) => r.json()))
  );

  // Pool items, tagging each with its exercise type so the engine can dispatch.
  const allItems = [];
  for (const ex of files) {
    for (const item of ex.items) {
      allItems.push({ ...item, type: ex.type, caption: ex.title });
    }
  }

  const synthetic = { type: null, title: `${t("randomDrill")} · ${level}`, items: allItems };
  renderExercise(synthetic, body, {
    onComplete: ({ correct, total }) => {
      showResults(correct, total, backHref, () => showRandomSession(code, level));
    },
  });
}

// First facet after picking a language: the level.
function showLevels(code) {
  const l = lang(code);
  if (!l) return showLanguages();
  screen(`${l.name} — ${t("chooseLevel")}`, "#/");
  root.append(
    list(levelsOf(l).map((level) => ({ href: `#/${code}/${level}`, label: level }))),
  );
}

// Second facet: the category, shown for the chosen level. A level switcher lets
// the learner jump to another level without going back. The mixed drill is
// featured at the top here — it pools every topic at this level into one
// session.
function showCategories(code, level) {
  const l = lang(code);
  if (!l) return showLanguages();
  if (!levelsOf(l).includes(level)) return showLevels(code);
  screen(`${l.name} · ${level} — ${t("chooseCategory")}`, `#/${code}`);
  root.append(switcher(t("level"), levelsOf(l), level, (lv) => `#/${code}/${lv}`));
  const entries = [
    { href: `#/r/${code}/${level}`, label: t("randomDrill"), featured: true },
    ...categoriesAt(l, level).map((topic) => ({ href: `#/${code}/${level}/${topic}`, label: topic })),
  ];
  root.append(list(entries));
}

function showExercises(code, level, topic) {
  const l = lang(code);
  if (!l) return showLanguages();
  const matches = l.exercises.filter((e) => e.level === level && e.topic === topic);
  if (!matches.length) return showCategories(code, level);
  screen(`${topic} · ${level} — ${t("chooseExercise")}`, `#/${code}/${level}`);

  // Switch level (keeping the category where it also exists, else fall back to
  // that level's category list) or switch category within the current level.
  root.append(switcher(t("level"), levelsOf(l), level, (lv) =>
    categoriesAt(l, lv).includes(topic) ? `#/${code}/${lv}/${topic}` : `#/${code}/${lv}`,
  ));
  root.append(switcher(t("category"), categoriesAt(l, level), topic, (tp) => `#/${code}/${level}/${tp}`));

  root.append(
    list(matches.map((e) => {
      const p = progress.get(e.id);
      return { href: `#/x/${e.id}`, label: e.title, note: p ? t("best", p.best, p.total) : "" };
    })),
  );
}

async function showExercise(id) {
  // Find the exercise's manifest entry across all languages.
  let entry, parentCode;
  for (const l of manifest.languages) {
    const found = l.exercises.find((e) => e.id === id);
    if (found) { entry = found; parentCode = l.code; break; }
  }
  if (!entry) return showLanguages();

  const res = await fetch(CONTENT_BASE + entry.file);
  if (!res.ok) throw new Error(`Failed to load ${entry.file}: ${res.status}`);
  const exercise = await res.json();

  screen("", `#/${parentCode}/${entry.level}/${entry.topic}`);
  const body = document.createElement("div");
  root.append(body);

  const levelHref = `#/${parentCode}/${entry.level}/${entry.topic}`;
  renderExercise(exercise, body, {
    onComplete: ({ correct, total }) => {
      progress.record(entry.id, correct, total);
      showResults(correct, total, levelHref, () => showExercise(id));
    },
  });
}

// A small results card shown after checking: the score plus a way to retry or
// return to the menu. Replaces any previous card so re-checking stays tidy.
function showResults(correct, total, backHref, onRetry) {
  root.querySelector(".results")?.remove();

  const card = document.createElement("section");
  card.className = "results";
  card.append(
    Object.assign(document.createElement("h3"), { textContent: t("results") }),
    Object.assign(document.createElement("p"), {
      className: "results-score",
      textContent: correct === total ? t("perfect") : t("youScored", correct, total),
    }),
  );

  const actions = document.createElement("div");
  actions.className = "results-actions";

  const retry = Object.assign(document.createElement("button"), { textContent: t("tryAgain") });
  retry.addEventListener("click", onRetry);

  const menuLink = Object.assign(document.createElement("a"), {
    href: backHref,
    className: "button-link",
    textContent: t("backToMenu"),
  });

  actions.append(retry, menuLink);
  card.append(actions);
  root.append(card);
  card.scrollIntoView({ behavior: "smooth", block: "nearest" });
}
