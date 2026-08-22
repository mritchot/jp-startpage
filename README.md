# JP-STARTPAGE

Five years ago I ended the last startpage README by saying I would probably build another one. This is that one.

I wanted the terminal look again, but leaning Japanese this time — vertical writing mode, DotGothic16, scanlines, and a single accent colour over near-black. It gave me an excuse to finally use `writing-mode: vertical-rl`, which I had never touched before, and to write a small solver that shrinks the type until every panel fits the same box height. The rule I set myself was one HTML file, no build step, no dependencies. It stayed that way.

Everything runs off the keyboard. Press a category key to open its panel, press a link key to follow it, press `/` to search.

Last Update: 22/08/26

## INSTALLATION INSTRUCTIONS

To use as a new Home page...

1. Fork this repo.
2. Enable GitHub Pages for your fork at `Settings > Pages > Source [Deploy from a branch] > Branch [main / root] > Save`
3. Set it as Home Page:
   - Click the menu button and select Settings.
   - Click the Home panel.
   - Click the menu next to Homepage and new windows, choose Custom URLs, and add your `GitHub Pages link`

To use as a new Tab...

You can use different Add-ons/Extensions for it

- Firefox: [New Tab Override](https://addons.mozilla.org/en-US/firefox/addon/new-tab-override/)
- Chromium: [Custom New Tab URL](https://chromewebstore.google.com/detail/custom-new-tab-url/mmjbdbjnoablegbkcklggeknkfcjkjia)

Or just open `index.html` off your disk. Nothing leaves the browser either way.

## CONFIGURATION

Everything lives behind `設定 CONFIG` in the bottom right — panels, links, colours, greeting, weather city, image rotation. It all persists to localStorage. Section 10 dumps the whole config as JSON, so you can paste your setup into another browser instead of building it twice.

Panels and links reorder by dragging.

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
