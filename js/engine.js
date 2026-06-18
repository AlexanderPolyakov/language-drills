// The generic engine. It renders an exercise and checks answers by dispatching
// on the exercise `type`. Adding new CONTENT requires no changes here. Adding a
// new TYPE means registering one module that exposes render(item) and
// check(item, input) — see js/types/cloze.js for the contract.

import { t } from "./i18n.js";
import * as cloze from "./types/cloze.js";
import * as transform from "./types/transform.js";

// Type registry. A new exercise type is added here as one module exposing
// render(item) and check(item, input). multiple-choice arrives later.
const types = {
  cloze,
  transform,
};

// Read the learner's input from a rendered item, generically: every element
// marked with data-blank contributes its value at that index. Any type that
// follows the data-blank convention works without the engine knowing its shape.
function readInput(itemEl) {
  const input = [];
  itemEl.querySelectorAll("[data-blank]").forEach((el) => {
    input[Number(el.dataset.blank)] = el.value;
  });
  return input;
}

// Render one item: the type-specific body, plus feedback and explanation slots
// that stay hidden until the item is checked. Returns the wrapper element with
// a _check() method attached for the global Check button to call.
function renderItem(item) {
  const type = types[item.type];
  if (!type) throw new Error(`Unknown exercise type: ${item.type}`);

  const wrap = document.createElement("section");
  wrap.className = "item";

  const body = type.render(item);
  wrap.append(body);

  const feedback = document.createElement("p");
  feedback.className = "feedback";
  feedback.hidden = true;

  // Optional extra detail a type can surface on a miss (e.g. the expected
  // answer for a free-text transform). Generic: just a string from the result.
  const reveal = document.createElement("p");
  reveal.className = "reveal";
  reveal.hidden = true;

  const explanation = document.createElement("p");
  explanation.className = "explanation";
  explanation.hidden = true;
  explanation.append(
    Object.assign(document.createElement("strong"), { textContent: `${t("explanation")}: ` }),
    document.createTextNode(item.explanation),
  );

  wrap.append(feedback, reveal, explanation);

  // Check this single item: collect input, ask the type module, then paint
  // feedback. Returns whether the item was fully correct.
  wrap._check = () => {
    const result = type.check(item, readInput(body));

    // Mark each input correct/incorrect via the same data-blank mapping.
    if (result.blanks) {
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
    return result.correct;
  };

  return wrap;
}

// Render a whole exercise into `root` and wire the Check button. `onComplete`,
// if given, is called with { correct, total } each time the learner checks —
// the app uses it to persist progress and show results. The engine itself
// stays unaware of storage or navigation.
export function renderExercise(exercise, root, { onComplete } = {}) {
  root.replaceChildren();

  root.append(Object.assign(document.createElement("h2"), { textContent: exercise.title }));

  const items = exercise.items.map((item) => renderItem({ ...item, type: exercise.type }));
  for (const el of items) root.append(el);

  const checkBtn = Object.assign(document.createElement("button"), {
    className: "check",
    textContent: t("check"),
  });
  const score = Object.assign(document.createElement("p"), { className: "score", hidden: true });
  root.append(checkBtn, score);

  checkBtn.addEventListener("click", () => {
    const correct = items.reduce((n, el) => n + (el._check() ? 1 : 0), 0);
    score.textContent = t("score", correct, items.length);
    score.hidden = false;
    onComplete?.({ correct, total: items.length });
  });
}
