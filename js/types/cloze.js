// Cloze exercise type: a sentence with one or more numbered blanks ({1}, {2}…).
// Each blank renders as a row of tappable option chips (one tap to answer — no
// dropdowns). This module is the only place that knows the cloze item shape;
// the engine stays generic and calls render / check / mark.

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

// Build the sentence with a chip group in place of each blank. The chosen value
// lives on the group's data-value so the engine can read it generically.
export function render(item) {
  const p = document.createElement("p");
  p.className = "cloze";

  const toks = tokenize(item.text);
  toks.forEach((tok, i) => {
    if (tok.text !== undefined) {
      // If this text directly follows a blank, glue its first word to the
      // group with a non-breaking space so the answer (e.g. an article) never
      // gets stranded at the end of a line away from its noun.
      const followsBlank = i > 0 && toks[i - 1].blank !== undefined;
      const text = followsBlank ? tok.text.replace(/^\s+/, "\u00A0") : tok.text;
      p.append(document.createTextNode(text));
      return;
    }
    const blank = item.blanks[tok.blank];
    const group = document.createElement("span");
    group.className = "blank";
    group.dataset.blank = tok.blank;
    if (blank.hint) group.title = blank.hint; // hint shows on hover

    for (const opt of blank.options) {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip";
      chip.textContent = opt;
      chip.addEventListener("click", () => {
        group.dataset.value = opt;
        group.querySelectorAll(".chip").forEach((c) => c.classList.toggle("selected", c === chip));
      });
      group.append(chip);
    }
    // <wbr> gives the browser a preferred break point right before the blank
    // group, so a line break (if needed) lands before the widget rather than
    // awkwardly mid-sentence.
    p.append(document.createElement("wbr"));
    p.append(group);
  });

  return p;
}

// input: array of chosen strings, indexed by blank position.
export function check(item, input) {
  const blanks = item.blanks.map((b, i) => ({
    correct: input[i] === b.answer,
    expected: b.answer,
    given: input[i] ?? "",
  }));
  return { correct: blanks.every((b) => b.correct), blanks };
}

// Paint feedback on each blank: colour the chosen chip, and on a miss also
// highlight the chip that was the correct answer.
export function mark(body, result) {
  body.querySelectorAll(".blank").forEach((group) => {
    const b = result.blanks[Number(group.dataset.blank)];
    group.classList.toggle("ok", b.correct);
    group.classList.toggle("bad", !b.correct);
    if (!b.correct) {
      group.querySelectorAll(".chip").forEach((chip) => {
        if (chip.textContent === b.expected) chip.classList.add("answer");
      });
    }
  });
}
