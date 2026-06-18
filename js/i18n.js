// UI strings live here, never inline in the engine. The "UI language" (the
// chrome: buttons, labels, feedback) is intentionally kept separate from the
// "target language" of the exercise content.

export const UI_LANG = "en";

const strings = {
  en: {
    appTitle: "Language Drills",
    chooseLanguage: "Choose a language",
    chooseTopic: "Choose a topic",
    chooseLevel: "Choose a level",
    chooseExercise: "Choose an exercise",
    back: "← Back",
    menu: "Menu",
    results: "Results",
    youScored: (n, total) => `You scored ${n} / ${total}`,
    perfect: "Perfect score!",
    tryAgain: "Try again",
    backToMenu: "Back to menu",
    best: (n, total) => `best ${n}/${total}`,
    check: "Check answers",
    correct: "Correct",
    incorrect: "Not quite",
    explanation: "Why",
    chooseBlank: "— choose —",
    // Functions are allowed for values that interpolate.
    score: (n, total) => `${n} / ${total} correct`,
  },
};

// Look up a UI string by key. Extra args are passed to function-valued strings.
// Falls back to the key itself so a missing string is visible, not blank.
export function t(key, ...args) {
  const val = strings[UI_LANG]?.[key];
  return typeof val === "function" ? val(...args) : (val ?? key);
}
