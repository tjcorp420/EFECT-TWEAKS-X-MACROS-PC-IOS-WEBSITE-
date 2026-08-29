const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const ignoredDirectories = new Set([".git", ".vercel", "dist", "node_modules", "payhip-vouch-assets"]);
const repositoryOnlyFiles = new Set(["payhip-brand-kit.html", "payhip-emx-header-injection.html"]);
const errors = [];

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) return [];
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

const files = walk(root);
const relative = file => path.relative(root, file).replaceAll("\\", "/");

for (const file of files.filter(file => file.endsWith(".js"))) {
  const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (result.status !== 0) errors.push(`${relative(file)}: ${String(result.stderr || result.stdout).trim()}`);
}

for (const file of files.filter(file => file.endsWith(".json"))) {
  try { JSON.parse(fs.readFileSync(file, "utf8")); }
  catch (error) { errors.push(`${relative(file)}: invalid JSON (${error.message})`); }
}

const routePrefixes = ["/api/", "/download/", "/r/", "/c/"];
for (const file of files.filter(file => file.endsWith(".html") && !repositoryOnlyFiles.has(path.basename(file)))) {
  const source = fs.readFileSync(file, "utf8");
  if (!/<html[^>]+lang=["']en["']/i.test(source)) errors.push(`${relative(file)}: missing English lang attribute`);
  if (!/<title>[^<]+<\/title>/i.test(source) && !relative(file).includes("header-injection")) errors.push(`${relative(file)}: missing title`);

  const references = source.matchAll(/(?:src|href)=["']([^"'?#]+)[^"']*["']/gi);
  for (const match of references) {
    const value = match[1];
    if (/^(?:https?:|mailto:|tel:|data:|javascript:|#|\/\/)/i.test(value)) continue;
    if (routePrefixes.some(prefix => value.startsWith(prefix))) continue;
    const clean = value.replace(/^\.\//, "").replace(/^\//, "");
    const target = path.resolve(path.dirname(file), clean);
    const rootTarget = path.resolve(root, clean);
    if (!fs.existsSync(target) && !fs.existsSync(rootTarget)) errors.push(`${relative(file)}: missing local reference ${value}`);
  }
}

const combinedRuntimeSource = files
  .filter(file => /\.(?:html|js|css|json)$/i.test(file))
  .filter(file => !relative(file).startsWith("scripts/") && !relative(file).startsWith("docs/"))
  .filter(file => !repositoryOnlyFiles.has(path.basename(file)))
  .map(file => fs.readFileSync(file, "utf8"))
  .join("\n");

if (combinedRuntimeSource.includes("emx-affiliate-tracking.vercel.app")) {
  errors.push("runtime source still references the retired external affiliate application");
}
if (/searchParams\.set\(["']af["']/.test(combinedRuntimeSource)) {
  errors.push("runtime source still writes Payhip affiliate parameters");
}
if (/fake-review-card/i.test(combinedRuntimeSource)) {
  errors.push("runtime source references fabricated review-card assets");
}

if (errors.length) {
  console.error(`EMX validation failed with ${errors.length} issue(s):`);
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`EMX validation passed: ${files.length} source files, JavaScript syntax, JSON, and local references checked.`);
