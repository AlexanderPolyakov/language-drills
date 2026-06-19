// Fill exercise type: a sentence with one or more numbered blanks ({1}, {2}…),
// each shown as a small text input with a cue in parentheses — the language
// workbook pattern "I (go) ___ to the park", where the cue is the base form and
// the learner types the right form. Unlike `transform`, the learner writes only
// the changed word(s), not the whole sentence, so there's far less to type and
// far less to normalise. This module is the only place that knows the fill item
// shape; the engine stays generic and calls render / check / mark.
//
// Item shape:
//   { text: "He {1} in a bank.",
//     blanks: [ { cue: "work", answer: "worked" | ["worked", …], hint? } ],
//     explanation }

// Split "He {1} in a bank." into an ordered list of plain-text segments and
// blank references. Blanks are 1-based in JSON, 0-based here.
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

const answersOf = (blank) => (Array.isArray(blank.answer) ? blank.answer : [blank.answer]);

// Build the input widget for one blank: a cue in parentheses next to a text box,
// kept together on one line so the unit never splits across a line break. The
// box is sized to fit the longest accepted answer so it reads like a real gap.
function makeBlank(item, blankIndex) {
  const blank = item.blanks[blankIndex];
  const glue = document.createElement("span");
  glue.className = "glue";

  const cue = document.createElement("span");
  cue.className = "cue";
  cue.textContent = `(${blank.cue})`;

  const input = document.createElement("input");
  input.type = "text";
  input.className = "gap";
  input.dataset.blank = blankIndex; // engine reads input generically via data-blank
  input.autocomplete = "off";
  input.autocapitalize = "off";
  input.spellcheck = false;
  if (blank.hint) input.title = blank.hint; // hint shows on hover
  const widest = Math.max(blank.cue.length, ...answersOf(blank).map((a) => a.length));
  input.size = widest + 1;

  glue.append(cue, document.createTextNode(" "), input);
  return glue;
}

export function render(item) {
  const p = document.createElement("p");
  p.className = "fill";

  for (const tok of tokenize(item.text)) {
    if (tok.text !== undefined) {
      p.append(document.createTextNode(tok.text));
    } else {
      // Offer a break point before each self-contained gap unit.
      p.append(document.createElement("wbr"), makeBlank(item, tok.blank));
    }
  }
  return p;
}

// Loosely normalise free text so trivial differences don't count as wrong:
// trim, collapse inner whitespace, drop trailing sentence punctuation, lowercase.
function norm(s) {
  return s.trim().replace(/\s+/g, " ").replace(/[.!?]+$/, "").toLowerCase();
}

// input: array of typed strings, indexed by blank position. Each blank accepts
// any of its listed answers.
export function check(item, input) {
  const blanks = item.blanks.map((b, i) => {
    const given = input[i] ?? "";
    const accepted = answersOf(b);
    return {
      correct: accepted.some((a) => norm(a) === norm(given)),
      expected: accepted[0],
      given,
    };
  });
  return { correct: blanks.every((b) => b.correct), blanks };
}

// Paint feedback on each input: tint it ok/bad, lock it, and on a miss show the
// expected answer right after the gap so the learner sees the correct form.
export function mark(body, result) {
  body.querySelectorAll(".gap").forEach((input) => {
    const b = result.blanks[Number(input.dataset.blank)];
    input.classList.toggle("ok", b.correct);
    input.classList.toggle("bad", !b.correct);
    if (!b.correct) {
      const tag = document.createElement("span");
      tag.className = "answer";
      tag.textContent = b.expected;
      input.after(tag);
    }
  });
}
