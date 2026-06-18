// Bootstrap. Phase 1 loads a single exercise by a fixed path; Phase 2 replaces
// this with manifest-driven menu routing. The path is config, not content —
// the exercise itself still lives entirely in the JSON file.

import { renderExercise } from "./engine.js";
import { t } from "./i18n.js";

const EXERCISE_URL = "content/en/articles-basic.json";

async function main() {
  document.getElementById("app-title").textContent = t("appTitle");
  document.title = t("appTitle");

  const res = await fetch(EXERCISE_URL);
  if (!res.ok) throw new Error(`Failed to load ${EXERCISE_URL}: ${res.status}`);
  const exercise = await res.json();

  renderExercise(exercise, document.getElementById("app"));
}

main().catch((err) => {
  document.getElementById("app").textContent = String(err);
  console.error(err);
});
