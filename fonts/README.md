# Fonts

Both faces ship with the page so it never calls out to a font CDN. Nothing here
is fetched at runtime.

| File | Face | Coverage | Size |
|---|---|---|---|
| `dotgothic16/dg-000…122.woff2` | DotGothic16 400 | Complete — Google's own 123 unicode-range slices | ~752 KB total |
| `ibmplexmono-latin-400.woff2` | IBM Plex Mono 400 | Latin | ~10 KB |

`fonts.css` declares all of it. Because each DotGothic16 slice carries a
`unicode-range`, a browser only downloads the slices whose glyphs are actually
on screen — loading the page with the default settings fetches about seven of
the 123. The full set is on disk so any kanji someone types into a greeting or
a link label renders in the dot-matrix face rather than falling back.

Both are licensed under the SIL Open Font License 1.1, which permits
redistribution provided the license travels with the font. `OFL-DotGothic16.txt`
and `OFL-IBMPlexMono.txt` are those licenses, copied from each font's upstream
project. IBM Plex carries the Reserved Font Name "Plex".
