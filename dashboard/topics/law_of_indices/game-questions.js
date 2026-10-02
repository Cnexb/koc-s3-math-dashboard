window.JM24_GAME_EXTRA = {
  rules: [
    {
      id: "rules-q1",
      questionEn: "Simplify x³ × x⁴.",
      questionZh: "化簡 x³ × x⁴。",
      choices: [
        { textEn: "x⁷", textZh: "x⁷", correct: true },
        { textEn: "x¹²", textZh: "x¹²", correct: false },
        { textEn: "x¹", textZh: "x¹", correct: false },
        { textEn: "7x", textZh: "7x", correct: false },
      ],
      whyEn: "Product rule: x³ × x⁴ = x³⁺⁴ = x⁷. Add the indices; do not multiply them.",
      whyZh: "積定律：x³ × x⁴ = x³⁺⁴ = x⁷。指數相加，不要相乘。",
    },
    {
      id: "rules-q2",
      questionEn: "Simplify x⁸ ÷ x³.",
      questionZh: "化簡 x⁸ ÷ x³。",
      choices: [
        { textEn: "x⁵", textZh: "x⁵", correct: true },
        { textEn: "x¹¹", textZh: "x¹¹", correct: false },
        { textEn: "x²⁴", textZh: "x²⁴", correct: false },
        { textEn: "x³", textZh: "x³", correct: false },
      ],
      whyEn: "Quotient rule: x⁸ ÷ x³ = x⁸⁻³ = x⁵. Subtract the indices.",
      whyZh: "商定律：x⁸ ÷ x³ = x⁸⁻³ = x⁵。指數相減。",
    },
    {
      id: "rules-q4",
      questionEn: "Simplify x⁵ ÷ x².",
      questionZh: "化簡 x⁵ ÷ x²。",
      choices: [
        { textEn: "x³", textZh: "x³", correct: true },
        { textEn: "x⁷", textZh: "x⁷", correct: false },
        { textEn: "x²·⁵", textZh: "x²·⁵", correct: false },
        { textEn: "x¹⁰", textZh: "x¹⁰", correct: false },
      ],
      whyEn: "Quotient rule: x⁵ ÷ x² = x⁵⁻² = x³. Subtract the indices; do not multiply or divide them.",
      whyZh: "商定律：x⁵ ÷ x² = x⁵⁻² = x³。指數相減，不要相乘或相除。",
    },
    {
      id: "rules-q5",
      questionEn: "Simplify (x²)³.",
      questionZh: "化簡 (x²)³。",
      choices: [
        { textEn: "x⁶", textZh: "x⁶", correct: true },
        { textEn: "x⁵", textZh: "x⁵", correct: false },
        { textEn: "x⁸", textZh: "x⁸", correct: false },
        { textEn: "x⁹", textZh: "x⁹", correct: false },
      ],
      whyEn: "Power of a power: (x²)³ = x^(2×3) = x⁶. Multiply the indices.",
      whyZh: "冪的冪：(x²)³ = x^(2×3) = x⁶。指數相乘。",
    },
    {
      id: "rules-q9",
      questionEn: "Simplify (x³)⁴.",
      questionZh: "化簡 (x³)⁴。",
      choices: [
        { textEn: "x¹²", textZh: "x¹²", correct: true },
        { textEn: "x⁷", textZh: "x⁷", correct: false },
        { textEn: "x⁸¹", textZh: "x⁸¹", correct: false },
        { textEn: "x⁶⁴", textZh: "x⁶⁴", correct: false },
      ],
      whyEn: "Power of a power: (x³)⁴ = x^(3×4) = x¹².",
      whyZh: "冪的冪：(x³)⁴ = x^(3×4) = x¹²。",
    },
    {
      id: "rules-q7",
      questionEn: "Evaluate x⁰ (x ≠ 0).",
      questionZh: "求 x⁰ 的值（x ≠ 0）。",
      choices: [
        { textEn: "1", textZh: "1", correct: true },
        { textEn: "0", textZh: "0", correct: false },
        { textEn: "x", textZh: "x", correct: false },
        { textEn: "Undefined", textZh: "無意義", correct: false },
      ],
      whyEn: "Zero exponent: x⁰ = 1 when x ≠ 0. Only 0⁰ is undefined.",
      whyZh: "零指數：當 x ≠ 0 時，x⁰ = 1。只有 0⁰ 無意義。",
    },
    {
      id: "rules-q10",
      questionEn: "Evaluate 5⁰.",
      questionZh: "求 5⁰ 的值。",
      choices: [
        { textEn: "1", textZh: "1", correct: true },
        { textEn: "0", textZh: "0", correct: false },
        { textEn: "5", textZh: "5", correct: false },
        { textEn: "Undefined", textZh: "無意義", correct: false },
      ],
      whyEn: "Any non-zero number to the power 0 is 1: 5⁰ = 1.",
      whyZh: "任何非零數的 0 次方都是 1：5⁰ = 1。",
    },
    {
      id: "rules-q6",
      questionEn: "Evaluate 2⁻³.",
      questionZh: "求 2⁻³ 的值。",
      choices: [
        { textEn: "1/8", textZh: "1/8", correct: true },
        { textEn: "8", textZh: "8", correct: false },
        { textEn: "-8", textZh: "-8", correct: false },
        { textEn: "1/6", textZh: "1/6", correct: false },
      ],
      whyEn: "Negative index: 2⁻³ = 1 / 2³ = 1/8. The minus sign is not a minus in front of the number.",
      whyZh: "負指數：2⁻³ = 1 / 2³ = 1/8。負號不是把答案變成負數。",
    },
    {
      id: "rules-q11",
      questionEn: "Evaluate 3⁻².",
      questionZh: "求 3⁻² 的值。",
      choices: [
        { textEn: "1/9", textZh: "1/9", correct: true },
        { textEn: "-9", textZh: "-9", correct: false },
        { textEn: "9", textZh: "9", correct: false },
        { textEn: "1/6", textZh: "1/6", correct: false },
      ],
      whyEn: "Negative index: 3⁻² = 1 / 3² = 1/9.",
      whyZh: "負指數：3⁻² = 1 / 3² = 1/9。",
    },
    {
      id: "rules-q12",
      questionEn: "Write 1/x⁴ as a power of x.",
      questionZh: "將 1/x⁴ 寫成 x 的次方。",
      choices: [
        { textEn: "x⁻⁴", textZh: "x⁻⁴", correct: true },
        { textEn: "x⁴", textZh: "x⁴", correct: false },
        { textEn: "−x⁴", textZh: "−x⁴", correct: false },
        { textEn: "x¹⁄⁴", textZh: "x¹⁄⁴", correct: false },
      ],
      whyEn: "Negative index: 1 / x⁴ = x⁻⁴.",
      whyZh: "負指數：1 / x⁴ = x⁻⁴。",
    },
    {
      id: "rules-q13",
      questionEn: "Simplify x² × x⁵ × x.",
      questionZh: "化簡 x² × x⁵ × x。",
      choices: [
        { textEn: "x⁸", textZh: "x⁸", correct: true },
        { textEn: "x¹⁰", textZh: "x¹⁰", correct: false },
        { textEn: "x⁷", textZh: "x⁷", correct: false },
        { textEn: "x²⁺⁵", textZh: "x²⁺⁵", correct: false },
      ],
      whyEn: "x on its own is x¹. Product rule: x² × x⁵ × x¹ = x²⁺⁵⁺¹ = x⁸.",
      whyZh: "單獨的 x 就是 x¹。積定律：x² × x⁵ × x¹ = x²⁺⁵⁺¹ = x⁸。",
    },
    {
      id: "rules-q14",
      questionEn: "Simplify (2x)³.",
      questionZh: "化簡 (2x)³。",
      choices: [
        { textEn: "8x³", textZh: "8x³", correct: true },
        { textEn: "2x³", textZh: "2x³", correct: false },
        { textEn: "6x³", textZh: "6x³", correct: false },
        { textEn: "8x", textZh: "8x", correct: false },
      ],
      whyEn: "Power of a product: (2x)³ = 2³ × x³ = 8x³.",
      whyZh: "積的冪：(2x)³ = 2³ × x³ = 8x³。",
    },
    {
      id: "rules-q8",
      questionEn: "Simplify 8ⁿ × 2.",
      questionZh: "化簡 8ⁿ × 2。",
      choices: [
        { textEn: "2³ⁿ⁺¹", textZh: "2³ⁿ⁺¹", correct: true },
        { textEn: "16ⁿ", textZh: "16ⁿ", correct: false },
        { textEn: "2³ⁿ", textZh: "2³ⁿ", correct: false },
        { textEn: "8ⁿ⁺²", textZh: "8ⁿ⁺²", correct: false },
      ],
      whyEn: "8 = 2³, so 8ⁿ × 2 = (2³)ⁿ × 2¹ = 2³ⁿ × 2 = 2³ⁿ⁺¹.",
      whyZh: "8 = 2³，所以 8ⁿ × 2 = (2³)ⁿ × 2¹ = 2³ⁿ × 2 = 2³ⁿ⁺¹。",
    },
    {
      id: "rules-q15",
      questionEn: "Simplify x⁶ ÷ x⁶.",
      questionZh: "化簡 x⁶ ÷ x⁶。",
      choices: [
        { textEn: "1", textZh: "1", correct: true },
        { textEn: "x", textZh: "x", correct: false },
        { textEn: "0", textZh: "0", correct: false },
        { textEn: "x¹²", textZh: "x¹²", correct: false },
      ],
      whyEn: "Quotient rule: x⁶ ÷ x⁶ = x⁰ = 1 (x ≠ 0).",
      whyZh: "商定律：x⁶ ÷ x⁶ = x⁰ = 1（x ≠ 0）。",
    },
    {
      id: "rules-q16",
      questionEn: "Simplify (x⁴)² ÷ x³.",
      questionZh: "化簡 (x⁴)² ÷ x³。",
      choices: [
        { textEn: "x⁵", textZh: "x⁵", correct: true },
        { textEn: "x⁶", textZh: "x⁶", correct: false },
        { textEn: "x⁸", textZh: "x⁸", correct: false },
        { textEn: "x³", textZh: "x³", correct: false },
      ],
      whyEn: "(x⁴)² = x⁸, then x⁸ ÷ x³ = x⁵.",
      whyZh: "(x⁴)² = x⁸，再 x⁸ ÷ x³ = x⁵。",
    },
  ],
};

window.JM24_GAME_PRESETS = [
  { id: "rules", labelEn: "Law of Indices", labelZh: "指數定律" },
];

window.buildJM24GameBank = function buildJM24GameBank() {
  var quiz = window.JM24_COMICS_QUIZ || { rules: [] };
  var extra = window.JM24_GAME_EXTRA;
  return {
    rules: (quiz.rules || []).concat(extra.rules || []),
  };
};

window.tagJM24GameQuestions = function tagJM24GameQuestions(list, topic) {
  return list.map(function (question) {
    return Object.assign({}, question, { topic: topic });
  });
};

window.getJM24GameTopicLabel = function getJM24GameTopicLabel(topicId, lang) {
  if (window.I18n && typeof window.I18n.t === "function") {
    var translated = window.I18n.t("comic.rules");
    if (translated && translated !== "comic.rules") return translated;
  }
  var preset = (window.JM24_GAME_PRESETS || []).find(function (p) {
    return p.id === topicId;
  });
  if (!preset) return "Law of Indices";
  return lang === "zh" ? preset.labelZh : preset.labelEn;
};

window.getJM24GameQuestions = function getJM24GameQuestions() {
  var bank = window.buildJM24GameBank();
  return window.tagJM24GameQuestions(bank.rules.slice(), "rules");
};
