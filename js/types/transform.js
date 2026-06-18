// Transform exercise type: show a source sentence and an instruction, the
// learner rewrites it (e.g. into another tense), and we compare the free text
// against one or more accepted answers. Like cloze, this module is the only
// place that knows the transform item shape — the engine stays generic.
//
// Item shape:
//   { prompt, instruction?, answer (string | string[]), placeholder?, explanation }

import { t } from "../i18n.js";

// Loosely normalise free text so trivial differences don't count as wrong:
// trim, collapse inner whitespace, drop trailing sentence punctuation, lowercase.
function norm(s) {
  return s.trim().replace(/\s+/g, " ").replace(/[.!?]+$/, "").toLowerCase();
}

export function render(item) {
  const wrap = document.createElement("div");
  wrap.className = "transform";

  wrap.append(Object.assign(document.createElement("p"), {
    className: "prompt",
    textContent: item.prompt,
  }));
  if (item.instruction) {
    wrap.append(Object.assign(document.createElement("p"), {
      className: "instruction",
      textContent: item.instruction,
    }));
  }

  const input = document.createElement("input");
  input.type = "text";
  input.dataset.blank = 0; // engine reads input generically via data-blank
  input.autocomplete = "off";
  input.spellcheck = false;
  if (item.placeholder) input.placeholder = item.placeholder;
  wrap.append(input);

  return wrap;
}

// input: [typedText]. Accepts any of the listed answers. On a miss we ask the
// engine to reveal the primary expected answer (a UI string, from i18n).
export function check(item, input) {
  const given = input[0] ?? "";
  const answers = Array.isArray(item.answer) ? item.answer : [item.answer];
  const correct = answers.some((a) => norm(a) === norm(given));
  return {
    correct,
    blanks: [{ correct, expected: answers[0], given }],
    reveal: correct ? null : t("answerWas", answers[0]),
  };
}
