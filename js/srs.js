// Spaced-repetition tracking, per item — the "Anki card" of this app. Each item
// the learner sees gets its own little record in localStorage: how it's doing
// (an ease factor and interval, SM-2 style) and when it's next due. The engine
// uses select() to fill a session, biasing toward cards that are due, overdue,
// or simply hard — and calls review() after each answer to update the card.
//
// This is deliberately "SM-2 lite": we only ever know right vs wrong (there is
// no 1–5 self-grade), so the schedule is a simplified SuperMemo-2. Intervals are
// in days, so day-to-day use naturally resurfaces older material while a single
// sitting won't keep repeating something just answered.
//
// This per-item scheduling is the app's only persisted progress. Keys are stable
// strings of the form `<exercise-id>#<item-index>`, assigned by the caller, and
// the menu reads dueCount() off them to show a "<due>/<total> due" badge.

const KEY = "language-drills:srs";
const DAY = 86400000; // ms in a day

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {}; // corrupt or unavailable storage: behave as if empty
  }
}

function save(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Storage full or disabled (e.g. private mode): scheduling just won't persist.
  }
}

// A card the learner has never seen. `seen === 0` marks it as new so weight()
// can treat it specially (new material should get introduced, not ignored).
function freshCard() {
  return { ease: 2.5, intervalDays: 0, reps: 0, lapses: 0, seen: 0, due: 0, last: 0 };
}

export function get(key) {
  return load()[key] || null;
}

// Is this card due for review right now? A card the learner has never seen
// counts as due — new material needs learning before it can be "reviewed".
export function isDue(card, now = Date.now()) {
  if (!card || !card.seen) return true;
  return now >= card.due;
}

// How many of the given item keys are due right now. Used by the menu to show
// "<due> / <total> due" so progress is legible under spaced repetition (a
// best-score badge no longer makes sense when items resurface on a schedule).
export function dueCount(keys, now = Date.now()) {
  const data = load();
  let n = 0;
  for (const k of keys) if (isDue(data[k], now)) n++;
  return n;
}

// Record one answer for an item and persist the updated card. SM-2 lite:
// a correct answer lengthens the interval (interval × ease, with the usual
// 1-then-6-day ramp for the first reps); a wrong answer resets the streak,
// drops the ease, and makes the card due again immediately.
export function review(key, correct, now = Date.now()) {
  const data = load();
  const card = data[key] || freshCard();

  if (correct) {
    card.reps += 1;
    if (card.reps === 1) card.intervalDays = 1;
    else if (card.reps === 2) card.intervalDays = 6;
    else card.intervalDays = Math.round(card.intervalDays * card.ease);
    // No self-grade, so treat "correct" as a solid-but-not-perfect recall and
    // nudge ease up gently; clamp to SM-2's 1.3 floor on the way down elsewhere.
    card.ease = Math.min(3.0, card.ease + 0.05);
  } else {
    card.reps = 0;
    card.lapses += 1;
    card.intervalDays = 0; // due now — wants to come back this session-ish
    card.ease = Math.max(1.3, card.ease - 0.2);
  }

  card.seen += 1;
  card.last = now;
  card.due = now + card.intervalDays * DAY;

  data[key] = card;
  save(data);
  return card;
}

// How much this card "wants" to be shown right now, as a positive weight.
// Driven by two things the user asked for — time and correctness:
//   • time: a card past its due date weighs more the more overdue it is; a card
//     reviewed recently (not yet due) weighs little.
//   • correctness: harder cards (lower ease, more lapses) get an extra boost.
// New, unseen cards get a steady moderate weight so fresh material enters the
// rotation without drowning out everything due for review.
const NEW_WEIGHT = 2.5;

export function weight(card, now = Date.now()) {
  if (!card || !card.seen) return NEW_WEIGHT;

  // Guard the interval so brand-new-correct or just-lapsed cards don't divide by
  // zero; an hour is a reasonable floor for "how stale is stale".
  const interval = Math.max(card.intervalDays, 1 / 24) * DAY;
  const overdue = (now - card.due) / interval; // <0 not due yet, 0 just due, >0 overdue

  let w;
  if (overdue >= 0) {
    w = 1 + Math.min(overdue, 4) * 1.5; // ramps 1 → 7 as it gets more overdue
  } else {
    w = Math.max(0.15, 1 + overdue); // decays toward a small floor before it's due
  }

  // Difficulty boost: weaker cards resurface more often.
  const difficulty = (2.5 - card.ease) + Math.min(card.lapses, 5) * 0.2;
  w *= 1 + Math.max(0, difficulty) * 0.5;

  return w;
}

// Pick up to `n` items for a session, sampled without replacement weighted by
// each item's current SRS weight. `keyOf(item)` yields the item's storage key.
// Returns a fresh array; leaves order to the caller to shuffle if it wants.
export function select(items, n, keyOf, now = Date.now()) {
  const data = load();
  const pool = items.map((item) => ({ item, w: weight(data[keyOf(item)] || null, now) }));
  const chosen = [];

  while (chosen.length < n && pool.length) {
    const total = pool.reduce((s, p) => s + p.w, 0);
    let r = Math.random() * total;
    let i = 0;
    for (; i < pool.length; i++) {
      r -= pool[i].w;
      if (r <= 0) break;
    }
    if (i >= pool.length) i = pool.length - 1; // float guard
    chosen.push(pool[i].item);
    pool.splice(i, 1);
  }
  return chosen;
}
