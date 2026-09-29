// The Safari Xcode project's extension target holds its own copies of the
// shared source files (safari-web-extension-converter has no notion of a
// shared source tree, and re-running it would also regenerate everything else
// in the project). Nothing stops those copies drifting from the real source
// when only one side gets edited, so this fails the build if they ever differ.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const safariResources = `${root}safari/URLColors/URLColors Extension/Resources/`;

const SHARED_FILES = [
  "manifest.json",
  "urlColorsContentScript.js",
  "urlColorsServiceWorker.js",
  "urlColorsPopup.html",
  "urlColorsPopup.js",
];

const problems = [];
for (const name of SHARED_FILES) {
  const original = readFileSync(`${root}${name}`, "utf8");
  const copy = readFileSync(`${safariResources}${name}`, "utf8");
  if (original !== copy) {
    problems.push(name);
  }
}

if (problems.length > 0) {
  console.error(
    "These files differ between the repo root and safari/URLColors/URLColors Extension/Resources/:"
  );
  console.error(problems.map((f) => `  ${f}`).join("\n"));
  console.error(
    "\nCopy the current file(s) over (they're plain copies, not a build step) and rebuild the Xcode project to confirm it still compiles."
  );
  process.exit(1);
}

console.log("Safari's copies of the shared extension files match the repo root.");
