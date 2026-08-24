# JP-Startpage 1.1.0

Paste-ready body for the GitHub release. Replaced at each release.

---

## What is new

**Edit links in place.** Click any link row in `06 PANELS` to edit its label, hotkey and URL where it sits. Enter or `✓` closes the row. Removing a link and adding it back is no longer the way to fix a typo. A hotkey claimed twice in one panel now turns red, because only the first one fires.

**Steadier layout.** The clock, image, greeting and panels now centre as one composition, and the space an open panel needs is held whether or not a panel is open. Opening or closing a panel moves nothing. Panel count no longer pulls the whole page off centre, so two panels and twelve both sit square. When the panels do outrun the window, the rail fades at whichever edge still has more behind it.

**Browser profile sync.** `11 SYNC` has two tabs. `PROFILE` uses the browser's own extension storage, which Chrome and Firefox replicate across a signed-in profile: turn it on, and every machine running the extension stays level without a token. `GIST` is unchanged and still the way to move a setup between different browsers. Export and import are unchanged.

**A quieter config tray.** The tray no longer explains itself. Every instruction has moved to the README, which now documents each control and every status line the tray can show. What remains on screen is live status only.

---

## Install

### Firefox

**Signed build.** Download `jp-startpage-1.1.0.xpi` from this release. Opening that link in Firefox installs it straight away. If you saved the file instead, drag it onto a Firefox window, or use `about:addons` → gear icon → *Install Add-on From File*.

**Manual install.** Download the source, then open `about:debugging` → *This Firefox* → *Load Temporary Add-on* and pick `manifest.json`. Firefox drops temporary add-ons on restart, so this route is for development.

Needs Firefox 142 or later.

### Chrome

**Web Store.** Install from the [Chrome Web Store](https://chromewebstore.google.com/detail/jp-startpage/njhkdmembkbbcagahaiknbdfomnloaio). This build updates itself.

**Manual install.** Download the source, then open `chrome://extensions`, turn on Developer mode, choose *Load unpacked*, and select the folder.

### Other Chromium browsers

The Chrome build runs on Edge, Brave and Vivaldi. Each needs one thing set first, and Opera cannot run it as a new tab at all.

- **Edge** — open the Chrome Web Store listing and accept *Allow extensions from other stores* when Edge offers it. The new tab override then works.
- **Brave** — installs from the Chrome Web Store and honours the new tab override.
- **Vivaldi** — installs from the Chrome Web Store, then tick *Settings → Tabs → New Tab Page → Start Page → Controlled by Extension*. Vivaldi sometimes shows its own Start Page again after a full restart.
- **Opera** — ignores the new tab override entirely. Point Opera's startup page at the [live preview](https://mritchot.github.io/jp-startpage/) instead.

Manual install is the same on all four: Developer mode, then *Load unpacked*.

---

## Notes on profile sync

Profile sync needs the extension. A copy opened from disk or served from GitHub Pages has no extension storage, reports `UNAVAILABLE`, and answers `EXTENSION ONLY` if you press the buttons. Use the export file there.

Chrome needs you signed in with sync on. Firefox needs a Firefox Account with **Add-ons** ticked in `about:preferences` → Sync. Without it Firefox still stores the data, but never sends it anywhere.

The browser caps this storage at 100 KB. A setup past that reports `TOO LARGE TO SYNC` and writes nothing. Dropped images are never included, on either sync path.

This release adds the `storage` permission, which both browsers grant without a prompt.
