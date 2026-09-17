import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const topicsRoot = path.join(repoRoot, "dashboard", "topics");
const sharedRoot = path.join(repoRoot, "dashboard", "shared");
const slidesRoot = path.join(repoRoot, "dashboard", "slides");
const packsRoot = path.join(repoRoot, "content-packs");

/** S3 gallery lessons (JM24–JM35), titles from the Maths Topics List V4 CSV. */
const LESSONS = [
  {
    order: 24,
    chapterCode: "JM24",
    scope: "law-of-indices",
    directory: "jm24-law-of-indices",
    source: "law_of_indices",
    slug: "jm24-law-of-indices",
    title: { en: "Laws of Indices", zhHant: "指數定律" },
    tabs: { notes: "concept", tools: "tools", games: "games", comics: "comics", summaries: "summary", quizzes: "quiz" },
  },
  {
    order: 25,
    chapterCode: "JM25",
    scope: "factorization-polynomials",
    directory: "jm25-factorization-polynomials",
    source: "factorization_polynomials",
    slug: "jm25-factorization-polynomials",
    title: { en: "More about Factorization of Polynomials", zhHant: "續多項式因式分解" },
    tabs: { notes: "concept", tools: "tools", games: "games", comics: "comics", summaries: "summary", quizzes: "quiz" },
  },
  {
    order: 26,
    chapterCode: "JM26",
    scope: "inequalities",
    directory: "jm26-inequalities",
    source: "inequality",
    slug: "jm26-inequalities",
    title: { en: "Inequalities I", zhHant: "不等式 I" },
    tabs: { notes: "slides", tools: "tools", games: "game", comics: "comics", summaries: "summary", quizzes: "quiz" },
    slides: "inequality",
  },
  {
    order: 27,
    chapterCode: "JM27",
    scope: "percentages-ii",
    directory: "jm27-percentages",
    source: "percentage",
    slug: "jm27-percentages",
    title: { en: "Percentages II", zhHant: "百分比 II" },
    tabs: { notes: "slides", tools: "tools", games: "game", comics: "comics", summaries: "summary", quizzes: "quiz" },
    slides: "percentage",
  },
  {
    order: 28,
    chapterCode: "JM28",
    scope: "triangle-centres",
    directory: "jm28-triangle-centres",
    source: "triangle_centres",
    slug: "jm28-triangle-centres",
    title: { en: "Special Lines and Centres in Triangles", zhHant: "三角形的特殊線和中心" },
    tabs: { notes: "concept", tools: "tools", games: "games", comics: "comics", summaries: "summary", quizzes: "quiz" },
  },
  {
    order: 29,
    chapterCode: "JM29",
    scope: "quadrilaterals",
    directory: "jm29-quadrilaterals",
    source: "quadrilaterals",
    slug: "jm29-quadrilaterals",
    title: { en: "Quadrilaterals", zhHant: "四邊形" },
    tabs: { notes: "concept", tools: "tools", games: "games", comics: "comics", summaries: "summary", quizzes: "quiz" },
  },
  {
    order: 30,
    chapterCode: "JM30",
    scope: "probabilities",
    directory: "jm30-probabilities",
    source: "probability",
    slug: "jm30-probabilities",
    title: { en: "Probabilities", zhHant: "概率" },
    tabs: { notes: "slides", tools: "tools", games: "game", comics: "comics", summaries: "summary", quizzes: "quiz" },
    slides: "probability",
  },
  {
    order: 31,
    chapterCode: "JM31",
    scope: "central-tendency",
    directory: "jm31-central-tendency",
    source: "central_tendency",
    slug: "jm31-central-tendency",
    title: { en: "Measures of Central Tendencies", zhHant: "趨勢測量" },
    tabs: { notes: "concept", tools: "tools", games: "games", comics: "comics", summaries: "summary", quizzes: "quiz" },
  },
  {
    order: 32,
    chapterCode: "JM32",
    scope: "areas-and-volumes-iii",
    directory: "jm32-areas-volumes",
    source: "area_volume",
    slug: "jm32-areas-volumes",
    title: { en: "Areas and Volumes III", zhHant: "面積和體積 III" },
    tabs: { notes: "slides", tools: "tools", games: "game", comics: "comics", summaries: "summary", quizzes: "quiz" },
    slides: "area_volume",
  },
  {
    order: 33,
    chapterCode: "JM33",
    scope: "coordinates-of-straight-lines",
    directory: "jm33-coordinates",
    source: "coordinates",
    slug: "jm33-coordinates",
    title: { en: "Coordinates of Straight Lines", zhHant: "直線坐標" },
    tabs: { notes: "concept", tools: "tools", games: "games", comics: "comics", summaries: "summary", quizzes: "quiz" },
  },
  {
    order: 34,
    chapterCode: "JM34",
    scope: "trigonometric-relations",
    directory: "jm34-trigonometric-relations",
    source: "trigonometry",
    slug: "jm34-trigonometric-relations",
    title: { en: "Trigonometric Relations", zhHant: "三角關係" },
    tabs: { notes: "concept", tools: "tools", games: "games", comics: "comics", summaries: "summary", quizzes: "quiz" },
  },
  {
    order: 35,
    chapterCode: "JM35",
    scope: "application-of-trigonometry",
    directory: "jm35-application-of-trigonometry",
    source: "trigonometry_applications",
    slug: "jm35-application-of-trigonometry",
    title: { en: "Application of Trigonometry", zhHant: "三角學應用" },
    tabs: { notes: "concept", tools: "tools", games: "games", comics: "comics", summaries: "summary", quizzes: "quiz" },
  },
];

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(src, dest);
    else fs.copyFileSync(src, dest);
  }
}

function rewriteSharedRefs(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      rewriteSharedRefs(absolute);
      continue;
    }
    if (!/\.(html|js|css)$/.test(entry.name)) continue;
    const raw = fs.readFileSync(absolute, "utf8");
    const next = raw
      .replaceAll("../../shared/", "../shared/")
      .replaceAll("../../slides/", "slides/");
    if (next !== raw) fs.writeFileSync(absolute, next);
  }
}

function embedTool(lesson, section, tab) {
  return {
    slug: lesson.slug,
    toolId: `${lesson.slug}-${section}`,
    section,
    query: `embed=1&tab=${tab}`,
    title: lesson.title,
  };
}

function writeManifest(lesson) {
  const tools = [
    embedTool(lesson, "notes", lesson.tabs.notes),
    embedTool(lesson, "tools", lesson.tabs.tools),
    embedTool(lesson, "comics", lesson.tabs.comics),
    embedTool(lesson, "summaries", lesson.tabs.summaries),
    embedTool(lesson, "quizzes", lesson.tabs.quizzes),
  ];
  const games = [embedTool(lesson, "games", lesson.tabs.games)];
  const manifest = {
    packId: `math-${lesson.directory}-v1`,
    subject: "MATH",
    chapter: `${lesson.chapterCode} ${lesson.title.en}`,
    chapterCode: lesson.chapterCode,
    scope: lesson.scope,
    order: lesson.order,
    published: true,
    title: lesson.title,
    source: `dashboard/topics/${lesson.source}`,
    notes: [],
    comics: [],
    tools,
    games,
    summaries: [],
    flashcards: [],
    quiz: [],
  };
  fs.writeFileSync(
    path.join(packsRoot, lesson.directory, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
}

function buildLesson(lesson) {
  const sourceDir = path.join(topicsRoot, lesson.source);
  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Missing topic folder: ${lesson.source}`);
  }
  const packDir = path.join(packsRoot, lesson.directory);
  const toolDir = path.join(packDir, "tools", lesson.slug);
  const sharedDest = path.join(packDir, "tools", "shared");
  fs.rmSync(packDir, { recursive: true, force: true });
  copyDir(sourceDir, toolDir);
  copyDir(sharedRoot, sharedDest);
  if (lesson.slides) {
    const from = path.join(slidesRoot, lesson.slides);
    if (fs.existsSync(from)) {
      copyDir(from, path.join(toolDir, "slides", lesson.slides));
    }
  }
  rewriteSharedRefs(toolDir);
  writeManifest(lesson);
}

fs.mkdirSync(packsRoot, { recursive: true });
for (const lesson of LESSONS) {
  buildLesson(lesson);
  console.log(`packed ${lesson.chapterCode} ${lesson.directory}`);
}

fs.writeFileSync(
  path.join(packsRoot, "README.md"),
  `# Math chapter packs

All-In-One lists MATH Learning Tools by scanning \`CONTENT_PACK_ROOTS\` for \`*/manifest.json\`.

S3 lessons **JM24–JM35** match the Maths Topics List and the dashboard gallery. Each chapter copies the topic HTML into \`tools/<slug>/\` plus shared CSS/JS. Concept, tools, games, comics, summary, and quiz are the same embed with \`?embed=1&tab=\`.

Do not point \`CONTENT_PACK_ROOT\` at a single chapter folder.

\`\`\`bash
node scripts/build-content-packs.mjs
\`\`\`
`,
);
