# JP-STARTPAGE

A browser startpage built around a Japanese terminal interface — vertical writing mode, DotGothic16, a fine graph-paper grid, and a single accent colour over near-black. It gave me an excuse to finally use `writing-mode: vertical-rl`, and to write a small solver that shrinks the type until every panel fits the same box height. The rule I set myself was one HTML file, no build step, no dependencies. It stayed that way.

Everything runs off the keyboard. Press a category key to open its panel, press a link key to follow it, press `/` to search.

Last Update: 22/08/26

[LIVE PREVIEW](https://mritchot.github.io/jp-startpage/)

## INSTALLATION INSTRUCTIONS

To use as a new Home page...

1. Fork this repo.
2. Enable GitHub Pages for your fork at `Settings > Pages > Source [Deploy from a branch] > Branch [main / root] > Save`
3. Set it as your Home page:
   - **Firefox** — menu button, Settings, Home panel, then set *Homepage and new windows* to Custom URLs and paste your GitHub Pages link.
   - **Chrome** — Settings, On startup, *Open a specific page*, and paste the same link.

To use as a new Tab...

You can use different Add-ons/Extensions for it

- Firefox: [New Tab Override](https://addons.mozilla.org/en-US/firefox/addon/new-tab-override/)
- Chromium: [Custom New Tab URL](https://chromewebstore.google.com/detail/custom-new-tab-url/mmjbdbjnoablegbkcklggeknkfcjkjia)

Or just open `index.html` off your disk. Nothing leaves the browser either way.

## CONFIGURATION

Everything lives behind `設定 CONFIG` in the bottom right. It all persists to localStorage, so it survives reloads and stays on the machine.

**01 COLOUR · 色** — three accent presets and three ground presets. Each preset carries a light and a dark value, so picking one changes both modes. Under each row is a hex field: type six digits and it takes over from the presets. The hex only sets the mode you are currently looking at, since a colour that reads on sand rarely reads on near-black. The note under the fields tells you which mode you are editing.

**02 DISPLAY · 表示** — `AUTO SUN` follows real sunrise and sunset for wherever the weather is pointed, or force `LIGHT` / `DARK`. `GRID` toggles the graph-paper texture. `24H` / `12H` sets the clock. `TEXT FITS BOX` shrinks type until it fits the box height; `BOX GROWS TO TEXT` does the reverse. `PANELS MID` / `PANELS TOP` moves the vertical labels and link lists; the clock always stays centred. `TEXT` scales type from 60% to 160%. `HEIGHT` sets box height from 200 to 760px — it shows `CAPPED` when the window is too short to honour it, and your setting is kept for when there is room again. `FAVICONS` shows a site icon beside each link; it is off by default because turning it on asks Google for an icon per domain, which hands over your bookmark list.

**03 GREETING · 挨拶** — `ONE GREETING` for a fixed line, or `BY TIME OF DAY` for four that swap on the hours you set. The number is the hour that band starts. The active band is highlighted. Type size is fixed against the longest of them, so nothing resizes when a band changes.

**04 WEATHER · 天気** — `MANUAL` looks up whatever city you type. `APPROX` places you by IP address, which asks no permission. `PRECISE` uses the browser's location, which will prompt. The `°C` / `°F` button converts. Data comes from Open-Meteo, refreshed every 30 minutes and cached between.

**05 QUOTE · 引用** — see the QUOTES section below.

**06 PANELS · パネル** — the dropdown picks which panel you are editing; `＋` adds one and `×` deletes it. Below that, the panel's name and its hotkey letter. The list underneath is that panel's links — drag the ⣿ handle to reorder, `×` on a row to remove it. The bottom row adds a link: label, hotkey, URL. The hotkey is highlighted inside the label as `/g/mail`, and leaving it blank uses the first letter. Panels themselves reorder by dragging them in the main rail.

**07 IMAGE · 画像** — `ADD IMAGE` opens a picker, or drop files straight onto the box. `‹` `›` step through, `×` removes the current one. Thumbnails jump to any image. `CROP` zooms from 100% to 400%, `FIT` resets it, and dragging inside the box repositions. `ROTATE` changes the image on every OPEN, hourly, daily, weekly, or never. Images are stored as data URLs in localStorage, so a handful of large ones will fill it.

**08 SEARCH · 検索** — the dropdown sets the default engine, and `SEARCH ON` / `OFF` controls whether `/` does anything. The field below adds your own engine: paste a search URL with `%s` where the query goes, like `https://example.com/search?q=%s`, and it appears in the list on prefix `c`.

**09 TAB · タブ** — the browser tab title.

**10 CONFIG · 設定** — `EXPORT` dumps the whole setup as JSON and copies it to the clipboard. `IMPORT` reads it back from the box. That is how you move a setup between browsers. `RESET DEFAULTS` at the bottom wipes everything after confirming.

## THE TERMINAL LINE

The `>` at the bottom is a single buffer, not a search box that opens and closes.

Press a panel's letter to open it, then a link's letter to follow it. What you pressed stays on the line until the next key or `ESC`.

Press `/` and it types a slash, after which everything you type is text. `ENTER` searches, `BACKSPACE` deletes, `ESC` clears. A single letter right after the slash picks an engine for that one search — `/w pixel art` goes to Wikipedia regardless of your default.

## QUOTES

The quote in the top left advances on a schedule, or whenever you click it. Three sources, picked in `05 QUOTE` in the config tray.

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

The line format is the same one [Bonjourr](https://bonjourr.fr/docs/widgets/quotes/) uses, so a quotes file written for either works in both.

## DETAILS

- Fonts are [DotGothic16](https://fonts.google.com/specimen/DotGothic16) and [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono) from Google Fonts. They are the only remote asset.
- Weather comes from [Open-Meteo](https://open-meteo.com/), which needs no API key. Sunrise and sunset off the same response drive the automatic light/dark switch.
- Link favicons are off by default. Switching them on asks Google for an icon per domain, which hands Google your bookmark list.
- Drop images or GIFs straight onto the image box. They are stored as data URLs in localStorage, so a handful of big ones will fill it.
- With no network the weather and quotes fall back to built-in values and everything else carries on.

### NOTES

The design came first this time and the code came second, which is the reverse of how I built the last one. It made the layout decisions far less painful.

Still on the list: the rail assumes a wide window and clips somewhere below 1000px, and there is no touch handling at all.

## LICENSE

MIT. See [LICENSE](LICENSE).
