/**
 * Shared Math quiz → UniPlus tracker bridge.
 * Does not call Supabase. uni-tracker.js on the topic page (and hub) listens.
 *
 * UniPlus is one iframe: quiz pages navigate away from the hub, so answers
 * must also postMessage to this window. Parent-only posts never reach a
 * listener (UniPlus does not load uni-tracker.js).
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  } else {
    root.MathQuizTracker = api;
  }
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var CONTRACT_FIELDS = [
    "type",
    "subject",
    "quizId",
    "questionId",
    "section",
    "difficulty",
    "stem",
    "selectedAnswer",
    "selectedAnswerText",
    "correctAnswer",
    "correctAnswerText",
    "isCorrect",
    "attemptNumber",
    "msTaken",
  ];

  /**
   * @param {object} meta
   * @param {string} meta.quizId
   * @param {string} meta.idPrefix
   * @param {string} meta.section
   * @param {"stem-or-prompt"|"stem-only"} meta.stemMode
   * @param {"always-choices"|"mc-only"} meta.answerTextMode
   * @param {string} [meta.difficulty]
   */
  function buildPayload(meta, q, userAnswerIdx, isCorrect) {
    var stem;
    if (meta.stemMode === "stem-only") {
      stem = q.stem || null;
    } else {
      stem = q.stem || q.prompt || null;
    }

    var selectedAnswer = userAnswerIdx !== undefined ? String(userAnswerIdx) : null;
    var selectedAnswerText;
    var correctAnswer;
    var correctAnswerText;

    if (meta.answerTextMode === "mc-only") {
      selectedAnswerText =
        q.type === "mc" && userAnswerIdx !== undefined ? q.choices[userAnswerIdx] || null : null;
      correctAnswer = q.type === "mc" ? String(q.answer) : q.answer || null;
      correctAnswerText = q.type === "mc" ? q.choices[q.answer] || null : q.answer || null;
    } else {
      selectedAnswerText =
        userAnswerIdx !== undefined ? q.choices[userAnswerIdx] || null : null;
      correctAnswer = String(q.answer);
      correctAnswerText = q.choices[q.answer] || null;
    }

    return {
      type: "uniplus:quizAnswer",
      subject: "MATH",
      quizId: meta.quizId,
      questionId: meta.idPrefix + q.id,
      section: meta.section,
      difficulty: meta.difficulty || "standard",
      stem: stem,
      selectedAnswer: selectedAnswer,
      selectedAnswerText: selectedAnswerText,
      correctAnswer: correctAnswer,
      correctAnswerText: correctAnswerText,
      isCorrect: Boolean(isCorrect),
      attemptNumber: 1,
      msTaken: 0,
    };
  }

  function getWindow() {
    if (typeof window !== "undefined") return window;
    if (typeof globalThis !== "undefined" && globalThis.window) return globalThis.window;
    return null;
  }

  function postPayload(payload) {
    var target = getWindow();
    if (!target) return;
    // In an iframe, parent !== this window. Notify the page that loaded
    // uni-tracker.js (the topic page) without duplicating when standalone.
    if (target.parent && target.parent !== target && target.postMessage) {
      target.postMessage(payload, "*");
    }
    if (target.parent && target.parent.postMessage) {
      target.parent.postMessage(payload, "*");
    }
    if (target.top && target.top !== target.parent && target.top.postMessage) {
      try {
        target.top.postMessage(payload, "*");
      } catch (_) {}
    }
  }

  function reportQuiz(meta, questions, answers, isCorrectFn) {
    questions.forEach(function (q) {
      var userAnswerIdx = answers[q.id];
      var isCorrect = isCorrectFn ? isCorrectFn(q, answers) : userAnswerIdx === q.answer;
      postPayload(buildPayload(meta, q, userAnswerIdx, isCorrect));
    });
  }

  /** Maps a quizAnswer event to the REST body uni-tracker.js would POST. No network. */
  function supabaseBodyFromEvent(session, data) {
    var subject = String(data.subject || (session && session.subject) || "").toUpperCase();
    var tableMap = {
      PHY: "phy_quiz_attempts",
      CHEM: "chem_quiz_attempts",
      BIO: "bio_quiz_attempts",
      MATH: "math_quiz_attempts",
    };
    return {
      table: tableMap[subject] || null,
      body: {
        student_id: session && session.userId,
        ep_student_id: (session && session.epStudentId) || null,
        subject: subject,
        quiz_id: data.quizId || "",
        question_id: data.questionId || "",
        section: data.section || "",
        difficulty: data.difficulty || null,
        selected_answer: data.selectedAnswer || null,
        selected_answer_text: data.selectedAnswerText || null,
        correct_answer: data.correctAnswer || "",
        correct_answer_text: data.correctAnswerText || null,
        stem: data.stem || null,
        is_correct: Boolean(data.isCorrect),
        attempt_number: data.attemptNumber || 1,
        ms_taken: data.msTaken ? Math.round(data.msTaken) : null,
        session_id: data.sessionId || null,
      },
    };
  }

  return {
    CONTRACT_FIELDS: CONTRACT_FIELDS,
    QUIZ_META: {
      percentages: {
        quizId: "math-percentages",
        idPrefix: "pct-q",
        section: "percentages",
        stemMode: "stem-or-prompt",
        answerTextMode: "always-choices",
      },
      factorization: {
        quizId: "math-factorization",
        idPrefix: "fac-q",
        section: "factorization",
        stemMode: "stem-only",
        answerTextMode: "mc-only",
      },
      inequality: {
        quizId: "math-inequality",
        idPrefix: "ineq-q",
        section: "inequality",
        stemMode: "stem-only",
        answerTextMode: "mc-only",
      },
      probability: {
        quizId: "math-probability",
        idPrefix: "prob-q",
        section: "probability",
        stemMode: "stem-or-prompt",
        answerTextMode: "always-choices",
      },
      "area-volume": {
        quizId: "math-area-volume",
        idPrefix: "av-q",
        section: "area-volume",
        stemMode: "stem-or-prompt",
        answerTextMode: "always-choices",
      },
    },
    buildPayload: buildPayload,
    postPayload: postPayload,
    reportQuiz: reportQuiz,
    supabaseBodyFromEvent: supabaseBodyFromEvent,
  };
});
