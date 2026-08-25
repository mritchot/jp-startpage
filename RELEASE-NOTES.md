<!-- GitHub release body for tag v1.2.0. The whole file pastes as-is; GitHub
     supplies the release title, so there is no H1 here. Replaced each release. -->

## What's new

**Images are no longer capped at a few megabytes.** Dropped images now live in the browser's IndexedDB as binary data rather than as base64 text in localStorage. That moves the practical ceiling from roughly three or four megabytes to a share of your disk, so large wallpapers and animated GIFs fit. Existing images migrate the first time you open the page and nothing needs re-adding. Panning and cropping an image is cheaper too, because saving one crop no longer rewrites every image you have stored.

**PRECISE weather works.** Picking `PRECISE` could leave the readout on `LOCATING…` forever. The extension treated any answered permission request as a grant, so a request that granted nothing still counted as success, and the position call then waited on a permission it never had. The built-in timeout could not end that wait, because the Geolocation specification excludes permission time from it. The extension now reads the real permission state instead of trusting the request, bounds the position call with its own timer, and reloads the page when the permission is granted while the page is open. That last part is what used to make `PRECISE` work only in the next new tab.

**The location readout says what went wrong.** Alongside `LOCATING…` and `NO LOCATION`, it now shows `NO PERMISSION` when the location permission is missing, and `NO CONSENT` when Firefox's data-collection consent is absent or withdrawn. Both of those states used to hang silently.

**Typing in the config tray costs about a seventh of what it did, and no longer breaks IME input.** Text fields update state and reconcile when they lose focus instead of rebuilding the tray on every keystroke, so building a multi-keystroke Japanese or Chinese word no longer drops the pre-edit mid-compose.

---

## Security

Theme colors arriving from an imported, pulled, or synced config are sanitized to a hex literal before they are applied. A crafted config could otherwise carry a `url()` beacon or a full-viewport overlay into the page's inline styles and fire an external request on load. Only a config from another source could carry one, so your own settings were never affected.

---

## Fixes

- A failed read of the image store is now told apart from an empty one. A read or parse failure reports `STORAGE ERROR` and never discards stored images.
- A weather response that arrives after you switch city or mode is discarded instead of overwriting the newer result.
- Removed an unread flag and an unused image field, deduplicated the sync chunk join, and hoisted duplicate-key checks out of the link list.

---

## Documentation

The README now says how to move keyboard focus out of the address bar, which the hotkey section previously assumed you knew. It also documents every location status, covers the new image storage, and carries an AI diligence statement. The privacy policy now describes when weather requests actually happen rather than implying they only follow something you do.

---

## Permissions

This release adds `unlimitedStorage`, which exempts the image store from the browser's default quota and from eviction. Neither Chrome nor Firefox prompts for it, so the update installs without disabling the extension or asking existing users for anything.

`storage` and the optional `geolocation` permission are unchanged. `geolocation` is still requested only when you pick `PRECISE` weather.

---

## Install

### Firefox

**Add-ons.** Install from [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/jp-startpage/).

**Manual install.** Download the source, then open `about:debugging` → *This Firefox* → *Load Temporary Add-on* and pick `manifest.json`. Firefox drops temporary add-ons on restart.

Needs Firefox 142 or later.

### Chrome

**Web Store.** Install from the [Chrome Web Store](https://chromewebstore.google.com/detail/jp-startpage/njhkdmembkbbcagahaiknbdfomnloaio).

**Manual install.** Download the source, then open `chrome://extensions`, turn on Developer mode, choose *Load unpacked*, and select the folder.

### Other Chromium browsers

The Chrome build runs on Edge, Brave and Vivaldi.

**Edge** installs from the Chrome Web Store once you accept *Allow extensions from other stores*.

**Brave** installs from the Chrome Web Store.

**Vivaldi** installs from the Chrome Web Store, then tick *Settings → Tabs → New Tab Page → Start Page → Controlled by Extension*. Vivaldi sometimes shows its own Start Page again after a full restart.

Manual install is the same on all three: Developer mode, then *Load unpacked*.

> [!IMPORTANT]
> Firefox users still on the old self-distributed build: this is a different add-on with a different id, so it will not update the old one. Remove the previous copy from `about:addons` and install from the link above.
