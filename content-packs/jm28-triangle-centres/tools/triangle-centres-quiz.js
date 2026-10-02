/* JM28 Special Lines and Centres in Triangles — S3 Ch06 L01 section quiz */
SectionQuiz.init({
  quizId: "SLiCe",
  section: "JM28 Special Lines and Centres in Triangles",
  sets: [
    {
      key: "l01",
      label: "L01 \u00b7 Special Lines and Centres in a Triangle",
      idPrefix: "slice-l01-q",
      questions: [
        {
          id: 1,
          prompt: "In \u25b3ABC, D is a point on BC such that BD = DC. AD is",
          choices: [
            "a perpendicular bisector of \u25b3ABC.",
            "an angle bisector of \u25b3ABC.",
            "an altitude of \u25b3ABC.",
            "a median of \u25b3ABC.",
          ],
          answer: 3,
        },
        {
          id: 2,
          prompt: "ABCD is a quadrilateral, where AC and BD are perpendicular bisectors of each other. If AC = 10 cm and BD = 24 cm, find the perimeter of ABCD.",
          choices: ["26 cm", "52 cm", "104 cm", "120 cm"],
          answer: 1,
        },
        {
          id: 3,
          prompt: "If \u25b3PQR is an acute-angled triangle, which of the following are true?",
          items: [
            { tag: "I.", text: "The incentre of \u25b3PQR lies inside \u25b3PQR." },
            { tag: "II.", text: "The circumcentre of \u25b3PQR lies inside \u25b3PQR." },
            { tag: "III.", text: "The orthocentre of \u25b3PQR lies inside \u25b3PQR." },
          ],
          choices: ["I and II only", "I and III only", "II and III only", "I, II and III"],
          answer: 3,
        },
        {
          id: 4,
          prompt: "If \u25b3PQR is an obtuse-angled triangle, which of the following are true?",
          items: [
            { tag: "I.", text: "The incentre of \u25b3PQR lies inside \u25b3PQR." },
            { tag: "II.", text: "The circumcentre of \u25b3PQR lies inside \u25b3PQR." },
            { tag: "III.", text: "The centroid of \u25b3PQR lies inside \u25b3PQR." },
          ],
          choices: ["I and II only", "I and III only", "II and III only", "I, II and III"],
          answer: 1,
        },
        {
          id: 5,
          prompt: "It is given that \u25b3XYZ is a right-angled triangle, where \u2220XYZ = 90\u00b0. Which of the following is true?",
          choices: [
            "X is the orthocentre of \u25b3XYZ.",
            "Y is the orthocentre of \u25b3XYZ.",
            "Y is the circumcentre of \u25b3XYZ.",
            "Z is the circumcentre of \u25b3XYZ.",
          ],
          answer: 1,
        },
      ],
    },
  ],
});
