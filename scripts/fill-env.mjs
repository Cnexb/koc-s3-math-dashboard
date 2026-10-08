// Usage: node scripts/fill-env.mjs <mode> [dir]   (mode: production | develop; dir default: dashboard)
// Replaces %VITE_*% placeholders in every .html under dir, in place. Run in CI before deploy.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { fill, hasPlaceholder, loadEnv } from "./env.mjs";

const root = resolve(fileURLToPath(import.meta.url), "..", "..");
const mode = process.argv[2] || "production";
const dir = resolve(root, process.argv[3] || "dashboard");
const env = loadEnv(root, mode);
if (!Object.keys(env).length) {
  console.error(`No variables found in .env.${mode}`);
  process.exit(1);
}

let n = 0;
function walk(d) {
  return readdirSync(d, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]
  );
}

for (const p of walk(dir)) {
  if (!p.endsWith(".html")) continue;
  const f = p.slice(dir.length + 1);
  const html = readFileSync(p, "utf8");
  if (!hasPlaceholder(html)) continue;
  const out = fill(html, env);
  if (hasPlaceholder(out)) console.warn(`Unresolved placeholder in ${f}`);
  writeFileSync(p, out);
  n++;
}
console.log(`[${mode}] filled placeholders in ${n} file(s)`);
