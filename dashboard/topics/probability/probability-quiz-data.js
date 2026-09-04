/* Probability quiz question bank. Edit this file to add or change questions. */
(function () {
  "use strict";
  window.MATH_QUIZ_BANKS = window.MATH_QUIZ_BANKS || {};
  var FIG = "quiz-figures/";

window.MATH_QUIZ_BANKS['probability'] = [
    {
      id: 1,
      type: "mc",
      prompt:
        "A letter is chosen randomly from the word \u2018UNIVERSITY\u2019. Find the probability that is a vowel.",
      choices: ["\\frac{1}{5}", "\\frac{3}{10}", "\\frac{2}{5}", "\\frac{1}{2}"],
      answer: 2,
    },
    {
      id: 2,
      type: "mc",
      prompt:
        "Samuel can choose to go to work by bus, taxi or MTR. Suppose he randomly chooses a mean of transport in two working days. Find the probability that Samuel chooses the same mean of transport in these two working days.",
      choices: ["\\frac{2}{3}", "\\frac{1}{3}", "\\frac{1}{4}", "\\frac{3}{5}"],
      answer: 1,
    },
    {
      id: 3,
      type: "mc",
      prompt:
        "There are 20 basketball and 35 tennis ball in a box. Nick repeats the action of drawing a ball from the box at random and putting it back into the box. Find the expected number of times of getting a tennis ball if he repeats the action for 385 times.",
      choices: ["20", "35", "140", "245"],
      answer: 3,
    },
    {
      id: 4,
      type: "mc",
      prompt:
        "The figure shows a circular fortune wheel in a lucky draw. Dylan turns the wheel once. If the pointer points at the region \u2018c\u2019, \u2018e\u2019 or \u2018g\u2019, a prize will be given. Find the probability that he gets a prize.",
      figures: [{ src: FIG + "q4-wheel.png", alt: "Circular fortune wheel with sectors a to g" }],
      choices: ["\\frac{1}{4}", "\\frac{1}{6}", "\\frac{1}{10}", "\\frac{1}{12}"],
      answer: 0,
    },
    {
      id: 5,
      type: "mc",
      prompt:
        "A bag contains five $1.4 stamps, five $0.2 stamps and ten $0.1 stamps. A stamp is drawn at random from the bag. Find the expected face value of the stamp.",
      choices: ["\\$0.35", "\\$0.4", "\\$0.45", "\\$0.5"],
      answer: 2,
    },
    {
      id: 6,
      type: "mc",
      prompt:
        "There are 24 bottles of water and x bottles of tea on a table. If a bottle of drink is drawn at random, the probability of drawing a bottle of tea is \\frac{3}{5}. Find the value of x.",
      choices: ["36", "38", "40", "42"],
      answer: 0,
    },
    {
      id: 7,
      type: "mc",
      prompt:
        "6\u25b2 is a 2-digit number, where \u25b2 is an integer from 0 to 9 inclusive. Find the probability that the 2-digit number is divisible by 5.",
      choices: ["\\frac{1}{10}", "\\frac{1}{5}", "\\frac{2}{5}", "\\frac{1}{2}"],
      answer: 1,
    },
    {
      id: 8,
      type: "mc",
      prompt:
        "There are 2000 candidates in an examination. If one of the candidates is chosen randomly, the probability of choosing a female candidate is \\frac{11}{20}. Find the number of male candidates in the examination.",
      choices: ["800", "900", "1000", "1100"],
      answer: 1,
    },
    {
      id: 9,
      type: "mc",
      prompt:
        "Two fair dice are thrown at the same time. By using tabulation, find the probability that the sum of the two number is less than 9.",
      choices: ["\\frac{5}{9}", "\\frac{13}{18}", "\\frac{2}{3}", "\\frac{4}{9}"],
      answer: 1,
    },
    {
      id: 10,
      type: "mc",
      prompt:
        "Winnie\u2019s purse contains two $2 coins, one $5 coin and one $10 coin. On a flag day, Winnie takes out two coins randomly from her purse at the same time for donation. Find the expected donation amount.",
      choices: ["\\$7", "\\$8.5", "\\$9.5", "\\$10"],
      answer: 2,
    },
  ];;
})();
