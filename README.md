# ReleaseWatcher


A minimal Node.js CLI that checks manga sites (TCB Scans, MangaFire) for new chapters and auto-opens them in your browser.

![Node.js](https://img.shields.io/badge/Node.js-18+-green) ![Status](https://img.shields.io/badge/Status-Running-brightgreen) ![Type](https://img.shields.io/badge/Type-CLI%20Tool-purple)

---

## How It Works

Stores the current chapter URL and site for each manga. On check, it replaces the chapter number in the URL with `+1` and uses a site-specific method to verify the chapter is actually available.

**TCB:** URL-based check — looks for `chapter-N` anywhere in the final URL (TCB uses `-chapter-N` with a dash, not a slash).

**MangaFire:** Body-based check — MangaFire returns HTTP 200 for every URL regardless of whether the chapter exists, then JS-redirects to chapter 1 for missing ones. The check reads the page `<title>` to confirm which chapter actually loaded.

---

## Getting Started

**Requirements:** Node.js 18+ — [nodejs.org](https://nodejs.org)

```bash
node release.js
```

---

## Menu

```
[a] Add    – enter name, site (TCB / MangaFire), chapter URL, chapter number
[d] Delete – remove a manga by index
[n] Update – set a new chapter number (and updates the URL) by index
[c] Check  – fetch next chapter for all manga, report what's out
[q] Quit
```

When a new chapter is found, the saved URL and chapter number update automatically and the chapter opens in your browser. The list shows `[TCB]` or `[MF]` prefix per entry.

---

## Data

Saved to `mangas.json` in the same folder:

```json
[
  {
    "name": "One Piece",
    "site": "tcb",
    "url": "https://tcbonepiecechapters.com/chapters/7988/one-piece-chapter-1185",
    "chapter": 1185
  },
  {
    "name": "AniMan",
    "site": "mangafire",
    "url": "https://mangafire.to/read/doubutsu-ningen.pmykj/en/chapter-19",
    "chapter": 19
  }
]
```

---

## Author

Kevin Schaberl — SAOS

---

## Changelog

### 2026-06-18
- Per-site check methods: TCB uses URL match, MangaFire reads page title to detect false positives
- Site selection (TCB / MangaFire) on manga creation; `[TCB]` / `[MF]` prefix in list display
- Fixed TCB check: regex now matches `-chapter-N` (dash) not just `/chapter-N` (slash)
- Fixed MangaFire false positives: body title check catches JS-redirect to chapter 1

### 2026-06-17
- Repo cleanup: flattened structure, removed `.idea` and `how-to-use.txt`

### 2026-06-09 (2)
- `package.json` mit `node-fetch` Dependency hinzugefügt
- `mangas.json` mit initialen Einträgen (OnePiece, AniMan, Freaky) hinzugefügt
- `.gitignore` erstellt (node_modules ausgeschlossen)

### 2026-06-09
- Komplett vereinfacht: alles raus außer Add, Delete und Check all
- Nur noch HTTP-Status-Check (next chapter URL = 200? → raus)
- Flat menu statt verschachteltem Menüsystem
- Von ~970 auf ~65 Zeilen reduziert
