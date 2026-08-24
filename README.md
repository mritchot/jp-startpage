# JP-STARTPAGE

A browser startpage designed as a pseudo-Japanese terminal interface.

Has full keyboard input. Press a category key to open its panel, press a link key to follow it, press `/` to search.

Last Update: 24/08/26

[LIVE PREVIEW](https://mritchot.github.io/jp-startpage/)

## INSTALLATION

JP-Startpage installs as a browser extension and takes over the new tab.

### Firefox

**Signed build.** Grab the `.xpi` from the [latest release](https://github.com/mritchot/jp-startpage/releases/latest). Opening that link in Firefox installs it straight away. If you saved the file instead, drag it onto a Firefox window, or use `about:addons` → gear icon → *Install Add-on From File*.

**Manual install.** Download this repo, then open `about:debugging` → *This Firefox* → *Load Temporary Add-on* and pick `manifest.json`. Firefox drops temporary add-ons on restart, so use this one for development only.

Needs Firefox 142 or later.

### Chrome

**Web Store.** Install from the [Chrome Web Store](https://chromewebstore.google.com/detail/jp-startpage/njhkdmembkbbcagahaiknbdfomnloaio). This build updates itself.

**Manual install.** Download this repo, then open `chrome://extensions`, turn on Developer mode, choose *Load unpacked*, and select the folder.

### Other Chromium browsers

The Chrome build runs on Edge, Brave and Vivaldi. Each needs one thing set first, and Opera cannot run it as a new tab at all.

- **Edge** — open the Chrome Web Store listing and accept *Allow extensions from other stores* when Edge offers it. The new tab override then works.
- **Brave** — installs from the Chrome Web Store and honours the new tab override.
- **Vivaldi** — installs from the Chrome Web Store, then tick *Settings → Tabs → New Tab Page → Start Page → Controlled by Extension*. Vivaldi sometimes shows its own Start Page again after a full restart.
- **Opera** — ignores the new tab override entirely. Point Opera's startup page at the [live preview](https://mritchot.github.io/jp-startpage/) instead.

Manual install is the same on all four: Developer mode, then *Load unpacked*.

## CONFIGURATION

Everything lives behind `設定 CONFIG` in the bottom right. It all persists to localStorage.

The tray carries no instructions of its own, so this section is the reference for every control. Text that does appear there is live status, never guidance.

**01 COLOUR · 色**

`ACCENT` is the highlight colour and `GROUND` is the page behind it. Each row offers three presets, and each preset carries a light and a dark value, so picking one changes both modes. Under each row is a hex field: type six digits and it takes over from the presets.

A hex sets only the mode you are looking at right now. To set the other one, switch `02 DISPLAY` to that mode and type the hex again. The swatch beside the field always shows the value in force.

**02 DISPLAY · 表示**

`SYSTEM` follows your operating system's light or dark setting, or force `LIGHT` / `DARK`. `GRID` toggles the grid texture. `24H` / `12H` sets the clock. `TEXT FITS BOX` shrinks type until it fits the box height; `BOX GROWS TO TEXT` does the reverse. `PANELS TOP` / `PANELS MID` moves the vertical labels and link lists; the clock always stays centred. `TEXT` scales type from 60% to 160%. `HEIGHT` sets box height from 200 to 760px. It shows `CAPPED` when the window is too short to honour it, and your setting is kept for when there is room again. `FAVICONS` shows a site icon beside each link; it is off by default because turning it on asks Google for an icon per domain.

**03 GREETING · 挨拶**

`ONE GREETING` for a fixed line, or `BY TIME OF DAY` for four that swap on the hours you set.

In `BY TIME OF DAY` each row is one band. The narrow box on the left is the hour that band starts, and the wide field holds its greeting. The kana between them names the band: 朝 morning, 昼 afternoon, 夕 evening, 夜 night.

The band in force right now is highlighted. Type size is fixed against the longest of the four.

**04 WEATHER · 天気**

`MANUAL` looks up whatever city you type. `APPROX` places you by IP address, which asks no permission. `PRECISE` uses the browser's location, which will prompt. The `°C` / `°F` button converts. Data comes from Open-Meteo, refreshed every 30 minutes and cached between.

**05 QUOTE · 引用**

See the QUOTES section below.

**06 PANELS · パネル**

The dropdown picks which panel you are editing; `＋` adds one and `×` deletes it. Below that, the panel's name and its hotkey letter.

The list underneath is that panel's links. Click a row to edit its label, hotkey and URL in place, then press Enter or `✓` to close it. Drag a row to reorder it, and `×` removes it. The bottom row adds a link: label, hotkey, URL.

The hotkey is highlighted inside the label as `/g/mail`, and leaving it blank uses the first letter. A hotkey claimed twice in one panel turns red, because only the first will fire. Panels themselves reorder by dragging them in the main rail.

**07 IMAGE · 画像**

`ADD IMAGE` opens a picker, or drop files straight onto the box. `‹` `›` step through, `×` removes the current one. Thumbnails jump to any image. `CROP` zooms from 100% to 400%, `FIT` resets it, and dragging inside the box repositions the image.

`ROTATE` changes the image on a schedule: `OPEN` every time the page loads, then `HOUR`, `DAY`, `WEEK`, or `OFF` to leave it alone.

Images are stored as data URLs in localStorage, so a handful of large ones will fill it. The caption in the corner of the box reads `NO IMAGE` when empty, otherwise the position and the rotation setting. It reads `STORAGE FULL` when localStorage refuses the last image, which means that image was not kept.

**08 SEARCH · 検索**

The dropdown sets the default engine, and `SEARCH ON` / `OFF` controls whether `/` does anything. The field below adds your own engine: paste a search URL with `%s` where the query goes, like `https://example.com/search?q=%s`, and it appears in the list on prefix `c`.

**09 TAB · タブ**

The browser tab title.

**10 CONFIG · 設定**

`EXPORT` downloads your whole setup as a `.json` file. `IMPORT` loads one back. Dropped images are not included, since they live in a separate store. `RESET DEFAULTS` at the bottom wipes everything after confirming.

The line under the buttons reports the last action: `SAVED`, `LOADED`, `NOT A CONFIG FILE`, or `FAILED`. It clears itself.

`ESC TO CLOSE` in the footer is what it says: Escape shuts the tray. Escape again clears any open panel and the terminal line.

## THE TERMINAL LINE

When focussed on the page, press a panel's letter to open it, then a link's letter to follow it.

Press `/` and it types a slash, after which everything you type is text. `ENTER` searches, `BACKSPACE` deletes, `ESC` clears. A single letter right after the slash picks an engine for that one search — `/w pixel art` goes to Wikipedia.

## QUOTES

The quote in the top left advances on a schedule, or whenever you click it.

**BUILT-IN** is four lines that ship with the page.

**CUSTOM** takes your own, typed straight into the box, one per line:

```
Ada Lovelace, The Analytical Engine weaves algebraic patterns.
Sun Tzu, Every battle is won, or lost, before it is fought.
A line with no comma is used as-is, with nobody attributed.
```

Only the first comma splits. Commas inside the quote itself are safe.

**URL** pulls the same format from a remote file. A GitHub Gist is the easy way: make a gist, paste your quotes in, copy the raw file URL into the field, hit PULL. A `gist.github.com/...` page URL works too. Whatever comes back is cached locally and will keep working offline.

`ROTATE` sets how often the quote changes on its own: `OPEN` on every page load, then `HOUR`, `DAY`, `WEEK`, or `OFF`.

For `URL`, the `PULL` button reads `PULLED` on success, or `FAILED` if the file cannot be fetched or parsed.

## SYNC

Each browser keeps its own settings. `11 SYNC` offers two ways to share one setup, on separate tabs.

### PROFILE

Profile sync uses the browser's own extension storage, which Chrome and Firefox replicate across a signed-in profile. It is the easy path: turn it on, and every machine running the extension under that profile stays level.

Switch `PROFILE SYNC` on. From then on, a change saves about two seconds after you make it, and a change made elsewhere arrives on its own. `PUSH` and `PULL` force either direction by hand. A change arriving while you are typing in the tray waits until you leave the field.

The line under the buttons is the status:

- `OFF` — sync is off and settings stay on this machine.
- `ON · NOTHING SAVED YET` — sync is on but nothing has been written.
- `SAVED 2026.08.24 16:20` — when this browser last wrote to the profile.
- `UNAVAILABLE` — no extension storage here, so profile sync cannot run.
- `PUSHED`, `PULLED` — a manual push or pull worked.
- `UPDATED` — a change from another machine has just been applied.
- `ALREADY SAVED` — the profile already holds exactly this setup, so nothing was written.
- `TOO LARGE TO SYNC` — the setup is past the 100 KB cap and was not written.
- `SYNC REFUSED THE WRITE` — the browser rejected the write, most often because its own sync storage is full.
- `EXTENSION ONLY` — you pressed a button where there is no extension storage.

Result lines clear themselves after a moment and the standing status returns.

Profile sync needs the extension. A copy opened from disk or served from GitHub Pages has no extension storage, reports `UNAVAILABLE`, and answers `EXTENSION ONLY` if you press the buttons. Use the export file there instead. Chrome needs you signed in with sync on. Firefox needs a Firefox Account with **Add-ons** ticked in `about:preferences` → Sync, or the data is kept but never leaves the machine.

The browser caps this storage at 100 KB. A setup past that reports `TOO LARGE TO SYNC` and nothing is written. Dropped images are never included.

### GIST

Gist sync moves a setup between different browsers, which profile sync cannot do. It goes through a secret GitHub Gist.

Make a [classic personal access token](https://github.com/settings/tokens) with **only** the `gist` scope, give it an expiry, and paste it into the token field. Then:

- **PUSH** writes your current setup to a gist. The first push creates a secret one and fills in the gist ID.
- **PULL** reads that gist back and applies it.

On the second browser, paste the same token and the same gist ID, then PULL.

PUSH overwrites the gist, PULL overwrites what is local.

The line under the buttons reads `NEVER SYNCED`, or `LAST SYNC` and a timestamp. After an action it reports the result:

- `PUSHED` or `PULLED` — it worked.
- `NO TOKEN` or `NO GIST ID` — a field is empty.
- `BAD TOKEN` — GitHub rejected the token; it has expired or lacks the `gist` scope.
- `FORBIDDEN` — the token is valid but not allowed to do this.
- `GIST NOT FOUND` — the ID is wrong, or the gist holds no `jp-startpage.json`.
- `FAILED` — the request did not complete, usually the network.

**The token never leaves the browser you typed it into**: it is excluded from both synced payloads and from the `10 CONFIG` export, so sharing a config cannot leak it. Treat the ID as semi-private and type it into each browser by hand. **Dropped images do not sync** on either path, since they are data URLs living in a separate localStorage key.

The token is stored in plain localStorage, which anyone with access to that browser profile can read. localStorage is also shared across an origin: every site under the same `username.github.io` shares one store. Any other GitHub Pages site on that account could therefore read a token pasted into a Pages-hosted copy. Keep gist sync to the extension or a locally opened copy.

## LICENSE

MIT. See [LICENSE](LICENSE).
