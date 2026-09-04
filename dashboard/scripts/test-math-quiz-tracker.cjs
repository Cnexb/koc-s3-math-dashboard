#!/usr/bin/env node
/**
 * Offline tracker contract tests.
 * Does not call Supabase. Fails if a quiz bank would send a payload
 * uni-tracker.js cannot map into math_quiz_attempts.
 */
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const root = path.join(__dirname, "..");
const tracker = require(path.join(root, "shared/math-quiz-tracker.js"));

const BANKS = [
  {
    key: "percentages",
    data: "topics/percentage/percentage-quiz-data.js",
    runner: "topics/percentage/percentage-quiz.js",
  },
  {
    key: "factorization",
    data: "topics/factorization/factorization-quiz-data.js",
    runner: "topics/factorization/factorization-quiz.js",
  },
  {
    key: "inequality",
    data: "topics/inequality/inequality-quiz-data.js",
    runner: "topics/inequality/inequality-quiz.js",
  },
  {
    key: "probability",
    data: "topics/probability/probability-quiz-data.js",
    runner: "topics/probability/probability-quiz.js",
  },
  {
    key: "area-volume",
    data: "topics/area_volume/area-volume-quiz-data.js",
    runner: "topics/area_volume/area-volume-quiz.js",
  },
];

function loadBank(rel) {
  const window = { MATH_QUIZ_BANKS: {} };
  window.window = window;
  vm.runInNewContext(fs.readFileSync(path.join(root, rel), "utf8"), { window, console });
  return window.MATH_QUIZ_BANKS;
}

function mockWindow() {
  const posts = [];
  const fakeWindow = {
    parent: { postMessage: (data, origin) => posts.push({ target: "parent", data, origin }) },
    top: { postMessage: (data, origin) => posts.push({ target: "top", data, origin }) },
  };
  fakeWindow.top = fakeWindow.parent; // same as in-iframe-but-one-level? 
  // Real topic pages are nested: topic iframe -> hub -> UniPlus.
  // Preserve the original branch: post parent always; post top only if top !== parent.
  const top = { postMessage: (data, origin) => posts.push({ target: "top", data, origin }) };
  fakeWindow.parent = { postMessage: (data, origin) => posts.push({ target: "parent", data, origin }) };
  fakeWindow.top = top;
  return { fakeWindow, posts };
}

let failed = 0;
function check(name, fn) {
  try {
    fn();
    console.log("ok  " + name);
  } catch (err) {
    failed += 1;
    console.error("fail " + name);
    console.error("    " + err.message);
  }
}

check("every bank has meta + 10 questions with unique ids", () => {
  for (const bank of BANKS) {
    const meta = tracker.QUIZ_META[bank.key];
    assert.ok(meta, "missing meta " + bank.key);
    const loaded = loadBank(bank.data);
    const quiz = loaded[bank.key];
    assert.ok(Array.isArray(quiz), "bank not loaded " + bank.key);
    assert.equal(quiz.length, 10, bank.key + " count");
    const ids = quiz.map((q) => q.id);
    assert.equal(new Set(ids).size, ids.length, bank.key + " unique ids");
    quiz.forEach((q) => {
      assert.equal(q.type, "mc");
      assert.ok(Array.isArray(q.choices) && q.choices.length >= 2);
      assert.equal(typeof q.answer, "number");
    });
  }
});

check("payload fields match uni-tracker contract and keep index answers", () => {
  for (const bank of BANKS) {
    const meta = tracker.QUIZ_META[bank.key];
    const quiz = loadBank(bank.data)[bank.key];
    const q = quiz[0];
    const payload = tracker.buildPayload(meta, q, 0, 0 === q.answer);
    tracker.CONTRACT_FIELDS.forEach((field) => {
      assert.ok(field in payload, bank.key + " missing " + field);
    });
    assert.equal(payload.type, "uniplus:quizAnswer");
    assert.equal(payload.subject, "MATH");
    assert.equal(payload.quizId, meta.quizId);
    assert.equal(payload.questionId, meta.idPrefix + q.id);
    assert.equal(payload.selectedAnswer, "0");
    assert.equal(payload.correctAnswer, String(q.answer));
    assert.equal(typeof payload.isCorrect, "boolean");
  }
});

check("stemMode matches the pre-split runners", () => {
  const pct = loadBank("topics/percentage/percentage-quiz-data.js").percentages[0];
  const pctPayload = tracker.buildPayload(tracker.QUIZ_META.percentages, pct, 2, true);
  assert.equal(pctPayload.stem, pct.prompt);
  assert.equal(pctPayload.questionId, "pct-q1");
  assert.equal(pctPayload.selectedAnswer, "2");
  assert.equal(pctPayload.selectedAnswerText, pct.choices[2]);

  const fac = loadBank("topics/factorization/factorization-quiz-data.js").factorization[0];
  const facPayload = tracker.buildPayload(tracker.QUIZ_META.factorization, fac, 1, true);
  assert.equal(facPayload.stem, fac.stem);
  assert.notEqual(facPayload.stem, fac.prompt);
  assert.equal(facPayload.questionId, "fac-q1");
  assert.equal(facPayload.quizId, "math-factorization");
});

check("reportQuiz posts one parent message per question and never fetches", () => {
  const { fakeWindow, posts } = mockWindow();
  const origWindow = globalThis.window;
  globalThis.window = fakeWindow;
  const fetchCalls = [];
  globalThis.fetch = () => {
    fetchCalls.push("fetch");
    return Promise.resolve({ ok: true, text: () => Promise.resolve("") });
  };
  try {
    const quiz = loadBank("topics/percentage/percentage-quiz-data.js").percentages;
    const answers = {};
    quiz.forEach((q) => {
      answers[q.id] = q.answer;
    });
    tracker.reportQuiz(tracker.QUIZ_META.percentages, quiz, answers);
    const parentPosts = posts.filter((p) => p.target === "parent");
    const topPosts = posts.filter((p) => p.target === "top");
    assert.equal(parentPosts.length, 10);
    assert.equal(topPosts.length, 10);
    assert.equal(fetchCalls.length, 0);
    parentPosts.forEach((p, i) => {
      assert.equal(p.data.questionId, "pct-q" + quiz[i].id);
      assert.equal(p.data.isCorrect, true);
      assert.equal(p.origin, "*");
    });
  } finally {
    globalThis.window = origWindow;
    delete globalThis.fetch;
  }
});

check("uni-tracker mapping would POST math_quiz_attempts without a network call", () => {
  const session = { userId: "test-user", epStudentId: "s1", subject: "MATH" };
  const quiz = loadBank("topics/probability/probability-quiz-data.js").probability;
  const payload = tracker.buildPayload(tracker.QUIZ_META.probability, quiz[3], 0, true);
  const mapped = tracker.supabaseBodyFromEvent(session, payload);
  assert.equal(mapped.table, "math_quiz_attempts");
  assert.equal(mapped.body.student_id, "test-user");
  assert.equal(mapped.body.quiz_id, "math-probability");
  assert.equal(mapped.body.question_id, "prob-q4");
  assert.equal(mapped.body.selected_answer, "0");
  assert.equal(mapped.body.is_correct, true);
});

check("runners still call MathQuizTracker.reportQuiz and do not inline fetch", () => {
  for (const bank of BANKS) {
    const src = fs.readFileSync(path.join(root, bank.runner), "utf8");
    assert.ok(src.includes("MathQuizTracker.reportQuiz"), bank.runner + " missing reportQuiz");
    assert.ok(!/fetch\s*\(/.test(src), bank.runner + " must not fetch");
    assert.ok(!/supabase/i.test(src), bank.runner + " must not mention supabase");
  }
});

if (failed) {
  console.error(failed + " failed");
  process.exit(1);
}
console.log("all tests passed");
