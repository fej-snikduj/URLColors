# URLColors

A browser extension that highlights the body of a webpage with a colored border for URLs that match user settings.

This extension allows you to flag specified websites by highlighting the website with a colored border. This is especially useful for developers who run their web applications on many different environments and who are constantly switching between a dev, test, and production version of an app or database. Because the application may look the same on all environments, it's easy to accidentally do something on the production environment that shouldn't have been done.

With URLColors, you can easily have the browser flag important websites for you by specifying the keyword to match against the tab url, the border color, width, whether or not the border should blink, and the interval of blinking.

Website: www.urlcolors.com

Install from the [Chrome Web Store](https://chromewebstore.google.com/detail/urlcolors/jjccpcminoppplpmcfghflolejbdkekm?utm_source=github&utm_medium=readme), [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/urlcolors/cdoalbcobgfnhdmkgeacpaongangjfpk?utm_source=github&utm_medium=readme) or [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/url-colors-env-detection/?utm_source=github&utm_medium=readme).

Works in Chrome and other Chromium browsers (Edge, Brave, Opera, Vivaldi), plus Firefox and Safari.

Trusted by 9,000+ users.

Initially built in 2017 by [@fej-snikduj](https://www.github.com/fej-snikduj) and [@dzoba](https://www.github.com/dzoba)

## Development

The repo root is the Chrome build. To try it, open `chrome://extensions`, turn on Developer mode and choose
**Load unpacked**. Edge, Brave, Opera and Vivaldi use the same build.

### Build upload packages

```bash
npm run build:chrome    # dist/urlcolors-chrome-<version>.zip (Chrome Web Store and Edge Add-ons)
npm run build:firefox   # dist/urlcolors-firefox-<version>.zip (addons.mozilla.org)
npm run build           # both
```

Each zip contains only the files the extension needs.

### Firefox

Firefox uses its own `manifest.firefox.json`, because its Manifest V3 needs `background.scripts` and a
[`gecko.id`](https://extensionworkshop.com/documentation/develop/extensions-and-the-add-on-id/). It must match
`manifest.json` on every other key, and `npm run check:manifests` fails if it doesn't. Leave the `gecko.id` alone: it
identifies the published add-on.

To test, run `npm run build:firefox`, then open `about:debugging#/runtime/this-firefox`, choose **Load Temporary
Add-on** and pick `dist/firefox/manifest.json`.

### Safari

`safari/URLColors/` is an Xcode project that wraps the extension in a macOS app. Its extension target keeps its own
copies of the shared files in `URLColors Extension/Resources/`. After editing a shared file, run:

```bash
npm run sync:safari    # copies the shared files into the Safari project
npm run check:safari   # fails if the copies differ from the repo root
```

To test, open the project in Xcode and run the **URLColors** scheme. The app explains how to enable the extension.
You'll need **Allow Unsigned Extensions** in Safari's Developer settings, since the local build isn't signed.
