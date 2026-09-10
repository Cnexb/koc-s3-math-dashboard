/* Factorization L02 (extended) quiz. Separate bank from L01 so tracker ids do not collide. */
(function () {
  "use strict";
  window.MATH_QUIZ_BANKS = window.MATH_QUIZ_BANKS || {};
  window.MATH_QUIZ_BANKS["factorization-l02"] = [
    {
      id: 1,
      type: "mc",
      prompt: "Factorize",
      stem: "32x^2 - 56x + 20",
      choices: [
        "4(2x+5)(4x+1)",
        "4(2x-5)(4x-1)",
        "4(2x+1)(4x+5)",
        "4(2x-1)(4x-5)",
      ],
      answer: 3,
    },
    {
      id: 2,
      type: "mc",
      prompt: "Factorize",
      stem: "4(x-7)^2 - 5(x-7) - 6",
      choices: [
        "(x+2)(4x-3)",
        "(x-2)(4x+3)",
        "(x-5)(4x+31)",
        "(x-9)(4x-25)",
      ],
      answer: 3,
    },
    {
      id: 3,
      type: "mc",
      prompt: "Factorize",
      stem: "a^2 - 2a - 8 + 2am + 4m",
      choices: [
        "(a-4)(a+2+m)",
        "(a-4)(a+2+2m)",
        "(a+2)(a-4+m)",
        "(a+2)(a-4+2m)",
      ],
      answer: 3,
    },
    {
      id: 4,
      type: "mc",
      prompt: "Factorize",
      stem: "4p^2 - 9pq + 5q^2 - p + q",
      choices: [
        "(p-q)(4p-5q-1)",
        "(p-q)(4p+5q-1)",
        "(p+q)(4p-5q+1)",
        "(p+q)(4p+5q+1)",
      ],
      answer: 0,
    },
    {
      id: 5,
      type: "mc",
      prompt:
        "The common linear factor of 2x² + 5x − 3 and 6x² + 5x − 4 is ax − b, where a and b are coprime positive integers. Find a + b.",
      choices: ["1", "2", "3", "4"],
      answer: 2,
    },
  ];
})();
