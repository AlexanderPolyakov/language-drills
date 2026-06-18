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
    chooseTopic: "Choose a topic",
    chooseLevel: "Choose a level",
    chooseExercise: "Choose an exercise",
    back: "← Back",
    menu: "Menu",

    // Results
    results: "Results",
    youScored: (n, total) => `You scored ${n} / ${total}`,
    perfect: "Perfect score!",
    backToMenu: "Back to menu",
    best: (n, total) => `best ${n}/${total}`,
  },
};

// Look up a UI string by key. Extra args are passed to function-valued strings.
// Falls back to the key itself so a missing string is visible, not blank.
export function t(key, ...args) {
  const val = strings[UI_LANG]?.[key];
  return typeof val === "function" ? val(...args) : (val ?? key);
}
