// Menu + routing. Reads the content manifest and lets the learner browse by
// language → topic → level → exercise, then hands the chosen exercise to the
// generic engine. This is app-level navigation; the engine and the type modules
// are untouched. Routing is hash-based so it works on static hosting (GitHub
// Pages) and URLs are bookmarkable.

import { renderExercise } from "./engine.js";
import { t } from "./i18n.js";

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

// "#/en/articles/A2" → ["en", "articles", "A2"].
function path() {
  const h = location.hash.replace(/^#\/?/, "");
  return h ? h.split("/").filter(Boolean) : [];
}

function lang(code) {
  return manifest.languages.find((l) => l.code === code);
}

function route() {
  const parts = path();

  // Exercise route: #/x/<exercise-id>
  if (parts[0] === "x" && parts[1]) return showExercise(parts[1]);

  const [code, topic, level] = parts;
  if (!code) return showLanguages();
  if (!topic) return showTopics(code);
  if (!level) return showLevels(code, topic);
  return showExercises(code, topic, level);
}

// --- rendering helpers -----------------------------------------------------

// A vertical list of links. Each entry: { href, label }.
function list(entries) {
  const ul = document.createElement("ul");
  ul.className = "menu-list";
  for (const e of entries) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = e.href;
    a.textContent = e.label;
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

// --- screens ---------------------------------------------------------------

function showLanguages() {
  screen(t("chooseLanguage"));
  root.append(
    list(manifest.languages.map((l) => ({ href: `#/${l.code}`, label: l.name }))),
  );
}

function showTopics(code) {
  const l = lang(code);
  if (!l) return showLanguages();
  screen(`${l.name} — ${t("chooseTopic")}`, "#/");
  root.append(
    list(uniq(l.exercises, "topic").map((topic) => ({ href: `#/${code}/${topic}`, label: topic }))),
  );
}

function showLevels(code, topic) {
  const l = lang(code);
  if (!l) return showLanguages();
  const inTopic = l.exercises.filter((e) => e.topic === topic);
  screen(`${topic} — ${t("chooseLevel")}`, `#/${code}`);
  root.append(
    list(uniq(inTopic, "level").map((level) => ({ href: `#/${code}/${topic}/${level}`, label: level }))),
  );
}

function showExercises(code, topic, level) {
  const l = lang(code);
  if (!l) return showLanguages();
  const matches = l.exercises.filter((e) => e.topic === topic && e.level === level);
  screen(`${topic} · ${level} — ${t("chooseExercise")}`, `#/${code}/${topic}`);
  root.append(
    list(matches.map((e) => ({ href: `#/x/${e.id}`, label: e.title }))),
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

  screen("", `#/${parentCode}/${entry.topic}/${entry.level}`);
  const body = document.createElement("div");
  root.append(body);
  renderExercise(exercise, body);
}
