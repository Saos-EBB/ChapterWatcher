import { readFileSync, writeFileSync } from 'fs';

const SRC = 'C:/Users/Kevin Schaberl/WebstormProjects/Tools/AniWorldPersonalScript/AniWorldScript.js';
const DEST = 'C:/Users/Kevin Schaberl/WebstormProjects/Tools/AniWorldPersonalScript/AniWorldScript.js';

let lines = readFileSync(SRC, 'utf8').split('\n');
console.log('Input lines:', lines.length);

// Helper: remove lines by 0-indexed range [start, end] inclusive
function removeLines(start, end) {
  lines.splice(start, end - start + 1);
}

// Helper: find first line containing text after fromLine (0-indexed)
function findLine(text, fromLine = 0) {
  for (let i = fromLine; i < lines.length; i++) {
    if (lines[i].includes(text)) return i;
  }
  throw new Error(`Not found: ${JSON.stringify(text)}`);
}

// ================================================================
// Removals are done BOTTOM-UP to preserve line numbers
// ================================================================

// ---- [A] Remove updateVideoLanguageProcessing methods ----
{
  const s = findLine('// Partly consist of the website code', 5000);
  const e = findLine('updateVideoLanguageProcessingNewSto() {', s) + 1;
  let depth = 1, end = e;
  while (depth > 0 && end < lines.length) {
    end++;
    for (const ch of lines[end]) { if (ch === '{') depth++; if (ch === '}') depth--; }
  }
  removeLines(s - 1, end);
  console.log('Removed updateVideoLanguageProcessing methods');
}

// ---- [B] Remove announceEpisodeWatchedNewSto ----
{
  const s = findLine('// New S.to API for marking episodes watched', 5000);
  const e = findLine('async announceEpisodeWatchedNewSto', s) + 1;
  let depth = 1, end = e;
  while (depth > 0 && end < lines.length) {
    end++;
    for (const ch of lines[end]) { if (ch === '{') depth++; if (ch === '}') depth--; }
  }
  removeLines(s - 1, end);
  console.log('Removed announceEpisodeWatchedNewSto');
}

// ---- [C] Remove markCurrentVideoWatched ----
{
  const s = findLine('async markCurrentVideoWatched()', 5000);
  let depth = 0, started = false, end = s;
  for (let i = s; i < lines.length; i++) {
    for (const ch of lines[i]) { if (ch === '{') { depth++; started = true; } if (ch === '}') depth--; }
    if (started && depth === 0) { end = i; break; }
  }
  removeLines(s - 1, end);
  console.log('Removed markCurrentVideoWatched');
}

// ---- [D] Remove announceEpisodeWatched ----
{
  const s = findLine('async announceEpisodeWatched(id)', 5000);
  let depth = 0, started = false, end = s;
  for (let i = s; i < lines.length; i++) {
    for (const ch of lines[i]) { if (ch === '{') { depth++; started = true; } if (ch === '}') depth--; }
    if (started && depth === 0) { end = i; break; }
  }
  removeLines(s - 1, end);
  console.log('Removed announceEpisodeWatched');
}

// ---- [E] Remove VOEJWPIframeInterface.setupVideoPlaybackPositionMemory ----
{
  const voeStart = findLine('class VOEJWPIframeInterface extends IframeInterface', 4200);
  const s = findLine('async setupVideoPlaybackPositionMemory(player)', voeStart);
  let depth = 0, started = false, end = s;
  for (let i = s; i < lines.length; i++) {
    for (const ch of lines[i]) { if (ch === '{') { depth++; started = true; } if (ch === '}') depth--; }
    if (started && depth === 0) { end = i; break; }
  }
  removeLines(s - 1, end);
  console.log('Removed VOEJWPIframeInterface.setupVideoPlaybackPositionMemory');
}

// ---- [F] Remove IframeInterface.setupVideoPlaybackPositionMemory ----
{
  const s = findLine('async setupVideoPlaybackPositionMemory(player)', 3800);
  let depth = 0, started = false, end = s;
  for (let i = s; i < lines.length; i++) {
    for (const ch of lines[i]) { if (ch === '{') { depth++; started = true; } if (ch === '}') depth--; }
    if (started && depth === 0) { end = i; break; }
  }
  removeLines(s - 1, end);
  console.log('Removed IframeInterface.setupVideoPlaybackPositionMemory');
}

// ---- [G] Remove IframeInterface.setupWatchedStateLabeling ----
{
  const s = findLine('setupWatchedStateLabeling(player)', 3800);
  let depth = 0, started = false, end = s;
  for (let i = s; i < lines.length; i++) {
    for (const ch of lines[i]) { if (ch === '{') { depth++; started = true; } if (ch === '}') depth--; }
    if (started && depth === 0) { end = i; break; }
  }
  removeLines(s - 1, end);
  console.log('Removed setupWatchedStateLabeling');
}

// ---- [H] Remove IframeInterface.setupPersistentVolume ----
{
  const s = findLine('setupPersistentVolume(player)', 3800);
  let depth = 0, started = false, end = s;
  for (let i = s; i < lines.length; i++) {
    for (const ch of lines[i]) { if (ch === '{') { depth++; started = true; } if (ch === '}') depth--; }
    if (started && depth === 0) { end = i; break; }
  }
  removeLines(s - 1, end);
  console.log('Removed setupPersistentVolume');
}

// ---- [I] Remove IframeInterface.setupDoubletapBehavior ----
{
  const s = findLine('setupDoubletapBehavior(player', 3700);
  let depth = 0, started = false, end = s;
  for (let i = s; i < lines.length; i++) {
    for (const ch of lines[i]) { if (ch === '{') { depth++; started = true; } if (ch === '}') depth--; }
    if (started && depth === 0) { end = i; break; }
  }
  removeLines(s - 1, end);
  console.log('Removed setupDoubletapBehavior');
}

// ---- [J] Remove IframeInterface static makePlaybackPositionGMKey ----
{
  const s = findLine('static makePlaybackPositionGMKey(topScopeDomainId', 1500);
  let depth = 0, started = false, end = s;
  for (let i = s; i < lines.length; i++) {
    for (const ch of lines[i]) { if (ch === '{') { depth++; started = true; } if (ch === '}') depth--; }
    if (started && depth === 0) { end = i; break; }
  }
  removeLines(s - 1, end);
  console.log('Removed makePlaybackPositionGMKey');
}

// ---- [K] Remove TopScopeInterface.applyPlaybackPositionsFix ----
{
  const s = findLine('applyPlaybackPositionsFix() {', 4400);
  let depth = 0, started = false, end = s;
  for (let i = s; i < lines.length; i++) {
    for (const ch of lines[i]) { if (ch === '{') { depth++; started = true; } if (ch === '}') depth--; }
    if (started && depth === 0) { end = i; break; }
  }
  removeLines(s - 1, end);
  console.log('Removed applyPlaybackPositionsFix');
}

// ---- [L] Remove builtinPlaybackPositionMemory from VOEJWPIframeInterface constructor ----
{
  const voeStart = findLine('class VOEJWPIframeInterface extends IframeInterface', 4000);
  const s = findLine('playbackPositionStorageKey', voeStart);
  const e = findLine('localStorage.removeItem(playbackPositionStorageKey', s);
  removeLines(s - 1, e + 1);
  console.log('Removed VOEJWPIframeInterface builtinPlaybackPositionMemory');
}

// ---- [M] Remove IS_MOBILE doubletap override block from VOEJWPIframeInterface constructor ----
{
  const voeStart = findLine('class VOEJWPIframeInterface extends IframeInterface', 4000);
  const s = findLine('// Intercept double-tap to fullscreen handler', voeStart);
  let depth = 0, started = false, end = s;
  for (let i = s; i < lines.length; i++) {
    for (const ch of lines[i]) { if (ch === '{') { depth++; started = true; } if (ch === '}') depth--; }
    if (started && depth === 0) { end = i; break; }
  }
  removeLines(s - 1, end + 1);
  console.log('Removed VOEJWP doubletap intercept block');
}

// ---- [N] Remove setupSkipIntroButton function ----
{
  const s = findLine('// Create "Skip intro" button', 1000);
  let depth = 0, started = false, end = s;
  const fnStart = findLine('function setupSkipIntroButton(player)', s);
  for (let i = fnStart; i < lines.length; i++) {
    for (const ch of lines[i]) { if (ch === '{') { depth++; started = true; } if (ch === '}') depth--; }
    if (started && depth === 0) { end = i; break; }
  }
  removeLines(s, end + 1);
  console.log('Removed setupSkipIntroButton');
}

// ---- [O] Remove detectDoubletap function ----
{
  const s = findLine('function detectDoubletap(element, callback', 900);
  let depth = 0, started = false, end = s;
  for (let i = s; i < lines.length; i++) {
    for (const ch of lines[i]) { if (ch === '{') { depth++; started = true; } if (ch === '}') depth--; }
    if (started && depth === 0) { end = i; break; }
  }
  removeLines(s - 1, end + 1);
  console.log('Removed detectDoubletap');
}

// ---- [P] Remove Vidmoly SmartLoader block ----
{
  const s = findLine("waitForElement('.inSiteWebStream'", 680);
  let depth = 0, started = false, end = s;
  for (let i = s; i < lines.length; i++) {
    for (const ch of lines[i]) { if (ch === '{') { depth++; started = true; } if (ch === '}') depth--; }
    if (started && depth === 0) { end = i; break; }
  }
  removeLines(s - 1, end + 1);
  console.log('Removed SmartLoader block');
}

// ================================================================
// TEXT REPLACEMENTS
// ================================================================
let text = lines.join('\n');

// ---- Remove IS_SAFARI constant ----
text = text.replace(/\s*const IS_SAFARI = \(\s*\n\s*navigator\.userAgent\.indexOf[^\n]+\n\s*\);\n/m, '\n');

// ---- Remove calls to removed methods from preparePlayer ----
text = text.replace(/\s*this\.setupDoubletapBehavior\([^)]*\);\n/g, '\n');
text = text.replace(/\s*this\.setupPersistentVolume\([^)]*\);\n/g, '\n');
text = text.replace(/\s*this\.setupWatchedStateLabeling\([^)]*\);\n/g, '\n');
text = text.replace(/\s*this\.setupVideoPlaybackPositionMemory\([^)]*\);\n/g, '\n');
text = text.replace(/\s*if \(advancedSettings\[ADVANCED_SETTINGS_MAP\.showSkipIntroButton\]\) \{\n\s*setupSkipIntroButton\(player\);\n\s*\}\n/g, '\n');

// ---- Remove CORE_SETTINGS_MAP entries ----
text = text.replace(/\s*persistentVolumeLvl: 'persistentVolumeLvl',\n/g, '\n');
text = text.replace(/\s*providersPriority: 'providersPriority',\n/g, '\n');
text = text.replace(/\s*videoLanguagePreferredID: 'videoLanguagePreferredID',\n/g, '\n');
text = text.replace(/\s*isMuted: 'isMuted',\n/g, '\n');

// ---- Remove CORE_SETTINGS_DEFAULTS entries ----
text = text.replace(/\s*\[CORE_SETTINGS_MAP\.isMuted\]: false,\n/g, '\n');
text = text.replace(/\s*\[CORE_SETTINGS_MAP\.persistentVolumeLvl\]: 0\.5,\n/g, '\n');
text = text.replace(/\s*\[CORE_SETTINGS_MAP\.providersPriority\]: \(\s*\n[\s\S]*?\),\n/m, '\n');
text = text.replace(/\s*\[CORE_SETTINGS_MAP\.videoLanguagePreferredID\]: '1',\n/g, '\n');

// Remove the providersPriority validation block
text = text.replace(/\s*if \(\s*\n\s*Object\.keys\(VIDEO_PROVIDERS_IDS\)[\s\S]*?coreSettings\[CORE_SETTINGS_MAP\.providersPriority\][\s\S]*?;\s*\n\s*\}\n/m, '\n');

// ---- Remove MAIN_SETTINGS_MAP entries ----
text = text.replace(/\s*overrideDoubletapBehavior: 'overrideDoubletapBehavior',\n/g, '\n');
text = text.replace(/\s*playbackPositionMemory: 'playbackPositionMemory',\n/g, '\n');

// ---- Remove MAIN_SETTINGS_DEFAULTS entries ----
text = text.replace(/\s*\[MAIN_SETTINGS_MAP\.overrideDoubletapBehavior\]: true,\n/g, '\n');
text = text.replace(/\s*\[MAIN_SETTINGS_MAP\.playbackPositionMemory\]: true,\n/g, '\n');

// ---- Remove ADVANCED_SETTINGS_MAP entries ----
text = text.replace(/\s*doubletapDistanceThresholdPx: 'doubletapDistanceThresholdPx',\n/g, '\n');
text = text.replace(/\s*doubletapTimingThresholdMs: 'doubletapTimingThresholdMs',\n/g, '\n');
text = text.replace(/\s*markWatchedAfterS: 'markWatchedAfterS',\n/g, '\n');
text = text.replace(/\s*playbackPositionExpirationDays: 'playbackPositionExpirationDays',\n/g, '\n');
text = text.replace(/\s*preloadOtherProviders: 'preloadOtherProviders',\n/g, '\n');
text = text.replace(/\s*showSkipIntroButton: 'showSkipIntroButton',\n/g, '\n');
text = text.replace(/\s*showSkipIntroButtonSeconds: 'showSkipIntroButtonSeconds',\n/g, '\n');
text = text.replace(/\s*showDeviceSpecificSettings: 'showDeviceSpecificSettings',\n/g, '\n');

// ---- Remove ADVANCED_SETTINGS_DEFAULTS entries ----
text = text.replace(/\s*\[ADVANCED_SETTINGS_MAP\.doubletapDistanceThresholdPx\]: 50,\n/g, '\n');
text = text.replace(/\s*\[ADVANCED_SETTINGS_MAP\.doubletapTimingThresholdMs\]: 300,\n/g, '\n');
text = text.replace(/\s*\[ADVANCED_SETTINGS_MAP\.markWatchedAfterS\]: 0,\n/g, '\n');
text = text.replace(/\s*\[ADVANCED_SETTINGS_MAP\.playbackPositionExpirationDays\]: 30,\n/g, '\n');
text = text.replace(/\s*\[ADVANCED_SETTINGS_MAP\.preloadOtherProviders\]: true,\n/g, '\n');
text = text.replace(/\s*\[ADVANCED_SETTINGS_MAP\.showSkipIntroButton\]: true,\n/g, '\n');
text = text.replace(/\s*\[ADVANCED_SETTINGS_MAP\.showSkipIntroButtonSeconds\]: 240,\n/g, '\n');
text = text.replace(/\s*\[ADVANCED_SETTINGS_MAP\.showDeviceSpecificSettings\]: false,\n/g, '\n');

// ---- Remove MARK_CURRENT_VIDEO_WATCHED from IframeMessenger.messages ----
text = text.replace(/\s*MARK_CURRENT_VIDEO_WATCHED: 'MARK_CURRENT_VIDEO_WATCHED',\n/g, '\n');

// ---- Remove MARK_CURRENT_VIDEO_WATCHED case from handleIframeMessages ----
text = text.replace(/\s*case IframeMessenger\.messages\.MARK_CURRENT_VIDEO_WATCHED: \{[\s\S]*?break;\n\s*\}\n/m, '\n');

// ---- Remove MARK_CURRENT_VIDEO_WATCHED registerSendCommand ----
text = text.replace(/\s*this\.commLink\.registerSendCommand\(IframeMessenger\.messages\.MARK_CURRENT_VIDEO_WATCHED\);\n/g, '\n');

// ---- Remove isMuted reference in handleAutoplay ----
text = text.replace(/\s*\/\/ Restore setting altered by forced mute\.\n\s*\/\/ See this\.setupPersistentVolume\(\)\n\s*setTimeout\(\(\) => \(coreSettings\[CORE_SETTINGS_MAP\.isMuted\] = false\)\);\n/g, '\n');

// ---- Remove playbackPositionsFix migration from TopScopeInterface constructor ----
text = text.replace(/\s*\/\/ Ugly shitcode fix for a playback positions[\s\S]*?GM_setValue\('playbackPositionsMemory482wereFixed', true\);\n\s*\}\n/m, '\n');

// ---- Remove waitForWatchedFunction from top-scope init ----
text = text.replace(/\s*\/\/ Remove the website logic responsible for marking episodes as watched\.[\s\S]*?\(\)\(\)\);\n\s*\}/m, '');

// ================================================================
// SETTINGS PANEL UI REMOVALS
// ================================================================

// Remove "Display" section (showSkipIntroButton, showSkipIntroButtonSeconds)
text = text.replace(/\s*\/\/ Display Section \(moved from Advanced\)\n[\s\S]*?preferencesTab\.appendChild\(displaySection\);\n/m, '\n');

// Remove playbackPositionMemory toggle from Playback section
text = text.replace(/\s*playbackCard\.appendChild\(createSettingRow\(\n\s*i18n\.playbackPositionMemory,[\s\S]*?\)\);\n/m, '\n');

// Remove markWatchedAfterS row from Timing section
text = text.replace(/\s*timingCard\.appendChild\(createSettingRow\(\n\s*i18n\.markWatchedAfter,[\s\S]*?\)\);\n/m, '\n');

// Remove playbackPositionExpiration row from Timing section
text = text.replace(/\s*timingCard\.appendChild\(createSettingRow\(\n\s*i18n\.playbackPositionExpiration,[\s\S]*?\)\);\n/m, '\n');

// Unwrap IS_MOBILE guard from largeSkipCooldown in timing section (always show it)
text = text.replace(
  /if \(!IS_MOBILE \|\| advancedSettings\[ADVANCED_SETTINGS_MAP\.showDeviceSpecificSettings\]\) \{\n(\s*timingCard\.appendChild\(createSettingRow\(\n\s*i18n\.introSkipCooldown[\s\S]*?\)\);\n\s*)\}/m,
  '$1'
);

// Remove preloadOtherProviders row from Behavior section
text = text.replace(/\s*behaviorCard\.appendChild\(createSettingRow\(\n\s*i18n\.preloadOtherProviders,[\s\S]*?\)\);\n/m, '\n');

// Remove overrideDoubletapBehavior conditional block from Behavior section
text = text.replace(/\s*if \(IS_MOBILE \|\| advancedSettings\[ADVANCED_SETTINGS_MAP\.showDeviceSpecificSettings\]\) \{[\s\S]*?overrideDoubletapBehavior[\s\S]*?\}\n/m, '\n');

// Remove showDeviceSpecificSettings row from Behavior section
text = text.replace(/\s*behaviorCard\.appendChild\(createSettingRow\(\n\s*i18n\.showDeviceSpecificSettings,[\s\S]*?\)\);\n/m, '\n');

// Unwrap hotkeys section IS_MOBILE guard (always show on desktop)
text = text.replace(
  /if \(!IS_MOBILE \|\| advancedSettings\[ADVANCED_SETTINGS_MAP\.showDeviceSpecificSettings\]\) \{\n(\s*const \{ section: hotkeysSection[\s\S]*?advancedTab\.appendChild\(hotkeysSection\);\n\s*)\}/m,
  '$1'
);

// ================================================================
// IS_SAFARI SIMPLIFICATIONS
// ================================================================

// In handleTopScopeMessages: remove IS_SAFARI check for FULLSCREEN_STATE
text = text.replace(/(\s*case TopScopeInterface\.messages\.FULLSCREEN_STATE: \{\n)\s*if \(IS_SAFARI\) break;\n/m, '$1');

// Replace IS_SAFARI ternary for isInFullscreen in adaptFakeFullscreen
text = text.replace(
  /\/\/ Consider landscape mode as fullscreen on Safari\n\s*const isInFullscreen = \(\s*\n\s*IS_SAFARI \? window\.innerWidth > window\.innerHeight : !!document\.fullscreenElement\n\s*\);/m,
  'const isInFullscreen = !!document.fullscreenElement;'
);

// Simplify IS_SAFARI in TopScopeInterface.init
text = text.replace(
  /if \(IS_SAFARI\) \{\s*\n\s*this\.adaptFakeFullscreen\(\);\s*\n\s*window\.addEventListener\('orientationchange'[\s\S]*?\} else \{\n(\s*document\.addEventListener\('fullscreenchange'[\s\S]*?\}\);\n\s*)\}/m,
  '$1'
);

// Remove IS_SAFARI check for TOGGLE_FULLSCREEN handler
text = text.replace(
  /(case IframeMessenger\.messages\.TOGGLE_FULLSCREEN: \{\n)\s*if \(IS_SAFARI\) break;\n/m,
  '$1'
);

// Remove IS_SAFARI check for REQUEST_FULLSCREEN_STATE
text = text.replace(
  /(case IframeMessenger\.messages\.REQUEST_FULLSCREEN_STATE: \{\n)\s*if \(IS_SAFARI\) break;\n/m,
  '$1'
);

// Simplify fsBtn replacement (remove IS_SAFARI branch)
text = text.replace(/\s*IS_SAFARI \? fsBtn\.remove\(\) : fsBtn\.replaceWith\(newFsBtn\);/g, '\n                    fsBtn.replaceWith(newFsBtn);');

// Unwrap "if (IS_SAFARI === false)" blocks
text = text.replace(/\s*if \(IS_SAFARI === false\) \{\n([\s\S]*?)\n\s*\}/gm, (match, inner) => {
  // Only replace if this is the fullscreen button listener block
  if (inner.includes('TOGGLE_FULLSCREEN') || inner.includes('REQUEST_FULLSCREEN_STATE')) {
    return '\n' + inner;
  }
  return match;
});

// Remove IS_MOBILE blocks: keep desktop path (contextmenu) for settings pane toggle
text = text.replace(
  /\s*if \(IS_MOBILE\) \{\s*\n\s*autoplayBtn\.oncontextmenu = \(\) => false;\s*\n\s*detectHold\(autoplayBtn, toggleSettingsPane\);\s*\n\s*\} else \{\s*\n(\s*autoplayBtn\.oncontextmenu = toggleSettingsPane;\s*\n)\s*\}/gm,
  '\n$1'
);

// Remove Safari webkit CSS for video controls
text = text.replace(
  /\s*\/\/ Attempt to fix a Safari bug when the video controls get duplicated\s*\n\s*GM_addStyle\(`\s*\n\s*video::[\s\S]*?`\);\s*\n/m,
  '\n'
);
// Remove playsinline attributes
text = text.replace(
  /\s*\/\/ Prevent fullscreen triggering by a playback start, on Safari\s*\n\s*player\.setAttribute\('playsinline', ''\);\s*\n\s*player\.setAttribute\('webkit-playsinline', ''\);\s*\n/m,
  '\n'
);

// ================================================================
// GOTO NEXT VIDEO - SIMPLIFY PROVIDER SELECTION
// ================================================================

// New S.to layout in goToNextVideo: replace language+provider block with simple first-available
text = text.replace(
  /\/\/ New S\.to layout - setup provider click handlers\s*\n\s*this\.setupNewStoProviderHandlers\(\);\s*\n\s*\n\s*\/\/ Get selected language[\s\S]*?document\.querySelector\('#player-iframe'\)\.src = nextVideoHref;\s*\n\s*console\.log\('\[Autoplay\] Successfully changed iframe src to:', nextVideoHref\);/m,
  `// New S.to layout - setup provider click handlers
                        this.setupNewStoProviderHandlers();

                        const allNewStoButtons = [...document.querySelectorAll('#episode-links .link-box')];
                        const nextVideoHref = allNewStoButtons[0]?.dataset.playUrl || null;

                        if (!nextVideoHref) throw new Error('Embedded providers are missing or not supported');

                        document.querySelector('#player-iframe').src = nextVideoHref;
                        console.log('[Autoplay] Successfully changed iframe src to:', nextVideoHref);`
);

// Old layout in goToNextVideo: replace language+provider block
text = text.replace(
  /\/\/ Old layout - The website code copypasta[\s\S]*?let nextVideoLink = null;\s*\n\s*\n\s*if \(preferredProvidersButtons\.length\) \{[\s\S]*?\}\s*\n\s*\}\s*\n\s*let nextVideoHref = nextVideoLink\?\.href;\s*\n\s*\/\/ VOE has an additional redirect page,[\s\S]*?if \(!nextVideoHref\) throw new Error\('Embedded providers are missing or not supported'\);/m,
  `// Old layout - find first available provider
                        (function repairWebsiteFeatures() {
                            document.querySelectorAll(Q.providerChangeBtn).forEach((btn) => {
                                btn.addEventListener('click', (ev) => {
                                    ev.preventDefault();
                                    const parent = btn.parentElement;
                                    const linkTarget = parent.getAttribute('data-link-target');
                                    const hosterTarget = parent.getAttribute('data-external-embed') === 'true';
                                    const fakePlayer = document.querySelector('.fakePlayer');
                                    const inSiteWebStream = document.querySelector('.inSiteWebStream');
                                    const iframe = inSiteWebStream.querySelector('iframe');
                                    if (hosterTarget) {
                                        fakePlayer.style.display = 'block';
                                        inSiteWebStream.style.display = 'inline-block';
                                        iframe.style.display = 'none';
                                    } else {
                                        fakePlayer.style.display = 'none';
                                        inSiteWebStream.style.display = 'inline-block';
                                        iframe.src = linkTarget;
                                        iframe.style.display = 'inline-block';
                                    }
                                });
                            });
                        }());

                        const allOldProviderButtons = [...document.querySelectorAll(TopScopeInterface.queries.providerChangeBtn)];
                        const nextVideoLink = allOldProviderButtons[0]?.firstElementChild;
                        let nextVideoHref = nextVideoLink?.href;

                        // VOE has an additional redirect page,
                        // so need to extract the video href from there first
                        // in order to keep VOE-to-VOE autoplay unmuted
                        if (nextVideoHref) {
                            const providerNameEl = nextVideoLink.querySelector(TopScopeInterface.queries.providerName);
                            if (providerNameEl?.innerText === VIDEO_PROVIDERS_MAP.VOE) {
                                const corsProxy = advancedSettings[ADVANCED_SETTINGS_MAP.corsProxy];
                                if (corsProxy) {
                                    const redirectText = await (await fetch(corsProxy + nextVideoLink.href)).text();
                                    const match = /location\\.href = '(https:\\/\\/.+)';/.exec(redirectText);
                                    if (match) nextVideoHref = match[1];
                                }
                            }
                        }

                        if (!nextVideoHref) throw new Error('Embedded providers are missing or not supported');`
);

// ================================================================
// TOP-SCOPE INIT - SIMPLIFY LANGUAGE/PROVIDER SELECTION
// ================================================================

// New S.to layout: replace complex language/provider init with simple handler setup
text = text.replace(
  /if \(newStoLayout\) \{\s*\n\s*\/\/ New S\.to layout - wait for provider buttons[\s\S]*?\/\/ Find preferred provider and click it\s*\n\s*for \(const id of coreSettings\[CORE_SETTINGS_MAP\.providersPriority\]\)[\s\S]*?\}\s*\n\s*\} else \{/m,
  `if (newStoLayout) {
            // New S.to layout - set up provider click handlers
            await new Promise((resolve) => {
                waitForElement('#episode-links .link-box', {
                    existing: true,
                    onceOnly: true,
                    callbackOnTimeout: true,
                    timeout: 10 * 1000,
                }, resolve);
            });
            await sleep();
            topScopeInterface.setupNewStoProviderHandlers();
        } else {`
);

// Old layout: remove language/provider selection from init
text = text.replace(
  /\/\/ Old layout - Wait for the website main code to finish\s*\n\s*await new Promise\(\(resolve\) => \{[\s\S]*?await sleep\(\);\s*\n\s*const \{\s*\n?\s*selectedLanguage\s*\n?\s*\} = topScopeInterface\.updateVideoLanguageProcessing\(\);[\s\S]*?\}\s*\n\s*\}/m,
  `// Old layout - Wait for the website main code to finish
                await new Promise((resolve) => {
                    waitForElement(TopScopeInterface.queries.selectedLanguageBtn, {
                        existing: true,
                        onceOnly: true,
                        callbackOnTimeout: true,
                        timeout: 10 * 1000,
                    }, resolve);
                });
                // Let the website handle the default provider selection
            }`
);

// ================================================================
// I18N CLEANUP
// ================================================================

// Simplify firstRunInfoText (both en and de)
text = text.replace(
  /firstRunInfoText: \(isMobile, largeSkipKey\) => `[^`]+`,/g,
  "firstRunInfoText: () => `Right click the toggle button to open autoplay settings. Fullscreen is scrollable, allowing to switch providers on the go`,");

// De version - find after en was already replaced
// Actually we do both in one pass since both have the same pattern
// Update call site
text = text.replace(
  /i18n\.firstRunInfoText\(IS_MOBILE, hotkeysSettings\[HOTKEYS_SETTINGS_MAP\.largeSkip\]\)/g,
  'i18n.firstRunInfoText()'
);

// Remove i18n keys (both en and de - pattern works for both)
const i18nKeysToRemove = [
  'playbackPositionMemory',
  'playbackPositionMemoryTooltip',
  'markWatchedAfter',
  'markWatchedAfterTooltip',
  'overrideDoubletapBehavior',
  'overrideDoubletapBehaviorTooltip',
  'showSkipIntroButton',
  'showSkipIntroButtonTooltip',
  'showSkipIntroButtonSeconds',
  'showSkipIntroButtonSecondsTooltip',
  'doubleTapTimingThreshold',
  'doubleTapTimingThresholdTooltip',
  'doubleTapDistanceThreshold',
  'doubleTapDistanceThresholdTooltip',
  'introSkipCooldown',
  'introSkipCooldownTooltip',
  'playbackPositionExpiration',
  'playbackPositionExpirationTooltip',
  'providersPriority',
  'showDeviceSpecificSettings',
  'showDeviceSpecificSettingsTooltip',
  'preloadOtherProviders',
  'preloadOtherProvidersTooltip',
];
i18nKeysToRemove.forEach(key => {
  // Match: key: 'single line string', or key: `multiline...`,
  const re = new RegExp(`\\s*${key}: [^\n,]+,\\n`, 'g');
  text = text.replace(re, '\n');
  // Also match function-style values
  const reFn = new RegExp(`\\s*${key}: \\([^)]*\\) => [^\n]+,\\n`, 'g');
  text = text.replace(reFn, '\n');
});

// ================================================================
// FINAL CLEANUP
// ================================================================
text = text.replace(/\n{4,}/g, '\n\n\n');

writeFileSync(DEST, text, 'utf8');
const outLines = text.split('\n').length;
console.log('Output lines:', outLines);
console.log('Done!');
