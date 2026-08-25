# JP-STARTPAGE

A browser startpage designed as a pseudo-Japanese terminal interface.

Has full keyboard input. Press a category key to open its panel, press a link key to follow it, press `/` to search.

Last Update: 26/08/26

[LIVE PREVIEW](https://mritchot.github.io/jp-startpage/)

## INSTALLATION

JP-Startpage installs as a browser extension and takes over your startpage and new tab.

### Firefox

**Add-ons.** Install from [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/jp-startpage/).

**Manual install.** Download this repo, then open `about:debugging` → *This Firefox* → *Load Temporary Add-on* and pick `manifest.json`. Firefox drops temporary add-ons on restart.

Needs Firefox 142 or later.

### Chrome

**Web Store.** Install from the [Chrome Web Store](https://chromewebstore.google.com/detail/jp-startpage/njhkdmembkbbcagahaiknbdfomnloaio).

**Manual install.** Download this repo, then open `chrome://extensions`, turn on Developer mode, choose *Load unpacked*, and select the folder.

### Other Chromium browsers

The Chrome build runs on Edge, Brave and Vivaldi.

**Edge**

Open the Chrome Web Store listing and accept *Allow extensions from other stores*.

**Brave**

Installs from the Chrome Web Store.

**Vivaldi**

Installs from the Chrome Web Store, then tick *Settings → Tabs → New Tab Page → Start Page → Controlled by Extension*. Vivaldi sometimes shows its own Start Page again after a full restart.

Manual install is the same on all three. Developer mode, then *Load unpacked*.

## CONFIGURATION

Settings are located at `設定 CONFIG` in the bottom right. Settings are saved to localStorage with different sync options.

Below is the reference for every config setting.

**01 COLOR · 色**

`ACCENT` is the highlight color and `GROUND` is the page. Each row offers three presets. Each preset carries a light and a dark value. Picking one changes both modes. Under each row is a hex field that you can use to override a preset.

A hex sets only the mode you are looking at. To set the other one, switch `02 DISPLAY` to that mode and input a hex value.

**02 DISPLAY · 表示**

`SYSTEM` follows your operating system's light or dark setting, or force `LIGHT` / `DARK`. `GRID` toggles the grid texture. `24H` / `12H` sets the clock. `TEXT FITS BOX` resizes text to fit the box height; `BOX GROWS TO TEXT` does the reverse. `PANELS TOP` / `PANELS MID` moves the vertical labels and link lists; the clock always stays centered.

`TEXT` scales type from 60% to 160%. `HEIGHT` sets box height from 200 to 760px. The readout shows `CAPPED` when the window is too short (your setting is kept for when there is room again) and `AUTO` in `BOX GROWS TO TEXT` mode, where the text determines the height.

`FAVICONS` shows a site icon beside each link; it is off by default. Turning it on asks Google for an icon per domain.

**03 GREETING · 挨拶**

`ONE GREETING` for a single line, or `BY TIME OF DAY` for four lines that change across the day. You can customize the timing.

In `BY TIME OF DAY` each row has a box on the left that indicates start time, and a text field. The kana for each row reads: 朝 morning, 昼 afternoon, 夕 evening, 夜 night.

The active row is highlighted. Font size is fixed against the longest of the four.

**04 WEATHER · 天気**

`MANUAL` looks up whatever city you type. `APPROX` asks [ipapi.co](https://ipapi.co) to estimate your city from your IP address. `PRECISE` uses the browser's own location and needs you to allow location permissions. The `°C` / `°F` button converts. Forecasts come from [Open-Meteo](https://open-meteo.com), refreshed every 30 minutes and cached between.

The location readout shows `LOCATING…` while a position is being resolved, `NO LOCATION` when the browser refuses or cannot supply one, `NO PERMISSION` when the location permission is not granted, and `NO CONSENT` when Firefox's data-collection consent is missing. On Firefox, switching to `APPROX` or `PRECISE` may also raise that consent; declining it at the prompt leaves the mode unchanged. Picking `PRECISE` reloads the page when the location permission is granted while the page is open.

**05 QUOTE · 引用**

See the QUOTES section below.

**06 PANELS · パネル**

The dropdown picks which panel you are editing; `＋` adds one and `×` deletes. Below that, the panel's name and its hotkey letter.

The list underneath is that panel's links. Click a row to edit its label, hotkey and URL, then press Enter or `✓` to close it. Drag a row to reorder it, and `×` removes it. The bottom row adds a link: label, hotkey, URL.

The hotkey is highlighted inside the label as `/g/mail`, and leaving it blank uses the label's first letter. A hotkey used twice in one panel turns red to warn you to change it. Panels themselves reorder by dragging them in the main rail.

**07 IMAGE · 画像**

`ADD IMAGE` opens a picker, or drop files straight onto the box. `‹` `›` step through, `×` removes the current image. Thumbnails jump to any image. `CROP` zooms from 100% to 400%, `FIT` resets it, and dragging inside the box repositions the image.

`ROTATE` changes the image on a schedule: `OPEN` every time the page loads, then `HOUR`, `DAY`, `WEEK`, or `OFF` to leave it alone.

Images are stored in the browser's IndexedDB on your machine. The caption in the corner of the box reads `NO IMAGE` when empty, otherwise the position and the rotation setting. `STORAGE FULL` means the browser refused the last image; `STORAGE ERROR` means the image store would not open or an image's data is gone.

**08 SEARCH · 検索**

The dropdown sets the default engine, and `SEARCH ON` / `OFF` controls whether `/` does anything. The field below adds your own engine: paste a search URL with `%s` where the query goes, like `https://example.com/search?q=%s`, and it appears in the list on prefix `c`. The template must start with `http://` or `https://`.

**09 TAB · タブ**

The browser tab title.

**10 CONFIG · 設定**

`EXPORT` downloads your whole setup as a `.json` file. `IMPORT` loads. Images are not included. `RESET DEFAULTS` at the bottom returns to default settings.

The line under the buttons reports the last action: `SAVED`, `LOADED`, `NOT A CONFIG FILE`, or `FAILED`.

`ESC TO CLOSE` is self-explanatory: Escape shuts the tray. Escape again clears any open panel and the terminal line.

## THE TERMINAL LINE

The browser puts keyboard focus in the address bar on every new tab; the page cannot take it. Press `ESC` once to move focus into the page. From there, press a panel's letter to open it, then a link's letter to follow it.

Press `/` and it types a slash, after which everything you type is text. `ENTER` searches, `BACKSPACE` deletes, `ESC` clears. A single letter right after the slash picks an engine for that one search, so `/w pixel art` goes to Wikipedia.

## QUOTES

The quote in the top left advances on a schedule, or whenever you click it.

**BUILT-IN** is four AI slop lines that ship with the page.

**CUSTOM** takes your own, one per line:

```
Ada Lovelace, The Analytical Engine weaves algebraic patterns.
Sun Tzu, Every battle is won, or lost, before it is fought.
A line with no comma is used as-is with nobody attributed.
```

Only the first comma splits. Commas inside the quote itself are safe.

**URL** pulls the same format from a remote file. A GitHub Gist is an easy way to provide quotes: make a gist, paste your quotes in, copy the raw file URL into the field, hit PULL. A `gist.github.com/...` page URL works too. Whatever is pulled is cached locally and will keep working offline.

`ROTATE` sets how often the quote changes on its own: `OPEN` on every page load, then `HOUR`, `DAY`, `WEEK`, or `OFF`.

For `URL`, the `PULL` button reads `PULLED` on success, or `FAILED` if the file cannot be fetched or parsed.

## SYNC

Each browser keeps its own settings. `11 SYNC` offers two ways to share one setup.

### PROFILE

Profile sync uses the browser's extension storage, which Chrome and Firefox replicate across a signed-in profile. Turn it on, and every machine running the extension under that profile syncs.

Switch `PROFILE SYNC` on. From then on, a change saves with approximately a two second delay, and a change made elsewhere pulls. `PUSH` and `PULL` force either direction.

The line under the buttons indicate status:

`OFF`

Sync is off and settings stay on this machine.

`ON · NOTHING SAVED YET`

Sync is on but nothing has been written.

`SAVED 2026.08.24 16:20`

When the setup was last written to the profile.

`UNAVAILABLE`

No extension storage here, so profile sync cannot run.

`PUSHED`, `PULLED`

A manual push or pull worked.

`NOTHING STORED`

A pull found no setup in the profile yet.

`FAILED`

The profile store could not be read; nothing was changed.

`UPDATED`

A change from another machine has just been applied.

`ALREADY SAVED`

The profile already holds exactly this setup, so nothing was written.

`TOO LARGE TO SYNC`

The setup is past the 100 KB cap and was not written.

`SYNC REFUSED THE WRITE`

The browser rejected the write, most often because its own sync storage is full.

`EXTENSION ONLY`

You pressed a button where there is no extension storage.

Profile sync needs the extension. A copy opened from disk has no extension storage, reports `UNAVAILABLE`, and answers `EXTENSION ONLY` if you press the buttons. Use the export file there instead. Chrome needs you signed in with sync on. Firefox needs a Firefox Account with **Add-ons** ticked in `about:preferences` → Sync.

Storage is capped at 100 KB. A setup past that reports `TOO LARGE TO SYNC` and nothing is written. Images are never included.

### GIST

Gist sync moves a setup between different browsers, which profile sync cannot do. It goes through a secret GitHub Gist.

Make a [classic personal access token](https://github.com/settings/tokens) with **only** the `gist` scope, give it an expiry, and paste it into the token field. Then:

**PUSH** writes your current setup to a gist. The first push creates a secret one and fills in the gist ID.

**PULL** reads that gist back and applies it.

On the second browser, paste the same token and the same gist ID, then PULL.

PUSH overwrites the gist, PULL overwrites what is local.

The line under the buttons reads `NEVER SYNCED`, or `LAST SYNC` and a timestamp. After an action it reports the result:

`PUSHED` or `PULLED`

It worked.

`NO TOKEN` or `NO GIST ID`

A field is empty.

`BAD TOKEN`

GitHub rejected the token; it has expired or lacks the `gist` scope.

`FORBIDDEN`

The token is valid but not allowed to do this.

`GIST NOT FOUND`

The ID is wrong, or the gist holds no `jp-startpage.json`.

`FAILED`

The request did not complete, usually the network.

**The token never leaves the browser you typed it into.** It is excluded from both synced payloads and from the `10 CONFIG` export. Treat the ID as semi-private and type it into each browser by hand. Images do not sync on either path.

The token is stored in plain localStorage, which anyone with access to that browser profile can read. localStorage is also shared across an origin: every site under the same `username.github.io` shares one store. Any other GitHub Pages site on that account could therefore read a token pasted into a Pages-hosted copy. Keep gist sync to the extension or a locally opened copy.

## PRIVACY

Nothing reaches me. What leaves your machine is set out in [PRIVACY.md](PRIVACY.md).

## AI DILIGENCE

I built this with AI assistance. The interface started in Claude Design, and Anthropic's Claude wrote most of the code under my direction. I decided how it should behave and reviewed what went in, then tested it in Chrome and Firefox.

The extension is provided as is, with no warranty. The whole of it is in this repository if you want to check any of the code yourself.

## LICENSE

MIT. See [LICENSE](LICENSE).
