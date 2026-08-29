const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const output = path.join(root, "dist");
const excluded = new Set([
  ".git", ".vercel", "dist", "docs", "node_modules", "payhip-vouch-assets", "scripts", "tests"
]);
const excludedFiles = new Set([
  ".gitignore", ".vercelignore", "tmp-payhip-builder.js", "payhip-brand-kit.html", "payhip-emx-header-injection.html",
  "emx-volt-binds-real.png", "emx-volt-dashboard-real.png", "emx-volt-macros-real.png", "emx-volt-support-real.png"
]);

const validation = spawnSync(process.execPath, [path.join(__dirname, "validate-site.js")], { stdio: "inherit" });
if (validation.status !== 0) process.exit(validation.status || 1);

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

function copyDirectory(source, destination) {
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    if (entry.isDirectory() && excluded.has(entry.name)) continue;
    if (entry.isFile() && (excludedFiles.has(entry.name) || entry.name.endsWith(".md"))) continue;
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(destinationPath, { recursive: true });
      copyDirectory(sourcePath, destinationPath);
    } else {
      fs.copyFileSync(sourcePath, destinationPath);
    }
  }
}

copyDirectory(root, output);

let fileCount = 0;
let totalBytes = 0;
function measure(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) measure(fullPath);
    else { fileCount += 1; totalBytes += fs.statSync(fullPath).size; }
  }
}
measure(output);
console.log(`EMX production artifact created: dist/ (${fileCount} files, ${totalBytes} bytes).`);
