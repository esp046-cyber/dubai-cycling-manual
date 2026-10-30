// Validates tip data and required project files. Run: node tests/tips.test.js
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
let failures = 0;
function check(name, ok, detail) {
  console.log((ok ? "PASS " : "FAIL ") + name + (detail ? " (" + detail + ")" : ""));
  if (!ok) failures++;
}

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, "assets/tips-data.js"), "utf8"), sandbox);
const tips = sandbox.window.DJP_TIPS;
const cats = sandbox.window.DJP_CATEGORIES;

check("at least 120 tips", tips.length >= 120, tips.length + " tips");
check("exactly 6 categories", cats.length === 6);
check("unique tip ids", new Set(tips.map((t) => t.id)).size === tips.length);
check("every tip has a known category", tips.every((t) => cats.some((c) => c.id === t.cat)));
check("every tip has title and text", tips.every((t) => t.title && t.text && t.text.length > 20));
cats.forEach((c) => {
  const n = tips.filter((t) => t.cat === c.id).length;
  check("category '" + c.id + "' has 15+ tips", n >= 15, n + " tips");
});
check("no duplicate titles", new Set(tips.map((t) => t.title)).size === tips.length);

const required = [
  "index.html", "style.css", "script.js", "manifest.json", "service-worker.js", "offline.html",
  "favicon.ico", "icon-192.png", "icon-512.png", "assets/og-image.png", "assets/tips-data.js",
  "README.md", ".gitignore", "package.json", ".env.example", "LICENSE", "robots.txt",
  "sitemap.xml", "browserconfig.xml", "zip-builder.html"
];
required.forEach((f) => check("file exists: " + f, fs.existsSync(path.join(root, f))));
["assets", "screenshots", "tests", "docs", "config"].forEach((d) =>
  check("directory exists: " + d, fs.existsSync(path.join(root, d))));

try { JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8")); check("manifest.json is valid JSON", true); }
catch (e) { check("manifest.json is valid JSON", false, e.message); }

const sw = fs.readFileSync(path.join(root, "service-worker.js"), "utf8");
check("service worker precaches tips-data.js", sw.includes("./assets/tips-data.js"));

console.log(failures ? "\n" + failures + " check(s) failed" : "\nAll checks passed");
process.exit(failures ? 1 : 0);
