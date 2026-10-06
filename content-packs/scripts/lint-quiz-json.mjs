#!/usr/bin/env node
/**
 * Lint All-In-One quiz JSON in this pack tree.
 *
 * Uni+ treats `$…$` as math. A stray `$` or a literal `\n` in the string
 * stops auto-wrapping, so `\ge` / `\frac` render as glued junk. Fix the
 * JSON here instead of adding renderer special cases.
 *
 *   bun content-packs/scripts/lint-quiz-json.mjs
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const PACK_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LATEX_COMMAND = /\\(?:[a-zA-Z]+|[,;:])/;
const LATEX_SCRIPT = /(?:\^|_)\s*\{/;
const LITERAL_NEWLINE = /\\n(?![a-z])/;
const PROSE_DOLLAR = /\$[A-Za-z]{3,}/;
const CURRENCY_DOLLAR = /(?<!\\)\$(?=\d)/;
const HAS_DOLLAR = /(?<!\\)\$/;

function listQuestionFiles(dir, found = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) listQuestionFiles(path, found);
    else if (entry.name === "questions.json") found.push(path);
  }
  return found;
}

function stripMath(text) {
  return text.replace(/\$\$[\s\S]+?\$\$|\$[^$\n]+\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)/g, " ");
}

function countUnescapedDollars(text) {
  let count = 0;
  for (let index = 0; index < text.length; index += 1) {
    if (text[index] !== "$") continue;
    if (text[index - 1] === "\\") continue;
    count += 1;
  }
  return count;
}

function lintField(path, itemId, field, text) {
  const issues = [];
  const loc = `${path} · ${itemId} · ${field}`;

  if (LITERAL_NEWLINE.test(text)) {
    issues.push(`${loc}: use a real JSON newline, not the two characters \\n`);
  }
  if (countUnescapedDollars(text) % 2 !== 0) {
    issues.push(`${loc}: unbalanced $ — wrap math as $…$ and write money as \\$30 000`);
  }
  if (PROSE_DOLLAR.test(text)) {
    issues.push(`${loc}: $ is glued to a word (e.g. $true). Only start math at $`);
  }

  const outsideMath = stripMath(text);
  if (
    HAS_DOLLAR.test(text) &&
    (LATEX_COMMAND.test(outsideMath) || LATEX_SCRIPT.test(outsideMath))
  ) {
    issues.push(`${loc}: raw TeX outside $…$ (a $ is already in this string, so Uni+ will not auto-wrap)`);
  }
  if (CURRENCY_DOLLAR.test(outsideMath)) {
    issues.push(`${loc}: bare $ before a number — write \\$30 000 so it is not math`);
  }

  return issues;
}

function lintQuizFile(absolutePath) {
  const rel = relative(PACK_ROOT, absolutePath);
  let payload;
  try {
    payload = JSON.parse(readFileSync(absolutePath, "utf8"));
  } catch (error) {
    return [`${rel}: invalid JSON (${error instanceof Error ? error.message : error})`];
  }

  const items = Array.isArray(payload?.items) ? payload.items : [];
  if (items.length === 0) return [`${rel}: missing items[]`];

  const issues = [];
  for (const item of items) {
    const id = typeof item?.id === "string" ? item.id : "(missing id)";
    if (typeof item?.stem === "string") issues.push(...lintField(rel, id, "stem", item.stem));
    else issues.push(`${rel} · ${id} · stem: missing string`);

    const options = Array.isArray(item?.options) ? item.options : [];
    for (const option of options) {
      const key = typeof option?.key === "string" ? option.key : "?";
      if (typeof option?.text === "string") {
        issues.push(...lintField(rel, id, `option ${key}`, option.text));
      }
    }
  }
  return issues;
}

const packFilter = process.argv.includes("--pack")
  ? process.argv[process.argv.indexOf("--pack") + 1]
  : "";
const files = listQuestionFiles(PACK_ROOT).filter((file) =>
  packFilter ? file.includes(`${packFilter}/`) : true,
);
if (packFilter && files.length === 0) {
  console.error(`No questions.json under ${packFilter}`);
  process.exit(1);
}
const issues = files.flatMap(lintQuizFile);

if (issues.length > 0) {
  console.error(`quiz JSON lint failed (${issues.length})\n`);
  for (const issue of issues) console.error(`  ${issue}`);
  process.exit(1);
}

console.log(`quiz JSON lint passed (${files.length} files)`);
