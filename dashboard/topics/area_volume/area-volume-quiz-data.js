/* Area & volume quiz question bank. Edit this file to add or change questions. */
(function () {
  "use strict";
  window.MATH_QUIZ_BANKS = window.MATH_QUIZ_BANKS || {};
  var FIG = "quiz-figures/";

  const VESSEL_INTRO =
    "The figure shows a vertical right conical vessel containing some water. The ratio of the curved surface area of the vessel to area of the surface of the vessel in contact with water is $36 : 25$.";

window.MATH_QUIZ_BANKS['area-volume'] = [
    {
      id: 1,
      type: "mc",
      prompt: "What is the volume of pyramid in the figure?",
      figures: [{ src: FIG + "q1-pyramid.png", alt: "Right pyramid with base 5 cm, 12 cm and height 16 cm" }],
      choices: ["320\\text{ cm}^3", "230\\text{ cm}^3", "160\\text{ cm}^3", "80\\text{ cm}^3"],
      answer: 2,
    },
    {
      id: 2,
      type: "mc",
      prompt:
        "In the figure, the height of the right circular cone is $4$ cm and its base radius is $3$ cm. The base radius of the cylinder is $2$ cm. If they have the same volume, find the height of the cylinder.",
      figures: [
        { src: FIG + "q2-cone.png", alt: "Cone height 4 cm, radius 3 cm" },
        { src: FIG + "q2-cylinder.png", alt: "Cylinder radius 2 cm" },
      ],
      figureLayout: "row",
      choices: ["2\\text{ cm}", "3\\text{ cm}", "4\\text{ cm}", "6\\text{ cm}"],
      answer: 1,
    },
    {
      id: 3,
      type: "mc",
      prompt:
        "$27$ small solid metal spheres each of radius $3$ cm are melted and recast into a larger solid metal sphere. Find the surface area of the large sphere in terms of \u03c0.",
      choices: ["36\\pi\\text{ cm}^2", "162\\pi\\text{ cm}^2", "324\\pi\\text{ cm}^2", "972\\pi\\text{ cm}^2"],
      answer: 2,
    },
    {
      id: 4,
      type: "mc",
      prompt: "The surface area of a sphere is $64$\u03c0 cm\u00b2. Find the volume of the sphere.",
      choices: [
        "\\frac{64}{3}\\pi\\text{ cm}^3",
        "\\frac{128}{3}\\pi\\text{ cm}^3",
        "64\\pi\\text{ cm}^3",
        "\\frac{256}{3}\\pi\\text{ cm}^3",
      ],
      answer: 3,
    },
    {
      id: 5,
      type: "mc",
      prompt:
        "A vessel in the shape of an inverted right circular cone containing $324$ cm\u00b3 of water is placed vertically. If the depth of water in the vessel is $3/5$ of the height of the vessel, find the capacity of the vessel.",
      figures: [{ src: FIG + "q5-vessel.png", alt: "Inverted cone partially filled with water" }],
      choices: ["540\\text{ cm}^3", "750\\text{ cm}^3", "1250\\text{ cm}^3", "1500\\text{ cm}^3"],
      answer: 3,
    },
    {
      id: 6,
      type: "mc",
      prompt:
        "The figure shows a small component of a plastic model. The shapes of its upper part and lower part are a hemisphere and a cylinder respectively. Their base radii are $4$ mm and the height of the cylinder is $10$ mm. Find the volume of the component.\n(Give the answer correct to $3$ significant figures.)",
      figures: [{ src: FIG + "q6-component.png", alt: "Hemisphere on top of a cylinder, radius 4 mm" }],
      choices: ["288\\text{ mm}^3", "503\\text{ mm}^3", "637\\text{ mm}^3", "800\\text{ mm}^3"],
      answer: 2,
    },
    {
      id: 7,
      type: "mc",
      prompt:
        "The height of a solid right pyramid with a square base of side $10$ cm is $12$ cm. Find the total surface area of the pyramid.",
      figures: [{ src: FIG + "q7-pyramid.png", alt: "Square-based right pyramid, base 10 cm, height 12 cm" }],
      choices: ["260\\text{ cm}^2", "300\\text{ cm}^2", "360\\text{ cm}^2", "400\\text{ cm}^2"],
      answer: 2,
    },
    {
      id: 8,
      type: "mc",
      prompt:
        VESSEL_INTRO + "\n(a) Find the ratio of the base radius of the vessel to the radius of the water surface.",
      choices: ["5:6", "6:5", "25:36", "36:25"],
      answer: 1,
    },
    {
      id: 9,
      type: "mc",
      prompt:
        "The base radius of a cone is $7$ cm and its slant height is $25$ cm. Find the curved surface area of the cone.",
      choices: ["150\\pi\\text{ cm}^2", "175\\pi\\text{ cm}^2", "200\\pi\\text{ cm}^2", "175\\text{ cm}^2"],
      answer: 1,
    },
    {
      id: 10,
      type: "mc",
      prompt:
        VESSEL_INTRO + "\nIt is given that the vessel contains $600$ cm\u00b3 of water. Alex claims that if $300$ cm\u00b3 of water is added into the vessel, the water will overflow. Do you agree? Explain your answer.",
      choices: [
        "\\text{Agree \u2014 the water will overflow}",
        "\\text{Disagree \u2014 the water will not overflow}",
        "\\text{Agree \u2014 total water would be }900\\text{ cm}^3",
        "\\text{Disagree \u2014 capacity is only }600\\text{ cm}^3",
      ],
      answer: 1,
    },
  ];;
})();
