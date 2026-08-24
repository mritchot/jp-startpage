# Privacy Policy

**JP-Startpage** · last updated 24 August 2026

JP-Startpage has no server, no accounts, and no analytics. The developer
receives nothing. Nothing you do in the extension is reported anywhere.

## What is stored, and where

Your settings — panels, links, hotkeys, colors, greeting, weather city, search
engines, quotes and images — are held in your browser's local storage on your
own machine.

If you turn on **profile sync**, those settings are also written to your
browser's own extension storage, which Chrome and Firefox replicate between
machines signed into your account. That replication is handled entirely by the
browser. The data travels through your browser vendor, not through the
developer, and there is no copy anywhere else. Dropped images are never
included. Profile sync is off until you switch it on.

## What leaves your machine

Four features contact other services. Each is described below, and none of them
sends anything to the developer.

**Weather.** When the weather panel is on, the extension requests a forecast
from [Open-Meteo](https://open-meteo.com).

- `MANUAL`, the default, sends only the city name you typed.
- `APPROX` first asks [ipapi.co](https://ipapi.co) to estimate your position
  from your IP address. Any web request necessarily discloses your IP to the
  service you contact; this one uses it to return an approximate city.
- `PRECISE` asks the browser for your location, which prompts you first, and
  requires the optional `geolocation` permission that the extension requests
  only when you select this mode. Coordinates are rounded to roughly one
  kilometer before the forecast request is made.

Your position is never stored and never transmitted to the developer.

**Favicons.** Off by default. When switched on, the extension asks Google for
an icon for each link's domain, which discloses those domains to Google.
Addresses on internal networks — IP literals and `.local`, `.lan`, `.internal`
and `.home.arpa` hostnames — are excluded and never sent.

**Remote quotes.** Only if you paste a URL into the quote source. The extension
fetches that file from wherever you pointed it.

**Gist sync.** Only if you use it. Your settings are written to a secret GitHub
Gist under a personal access token that you create and paste in. The token is
stored solely in your browser, and is deliberately excluded from both the
config export and every synced payload, so sharing a configuration cannot leak
it.

## What is never collected

The extension does not collect or transmit personally identifiable
information, health data, or financial and payment information. It does not
touch authentication credentials, personal communications, web history, user
activity, or the content of pages you visit.

Your data is never sold, never transferred to third parties for unrelated
purposes, and never used to assess creditworthiness or for lending.

## Removing your data

Uninstalling the extension removes its local storage. `RESET DEFAULTS` in the
config tray clears everything without uninstalling. Turning profile sync off
stops further writes; to clear what your browser already replicated, use your
browser's own sync data controls.

## Source

The extension is open source under the MIT license. Every behavior described
here is verifiable in the code at
[github.com/mritchot/jp-startpage](https://github.com/mritchot/jp-startpage).

Questions or corrections: open an issue on the repository.
