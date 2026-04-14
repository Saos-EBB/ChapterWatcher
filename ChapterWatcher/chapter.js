// Run: node chapter.js [nickname]
// Stop: Ctrl+C

const fs = require('fs');
const path = require('path');
const {execSync} = require('child_process');

const PKG_PATH = path.join(__dirname, 'package.json');
const MODULES_PATH = path.join(__dirname, 'node_modules');

if (!fs.existsSync(PKG_PATH)) {
    fs.writeFileSync(PKG_PATH, JSON.stringify({
        dependencies: {
            'node-fetch': '^2.7.0',
            'open': '^8.4.2'
        }
    }, null, 2));
}

if (!fs.existsSync(MODULES_PATH)) {
    console.log('Installing dependencies...');
    execSync('npm install', {cwd: __dirname, stdio: 'inherit'});
}

const fetch = require('node-fetch');
const open = require('open');
const rl = require('readline');

// ── Colors ────────────────────────────────────────────────────────────────────

let purple;
let green;
let cyan;
let yellow;
let red;
const bold = '\x1b[1m';
const reset = '\x1b[0m';

function applyTheme(name) {
    if (name === 'green') {
        purple = '\x1b[32m';
        cyan = '\x1b[32m';
        yellow = '\x1b[2;32m';
        green = '\x1b[32m';
        red = '\x1b[31m';
    } else if (name === 'purple') {
        purple = '\x1b[35m';
        cyan = '\x1b[36m';
        yellow = '\x1b[35m';
        green = '\x1b[32m';
        red = '\x1b[31m';
    } else if (name === 'blue') {
        purple = '\x1b[34m';
        cyan = '\x1b[34m';
        yellow = '\x1b[36m';
        green = '\x1b[32m';
        red = '\x1b[31m';
    } else if (name === 'white') {
        purple = '\x1b[0m';
        cyan = '\x1b[0m';
        yellow = '\x1b[0m';
        green = '\x1b[0m';
        red = '\x1b[0m';
    }
}

// ── State file ────────────────────────────────────────────────────────────────

const STATE_FILE = path.join(__dirname, 'state.json');

function loadState() {
    try {
        const raw = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
        if (!raw.settings) raw.settings = {intervalMinutes: 2, theme: 'purple'};
        if (!raw.entries) raw.entries = {};
        if (!raw.groups) raw.groups = {};
        return raw;
    } catch {
        return {settings: {intervalMinutes: 2, theme: 'purple'}, entries: {}, groups: {}};
    }
}

function saveState(state) {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

applyTheme(loadState().settings.theme || 'purple');

// ── Spinner ───────────────────────────────────────────────────────────────────

const spinFrames = ['|', '/', '-', '\\'];
let spinnerTimer = null;
let spinFrameIdx = 0;
const activeWatchers = {}; // nickname → { nextChapter }
const allWatcherStates = {}; // nickname → ws object (for R-key immediate check)
const watcherIntervals = []; // all setInterval IDs (for M/Q cleanup)

function buildSpinnerLine() {
    const names = Object.keys(activeWatchers);
    if (!names.length) return '';
    const parts = names.map(n =>
        `${bold}${n}${reset}${purple} (next: ${bold}${activeWatchers[n].nextChapter}${reset}${purple})`
    );
    return purple + spinFrames[spinFrameIdx % spinFrames.length] + ' watching: ' + parts.join(' | ') + reset;
}

const HINT_LINE = cyan + '  press R to check now · M for menu · Q to quit' + reset;

function startSpinner() {
    if (spinnerTimer) return;
    spinFrameIdx = 0;
    // Print two lines: spinner on top, hint below.
    // Cursor ends up at the start of the line after the hint (home position).
    process.stdout.write(buildSpinnerLine() + '\n' + HINT_LINE + '\n');
    spinnerTimer = setInterval(() => {
        // Go up 2 lines, overwrite spinner line, leave hint untouched, return to home.
        process.stdout.write('\x1b[2A\r' + buildSpinnerLine() + '\x1b[K\x1b[2B');
        spinFrameIdx++;
    }, 100);
}

function stopSpinner() {
    if (spinnerTimer) {
        clearInterval(spinnerTimer);
        spinnerTimer = null;
        // Go up 2 lines and clear everything from there to end of screen.
        process.stdout.write('\x1b[2A\r\x1b[J');
    }
}

// ── URL helpers ───────────────────────────────────────────────────────────────

function replaceLast(str, from, to) {
    const idx = str.lastIndexOf(from);
    if (idx === -1) return str;
    return str.slice(0, idx) + to + str.slice(idx + from.length);
}

function buildNextUrl(baseUrl, lastChapter) {
    return replaceLast(baseUrl, String(lastChapter), String(lastChapter + 1));
}

// ── Title extraction ──────────────────────────────────────────────────────────

function extractNumberFromTitle(title) {
    const matches = title.match(/\b(\d+)\b/g);
    return matches ? parseInt(matches[matches.length - 1], 10) : null;
}

// ── Watcher ───────────────────────────────────────────────────────────────────

async function checkEntry(ws) {
    const nextChapter = ws.lastChapter + 1;
    const url = buildNextUrl(ws.url, ws.lastChapter);

    try {
        const response = await fetch(url);
        const html = await response.text();

        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (!titleMatch) return false;

        const extracted = extractNumberFromTitle(titleMatch[1].trim());

        if (extracted !== null && extracted > ws.lastChapter) {
            stopSpinner();
            console.log(green + `✓ ${bold}${ws.nickname}${reset}${green}: Chapter ${bold}${extracted}${reset}${green} is out! Opening...` + reset);
            await open(url);

            ws.lastChapter = extracted;
            ws.url = url;

            const state = loadState();
            if (state.entries[ws.nickname]) {
                state.entries[ws.nickname].url = url;
                state.entries[ws.nickname].lastChapter = extracted;
                saveState(state);
            }

            if (activeWatchers[ws.nickname]) {
                activeWatchers[ws.nickname].nextChapter = extracted + 1;
            }
            return true;
        }
    } catch (err) {
        stopSpinner();
        console.error(red + `✗ ${bold}${ws.nickname}${reset}${red}: ${err.message}` + reset);
    }

    return false;
}

function startWatcher(nickname, url, lastChapter) {
    const state = loadState();
    const intervalMs = (state.settings.intervalMinutes || 2) * 60 * 1000;
    const ws = {nickname, url, lastChapter};

    activeWatchers[nickname] = {nextChapter: lastChapter + 1};
    allWatcherStates[nickname] = ws;

    checkEntry(ws).then(() => {
        if (activeWatchers[nickname]) activeWatchers[nickname].nextChapter = ws.lastChapter + 1;
        startSpinner();
    });

    const timer = setInterval(async () => {
        stopSpinner();
        await checkEntry(ws);
        if (activeWatchers[nickname]) activeWatchers[nickname].nextChapter = ws.lastChapter + 1;
        startSpinner();
    }, intervalMs);

    watcherIntervals.push(timer);
}

// ── Watcher-mode keyboard control ─────────────────────────────────────────────

function cleanupWatchers() {
    stopSpinner();
    watcherIntervals.forEach(t => clearInterval(t));
    watcherIntervals.length = 0;
    for (const k in activeWatchers) delete activeWatchers[k];
    for (const k in allWatcherStates) delete allWatcherStates[k];
    if (process.stdin.isTTY) {
        process.stdin.setRawMode(false);
    }
    process.stdin.pause();
    process.stdin.removeAllListeners('data');
}

async function checkAll() {
    stopSpinner();
    await Promise.all(
        Object.values(allWatcherStates).map(ws =>
            checkEntry(ws).then(() => {
                if (activeWatchers[ws.nickname]) {
                    activeWatchers[ws.nickname].nextChapter = ws.lastChapter + 1;
                }
            })
        )
    );
    startSpinner();
}

function enterWatcherMode() {
    // Readline must be closed before switching stdin to raw mode.
    closeIface();

    if (!process.stdin.isTTY) return; // non-interactive environment — skip

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    let checkBusy = false;

    process.stdin.on('data', async key => {
        const k = key.toLowerCase();

        if (k === 'r') {
            if (checkBusy) return;
            checkBusy = true;
            await checkAll();
            checkBusy = false;

        } else if (k === 'm') {
            cleanupWatchers();
            mainMenu().catch(err => {
                console.error(red + err.message + reset);
                process.exit(1);
            });

        } else if (k === 'q' || key === '\u0003') { // q or Ctrl+C
            cleanupWatchers();
            console.log(green + 'Goodbye! 🏴‍☠️' + reset);
            process.exit(0);
        }
    });
}

// ── readline helpers ──────────────────────────────────────────────────────────

let iface = null;

function getIface() {
    if (!iface) {
        iface = rl.createInterface({input: process.stdin, output: process.stdout});
    }
    return iface;
}

function closeIface() {
    if (iface) {
        iface.close();
        iface = null;
    }
}

// Pass a fully pre-colored string as `prompt`.
function ask(prompt) {
    return new Promise(resolve => {
        getIface().question(prompt, answer => resolve(answer.trim()));
    });
}

// ── UI helpers ────────────────────────────────────────────────────────────────

function clearScreen() {
    process.stdout.write('\x1b[2J\x1b[H');
}

function printHeader() {
    console.log(purple + bold + '══════════════════════════════════════' + reset);
    console.log(purple + bold + '        🏴 RELEASE WATCHER 🏴‍    ' + reset);
    console.log(purple + bold + '══════════════════════════════════════' + reset);
    console.log();
}

// Prints a numbered entry list. Returns false if empty.
function printEntries(entries) {
    const keys = Object.keys(entries);
    if (!keys.length) {
        console.log(red + '  No entries saved.' + reset);
        return false;
    }
    const maxLen = Math.max(...keys.map(k => k.length));
    keys.forEach((k, i) => {
        const e = entries[k];
        const pad = k.padEnd(maxLen);
        console.log(cyan + `  ${bold}[${i + 1}]${reset}${cyan} ${bold}${pad}${reset}${cyan}   last: ${bold}${e.lastChapter}${reset}${cyan}   url: ${e.url}` + reset);
    });
    return true;
}

// Prints a numbered group list. Returns false if empty.
function printGroups(groups) {
    const keys = Object.keys(groups);
    if (!keys.length) {
        console.log(cyan + '  No groups saved yet.' + reset);
        return false;
    }
    keys.forEach((g, i) => {
        const members = groups[g].length ? groups[g].join(', ') : '(empty)';
        console.log(cyan + `  ${bold}[${i + 1}]${reset}${cyan} ${bold}${g}${reset}${cyan}  →  ${members}` + reset);
    });
    return true;
}

async function pressEnter() {
    await ask(cyan + 'Press Enter to continue...' + reset);
}

function resolveNickname(input, entries) {
    const keys = Object.keys(entries);
    const n = parseInt(input, 10);
    if (!isNaN(n) && input.trim() !== '' && n >= 1 && n <= keys.length) {
        return keys[n - 1];
    }
    return input;
}

function resolveGroup(input, groups) {
    const keys = Object.keys(groups);
    const n = parseInt(input, 10);
    if (!isNaN(n) && input.trim() !== '' && n >= 1 && n <= keys.length) {
        return keys[n - 1];
    }
    return input;
}

// ── [1] Add new ───────────────────────────────────────────────────────────────

// Returns true to signal transition to watcher mode.
async function menuAddNew() {
    const state = loadState();

    let nickname;
    while (true) {
        nickname = await ask(yellow + 'Nickname: ' + reset);
        if (nickname === '') {
            console.log(red + 'Nickname cannot be empty. Try again.' + reset);
        } else if (state.entries[nickname]) {
            console.log(red + `Nickname "${nickname}" already exists. Try again.` + reset);
        } else {
            break;
        }
    }

    const urlRegex = /^https?:\/\/.+\d+/;
    let url;
    while (true) {
        url = await ask(yellow + 'URL of current chapter/episode: ' + reset);
        if (urlRegex.test(url)) break;
        console.log(red + 'Invalid URL. Must start with http:// or https:// and contain a number in the path. Try again.' + reset);
    }

    let lastChapter;
    while (true) {
        const raw = await ask(yellow + 'Current number: ' + reset);
        lastChapter = parseInt(raw, 10);
        if (!isNaN(lastChapter) && raw !== '') break;
        console.log(red + `"${raw}" is not a valid number. Try again.` + reset);
    }

    state.entries[nickname] = {url, lastChapter};
    saveState(state);

    console.log(green + `Saved! Starting watcher for ${bold}${nickname}${reset}${green}...` + reset);
    closeIface();
    startWatcher(nickname, url, lastChapter);
    return true;
}

// ── [2] Watch submenu ─────────────────────────────────────────────────────────

async function watchResumeSingle() {
    const state = loadState();
    if (!printEntries(state.entries)) {
        await pressEnter();
        return false;
    }
    console.log();

    const selected = [];
    while (true) {
        let nickname = await ask(yellow + 'Enter nickname or index: ' + reset);
        nickname = resolveNickname(nickname, state.entries);
        if (!state.entries[nickname]) {
            console.log(red + `Nickname '${bold}${nickname}${reset}${red}' not found.` + reset);
            await pressEnter();
            return false;
        }
        if (!selected.includes(nickname)) selected.push(nickname);
        const more = (await ask(yellow + 'Add another? (y/n): ' + reset)).toLowerCase();
        if (more !== 'y') break;
    }

    closeIface();
    for (const name of selected) {
        const e = state.entries[name];
        startWatcher(name, e.url, e.lastChapter);
    }
    return true;
}

async function watchGroup() {
    const state = loadState();
    const groups = state.groups;
    const gkeys = Object.keys(groups);

    if (!gkeys.length) {
        console.log(cyan + '  No groups saved yet. Create one in Manage → Groups.' + reset);
        await pressEnter();
        return false;
    }

    printGroups(groups);
    console.log();

    const groupName = await ask(yellow + 'Enter group name: ' + reset);
    if (!groups[groupName]) {
        console.log(red + `Group '${bold}${groupName}${reset}${red}' not found.` + reset);
        await pressEnter();
        return false;
    }

    const members = groups[groupName].filter(n => state.entries[n]);
    if (!members.length) {
        console.log(red + 'No valid entries in this group.' + reset);
        await pressEnter();
        return false;
    }

    console.log(cyan + `Watching group ${bold}${groupName}${reset}${cyan} (${members.length} entr${members.length === 1 ? 'y' : 'ies'})...` + reset);
    closeIface();
    for (const name of members) {
        const e = state.entries[name];
        startWatcher(name, e.url, e.lastChapter);
    }
    return true;
}

async function watchAll() {
    const state = loadState();
    const keys = Object.keys(state.entries);

    if (!keys.length) {
        console.log(red + 'No entries saved.' + reset);
        await pressEnter();
        return false;
    }

    console.log(cyan + `Watching all ${bold}${keys.length}${reset}${cyan} entr${keys.length === 1 ? 'y' : 'ies'}...` + reset);
    closeIface();
    for (const name of keys) {
        const e = state.entries[name];
        startWatcher(name, e.url, e.lastChapter);
    }
    return true;
}

async function watchMenu() {
    while (true) {
        clearScreen();
        printHeader();
        console.log(yellow + `  ${bold}[1]${reset}${yellow} Resume single` + reset);
        console.log(yellow + `  ${bold}[2]${reset}${yellow} Watch group` + reset);
        console.log(yellow + `  ${bold}[3]${reset}${yellow} Watch all` + reset);
        console.log(yellow + `  ${bold}[4]${reset}${yellow} Back` + reset);
        console.log();

        const choice = await ask(yellow + '> ' + reset);
        clearScreen();
        printHeader();

        if (choice === '1') {
            const wm = await watchResumeSingle();
            if (wm) return true;
        } else if (choice === '2') {
            const wm = await watchGroup();
            if (wm) return true;
        } else if (choice === '3') {
            const wm = await watchAll();
            if (wm) return true;
        } else if (choice === '4' || choice.toLowerCase() === 'b') {
            return false;
        } else {
            console.log(red + `Unknown option "${choice}".` + reset);
            await pressEnter();
        }
    }
}

// ── [3] Manage → Entries submenu ──────────────────────────────────────────────

async function entriesListAll() {
    const state = loadState();
    const keys = Object.keys(state.entries);
    console.log();
    if (!keys.length) {
        console.log(red + '  No entries saved.' + reset);
    } else {
        const maxLen = Math.max(...keys.map(k => k.length));
        keys.forEach(k => {
            const e = state.entries[k];
            const pad = k.padEnd(maxLen);
            console.log(cyan + `  ${bold}${pad}${reset}${cyan}   last: ${bold}${e.lastChapter}${reset}${cyan}   url: ${e.url}` + reset);
        });
    }
    console.log();
    await pressEnter();
}

async function entriesEdit() {
    const state = loadState();
    if (!printEntries(state.entries)) {
        await pressEnter();
        return;
    }
    console.log();

    const nickname = resolveNickname(await ask(yellow + 'Which nickname or index to edit? ' + reset), state.entries);
    if (!state.entries[nickname]) {
        console.log(red + `Nickname '${bold}${nickname}${reset}${red}' not found.` + reset);
        await pressEnter();
        return;
    }

    while (true) {
        clearScreen();
        printHeader();
        console.log(cyan + `  Editing: ${bold}${nickname}${reset}` + reset);
        console.log();
        console.log(yellow + `  ${bold}[1]${reset}${yellow} Update URL` + reset);
        console.log(yellow + `  ${bold}[2]${reset}${yellow} Update chapter/episode number` + reset);
        console.log(yellow + `  ${bold}[3]${reset}${yellow} Rename nickname` + reset);
        console.log(yellow + `  ${bold}[4]${reset}${yellow} Back` + reset);
        console.log();

        const sub = await ask(yellow + '> ' + reset);

        if (sub === '1') {
            console.log(cyan + state.entries[nickname].url + reset);
            const urlRegex = /^https?:\/\/.+\d+/;
            let newUrl;
            while (true) {
                newUrl = await ask(yellow + 'New URL: ' + reset);
                if (urlRegex.test(newUrl)) break;
                console.log(red + 'Invalid URL. Must start with http:// or https:// and contain a number in the path. Try again.' + reset);
            }
            state.entries[nickname].url = newUrl;
            saveState(state);
            console.log(green + 'Saved!' + reset);
            await pressEnter();
        } else if (sub === '2') {
            console.log(cyan + String(state.entries[nickname].lastChapter) + reset);
            const oldNumber = state.entries[nickname].lastChapter;
            const currentUrl = state.entries[nickname].url;
            let num;
            while (true) {
                const raw = await ask(yellow + 'New number: ' + reset);
                num = parseInt(raw, 10);
                if (!isNaN(num) && raw !== '') break;
                console.log(red + `"${raw}" is not a valid number.` + reset);
            }
            const newUrl = replaceLast(currentUrl, String(oldNumber), String(num));
            state.entries[nickname].lastChapter = num;
            state.entries[nickname].url = newUrl;
            saveState(state);
            console.log(green + 'Saved!' + reset);
            console.log(cyan + newUrl + reset);
            await pressEnter();
        } else if (sub === '3') {
            const newName = await ask(yellow + 'New nickname: ' + reset);
            state.entries[newName] = state.entries[nickname];
            delete state.entries[nickname];
            // Keep group references consistent
            for (const g of Object.keys(state.groups)) {
                const idx = state.groups[g].indexOf(nickname);
                if (idx !== -1) state.groups[g][idx] = newName;
            }
            saveState(state);
            console.log(green + `Renamed to ${bold}${newName}${reset}${green}.` + reset);
            await pressEnter();
            return; // nickname gone — exit inner loop
        } else if (sub === '4' || sub.toLowerCase() === 'b') {
            return;
        } else {
            console.log(red + `Unknown option "${sub}".` + reset);
            await pressEnter();
        }
    }
}

async function entriesDelete() {
    const state = loadState();
    if (!printEntries(state.entries)) {
        await pressEnter();
        return;
    }
    console.log();

    const nickname = resolveNickname(await ask(yellow + 'Which nickname or index to delete? ' + reset), state.entries);
    if (!state.entries[nickname]) {
        console.log(red + `Nickname '${bold}${nickname}${reset}${red}' not found.` + reset);
        await pressEnter();
        return;
    }

    const confirm = (await ask(
        red + `Delete ${bold}${nickname}${reset}${red}? (y/n): ` + reset
    )).toLowerCase();

    if (confirm === 'y') {
        delete state.entries[nickname];
        // Remove from every group
        for (const g of Object.keys(state.groups)) {
            state.groups[g] = state.groups[g].filter(n => n !== nickname);
        }
        saveState(state);
        console.log(green + `Deleted ${bold}${nickname}${reset}${green}.` + reset);
    }
    await pressEnter();
}

async function entriesMenu() {
    while (true) {
        clearScreen();
        printHeader();
        console.log(yellow + `  ${bold}[1]${reset}${yellow} List all` + reset);
        console.log(yellow + `  ${bold}[2]${reset}${yellow} Edit entry` + reset);
        console.log(yellow + `  ${bold}[3]${reset}${yellow} Delete entry` + reset);
        console.log(yellow + `  ${bold}[4]${reset}${yellow} Back` + reset);
        console.log();

        const choice = await ask(yellow + '> ' + reset);
        clearScreen();
        printHeader();

        if (choice === '1') {
            await entriesListAll();
        } else if (choice === '2') {
            await entriesEdit();
        } else if (choice === '3') {
            await entriesDelete();
        } else if (choice === '4' || choice.toLowerCase() === 'b') {
            return;
        } else {
            console.log(red + `Unknown option "${choice}".` + reset);
            await pressEnter();
        }
    }
}

// ── [3] Manage → Groups submenu ───────────────────────────────────────────────

async function groupsList() {
    const state = loadState();
    console.log();
    printGroups(state.groups);
    console.log();
    await pressEnter();
}

async function groupsCreate() {
    const state = loadState();

    const name = await ask(yellow + 'Group name: ' + reset);
    if (state.groups[name]) {
        console.log(red + `Group '${bold}${name}${reset}${red}' already exists.` + reset);
        await pressEnter();
        return;
    }
    if (!Object.keys(state.entries).length) {
        console.log(red + 'No entries saved. Add entries first.' + reset);
        await pressEnter();
        return;
    }

    printEntries(state.entries);
    console.log();

    const members = [];
    while (true) {
        const rawInput = await ask(yellow + 'Add entry (nickname/index, or "done" to finish): ' + reset);
        if (rawInput.toLowerCase() === 'done') break;
        const input = resolveNickname(rawInput, state.entries);
        if (!state.entries[input]) {
            console.log(red + `Nickname '${bold}${input}${reset}${red}' not found.` + reset);
            continue;
        }
        if (!members.includes(input)) {
            members.push(input);
            console.log(green + `  Added ${bold}${input}${reset}${green}.` + reset);
        }
    }

    state.groups[name] = members;
    saveState(state);
    console.log(green + `Group ${bold}${name}${reset}${green} saved.` + reset);
    await pressEnter();
}

async function groupsEdit() {
    const state = loadState();
    if (!printGroups(state.groups)) {
        await pressEnter();
        return;
    }
    console.log();

    const name = resolveGroup(await ask(yellow + 'Which group to edit? (name or index): ' + reset), state.groups);
    if (!state.groups[name]) {
        console.log(red + `Group '${bold}${name}${reset}${red}' not found.` + reset);
        await pressEnter();
        return;
    }

    while (true) {
        clearScreen();
        printHeader();
        const members = state.groups[name].length ? state.groups[name].join(', ') : '(empty)';
        console.log(cyan + `  Group: ${bold}${name}${reset}${cyan}  →  ${members}` + reset);
        console.log();
        console.log(yellow + `  ${bold}[1]${reset}${yellow} Add entry` + reset);
        console.log(yellow + `  ${bold}[2]${reset}${yellow} Remove entry` + reset);
        console.log(yellow + `  ${bold}[3]${reset}${yellow} Rename group` + reset);
        console.log(yellow + `  ${bold}[4]${reset}${yellow} Back` + reset);
        console.log();

        const sub = await ask(yellow + '> ' + reset);

        if (sub === '1') {
            printEntries(state.entries);
            console.log();
            const input = resolveNickname(await ask(yellow + 'Nickname or index to add: ' + reset), state.entries);
            if (!state.entries[input]) {
                console.log(red + `Nickname '${bold}${input}${reset}${red}' not found.` + reset);
            } else if (state.groups[name].includes(input)) {
                console.log(red + `'${input}' is already in this group.` + reset);
            } else {
                state.groups[name].push(input);
                saveState(state);
                console.log(green + `Added ${bold}${input}${reset}${green}.` + reset);
            }
            await pressEnter();
        } else if (sub === '2') {
            if (!state.groups[name].length) {
                console.log(red + 'Group is empty.' + reset);
                await pressEnter();
                continue;
            }
            state.groups[name].forEach((n, i) =>
                console.log(cyan + `  ${bold}[${i + 1}]${reset}${cyan} ${n}` + reset)
            );
            console.log();
            const rawRemove = await ask(yellow + 'Nickname or index to remove: ' + reset);
            const removeN = parseInt(rawRemove, 10);
            const input = (!isNaN(removeN) && rawRemove.trim() !== '' && removeN >= 1 && removeN <= state.groups[name].length)
                ? state.groups[name][removeN - 1]
                : rawRemove;
            const idx = state.groups[name].indexOf(input);
            if (idx === -1) {
                console.log(red + `'${input}' is not in this group.` + reset);
            } else {
                state.groups[name].splice(idx, 1);
                saveState(state);
                console.log(green + `Removed ${bold}${input}${reset}${green}.` + reset);
            }
            await pressEnter();
        } else if (sub === '3') {
            const newName = await ask(yellow + 'New group name: ' + reset);
            state.groups[newName] = state.groups[name];
            delete state.groups[name];
            saveState(state);
            console.log(green + `Renamed to ${bold}${newName}${reset}${green}.` + reset);
            await pressEnter();
            return; // name gone — exit inner loop
        } else if (sub === '4' || sub.toLowerCase() === 'b') {
            return;
        } else {
            console.log(red + `Unknown option "${sub}".` + reset);
            await pressEnter();
        }
    }
}

async function groupsDelete() {
    const state = loadState();
    if (!printGroups(state.groups)) {
        await pressEnter();
        return;
    }
    console.log();

    const name = resolveGroup(await ask(yellow + 'Which group to delete? (name or index): ' + reset), state.groups);
    if (!state.groups[name]) {
        console.log(red + `Group '${bold}${name}${reset}${red}' not found.` + reset);
        await pressEnter();
        return;
    }

    const confirm = (await ask(
        red + `Delete group ${bold}${name}${reset}${red}? (y/n): ` + reset
    )).toLowerCase();

    if (confirm === 'y') {
        delete state.groups[name];
        saveState(state);
        console.log(green + `Deleted ${bold}${name}${reset}${green}.` + reset);
    }
    await pressEnter();
}

async function groupsMenu() {
    while (true) {
        clearScreen();
        printHeader();
        console.log(yellow + `  ${bold}[1]${reset}${yellow} List groups` + reset);
        console.log(yellow + `  ${bold}[2]${reset}${yellow} Create group` + reset);
        console.log(yellow + `  ${bold}[3]${reset}${yellow} Edit group` + reset);
        console.log(yellow + `  ${bold}[4]${reset}${yellow} Delete group` + reset);
        console.log(yellow + `  ${bold}[5]${reset}${yellow} Back` + reset);
        console.log();

        const choice = await ask(yellow + '> ' + reset);
        clearScreen();
        printHeader();

        if (choice === '1') {
            await groupsList();
        } else if (choice === '2') {
            await groupsCreate();
        } else if (choice === '3') {
            await groupsEdit();
        } else if (choice === '4') {
            await groupsDelete();
        } else if (choice === '5' || choice.toLowerCase() === 'b') {
            return;
        } else {
            console.log(red + `Unknown option "${choice}".` + reset);
            await pressEnter();
        }
    }
}

// ── [3] Manage submenu ────────────────────────────────────────────────────────

async function manageMenu() {
    while (true) {
        clearScreen();
        printHeader();
        console.log(yellow + `  ${bold}[1]${reset}${yellow} Entries` + reset);
        console.log(yellow + `  ${bold}[2]${reset}${yellow} Groups` + reset);
        console.log(yellow + `  ${bold}[3]${reset}${yellow} Back` + reset);
        console.log();

        const choice = await ask(yellow + '> ' + reset);
        clearScreen();
        printHeader();

        if (choice === '1') {
            await entriesMenu();
        } else if (choice === '2') {
            await groupsMenu();
        } else if (choice === '3' || choice.toLowerCase() === 'b') {
            return;
        } else {
            console.log(red + `Unknown option "${choice}".` + reset);
            await pressEnter();
        }
    }
}

// ── [4] Settings submenu ──────────────────────────────────────────────────────

async function settingsMenu() {
    while (true) {
        const state = loadState();
        clearScreen();
        printHeader();
        console.log(yellow + `  ${bold}[1]${reset}${yellow} Change check interval ` +
            cyan + `(current: ${bold}${state.settings.intervalMinutes}${reset}${cyan} min)` + reset);
        console.log(yellow + `  ${bold}[2]${reset}${yellow} Change theme ` +
            cyan + `(current: ${bold}${state.settings.theme || 'purple'}${reset}${cyan})` + reset);
        console.log(yellow + `  ${bold}[3]${reset}${yellow} Back` + reset);
        console.log();

        const choice = await ask(yellow + '> ' + reset);

        if (choice === '1') {
            clearScreen();
            printHeader();
            let minutes;
            while (true) {
                const raw = await ask(yellow + `Interval in minutes (current: ${state.settings.intervalMinutes}): ` + reset);
                minutes = parseFloat(raw);
                if (!isNaN(minutes) && minutes > 0) break;
                console.log(red + 'Please enter a number greater than 0.' + reset);
            }
            state.settings.intervalMinutes = minutes;
            saveState(state);
            console.log(green + `Saved! New interval: ${bold}${minutes}${reset}${green} minutes.` + reset);
            await pressEnter();
        } else if (choice === '2') {
            clearScreen();
            printHeader();
            console.log(yellow + `  ${bold}[1]${reset}${yellow} Green` + reset);
            console.log(yellow + `  ${bold}[2]${reset}${yellow} Purple` + reset);
            console.log(yellow + `  ${bold}[3]${reset}${yellow} Blue` + reset);
            console.log(yellow + `  ${bold}[4]${reset}${yellow} White (no color)` + reset);
            console.log();
            const sub = await ask(yellow + '> ' + reset);
            if (sub.toLowerCase() === 'b') {
                // go back without saving
            } else {
                const themeMap = {'1': 'green', '2': 'purple', '3': 'blue', '4': 'white'};
                const themeName = themeMap[sub];
                if (themeName) {
                    applyTheme(themeName);
                    state.settings.theme = themeName;
                    saveState(state);
                    console.log(green + `Theme set to ${bold}${themeName}${reset}${green}.` + reset);
                } else {
                    console.log(red + `Unknown option "${sub}".` + reset);
                }
            }
        } else if (choice === '3' || choice.toLowerCase() === 'b') {
            return;
        } else {
            console.log(red + `Unknown option "${choice}".` + reset);
            await pressEnter();
        }
    }
}

// ── Main menu loop ────────────────────────────────────────────────────────────

async function mainMenu() {
    while (true) {
        clearScreen();
        printHeader();
        console.log(yellow + `  ${bold}[1]${reset}${yellow} Add new` + reset);
        console.log(yellow + `  ${bold}[2]${reset}${yellow} Watch` + reset);
        console.log(yellow + `  ${bold}[3]${reset}${yellow} Manage` + reset);
        console.log(yellow + `  ${bold}[4]${reset}${yellow} Settings` + reset);
        console.log(yellow + `  ${bold}[b]${reset}${yellow} Exit` + reset);
        console.log();

        const choice = await ask(yellow + '> ' + reset);
        clearScreen();
        printHeader();

        let watcherMode = false;

        if (choice === '1') {
            watcherMode = await menuAddNew();
        } else if (choice === '2') {
            watcherMode = await watchMenu();
        } else if (choice === '3') {
            await manageMenu();
        } else if (choice === '4') {
            await settingsMenu();
        } else if (choice === '5') {
            closeIface();
            console.log(green + 'Goodbye! 🏴‍☠️' + reset);
            process.exit(0);
        } else {
            console.log(red + `Unknown option "${choice}".` + reset);
            await pressEnter();
        }

        if (watcherMode) {
            enterWatcherMode();
            return;
        }
    }
}

// ── Entry point ───────────────────────────────────────────────────────────────

const arg = process.argv[2];

if (arg) {
    const state = loadState();
    const entry = state.entries[arg];
    if (!entry) {
        console.error(red + `Nickname '${bold}${arg}${reset}${red}' not found. Run ${bold}node chapter.js${reset}${red} without arguments to add it.` + reset);
        process.exit(1);
    }
    printHeader();
    console.log(cyan + `Starting watcher for ${bold}${arg}${reset}${cyan} from chapter ${bold}${entry.lastChapter}${reset}${cyan}...` + reset);
    startWatcher(arg, entry.url, entry.lastChapter);
    enterWatcherMode();
} else {
    mainMenu().catch(err => {
        console.error(red + err.message + reset);
        process.exit(1);
    });
}
