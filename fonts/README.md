# Fonts

Both faces ship with the page so it never calls out to a font CDN. Nothing here
is fetched at runtime.

| File | Face | Coverage | Size |
|---|---|---|---|
| `dotgothic16-subset.woff2` | DotGothic16 400 | ASCII, full hiragana and katakana, the kanji this UI renders, and the punctuation it uses — 348 glyphs | ~16 KB |
| `ibmplexmono-latin-400.woff2` | IBM Plex Mono 400 | Latin | ~10 KB |
| `ibmplexmono-latin-500.woff2` | IBM Plex Mono 500 | Latin | ~10 KB |

DotGothic16 is subset rather than complete: the full family is about 752 KB and
Google normally serves it as 123 unicode-range slices. A kanji outside the
subset still renders — the browser falls back to a system face for that glyph
alone — it just will not be dot-matrix.

Both are licensed under the SIL Open Font License 1.1, which permits
redistribution provided the licence travels with the font. `OFL-DotGothic16.txt`
and `OFL-IBMPlexMono.txt` are those licences, copied from each font's upstream
project. IBM Plex carries the Reserved Font Name "Plex".
