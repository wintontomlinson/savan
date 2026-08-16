/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  SONIQ — Premium Audio Engine                               ║
 * ║  Pre-buffering · Crossfade · 5-Band EQ · Bass Boost         ║
 * ║  Volume Amplifier · Sleep Timer · Smart Shuffle              ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

'use strict';

// ═══════════════════════════════════════════════════════════════════
// AUDIO ENGINE — Dual Deck Architecture
// Deck A and Deck B alternate for gapless crossfade.
// Pre-buffer fetches next 2 songs as Blob URLs for instant playback.
// ═══════════════════════════════════════════════════════════════════

const Engine = (() => {
    const deckA = document.getElementById('deckA');
    const deckB = document.getElementById('deckB');
    let active = deckA;      // currently playing
    let standby = deckB;     // preloaded / fading out
    let fadeTimer = null;
    let bufferCache = {};    // songId -> blobURL

    // Pre-buffer next N songs
    async function prebuffer(queue, currentIdx, count = 2) {
        for (let i = 1; i <= count; i++) {
            const idx = currentIdx + i;
            if (idx >= queue.length) break;
            const song = queue[idx];
            if (!song || bufferCache[song.id]) continue;
            const url = bestUrl(song.downloadUrl);
            if (!url) continue;
            try {
                const resp = await fetch(url);
                if (!resp.ok) continue;
                const blob = await resp.blob();
                bufferCache[song.id] = URL.createObjectURL(blob);
            } catch (e) { /* network issue, skip */ }
        }
    }

    function getSource(song) {
        // Use cached blob if available, else raw URL
        if (bufferCache[song.id]) return bufferCache[song.id];
        return bestUrl(song.downloadUrl);
    }

    function play(song, crossfade, crossfadeDur, volume) {
        const src = getSource(song);
        if (!src) return false;

        if (crossfade && !active.paused && active.currentTime > 0) {
            // Crossfade: fade out active, swap, fade in standby
            _fadeOut(active, crossfadeDur);
            // Swap decks
            const tmp = active;
            active = standby;
            standby = tmp;
            // Play new on (now) active deck
            active.src = src;
            active.volume = 0;
            active.play().then(() => _fadeIn(active, crossfadeDur, volume)).catch(() => {});
        } else {
            // Normal play
            active.src = src;
            active.volume = volume;
            active.play().catch(() => {});
        }
        return true;
    }

    function _fadeIn(el, dur, targetVol) {
        const steps = 25;
        const interval = (dur * 1000) / steps;
        const inc = targetVol / steps;
        let vol = 0;
        clearInterval(fadeTimer);
        el.volume = 0;
        const id = setInterval(() => {
            vol += inc;
            if (vol >= targetVol) { el.volume = targetVol; clearInterval(id); }
            else el.volume = vol;
        }, interval);
    }

    function _fadeOut(el, dur) {
        const steps = 25;
        const interval = (dur * 1000) / steps;
        const dec = el.volume / steps;
        let vol = el.volume;
        const id = setInterval(() => {
            vol -= dec;
            if (vol <= 0) { el.volume = 0; el.pause(); el.currentTime = 0; clearInterval(id); }
            else el.volume = vol;
        }, interval);
    }

    function pause() { active.pause(); }
    function resume(vol) { active.volume = vol; active.play().catch(() => {}); }
    function seek(t) { active.currentTime = t; }
    function getDuration() { return active.duration || 0; }
    function getCurrentTime() { return active.currentTime || 0; }
    function setVolume(v) { active.volume = v; }
    function getActive() { return active; }
    function getBuffered() {
        if (!active.buffered || !active.buffered.length) return 0;
        return active.buffered.end(active.buffered.length - 1);
    }

    function onTimeUpdate(cb) {
        deckA.addEventListener('timeupdate', () => { if (active === deckA) cb(); });
        deckB.addEventListener('timeupdate', () => { if (active === deckB) cb(); });
    }
    function onEnded(cb) {
        deckA.addEventListener('ended', () => { if (active === deckA) cb(); });
        deckB.addEventListener('ended', () => { if (active === deckB) cb(); });
    }
    function onLoadedMeta(cb) {
        deckA.addEventListener('loadedmetadata', () => { if (active === deckA) cb(); });
        deckB.addEventListener('loadedmetadata', () => { if (active === deckB) cb(); });
    }
    function onWaiting(cb) {
        deckA.addEventListener('waiting', () => { if (active === deckA) cb(); });
        deckB.addEventListener('waiting', () => { if (active === deckB) cb(); });
    }
    function onCanPlay(cb) {
        deckA.addEventListener('canplaythrough', () => { if (active === deckA) cb(); });
        deckB.addEventListener('canplaythrough', () => { if (active === deckB) cb(); });
    }

    function clearCache() {
        Object.values(bufferCache).forEach(url => URL.revokeObjectURL(url));
        bufferCache = {};
    }

    return { play, pause, resume, seek, getDuration, getCurrentTime, setVolume, getActive, getBuffered, prebuffer, clearCache, onTimeUpdate, onEnded, onLoadedMeta, onWaiting, onCanPlay };
})();

// ═══════════════════════════════════════════════════════════════════
// EQ ENGINE — Web Audio API
// 5-band parametric EQ + gain (volume amplifier)
// Connected AFTER first user interaction (browser policy)
// ═══════════════════════════════════════════════════════════════════

const EQ = (() => {
    let ctx = null, gain = null, connected = false;
    const filters = [];
    const FREQS = [60, 250, 1000, 4000, 16000];
    const PRESETS = {
        flat: [0, 0, 0, 0, 0],
        bass: [9, 5, 0, -1, -2],
        treble: [-2, 0, 0, 3, 7],
        vocal: [-2, 0, 5, 4, 1],
        electronic: [6, 3, -2, 3, 5],
        rock: [5, 3, -1, 4, 3],
    };

    function init() {
        if (connected) return;
        connected = true;
        
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        const deckA = document.getElementById('deckA');
        const deckB = document.getElementById('deckB');
        
        const srcA = ctx.createMediaElementSource(deckA);
        const srcB = ctx.createMediaElementSource(deckB);

        // Merge both sources into one chain
        const merger = ctx.createGain();
        merger.gain.value = 1;
        srcA.connect(merger);
        srcB.connect(merger);

        // Create filter chain
        gain = ctx.createGain();
        gain.gain.value = 1;

        let last = merger;
        FREQS.forEach((freq, i) => {
            const f = ctx.createBiquadFilter();
            f.type = i === 0 ? 'lowshelf' : i === FREQS.length - 1 ? 'highshelf' : 'peaking';
            if (f.type === 'peaking') f.Q.value = 1.2;
            f.frequency.value = freq;
            f.gain.value = 0;
            filters.push(f);
            last.connect(f);
            last = f;
        });
        last.connect(gain);
        gain.connect(ctx.destination);
    }

    function setBand(index, value) {
        if (!filters[index]) return;
        filters[index].gain.value = value;
    }

    function setGain(val) {
        if (gain) gain.gain.value = val;
    }

    function applyPreset(name) {
        const p = PRESETS[name];
        if (!p) return;
        p.forEach((v, i) => setBand(i, v));
        return p;
    }

    function getPresets() { return PRESETS; }
    function isConnected() { return connected; }
    function resumeCtx() { if (ctx && ctx.state === 'suspended') ctx.resume(); }

    return { init, setBand, setGain, applyPreset, getPresets, isConnected, resumeCtx };
})();

// ═══════════════════════════════════════════════════════════════════
// APP STATE
// ═══════════════════════════════════════════════════════════════════

const S = {
    queue: [],
    idx: -1,
    playing: false,
    shuffle: false,
    repeat: 'off', // off | all | one
    volume: 0.8,
    crossfade: false,
    cfDur: 5,
    bassBoost: false,
    eqPreset: 'flat',
    volBoost: 100, // percent 50-200
    sleepTimer: null,
    sleepEndOfSong: false,
    liked: new Set(),
    buffering: false,
};

// ═══════════════════════════════════════════════════════════════════
// DOM REFS
// ═══════════════════════════════════════════════════════════════════

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// Mini
const miniBody = $('#miniBody');
const miniImg = $('#miniImg');
const miniT = $('#miniT');
const miniA = $('#miniA');
const miniProgFill = $('#miniProgFill');

// FS Player
const fsPlayer = $('#fsPlayer');
const fsBg = $('#fsBg');
const fsImg = $('#fsImg');
const fsArtwork = $('#fsArtwork');
const fsTitle = $('#fsTitle');
const fsArtistName = $('#fsArtistName');
const fsSeekPlayed = $('#fsSeekPlayed');
const fsSeekBuffered = $('#fsSeekBuffered');
const fsSeekThumb = $('#fsSeekThumb');
const fsTimeNow = $('#fsTimeNow');
const fsTimeDur = $('#fsTimeDur');
const fsBufferRing = $('#fsBufferRing');
const fsQueue = $('#fsQueue');

const loader = $('#ld');

// ═══════════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    setupNav();
    setupMini();
    setupFSPlayer();
    setupSearch();
    setupChips();
    setupEQPanel();
    setupSettings();
    setupKeyboard();
    loadHome();
});

// ═══════════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════════

function setupNav() {
    $$('.tn').forEach(b => b.addEventListener('click', () => navTo(b.dataset.p)));
    $('#openSearch').addEventListener('click', () => navTo('search'));
}

function navTo(page) {
    $$('.tn').forEach(b => b.classList.toggle('active', b.dataset.p === page));
    $$('.pg').forEach(p => p.classList.remove('active'));
    const el = $(`#pg${page.charAt(0).toUpperCase()+page.slice(1)}`);
    if (el) { el.classList.add('active'); el.scrollTop = 0; }
    if (page === 'search') setTimeout(() => $('#searchInput')?.focus(), 100);
}
window.navTo = navTo;

// ═══════════════════════════════════════════════════════════════════
// HOME
// ═══════════════════════════════════════════════════════════════════

async function loadHome() {
    await Promise.allSettled([
        loadGrid('Latest Hindi Songs', '#gridPicks', '_picks'),
        loadRow('Trending Bollywood', '#rowTrend', '_trend'),
        loadRow('New Hindi Releases 2024', '#rowNew', '_new'),
        loadArtists(),
    ]);
}

async function loadGrid(q, sel, key) {
    try {
        const r = await fetch(`/api/search/songs?query=${encodeURIComponent(q)}&limit=9`);
        const d = await r.json();
        if (d.success && d.data.results.length) {
            S[key] = d.data.results;
            $(sel).innerHTML = d.data.results.map((s, i) => glItem(s, key, i)).join('');
        }
    } catch (e) {}
}

async function loadRow(q, sel, key) {
    try {
        const r = await fetch(`/api/search/songs?query=${encodeURIComponent(q)}&limit=12`);
        const d = await r.json();
        if (d.success && d.data.results.length) {
            S[key] = d.data.results;
            $(sel).innerHTML = d.data.results.map((s, i) => cardItem(s, key, i)).join('');
        }
    } catch (e) {}
}

async function loadArtists() {
    const names = ['Arijit Singh','Shreya Ghoshal','Pritam','AP Dhillon','Diljit Dosanjh','Atif Aslam'];
    try {
        const r = await fetch('/api/search/artists?query=Hindi Singers&limit=8');
        const d = await r.json();
        if (d.success && d.data.results.length) {
            $('#rowArtists').innerHTML = d.data.results.map(a => {
                const img = bestImg(a.image);
                return `<div class="card" onclick="moodPlay('${esc(a.name||'')}')"><div class="card-art">${img?`<img src="${img}" loading="lazy">`:'<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:var(--bg2);font-size:1.8rem">🎤</div>'}</div><div class="card-t">${esc(a.name||'')}</div><div class="card-s">Artist</div></div>`;
            }).join('');
        } else { fbArtists(names); }
    } catch (e) { fbArtists(names); }
}

function fbArtists(names) {
    $('#rowArtists').innerHTML = names.map(n => `<div class="card" onclick="moodPlay('${esc(n)}')"><div class="card-art" style="display:flex;align-items:center;justify-content:center;background:var(--bg2);font-size:1.8rem">🎤</div><div class="card-t">${esc(n)}</div><div class="card-s">Artist</div></div>`).join('');
}

function glItem(s, key, i) {
    const img = bestImg(s.image);
    const art = getArtists(s);
    return `<div class="gl-item" onclick="playFrom('${key}',${i})"><div class="gl-art"><img src="${img}" loading="lazy"></div><div class="gl-info"><div class="gl-t">${esc(s.name||'')}</div><div class="gl-s">${esc(art)}</div></div></div>`;
}

function cardItem(s, key, i) {
    const img = bestImg(s.image);
    const art = getArtists(s);
    return `<div class="card" onclick="playFrom('${key}',${i})"><div class="card-art"><img src="${img}" loading="lazy"><div class="card-play"><svg width="32" height="32" fill="white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div></div><div class="card-t">${esc(s.name||'')}</div><div class="card-s">${esc(art)}</div></div>`;
}

// ═══════════════════════════════════════════════════════════════════
// CHIPS FILTER
// ═══════════════════════════════════════════════════════════════════

function setupChips() {
    $('#chips').addEventListener('click', e => {
        const c = e.target.closest('.chip');
        if (!c) return;
        $$('#chips .chip').forEach(x => x.classList.remove('active'));
        c.classList.add('active');
        const q = c.dataset.q;
        if (q === 'all') loadHome();
        else moodPlay(q + ' songs hindi');
    });
}

// ═══════════════════════════════════════════════════════════════════
// PLAY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

function playFrom(key, i) {
    const songs = S[key];
    if (!songs || !songs.length) return;
    S.queue = [...songs];
    S.idx = i;
    startPlay();
}
window.playFrom = playFrom;

async function moodPlay(q) {
    showLoader(true);
    try {
        const r = await fetch(`/api/search/songs?query=${encodeURIComponent(q)}&limit=20`);
        const d = await r.json();
        if (d.success && d.data.results.length) {
            S.queue = d.data.results;
            S.idx = 0;
            startPlay();
        }
    } catch (e) {}
    showLoader(false);
}
window.moodPlay = moodPlay;

function playFromQueue(i) { S.idx = i; startPlay(); }
window.playFromQueue = playFromQueue;

function playFromSearch(i) {
    S.queue = S._searchResults || [];
    S.idx = i;
    startPlay();
}
window.playFromSearch = playFromSearch;

function startPlay() {
    const song = S.queue[S.idx];
    if (!song) return;

    // Resume AudioContext if EQ was previously initialized (browser requires user gesture)
    if (EQ.isConnected()) EQ.resumeCtx();

    const ok = Engine.play(song, S.crossfade, S.cfDur, actualVolume());
    if (!ok) { playNext(); return; }

    S.playing = true;
    updateUI(song);
    updateQueue();
    updateLibrary();

    // Pre-buffer next songs in background
    Engine.prebuffer(S.queue, S.idx, 2);

    // Load suggestions to extend queue
    loadSuggestions(song.id);
}

function togglePlay() {
    if (!S.queue.length) return;
    if (S.playing) { Engine.pause(); S.playing = false; }
    else { Engine.resume(actualVolume()); S.playing = true; }
    updatePlayIcons();
    fsArtwork.classList.toggle('spin', S.playing);
}

function playNext() {
    if (!S.queue.length) return;
    if (S.repeat === 'one') { Engine.seek(0); Engine.resume(actualVolume()); return; }
    if (S.sleepEndOfSong) { Engine.pause(); S.playing = false; S.sleepEndOfSong = false; updatePlayIcons(); return; }

    let next;
    if (S.shuffle) next = Math.floor(Math.random() * S.queue.length);
    else next = S.idx + 1;

    if (next >= S.queue.length) {
        if (S.repeat === 'all') next = 0;
        else { Engine.pause(); S.playing = false; updatePlayIcons(); fsArtwork.classList.remove('spin'); return; }
    }
    S.idx = next;
    startPlay();
}

function playPrev() {
    if (!S.queue.length) return;
    if (Engine.getCurrentTime() > 3) { Engine.seek(0); return; }
    let prev = S.idx - 1;
    if (prev < 0) prev = S.repeat === 'all' ? S.queue.length - 1 : 0;
    S.idx = prev;
    startPlay();
}

function actualVolume() {
    // When EQ is connected, gain node handles boost. Audio element just uses base volume.
    // When EQ is NOT connected, we apply boost directly to element volume (capped at 1).
    if (EQ.isConnected()) return S.volume;
    return Math.min(1, (S.volume * S.volBoost) / 100);
}

// ═══════════════════════════════════════════════════════════════════
// SUGGESTIONS / AUTO-QUEUE
// ═══════════════════════════════════════════════════════════════════

async function loadSuggestions(songId) {
    if (!songId) return;
    try {
        const r = await fetch(`/api/songs/${songId}/suggestions?limit=5`);
        const d = await r.json();
        if (d.success && d.data.length) {
            const newSongs = d.data.filter(s => !S.queue.find(q => q.id === s.id));
            if (S.queue.length - S.idx <= 2) {
                S.queue.push(...newSongs.slice(0, 4));
                updateQueue();
            }
        }
    } catch (e) {}
}

// ═══════════════════════════════════════════════════════════════════
// UI UPDATES
// ═══════════════════════════════════════════════════════════════════

function updateUI(song) {
    const img = bestImg(song.image);
    const art = getArtists(song);

    // Mini
    miniImg.src = img;
    miniImg.onload = () => miniImg.classList.add('vis');
    miniT.textContent = song.name || 'Unknown';
    miniT.classList.add('on');
    miniA.textContent = art;

    // FS
    fsImg.src = img;
    fsImg.onload = () => fsImg.classList.add('vis');
    fsTitle.textContent = song.name || 'Unknown';
    fsArtistName.textContent = art;
    fsBg.style.backgroundImage = img ? `url(${img})` : 'none';
    fsArtwork.classList.toggle('spin', S.playing);

    // Like state
    $('#fsHeart').classList.toggle('liked', S.liked.has(song.id));

    document.title = `${song.name} — Soniq`;
    updatePlayIcons();
}

function updatePlayIcons() {
    const p = S.playing;
    $('#mIconPlay').style.display = p ? 'none' : 'block';
    $('#mIconPause').style.display = p ? 'block' : 'none';
    $('#fsIconPlay').style.display = p ? 'none' : 'block';
    $('#fsIconPause').style.display = p ? 'block' : 'none';
}

function updateQueue() {
    if (!S.queue.length) { fsQueue.innerHTML = '<p class="empty-msg">Play a song to build your queue</p>'; return; }
    fsQueue.innerHTML = S.queue.map((s, i) => {
        const img = bestImg(s.image);
        const art = getArtists(s);
        const act = i === S.idx;
        return `<div class="q-item ${act?'act':''}" onclick="playFromQueue(${i})"><img src="${img}" loading="lazy"><div class="q-info"><div class="q-t">${esc(s.name||'')}</div><div class="q-a">${esc(art)}</div></div>${act?'<div class="q-eq"><i></i><i></i><i></i></div>':''}</div>`;
    }).join('');
}

function updateLibrary() {
    const el = $('#libList');
    const emp = $('#libEmpty');
    if (!S.queue.length) { el.innerHTML = ''; emp.style.display = ''; return; }
    emp.style.display = 'none';
    el.innerHTML = S.queue.map((s, i) => glItem(s, '_queue', i).replace("playFrom('_queue',","playFromQueue(")).join('');
    // Mark playing
    S._queue = S.queue; // alias for playFrom
}

// ═══════════════════════════════════════════════════════════════════
// MINI PLAYER
// ═══════════════════════════════════════════════════════════════════

function setupMini() {
    $('#miniPlay').addEventListener('click', e => { e.stopPropagation(); togglePlay(); });
    $('#miniNext').addEventListener('click', e => { e.stopPropagation(); playNext(); });
    miniBody.addEventListener('click', () => openFS());

    // Time updates
    Engine.onTimeUpdate(() => {
        const dur = Engine.getDuration();
        if (!dur) return;
        const pct = (Engine.getCurrentTime() / dur) * 100;
        miniProgFill.style.width = pct + '%';
        fsSeekPlayed.style.width = pct + '%';
        fsSeekThumb.style.left = `calc(${pct}% - 7px)`;
        fsTimeNow.textContent = fmtTime(Engine.getCurrentTime());

        // Buffered
        const buf = Engine.getBuffered();
        if (buf && dur) fsSeekBuffered.style.width = (buf / dur * 100) + '%';
    });

    Engine.onLoadedMeta(() => {
        fsTimeDur.textContent = fmtTime(Engine.getDuration());
    });

    Engine.onEnded(() => playNext());

    Engine.onWaiting(() => {
        S.buffering = true;
        fsBufferRing.classList.add('show');
    });

    Engine.onCanPlay(() => {
        S.buffering = false;
        fsBufferRing.classList.remove('show');
    });
}

// ═══════════════════════════════════════════════════════════════════
// FULL-SCREEN PLAYER
// ═══════════════════════════════════════════════════════════════════

function setupFSPlayer() {
    $('#fsClose').addEventListener('click', closeFS);
    $('#fsPlayBtn').addEventListener('click', togglePlay);
    $('#fsNext').addEventListener('click', playNext);
    $('#fsPrev').addEventListener('click', playPrev);

    $('#fsShuffle').addEventListener('click', () => {
        S.shuffle = !S.shuffle;
        $('#fsShuffle').classList.toggle('on', S.shuffle);
    });

    $('#fsRepeat').addEventListener('click', () => {
        const m = ['off','all','one'];
        S.repeat = m[(m.indexOf(S.repeat)+1)%3];
        $('#fsRepeat').classList.toggle('on', S.repeat !== 'off');
    });

    $('#fsHeart').addEventListener('click', () => {
        const song = S.queue[S.idx];
        if (!song) return;
        if (S.liked.has(song.id)) S.liked.delete(song.id);
        else S.liked.add(song.id);
        $('#fsHeart').classList.toggle('liked', S.liked.has(song.id));
    });

    // Seek bar drag
    dragBar($('#fsSeekBar'), pct => {
        Engine.seek(pct * Engine.getDuration());
    });

    // Tabs
    $$('.fs-tab').forEach(t => {
        t.addEventListener('click', () => {
            $$('.fs-tab').forEach(x => x.classList.remove('active'));
            $$('.fs-panel').forEach(x => x.classList.remove('active'));
            t.classList.add('active');
            $(`#panel${t.dataset.panel.charAt(0).toUpperCase()+t.dataset.panel.slice(1)}`).classList.add('active');
        });
    });

    // Swipe down to close
    let sy = 0;
    fsPlayer.addEventListener('touchstart', e => { sy = e.touches[0].clientY; }, { passive: true });
    fsPlayer.addEventListener('touchend', e => { if (e.changedTouches[0].clientY - sy > 100) closeFS(); }, { passive: true });
}

function openFS() { fsPlayer.classList.add('open'); }
function closeFS() { fsPlayer.classList.remove('open'); }

// ═══════════════════════════════════════════════════════════════════
// EQ PANEL
// ═══════════════════════════════════════════════════════════════════

function setupEQPanel() {
    // Bass toggle
    const bt = $('#bassToggle');
    bt.addEventListener('click', () => {
        S.bassBoost = !S.bassBoost;
        bt.classList.toggle('on', S.bassBoost);
        initEQIfNeeded();
        EQ.applyPreset(S.bassBoost ? 'bass' : S.eqPreset);
        syncSliders(S.bassBoost ? EQ.getPresets().bass : EQ.getPresets()[S.eqPreset]);
    });

    // Presets
    $('#eqPresets').addEventListener('click', e => {
        const pill = e.target.closest('.eq-pill');
        if (!pill) return;
        $$('.eq-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        S.eqPreset = pill.dataset.p;
        initEQIfNeeded();
        const vals = EQ.applyPreset(S.eqPreset);
        syncSliders(vals);
        S.bassBoost = S.eqPreset === 'bass';
        bt.classList.toggle('on', S.bassBoost);
    });

    // Sliders
    $$('.v-slider').forEach(sl => {
        sl.addEventListener('input', () => {
            const band = parseInt(sl.dataset.band);
            initEQIfNeeded();
            EQ.setBand(band, parseInt(sl.value));
            // Deselect preset
            $$('.eq-pill').forEach(p => p.classList.remove('active'));
        });
    });

    // Volume boost
    const vs = $('#volSlider');
    vs.addEventListener('input', () => {
        S.volBoost = parseInt(vs.value);
        $('#volVal').textContent = S.volBoost + '%';
        if (EQ.isConnected()) {
            EQ.setGain(S.volBoost / 100);
        }
        Engine.setVolume(actualVolume());
    });
}

function initEQIfNeeded() {
    if (!EQ.isConnected()) {
        EQ.init();
    }
    EQ.resumeCtx();
}

function syncSliders(vals) {
    if (!vals) return;
    $$('.v-slider').forEach((sl, i) => { sl.value = vals[i] || 0; });
}

// ═══════════════════════════════════════════════════════════════════
// SETTINGS (Crossfade + Sleep Timer)
// ═══════════════════════════════════════════════════════════════════

function setupSettings() {
    // Crossfade toggle
    const ct = $('#crossfadeToggle');
    ct.addEventListener('click', () => {
        S.crossfade = !S.crossfade;
        ct.classList.toggle('on', S.crossfade);
    });

    // Crossfade duration
    const cs = $('#cfSlider');
    cs.addEventListener('input', () => {
        S.cfDur = parseInt(cs.value);
        $('#cfVal').textContent = S.cfDur + 's';
    });

    // Sleep timer
    $('#timerBtns').addEventListener('click', e => {
        const btn = e.target.closest('.t-btn');
        if (!btn) return;
        const mins = parseInt(btn.dataset.m);

        if (mins === -1) { clearSleep(); return; }
        if (mins === 0) { S.sleepEndOfSong = true; setTimerUI('Song end'); return; }

        clearSleep();
        let rem = mins * 60;
        setTimerUI(fmtTime(rem));
        S.sleepTimer = setInterval(() => {
            rem--;
            if (rem <= 0) { clearSleep(); Engine.pause(); S.playing = false; updatePlayIcons(); fsArtwork.classList.remove('spin'); }
            else setTimerUI(fmtTime(rem));
        }, 1000);
    });
}

function setTimerUI(txt) {
    $('#timerVal').textContent = txt;
    $$('.t-btn').forEach(b => b.classList.remove('on'));
    $('.t-btn-stop').style.display = 'inline-flex';
}

function clearSleep() {
    if (S.sleepTimer) { clearInterval(S.sleepTimer); S.sleepTimer = null; }
    S.sleepEndOfSong = false;
    $('#timerVal').textContent = 'Off';
    $('.t-btn-stop').style.display = 'none';
    $$('.t-btn').forEach(b => b.classList.remove('on'));
}

// ═══════════════════════════════════════════════════════════════════
// SEARCH
// ═══════════════════════════════════════════════════════════════════

function setupSearch() {
    let timeout;
    const inp = $('#searchInput');
    const cl = $('#sClear');

    inp.addEventListener('input', () => {
        const q = inp.value.trim();
        cl.classList.toggle('show', q.length > 0);
        clearTimeout(timeout);
        if (q.length < 2) { showSearchEmpty(); return; }
        timeout = setTimeout(() => doSearch(q), 350);
    });

    inp.addEventListener('keydown', e => {
        if (e.key === 'Enter') { clearTimeout(timeout); const q = inp.value.trim(); if (q.length >= 2) doSearch(q); }
    });

    cl.addEventListener('click', () => { inp.value = ''; cl.classList.remove('show'); showSearchEmpty(); inp.focus(); });
}

async function doSearch(q) {
    showLoader(true);
    try {
        const r = await fetch(`/api/search/songs?query=${encodeURIComponent(q)}&limit=25`);
        const d = await r.json();
        if (!d.success || !d.data.results.length) { $('#searchOut').innerHTML = `<div class="search-empty">No results for "${esc(q)}"</div>`; return; }
        S._searchResults = d.data.results;
        $('#searchOut').innerHTML = `<div class="results-label">Songs · ${d.data.results.length}</div><div class="grid-list">${d.data.results.map((s, i) => glItem(s, '_sr', i).replace("playFrom('_sr',", "playFromSearch(")).join('')}</div>`;
        S._sr = d.data.results;
    } catch (e) { $('#searchOut').innerHTML = '<div class="search-empty">Error. Try again.</div>'; }
    finally { showLoader(false); }
}

function showSearchEmpty() { $('#searchOut').innerHTML = '<div class="search-empty"><p>Type to search Soniq</p></div>'; }

// ═══════════════════════════════════════════════════════════════════
// KEYBOARD
// ═══════════════════════════════════════════════════════════════════

function setupKeyboard() {
    document.addEventListener('keydown', e => {
        if (e.target.tagName === 'INPUT') return;
        switch (e.code) {
            case 'Space': e.preventDefault(); togglePlay(); break;
            case 'ArrowRight': e.shiftKey ? playNext() : Engine.seek(Math.min(Engine.getDuration(), Engine.getCurrentTime() + 10)); break;
            case 'ArrowLeft': e.shiftKey ? playPrev() : Engine.seek(Math.max(0, Engine.getCurrentTime() - 10)); break;
            case 'ArrowUp': e.preventDefault(); S.volume = Math.min(1, S.volume + .05); Engine.setVolume(actualVolume()); break;
            case 'ArrowDown': e.preventDefault(); S.volume = Math.max(0, S.volume - .05); Engine.setVolume(actualVolume()); break;
            case 'Escape': closeFS(); break;
            case 'KeyF': openFS(); break;
        }
    });
}

// ═══════════════════════════════════════════════════════════════════
// DRAG HELPER
// ═══════════════════════════════════════════════════════════════════

function dragBar(bar, onUpdate) {
    let dragging = false;
    function pct(e) {
        const r = bar.getBoundingClientRect();
        const x = e.clientX || (e.touches?.[0]?.clientX || 0);
        return Math.max(0, Math.min(1, (x - r.left) / r.width));
    }
    bar.addEventListener('mousedown', e => { dragging = true; onUpdate(pct(e)); });
    document.addEventListener('mousemove', e => { if (dragging) onUpdate(pct(e)); });
    document.addEventListener('mouseup', () => { dragging = false; });
    bar.addEventListener('touchstart', e => { e.preventDefault(); dragging = true; onUpdate(pct(e.touches[0])); }, { passive: false });
    bar.addEventListener('touchmove', e => { e.preventDefault(); if (dragging) onUpdate(pct(e.touches[0])); }, { passive: false });
    bar.addEventListener('touchend', () => { dragging = false; });
}

// ═══════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════

function bestUrl(urls) {
    if (!urls?.length) return null;
    for (const q of ['320kbps','160kbps','96kbps','48kbps','12kbps']) {
        const f = urls.find(d => d.quality === q && d.url);
        if (f) return f.url;
    }
    return urls[urls.length - 1]?.url || null;
}

function bestImg(images) {
    if (!images?.length) return '';
    for (const q of ['500x500','150x150','50x50']) {
        const f = images.find(i => i.quality === q && i.url);
        if (f) return f.url;
    }
    return images[images.length - 1]?.url || '';
}

function getArtists(song) {
    if (!song.artists) return 'Unknown';
    const p = song.artists.primary || [];
    if (p.length) return p.map(a => a.name).filter(Boolean).join(', ');
    const all = song.artists.all || [];
    return all.length ? all.slice(0, 3).map(a => a.name).filter(Boolean).join(', ') : 'Unknown';
}

function fmtTime(s) {
    if (!s || isNaN(s)) return '0:00';
    s = Math.floor(s);
    return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
}

function esc(s) {
    if (!s) return '';
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

function showLoader(v) { loader.classList.toggle('show', v); }
