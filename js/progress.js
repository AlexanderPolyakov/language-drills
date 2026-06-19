// Progress persistence. Per the project rules, progress lives in localStorage
// only — no backend, no database. Keyed by exercise id; we keep the best score
// and the most recent attempt.

const KEY = "language-drills:progress";

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
    // Storage full or disabled (e.g. private mode): progress just won't persist.
  }
}

// Record an attempt and return the updated record for this exercise.
export function record(id, correct, total) {
  const data = load();
  const prev = data[id];
  data[id] = {
    lastScore: correct,
    total,
    best: prev ? Math.max(prev.best, correct) : correct,
    completedAt: new Date().toISOString(),
  };
  save(data);
  return data[id];
}

export function get(id) {
  return load()[id] || null;
}
