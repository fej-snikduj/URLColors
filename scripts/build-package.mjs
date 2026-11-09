// Builds the upload package for a browser store: stages only the files the
// extension needs into dist/<target>/ and zips them to
// dist/urlcolors-<target>-<version>.zip. Nothing else (docs, the Safari
// project, images, node_modules, tooling) goes in, so the zip stays tiny.
//
//   node scripts/build-package.mjs chrome    Chrome Web Store, and Edge Add-ons (same package)
//   node scripts/build-package.mjs firefox   addons.mozilla.org (uses manifest.firefox.json)
import { cpSync, mkdirSync, rmSync, copyFileSync, readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

// The manifest's source file differs per browser; everything else is shared.
const MANIFESTS = { chrome: "manifest.json", firefox: "manifest.firefox.json" };

const SHARED_FILES = [
  "urlColorsContentScript.js",
  "urlColorsServiceWorker.js",
  "urlColorsPopup.html",
  "urlColorsPopup.js",
  "icons",
];

const target = process.argv[2];
if (!(target in MANIFESTS)) {
  console.error(`Usage: node scripts/build-package.mjs <${Object.keys(MANIFESTS).join("|")}>`);
  process.exit(1);
}

const manifestPath = `${root}${MANIFESTS[target]}`;
const { version } = JSON.parse(readFileSync(manifestPath, "utf8"));
const dist = `${root}dist`;
const stageDir = `${dist}/${target}`;
const zipPath = `${dist}/urlcolors-${target}-${version}.zip`;

rmSync(stageDir, { recursive: true, force: true });
rmSync(zipPath, { force: true });
mkdirSync(stageDir, { recursive: true });

for (const name of SHARED_FILES) {
  if (!existsSync(`${root}${name}`)) {
    throw new Error(`Missing source file: ${name}`);
  }
  cpSync(`${root}${name}`, `${stageDir}/${name}`, { recursive: true });
}
copyFileSync(manifestPath, `${stageDir}/manifest.json`);

// -X drops extra file attributes, -r recurses, -q keeps the output quiet. The
// manifest has to sit at the zip's root, hence zipping from inside stageDir.
execFileSync("zip", ["-X", "-r", "-q", zipPath, "."], { cwd: stageDir });

console.log(`${target} ${version}: ${zipPath}`);
if (target === "firefox") {
  console.log('To test first: about:debugging#/runtime/this-firefox -> "Load Temporary Add-on",');
  console.log(`then pick ${stageDir}/manifest.json.`);
}
