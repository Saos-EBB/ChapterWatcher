// Run: node release.js  (requires Node.js 18+)
const fs   = require('fs');
const path = require('path');
const rl   = require('readline');
const { exec } = require('child_process');

const DATA = path.join(__dirname, 'mangas.json');

function openUrl(url) {
    exec(`xdg-open "${url}"`);
}

const R = '\x1b[0m', B = '\x1b[1m', G = '\x1b[32m', RE = '\x1b[31m', C = '\x1b[36m', Y = '\x1b[33m';

function load() { try { return JSON.parse(fs.readFileSync(DATA, 'utf8')); } catch { return []; } }
function save(list) { fs.writeFileSync(DATA, JSON.stringify(list, null, 2)); }

function siteLabel(site) {
    if (site === 'tcb')       return B + Y + '[TCB]' + R;
    if (site === 'mangafire') return B + G + '[MF] ' + R;
    return '[?]  ';
}

// ponytail: from→to makes this reusable for check (+1) and manual update (arbitrary)
function buildNextUrl(url, from, to) {
    const s = String(from);
    const i = url.lastIndexOf(s);
    if (i === -1) return null;
    return url.slice(0, i) + String(to) + url.slice(i + s.length);
}

const UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36' };

// TCB: URL slug uses -chapter-N (dash), so match without requiring leading slash
async function checkTCB(url, nextNum) {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000), headers: UA });
    if (res.status !== 200) return null;
    const m = res.url.match(/chapter-(\d+)/i);
    return (m && parseInt(m[1]) === nextNum) ? res.url : null;
}

// MangaFire returns HTTP 200 for any URL, then JS-redirects missing chapters to chapter-1.
// redirect:'manual' catches HTTP-level redirects (3xx → not out).
// Body title check catches SPA-level redirects (page title reveals actual chapter loaded).
async function checkMangaFire(url, nextNum) {
    const res = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(10000), headers: UA });
    if (res.status >= 300) return null;  // HTTP redirect = chapter not available
    if (res.status !== 200) return null;

    const body = await res.text();

    // <title>Chapter 20 - Manga Name | MangaFire</title>  ← confirms which chapter loaded
    const title = body.match(/<title[^>]*>(.*?)<\/title>/i);
    if (title) {
        const ch = title[1].match(/Chapter\s+(\d+)/i);
        if (ch && parseInt(ch[1]) !== nextNum) return null;  // page loaded a different chapter
    }

    return url;
}

// ponytail: real seam — two adapters exist today, justified
const SITES = { tcb: checkTCB, mangafire: checkMangaFire };

async function checkAll(list) {
    if (!list.length) { console.log(RE + 'No manga saved.' + R); return; }
    console.log(C + 'Checking...\n' + R);
    let updated = false;
    for (const m of list) {
        const checker = SITES[m.site];
        if (!checker) { console.log(RE + `  ✗ ${m.name}: unknown site '${m.site}'` + R); continue; }
        const nextNum = m.chapter + 1;
        const nextUrl = buildNextUrl(m.url, m.chapter, nextNum);
        if (!nextUrl) { console.log(RE + `  ✗ ${m.name}: can't build next URL` + R); continue; }
        try {
            const found = await checker(nextUrl, nextNum);
            if (found) {
                console.log(G + B + `  ✓ ${m.name}: Chapter ${nextNum} is OUT!` + R);
                console.log(C + `    → ${found}` + R);
                m.chapter = nextNum;
                m.url = found;
                updated = true;
                openUrl(found);
            } else {
                console.log(C + `  · ${m.name}: not yet  (checked chapter ${nextNum})` + R);
            }
        } catch (e) {
            console.log(RE + `  ✗ ${m.name}: ${e.message}` + R);
        }
    }
    if (updated) save(list);
}

const iface = rl.createInterface({ input: process.stdin, output: process.stdout });
const ask   = (q) => new Promise(r => iface.question(q, a => r(a.trim())));

async function main() {
    console.log('\n' + B + RE +
        ' ███████╗██╗   ██╗ ██████╗██╗  ██╗\n' +
        ' ██╔════╝██║   ██║██╔════╝██║ ██╔╝\n' +
        ' █████╗  ██║   ██║██║     █████╔╝ \n' +
        ' ██╔══╝  ██║   ██║██║     ██╔═██╗ \n' +
        ' ██║     ╚██████╔╝╚██████╗██║  ██╗\n' +
        ' ╚═╝      ╚═════╝  ╚═════╝╚═╝  ╚═╝\n' +
        '\n' +
        ' ███████╗██████╗  ██████╗ ██╗██╗      ███████╗██████╗ ███████╗\n' +
        ' ██╔════╝██╔══██╗██╔═══██╗██║██║      ██╔════╝██╔══██╗██╔════╝\n' +
        ' ███████╗██████╔╝██║   ██║██║██║      █████╗  ██████╔╝███████╗\n' +
        ' ╚════██║██╔═══╝ ██║   ██║██║██║      ██╔══╝  ██╔══██╗╚════██║\n' +
        ' ███████║██║     ╚██████╔╝██║███████╗ ███████╗██║  ██║███████║\n' +
        ' ╚══════╝╚═╝      ╚═════╝ ╚═╝╚══════╝ ╚══════╝╚═╝  ╚═╝╚══════╝\n' + R);

    while (true) {
        const list = load();
        console.log('\n' + B + C + '─── MANGA WATCHER ───' + R);
        if (list.length) {
            list.forEach((m, i) => {
                console.log(C + `  [${i + 1}] ${siteLabel(m.site)} ${B}${m.name}${R}${C}  –  Chapter ${m.chapter}` + R);
            });
        } else {
            console.log(C + '  (no manga saved)' + R);
        }
        console.log(Y + '\n  [a] Add  [d] Delete  [n] Update chapter  [c] Check all  [q] Quit\n' + R);

        const cmd = (await ask(Y + '> ' + R)).toLowerCase();

        if (cmd === 'q') { iface.close(); process.exit(0); }

        if (cmd === 'a') {
            const name = await ask('Name (e.g. One Piece): ');
            if (!name) { console.log(RE + 'Name cannot be empty.' + R); continue; }

            console.log(Y + '  [1] TCB (tcbscans)' + R);
            console.log(Y + '  [2] MangaFire' + R);
            const siteChoice = await ask('Site (1/2): ');
            const site = siteChoice === '1' ? 'tcb' : siteChoice === '2' ? 'mangafire' : null;
            if (!site) { console.log(RE + 'Invalid choice.' + R); continue; }

            const url = await ask('Current chapter URL: ');
            if (!/^https?:\/\/.+\d/.test(url)) { console.log(RE + 'Invalid URL – must start with http(s):// and contain a chapter number.' + R); continue; }
            const raw = await ask('Current chapter number: ');
            const chapter = parseInt(raw, 10);
            if (isNaN(chapter)) { console.log(RE + 'Not a valid number.' + R); continue; }
            list.push({ name, site, url, chapter });
            save(list);
            console.log(G + `Saved "${name}" (${site === 'tcb' ? 'TCB' : 'MangaFire'}) at chapter ${chapter}.` + R);
        }

        if (cmd === 'd') {
            if (!list.length) { console.log(RE + 'Nothing to delete.' + R); continue; }
            const raw = await ask('Number to delete: ');
            const idx = parseInt(raw, 10) - 1;
            if (isNaN(idx) || idx < 0 || idx >= list.length) { console.log(RE + 'Invalid number.' + R); continue; }
            const [removed] = list.splice(idx, 1);
            save(list);
            console.log(G + `Deleted "${removed.name}".` + R);
        }

        if (cmd === 'n') {
            if (!list.length) { console.log(RE + 'Nothing to update.' + R); continue; }
            const rawIdx = await ask('Number to update: ');
            const idx = parseInt(rawIdx, 10) - 1;
            if (isNaN(idx) || idx < 0 || idx >= list.length) { console.log(RE + 'Invalid number.' + R); continue; }
            const m = list[idx];
            const rawChapter = await ask(`New chapter number for "${m.name}" (current: ${m.chapter}): `);
            const chapter = parseInt(rawChapter, 10);
            if (isNaN(chapter)) { console.log(RE + 'Not a valid number.' + R); continue; }
            m.url = buildNextUrl(m.url, m.chapter, chapter) ?? m.url;
            m.chapter = chapter;
            save(list);
            console.log(G + `Updated "${m.name}" to chapter ${chapter}.` + R);
        }

        if (cmd === 'c') {
            await checkAll(list);
        }
    }
}

main().catch(e => { console.error(e.message); process.exit(1); });
