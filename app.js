(function () {
'use strict';

/* ------------------------------------------------------------------ *
 * constants
 * ------------------------------------------------------------------ */
var LS_KEY  = 'jp-startpage-v1';
var IMG_KEY = 'jp-startpage-images-v1';
var WX_KEY  = 'jp-startpage-wx-v1';
var Q_KEY   = 'jp-startpage-quotes-v1';

/* Index 3 is the user's custom pair (theme.ac / theme.gc). Each preset
   carries both modes, so a GROUND choice has an effect in light mode too. */
var ACCENTS = [
  { d: '#d4cdb8', l: '#33302a' },
  { d: '#c1503c', l: '#8c3122' },
  { d: '#3ce0ec', l: '#0d7a86' }
];
var GROUNDS = [
  { d: '#12100d', l: '#c9c6b5' },
  { d: '#000000', l: '#ded9c6' },
  { d: '#141a17', l: '#bcc0b0' }
];
function accentPair() { var t = S.theme; return (t.a === 3 && t.ac) ? t.ac : (ACCENTS[t.a] || ACCENTS[0]); }
function groundPair() { var t = S.theme; return (t.b === 3 && t.gc) ? t.gc : (GROUNDS[t.b] || GROUNDS[0]); }
function modeKey() { return _inv ? 'l' : 'd'; }

var BASE_QUOTES = [
  { text: 'Simplicity is a discipline, not a style.', author: '' },
  { text: 'The terminal remembers what the desktop forgets.', author: '' },
  { text: 'A tool you understand beats a tool that is merely fast.', author: '' },
  { text: 'Do less, but do it on purpose.', author: '' }
];
var QUOTES = BASE_QUOTES.slice();
var QSOURCES = [
  { id: 'builtin', label: 'BUILT-IN' },
  { id: 'custom',  label: 'CUSTOM'   },
  { id: 'url',     label: 'URL'      }
];

/* %s stands in for the query, so any engine can be added without a code change */
var BASE_ENGINES = [
  { id: 'k', name: 'KAGI',      url: 'https://kagi.com/search?q=%s' },
  { id: 'g', name: 'GOOGLE',    url: 'https://www.google.com/search?q=%s' },
  { id: 'w', name: 'WIKIPEDIA', url: 'https://en.wikipedia.org/w/index.php?search=%s' },
  { id: 'y', name: 'YOUTUBE',   url: 'https://www.youtube.com/results?search_query=%s' }
];
function engineList() {
  var l = BASE_ENGINES.slice();
  var t = (S.engineCustom || '').trim();
  /* the one navigation target outside safeUrl(), so it carries its own gate */
  if (t.indexOf('%s') >= 0 && /^https?:\/\//i.test(t)) l.push({ id: 'c', name: 'CUSTOM', url: t });
  return l;
}
function searchUrl(eng, term) { return eng.url.replace('%s', encodeURIComponent(term)); }

var SCHED = [
  { id: 'open', label: 'OPEN' }, { id: 'hour', label: 'HOUR' },
  { id: 'day',  label: 'DAY'  }, { id: 'week', label: 'WEEK' }, { id: 'off', label: 'OFF' }
];

/* WMO weather codes -> { cond, kana } display pair */
var WMO = {
  0:['CLEAR','晴'], 1:['MOSTLY CLEAR','快晴'], 2:['PARTLY CLOUDY','薄曇'], 3:['OVERCAST','曇'],
  45:['FOG','霧'], 48:['RIME FOG','霧'],
  51:['DRIZZLE','霧雨'], 53:['DRIZZLE','霧雨'], 55:['DRIZZLE','霧雨'],
  56:['ICE DRIZZLE','凍雨'], 57:['ICE DRIZZLE','凍雨'],
  61:['RAIN','雨'], 63:['RAIN','雨'], 65:['HEAVY RAIN','大雨'],
  66:['FREEZING RAIN','凍雨'], 67:['FREEZING RAIN','凍雨'],
  71:['SNOW','雪'], 73:['SNOW','雪'], 75:['HEAVY SNOW','大雪'], 77:['SNOW GRAINS','雪'],
  80:['SHOWERS','俄雨'], 81:['SHOWERS','俄雨'], 82:['HEAVY SHOWERS','豪雨'],
  85:['SNOW SHOWERS','俄雪'], 86:['SNOW SHOWERS','俄雪'],
  95:['THUNDERSTORM','雷雨'], 96:['HAIL STORM','雹'], 99:['HAIL STORM','雹']
};

/* fallback values, shown until a live fetch lands */
var WX  = { c: 26, hi: 29, lo: 21, cond: 'CLEAR', kana: '晴' };

/* ------------------------------------------------------------------ *
 * state
 * ------------------------------------------------------------------ */
function defaults() {
  return {
    now: Date.now(), openId: null, trayOpen: false, line: '', quoteIdx: 0,
    greeting: 'ターミナル接続確立：ハロー',
    city: 'TOKYO', geoMode: 'manual', unit: 'C', clock24: true,
    gistUrl: '', quoteSource: 'builtin', quoteCustom: '',
    gistToken: '', gistId: '', syncAt: 0,
    syncTab: 'profile', profileSync: false, profileAt: 0,
    editCatId: 'workspace', editLinkIdx: null, nl: '', nk: '', nu: '',
    textScale: 1, fitMode: 'fit', boxH: 320,
    align: 'top', imgs: [], imgIdx: 0, imgSched: 'day', quoteSched: 'day',
    engine: 'k', engineCustom: '', searchEnabled: true, linkIcons: false,
    greetMode: 'static', themeMode: 'auto',
    greets: { morning: 'おはよう', afternoon: 'こんにちは', evening: 'こんばんは', night: 'おやすみ' },
    bands: { morning: 5, afternoon: 11, evening: 17, night: 22 },
    tabTitle: '新規タブ · START',
    cfgMsg: '', dragCid: null, dragLid: null,
    theme: { a: 0, b: 0, grid: true,
             ac: { d: '#d4cdb8', l: '#33302a' }, gc: { d: '#12100d', l: '#c9c6b5' } },
    cats: [
      { id: 'workspace', name: 'workspace', key: 'w', links: [
        { label: 'gmail', key: 'g', url: 'https://mail.google.com' },
        { label: 'calendar', key: 'c', url: 'https://calendar.google.com' },
        { label: 'drive', key: 'd', url: 'https://drive.google.com' },
        { label: 'notion', key: 'n', url: 'https://notion.so' },
        { label: 'linear', key: 'l', url: 'https://linear.app' } ] },
      { id: 'forums', name: 'forums·boards', key: 'f', links: [
        { label: 'reddit', key: 'r', url: 'https://reddit.com' },
        { label: 'hacker news', key: 'h', url: 'https://news.ycombinator.com' },
        { label: 'lobsters', key: 'l', url: 'https://lobste.rs' },
        { label: 'stack overflow', key: 's', url: 'https://stackoverflow.com' } ] },
      { id: 'social', name: 'social media', key: 's', links: [
        { label: 'mastodon', key: 'm', url: 'https://mastodon.social' },
        { label: 'bluesky', key: 'b', url: 'https://bsky.app' },
        { label: 'discord', key: 'd', url: 'https://discord.com/app' },
        { label: 'instagram', key: 'i', url: 'https://instagram.com' } ] },
      { id: 'entertainment', name: 'entertainment', key: 'e', links: [
        { label: 'youtube', key: 'y', url: 'https://youtube.com' },
        { label: 'twitch', key: 't', url: 'https://twitch.tv' },
        { label: 'spotify', key: 's', url: 'https://open.spotify.com' },
        { label: 'netflix', key: 'n', url: 'https://netflix.com' },
        { label: 'anilist', key: 'a', url: 'https://anilist.co' } ] },
      { id: 'servers', name: 'servers', key: 'r', links: [
        { label: 'proxmox', key: 'p', url: 'https://192.168.1.10:8006' },
        { label: 'jellyfin', key: 'j', url: 'https://192.168.1.12:8096' },
        { label: 'home assistant', key: 'h', url: 'https://homeassistant.local:8123' },
        { label: 'grafana', key: 'g', url: 'https://192.168.1.14:3000' },
        { label: 'nas', key: 'n', url: 'https://192.168.1.20' } ] },
      { id: 'careers', name: 'careers', key: 'c', links: [
        { label: 'linkedin', key: 'l', url: 'https://linkedin.com' },
        { label: 'indeed', key: 'i', url: 'https://indeed.com' },
        { label: 'wellfound', key: 'w', url: 'https://wellfound.com' },
        { label: 'glassdoor', key: 'g', url: 'https://glassdoor.com' } ] },
      { id: 'brand', name: 'website·brand', key: 'b', links: [
        { label: 'figma', key: 'f', url: 'https://figma.com/files' },
        { label: 'github', key: 'g', url: 'https://github.com' },
        { label: 'analytics', key: 'a', url: 'https://plausible.io' },
        { label: 'cloudflare', key: 'c', url: 'https://dash.cloudflare.com' } ] }
    ]
  };
}
var S = defaults();

/* ------------------------------------------------------------------ *
 * dom helpers
 * ------------------------------------------------------------------ */
function h(tag, opt, kids) {
  var e = document.createElement(tag), k, v;
  if (opt) {
    if (opt.c) e.className = opt.c;
    if (opt.t != null) e.textContent = opt.t;
    if (opt.s) e.setAttribute('style', opt.s);
    if (opt.a) for (k in opt.a) {
      v = opt.a[k];
      if (v == null || v === false) continue;
      e.setAttribute(k, v === true ? '' : v);
    }
    if (opt.on) for (k in opt.on) e.addEventListener(k, opt.on[k]);
    if (opt.btn) {
      e.setAttribute('role', 'button');
      e.setAttribute('tabindex', '0');
      if (opt.al) e.setAttribute('aria-label', opt.al);
      e.addEventListener('keydown', function (ev) {
        if (typing()) return;   /* the command line owns the keyboard */
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); e.click(); }
      });
    }
  }
  if (kids != null) (Array.isArray(kids) ? kids : [kids]).forEach(function (c) {
    if (c == null || c === false) return;
    e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  });
  return e;
}
function frag(kids) {
  var f = document.createDocumentFragment();
  kids.forEach(function (c) { if (c != null && c !== false) f.appendChild(c); });
  return f;
}
function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); }
var D = {};

/* ------------------------------------------------------------------ *
 * persistence
 * ------------------------------------------------------------------ */
function persist() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({
      greeting: S.greeting, city: S.city, geoMode: S.geoMode, unit: S.unit, clock24: S.clock24,
      gistUrl: S.gistUrl, quoteSource: S.quoteSource, quoteCustom: S.quoteCustom,
      theme: S.theme, cats: S.cats, quoteIdx: S.quoteIdx,
      textScale: S.textScale, fitMode: S.fitMode, boxH: S.boxH,
      align: S.align, imgIdx: S.imgIdx, imgSched: S.imgSched, quoteSched: S.quoteSched,
      engine: S.engine, engineCustom: S.engineCustom, searchEnabled: S.searchEnabled, linkIcons: S.linkIcons,
      greetMode: S.greetMode, greets: S.greets, bands: S.bands, themeMode: S.themeMode,
      tabTitle: S.tabTitle,
      gistToken: S.gistToken, gistId: S.gistId, syncAt: S.syncAt,
      syncTab: S.syncTab, profileSync: S.profileSync, profileAt: S.profileAt
    }));
  } catch (e) {}
  psQueue();
}
function exportable() {
  return {
    greeting: S.greeting, greetMode: S.greetMode, greets: S.greets, bands: S.bands,
    city: S.city, geoMode: S.geoMode, unit: S.unit, clock24: S.clock24,
    gistUrl: S.gistUrl, quoteSource: S.quoteSource, quoteCustom: S.quoteCustom,
    theme: S.theme, themeMode: S.themeMode, align: S.align,
    textScale: S.textScale, fitMode: S.fitMode, boxH: S.boxH,
    engine: S.engine, engineCustom: S.engineCustom, searchEnabled: S.searchEnabled, linkIcons: S.linkIcons,
    tabTitle: S.tabTitle, imgSched: S.imgSched,
    quoteSched: S.quoteSched, cats: S.cats
  };
}

function setState(patch, cb) { Object.assign(S, patch); render(); if (cb) cb(); }
function set(patch, theme) {
  Object.assign(S, patch);
  if (theme) applyTheme(); else applySizing();
  render();
  persist();
}

/* Command-line edits change only S.line; the rail and the tray never read it,
   so a text repaint is the whole update — no strip or tray rebuild. */
function setLine(line) { S.line = line; paint(); }

/* A focused tray field owns its own value: recreating it mid-type is what the
   old snapFocus/restoreFocus dance had to undo, and what broke IME composition.
   A field edit updates state and runs its own side effect, but skips the tray
   rebuild. Derived readouts (dup marks, the HEIGHT value, the active band, the
   engine and panel selects) reconcile on focusout through renderTray().
   Structural changes — toggles, add/delete, mode switches, drag — still use
   set()/setState() and rebuild in full. */
function fieldEdit(patch, opt) {
  opt = opt || {};
  Object.assign(S, patch);
  if (opt.theme) applyTheme(); else applySizing();
  if (opt.rail) renderPanels();      /* a name/key/link edit shows in the rail */
  if (opt.quotes) applyQuotes();
  paint();
  persist();
}
function editCatField(patch) {
  fieldEdit({ cats: S.cats.map(function (c) {
    return c.id === S.editCatId ? Object.assign({}, c, patch) : c;
  }) }, { rail: true });
}

/* ------------------------------------------------------------------ *
 * theme + sizing
 * ------------------------------------------------------------------ */
var _inv = null;

/* AUTO follows the operating system's light/dark setting */
function prefersDark() {
  try { return window.matchMedia('(prefers-color-scheme: dark)').matches; }
  catch (e) { return true; }
}

function applyTheme() {
  var el = D.root; if (!el) return;
  var t = S.theme;
  var inv = S.themeMode === 'auto' ? !prefersDark() : S.themeMode === 'light';
  var Sv = function (k, v) { el.style.setProperty(k, v); };
  _inv = inv;
  var A = accentPair(), G = groundPair();
  Sv('--bg',      inv ? G.l : G.d);
  Sv('--fg',      inv ? '#565243' : '#bab3a1');
  Sv('--dim',     inv ? 'rgba(69,65,54,.55)' : 'rgba(186,179,161,.62)');
  Sv('--line',    inv ? 'rgba(69,65,54,.38)' : 'rgba(190,178,152,.26)');
  Sv('--panel',   inv ? 'rgba(249,246,235,.46)' : 'rgba(214,201,173,.055)');
  Sv('--panelHi', inv ? 'rgba(249,246,235,.72)' : 'rgba(214,201,173,.12)');
  Sv('--accent',  inv ? A.l : A.d);
  Sv('--accent2', inv ? '#8c3122' : '#c1503c');
  Sv('--vig',     inv ? 'rgba(120,112,92,.24)' : 'rgba(10,6,3,.62)');
  Sv('--grid',    inv ? 'rgba(69,65,54,.03)' : 'rgba(190,175,150,.018)');
  Sv('--imgBg',   inv ? 'rgba(69,65,54,.08)' : 'rgba(0,0,0,.25)');
  if (D.grid) D.grid.style.opacity = t.grid ? '1' : '0';
  document.body.style.background = inv ? G.l : G.d;
  document.title = S.tabTitle || '新規タブ';
  setFavicon(inv ? A.l : A.d, inv ? G.l : G.d);
  applySizing();
}

function setFavicon(fg, bg) {
  try {
    var c = document.createElement('canvas'); c.width = 64; c.height = 64;
    var x = c.getContext('2d');
    x.fillStyle = bg; x.fillRect(0, 0, 64, 64);
    x.fillStyle = fg; x.fillRect(16, 16, 32, 32);
    var l = document.querySelector('link[rel="icon"]');
    if (!l) { l = document.createElement('link'); l.rel = 'icon'; document.head.appendChild(l); }
    l.href = c.toDataURL('image/png');
  } catch (e) {}
}

function effGreeting() {
  if (S.greetMode !== 'time') return S.greeting;
  var hh = new Date(S.now).getHours();
  var bands = ['morning', 'afternoon', 'evening', 'night']
    .map(function (k) { return { k: k, start: Number(S.bands[k]) || 0 }; })
    .sort(function (a, b) { return a.start - b.start; });
  var pick = bands[bands.length - 1];
  bands.forEach(function (b) { if (hh >= b.start) pick = b; });
  return S.greets[pick.k];
}

function computeSizing() {
  var B = { greet: 17, greetLs: 5, date: 13, wk: 9, time: 19, cat: 14, catLs: 2, link: 14 };
  var need = function (sc) {
    var texts = [S.greeting];
    ['morning', 'afternoon', 'evening', 'night'].forEach(function (k) { texts.push(S.greets[k]); });
    var gN = Math.max.apply(null, texts.map(function (t) { return (t || '').length; })) || 1;
    var g = gN * (B.greet * sc + B.greetLs * sc) + 46;
    var timeN = S.clock24 ? 5 : 8;
    var c = 30 + 10 * (B.date * sc + 1) + 3 * (B.wk * sc + 2) + timeN * (B.time * sc + 1) + 18;
    var catN = Math.max.apply(null, S.cats.map(function (x) { return (x.name || '').length; }));
    var strip = catN * (B.cat * sc + B.catLs * sc) + 30;
    var ln = Math.max.apply(null, S.cats.map(function (x) { return x.links.length; }));
    var p = 34 + ln * (B.link * sc * 1.5) + Math.max(0, ln - 1) * (12 * sc);
    return Math.max(g, c, strip, p);
  };
  /* Never let a box grow past what the window can show: 230px stays reserved
     for the quote and the weather/terminal cluster, 170px once weather hides.
     S.boxH keeps the user's preference untouched; only the applied height is
     clamped, so a tall setting still applies in full on a taller display. */
  var short = (window.innerHeight || 800) <= 560;
  var maxH = Math.max(140, (window.innerHeight || 800) - (short ? 170 : 230));
  var sc = S.textScale, H = Math.min(Math.max(140, S.boxH), maxH);
  var capped = Math.max(140, S.boxH) > maxH;
  if (S.fitMode !== 'fit') {
    H = Math.max(H, Math.ceil(need(sc)));
    if (H > maxH) { H = maxH; capped = true; }
  }
  if (S.fitMode === 'fit' || capped) {
    for (var i = 0; i < 10 && need(sc) > H; i++) sc = Math.max(0.3, sc * (H / need(sc)) * 0.995);
    if (need(sc) > H) sc = Math.max(0.3, sc * (H / need(sc)) * 0.98);
  }
  return { sc: sc, H: Math.round(H), B: B, capped: capped };
}

/* Width of one open pane, kept in step with .pane in the stylesheet. The rail
   reserves this whether or not a panel is open, so opening one moves nothing. */
var PANE_W = 244;
var RAIL_EDGE = 40;

/* Span from the first child to the last, which counts every gap and margin
   exactly. Both offsets carry the rail's own padding, so it cancels out and the
   result cannot feed back into the padding this function is about to write. */
function railNatural() {
  var kids = D.rail && D.rail.children;
  if (!kids || !kids.length) return 0;
  var first = kids[0], last = kids[kids.length - 1];
  return (last.offsetLeft + last.offsetWidth) - first.offsetLeft;
}

/* Centre the composition on its closed width plus one reserved pane. Opening a
   panel consumes the reserve instead of pushing everything left. Below the fit
   threshold the reserve is abandoned and the rail scrolls from its left edge. */
function applyRailPad(el) {
  var closed = railNatural() - (S.openId ? PANE_W : 0);
  var want = closed + PANE_W;
  var room = (D.rail && D.rail.clientWidth) || window.innerWidth || 0;
  var pad = Math.floor((room - want) / 2);
  var fits = pad >= RAIL_EDGE;
  el.style.setProperty('--railPad', (fits ? pad : RAIL_EDGE) + 'px');
  el.style.setProperty('--railPadR', fits ? '0px' : '140px');
  railFades();
}

function applySizing() {
  var el = D.root; if (!el) return;
  var z = computeSizing(), sc = z.sc, B = z.B;
  var Sv = function (k, v) { el.style.setProperty(k, v); };
  var px = function (v) { return (Math.round(v * 10) / 10) + 'px'; };
  Sv('--boxH', z.H + 'px');
  Sv('--fs-greet', px(B.greet * sc)); Sv('--ls-greet', px(B.greetLs * sc));
  Sv('--fs-date', px(B.date * sc));
  Sv('--fs-wk', px(Math.max(7, B.wk * sc)));
  Sv('--fs-time', px(B.time * sc));
  Sv('--fs-cat', px(B.cat * sc)); Sv('--ls-cat', px(B.catLs * sc));
  Sv('--fs-link', px(B.link * sc));
  Sv('--gap-link', px(12 * sc));
  Sv('--tAlign', S.align === 'top' ? 'flex-start' : 'center');
  Sv('--tGap', px(14 * sc));
  Sv('--cmdSlot', S.searchEnabled ? '326px' : '140px');
  Sv('--cmdEng', S.searchEnabled ? '74px' : '0px');
  var above = Math.floor(((window.innerHeight || 800) - z.H) / 2) - 34 - 24;
  Sv('--quoteLines', String(Math.max(2, Math.floor(above / 22.2))));
  applyRailPad(el);
  applyImage();
}

/* ------------------------------------------------------------------ *
 * images
 * ------------------------------------------------------------------ */
var _bucket;
var _storeWarn = '';

/* Binaries live as Blobs in IndexedDB; IMG_KEY keeps only the small metadata
   array. A null from idbAll means the READ failed, which must never be
   mistaken for an empty store — the same contract psGet enforces. */
var IDB_NAME = 'jp-startpage', IDB_STORE = 'images';
var _idb = null, _idbBroken = false;

function idbOpen(cb) {
  if (_idb) return cb(_idb);
  if (_idbBroken || typeof indexedDB === 'undefined') return cb(null);
  var req;
  try { req = indexedDB.open(IDB_NAME, 1); }
  catch (e) { _idbBroken = true; return cb(null); }
  req.onupgradeneeded = function () {
    if (!req.result.objectStoreNames.contains(IDB_STORE)) req.result.createObjectStore(IDB_STORE);
  };
  req.onsuccess = function () {
    _idb = req.result;
    _idb.onclose = function () { _idb = null; };
    cb(_idb);
  };
  req.onerror = function () { _idbBroken = true; cb(null); };
}

function idbTx(mode, run, done) {
  idbOpen(function (db) {
    if (!db) return done(false, null);
    var tx;
    try { tx = db.transaction(IDB_STORE, mode); }
    catch (e) { return done(false, null); }
    var out = run(tx.objectStore(IDB_STORE));
    tx.oncomplete = function () { done(true, out); };
    tx.onerror = tx.onabort = function () { done(false, tx.error); };
  });
}

function idbPut(id, blob, cb) {
  idbTx('readwrite', function (st) { st.put(blob, id); }, function (ok, res) {
    cb(ok, ok ? '' : (res && res.name === 'QuotaExceededError' ? 'STORAGE FULL' : 'STORAGE ERROR'));
  });
}

function idbDel(id) {
  idbTx('readwrite', function (st) { st.delete(id); }, function () {});
}

function idbClear(cb) {
  idbTx('readwrite', function (st) { st.clear(); }, function () { if (cb) cb(); });
}

function idbAll(cb) {
  idbTx('readonly', function (st) {
    var map = {};
    var cur = st.openCursor();
    cur.onsuccess = function () {
      var c = cur.result;
      if (c) { map[c.key] = c.value; c.continue(); }
    };
    return map;
  }, function (ok, res) { cb(ok ? res : null); });
}

/* Object URLs are runtime-only handles to the blobs; entries never carry
   them. imgSrc falls back to a legacy data-URL src until migration lands. */
var _urls = {};

function imgSrc(im) { return _urls[im.id] || im.src || ''; }

function holdUrl(id, blob) {
  if (_urls[id]) return;
  try { _urls[id] = URL.createObjectURL(blob); } catch (e) {}
}

function dropUrl(id) {
  if (!_urls[id]) return;
  try { URL.revokeObjectURL(_urls[id]); } catch (e) {}
  delete _urls[id];
}

/* FileReader only ever produced ";base64," data URLs, so migration handles
   just that shape. atob keeps this working on file://, where fetch of a
   data: URL is blocked. */
function dataToBlob(u) {
  try {
    var i = u.indexOf(',');
    var head = u.slice(0, i);
    if (!/;base64$/.test(head)) return null;
    var mime = (head.match(/^data:([^;,]+)/) || [])[1] || 'image/png';
    var bin = atob(u.slice(i + 1));
    var arr = new Uint8Array(bin.length);
    for (var j = 0; j < bin.length; j++) arr[j] = bin.charCodeAt(j);
    return new Blob([arr], { type: mime });
  } catch (e) { return null; }
}

function curImg() { return S.imgs[S.imgIdx] || null; }

function saveImages(imgs) {
  var meta = imgs.map(function (im) {
    var o = { id: im.id, s: im.s, x: im.x, y: im.y };
    if (im.src) o.src = im.src;   /* legacy entry, blob not stored yet */
    return o;
  });
  try { localStorage.setItem(IMG_KEY, JSON.stringify(meta)); _storeWarn = ''; }
  catch (e) { _storeWarn = 'STORAGE FULL'; }
}

function setImgs(imgs, idx) {
  var next = typeof idx === 'number' ? Math.max(0, Math.min(idx, imgs.length - 1)) : S.imgIdx;
  setState({ imgs: imgs, imgIdx: imgs.length ? next : 0 }, function () {
    saveImages(imgs); applyImage(); persist(); paint();
  });
}

function loadImages() {
  var raw = null, readOk = true, stored = null;
  try { raw = localStorage.getItem(IMG_KEY); }
  catch (e) { readOk = false; raw = null; }
  if (readOk) { try { stored = JSON.parse(raw || '[]') || []; } catch (e) { stored = null; } }
  if (stored === null) {
    /* Read or parse FAILED. A failure must never read as an empty store: leave
       every blob intact (no purge), surface the error, and retry next boot —
       the same contract idbAll/psGet enforce. */
    _storeWarn = 'STORAGE ERROR';
    applyImage(); paint();
    return;
  }
  if (!stored.length) {
    applyImage();
    if (raw == null) idbClear();   /* metadata genuinely absent: purge any orphaned blobs */
    return;
  }
  var idx = S.imgIdx;
  if (S.imgSched === 'open' && stored.length > 1) idx = (idx + 1) % stored.length;
  _bucket = bucketFor(Date.now());
  setState({ imgs: stored, imgIdx: Math.min(idx, stored.length - 1) }, function () {
    applyImage(); persist();
  });
  idbAll(function (map) {
    if (map === null) {
      /* Store unreadable. Legacy entries still render from src; nothing on
         disk changes, so the next boot tries again. */
      _storeWarn = 'STORAGE ERROR';
      applyImage(); paint();
      return;
    }
    migrate(map);
  });
}

/* One-way and idempotent: a legacy entry keeps its data-URL src until its
   blob is safely stored, so a failed put loses nothing and retries next
   boot. */
function migrate(map) {
  var dirty = false, lost = false, pending = 0;
  S.imgs.forEach(function (im) {
    if (map[im.id]) {
      holdUrl(im.id, map[im.id]);
      if (im.src) { delete im.src; dirty = true; }   /* stored last run, strip now */
      return;
    }
    if (!im.src) { lost = true; return; }            /* blob gone, nothing to rebuild from */
    var blob = dataToBlob(im.src);
    if (!blob) return;
    pending++;
    idbPut(im.id, blob, function (ok) {
      if (ok) { holdUrl(im.id, blob); delete im.src; dirty = true; }
      if (--pending === 0) finish();
    });
  });
  if (!pending) finish();
  function finish() {
    if (dirty) saveImages(S.imgs);
    if (lost) _storeWarn = 'STORAGE ERROR';
    applyImage();
    if (S.trayOpen) renderTray();
    paint();
  }
}

function ingest(files) {
  var list = Array.prototype.slice.call(files || []).filter(function (f) { return /^image\//.test(f.type); });
  if (!list.length) return;
  var pending = list.length, added = [], warn = '';
  list.forEach(function (f) {
    var id = 'i' + Date.now() + Math.random().toString(36).slice(2, 6);
    idbPut(id, f, function (ok, w) {
      if (ok) { holdUrl(id, f); added.push({ id: id, s: 1, x: 0, y: 0 }); }
      else warn = w;
      if (--pending === 0) {
        if (added.length) setImgs(S.imgs.concat(added), S.imgs.length);
        if (warn) { _storeWarn = warn; paint(); }
      }
    });
  });
}

function bucketOf(sched, now) {
  if (sched === 'hour') return Math.floor(now / 3600000);
  if (sched === 'day')  return Math.floor(now / 86400000);
  if (sched === 'week') return Math.floor(now / 604800000);
  return sched;
}
function bucketFor(now) { return bucketOf(S.imgSched, now); }

var _qBucket;
function tickQuoteRotation() {
  var b = bucketOf(S.quoteSched, Date.now());
  if (_qBucket === undefined) { _qBucket = b; return; }
  if (b === _qBucket) return;
  _qBucket = b;
  if (QUOTES.length > 1) {
    S.quoteIdx = (S.quoteIdx + 1) % QUOTES.length;
    paint(); persist();
  }
}

function tickRotation() {
  var b = bucketFor(Date.now());
  if (_bucket === undefined) { _bucket = b; return; }
  if (b === _bucket) return;
  _bucket = b;
  if (S.imgs.length > 1) {
    S.imgIdx = (S.imgIdx + 1) % S.imgs.length;
    applyImage(); persist(); paint();
    if (S.trayOpen) renderTray();
  }
}

function applyImage(live) {
  var el = D.img, hint = D.imgHint;
  if (!el) return;
  var im = live || curImg();
  var src = im ? imgSrc(im) : '';
  if (!src) { el.style.display = 'none'; if (hint) hint.style.display = 'flex'; return; }
  if (el.getAttribute('src') !== src) el.setAttribute('src', src);
  el.style.display = 'block';
  el.style.transform = 'translate(' + (im.x || 0) + 'px,' + (im.y || 0) + 'px) scale(' + (im.s || 1) + ')';
  if (hint) hint.style.display = 'none';
}

function patchImg(patch) {
  var im = curImg(); if (!im) return;
  var imgs = S.imgs.map(function (x, i) { return i === S.imgIdx ? Object.assign({}, x, patch) : x; });
  setImgs(imgs);
}

/* ------------------------------------------------------------------ *
 * quotes — PULL fetches the configured source, falls back to built-ins
 * ------------------------------------------------------------------ */
/* One quote per line, "Author, the quote text". A line with no comma is
   taken as an unattributed quote. Only the first comma splits, so commas
   inside the quote itself survive. */
function parseQuotes(raw) {
  return String(raw || '').split(/\r?\n/).map(function (l) {
    l = l.trim();
    if (!l) return null;
    var i = l.indexOf(',');
    if (i < 0) return { text: l, author: '' };
    return { author: l.slice(0, i).trim(), text: l.slice(i + 1).trim() };
  }).filter(function (q) { return q && q.text; });
}

function cachedRemoteQuotes() {
  try {
    var c = JSON.parse(localStorage.getItem(Q_KEY) || 'null');
    if (c && c.url === S.gistUrl && Array.isArray(c.list) && c.list.length) return c.list;
  } catch (e) {}
  return null;
}

function applyQuotes() {
  var list = null;
  if (S.quoteSource === 'custom') list = parseQuotes(S.quoteCustom);
  else if (S.quoteSource === 'url') list = cachedRemoteQuotes();
  QUOTES = (list && list.length) ? list : BASE_QUOTES.slice();
  if (S.quoteIdx >= QUOTES.length) S.quoteIdx = 0;
}

function gistEndpoint(url) {
  var u = String(url || '').trim();
  if (!u) return null;
  if (!/^https?:\/\//.test(u)) u = 'https://' + u;
  var m = u.match(/^https?:\/\/gist\.github\.com\/[^/]+\/([0-9a-f]{8,})/i);
  if (m) return { api: true, url: 'https://api.github.com/gists/' + m[1] };
  return { api: false, url: u };
}

var _pullMsg = 'PULL';

function pullQuotes() {
  var ep = gistEndpoint(S.gistUrl);
  if (!ep) return;
  _pullMsg = '···'; renderTray();
  fetch(ep.url, { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw 0; return ep.api ? r.json() : r.text(); })
    .then(function (body) {
      var text = '';
      if (ep.api) {
        var files = body && body.files || {};
        Object.keys(files).forEach(function (k) { text += (files[k].content || '') + '\n'; });
      } else { text = String(body); }
      var list = parseQuotes(text);
      if (!list.length) throw 0;
      try { localStorage.setItem(Q_KEY, JSON.stringify({ url: S.gistUrl, list: list })); } catch (e) {}
      QUOTES = list;
      _pullMsg = 'PULLED';
      set({ quoteIdx: 0 });
      setTimeout(function () { _pullMsg = 'PULL'; renderTray(); }, 1400);
    })
    .catch(function () {
      applyQuotes();
      _pullMsg = 'FAILED';
      render();
      setTimeout(function () { _pullMsg = 'PULL'; renderTray(); }, 1600);
    });
}

/* ------------------------------------------------------------------ *
 * weather — Open-Meteo, no key required; static values stand in on failure
 * ------------------------------------------------------------------ */
var _wxKey = null, WX_LABEL = '';
var GEOMODES = [
  { id: 'manual',  label: 'MANUAL'  },
  { id: 'approx',  label: 'APPROX'  },
  { id: 'precise', label: 'PRECISE' }
];

/* Firefox 140+ gates optional data collection behind a browser-level grant the
   manifest advertises; Chrome gates navigator.geolocation on extension pages
   behind the optional geolocation permission. Each request runs only on the
   platform that owns it, synchronously inside the click, and any API absence
   or throw falls through as granted so neither browser can lose weather over
   a permission call the platform does not support. */
/* One request, because permissions.request() is only honoured inside the user
   gesture that started it — a second call from the first one's callback is
   already outside it and Firefox rejects it. Chrome rejects a request object
   carrying data_collection, so each browser gets only the keys it knows. */
function askGeo(precise, cb) {
  var done = psOnce(cb);
  try {
    var ff = typeof browser !== 'undefined' && browser.permissions && browser.permissions.request;
    var api = ff ? browser : (typeof chrome !== 'undefined' && chrome.permissions && chrome.permissions.request ? chrome : null);
    if (!api) { done(true); return; }
    var req = {};
    if (precise) req.permissions = ['geolocation'];
    if (ff) req.data_collection = ['locationInfo'];
    if (!req.permissions && !req.data_collection) { done(true); return; }
    var r = api.permissions.request(req, function (ok) {
      done(!!ok && !(api.runtime && api.runtime.lastError));
    });
    if (r && typeof r.then === 'function') r.then(function (ok) { done(ok !== false); }, function () { done(true); });
  } catch (e) { done(true); }
}
function geoAllowed(cb) {
  try {
    if (typeof browser !== 'undefined' && browser.permissions && browser.permissions.contains) {
      browser.permissions.contains({ data_collection: ['locationInfo'] })
        .then(function (ok) { cb(!!ok); }, function () { cb(true); });
      return;
    }
  } catch (e) {}
  cb(true);
}

/* Chrome hands a runtime grant to the extension, not to the document that
   asked for it, so navigator.geolocation stays inert here until a fresh
   document loads. _geoAtBoot records what this document started with, which
   is what tells a grant that lands now apart from one already in place. */
var _geoAtBoot = null;

/* A settled request() is not proof of a grant. A call that never prompts —
   no gesture, a key the browser will not take, a throw the catch swallows —
   still settles, and reading that as success is what left the readout waiting
   on a permission it never had. geoGranted reads the real state instead.
   null means the question cannot be answered here, which is a plain web copy
   with no extension API; the browser prompts for itself there. */
function geoGranted(cb) {
  var one = psOnce(cb);
  try {
    var api = (typeof browser !== 'undefined' && browser.permissions && browser.permissions.contains) ? browser
            : ((typeof chrome !== 'undefined' && chrome.permissions && chrome.permissions.contains) ? chrome : null);
    if (!api) { one(null); return; }
    var r = api.permissions.contains({ permissions: ['geolocation'] }, function (ok) {
      one(api.runtime && api.runtime.lastError ? null : !!ok);
    });
    if (r && typeof r.then === 'function') r.then(function (ok) { one(!!ok); }, function () { one(null); });
  } catch (e) { one(null); }
}

function geoFail(msg) {
  WX_LABEL = msg;
  paint();
  if (S.trayOpen) renderTray();
}

/* Open-Meteo returns an IANA zone, so the last segment gives a usable place
   name without a second round trip to a reverse geocoder. */
function tzLabel(tz) {
  var seg = String(tz || '').split('/').pop() || '';
  return seg.replace(/_/g, ' ').toUpperCase() || '';
}

function forecastAt(lat, lon, label, key) {
  lat = Math.round(lat * 100) / 100;   /* ~1km: enough for a forecast, not a household */
  lon = Math.round(lon * 100) / 100;
  return fetch('https://api.open-meteo.com/v1/forecast?forecast_days=1&timezone=auto' +
    '&latitude=' + lat + '&longitude=' + lon +
    '&current=temperature_2m,weather_code' +
    '&daily=temperature_2m_max,temperature_2m_min')
    .then(function (r) { return r.json(); })
    .then(function (f) {
      if (_wxKey !== key) return;   /* a newer mode/city fetch has since run; do not overwrite it */
      if (!f || !f.current || !f.daily) throw 0;
      var code = WMO[f.current.weather_code] || ['—', '—'];
      var wx = {
        c:  Math.round(f.current.temperature_2m),
        hi: Math.round(f.daily.temperature_2m_max[0]),
        lo: Math.round(f.daily.temperature_2m_min[0]),
        cond: code[0], kana: code[1]
      };
      WX = wx;
      WX_LABEL = label || tzLabel(f.timezone) || WX_LABEL;
      try {
        localStorage.setItem(WX_KEY, JSON.stringify({ key: key, at: Date.now(), wx: WX, label: WX_LABEL }));
      } catch (e) {}
      paint();
      if (S.trayOpen) renderTray();   /* the location readout is built from WX_LABEL */
      if (S.themeMode === 'auto') applyTheme();
    });
}

function fetchWeather(force) {
  var mode = S.geoMode || 'manual';
  var city = (S.city || '').trim();
  var key = mode === 'manual' ? 'city:' + city.toUpperCase() : mode;
  if (!force && _wxKey === key) return;
  _wxKey = key;

  try {
    var c = JSON.parse(localStorage.getItem(WX_KEY) || 'null');
    if (c && c.key === key && Date.now() - c.at < 1800000) {
      WX = c.wx; if (c.label) WX_LABEL = c.label;
      paint();
      if (S.themeMode === 'auto') applyTheme();
      return;
    }
  } catch (e) {}

  var quiet = function () { /* leave whatever is already on screen */ };

  if (mode === 'approx') {
    geoAllowed(function (ok) {
      if (!ok) { geoFail('NO CONSENT'); return; }
      /* IP lookup: no permission prompt, city name comes back with the position */
      fetch('https://ipapi.co/json/')
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (!j || j.latitude == null) throw 0;
          return forecastAt(j.latitude, j.longitude, String(j.city || '').toUpperCase(), key);
        })
        .catch(quiet);
    });
    return;
  }

  if (mode === 'precise') {
    geoAllowed(function (ok) {
      if (!ok) { geoFail('NO CONSENT'); return; }
      if (!navigator.geolocation) { geoFail('NO LOCATION'); return; }
      /* The option below cannot bound this call. Per the Geolocation spec the
         timeout covers only the position acquisition, never the wait for
         permission, so a permission that never resolves fires neither
         callback and the readout waits forever. This guard is what ends it. */
      var guard = setTimeout(function () {
        geoGranted(function (has) { geoFail(has === false ? 'NO PERMISSION' : 'NO LOCATION'); });
      }, 12000);
      navigator.geolocation.getCurrentPosition(
        function (pos) {
          clearTimeout(guard);
          forecastAt(pos.coords.latitude, pos.coords.longitude, '', key).catch(quiet);
        },
        function () {
          /* denied or unavailable: without this the tray reads LOCATING… forever */
          clearTimeout(guard);
          geoFail('NO LOCATION');
        },
        { timeout: 10000, maximumAge: 600000 }
      );
    });
    return;
  }

  if (!city) return;
  fetch('https://geocoding-api.open-meteo.com/v1/search?count=1&language=en&format=json&name=' + encodeURIComponent(city))
    .then(function (r) { return r.json(); })
    .then(function (g) {
      var p = g && g.results && g.results[0];
      if (!p) throw 0;
      return forecastAt(p.latitude, p.longitude, city.toUpperCase(), key);
    })
    .catch(quiet);
}

/* ------------------------------------------------------------------ *
 * config as a file
 * ------------------------------------------------------------------ */
var _cfgTimer;
function cfgFlash(m) {
  clearTimeout(_cfgTimer);
  S.cfgMsg = m;
  if (S.trayOpen) renderTray();
  _cfgTimer = setTimeout(function () { S.cfgMsg = ''; if (S.trayOpen) renderTray(); }, 1800);
}

function cfgExport() {
  try {
    var d = new Date(), p = function (n) { return String(n).padStart(2, '0'); };
    var name = 'jp-startpage-' + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '.json';
    var blob = new Blob([JSON.stringify(exportable(), null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    cfgFlash('SAVED');
  } catch (e) { cfgFlash('FAILED'); }
}

/* Everything a link URL passes through: no http(s) scheme means it gets
   https:// prefixed, so no stored link can carry a script scheme. */
function safeUrl(raw) {
  var u = String(raw == null ? '' : raw).trim();
  if (!u || u === '#') return '#';
  return /^https?:/i.test(u) ? u : 'https://' + u;
}

/* A URL under the cursor is half-typed, so it cannot be normalised on every
   keystroke. This only strips the schemes that would execute; safeUrl() adds
   the https:// when the edit closes, and every use site calls it anyway. */
function liveUrl(raw) {
  var u = String(raw == null ? '' : raw);
  return /^\s*(javascript|data|vbscript|file)\s*:/i.test(u) ? '' : u;
}

/* keys claimed by more than one entry in the same list — first match wins at
   the keyboard, so the loser needs to be visible in the tray */
function dupeKeys(list) {
  var seen = {}, dupe = {};
  (list || []).forEach(function (x) {
    var k = String(x && x.key || '').toLowerCase();
    if (!k) return;
    if (seen[k]) dupe[k] = true; else seen[k] = true;
  });
  return dupe;
}

function sanitizeCats(cats) {
  if (!Array.isArray(cats)) return null;
  var out = cats.filter(function (c) { return c && typeof c === 'object'; })
    .map(function (c, i) {
      return {
        id: String(c.id || 'cat' + i),
        name: String(c.name || ''),
        key: String(c.key || '').slice(0, 1).toLowerCase(),
        links: (Array.isArray(c.links) ? c.links : []).map(function (l) {
          l = (l && typeof l === 'object') ? l : {};
          return {
            label: String(l.label || ''),
            key: String(l.key || '').slice(0, 1).toLowerCase(),
            url: safeUrl(l.url)
          };
        })
      };
    });
  return out.length ? out : null;
}

/* Theme colours reach applyTheme() -> style.setProperty and body.style
   unvalidated: shaped() gates only on type, so an imported, pulled, synced or
   locally tampered payload could carry any CSS string (a url(...) beacon, an
   overlay) where a #hex belongs. Force every colour to a #RGB/#RRGGBB literal
   and every slot index into range before it can reach a sink. */
function hexColor(v, fb) {
  return (typeof v === 'string' && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v.trim())) ? v.trim() : fb;
}
function themePair(v, def) {
  v = (v && typeof v === 'object' && !Array.isArray(v)) ? v : {};
  return { d: hexColor(v.d, def.d), l: hexColor(v.l, def.l) };
}
function sanitizeTheme(t) {
  var d = defaults().theme;
  t = (t && typeof t === 'object' && !Array.isArray(t)) ? t : {};
  var slot = function (v) { return (v === 1 || v === 2 || v === 3) ? v : 0; };
  return { a: slot(t.a), b: slot(t.b), grid: t.grid !== false,
           ac: themePair(t.ac, d.ac), gc: themePair(t.gc, d.gc) };
}

/* A payload value lands only where its shape matches the defaults: a null or
   mistyped leaf keeps the current value instead of poisoning S, where a later
   persist() would carry it into localStorage and crash the next boot. */
function shaped(d, v, cur) {
  if (d === null || typeof d !== 'object') return typeof v === typeof d ? v : cur;
  if (!v || typeof v !== 'object' || Array.isArray(v)) return cur;
  var out = {}, k;
  for (k in d) out[k] = shaped(d[k], v[k], (cur && typeof cur === 'object' && !Array.isArray(cur)) ? cur[k] : d[k]);
  return out;
}

/* Imports and pulled payloads merge through this whitelist: only the keys
   exportable() emits are accepted, so a crafted config can never set the
   token, the gist id, or transient state. Cats are rebuilt field by field. */
function applyConfig(o) {
  var base = defaults();
  Object.keys(exportable()).forEach(function (k) {
    if (k === 'cats' || o[k] === undefined) return;
    S[k] = shaped(base[k], o[k], S[k]);
  });
  S.theme = sanitizeTheme(S.theme);
  var cats = sanitizeCats(o.cats);
  if (cats) S.cats = cats;
  if (!S.cats.some(function (c) { return c.id === S.editCatId; })) S.editCatId = S.cats[0].id;
  if (S.openId && !S.cats.some(function (c) { return c.id === S.openId; })) S.openId = null;
  S.editLinkIdx = null;
  _bucket = undefined;
  _qBucket = undefined;
  applyQuotes();
  applyTheme();
  render();
  persist();
  fetchWeather(true);
}

function cfgImportFile(file) {
  if (!file) return;
  var r = new FileReader();
  r.onload = function () {
    try {
      var o = JSON.parse(r.result);
      if (!o || typeof o !== 'object' || Array.isArray(o)) throw 0;
      applyConfig(o);
      cfgFlash('LOADED');
    } catch (e) { cfgFlash('NOT A CONFIG FILE'); }
  };
  r.onerror = function () { cfgFlash('FAILED'); };
  r.readAsText(file);
}

/* ------------------------------------------------------------------ *
 * profile sync
 *
 * The browser's own extension storage, which Chrome and Firefox replicate
 * across a signed-in profile. Same payload as the gist path, so the token and
 * the gist id are excluded by construction. Images stay out: they are data
 * URLs in a separate key and would blow the quota on the first write.
 *
 * Both browsers cap an item at 8,192 bytes and the whole area at 102,400, so
 * the payload is sliced across numbered items. Chrome also rate-limits writes
 * to 120 a minute, which the debounce below stays well clear of.
 * ------------------------------------------------------------------ */
/* Both quotas are enforced in UTF-8 bytes of the JSON-encoded value: CJK text
   costs up to three bytes per character and a control character six, so chunks
   are cut by measured bytes, never by character count. */
var PS_ITEM = 7600;
var PS_MAX = 100000;
var PS_DEBOUNCE = 2500;
var _psWrite, _psRev = '', _psMsg = '';

var PS_ENC = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;
function psUtf8(s) { return PS_ENC ? PS_ENC.encode(s).length : s.length * 3; }

function psSlice(raw) {
  var out = [], i = 0, take, bytes, next;
  while (i < raw.length) {
    take = Math.min(raw.length - i, PS_ITEM);
    for (;;) {
      if (take > 1) {
        var c = raw.charCodeAt(i + take - 1);
        if (c >= 0xD800 && c < 0xDC00) take--;   /* never split a surrogate pair */
      }
      bytes = psUtf8(JSON.stringify(raw.slice(i, i + take)));
      if (bytes <= PS_ITEM || take <= 1) break;
      next = Math.floor(take * PS_ITEM / bytes);
      take = next < take ? next : take - 1;
    }
    out.push(raw.slice(i, i + take));
    i += take;
  }
  return out;
}

/* True while a payload from the profile is being applied, and while a push
   records its own result. Both write to localStorage, and persist() is what
   queues a push — without this, a push would schedule the next one forever. */
var _psApplying = false;
function psQuiet(fn) {
  _psApplying = true;
  try { fn(); } finally { _psApplying = false; }
}

function psApi() {
  try {
    /* chrome first: Firefox exposes both, and only the chrome namespace takes
       the callback form. The browser namespace returns a promise and drops the
       callback on the floor, which would hang every call made through it. */
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) return chrome;
    if (typeof browser !== 'undefined' && browser.storage && browser.storage.sync) return browser;
  } catch (e) {}
  return null;
}
function psArea() { var a = psApi(); return a ? a.storage.sync : null; }
function psAvailable() { return !!psArea(); }

/* Whichever flavour answers first wins, so the same call works against a
   callback API and a promise-returning one without firing the handler twice. */
function psOnce(cb) {
  var spent = false;
  return function (v) { if (spent) return; spent = true; cb(v); };
}
function psDo(method, arg, cb) {
  var a = psArea();
  var one = psOnce(cb || function () {});
  if (!a) { one(null); return; }
  try {
    var r = a[method](arg, function (v) {
      var api = psApi();
      var err = api && api.runtime && api.runtime.lastError;
      one(err ? null : (v === undefined ? true : v));
    });
    if (r && typeof r.then === 'function') {
      r.then(function (v) { one(v === undefined ? true : v); }, function () { one(null); });
    }
  } catch (e) { one(null); }
}

/* what the browsers actually charge for: the key plus the stringified value */
function psBytes(obj) {
  var t = 0;
  Object.keys(obj).forEach(function (k) { t += psUtf8(k) + psUtf8(JSON.stringify(obj[k])); });
  return t;
}

function psFlash(m, hold) {
  _psMsg = m;
  if (S.trayOpen) renderTray();
  if (hold !== false) setTimeout(function () {
    if (_psMsg === m) { _psMsg = ''; if (S.trayOpen) renderTray(); }
  }, 2200);
}

/* null strictly means the read FAILED; empty storage comes back as {} */
function psGet(cb) {
  psDo('get', null, function (all) { cb(all && typeof all === 'object' ? all : null); });
}

function psUnpack(all) {
  var raw = psRaw(all);
  if (raw === null) return null;
  try {
    var o = JSON.parse(raw);
    if (!o || typeof o !== 'object' || Array.isArray(o)) return null;
    return { cfg: o, meta: all.pmeta };
  } catch (e) { return null; }
}

function psRaw(all) {
  if (!all || !all.pmeta || !all.pmeta.n) return null;
  var raw = '';
  for (var i = 0; i < all.pmeta.n; i++) {
    if (typeof all['p' + i] !== 'string') return null;
    raw += all['p' + i];
  }
  return raw;
}

function psPush(loud) {
  if (!psAvailable()) { if (loud) psFlash('EXTENSION ONLY'); return; }
  var raw = JSON.stringify(exportable());
  psGet(function (all) {
    if (all === null) { if (loud) psFlash('FAILED'); return; }
    /* Identical content is not worth a write, and refusing it is what stops two
       machines trading rewrites of the same setup until the rate limit bites. */
    if (psRaw(all) === raw) {
      _psRev = all.pmeta.rev;
      if (all.pmeta.at && S.profileAt !== all.pmeta.at) { S.profileAt = all.pmeta.at; psQuiet(persist); }
      if (loud) psFlash('ALREADY SAVED'); else if (S.trayOpen) renderTray();
      return;
    }
    var body = {}, chunks = psSlice(raw);
    chunks.forEach(function (c, i) { body['p' + i] = c; });
    body.pmeta = { n: chunks.length, at: Date.now(), rev: 'r' + Date.now() + Math.random().toString(36).slice(2, 6) };
    if (psBytes(body) > PS_MAX) { psFlash('TOO LARGE TO SYNC'); return; }

    /* a shorter payload must not leave the old tail behind */
    var stale = [];
    Object.keys(all).forEach(function (k) {
      if (/^p\d+$/.test(k) && body[k] === undefined) stale.push(k);
    });
    var done = function () {
      S.profileAt = body.pmeta.at;
      psQuiet(persist);
      if (loud) psFlash('PUSHED'); else if (S.trayOpen) renderTray();
    };
    /* before the write: storage.onChanged fires in the writing context too */
    _psRev = body.pmeta.rev;
    psDo('set', body, function (ok) {
      if (ok) { if (stale.length) psDo('remove', stale, done); else done(); return; }
      /* Coarser chunking than what is stored can push the transient total past
         the area quota. Clear the leftovers and try once more. */
      if (!stale.length) { psFlash('SYNC REFUSED THE WRITE'); return; }
      psDo('remove', stale, function () {
        psDo('set', body, function (ok2) {
          if (ok2) done(); else psFlash('SYNC REFUSED THE WRITE');
        });
      });
    });
  });
}

function psQueue() {
  if (_psApplying || !S.profileSync || !psAvailable()) return;
  clearTimeout(_psWrite);
  _psWrite = setTimeout(function () { if (S.profileSync) psPush(false); }, PS_DEBOUNCE);
}

function psPull(loud) {
  if (!psAvailable()) { if (loud) psFlash('EXTENSION ONLY'); return; }
  psGet(function (all) {
    if (all === null) { if (loud) psFlash('FAILED'); return; }
    var got = psUnpack(all);
    if (!got) { if (loud) psFlash('NOTHING STORED'); return; }
    _psRev = got.meta.rev;
    S.profileAt = got.meta.at || Date.now();
    psQuiet(function () { applyConfig(got.cfg); });
    if (loud) psFlash('PULLED');
  });
}

/* Another machine wrote. Skip our own echo, and hold off while a tray field has
   the cursor — rewriting the DOM under a caret reads as the page fighting back. */
function psRemote(changes, area) {
  if (area !== 'sync' || !S.profileSync) return;
  if (!changes || !changes.pmeta || !changes.pmeta.newValue) return;
  if (changes.pmeta.newValue.rev === _psRev) return;
  var a = document.activeElement, tag = (a && a.tagName) || '';
  if (tag === 'INPUT' || tag === 'TEXTAREA') {
    setTimeout(function () { psRemote(changes, area); }, 1500);
    return;
  }
  psPull(false);
  psFlash('UPDATED');
}

function psWatch() {
  var api = psApi();
  if (!api || !api.storage || !api.storage.onChanged) return;
  try { api.storage.onChanged.addListener(psRemote); } catch (e) {}
}

/* On open, whichever side is newer wins. Ties do nothing. */
function psReconcile() {
  if (!S.profileSync || !psAvailable()) return;
  psGet(function (all) {
    if (all === null) return;   /* a failed read must not be mistaken for empty storage */
    var got = psUnpack(all);
    if (!got) { psPush(false); return; }
    var remote = got.meta.at || 0;
    if (remote > (S.profileAt || 0)) {
      _psRev = got.meta.rev;
      S.profileAt = remote;
      psQuiet(function () { applyConfig(got.cfg); });
    } else if (remote < (S.profileAt || 0)) {
      psPush(false);
    } else {
      _psRev = got.meta.rev;
    }
  });
}

function psStamp() {
  if (!psAvailable()) return 'UNAVAILABLE';
  if (!S.profileSync) return 'OFF';
  if (!S.profileAt) return 'ON · NOTHING SAVED YET';
  var d = new Date(S.profileAt), p = function (n) { return String(n).padStart(2, '0'); };
  return 'SAVED ' + d.getFullYear() + '.' + p(d.getMonth() + 1) + '.' + p(d.getDate()) +
         ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
}

/* ------------------------------------------------------------------ *
 * gist sync
 *
 * A classic GitHub token with the `gist` scope, kept in this browser's
 * localStorage. It is deliberately absent from exportable(), so neither the
 * clipboard export nor the synced payload can ever carry it.
 * ------------------------------------------------------------------ */
var SYNC_FILE = 'jp-startpage.json';
var _syncMsg = '';
var _syncTimer;

function syncFlash(m, hold) {
  clearTimeout(_syncTimer);
  _syncMsg = m;
  if (S.trayOpen) renderTray();
  if (hold !== false) {
    _syncTimer = setTimeout(function () { _syncMsg = ''; if (S.trayOpen) renderTray(); }, 2200);
  }
}

function gistHeaders() {
  return {
    'Authorization': 'Bearer ' + String(S.gistToken || '').trim(),
    'Accept': 'application/vnd.github+json',
    'Content-Type': 'application/json'
  };
}

function syncErr(status) {
  if (status === 401) return 'BAD TOKEN';
  if (status === 403) return 'FORBIDDEN';
  if (status === 404) return 'GIST NOT FOUND';
  return 'FAILED';
}

function syncPush() {
  if (!String(S.gistToken || '').trim()) { syncFlash('NO TOKEN'); return; }
  var id = String(S.gistId || '').trim();
  var body = { description: 'jp-startpage config', files: {} };
  body.files[SYNC_FILE] = { content: JSON.stringify(exportable(), null, 1) };
  if (!id) body.public = false;          /* secret gist on first push */
  syncFlash('···', false);
  fetch(id ? 'https://api.github.com/gists/' + id : 'https://api.github.com/gists',
        { method: id ? 'PATCH' : 'POST', headers: gistHeaders(), body: JSON.stringify(body) })
    .then(function (r) { if (!r.ok) throw r.status; return r.json(); })
    .then(function (j) {
      S.gistId = j.id || id;
      S.syncAt = Date.now();
      persist();
      syncFlash('PUSHED');
    })
    .catch(function (e) { syncFlash(syncErr(e)); });
}

function syncPull() {
  if (!String(S.gistToken || '').trim()) { syncFlash('NO TOKEN'); return; }
  var id = String(S.gistId || '').trim();
  if (!id) { syncFlash('NO GIST ID'); return; }
  syncFlash('···', false);
  fetch('https://api.github.com/gists/' + id, { headers: gistHeaders(), cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw r.status; return r.json(); })
    .then(function (j) {
      var f = j.files && j.files[SYNC_FILE];
      if (!f || !f.content) throw 404;
      var o = JSON.parse(f.content);
      if (!o || typeof o !== 'object' || Array.isArray(o)) throw 0;
      S.syncAt = Date.now();
      applyConfig(o);
      syncFlash('PULLED');
    })
    .catch(function (e) { syncFlash(syncErr(e)); });
}

function syncStamp() {
  if (!S.syncAt) return 'NEVER SYNCED';
  var d = new Date(S.syncAt), p = function (n) { return String(n).padStart(2, '0'); };
  return 'LAST SYNC ' + d.getFullYear() + '.' + p(d.getMonth() + 1) + '.' + p(d.getDate()) +
         ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
}

/* ------------------------------------------------------------------ *
 * search
 * ------------------------------------------------------------------ */
function parseQuery(q) {
  var m = String(q || '').match(/^([a-z])(?:\s+(.*))?$/i);
  if (m) {
    var eng = engineList().filter(function (x) { return x.id === m[1].toLowerCase(); })[0];
    if (eng) return { eng: eng, term: m[2] || '' };
  }
  var all = engineList();
  var cur = all.filter(function (x) { return x.id === S.engine; })[0] || all[0];
  return { eng: cur, term: String(q || '') };
}

/* the line is the whole command buffer; a leading slash means it is a query */
function typing() { return S.line.charAt(0) === '/'; }
function queryText() { return S.line.replace(/^\//, ''); }

function submitLine() {
  var r = parseQuery(queryText());
  if (!r.term.trim()) return;
  location.href = searchUrl(r.eng, r.term.trim());
  setLine('');
}

/* ------------------------------------------------------------------ *
 * keyboard
 * ------------------------------------------------------------------ */
function handleKey(e) {
  var tag = (e.target && e.target.tagName) || '';
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;

  /* once the line holds a slash every keystroke is text, not a shortcut */
  if (typing()) {
    if (e.key === 'Escape')    { e.preventDefault(); setLine(''); return; }
    if (e.key === 'Enter')     { e.preventDefault(); submitLine(); return; }
    if (e.key === 'Backspace') { e.preventDefault(); setLine(S.line.slice(0, -1)); return; }
    if (e.key.length === 1)    { e.preventDefault(); setLine(S.line + e.key); return; }
    return;
  }

  if (e.key === 'Escape') {
    if (S.trayOpen) setState({ trayOpen: false });
    else setState({ openId: null, line: '' });
    return;
  }
  if (e.key === '/' && S.searchEnabled) {
    e.preventDefault();
    try { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); } catch (err) {}
    setLine('/');
    return;
  }

  var k = (e.key || '').toLowerCase();
  if (k.length !== 1 || !/[a-z0-9]/.test(k)) return;

  var open = S.cats.filter(function (c) { return c.id === S.openId; })[0];
  if (open) {
    var link = open.links.filter(function (l) { return (l.key || '').toLowerCase() === k; })[0];
    if (link) {
      e.preventDefault();
      location.href = safeUrl(link.url);
      setState({ openId: null, line: (open.key || '').toLowerCase() + ' ' + k + ' ▸' });
      return;
    }
  }
  var cat = S.cats.filter(function (c) { return (c.key || '').toLowerCase() === k; })[0];
  if (cat) {
    e.preventDefault();
    var same = S.openId === cat.id;
    setState({ openId: same ? null : cat.id, line: same ? '' : k });
  } else {
    setLine('?');
  }
}

function handlePaste(e) {
  if (!typing()) return;
  var cd = e.clipboardData || window.clipboardData;
  var t = cd ? (cd.getData('text') || '') : '';
  if (!t) return;
  e.preventDefault();
  setLine(S.line + t.replace(/[\r\n]+/g, ' '));
}

/* ------------------------------------------------------------------ *
 * reorder + FLIP
 * ------------------------------------------------------------------ */
function reorder(list, from, to) {
  var out = list.slice();
  var it = out.splice(from, 1)[0];
  out.splice(to, 0, it);
  return out;
}

/* dragover fires continuously, even with the pointer still, and
   getBoundingClientRect() reports mid-flight positions while the FLIP
   transition runs. Both feed bad indices straight back into the reorder,
   which is what makes two panels trade places over and over. Three guards:
   wait out the animation, require real pointer movement, and pick the slot
   by midpoint crossing so reversing needs a deliberate move back. */
var _dragLock = 0, _dragLastPos = null, _dragNode = null;
var FLIP_MS = 190;

function dragSettled(pos) {
  if (performance.now() - _dragLock < FLIP_MS + 20) return false;
  if (_dragLastPos != null && Math.abs(pos - _dragLastPos) < 4) return false;
  return true;
}

function dragTarget(container, pos, horizontal, dragNode) {
  var others = Array.prototype.slice.call(container.children).filter(function (k) { return k !== dragNode; });
  for (var i = 0; i < others.length; i++) {
    var r = others[i].getBoundingClientRect();
    var mid = horizontal ? r.left + r.width / 2 : r.top + r.height / 2;
    if (pos < mid) return i;
  }
  return others.length;
}

function dragBegin(pos) { _dragLock = 0; _dragLastPos = pos; }
function dragTook(pos) { _dragLock = performance.now(); _dragLastPos = pos; }

var _flip = null;
function snapFlip(container, attr) {
  if (!container) return;
  var map = {};
  container.querySelectorAll('[' + attr + ']').forEach(function (el) {
    map[el.getAttribute(attr)] = el.getBoundingClientRect();
  });
  _flip = { container: container, attr: attr, map: map };
}
function playFlip(container) {
  var f = _flip;
  if (!f || !f.container || !f.container.isConnected) { _flip = null; return; }
  if (container && f.container !== container) return;
  _flip = null;
  f.container.querySelectorAll('[' + f.attr + ']').forEach(function (el) {
    var prev = f.map[el.getAttribute(f.attr)];
    if (!prev) return;
    var now = el.getBoundingClientRect();
    var dx = prev.left - now.left, dy = prev.top - now.top;
    if (!dx && !dy) return;
    el.style.transition = 'none';
    el.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
    requestAnimationFrame(function () {
      el.style.transition = 'transform ' + FLIP_MS + 'ms cubic-bezier(.2,.75,.3,1)';
      el.style.transform = 'translate(0,0)';
    });
  });
}

function mark(name, key) {
  var n = String(name || '');
  var i = n.toLowerCase().indexOf(String(key || '').toLowerCase());
  if (i < 0) return { pre: '', k: String(key || '').slice(0, 1), post: n };
  return { pre: n.slice(0, i), k: n.slice(i, i + 1), post: n.slice(i + 1) };
}

function faviconFor(url) {
  if (!S.linkIcons) return '';
  var host = String(url || '').replace(/^https?:\/\//, '').split('/')[0];
  var bare = host.replace(/:\d+$/, '');
  if (!bare || /^(\d+\.){3}\d+$/.test(bare) || bare.indexOf('.') < 0) return '';
  if (/\.(local|lan|internal|home\.arpa)$/i.test(bare)) return '';
  return 'https://www.google.com/s2/favicons?sz=32&domain=' + bare;
}

function updateCat(patch) {
  set({ cats: S.cats.map(function (c) {
    return c.id === S.editCatId ? Object.assign({}, c, patch) : c;
  }) });
}
function editCat() {
  return S.cats.filter(function (c) { return c.id === S.editCatId; })[0]
      || S.cats[0] || { links: [], name: '', key: '' };
}

/* ------------------------------------------------------------------ *
 * static shell
 * ------------------------------------------------------------------ */
function buildShell() {
  D.root = document.getElementById('root');

  D.vig = h('div', { c: 'vig' });
  D.grid = h('div', { c: 'grid' });

  D.quoteT = h('div', { c: 'quote-t' });
  D.quoteA = h('div', { c: 'quote-a' });
  D.quote = h('div', { c: 'quote', btn: 1, al: 'Next quote', on: { click: function () {
    set({ quoteIdx: (S.quoteIdx + 1) % QUOTES.length });
  } } }, [D.quoteT, D.quoteA]);

  D.wxCity = h('div', { c: 'wx-city' });
  D.wxTemp = h('span', { c: 'wx-temp' });
  D.wxCond = h('span', { c: 'wx-cond' });
  D.wxHilo = h('div', { c: 'wx-hilo' });
  D.wx = h('div', { c: 'wx' }, [
    D.wxCity,
    h('div', { c: 'wx-row' }, [D.wxTemp, D.wxCond]),
    D.wxHilo
  ]);

  D.cmdP    = h('span', { c: 'cmd-p', t: '>' });
  D.cmdLine = h('span', { c: 'cmd-line' });
  D.cmdCur  = h('span', { c: 'cmd-cur' });
  D.cmdEng  = h('span', { c: 'cmd-eng' });
  D.cmdSlot = h('div', { c: 'cmd-slot' }, [D.cmdLine, D.cmdCur]);
  D.cmd = h('div', { c: 'cmd' }, [D.cmdP, D.cmdSlot, D.cmdEng]);

  D.cDate = h('div', { c: 'vt c-date' });
  D.cWk   = h('div', { c: 'vt c-wk' });
  D.cTime = h('div', { c: 'vt c-time' });
  var clock = h('div', { c: 'box clock' }, [D.cDate, D.cWk, D.cTime]);

  D.img = h('img', { c: 'img-el', a: { alt: '' } });
  D.imgHint = h('div', { c: 'img-hint' }, [
    h('b', { t: 'DROP IMAGES OR GIFS' }),
    h('i', { t: '画像をドロップ' })
  ]);
  D.imgMeta = h('div', { c: 'img-meta' });
  var vp = h('div', { c: 'img-vp', on: { mousedown: startPan } }, [D.img, D.imgHint]);
  D.imgBox = h('div', { c: 'box imgbox' }, [
    vp, D.imgMeta, h('div', { c: 'mk mk-tl' }), h('div', { c: 'mk mk-br' })
  ]);

  D.greetT = h('div', { c: 'vt greet-t' });
  var greet = h('div', { c: 'box greet' }, D.greetT);

  D.panels = h('div', { c: 'panels' });

  D.rail = h('div', { c: 'rail' }, [clock, D.imgBox, greet, D.panels]);
  D.rail.addEventListener('scroll', railFades, { passive: true });

  D.cfgBtn = h('div', { c: 'cfg-btn', btn: 1, al: 'Config', on: { click: function () {
    setState({ trayOpen: !S.trayOpen });
  } } }, [
    h('span', { c: 'cfg-dot' }),
    h('span', { c: 'cfg-lbl', t: '設定 CONFIG' })
  ]);

  D.trayHost = h('div');
  /* Delegated on the stable host, not the rebuilt inputs: composition events
     bubble here and survive every tray rebuild. */
  D.trayHost.addEventListener('compositionstart', function () { _composing = true; });
  D.trayHost.addEventListener('compositionend', function () { _composing = false; renderTray(); });
  /* Field edits skip the tray rebuild for speed; reconcile the derived readouts
     once focus leaves a text field. Deferred so focus settles first — if it
     moved to another field, renderTray's snapFocus/restoreFocus carry it over. */
  D.trayHost.addEventListener('focusout', function (e) {
    var tag = e.target && e.target.tagName;
    if (tag !== 'INPUT' && tag !== 'TEXTAREA') return;
    setTimeout(function () { if (S.trayOpen && !_composing) renderTray(); }, 0);
  });

  D.root.appendChild(frag([D.rail, D.quote, D.wx, D.cmd, D.cfgBtn, D.trayHost, D.vig, D.grid]));

  D.fileIn = h('input', { a: { type: 'file', accept: 'image/*', multiple: true }, s: 'display:none', on: {
    change: function (e) { ingest(e.target.files); e.target.value = ''; }
  } });
  document.body.appendChild(D.fileIn);

  D.cfgFileIn = h('input', { a: { type: 'file', accept: 'application/json,.json' }, s: 'display:none', on: {
    change: function (e) { cfgImportFile(e.target.files && e.target.files[0]); e.target.value = ''; }
  } });
  document.body.appendChild(D.cfgFileIn);

  /* No wheel handling here on purpose: the browser already scrolls the rail
     from a trackpad's horizontal swipe and from shift+wheel. Intercepting
     either only gets in the way. */

  D.imgBox.addEventListener('dragover',  function (e) { e.preventDefault(); D.imgBox.style.borderColor = 'var(--accent)'; });
  D.imgBox.addEventListener('dragleave', function ()  { D.imgBox.style.borderColor = ''; });
  D.imgBox.addEventListener('drop',      function (e) {
    e.preventDefault(); D.imgBox.style.borderColor = '';
    ingest(e.dataTransfer && e.dataTransfer.files);
  });
}

function startPan(e) {
  var im = curImg(); if (!im) return;
  e.preventDefault();
  var x0 = e.clientX, y0 = e.clientY, ix = im.x || 0, iy = im.y || 0;
  var move = function (ev) {
    applyImage(Object.assign({}, im, { x: ix + (ev.clientX - x0), y: iy + (ev.clientY - y0) }));
  };
  var up = function (ev) {
    window.removeEventListener('mousemove', move);
    window.removeEventListener('mouseup', up);
    patchImg({ x: ix + (ev.clientX - x0), y: iy + (ev.clientY - y0) });
  };
  window.addEventListener('mousemove', move);
  window.addEventListener('mouseup', up);
}

/* ------------------------------------------------------------------ *
 * paint — text-only pass, safe to run every tick
 * ------------------------------------------------------------------ */
var _lastGreet = null;

function paint() {
  var d = new Date(S.now);
  var p = function (n) { return String(n).padStart(2, '0'); };
  var hh = d.getHours(), suffix = '';
  if (!S.clock24) { suffix = hh >= 12 ? 'PM' : 'AM'; hh = hh % 12 || 12; }

  D.cDate.textContent = d.getFullYear() + '.' + p(d.getMonth() + 1) + '.' + p(d.getDate());
  D.cWk.textContent   = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][d.getDay()];
  D.cTime.textContent = p(hh) + ':' + p(d.getMinutes()) + (suffix ? ' ' + suffix : '');

  var q = QUOTES[S.quoteIdx % QUOTES.length] || { text: '', author: '' };
  D.quoteT.textContent = q.text || '';
  D.quoteA.textContent = q.author ? '— ' + q.author : '';
  D.quoteA.style.display = q.author ? '' : 'none';

  var conv = function (v) { return S.unit === 'C' ? v : Math.round(v * 9 / 5 + 32); };
  D.wxCity.textContent = ((S.geoMode === 'manual' ? S.city : (WX_LABEL || S.city)) || '—') + ' · 天気';
  D.wxTemp.textContent = conv(WX.c) + '°';
  D.wxCond.textContent = WX.cond + ' ' + WX.kana;
  D.wxHilo.textContent = 'H ' + conv(WX.hi) + '° / L ' + conv(WX.lo) + '°';

  var g = effGreeting();
  D.greetT.textContent = g;
  if (g !== _lastGreet) { _lastGreet = g; applySizing(); }

  D.cmdLine.textContent = S.line;
  D.cmdEng.textContent = typing() ? parseQuery(queryText()).eng.name : '';
  /* keep the cursor in view once the line runs past the slot */
  D.cmdSlot.scrollLeft = D.cmdSlot.scrollWidth;

  D.imgMeta.textContent = _storeWarn || (S.imgs.length
    ? p(S.imgIdx + 1) + '/' + p(S.imgs.length) + ' · ' +
      ((SCHED.filter(function (o) { return o.id === S.imgSched; })[0] || {}).label || '')
    : 'NO IMAGE');
}

/* ------------------------------------------------------------------ *
 * category strip
 * ------------------------------------------------------------------ */
var _shownOpen;
function revealOpen() {
  if (S.openId === _shownOpen) return;
  _shownOpen = S.openId;
  if (!S.openId || !D.rail || !D.panels) return;
  var n = D.panels.querySelector('[data-cid="' + S.openId + '"]');
  if (!n) return;
  var r = n.getBoundingClientRect(), rail = D.rail.getBoundingClientRect();
  var pad = 68, at = D.rail.scrollLeft, target = at;   /* clears the edge fade */
  if (r.right > rail.right - pad) target = at + (r.right - (rail.right - pad));
  else if (r.left < rail.left + pad) target = at - ((rail.left + pad) - r.left);
  if (target === at) return;
  D.rail.scrollLeft = target;   /* plain write: smooth scrollTo is unreliable here */
  railFades();
}

function renderPanels() {
  /* while a drag is live, move the existing nodes instead of rebuilding —
     destroying the dragged element would abort the drag operation */
  if (_dragC != null && D.panels.children.length === S.cats.length) { reflowPanels(); return; }
  clear(D.panels);
  D.panels.appendChild(frag(S.cats.map(buildCat)));
  playFlip(D.panels);
  if (D.root) applyRailPad(D.root);
  revealOpen();
  railFades();
}

function reflowPanels() {
  var byId = {};
  Array.prototype.forEach.call(D.panels.children, function (n) { byId[n.getAttribute('data-cid')] = n; });
  S.cats.forEach(function (c) {
    var n = byId[c.id];
    if (!n) return;
    n.style.opacity = S.dragCid === c.id ? '.34' : '1';
    D.panels.appendChild(n);
  });
  playFlip(D.panels);
}

/* The rail hides its scrollbar, so overflow needs its own signal: a gradient
   at whichever edge still has content behind it. */
function railFades() {
  if (!D.rail || !D.root) return;
  var max = D.rail.scrollWidth - D.rail.clientWidth;
  var at = D.rail.scrollLeft;
  D.root.style.setProperty('--fadeL', at > 4 ? '64px' : '0px');
  D.root.style.setProperty('--fadeR', at < max - 4 ? '64px' : '0px');
}

function catIndex(node) { return Array.prototype.indexOf.call(D.panels.children, node); }

function buildCat(c) {
  var m = mark(c.name, c.key);
  var isOpen = S.openId === c.id;

  var tabT = isOpen
    ? h('div', { c: 'vt tab-t', t: m.pre + '/' + m.k + '/' + m.post })
    : h('div', { c: 'vt tab-t' }, [
        m.pre, h('span', { c: 'sl', t: '/' }), h('span', { c: 'hk', t: m.k }),
        h('span', { c: 'sl', t: '/' }), m.post
      ]);

  var tab = h('div', { c: 'box tab' + (isOpen ? ' on' : ''), btn: 1, al: c.name, on: { click: function () {
    setState({ openId: S.openId === c.id ? null : c.id, line: '' });
  } } }, tabT);

  var kids = [tab];
  if (isOpen) {
    kids.push(h('div', { c: 'pane' }, c.links.map(function (l) {
      var lm = mark(l.label, l.key);
      var icon = faviconFor(l.url);
      return h('a', { c: 'lnk', a: { href: safeUrl(l.url), rel: 'noreferrer' } }, [
        icon ? h('img', { a: { src: icon, alt: '' } }) : null,
        h('span', {}, [
          lm.pre, h('span', { c: 'sl', t: '/' }), h('span', { c: 'hk', t: lm.k }),
          h('span', { c: 'sl', t: '/' }), lm.post
        ])
      ]);
    })));
  }

  var node = h('div', {
    c: 'cat',
    s: 'opacity:' + (S.dragCid === c.id ? '.34' : '1'),
    a: { 'data-cid': c.id, draggable: 'true' },
    on: {
      dragstart: function (e) {
        _dragC = catIndex(node);
        _dragNode = node;
        dragBegin(e.clientX);
        e.dataTransfer.effectAllowed = 'move';
        try { e.dataTransfer.setData('text/plain', c.id); } catch (err) {}
        setState({ dragCid: c.id });
      },
      dragenter: over, dragover: over,
      dragend: end, drop: end
    }
  }, kids);
  return node;

  function over(e) {
    e.preventDefault();
    if (!_dragNode || _dragC == null || !dragSettled(e.clientX)) return;
    var from = catIndex(_dragNode);
    var to = dragTarget(D.panels, e.clientX, true, _dragNode);
    if (from < 0 || to === from) return;
    dragTook(e.clientX);
    snapFlip(D.panels, 'data-cid');
    _dragC = to;
    set({ cats: reorder(S.cats, from, to) });
  }
  function end(e) {
    e.preventDefault();
    _dragC = null; _dragNode = null; _dragLastPos = null;
    setState({ dragCid: null });
  }
}
var _dragC = null, _dragL = null;

/* ------------------------------------------------------------------ *
 * config tray
 * ------------------------------------------------------------------ */
function btn(label, fn, opt) {
  opt = opt || {};
  return h('div', {
    c: 'btn' + (opt.f ? ' f' : '') + (opt.warn ? ' warn' : ''),
    t: label, s: opt.s || null, btn: 1, al: opt.al || null, on: { click: fn }
  });
}
function stp(label, fn, al) {
  return h('div', { c: 'stp', t: label, btn: 1, al: al || null, on: { click: fn } });
}
function field(key, value, fn, opt) {
  opt = opt || {};
  var on = { input: fn };
  if (opt.on) Object.keys(opt.on).forEach(function (k) { on[k] = opt.on[k]; });
  var e = h('input', {
    c: 'in' + (opt.c ? ' ' + opt.c : ''), s: opt.s || null,
    a: { 'data-k': key, maxlength: opt.max || null, placeholder: opt.ph || null },
    on: on
  });
  e.value = value == null ? '' : value;
  return e;
}
function head(t) { return h('div', { c: 'sh', t: t }); }

/* One colour control: three presets for the current mode, then a hex field.
   Typing a valid six-digit hex selects the custom slot (index 3) and sets it
   for whichever mode is on screen, so what you see is what you edit. */
function colorControl(kind) {
  var isAccent = kind === 'accent';
  var presets = isAccent ? ACCENTS : GROUNDS;
  var slot = isAccent ? 'a' : 'b';
  var customKey = isAccent ? 'ac' : 'gc';
  var mode = modeKey();
  var active = isAccent ? accentPair() : groundPair();
  var cur = active[mode];

  function pick(patch) { set({ theme: Object.assign({}, S.theme, patch) }, true); }

  var swatches = presets.map(function (pr, i) {
    var on = S.theme[slot] === i;
    return h('div', {
      c: 'sw' + (on ? ' on' : ''), s: 'background:' + pr[mode],
      btn: 1, al: (isAccent ? 'Accent ' : 'Ground ') + pr[mode],
      on: { click: function () { var o = {}; o[slot] = i; pick(o); } }
    });
  });

  var input = h('input', {
    c: 'hex' + (S.theme[slot] === 3 ? ' on' : ''),
    a: { 'data-k': 'hex-' + kind, maxlength: '6', spellcheck: 'false',
         'aria-label': (isAccent ? 'Accent' : 'Ground') + ' hex value' },
    on: { input: function (e) {
      var raw = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6).toLowerCase();
      e.target.value = raw;
      e.target.classList.toggle('bad', raw.length === 6 ? false : raw.length > 0);
      if (raw.length !== 6) return;
      var next = Object.assign({}, active);
      next[mode] = '#' + raw;
      var o = {}; o[customKey] = next; o[slot] = 3;
      pick(o);
    } }
  });
  input.value = String(cur || '').replace('#', '');

  return [
    h('div', { c: 'row sw-row' }, [
      h('span', { c: 'lab', t: isAccent ? 'ACCENT' : 'GROUND' }),
      h('div', { s: 'display:flex;gap:7px' }, swatches)
    ]),
    h('div', { c: 'hexrow' }, [
      h('span', { c: 'hash', t: '#' }),
      input,
      h('div', { c: 'prev', s: 'background:' + cur })
    ])
  ];
}
function sec(cls, kids) { return h('div', { c: 'sec' + (cls ? ' ' + cls : '') }, kids); }
function note(t) { return h('div', { c: 'note', t: t }); }

function snapFocus() {
  var a = document.activeElement;
  if (!a || !D.tray || !D.tray.contains(a)) return null;
  var k = a.getAttribute('data-k');
  if (!k) return null;
  var o = { k: k };
  try { o.s = a.selectionStart; o.e = a.selectionEnd; } catch (err) {}
  return o;
}
function restoreFocus(f) {
  if (!f || !D.tray) return;
  var el = D.tray.querySelector('[data-k="' + f.k + '"]');
  if (!el) return;
  el.focus();
  if (f.s != null) { try { el.setSelectionRange(f.s, f.e); } catch (err) {} }
}

function linkKey(l) { return (l.label || '') + '|' + (l.key || '') + '|' + (l.url || ''); }
function linkIndex(node) {
  return D.linksBox ? Array.prototype.indexOf.call(D.linksBox.children, node) : -1;
}

function reflowLinks() {
  var byId = {};
  Array.prototype.forEach.call(D.linksBox.children, function (n) { byId[n.getAttribute('data-lid')] = n; });
  (editCat().links || []).forEach(function (l) {
    var key = linkKey(l), n = byId[key];
    if (!n) return;
    n.style.opacity = S.dragLid === key ? '.34' : '1';
    D.linksBox.appendChild(n);
  });
  playFlip(D.linksBox);
}

/* The stored URL is left exactly as typed while a row is open, so the field
   does not fight the cursor. safeUrl() lands when the row closes. */
function normalizedLinks(i) {
  var links = editCat().links || [];
  if (i == null || !links[i]) return null;
  var l = links[i];
  var fix = { url: safeUrl(l.url) };
  if (!l.key && l.label) fix.key = l.label.charAt(0).toLowerCase();
  if (fix.url === l.url && fix.key === undefined) return null;
  return links.map(function (x, j) { return j === i ? Object.assign({}, x, fix) : x; });
}
function setLinkEdit(next) {
  var fixed = normalizedLinks(S.editLinkIdx);
  S.editLinkIdx = next;
  if (fixed) updateCat({ links: fixed }); else set({});
}
function openLinkEdit(i) { setLinkEdit(S.editLinkIdx === i ? null : i); }
function closeLinkEdit() { setLinkEdit(null); }

function patchLink(i, o) {
  editCatField({ links: (editCat().links || []).map(function (x, j) {
    return j === i ? Object.assign({}, x, o) : x;
  }) });
}
/* The key field carries the live duplicate warning, so it takes the full render
   path — a single-character field, so the rebuild is imperceptible. Label and
   URL edits (multi-character, IME-capable, no derived readout) keep the
   no-rebuild fieldEdit path through patchLink. */
function patchLinkKey(i, key) {
  updateCat({ links: (editCat().links || []).map(function (x, j) {
    return j === i ? Object.assign({}, x, { key: key }) : x;
  }) });
}

/* Drag is off while a row is open: the edited row is not draggable, so the
   pointer belongs to the fields. */
function buildLinkEdit(l, i, dupe) {
  var commit = { keydown: function (e) { if (e.key === 'Enter') { e.preventDefault(); closeLinkEdit(); } } };
  var keyIn = field('el-k', l.key, function (e) {
    patchLinkKey(i, e.target.value.slice(0, 1).toLowerCase());
  }, { c: 'tiny' + (dupe[String(l.key || '').toLowerCase()] ? ' bad' : ''), max: '1',
       s: 'width:34px;flex:none;color:var(--accent);text-align:center;padding:8px 4px', on: commit });
  var labIn = field('el-l', l.label, function (e) {
    patchLink(i, { label: e.target.value });
  }, { c: 'tiny', ph: 'label', on: commit });
  var urlIn = field('el-u', l.url === '#' ? '' : l.url, function (e) {
    patchLink(i, { url: liveUrl(e.target.value) });
  }, { c: 'tiny', ph: 'url', on: commit });

  return h('div', { c: 'lrow edit', a: { 'data-lid': linkKey(l) } }, [
    h('div', { c: 'erow' }, [
      keyIn, labIn,
      h('div', { c: 'stp', t: '✓', btn: 1, al: 'Done editing', on: { click: closeLinkEdit } })
    ]),
    h('div', { c: 'erow' }, [urlIn])
  ]);
}

function buildLinkRow(l, i, dupe) {
  if (S.editLinkIdx === i) return buildLinkEdit(l, i, dupe);

  var lid = linkKey(l);
  var node = h('div', {
    c: 'lrow', s: 'opacity:' + (S.dragLid === lid ? '.34' : '1'),
    a: { 'data-lid': lid, draggable: 'true' },
    on: {
      dragstart: function (e) {
        _dragL = linkIndex(node);
        _dragNode = node;
        dragBegin(e.clientY);
        e.dataTransfer.effectAllowed = 'move';
        try { e.dataTransfer.setData('text/plain', lid); } catch (err) {}
        setState({ dragLid: lid });
      },
      dragenter: over, dragover: over,
      dragend: end, drop: end
    }
  }, [
    h('span', { c: 'grip', t: '⣿' }),
    /* one focusable target for the whole middle: a drag suppresses the click,
       so grabbing the row to reorder never opens the editor */
    h('div', { c: 'lmid', btn: 1, al: 'Edit ' + (l.label || 'link'), on: { click: function () {
      openLinkEdit(linkIndex(node));
    } } }, [
      h('span', { c: 'k' + (dupe[String(l.key || '').toLowerCase()] ? ' dup' : ''), t: l.key }),
      h('span', { c: 'nm', t: l.label }),
      h('span', { c: 'hs', t: String(l.url).replace(/^https?:\/\//, '').split('/')[0] })
    ]),
    h('span', { c: 'rm', t: '×', btn: 1, al: 'Remove ' + (l.label || 'link'), on: { click: function (e) {
      e.stopPropagation();
      var i = linkIndex(node), cur = editCat().links || [];
      S.editLinkIdx = null;
      updateCat({ links: cur.filter(function (_, j) { return j !== i; }) });
    } } })
  ]);
  return node;

  function over(e) {
    e.preventDefault();
    if (!_dragNode || _dragL == null || !dragSettled(e.clientY)) return;
    var from = linkIndex(_dragNode);
    var to = dragTarget(D.linksBox, e.clientY, false, _dragNode);
    if (from < 0 || to === from) return;
    dragTook(e.clientY);
    snapFlip(D.linksBox, 'data-lid');
    _dragL = to;
    var ei = S.editLinkIdx;
    if (ei != null) {
      if (from < ei && to >= ei) S.editLinkIdx = ei - 1;
      else if (from > ei && to <= ei) S.editLinkIdx = ei + 1;
    }
    updateCat({ links: reorder(editCat().links || [], from, to) });
  }
  function end(e) {
    e.preventDefault();
    _dragL = null; _dragNode = null; _dragLastPos = null;
    setState({ dragLid: null });
  }
}

/* True between compositionstart and compositionend on a tray field. An IME
   builds a word across several keystrokes bound to one <input> node; tearing
   that node down mid-compose drops the pre-edit, so the rebuild waits. */
var _composing = false;

function renderTray() {
  if (S.trayOpen && _dragL != null && D.tray && D.linksBox) { reflowLinks(); return; }
  /* Hold the rebuild while an IME composition is live in the tray. paint() and
     renderPanels() still run each keystroke, so the greeting preview stays
     current; compositionend fires one rebuild to reconcile. */
  if (_composing && S.trayOpen && D.tray) return;
  var focus = snapFocus();
  var scrolled = D.tray ? D.tray.scrollTop : 0;
  clear(D.trayHost);
  D.tray = null;
  D.linksBox = null;
  if (!S.trayOpen) { _composing = false; return; }

  var ec = editCat();
  var sizing = computeSizing();

  /* 01 COLOR */
  var s01 = sec('wide', [head('01 COLOR · 色')]
    .concat(colorControl('accent'))
    .concat(colorControl('ground')));

  /* 02 DISPLAY */
  var s02 = sec(null, [
    head('02 DISPLAY · 表示'),
    h('div', { c: 'row' }, [
      btn(S.themeMode === 'auto' ? 'SYSTEM' : (S.themeMode === 'light' ? 'LIGHT' : 'DARK'), function () {
        set({ themeMode: S.themeMode === 'auto' ? 'dark' : (S.themeMode === 'dark' ? 'light' : 'auto') }, true);
      }, { f: 1 }),
      btn(S.theme.grid ? 'GRID ON' : 'GRID OFF', function () {
        set({ theme: Object.assign({}, S.theme, { grid: !S.theme.grid }) }, true);
      }, { f: 1 }),
      btn(S.clock24 ? '24H' : '12H', function () { set({ clock24: !S.clock24 }); }, { f: 1 })
    ]),
    h('div', { c: 'row' }, [
      btn(S.fitMode === 'fit' ? 'TEXT FITS BOX' : 'BOX GROWS TO TEXT', function () {
        set({ fitMode: S.fitMode === 'fit' ? 'grow' : 'fit' });
      }, { f: 1 }),
      btn(S.align === 'top' ? 'PANELS TOP' : 'PANELS MID', function () {
        set({ align: S.align === 'top' ? 'center' : 'top' });
      }, { s: 'width:112px;flex:none' })
    ]),
    h('div', { c: 'row mid' }, [
      h('span', { c: 'lab', t: 'TEXT' }),
      stp('−', function () { set({ textScale: Math.max(0.6, Math.round((S.textScale - 0.1) * 10) / 10) }); }, 'Smaller text'),
      h('span', { c: 'val', t: Math.round(S.textScale * 100) + '%' }),
      stp('＋', function () { set({ textScale: Math.min(1.6, Math.round((S.textScale + 0.1) * 10) / 10) }); }, 'Larger text')
    ]),
    h('div', { c: 'row mid' }, [
      h('span', { c: 'lab', t: 'HEIGHT' }),
      stp('−', function () { set({ boxH: Math.max(200, S.boxH - 20) }); }, 'Shorter boxes'),
      h('span', { c: 'val', t: sizing.H + 'PX' + (sizing.capped ? ' · CAPPED' : (S.fitMode === 'fit' ? '' : ' · AUTO')) }),
      stp('＋', function () { set({ boxH: Math.min(760, S.boxH + 20) }); }, 'Taller boxes')
    ]),
    h('div', { c: 'row' }, [
      btn(S.linkIcons ? 'FAVICONS ON' : 'FAVICONS OFF', function () {
        set({ linkIcons: !S.linkIcons });
      }, { f: 1 })
    ])
  ]);

  /* 03 GREETING */
  var greetBody;
  if (S.greetMode === 'time') {
    var kana = { morning: '朝', afternoon: '昼', evening: '夕', night: '夜' };
    greetBody = h('div', { s: 'display:flex;flex-direction:column;gap:7px' },
      ['morning', 'afternoon', 'evening', 'night'].map(function (k) {
        var active = effGreeting() === S.greets[k];
        var col = active ? 'var(--accent)' : 'var(--dim)';
        var hourIn = h('input', {
          c: 'hour', s: 'color:' + col,
          a: { 'data-k': 'hr-' + k, maxlength: '2' },
          on: { input: function (e) {
            var v = Math.max(0, Math.min(23, parseInt(e.target.value, 10) || 0));
            fieldEdit({ bands: Object.assign({}, S.bands, defineOne(k, v)) });
          } }
        });
        hourIn.value = String(S.bands[k]);
        return h('div', { s: 'display:flex;align-items:center;gap:8px' }, [
          hourIn,
          h('span', { c: 'band', s: 'color:' + col, t: kana[k] }),
          field('gr-' + k, S.greets[k], function (e) {
            fieldEdit({ greets: Object.assign({}, S.greets, defineOne(k, e.target.value)) });
          })
        ]);
      })
    );
  } else {
    greetBody = field('greeting', S.greeting, function (e) { fieldEdit({ greeting: e.target.value }); },
      { s: 'flex:none;width:100%;box-sizing:border-box' });
  }
  var s03 = sec(null, [
    head('03 GREETING · 挨拶'),
    btn(S.greetMode === 'time' ? 'BY TIME OF DAY' : 'ONE GREETING', function () {
      set({ greetMode: S.greetMode === 'time' ? 'static' : 'time' });
    }),
    greetBody
  ]);

  /* 04 WEATHER */
  var unitBtn = btn('°' + S.unit, function () { set({ unit: S.unit === 'C' ? 'F' : 'C' }); },
    { s: 'width:64px;flex:none;letter-spacing:1px' });
  var s04 = sec(null, [
    head('04 WEATHER · 天気'),
    h('div', { c: 'row' }, GEOMODES.map(function (o) {
      return h('div', { c: 'opt' + (S.geoMode === o.id ? ' on' : ''), t: o.label, btn: 1, on: { click: function () {
        if (o.id === 'manual') { WX_LABEL = ''; set({ geoMode: 'manual' }); fetchWeather(true); return; }
        askGeo(o.id === 'precise', function (ok) {
          if (!ok) return;
          WX_LABEL = '';
          set({ geoMode: o.id });
          if (o.id !== 'precise') { fetchWeather(true); return; }
          geoGranted(function (has) {
            if (has === false) { geoFail('NO PERMISSION'); return; }
            /* A grant this document did not load with cannot reach
               navigator.geolocation, whether it arrived from the request above
               or from the browser's own settings. Reloading is what makes
               PRECISE work on the click instead of on the next new tab, and
               every setting is already persisted by the set() above. */
            if (has === true && _geoAtBoot === false) { location.reload(); return; }
            fetchWeather(true);
          });
        });
      } } });
    })),
    S.geoMode === 'manual'
      ? h('div', { c: 'row' }, [
          field('city', S.city, function (e) {
            fieldEdit({ city: e.target.value.toUpperCase() });
            clearTimeout(_wxDebounce);
            _wxDebounce = setTimeout(function () { fetchWeather(); }, 700);
          }),
          unitBtn
        ])
      : h('div', { c: 'row' }, [
          h('div', { c: 'in', s: 'color:var(--dim)', t: WX_LABEL || 'LOCATING…' }),
          unitBtn
        ])
  ]);

  /* 05 QUOTE */
  D.pull = btn(_pullMsg, pullQuotes, { s: 'width:64px;flex:none;letter-spacing:1px' });
  var qCustom = h('textarea', { c: 'ta', s: 'height:74px', a: { 'data-k': 'qcustom', spellcheck: 'false',
    placeholder: 'Author, the quote text' }, on: {
    input: function (e) { S.quoteCustom = e.target.value; applyQuotes(); paint(); persist(); }
  } });
  qCustom.value = S.quoteCustom;

  var s05 = sec(null, [
    head('05 QUOTE · 引用'),
    h('div', { c: 'row' }, QSOURCES.map(function (o) {
      return h('div', { c: 'opt' + (S.quoteSource === o.id ? ' on' : ''), t: o.label, btn: 1, on: { click: function () {
        _qBucket = undefined;
        S.quoteSource = o.id; S.quoteIdx = 0;
        applyQuotes();
        set({ quoteSource: o.id, quoteIdx: 0 });
      } } });
    })),
    S.quoteSource === 'custom' ? qCustom : null,
    S.quoteSource === 'url' ? h('div', { c: 'row' }, [
      field('gist', S.gistUrl, function (e) { fieldEdit({ gistUrl: e.target.value }); },
        { c: 'tiny', ph: 'raw gist URL', s: 'font-size:11px;padding:9px 10px' }),
      D.pull
    ]) : null,
    h('div', { c: 'row mid' }, [
      h('span', { c: 'lab', t: 'ROTATE' }),
      h('div', { s: 'flex:1;display:flex;gap:5px' }, SCHED.map(function (o) {
        return h('div', { c: 'opt' + (S.quoteSched === o.id ? ' on' : ''), t: o.label, btn: 1, on: { click: function () {
          _qBucket = undefined;
          set({ quoteSched: o.id });
        } } });
      }))
    ])
  ]);

  /* 06 PANELS */
  var catSel = h('select', { c: 'sel', a: { 'data-k': 'catsel' }, on: {
    change: function (e) {
      var fixed = normalizedLinks(S.editLinkIdx);
      S.editLinkIdx = null;
      if (fixed) updateCat({ links: fixed });
      setState({ editCatId: e.target.value });
    }
  } }, S.cats.map(function (c) {
    return h('option', { t: c.name, a: { value: c.id } });
  }));
  catSel.value = S.editCatId;

  var linkDupe = dupeKeys(ec.links);
  D.linksBox = h('div', { s: 'display:flex;flex-direction:column;gap:3px;margin-top:2px' },
    (ec.links || []).map(function (l, i) { return buildLinkRow(l, i, linkDupe); }));

  var s06 = sec(null, [
    head('06 PANELS · パネル'),
    h('div', { c: 'row' }, [
      catSel,
      btn('＋', function () {
        var id = 'cat' + Date.now();
        S.editLinkIdx = null;
        set({ cats: S.cats.concat([{ id: id, name: 'new panel', key: 'n', links: [] }]), editCatId: id });
      }, { al: 'Add panel', s: 'width:44px;flex:none;font-size:11px;letter-spacing:0' }),
      btn('×', function () {
        if (S.cats.length <= 1) return;
        var rest = S.cats.filter(function (c) { return c.id !== S.editCatId; });
        S.editLinkIdx = null;
        set({ cats: rest, editCatId: rest[0].id, openId: null });
      }, { warn: 1, al: 'Delete panel', s: 'width:44px;flex:none;font-size:11px;letter-spacing:0' })
    ]),
    h('div', { c: 'row' }, [
      field('catname', ec.name, function (e) { editCatField({ name: e.target.value }); }),
      field('catkey', ec.key, function (e) { updateCat({ key: e.target.value.slice(0, 1).toLowerCase() }); },
        { c: 'key' + (dupeKeys(S.cats)[String(ec.key || '').toLowerCase()] ? ' bad' : ''), max: '1' })
    ]),
    D.linksBox,
    h('div', { s: 'display:flex;gap:6px;margin-top:4px' }, [
      field('nl', S.nl, function (e) { S.nl = e.target.value; }, { c: 'tiny', ph: 'label' }),
      field('nk', S.nk, function (e) { S.nk = e.target.value.slice(0, 1).toLowerCase(); e.target.value = S.nk; },
        { c: 'tiny', max: '1', s: 'width:34px;flex:none;color:var(--accent);text-align:center;padding:8px 4px' }),
      field('nu', S.nu, function (e) { S.nu = e.target.value; }, { c: 'tiny', ph: 'url' }),
      btn('ADD', function () {
        if (!S.nl.trim()) return;
        var label = S.nl.trim();
        var key = (S.nk || label[0]).toLowerCase();
        var url = safeUrl(S.nu);
        S.nl = ''; S.nk = ''; S.nu = '';
        updateCat({ links: (ec.links || []).concat([{ label: label, key: key, url: url }]) });
      }, { s: 'width:44px;flex:none;padding:8px;font-size:10px;letter-spacing:0' })
    ])
  ]);

  /* 07 IMAGE */
  var im = curImg();
  var s07 = sec(null, [
    head('07 IMAGE · 画像'),
    h('div', { c: 'row' }, [
      btn('ADD IMAGE', function () { D.fileIn.click(); }, { f: 1 }),
      btn('‹', function () {
        if (!S.imgs.length) return;
        setState({ imgIdx: (S.imgIdx - 1 + S.imgs.length) % S.imgs.length }, function () { applyImage(); persist(); });
      }, { al: 'Previous image', s: 'width:38px;flex:none;font-size:11px;letter-spacing:0' }),
      btn('›', function () {
        if (!S.imgs.length) return;
        setState({ imgIdx: (S.imgIdx + 1) % S.imgs.length }, function () { applyImage(); persist(); });
      }, { al: 'Next image', s: 'width:38px;flex:none;font-size:11px;letter-spacing:0' }),
      btn('×', function () {
        if (!S.imgs.length) return;
        var gone = S.imgs[S.imgIdx];
        idbDel(gone.id); dropUrl(gone.id);
        setImgs(S.imgs.filter(function (_, i) { return i !== S.imgIdx; }), Math.max(0, S.imgIdx - 1));
      }, { warn: 1, al: 'Delete image', s: 'width:38px;flex:none;font-size:11px;letter-spacing:0' })
    ]),
    h('div', { c: 'thumbs' }, S.imgs.map(function (t, i) {
      return h('div', { c: 'th' + (i === S.imgIdx ? ' on' : ''), btn: 1, al: 'Image ' + (i + 1), on: { click: function () {
        setState({ imgIdx: i }, function () { applyImage(); persist(); });
      } } }, imgSrc(t) ? h('img', { a: { src: imgSrc(t), alt: '' } }) : null);
    })),
    h('div', { c: 'row mid' }, [
      h('span', { c: 'lab', t: 'CROP' }),
      stp('−', function () { patchImg({ s: Math.max(1, Math.round(((curImg() || {}).s || 1) * 10 - 1) / 10) }); }, 'Zoom out'),
      h('span', { c: 'val', t: im ? Math.round((im.s || 1) * 100) + '%' : '—' }),
      stp('＋', function () { patchImg({ s: Math.min(4, Math.round(((curImg() || {}).s || 1) * 10 + 1) / 10) }); }, 'Zoom in'),
      btn('FIT', function () { patchImg({ s: 1, x: 0, y: 0 }); },
        { s: 'width:52px;flex:none;padding:7px;font-size:9px;letter-spacing:1px' })
    ]),
    h('div', { c: 'row mid' }, [
      h('span', { c: 'lab', t: 'ROTATE' }),
      h('div', { s: 'flex:1;display:flex;gap:5px' }, SCHED.map(function (o) {
        return h('div', { c: 'opt' + (S.imgSched === o.id ? ' on' : ''), t: o.label, btn: 1, on: { click: function () {
          _bucket = undefined;
          set({ imgSched: o.id });
        } } });
      }))
    ])
  ]);

  /* 08 SEARCH */
  var engSel = h('select', { c: 'sel', a: { 'data-k': 'engsel' }, on: {
    change: function (e) { set({ engine: e.target.value }); }
  } }, engineList().map(function (e) { return h('option', { t: e.name, a: { value: e.id } }); }));
  engSel.value = engineList().some(function (e) { return e.id === S.engine; })
    ? S.engine : engineList()[0].id;
  var s08 = sec(null, [
    head('08 SEARCH · 検索'),
    h('div', { c: 'row' }, [
      engSel,
      btn(S.searchEnabled ? 'SEARCH ON' : 'SEARCH OFF', function () { set({ searchEnabled: !S.searchEnabled }); },
        { s: 'width:96px;flex:none' })
    ]),
    field('engcustom', S.engineCustom, function (e) { fieldEdit({ engineCustom: e.target.value }); },
      { c: 'tiny', ph: 'https://example.com/search?q=%s' })
  ]);

  /* 09 TAB */
  var s09 = sec(null, [
    head('09 TAB · タブ'),
    h('div', { c: 'row' }, [
      field('tabtitle', S.tabTitle, function (e) { fieldEdit({ tabTitle: e.target.value }, { theme: true }); }),
    ])
  ]);

  /* 10 CONFIG */
  var s10 = sec(null, [
    head('10 CONFIG · 設定'),
    h('div', { c: 'row' }, [
      btn('EXPORT', cfgExport, { f: 1 }),
      btn('IMPORT', function () { if (D.cfgFileIn) D.cfgFileIn.click(); }, { f: 1 })
    ]),
    S.cfgMsg ? note(S.cfgMsg) : null
  ]);

  /* 11 SYNC */
  var tokenField = h('input', {
    c: 'in tiny', a: { 'data-k': 'gtoken', type: 'password', spellcheck: 'false',
                       placeholder: 'github token, gist scope' },
    on: { input: function (e) { S.gistToken = e.target.value; persist(); } }
  });
  tokenField.value = S.gistToken || '';

  var SYNCTABS = [{ id: 'profile', label: 'PROFILE' }, { id: 'gist', label: 'GIST' }];
  var syncBody;
  if (S.syncTab === 'gist') {
    syncBody = [
      h('div', { c: 'row' }, [tokenField]),
      h('div', { c: 'row' }, [
        field('gid', S.gistId, function (e) { fieldEdit({ gistId: e.target.value.trim() }); },
          { c: 'tiny', ph: 'gist id (filled on first push)' })
      ]),
      h('div', { c: 'row' }, [
        btn('PUSH', syncPush, { f: 1 }),
        btn('PULL', syncPull, { f: 1 })
      ]),
      note(_syncMsg || syncStamp())
    ];
  } else {
    var live = psAvailable();
    syncBody = [
      h('div', { c: 'row' }, [
        btn(S.profileSync ? 'PROFILE SYNC ON' : 'PROFILE SYNC OFF', function () {
          if (!live) { psFlash('EXTENSION ONLY'); return; }
          var on = !S.profileSync;
          set({ profileSync: on });
          if (on) psReconcile();
        }, { f: 1 })
      ]),
      h('div', { c: 'row' }, [
        btn('PUSH', function () { psPush(true); }, { f: 1 }),
        btn('PULL', function () { psPull(true); }, { f: 1 })
      ]),
      note(_psMsg || psStamp())
    ];
  }

  var s11 = sec(null, [
    head('11 SYNC · 同期'),
    h('div', { c: 'row' }, SYNCTABS.map(function (o) {
      return h('div', { c: 'opt' + (S.syncTab === o.id ? ' on' : ''), t: o.label, btn: 1, on: { click: function () {
        set({ syncTab: o.id });
      } } });
    }))
  ].concat(syncBody));

  var foot = h('div', { c: 'foot' }, [
    h('span', { t: 'ESC TO CLOSE' }),
    h('span', { c: 'reset', t: 'RESET DEFAULTS', btn: 1, on: { click: function () {
      if (!window.confirm('Reset every panel, link and setting to defaults?')) return;
      try { localStorage.removeItem(LS_KEY); localStorage.removeItem(IMG_KEY); } catch (e) {}
      /* Wait for the blob store to clear, but never let a hung open leave
         the confirmed reset unfinished. */
      var done = false;
      function go() { if (!done) { done = true; location.reload(); } }
      idbClear(go);
      setTimeout(go, 800);
    } } })
  ]);

  D.tray = h('div', { c: 'tray' }, [s01, s02, s03, s04, s05, s06, s07, s08, s09, s10, s11, foot]);
  D.trayHost.appendChild(D.tray);
  D.tray.scrollTop = scrolled;   /* a rebuild must not throw the reader back to the top */
  restoreFocus(focus);
  playFlip(D.linksBox);
}

var _wxDebounce;
function defineOne(k, v) { var o = {}; o[k] = v; return o; }

/* ------------------------------------------------------------------ *
 * render + boot
 * ------------------------------------------------------------------ */
function render() { paint(); renderPanels(); renderTray(); }

function boot() {
  buildShell();

  var saved = null;
  try { saved = JSON.parse(localStorage.getItem(LS_KEY) || 'null'); } catch (e) {}
  if (saved) {
    if (!saved.themeMode) {
      saved.themeMode = saved.autoTheme ? 'auto' : ((saved.theme && saved.theme.invert) ? 'light' : 'auto');
    }
    delete saved.autoTheme;
    if (saved.theme && saved.theme.grid === undefined) {
      saved.theme.grid = saved.theme.crt !== false;
      delete saved.theme.crt;
    }
    if (saved.theme) {
      if (saved.theme.ac === undefined && saved.theme.a > 2) saved.theme.a = 0;
      if (saved.theme.gc === undefined && saved.theme.b > 2) saved.theme.b = 0;
      if (!saved.theme.ac) saved.theme.ac = { d: '#d4cdb8', l: '#33302a' };
      if (!saved.theme.gc) saved.theme.gc = { d: '#12100d', l: '#c9c6b5' };
      delete saved.theme.invert;
    }
    Object.assign(S, saved);
    S.theme = sanitizeTheme(S.theme);
    if (!S.cats.some(function (c) { return c.id === S.editCatId; })) S.editCatId = S.cats[0].id;
  }
  applyQuotes();
  if (S.quoteSched === 'open' && QUOTES.length > 1) S.quoteIdx = (S.quoteIdx + 1) % QUOTES.length;
  _qBucket = bucketOf(S.quoteSched, Date.now());

  render();
  applyTheme();
  loadImages();
  geoGranted(function (g) { _geoAtBoot = g; });
  fetchWeather();

  window.addEventListener('keydown', handleKey);
  window.addEventListener('paste', handlePaste);

  psWatch();
  psReconcile();

  try {
    window.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', function () { if (S.themeMode === 'auto') applyTheme(); });
  } catch (e) {}

  var resizeRaf = null;
  window.addEventListener('resize', function () {
    if (resizeRaf) return;
    resizeRaf = requestAnimationFrame(function () {
      resizeRaf = null;
      applySizing();                    /* box height is computed in JS, not CSS */
      if (S.trayOpen) renderTray();     /* so the HEIGHT readout stays honest */
    });
  });

  setInterval(function () {
    S.now = Date.now();
    paint();
    tickRotation();
    tickQuoteRotation();
  }, 1000);

  setInterval(function () { fetchWeather(true); }, 1800000);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

})();
