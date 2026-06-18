// The generic engine. It runs an exercise one item at a time, in random order,
// giving feedback after each answer before moving on. It stays generic by
// dispatching on the exercise `type` via the registry in ./types/index.js. A
// type is one module exposing render(item) and check(item, input), plus an
// optional mark(body, result) that paints its own feedback. Adding CONTENT
// needs no changes here.
//
// SESSION_SIZE caps how many items to present per run. When a pool has more,
// we take a random sample so a session stays ~10 minutes rather than open-ended.
const SESSION_SIZE = 15;

import { t } from "./i18n.js";
import { types } from "./types/index.js";

// Fisher–Yates shuffle (returns a copy).
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Read the learner's input generically: each [data-blank] contributes its
// value. Chip groups expose the choice via data-value; text inputs use .value.
function readInput(itemEl) {
  const input = [];
  itemEl.querySelectorAll("[data-blank]").forEach((el) => {
    input[Number(el.dataset.blank)] = el.value ?? el.dataset.value ?? "";
  });
  return input;
}

// Has every blank been answered? Used to enable Check only once it's possible.
function isAnswered(itemEl) {
  const blanks = [...itemEl.querySelectorAll("[data-blank]")];
  return blanks.length > 0 && blanks.every((el) => (el.value ?? el.dataset.value ?? "") !== "");
}

// Build one item: its type-specific body plus hidden feedback/explanation.
// Returns { el, body, check } where check() grades, paints feedback, locks the
// item against further input, and returns whether it was correct.
function buildItem(item) {
  const type = types[item.type];
  if (!type) throw new Error(`Unknown exercise type: ${item.type}`);

  const wrap = document.createElement("section");
  wrap.className = "item";

  const body = type.render(item);
  wrap.append(body);

  const feedback = Object.assign(document.createElement("p"), { className: "feedback", hidden: true });
  // Optional extra detail a type can surface on a miss (e.g. the expected
  // answer for a free-text transform). Generic: just a string from the result.
  const reveal = Object.assign(document.createElement("p"), { className: "reveal", hidden: true });
  const explanation = Object.assign(document.createElement("p"), { className: "explanation", hidden: true });
  explanation.append(
    Object.assign(document.createElement("strong"), { textContent: `${t("explanation")}: ` }),
    document.createTextNode(item.explanation),
  );
  wrap.append(feedback, reveal, explanation);

  function check() {
    const result = type.check(item, readInput(body));

    // A type may paint its own feedback; otherwise paint the [data-blank]s.
    if (type.mark) {
      type.mark(body, result);
    } else if (result.blanks) {
      body.querySelectorAll("[data-blank]").forEach((el) => {
        const b = result.blanks[Number(el.dataset.blank)];
        el.classList.toggle("ok", !!b?.correct);
        el.classList.toggle("bad", !!b && !b.correct);
      });
    }

    feedback.textContent = result.correct ? t("correct") : t("incorrect");
    feedback.classList.toggle("ok", result.correct);
    feedback.classList.toggle("bad", !result.correct);
    feedback.hidden = false;

    const detail = !result.correct && result.reveal ? result.reveal : "";
    reveal.textContent = detail;
    reveal.hidden = !detail;

    explanation.hidden = false;

    // Lock the item once answered.
    wrap.classList.add("checked");
    body.querySelectorAll("button, input").forEach((el) => { el.disabled = true; });
    return result.correct;
  }

  return { el: wrap, body, check };
}

// Run the exercise: one random item at a time, feedback, then Continue/Finish.
// `onComplete`, if given, is called with { correct, total } at the end (the app
// uses it to persist progress and show its own results screen). Without it, the
// engine shows a simple built-in summary with a Try again button.
export function renderExercise(exercise, root, { onComplete } = {}) {
  root.replaceChildren();
  root.append(Object.assign(document.createElement("h2"), { textContent: exercise.title }));

  // item.type overrides exercise.type so mixed-pool sessions work without engine changes.
  const all = shuffle(exercise.items.map((item) => ({ ...item, type: item.type ?? exercise.type })));
  const order = all.slice(0, SESSION_SIZE);
  const total = order.length;
  let index = 0;
  let correct = 0;

  const progress = Object.assign(document.createElement("p"), { className: "progress" });
  const stage = Object.assign(document.createElement("div"), { className: "stage" });
  const controls = Object.assign(document.createElement("div"), { className: "controls" });
  const actionBtn = Object.assign(document.createElement("button"), { className: "action", type: "button" });
  controls.append(actionBtn);
  root.append(progress, stage, controls);

  let current = null;

  function showItem() {
    progress.textContent = t("progress", index + 1, total);
    stage.replaceChildren();
    current = buildItem(order[index]);
    stage.append(current.el);

    actionBtn.textContent = t("check");
    actionBtn.disabled = true;
    actionBtn.onclick = onCheck;

    const refresh = () => { actionBtn.disabled = !isAnswered(current.body); };
    current.body.addEventListener("click", refresh);
    current.body.addEventListener("input", refresh);
  }

  function onCheck() {
    if (current.check()) correct++;
    const last = index === total - 1;
    actionBtn.textContent = last ? t("finish") : t("continue");
    actionBtn.disabled = false;
    actionBtn.onclick = onNext;
  }

  function onNext() {
    index++;
    if (index < total) showItem();
    else finish();
  }

  function finish() {
    progress.textContent = "";
    controls.replaceChildren();
    stage.replaceChildren();
    if (onComplete) { onComplete({ correct, total }); return; }

    // Built-in fallback summary (used before the app provides a results screen).
    const card = document.createElement("section");
    card.className = "results";
    card.append(Object.assign(document.createElement("p"), {
      className: "results-score",
      textContent: t("score", correct, total),
    }));
    const again = Object.assign(document.createElement("button"), {
      className: "action", type: "button", textContent: t("tryAgain"),
    });
    again.onclick = () => renderExercise(exercise, root);
    card.append(again);
    stage.append(card);
  }

  showItem();
}
