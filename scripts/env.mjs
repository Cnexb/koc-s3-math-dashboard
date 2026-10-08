// Shared helpers: load .env files (with ${VAR} expansion) and fill %VITE_*% placeholders.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const PLACEHOLDER = /%(VITE_[A-Z0-9_]+)%/g;

function parse(file, env) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!m) continue;
    env[m[1]] = m[2].replace(/\$\{(\w+)\}/g, (_, k) => env[k] || "");
  }
}

/** Load `.env.<mode>`; when `local` is true, `.env.local` overrides it (like Vite). */
export function loadEnv(root, mode, local = false) {
  const env = {};
  parse(join(root, `.env.${mode}`), env);
  if (local) parse(join(root, ".env.local"), env);
  return env;
}

export const hasPlaceholder = (html) => /%VITE_[A-Z0-9_]+%/.test(html);
export const fill = (html, env) => html.replace(PLACEHOLDER, (m, k) => (k in env ? env[k] : m));
