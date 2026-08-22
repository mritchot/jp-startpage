# JP-STARTPAGE

A browser startpage built around a Japanese terminal interface.

Everything runs off the keyboard. Press a category key to open its panel, press a link key to follow it, press `/` to search.

Last Update: 22/08/26

[LIVE PREVIEW](https://mritchot.github.io/jp-startpage/)

## INSTALLATION INSTRUCTIONS

### As a real new tab (best)

This folder is also a browser extension. `manifest.json` is already set up, so there is nothing to build.

- **Chrome** — go to `chrome://extensions`, turn on Developer mode, choose *Load unpacked*, and select this folder.
- **Firefox** — go to `about:debugging`, *This Firefox*, *Load Temporary Add-on*, and pick `manifest.json`. Firefox drops temporary add-ons on restart.

### As a home page

1. Fork this repo.
2. Enable GitHub Pages for your fork at `Settings > Pages > Source [Deploy from a branch] > Branch [main / root] > Save`
3. Point your browser at it:
   - **Firefox** — menu button, Settings, Home panel, then set *Homepage and new windows* to Custom URLs and paste your GitHub Pages link.
   - **Chrome** — Settings, On startup, *Open a specific page*, and paste the same link.

### As a new tab, without packaging anything

If you would rather not load an extension yourself, a redirector pointed at your Pages URL also works.

- Firefox: [New Tab Override](https://addons.mozilla.org/en-US/firefox/addon/new-tab-override/)
- Chromium: [Custom New Tab URL](https://chromewebstore.google.com/detail/custom-new-tab-url/mmjbdbjnoablegbkcklggeknkfcjkjia)

Or just open `index.html` off your disk.
## CONFIGURATION

Everything lives behind `設定 CONFIG` in the bottom right. It all persists to localStorage, so it survives reloads and stays on the machine.

**01 COLOUR · 色** — three accent presets and three ground presets. Each preset carries a light and a dark value, so picking one changes both modes. Under each row is a hex field: type six digits and it takes over from the presets. The hex only sets the mode you are currently looking at. The note under the fields tells you which mode you are editing.

**02 DISPLAY · 表示** — `SYSTEM` follows your operating system's light or dark setting, or force `LIGHT` / `DARK`. `GRID` toggles the grid texture. `24H` / `12H` sets the clock. `TEXT FITS BOX` shrinks type until it fits the box height; `BOX GROWS TO TEXT` does the reverse. `PANELS TOP` / `PANELS MID` moves the vertical labels and link lists; the clock always stays centred. `TEXT` scales type from 60% to 160%. `HEIGHT` sets box height from 200 to 760px. It shows `CAPPED` when the window is too short to honour it, and your setting is kept for when there is room again. `FAVICONS` shows a site icon beside each link; it is off by default because turning it on asks Google for an icon per domain.

**03 GREETING · 挨拶** — `ONE GREETING` for a fixed line, or `BY TIME OF DAY` for four that swap on the hours you set. The number is the hour that band starts. The active band is highlighted. Type size is fixed against the longest of them.

**04 WEATHER · 天気** — `MANUAL` looks up whatever city you type. `APPROX` places you by IP address, which asks no permission. `PRECISE` uses the browser's location, which will prompt. The `°C` / `°F` button converts. Data comes from Open-Meteo, refreshed every 30 minutes and cached between.

**05 QUOTE · 引用** — see the QUOTES section below.

**06 PANELS · パネル** — the dropdown picks which panel you are editing; `＋` adds one and `×` deletes it. Below that, the panel's name and its hotkey letter. The list underneath is that panel's links — drag the ⣿ handle to reorder, `×` on a row to remove it. The bottom row adds a link: label, hotkey, URL. The hotkey is highlighted inside the label as `/g/mail`, and leaving it blank uses the first letter. Panels themselves reorder by dragging them in the main rail.

**07 IMAGE · 画像** — `ADD IMAGE` opens a picker, or drop files straight onto the box. `‹` `›` step through, `×` removes the current one. Thumbnails jump to any image. `CROP` zooms from 100% to 400%, `FIT` resets it, and dragging inside the box repositions. `ROTATE` changes the image on every OPEN, hourly, daily, weekly, or never. Images are stored as data URLs in localStorage, so a handful of large ones will fill it.

**08 SEARCH · 検索** — the dropdown sets the default engine, and `SEARCH ON` / `OFF` controls whether `/` does anything. The field below adds your own engine: paste a search URL with `%s` where the query goes, like `https://example.com/search?q=%s`, and it appears in the list on prefix `c`.

**09 TAB · タブ** — the browser tab title.

**10 CONFIG · 設定** — `EXPORT` downloads your whole setup as a `.json` file. `IMPORT` loads one back. `RESET DEFAULTS` at the bottom wipes everything after confirming.

## THE TERMINAL LINE

Press a panel's letter to open it, then a link's letter to follow it. What you pressed stays on the line until the next key or `ESC`.

Press `/` and it types a slash, after which everything you type is text. `ENTER` searches, `BACKSPACE` deletes, `ESC` clears. A single letter right after the slash picks an engine for that one search — `/w pixel art` goes to Wikipedia regardless of your default.

## QUOTES

The quote in the top left advances on a schedule, or whenever you click it.

**BUILT-IN** is four lines that ship with the page. No network, nothing to set up.

**CUSTOM** takes your own, typed straight into the box, one per line:

```
Ada Lovelace, The Analytical Engine weaves algebraic patterns.
Sun Tzu, Every battle is won, or lost, before it is fought.
A line with no comma is used as-is, with nobody attributed.
```

Only the first comma splits, so commas inside the quote itself are safe.

**URL** pulls the same format from a remote file. A GitHub Gist is the easy way: make a gist, paste your quotes in, copy the raw file URL into the field, hit PULL. A `gist.github.com/...` page URL works too — it gets resolved through the API. Whatever comes back is cached locally, so it survives reloads and keeps working offline.

ROTATE sets how often the quote changes on its own: every OPEN, hourly, daily, weekly, or OFF.

## SYNC

Each browser keeps its own settings. `11 SYNC` moves a setup between them through a secret GitHub Gist.

Make a [classic personal access token](https://github.com/settings/tokens) with **only** the `gist` scope, give it an expiry, and paste it into the token field. Then:

- **PUSH** writes your current setup to a gist. The first push creates a secret one and fills in the gist ID.
- **PULL** reads that gist back and applies it.

On the second browser, paste the same token and the same gist ID, then PULL.

PUSH overwrites the gist, PULL overwrites what is local. The line above the buttons shows when this browser last synced.

**The token never leaves the browser you typed it into**: it is excluded from the synced payload and from the `10 CONFIG` export, so sharing a config cannot leak it. The gist ID is left out of exports for the same reason — a GitHub secret gist is unlisted rather than private, so anyone holding the URL can read it. Treat the ID as semi-private and type it into each browser by hand. And **dropped images do not sync**, since they are data URLs living in a separate localStorage key.

The token is stored in plain localStorage, which anyone with access to that browser profile can read. localStorage is also shared across an origin: every site under the same `username.github.io` shares one store, so any other GitHub Pages site on that account could read a token pasted into a Pages-hosted copy. Keep sync to the extension or a locally opened copy.

## DETAILS

- Fonts are [DotGothic16](https://fonts.google.com/specimen/DotGothic16) and [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono), served from `fonts/` rather than a CDN — about 36 KB for all three faces. Loading the page makes no third-party request at all. DotGothic16 is subset to the 348 glyphs this interface renders; type a kanji outside that set and it still shows, just in a system face rather than dot-matrix. See `fonts/README.md`.
- The only network calls are ones you turn on: weather, pulling quotes from a URL, gist sync, and link favicons.
- Weather comes from [Open-Meteo](https://open-meteo.com/), which needs no API key.
- Link favicons are off by default. Switching them on asks Google for an icon per domain, which hands Google your bookmark list.
- Drop images or GIFs straight onto the image box. They are stored as data URLs in localStorage.
- With no network the weather and quotes fall back to built-in values and everything else carries on.

## LICENSE

MIT. See [LICENSE](LICENSE).
