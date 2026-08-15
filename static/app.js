/**
 * Wavyn — YouTube Music Premium Experience
 * Crossfade, Sleep Timer, Smart Shuffle, Related Songs,
 * Up Next, EQ, Chip Filters, Immersive Player
 */

// ═══════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════

const S = {
    queue: [],
    idx: -1,
    playing: false,
    shuffle: false,
    repeat: 'off', // off|all|one
    volume: 0.8,
    crossfade: false,
    crossfadeDur: 5, // seconds
    sleepTimer: null,
    sleepEndOfSong: false,
    eqPreset: 'flat',
    bassBoost: false,
    liked: new Set(),
};

// ═══════════════════════════════════════════════════════════════════════════
// DOM
// ═══════════════════════════════════════════════════════════════════════════

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

const audio = $('#audioPlayer');
const audioNext = $('#audioPlayerNext');

// Mini Player
const miniPlayer = $('#miniPlayer');
const miniInner = $('#miniPlayerInner');
const miniImg = $('#miniImg');
const miniArt = $('#miniArt');
const miniTitle = $('#miniTitle');
const miniSubtitle = $('#miniSubtitle');
const miniPlayBtn = $('#miniPlayBtn');
const miniPlayIcon = $('#miniPlayIcon');
const miniPauseIcon = $('#miniPauseIcon');
const miniNextBtn = $('#miniNextBtn');
const miniProgressFill = $('#miniProgressFill');

// Immersive Player
const ipEl = $('#immersivePlayer');
const ipBg = $('#ipBg');
const ipImg = $('#ipImg');
const ipArt = $('#ipArt');
const ipTitle = $('#ipTitle');
const ipArtist = $('#ipArtist');
const ipCollapse = $('#ipCollapse');
const ipPlayBtn = $('#ipPlayBtn');
const ipPlayIcon = $('#ipPlayIcon');
const ipPauseIcon = $('#ipPauseIcon');
const ipPrev = $('#ipPrev');
const ipNext = $('#ipNext');
const ipShuffle = $('#ipShuffle');
const ipRepeat = $('#ipRepeat');
const ipLike = $('#ipLike');
const ipProgressBar = $('#ipProgressBar');
const ipProgressPlayed = $('#ipProgressPlayed');
const ipProgressKnob = $('#ipProgressKnob');
const ipTimeLeft = $('#ipTimeLeft');
const ipTimeRight = $('#ipTimeRight');
const ipUpnextList = $('#ipUpnextList');
const ipRelatedList = $('#ipRelatedList');
const ipLyrics = $('#ipLyrics');

// Search
const searchInput = $('#searchInput');
const searchClear = $('#searchClear');
const searchResults = $('#searchResults');

// Grids
const quickPicksGrid = $('#quickPicksGrid');
const mixedRow = $('#mixedRow');
const trendingRow = $('#trendingRow');
const artistsRow = $('#artistsRow');
const newReleasesRow = $('#newReleasesRow');
const libraryList = $('#libraryList');

// Modals
const timerModal = $('#timerModal');
const eqModal = $('#eqModal');

const loader = $('#loader');

// ═══════════════════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    setupNav();
    setupMiniPlayer();
    setupImmersivePlayer();
    setupSearch();
    setupChipFilters();
    setupSleepTimer();
    setupEQ();
    setupCrossfade();
    setupKeyboard();
    loadHome();
    audio.volume = S.volume;
});

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════

function setupNav() {
    $$('.nav-tab').forEach(t => t.addEventListener('click', () => goPage(t.dataset.page)));
    $('#headerSearchBtn').addEventListener('click', () => goPage('search'));
}

function goPage(page) {
    $$('.nav-tab').forEach(t => t.classList.toggle('active', t.dataset.page === page));
    $$('.page').forEach(p => p.classList.remove('active'));
    const el = $(`#${page}Page`);
    if (el) { el.classList.add('active'); el.scrollTop = 0; }
    if (page === 'search') setTimeout(() => searchInput?.focus(), 150);
}
window.goPage = goPage;

// ═══════════════════════════════════════════════════════════════════════════
// CHIP FILTERS
// ═══════════════════════════════════════════════════════════════════════════

function setupChipFilters() {
    const chips = $('#homeChips');
    if (!chips) return;
    chips.addEventListener('click', e => {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        chips.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const filter = chip.dataset.filter;
        if (filter === 'all') loadHome();
        else handleMood(filter + ' songs hindi');
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// HOME LOADING
// ═══════════════════════════════════════════════════════════════════════════

async function loadHome() {
    await Promise.allSettled([
        loadShelfGrid('Top Hindi Songs', quickPicksGrid, '_quickPicks'),
        loadShelfRow('Trending Bollywood 2024', mixedRow, '_mixed'),
        loadShelfRow('Latest Hindi Hits', trendingRow, '_trending'),
        loadShelfRow('New Releases Hindi', newReleasesRow, '_newReleases'),
        loadArtists(),
    ]);
}

async function loadShelfGrid(query, container, key) {
    try {
        const res = await fetch(`/api/search/songs?query=${encodeURIComponent(query)}&limit=9`);
        const d = await res.json();
        if (d.success && d.data.results.length) {
            S[key] = d.data.results;
            container.innerHTML = d.data.results.map((s, i) => {
                const img = bestImg(s.image);
                const artists = getArtists(s);
                return `<div class="sg-item" onclick="playFrom('${key}',${i})">
                    <div class="sg-art"><img src="${img}" loading="lazy"></div>
                    <div class="sg-info">
                        <div class="sg-title">${esc(s.name||'')}</div>
                        <div class="sg-subtitle">${esc(artists)}</div>
                    </div>
                </div>`;
            }).join('');
        }
    } catch(e){}
}

async function loadShelfRow(query, container, key) {
    try {
        const res = await fetch(`/api/search/songs?query=${encodeURIComponent(query)}&limit=12`);
        const d = await res.json();
        if (d.success && d.data.results.length) {
            S[key] = d.data.results;
            container.innerHTML = d.data.results.map((s, i) => {
                const img = bestImg(s.image);
                const artists = getArtists(s);
                return `<div class="sc-card" onclick="playFrom('${key}',${i})">
                    <div class="sc-art">
                        <img src="${img}" loading="lazy">
                        <div class="sc-play-overlay"><svg width="36" height="36" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg></div>
                    </div>
                    <div class="sc-title">${esc(s.name||'')}</div>
                    <div class="sc-subtitle">${esc(artists)}</div>
                </div>`;
            }).join('');
        }
    } catch(e){}
}

async function loadArtists() {
    const names = ['Arijit Singh','Shreya Ghoshal','Pritam','AP Dhillon','Diljit Dosanjh','Atif Aslam','Neha Kakkar','Jubin Nautiyal'];
    try {
        const res = await fetch('/api/search/artists?query=Bollywood Singers&limit=8');
        const d = await res.json();
        if (d.success && d.data.results.length) {
            artistsRow.innerHTML = d.data.results.map(a => {
                const img = bestImg(a.image);
                return `<div class="sc-card" onclick="searchAndPlay('${esc(a.name||'')}')">
                    <div class="sc-art"><img src="${img||''}" loading="lazy"></div>
                    <div class="sc-title">${esc(a.name||'')}</div>
                    <div class="sc-subtitle">Artist</div>
                </div>`;
            }).join('');
        } else { fallbackArtists(names); }
    } catch(e) { fallbackArtists(names); }
}

function fallbackArtists(names) {
    artistsRow.innerHTML = names.map(n =>
        `<div class="sc-card" onclick="searchAndPlay('${esc(n)}')">
            <div class="sc-art" style="display:flex;align-items:center;justify-content:center;font-size:2rem;background:var(--bg-3)">🎤</div>
            <div class="sc-title">${esc(n)}</div>
            <div class="sc-subtitle">Artist</div>
        </div>`
    ).join('');
}

// ═══════════════════════════════════════════════════════════════════════════
// PLAY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function playFrom(key, i) {
    const songs = S[key];
    if (!songs || !songs.length) return;
    S.queue = [...songs];
    S.idx = i;
    playCurrent();
    updateUpNext();
    updateLibrary();
}
window.playFrom = playFrom;

async function searchAndPlay(query) {
    showLoader(true);
    try {
        const res = await fetch(`/api/search/songs?query=${encodeURIComponent(query)}&limit=20`);
        const d = await res.json();
        if (d.success && d.data.results.length) {
            S.queue = d.data.results;
            S.idx = 0;
            playCurrent();
            updateUpNext();
            updateLibrary();
        }
    } catch(e){}
    showLoader(false);
}
window.searchAndPlay = searchAndPlay;

async function handleMood(query) {
    goPage('search');
    searchInput.value = query;
    searchClear.classList.add('visible');
    await performSearch(query);
}
window.handleMood = handleMood;

function playFromQueue(i) {
    S.idx = i;
    playCurrent();
    updateUpNext();
}
window.playFromQueue = playFromQueue;

function playFromSearch(i) {
    S.queue = S._searchResults || [];
    S.idx = i;
    playCurrent();
    updateUpNext();
    updateLibrary();
}
window.playFromSearch = playFromSearch;

// ═══════════════════════════════════════════════════════════════════════════
// PLAYBACK ENGINE
// ═══════════════════════════════════════════════════════════════════════════

function playCurrent() {
    const song = S.queue[S.idx];
    if (!song) return;

    const url = bestUrl(song.downloadUrl);
    if (!url) { playNext(); return; }

    // Crossfade out current if enabled
    if (S.crossfade && S.playing && audio.src) {
        crossfadeOut(audio);
    }

    audio.src = url;
    audio.play().then(() => {
        S.playing = true;
        updateAllUI(song);
        loadRelated(song.id);
    }).catch(() => {
        S.playing = false;
        updatePlayIcons();
    });
}

function togglePlay() {
    if (!audio.src || !S.queue.length) return;
    if (S.playing) { audio.pause(); S.playing = false; }
    else { audio.play().catch(()=>{}); S.playing = true; }
    updatePlayIcons();
    updateArtSpin();
}

function playNext() {
    if (!S.queue.length) return;
    if (S.repeat === 'one') { audio.currentTime = 0; audio.play(); return; }

    // Sleep timer: end of song
    if (S.sleepEndOfSong) { stopPlayback(); S.sleepEndOfSong = false; return; }

    let next;
    if (S.shuffle) { next = Math.floor(Math.random() * S.queue.length); }
    else { next = S.idx + 1; }

    if (next >= S.queue.length) {
        if (S.repeat === 'all') next = 0;
        else { stopPlayback(); return; }
    }
    S.idx = next;
    playCurrent();
    updateUpNext();
}

function playPrev() {
    if (!S.queue.length) return;
    if (audio.currentTime > 3) { audio.currentTime = 0; return; }
    let prev = S.idx - 1;
    if (prev < 0) prev = S.repeat === 'all' ? S.queue.length - 1 : 0;
    S.idx = prev;
    playCurrent();
    updateUpNext();
}

function stopPlayback() {
    audio.pause();
    S.playing = false;
    updatePlayIcons();
    updateArtSpin();
}

// ═══════════════════════════════════════════════════════════════════════════
// CROSSFADE
// ═══════════════════════════════════════════════════════════════════════════

function setupCrossfade() {
    const btn = $('#ipCrossfadeBtn');
    btn.addEventListener('click', () => {
        S.crossfade = !S.crossfade;
        btn.classList.toggle('active', S.crossfade);
    });

    // Pre-load next song near end for crossfade
    audio.addEventListener('timeupdate', () => {
        if (S.crossfade && audio.duration && (audio.duration - audio.currentTime) <= S.crossfadeDur) {
            preloadNext();
        }
    });
}

let preloaded = false;
function preloadNext() {
    if (preloaded) return;
    const nextIdx = S.idx + 1 < S.queue.length ? S.idx + 1 : (S.repeat === 'all' ? 0 : -1);
    if (nextIdx === -1) return;
    const song = S.queue[nextIdx];
    if (!song) return;
    const url = bestUrl(song.downloadUrl);
    if (url) { audioNext.src = url; audioNext.load(); preloaded = true; }
}

function crossfadeOut(el) {
    let vol = el.volume;
    const fadeInterval = setInterval(() => {
        vol -= 0.05;
        if (vol <= 0) { el.pause(); el.volume = S.volume; clearInterval(fadeInterval); }
        else el.volume = vol;
    }, S.crossfadeDur * 1000 / 20);
}

audio.addEventListener('ended', () => { preloaded = false; playNext(); });

// ═══════════════════════════════════════════════════════════════════════════
// SLEEP TIMER
// ═══════════════════════════════════════════════════════════════════════════

function setupSleepTimer() {
    const btn = $('#ipTimerBtn');
    const modal = timerModal;
    const options = $('#timerOptions');
    const cancel = $('#timerCancel');
    const activeDiv = $('#timerActive');
    const countdown = $('#timerCountdown');
    const stopBtn = $('#timerStop');

    btn.addEventListener('click', () => modal.classList.add('open'));
    cancel.addEventListener('click', () => modal.classList.remove('open'));
    modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });

    options.addEventListener('click', e => {
        const opt = e.target.closest('.timer-opt');
        if (!opt) return;
        const mins = parseInt(opt.dataset.mins);

        options.querySelectorAll('.timer-opt').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');

        if (mins === 0) {
            // End of current song
            S.sleepEndOfSong = true;
            activeDiv.style.display = 'block';
            countdown.textContent = 'End of song';
            btn.classList.add('active');
        } else {
            S.sleepEndOfSong = false;
            startSleepCountdown(mins);
            btn.classList.add('active');
        }
        modal.classList.remove('open');
    });

    stopBtn.addEventListener('click', () => {
        clearSleepTimer();
        btn.classList.remove('active');
        activeDiv.style.display = 'none';
        options.querySelectorAll('.timer-opt').forEach(o => o.classList.remove('active'));
    });
}

function startSleepCountdown(mins) {
    clearSleepTimer();
    const activeDiv = $('#timerActive');
    const countdown = $('#timerCountdown');
    activeDiv.style.display = 'block';

    let remaining = mins * 60;
    updateCountdownDisplay(remaining);

    S.sleepTimer = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
            clearSleepTimer();
            stopPlayback();
            activeDiv.style.display = 'none';
            $('#ipTimerBtn').classList.remove('active');
        } else {
            updateCountdownDisplay(remaining);
        }
    }, 1000);
}

function updateCountdownDisplay(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    $('#timerCountdown').textContent = `${m}:${s.toString().padStart(2, '0')}`;
}

function clearSleepTimer() {
    if (S.sleepTimer) { clearInterval(S.sleepTimer); S.sleepTimer = null; }
    S.sleepEndOfSong = false;
}

// ═══════════════════════════════════════════════════════════════════════════
// EQUALIZER (Web Audio API)
// ═══════════════════════════════════════════════════════════════════════════

let audioCtx, sourceNode, gainNode, filters = {};
const EQ_PRESETS = {
    flat: [0,0,0,0,0],
    bass: [8,4,0,-1,-2],
    vocal: [-2,0,4,5,3],
    electronic: [6,3,-2,2,5],
    rock: [5,3,-1,3,4],
};
const EQ_FREQS = [60, 250, 1000, 4000, 12000];
const EQ_BANDS = ['bass','lowMid','mid','highMid','treble'];

function setupEQ() {
    const btn = $('#ipEqBtn');
    const modal = eqModal;
    const close = $('#eqModalClose');
    const toggle = $('#bassToggle');
    const presetsRow = $('#eqPresetsRow');

    btn.addEventListener('click', () => { modal.classList.add('open'); initAudio(); });
    close.addEventListener('click', () => modal.classList.remove('open'));
    modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });

    toggle.addEventListener('click', () => {
        S.bassBoost = !S.bassBoost;
        toggle.classList.toggle('active', S.bassBoost);
        applyPreset(S.bassBoost ? 'bass' : 'flat');
    });

    presetsRow.addEventListener('click', e => {
        const chip = e.target.closest('.eq-chip');
        if (!chip) return;
        presetsRow.querySelectorAll('.eq-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        applyPreset(chip.dataset.eq);
        S.bassBoost = chip.dataset.eq === 'bass';
        toggle.classList.toggle('active', S.bassBoost);
    });

    $$('.eq-range').forEach(slider => {
        slider.addEventListener('input', () => {
            const band = slider.dataset.band;
            const val = parseInt(slider.value);
            if (filters[band]) filters[band].gain.value = val;
            presetsRow.querySelectorAll('.eq-chip').forEach(c => c.classList.remove('active'));
        });
    });
}

function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    sourceNode = audioCtx.createMediaElementSource(audio);
    gainNode = audioCtx.createGain();

    let last = sourceNode;
    EQ_BANDS.forEach((band, i) => {
        const f = audioCtx.createBiquadFilter();
        f.type = i === 0 ? 'lowshelf' : i === 4 ? 'highshelf' : 'peaking';
        if (f.type === 'peaking') f.Q.value = 1.4;
        f.frequency.value = EQ_FREQS[i];
        f.gain.value = 0;
        filters[band] = f;
        last.connect(f);
        last = f;
    });
    last.connect(gainNode);
    gainNode.connect(audioCtx.destination);
}

function applyPreset(name) {
    const vals = EQ_PRESETS[name] || EQ_PRESETS.flat;
    S.eqPreset = name;
    EQ_BANDS.forEach((band, i) => {
        if (filters[band]) filters[band].gain.value = vals[i];
        const slider = $(`.eq-range[data-band="${band}"]`);
        if (slider) slider.value = vals[i];
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// MINI PLAYER
// ═══════════════════════════════════════════════════════════════════════════

function setupMiniPlayer() {
    miniPlayBtn.addEventListener('click', e => { e.stopPropagation(); togglePlay(); });
    miniNextBtn.addEventListener('click', e => { e.stopPropagation(); playNext(); });
    miniInner.addEventListener('click', openPlayer);

    audio.addEventListener('timeupdate', () => {
        if (!audio.duration) return;
        const pct = (audio.currentTime / audio.duration) * 100;
        miniProgressFill.style.width = pct + '%';
        ipProgressPlayed.style.width = pct + '%';
        ipProgressKnob.style.left = `calc(${pct}% - 7px)`;
        ipTimeLeft.textContent = fmtTime(audio.currentTime);
        ipTimeRight.textContent = fmtTime(audio.duration - audio.currentTime);
    });

    audio.addEventListener('loadedmetadata', () => {
        ipTimeRight.textContent = fmtTime(audio.duration);
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// IMMERSIVE PLAYER
// ═══════════════════════════════════════════════════════════════════════════

function setupImmersivePlayer() {
    ipCollapse.addEventListener('click', closePlayer);
    ipPlayBtn.addEventListener('click', togglePlay);
    ipNext.addEventListener('click', () => { playNext(); });
    ipPrev.addEventListener('click', () => { playPrev(); });

    ipShuffle.addEventListener('click', () => {
        S.shuffle = !S.shuffle;
        ipShuffle.classList.toggle('active', S.shuffle);
    });

    ipRepeat.addEventListener('click', () => {
        const modes = ['off','all','one'];
        S.repeat = modes[(modes.indexOf(S.repeat)+1)%3];
        ipRepeat.classList.toggle('active', S.repeat !== 'off');
    });

    ipLike.addEventListener('click', () => {
        const song = S.queue[S.idx];
        if (!song) return;
        if (S.liked.has(song.id)) { S.liked.delete(song.id); ipLike.classList.remove('liked'); }
        else { S.liked.add(song.id); ipLike.classList.add('liked'); }
    });

    // Progress seek
    setupDrag(ipProgressBar, pct => {
        if (audio.duration) audio.currentTime = pct * audio.duration;
    });

    // Tabs
    $$('.ip-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            $$('.ip-tab').forEach(t => t.classList.remove('active'));
            $$('.ip-tab-panel').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            $(`#tab${capitalize(tab.dataset.tab)}`).classList.add('active');
        });
    });

    // Swipe down to close
    let startY = 0;
    ipEl.addEventListener('touchstart', e => { startY = e.touches[0].clientY; }, { passive: true });
    ipEl.addEventListener('touchend', e => {
        if (e.changedTouches[0].clientY - startY > 100) closePlayer();
    }, { passive: true });
}

function openPlayer() { ipEl.classList.add('open'); }
function closePlayer() { ipEl.classList.remove('open'); }

// ═══════════════════════════════════════════════════════════════════════════
// RELATED SONGS / AUTO-QUEUE
// ═══════════════════════════════════════════════════════════════════════════

async function loadRelated(songId) {
    if (!songId) return;
    try {
        const res = await fetch(`/api/songs/${songId}/suggestions?limit=8`);
        const d = await res.json();
        if (d.success && d.data.length) {
            S._related = d.data;
            renderRelated(d.data);
            // Auto-add to queue if low
            if (S.queue.length - S.idx <= 2) {
                const newSongs = d.data.filter(s => !S.queue.find(q => q.id === s.id));
                S.queue.push(...newSongs.slice(0, 5));
                updateUpNext();
            }
        }
    } catch(e) {
        ipRelatedList.innerHTML = '<p class="ip-empty-msg">Could not load related</p>';
    }
}

function renderRelated(songs) {
    ipRelatedList.innerHTML = songs.map((s, i) => {
        const img = bestImg(s.image);
        const artists = getArtists(s);
        return `<div class="upnext-item" onclick="playRelated(${i})">
            <img src="${img}" loading="lazy">
            <div class="upnext-info">
                <div class="upnext-name">${esc(s.name||'')}</div>
                <div class="upnext-artist">${esc(artists)}</div>
            </div>
        </div>`;
    }).join('');
}

function playRelated(i) {
    const songs = S._related || [];
    if (!songs.length) return;
    S.queue = [...S.queue.slice(0, S.idx + 1), ...songs];
    S.idx++;
    playCurrent();
    updateUpNext();
    updateLibrary();
}
window.playRelated = playRelated;

// ═══════════════════════════════════════════════════════════════════════════
// UP NEXT / QUEUE UI
// ═══════════════════════════════════════════════════════════════════════════

function updateUpNext() {
    if (!S.queue.length) {
        ipUpnextList.innerHTML = '<p class="ip-empty-msg">Your queue is empty</p>';
        return;
    }
    ipUpnextList.innerHTML = S.queue.map((s, i) => {
        const img = bestImg(s.image);
        const artists = getArtists(s);
        const active = i === S.idx;
        return `<div class="upnext-item ${active?'active':''}" onclick="playFromQueue(${i})">
            <img src="${img}" loading="lazy">
            <div class="upnext-info">
                <div class="upnext-name">${esc(s.name||'')}</div>
                <div class="upnext-artist">${esc(artists)}</div>
            </div>
            ${active ? '<div class="up-eq"><span></span><span></span><span></span></div>' : ''}
        </div>`;
    }).join('');
}

function updateLibrary() {
    const empty = $('.library-empty');
    if (!S.queue.length) { if (empty) empty.style.display = 'flex'; libraryList.innerHTML = ''; return; }
    if (empty) empty.style.display = 'none';
    libraryList.innerHTML = S.queue.map((s, i) => {
        const img = bestImg(s.image);
        const artists = getArtists(s);
        const active = i === S.idx;
        return `<div class="sg-item ${active?'active':''}" onclick="playFromQueue(${i})">
            <div class="sg-art"><img src="${img}" loading="lazy"></div>
            <div class="sg-info">
                <div class="sg-title" ${active?'style="color:var(--accent)"':''}>${esc(s.name||'')}</div>
                <div class="sg-subtitle">${esc(artists)}</div>
            </div>
        </div>`;
    }).join('');
}

// ═══════════════════════════════════════════════════════════════════════════
// SEARCH
// ═══════════════════════════════════════════════════════════════════════════

function setupSearch() {
    let timeout;
    searchInput.addEventListener('input', () => {
        const q = searchInput.value.trim();
        searchClear.classList.toggle('visible', q.length > 0);
        clearTimeout(timeout);
        if (q.length < 2) { showSearchPlaceholder(); return; }
        timeout = setTimeout(() => performSearch(q), 400);
    });
    searchInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') { clearTimeout(timeout); const q = searchInput.value.trim(); if (q.length>=2) performSearch(q); }
    });
    searchClear.addEventListener('click', () => {
        searchInput.value = ''; searchClear.classList.remove('visible');
        showSearchPlaceholder(); searchInput.focus();
    });

    // Search category chips
    $$('.s-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            $$('.s-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            const q = searchInput.value.trim();
            if (q.length >= 2) performSearch(q);
        });
    });
}

async function performSearch(query) {
    showLoader(true);
    try {
        const res = await fetch(`/api/search/songs?query=${encodeURIComponent(query)}&limit=25`);
        const d = await res.json();
        if (!d.success || !d.data.results.length) {
            searchResults.innerHTML = `<div class="no-results"><h3>No results for "${esc(query)}"</h3><p>Try different keywords</p></div>`;
            return;
        }
        S._searchResults = d.data.results;
        renderSearchResults(d.data.results);
    } catch(e) {
        searchResults.innerHTML = `<div class="no-results"><h3>Something went wrong</h3><p>Check connection</p></div>`;
    } finally { showLoader(false); }
}

function renderSearchResults(songs) {
    let html = `<div class="results-label">Songs · ${songs.length} results</div>`;
    html += songs.map((s, i) => {
        const img = bestImg(s.image);
        const artists = getArtists(s);
        const dur = fmtTime(s.duration||0);
        return `<div class="sg-item" onclick="playFromSearch(${i})">
            <div class="sg-art"><img src="${img}" loading="lazy"></div>
            <div class="sg-info">
                <div class="sg-title">${esc(s.name||'')}</div>
                <div class="sg-subtitle">${esc(artists)} · ${dur}</div>
            </div>
        </div>`;
    }).join('');
    searchResults.innerHTML = html;
}

function showSearchPlaceholder() {
    searchResults.innerHTML = `<div class="search-placeholder">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="currentColor" opacity="0.12"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
        <h3>Search Wavyn Music</h3>
        <p>Discover songs, artists, and albums</p>
    </div>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// UI UPDATES
// ═══════════════════════════════════════════════════════════════════════════

function updateAllUI(song) {
    const img = bestImg(song.image);
    const artists = getArtists(song);

    // Mini
    miniImg.src = img;
    miniImg.onload = () => miniImg.classList.add('loaded');
    miniTitle.textContent = song.name || 'Unknown';
    miniTitle.classList.add('playing');
    miniSubtitle.textContent = artists;

    // Immersive
    ipImg.src = img;
    ipImg.onload = () => ipImg.classList.add('loaded');
    ipTitle.textContent = song.name || 'Unknown';
    ipArtist.textContent = artists;
    ipBg.style.backgroundImage = img ? `url(${img})` : 'none';

    // Like state
    ipLike.classList.toggle('liked', S.liked.has(song.id));

    // Title
    document.title = `${song.name} — Wavyn`;

    updatePlayIcons();
    updateArtSpin();

    // Init audio context on first play
    if (!audioCtx) initAudio();
}

function updatePlayIcons() {
    const p = S.playing;
    miniPlayIcon.style.display = p ? 'none' : 'block';
    miniPauseIcon.style.display = p ? 'block' : 'none';
    ipPlayIcon.style.display = p ? 'none' : 'block';
    ipPauseIcon.style.display = p ? 'block' : 'none';
}

function updateArtSpin() {
    ipArt.classList.toggle('spinning', S.playing);
}

// ═══════════════════════════════════════════════════════════════════════════
// KEYBOARD
// ═══════════════════════════════════════════════════════════════════════════

function setupKeyboard() {
    document.addEventListener('keydown', e => {
        if (e.target.tagName === 'INPUT') return;
        switch(e.code) {
            case 'Space': e.preventDefault(); togglePlay(); break;
            case 'ArrowRight': e.shiftKey ? playNext() : (audio.duration && (audio.currentTime = Math.min(audio.duration, audio.currentTime+10))); break;
            case 'ArrowLeft': e.shiftKey ? playPrev() : (audio.currentTime = Math.max(0, audio.currentTime-10)); break;
            case 'ArrowUp': e.preventDefault(); S.volume = Math.min(1, S.volume+0.05); audio.volume = S.volume; break;
            case 'ArrowDown': e.preventDefault(); S.volume = Math.max(0, S.volume-0.05); audio.volume = S.volume; break;
            case 'Escape': closePlayer(); break;
            case 'KeyF': openPlayer(); break;
        }
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// DRAG HELPER
// ═══════════════════════════════════════════════════════════════════════════

function setupDrag(bar, onUpdate) {
    let dragging = false;
    function calc(e) {
        const rect = bar.getBoundingClientRect();
        const x = e.clientX||(e.touches&&e.touches[0]?e.touches[0].clientX:0);
        return Math.max(0, Math.min(1, (x-rect.left)/rect.width));
    }
    bar.addEventListener('mousedown', e => { dragging=true; onUpdate(calc(e)); });
    document.addEventListener('mousemove', e => { if(dragging) onUpdate(calc(e)); });
    document.addEventListener('mouseup', () => { dragging=false; });
    bar.addEventListener('touchstart', e => { e.preventDefault(); dragging=true; onUpdate(calc(e.touches[0])); }, {passive:false});
    bar.addEventListener('touchmove', e => { e.preventDefault(); if(dragging) onUpdate(calc(e.touches[0])); }, {passive:false});
    bar.addEventListener('touchend', () => { dragging=false; });
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

function bestUrl(urls) {
    if(!urls||!urls.length) return null;
    for(const q of ['320kbps','160kbps','96kbps','48kbps','12kbps']){
        const f=urls.find(d=>d.quality===q&&d.url); if(f) return f.url;
    }
    return urls[urls.length-1]?.url||null;
}

function bestImg(images) {
    if(!images||!images.length) return '';
    for(const q of ['500x500','150x150','50x50']){
        const f=images.find(i=>i.quality===q&&i.url); if(f) return f.url;
    }
    return images[images.length-1]?.url||'';
}

function getArtists(song) {
    if(!song.artists) return 'Unknown';
    const p=song.artists.primary||[];
    if(p.length) return p.map(a=>a.name).filter(Boolean).join(', ');
    const all=song.artists.all||[];
    if(all.length) return all.slice(0,3).map(a=>a.name).filter(Boolean).join(', ');
    return 'Unknown';
}

function fmtTime(sec) {
    if(!sec||isNaN(sec)) return '0:00';
    sec=Math.floor(sec);
    return `${Math.floor(sec/60)}:${(sec%60).toString().padStart(2,'0')}`;
}

function esc(s) {
    if(!s) return '';
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

function capitalize(s) { return s.charAt(0).toUpperCase()+s.slice(1); }

function showLoader(show) { loader.classList.toggle('visible', show); }
