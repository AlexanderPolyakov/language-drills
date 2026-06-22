// UI strings live here, never inline in the engine. The "UI language" (the
// chrome: buttons, labels, feedback) is intentionally kept separate from the
// "target language" of the exercise content.

export const UI_LANG = "en";

const strings = {
  en: {
    appTitle: "Language Drills",

    // Exercise flow
    start: "Start",
    check: "Check",
    continue: "Continue",
    finish: "Finish",
    tryAgain: "Try again",
    progress: (n, total) => `${n} / ${total}`,
    correct: "Correct",
    incorrect: "Not quite",
    explanation: "Why",
    answerWas: (a) => `Answer: ${a}`,
    score: (n, total) => `${n} / ${total} correct`,

    // Browse menu
    chooseLanguage: "Choose a language",
    chooseLevel: "Choose a level",
    chooseCategory: "Choose a category",
    chooseExercise: "Choose an exercise",
    randomDrill: "Mixed drill",
    level: "Level",
    category: "Category",
    back: "← Back",
    menu: "Menu",

    // Results
    results: "Results",
    youScored: (n, total) => `You scored ${n} / ${total}`,
    perfect: "Perfect score!",
    backToMenu: "Back to menu",
    // Spaced-repetition progress badge: how many items are due for review out of
    // the total. "0 / N due" means everything has been reviewed and isn't due yet.
    due: (n, total) => `${n}/${total} due`,
  },
};

// Look up a UI string by key. Extra args are passed to function-valued strings.
// Falls back to the key itself so a missing string is visible, not blank.
export function t(key, ...args) {
  const val = strings[UI_LANG]?.[key];
  return typeof val === "function" ? val(...args) : (val ?? key);
}
