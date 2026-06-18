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

// "No article" answer. It's the implicit default: rather than spend a whole
// chip on it, we drop the chip and treat an untouched widget as this choice.
// It still lives in the JSON options/answer — only its chip is hidden.
const NONE = "—";

// Build the chip group (segmented control) for one blank. The chosen value
// lives on the group's data-value so the engine can read it generically.
function makeBlank(item, blankIndex) {
  const blank = item.blanks[blankIndex];
  const group = document.createElement("span");
  group.className = "blank";
  group.dataset.blank = blankIndex;
  if (blank.hint) group.title = blank.hint; // hint shows on hover

  // When "no article" is an option, it's the default — start the widget on it
  // so an untouched blank reads as that choice (and counts as answered).
  const hasNone = blank.options.includes(NONE);
  if (hasNone) group.dataset.value = NONE;

  for (const opt of blank.options) {
    if (opt === NONE) continue; // the default needs no chip
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.textContent = opt;
    chip.addEventListener("click", () => {
      const wasSelected = chip.classList.contains("selected");
      group.querySelectorAll(".chip").forEach((c) => c.classList.remove("selected"));
      if (wasSelected) {
        // Tap a selected chip again to clear it: back to the default.
        if (hasNone) group.dataset.value = NONE;
        else delete group.dataset.value;
      } else {
        chip.classList.add("selected");
        group.dataset.value = opt;
      }
    });
    group.append(chip);
  }
  return group;
}

// Build the sentence, placing a chip group where each blank goes. To stop the
// option widget from stranding alone at a line end, the blank and one
// neighbouring word are wrapped together in a single nowrap box (.glue). An
// NBSP across an element boundary is unreliable \u2014 browsers still allow a break
// between an atomic inline (the widget) and the following text node \u2014 so we make
// the whole unit one unbreakable box instead.
//
// Direction: glue to the FOLLOWING word by default (articles, prepositions,
// modals govern the word after them). When nothing meaningful follows (end of
// sentence, or only punctuation), glue to the PRECEDING word instead
// (e.g. "This book is ___.").
export function render(item) {
  const p = document.createElement("p");
  p.className = "cloze";

  const toks = tokenize(item.text);

  const gluesForward = (blankIndex) => {
    const next = toks[blankIndex + 1];
    if (!next || next.text === undefined) return false; // another blank or nothing
    const rest = next.text.replace(/^\s+/, "");
    return rest !== "" && !".,?!;:".includes(rest[0]);
  };

  for (let i = 0; i < toks.length; i++) {
    const tok = toks[i];

    // Plain text. Drop the word a neighbouring blank has pulled into its .glue
    // box so it isn't rendered twice.
    if (tok.text !== undefined) {
      let text = tok.text;
      // First word was consumed by a preceding forward-glued blank.
      if (i > 0 && toks[i - 1].blank !== undefined && gluesForward(i - 1)) {
        text = text.replace(/^\s*\S+/, "");
      }
      // Last word will be consumed by a following backward-glued blank.
      if (i + 1 < toks.length && toks[i + 1].blank !== undefined && !gluesForward(i + 1)) {
        text = text.replace(/\S+\s*$/, "");
      }
      if (text) p.append(document.createTextNode(text));
      continue;
    }

    // A blank: wrap it with its glued word in one unbreakable box.
    const glue = document.createElement("span");
    glue.className = "glue";

    if (gluesForward(i)) {
      // "[widget]\u00A0word" \u2014 and offer a break point before the whole unit.
      const word = toks[i + 1].text.match(/^\s*(\S+)/)[1];
      glue.append(makeBlank(item, tok.blank), document.createTextNode("\u00A0" + word));
      p.append(document.createElement("wbr"), glue);
    } else {
      // "word\u00A0[widget]" \u2014 held to the word before it (no leading break point).
      const prev = toks[i - 1];
      const word = prev && prev.text !== undefined ? (prev.text.match(/(\S+)\s*$/)?.[1] ?? "") : "";
      if (word) glue.append(document.createTextNode(word + "\u00A0"));
      glue.append(makeBlank(item, tok.blank));
      p.append(glue);
    }
  }

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
      let shown = false;
      group.querySelectorAll(".chip").forEach((chip) => {
        if (chip.textContent === b.expected) { chip.classList.add("answer"); shown = true; }
      });
      // The correct answer may be the hidden default ("no article"): surface it
      // as a read-only chip so the learner still sees what was expected.
      if (!shown) {
        const tag = document.createElement("span");
        tag.className = "chip answer";
        tag.textContent = b.expected;
        group.append(tag);
      }
    }
  });
}
