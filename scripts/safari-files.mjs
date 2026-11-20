// The files the Safari extension target keeps its own copies of (the converter
// that generated the Xcode project has no notion of a shared source tree).
// Used by both check-safari-resources.mjs and sync-safari-resources.mjs.
import { fileURLToPath } from "node:url";

export const root = fileURLToPath(new URL("..", import.meta.url));
export const safariResources = `${root}safari/URLColors/URLColors Extension/Resources/`;

export const SHARED_FILES = [
  "manifest.json",
  "urlColorsContentScript.js",
  "urlColorsServiceWorker.js",
  "urlColorsPopup.html",
  "urlColorsPopup.js",
];
