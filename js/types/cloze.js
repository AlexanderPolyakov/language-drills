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

  // Keep each blank glued to a neighbouring word so the option widget never
  // strands alone at a line end. Default: glue to the FOLLOWING word (articles,
  // prepositions, modals: the answer comes before the word it governs). But
  // when nothing meaningful follows (end of sentence, or only punctuation),
  // glue to the PRECEDING word instead (e.g. "This book is ___.").
  const gluesForward = (blankIndex) => {
    const next = toks[blankIndex + 1];
    if (!next || next.text === undefined) return false; // another blank or nothing
    const rest = next.text.replace(/^\s+/, "");
    return rest !== "" && !".,?!;:".includes(rest[0]);
  };

  toks.forEach((tok, i) => {
    if (tok.text !== undefined) {
      let text = tok.text;
      // Glue forward: this text follows a blank that attaches to its next word.
      if (i > 0 && toks[i - 1].blank !== undefined && gluesForward(i - 1)) {
        text = text.replace(/^\s+/, "\u00A0");
      }
      // Glue backward: this text precedes a blank that has no following word.
      if (i + 1 < toks.length && toks[i + 1].blank !== undefined && !gluesForward(i + 1)) {
        text = text.replace(/\s+$/, "\u00A0");
      }
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
    // For a forward-glued blank, offer a break point *before* it so the whole
    // "[blank] word" unit can drop to the next line. A backward-glued blank is
    // already held to the preceding word, so no <wbr> is added there.
    if (gluesForward(i)) {
      p.append(document.createElement("wbr"));
    }
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
