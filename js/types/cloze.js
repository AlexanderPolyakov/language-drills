// Cloze exercise type: a sentence with one or more numbered blanks ({1}, {2}…).
// Each blank is rendered as a dropdown of options; the learner picks one per
// blank. This module is the ONLY place that knows how a cloze item looks —
// the engine stays generic and just calls render(item) and check(item, input).

import { t } from "../i18n.js";

// Split "She is {1} honest … {2} university." into an ordered list of plain-text
// segments and blank references. Blanks are 1-based in JSON, 0-based here.
function tokenize(text) {
  const parts = [];
  let last = 0;
  const re = /\{(\d+)\}/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push({ text: text.slice(last, m.index) });
    parts.push({ blank: Number(m[1]) - 1 });
    last = re.lastIndex;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts;
}

// Build the sentence with a <select> in place of each blank. Inputs carry a
// data-blank index so the engine can read them back generically.
export function render(item) {
  const p = document.createElement("p");
  p.className = "cloze";

  for (const tok of tokenize(item.text)) {
    if (tok.text !== undefined) {
      p.append(document.createTextNode(tok.text));
      continue;
    }
    const blank = item.blanks[tok.blank];
    const select = document.createElement("select");
    select.dataset.blank = tok.blank;
    if (blank.hint) select.title = blank.hint; // hint shows on hover

    const placeholder = new Option(t("chooseBlank"), "");
    placeholder.disabled = true;
    placeholder.selected = true;
    select.add(placeholder);
    for (const opt of blank.options) select.add(new Option(opt, opt));

    p.append(select);
  }

  return p;
}

// input: array of chosen strings, indexed by blank position. Returns a result
// the engine renders generically: an overall flag plus per-blank detail.
export function check(item, input) {
  const blanks = item.blanks.map((b, i) => ({
    correct: input[i] === b.answer,
    expected: b.answer,
    given: input[i] ?? "",
  }));
  return { correct: blanks.every((b) => b.correct), blanks };
}
