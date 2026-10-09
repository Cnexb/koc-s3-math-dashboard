/* JM29 Quadrilaterals — S3 Ch05 L01 section quiz */
SectionQuiz.init({
  quizId: "math-jm29",
  section: "JM29",
  sets: [
    {
      key: "l01",
      label: "L01 \u00b7 Properties of Quadrilaterals",
      idPrefix: "jm29-",
      questions: [
        {
          id: 1,
          prompt: "Which of the following are the properties of a rhombus?",
          items: [
            { tag: "I.", text: "The two diagonals are perpendicular to each other." },
            { tag: "II.", text: "Interior angles are bisected by the diagonals." },
            { tag: "III.", text: "Diagonals bisect each other into four equal parts." },
          ],
          choices: ["I and II only", "I and III only", "II and III only", "I, II and III"],
          answer: 0,
        },
        {
          id: 2,
          prompt: "Which of the following are the properties of a rectangle?",
          items: [
            { tag: "I.", text: "All the interior angles are right angles." },
            { tag: "II.", text: "The diagonals are perpendicular to each other." },
            { tag: "III.", text: "The diagonals bisect each other into four equal parts." },
          ],
          choices: ["I and II only", "I and III only", "II and III only", "I, II and III"],
          answer: 1,
        },
        {
          id: 3,
          prompt: "ABCD is a parallelogram. E is a point on BC such that BE : EC = 2 : 3. If the area of \u25b3ABE is 4 cm\u00b2, find the area of AECD.",
          choices: ["9 cm\u00b2", "12 cm\u00b2", "14 cm\u00b2", "16 cm\u00b2"],
          answer: 3,
        },
        {
          id: 4,
          prompt: "D, E and F are the mid-points of AB, BC and AC respectively. If the perimeter of \u25b3DEF is 15 cm, find the perimeter of \u25b3ABC.",
          choices: ["20 cm", "24 cm", "30 cm", "35 cm"],
          answer: 2,
        },
        {
          id: 5,
          prompt: "Which of the following descriptions of quadrilaterals is NOT true?",
          choices: [
            "Diagonals of any parallelogram always split into four equal parts.",
            "Diagonals of any rhombus bisect the interior angles.",
            "Diagonals of any rectangle are equal.",
            "Diagonals of any square are perpendicular.",
          ],
          answer: 0,
        },
      ],
    },
  ],
});
