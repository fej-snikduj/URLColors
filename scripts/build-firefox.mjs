// Assembles the Firefox package into dist/firefox/: the shared source files
// plus manifest.firefox.json renamed to manifest.json (Firefox, like Chrome,
// only reads a file with that exact name). Not zipped — AMO's upload accepts
// either a folder-turned-zip or a temporary-add-on folder as-is.
import { cpSync, mkdirSync, rmSync, copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const outDir = fileURLToPath(new URL("../dist/firefox", import.meta.url));

const SHARED_FILES = [
  "urlColorsContentScript.js",
  "urlColorsServiceWorker.js",
  "urlColorsPopup.html",
  "urlColorsPopup.js",
  "icons",
];

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

for (const name of SHARED_FILES) {
  cpSync(`${root}${name}`, `${outDir}/${name}`, { recursive: true });
}
copyFileSync(`${root}manifest.firefox.json`, `${outDir}/manifest.json`);

console.log(`Firefox package assembled in ${outDir}`);
console.log('Load it in about:debugging#/runtime/this-firefox ("Load Temporary Add-on",');
console.log("pick manifest.json in that folder) to test before submitting to AMO.");
