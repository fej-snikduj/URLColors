// manifest.json and manifest.firefox.json are maintained as two full files
// rather than generated from one template, since they differ in only two
// keys. That's simple to read, but nothing stops them drifting apart when one
// is edited and not the other, so this checks every other key still matches.
import { readFileSync } from "node:fs";

const ALLOWED_TO_DIFFER = new Set(["background", "browser_specific_settings"]);

const chrome = JSON.parse(readFileSync(new URL("../manifest.json", import.meta.url)));
const firefox = JSON.parse(readFileSync(new URL("../manifest.firefox.json", import.meta.url)));

const keys = new Set([...Object.keys(chrome), ...Object.keys(firefox)]);
const problems = [];

for (const key of keys) {
  if (ALLOWED_TO_DIFFER.has(key)) {
    continue;
  }
  const a = JSON.stringify(chrome[key]);
  const b = JSON.stringify(firefox[key]);
  if (a !== b) {
    problems.push(
      `"${key}" differs:\n  manifest.json:         ${a}\n  manifest.firefox.json: ${b}`
    );
  }
}

if (problems.length > 0) {
  console.error("manifest.json and manifest.firefox.json have drifted apart:\n");
  console.error(problems.join("\n\n"));
  console.error(
    `\nIf this divergence is intentional, add the key to ALLOWED_TO_DIFFER in ${import.meta.url}.`
  );
  process.exit(1);
}

console.log("manifest.json and manifest.firefox.json agree on every shared key.");
