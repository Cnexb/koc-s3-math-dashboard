/* Inequality quiz question bank. Edit this file to add or change questions. */
(function () {
  "use strict";
  window.MATH_QUIZ_BANKS = window.MATH_QUIZ_BANKS || {};
window.MATH_QUIZ_BANKS['inequality'] = [
    {
      id: 1,
      type: "mc",
      prompt: "Find the sum of all the negative integers x satisfying the inequality",
      stem: "x > -2\\pi",
      choices: ["-21\\pi", "-21", "-5", "0"],
      answer: 1,
    },
    {
      id: 2,
      type: "mc",
      prompt: "If 2x \u2264 3, which of the following is not true?",
      choices: [
        "4x \\le 2x + 3",
        "1 - 2x \\le -2",
        "2x + 3 \\le 6",
        "\\frac{2x}{3} \\le 1",
      ],
      answer: 1,
    },
    {
      id: 3,
      type: "mc",
      prompt: "If x \u2264 y and z > y, where z is a negative number, which of the following is not true?",
      choices: [
        "x \\le y < z",
        "y - x < z - x",
        "xz < xy",
        "-\\frac{x}{4} < -\\frac{z}{4}",
      ],
      answer: 3,
    },
    {
      id: 4,
      type: "mc",
      prompt: "Solve the inequality",
      stem: "3(x + 2) < 5(6 - x)",
      choices: ["x > 3", "x < 3", "x > -3", "x < -3"],
      answer: 1,
    },
    {
      id: 5,
      type: "mc",
      prompt: "Which of the following groups of numbers can all satisfy the inequality",
      stem: "7x + 3 > 17",
      choices: [
        "-1,\\; 0,\\; 1",
        "1,\\; 3,\\; 5",
        "2,\\; 3,\\; 4",
        "2.1,\\; 3.2,\\; 4.3",
      ],
      answer: 3,
    },
    {
      id: 6,
      type: "mc",
      prompt: "Solve the inequality",
      stem: "\\frac{x}{4} - 2 \\le 0.8 - \\frac{x}{3}",
      choices: ["x > \\frac{24}{5}", "x \\le \\frac{24}{5}", "x \\le 5", "x \\ge 4.8"],
      answer: 1,
    },
    {
      id: 7,
      type: "mc",
      prompt: "Write down all positive integers satisfying",
      stem: "x \\le \\frac{24}{5}",
      choices: [
        "1,\\; 2,\\; 3,\\; 4",
        "1,\\; 2,\\; 3,\\; 4,\\; 5",
        "1,\\; 2,\\; 3",
        "2,\\; 3,\\; 4",
      ],
      answer: 0,
    },
    {
      id: 8,
      type: "mc",
      prompt: "Write down all positive integers satisfying the inequality",
      stem: "\\frac{4x + 3}{5} < \\frac{1 - 3x}{6} + 4",
      choices: [
        "1,\\; 2",
        "1,\\; 2,\\; 3",
        "1 \\text{ only}",
        "2,\\; 3",
      ],
      answer: 0,
    },
    {
      id: 9,
      type: "mc",
      prompt: "A non-negative number x satisfies the equation below, where k is a positive integral constant. How many possible values of k?",
      stem: "\\frac{2x-k}{3} = \\frac{5x-7}{4} + \\frac{x+k}{6}",
      choices: ["1", "2", "3", "4"],
      answer: 2,
    },
    {
      id: 10,
      type: "mc",
      prompt: "Using the same equation as above, find x when k = 3.",
      stem: "\\frac{2x-k}{3} = \\frac{5x-7}{4} + \\frac{x+k}{6}",
      choices: ["x = \\frac{1}{3}", "x = -\\frac{1}{3}", "x = \\frac{7}{3}", "x = 3"],
      answer: 0,
    },
  ];;
})();
