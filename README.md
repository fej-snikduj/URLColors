# URLColors

**An environment indicator for your browser.** URLColors puts a colored border around any tab whose URL matches your rules, so you can tell production, staging and dev apart at a glance and stop doing things in the wrong environment.

It's a simple tool for identifying which web environment you're in. Developers often run the same app in dev, test, staging and production, and the environments look identical, so it's easy to do something in production that you meant to do somewhere else. URLColors makes the environment obvious: match a keyword against the tab URL, pick a border color and width, and optionally make it blink.

**Who it's for:** anyone who works across several environments of the same site. Developers deploying and debugging, QA testers filing bugs against the right build, and DevOps, SRE and support teams working in production consoles and admin panels all use it to avoid acting in the wrong place.

- Color-code production, staging and dev tabs
- Match any part of the URL, including localhost ports and wildcard subdomains
- Choose color, width, opacity and blinking, and snooze it before a screen share
- Works on sites you don't control, like cloud consoles and admin panels
- No account, no tracking, no network requests

Website: [www.urlcolors.com](https://www.urlcolors.com)

Install from the [Chrome Web Store](https://chromewebstore.google.com/detail/urlcolors/jjccpcminoppplpmcfghflolejbdkekm?utm_source=github&utm_medium=readme), [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/urlcolors/cdoalbcobgfnhdmkgeacpaongangjfpk?utm_source=github&utm_medium=readme), [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/url-colors-env-detection/?utm_source=github&utm_medium=readme) or the [Mac App Store](https://apps.apple.com/app/id6829335357) (Safari).

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
