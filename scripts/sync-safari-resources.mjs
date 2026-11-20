// Copies the shared extension files from the repo root into the Safari Xcode
// project's extension target, so the copies never have to be made by hand.
// Run it after editing any of them; `npm run check:safari` verifies the result.
import { copyFileSync, readFileSync } from "node:fs";
import { root, safariResources, SHARED_FILES } from "./safari-files.mjs";

const updated = [];
for (const name of SHARED_FILES) {
  const source = `${root}${name}`;
  const target = `${safariResources}${name}`;
  if (readFileSync(source, "utf8") !== readFileSync(target, "utf8")) {
    copyFileSync(source, target);
    updated.push(name);
  }
}

if (updated.length === 0) {
  console.log("Safari's copies were already up to date.");
} else {
  console.log(`Updated in the Safari project: ${updated.join(", ")}`);
  console.log("Rebuild in Xcode to confirm it still compiles.");
}
