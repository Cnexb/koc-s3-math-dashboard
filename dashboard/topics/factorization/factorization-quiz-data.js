/* Factorization quiz question bank. Edit this file to add or change questions. */
(function () {
  "use strict";
  window.MATH_QUIZ_BANKS = window.MATH_QUIZ_BANKS || {};
window.MATH_QUIZ_BANKS['factorization'] = [
    {
      id: 1,
      type: "mc",
      prompt: "Factorize",
      stem: "x^2 - 6x - 7",
      choices: ["(x+1)(x+7)", "(x+1)(x-7)", "(x-1)(x+7)", "(x-1)(x-7)"],
      answer: 1,
    },
    {
      id: 2,
      type: "mc",
      prompt: "Factorize",
      stem: "49p^2 + 9q^2 - 42pq",
      choices: [
        "(7p+3q)(7p-3q)",
        "(7p+3q)^2",
        "(7p-3q)^2",
        "(49p+9q)^2",
      ],
      answer: 2,
    },
    {
      id: 3,
      type: "mc",
      prompt: "Which of the following do(es) not have x+2 as a factor?",
      items: [
        { tag: "I.", tex: "x^2+4" },
        { tag: "II.", tex: "x^2-4" },
        { tag: "III.", tex: "(x-3)^2-25" },
      ],
      choices: [
        "\\text{I only}",
        "\\text{II only}",
        "\\text{I and III only}",
        "\\text{II and III only}",
      ],
      answer: 0,
    },
    {
      id: 4,
      type: "mc",
      prompt: "Factorize",
      stem: "x^2 - 8xy + 15y^2 - 5x + 15y",
      choices: [
        "(x-3y)(x-5y-5)",
        "(x-5y)(x-3y-5)",
        "(x+3y)(x-5y-5)",
        "(x+5y)(x-3y-5)",
      ],
      answer: 0,
    },
    {
      id: 5,
      type: "mc",
      prompt: "Factorize",
      stem: "x^2(x+y) - y^2(y+x)",
      choices: [
        "(x+y)^2(x-y)",
        "(x+y)(x^2+xy+y^2)",
        "(x-y)^2(x+y)",
        "(x-y)(x^2-xy+y^2)",
      ],
      answer: 0,
    },
    {
      id: 6,
      type: "mc",
      prompt: "Factorize",
      stem: "y^2 + 4y - 12",
      choices: [
        "(y+2)(y-6)",
        "(y+3)(y-4)",
        "(y-2)(y+6)",
        "(y-3)(y+4)",
      ],
      answer: 2,
    },
    {
      id: 7,
      type: "mc",
      prompt: "Factorize",
      stem: "n^2 + 12n + 35",
      choices: [
        "(n+5)(n+7)",
        "(n+5)(n-7)",
        "(n-5)(n+7)",
        "(n-5)(n-7)",
      ],
      answer: 0,
    },
    {
      id: 8,
      type: "mc",
      prompt: "Factorize",
      stem: "x^2 - 2xy - 35y^2 - 7x + 49y",
      choices: [
        "(x-7y)(x+5y)",
        "(x-7y)(x+5y+7)",
        "(x-7y)(x+5y-7)",
        "(x-7y-7)(x+5y)",
      ],
      answer: 2,
    },
    {
      id: 9,
      type: "mc",
      prompt: "Factorize",
      stem: "63xy^2 + 28xz^2 + 84xyz",
      choices: [
        "7(3y+2z)^2",
        "7x(3y+2z)^2",
        "7x(3y-2z)^2",
        "7x(9y^2+12yz+4z^2)",
      ],
      answer: 1,
    },
    {
      id: 10,
      type: "mc",
      prompt: "Factorize",
      stem: "a^4 - a^2 - 2a^2b^2 - 2ab + b^4 - b^2",
      choices: [
        "(a+b)^2[(a-b)^2-1]",
        "(a+b)^2(a+b-1)(a+b+1)",
        "(a-b)^2(a+b-1)(a+b+1)",
        "(a+b)^2(a-b-1)(a-b+1)",
      ],
      answer: 3,
    },
  ];;
})();
