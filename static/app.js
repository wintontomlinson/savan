/**
 * SONIQ — Premium Music Player
 * Clean, professional, bug-free implementation
 */

'use strict';

// ═══════════════════════════════════════════════════════════════
// AUDIO ENGINE
// Simple & reliable: single audio element for playback,
// crossfade uses volume ramping (no dual-element complexity)
// ═══════════════════════════════════════════════════════════════

const Player = {
    el: null,
    _fadingOut: false,
    _fadeInterval: null,

    init() {
        this.el = document.getElementById('deckA');
    },

    play(url, volume, crossfade, cfDur) {
        if (!url) return false;

        if (crossfade && !this.el.paused && this.el.currentTime > 1) {
            // Crossfade: ramp down, then switch source and ramp up
            this._crossfadeTo(url, volume, cfDur);
        } else {
            // Direct play
            this.el.src = url;
            this.el.volume = volume;
            this.el.play().catch(() => {});
        }
        return true;
    },

    _crossfadeTo(url, targetVol, dur) {
        const steps = 20;
        const fadeOutTime = dur * 500; // half duration for fade out
        const fadeInTime = dur * 500;  // half duration for fade in
        let vol = this.el.volume;
        const decrement = vol / steps;

        // Clear any existing fade
        clearInterval(this._fadeInterval);

        // Phase 1: Fade out current
        this._fadeInterval = setInterval(() => {
            vol -= decrement;
            if (vol <= 0.01) {
                this.el.volume = 0;
                clearInterval(this._fadeInterval);

                // Phase 2: Switch source and fade in
                this.el.src = url;
                this.el.volume = 0;
                this.el.play().then(() => {
                    let fadeVol = 0;
                    const increment = targetVol / steps;
                    this._fadeInterval = setInterval(() => {
                        fadeVol += increment;
                        if (fadeVol >= targetVol) {
                            this.el.volume = targetVol;
                            clearInterval(this._fadeInterval);
                            this._fadeInterval = null;
                        } else {
                            this.el.volume = fadeVol;
                        }
                    }, fadeInTime / steps);
                }).catch(() => {});
            } else {
                this.el.volume = vol;
            }
        }, fadeOutTime / steps);
    },

    pause() { this.el.pause(); },
    resume(vol) { this.el.volume = vol; this.el.play().catch(() => {}); },
    seek(t) { if (isFinite(t)) this.el.currentTime = t; },
    setVolume(v) { this.el.volume = Math.max(0, Math.min(1, v)); },
    getDuration() { return this.el.duration || 0; },
    getTime() { return this.el.currentTime || 0; },
    getBuffered() {
        try { return this.el.buffered.length ? this.el.buffered.end(this.el.buffered.length - 1) : 0; }
        catch(e) { return 0; }
    }
};

// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════

const S = {
    queue: [], idx: -1, playing: false,
    shuffle: false, repeat: 'off',
    volume: 0.85, crossfade: true, cfDur: 4,
    liked: new Set(),
    sleepTimer: null, sleepEndOfSong: false,
};

// ═══════════════════════════════════════════════════════════════
// DOM
// ═══════════════════════════════════════════════════════════════

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// ═══════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    Player.init();
    setupEvents();
    setupNav();
    setupMini();
    setupFSPlayer();
    setupSearch();
    setupChips();
    setupEQ();
    setupSettings();
    setupKeyboard();
    loadHome();
});

// ═══════════════════════════════════════════════════════════════
// AUDIO EVENTS
// ═══════════════════════════════════════════════════════════════

function setupEvents() {
    const el = Player.el;

    el.addEventListener('timeupdate', () => {
        const dur = Player.getDuration();
        if (!dur) return;
        const pct = (Player.getTime() / dur) * 100;
        $('#miniProgFill').style.width = pct + '%';
        $('#fsSeekPlayed').style.width = pct + '%';
        $('#fsSeekThumb').style.left = `calc(${pct}% - 7px)`;
        $('#fsTimeNow').textContent = fmt(Player.getTime());

        // Buffer
        const buf = Player.getBuffered();
        if (buf) $('#fsSeekBuffered').style.width = (buf / dur * 100) + '%';
    });

    el.addEventListener('loadedmetadata', () => {
        $('#fsTimeDur').textContent = fmt(Player.getDuration());
    });

    el.addEventListener('ended', () => playNext());

    el.addEventListener('waiting', () => {
        $('#fsBufferRing').classList.add('show');
    });

    el.addEventListener('canplaythrough', () => {
        $('#fsBufferRing').classList.remove('show');
    });

    el.addEventListener('error', () => {
        // Skip broken songs
        setTimeout(() => playNext(), 500);
    });
}

// ═══════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════

function setupNav() {
    $$('.tn').forEach(b => b.addEventListener('click', () => navTo(b.dataset.p)));
    $('#openSearch').addEventListener('click', () => navTo('search'));
}

function navTo(page) {
    $$('.tn').forEach(b => b.classList.toggle('active', b.dataset.p === page));
    $$('.pg').forEach(p => p.classList.remove('active'));
    const el = $(`#pg${page.charAt(0).toUpperCase() + page.slice(1)}`);
    if (el) { el.classList.add('active'); el.scrollTop = 0; }
    if (page === 'search') setTimeout(() => $('#searchInput')?.focus(), 100);
}
window.navTo = navTo;

// ═══════════════════════════════════════════════════════════════
// HOME — CATEGORISED CONTENT
// ═══════════════════════════════════════════════════════════════

async function loadHome() {
    loadGrid('Arijit Singh new songs', '#gridPicks', '_picks', 'Quick picks');
    loadRow('Bollywood trending 2024', '#rowTrend', '_trend');
    loadRow('Latest Hindi songs new', '#rowNew', '_new');
    loadArtists();
}

async function loadGrid(q, sel, key) {
    try {
        const r = await api(`/api/search/songs?query=${enc(q)}&limit=8`);
        if (r?.length) {
            S[key] = r;
            $(sel).innerHTML = r.map((s, i) => listItem(s, key, i)).join('');
        }
    } catch (e) {}
}

async function loadRow(q, sel, key) {
    try {
        const r = await api(`/api/search/songs?query=${enc(q)}&limit=12`);
        if (r?.length) {
            S[key] = r;
            $(sel).innerHTML = r.map((s, i) => cardHTML(s, key, i)).join('');
        }
    } catch (e) {}
}

async function loadArtists() {
    const names = ['Arijit Singh', 'Shreya Ghoshal', 'Pritam', 'AP Dhillon', 'Diljit Dosanjh', 'Atif Aslam'];
    $('#rowArtists').innerHTML = names.map(n =>
        `<div class="card" onclick="moodPlay('${esc(n)}')">
            <div class="card-art" style="display:flex;align-items:center;justify-content:center;background:var(--bg2);font-size:1.8rem;border-radius:50%">🎤</div>
            <div class="card-t">${esc(n)}</div>
            <div class="card-s">Artist</div>
        </div>`
    ).join('');
}

function listItem(s, key, i) {
    const img = bestImg(s.image);
    return `<div class="gl-item" onclick="playFrom('${key}',${i})">
        <div class="gl-art"><img src="${img}" loading="lazy" alt=""></div>
        <div class="gl-info"><div class="gl-t">${esc(s.name)}</div><div class="gl-s">${esc(artists(s))}</div></div>
    </div>`;
}

function cardHTML(s, key, i) {
    const img = bestImg(s.image);
    return `<div class="card" onclick="playFrom('${key}',${i})">
        <div class="card-art"><img src="${img}" loading="lazy" alt=""><div class="card-play"><svg width="28" height="28" fill="white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div></div>
        <div class="card-t">${esc(s.name)}</div>
        <div class="card-s">${esc(artists(s))}</div>
    </div>`;
}

// ═══════════════════════════════════════════════════════════════
// CHIPS
// ═══════════════════════════════════════════════════════════════

function setupChips() {
    $('#chips')?.addEventListener('click', e => {
        const c = e.target.closest('.chip');
        if (!c) return;
        $$('#chips .chip').forEach(x => x.classList.remove('active'));
        c.classList.add('active');
        const q = c.dataset.q;
        if (q === 'all') loadHome();
        else moodPlay(q + ' songs hindi');
    });
}

// ═══════════════════════════════════════════════════════════════
// PLAYBACK
// ═══════════════════════════════════════════════════════════════

function playFrom(key, i) {
    S.queue = [...(S[key] || [])];
    S.idx = i;
    playCurrent();
}
window.playFrom = playFrom;

async function moodPlay(q) {
    showLoader(true);
    try {
        const r = await api(`/api/search/songs?query=${enc(q)}&limit=20`);
        if (r?.length) { S.queue = r; S.idx = 0; playCurrent(); }
    } catch (e) {}
    showLoader(false);
}
window.moodPlay = moodPlay;

function playFromQueue(i) { S.idx = i; playCurrent(); }
window.playFromQueue = playFromQueue;

function playFromSearch(i) {
    S.queue = S._sr || [];
    S.idx = i;
    playCurrent();
}
window.playFromSearch = playFromSearch;

function playCurrent() {
    const song = S.queue[S.idx];
    if (!song) return;

    const url = bestUrl(song.downloadUrl);
    if (!url) { playNext(); return; }

    const ok = Player.play(url, S.volume, S.crossfade, S.cfDur);
    if (!ok) { playNext(); return; }

    S.playing = true;
    updateUI(song);
    updateQueue();
    updateLibrary();
}

function togglePlay() {
    if (!S.queue.length) return;
    if (S.playing) { Player.pause(); S.playing = false; }
    else { Player.resume(S.volume); S.playing = true; }
    updatePlayIcons();
    $('#fsArtwork').classList.toggle('spin', S.playing);
}

function playNext() {
    if (!S.queue.length) return;
    if (S.repeat === 'one') { Player.seek(0); Player.resume(S.volume); return; }
    if (S.sleepEndOfSong) { Player.pause(); S.playing = false; S.sleepEndOfSong = false; updatePlayIcons(); return; }

    let next;
    if (S.shuffle) next = Math.floor(Math.random() * S.queue.length);
    else next = S.idx + 1;

    if (next >= S.queue.length) {
        if (S.repeat === 'all') next = 0;
        else { Player.pause(); S.playing = false; updatePlayIcons(); $('#fsArtwork').classList.remove('spin'); return; }
    }
    S.idx = next;
    playCurrent();
}

function playPrev() {
    if (!S.queue.length) return;
    if (Player.getTime() > 3) { Player.seek(0); return; }
    S.idx = Math.max(0, S.idx - 1);
    playCurrent();
}

// ═══════════════════════════════════════════════════════════════
// UI
// ═══════════════════════════════════════════════════════════════

function updateUI(song) {
    const img = bestImg(song.image);
    const art = artists(song);

    // Mini
    const mi = $('#miniImg');
    mi.src = img; mi.onload = () => mi.classList.add('vis');
    $('#miniT').textContent = song.name || '';
    $('#miniT').classList.add('on');
    $('#miniA').textContent = art;

    // FS
    const fi = $('#fsImg');
    fi.src = img; fi.onload = () => fi.classList.add('vis');
    $('#fsTitle').textContent = song.name || '';
    $('#fsArtistName').textContent = art;
    $('#fsBg').style.backgroundImage = img ? `url(${img})` : '';
    $('#fsArtwork').classList.toggle('spin', S.playing);
    $('#fsHeart').classList.toggle('liked', S.liked.has(song.id));

    document.title = `${song.name} — Soniq`;
    updatePlayIcons();
}

function updatePlayIcons() {
    const p = S.playing;
    $('#mIconPlay').style.display = p ? 'none' : '';
    $('#mIconPause').style.display = p ? '' : 'none';
    $('#fsIconPlay').style.display = p ? 'none' : '';
    $('#fsIconPause').style.display = p ? '' : 'none';
}

function updateQueue() {
    const el = $('#fsQueue');
    if (!S.queue.length) { el.innerHTML = '<p class="empty-msg">Play a song to build your queue</p>'; return; }
    el.innerHTML = S.queue.map((s, i) => {
        const img = bestImg(s.image);
        const act = i === S.idx;
        return `<div class="q-item ${act ? 'act' : ''}" onclick="playFromQueue(${i})">
            <img src="${img}" loading="lazy" alt="">
            <div class="q-info"><div class="q-t">${esc(s.name)}</div><div class="q-a">${esc(artists(s))}</div></div>
            ${act ? '<div class="q-eq"><i></i><i></i><i></i></div>' : ''}
        </div>`;
    }).join('');
}

function updateLibrary() {
    const el = $('#libList');
    const emp = $('#libEmpty');
    if (!S.queue.length) { el.innerHTML = ''; if (emp) emp.style.display = ''; return; }
    if (emp) emp.style.display = 'none';
    el.innerHTML = S.queue.map((s, i) => listItem(s, '_q', i).replace(`playFrom('_q',${i})`, `playFromQueue(${i})`)).join('');
    S._q = S.queue;
}

// ═══════════════════════════════════════════════════════════════
// MINI PLAYER
// ═══════════════════════════════════════════════════════════════

function setupMini() {
    $('#miniPlay').addEventListener('click', e => { e.stopPropagation(); togglePlay(); });
    $('#miniNext').addEventListener('click', e => { e.stopPropagation(); playNext(); });
    $('#miniBody').addEventListener('click', () => $('#fsPlayer').classList.add('open'));
}

// ═══════════════════════════════════════════════════════════════
// FULL-SCREEN PLAYER
// ═══════════════════════════════════════════════════════════════

function setupFSPlayer() {
    $('#fsClose').addEventListener('click', () => $('#fsPlayer').classList.remove('open'));
    $('#fsPlayBtn').addEventListener('click', togglePlay);
    $('#fsNext').addEventListener('click', playNext);
    $('#fsPrev').addEventListener('click', playPrev);

    $('#fsShuffle').addEventListener('click', () => {
        S.shuffle = !S.shuffle;
        $('#fsShuffle').classList.toggle('on', S.shuffle);
    });
    $('#fsRepeat').addEventListener('click', () => {
        const m = ['off', 'all', 'one'];
        S.repeat = m[(m.indexOf(S.repeat) + 1) % 3];
        $('#fsRepeat').classList.toggle('on', S.repeat !== 'off');
    });
    $('#fsHeart').addEventListener('click', () => {
        const song = S.queue[S.idx];
        if (!song) return;
        S.liked.has(song.id) ? S.liked.delete(song.id) : S.liked.add(song.id);
        $('#fsHeart').classList.toggle('liked', S.liked.has(song.id));
    });

    // Seek
    drag($('#fsSeekBar'), pct => Player.seek(pct * Player.getDuration()));

    // Tabs
    $$('.fs-tab').forEach(t => t.addEventListener('click', () => {
        $$('.fs-tab').forEach(x => x.classList.remove('active'));
        $$('.fs-panel').forEach(x => x.classList.remove('active'));
        t.classList.add('active');
        $(`#panel${t.dataset.panel.charAt(0).toUpperCase() + t.dataset.panel.slice(1)}`).classList.add('active');
    }));

    // Swipe down
    let sy = 0;
    $('#fsPlayer').addEventListener('touchstart', e => { sy = e.touches[0].clientY; }, { passive: true });
    $('#fsPlayer').addEventListener('touchend', e => { if (e.changedTouches[0].clientY - sy > 100) $('#fsPlayer').classList.remove('open'); }, { passive: true });
}

// ═══════════════════════════════════════════════════════════════
// EQ (Only activates on user interaction)
// ═══════════════════════════════════════════════════════════════

let eqCtx = null, eqFilters = [], eqGain = null, eqConnected = false;
const EQ_FREQS = [60, 250, 1000, 4000, 16000];
const EQ_PRESETS = {
    flat: [0,0,0,0,0], bass: [9,5,0,-1,-2], treble: [-2,0,0,3,7],
    vocal: [-2,0,5,4,1], electronic: [6,3,-2,3,5], rock: [5,3,-1,4,3],
};

function connectEQ() {
    if (eqConnected) { if (eqCtx.state === 'suspended') eqCtx.resume(); return; }
    eqConnected = true;
    eqCtx = new (window.AudioContext || window.webkitAudioContext)();
    const src = eqCtx.createMediaElementSource(Player.el);
    eqGain = eqCtx.createGain();
    eqGain.gain.value = 1;

    let last = src;
    EQ_FREQS.forEach((freq, i) => {
        const f = eqCtx.createBiquadFilter();
        f.type = i === 0 ? 'lowshelf' : i === 4 ? 'highshelf' : 'peaking';
        if (f.type === 'peaking') f.Q.value = 1.2;
        f.frequency.value = freq;
        f.gain.value = 0;
        eqFilters.push(f);
        last.connect(f);
        last = f;
    });
    last.connect(eqGain);
    eqGain.connect(eqCtx.destination);
}

function applyPreset(name) {
    const p = EQ_PRESETS[name];
    if (!p) return;
    p.forEach((v, i) => { if (eqFilters[i]) eqFilters[i].gain.value = v; });
    $$('.v-slider').forEach((sl, i) => { sl.value = p[i] || 0; });
    $$('.eq-pill').forEach(x => x.classList.toggle('active', x.dataset.p === name));
}

function setupEQ() {
    $('#bassToggle').addEventListener('click', () => {
        const on = !$('#bassToggle').classList.contains('on');
        $('#bassToggle').classList.toggle('on', on);
        connectEQ();
        applyPreset(on ? 'bass' : 'flat');
    });

    $('#eqPresets').addEventListener('click', e => {
        const pill = e.target.closest('.eq-pill');
        if (!pill) return;
        connectEQ();
        applyPreset(pill.dataset.p);
    });

    $$('.v-slider').forEach(sl => {
        sl.addEventListener('input', () => {
            connectEQ();
            const i = parseInt(sl.dataset.band);
            if (eqFilters[i]) eqFilters[i].gain.value = parseInt(sl.value);
            $$('.eq-pill').forEach(x => x.classList.remove('active'));
        });
    });

    $('#volSlider').addEventListener('input', () => {
        const v = parseInt($('#volSlider').value);
        $('#volVal').textContent = v + '%';
        if (eqConnected) eqGain.gain.value = v / 100;
        else Player.setVolume(Math.min(1, S.volume * v / 100));
    });
}

// ═══════════════════════════════════════════════════════════════
// SETTINGS (Crossfade + Sleep Timer)
// ═══════════════════════════════════════════════════════════════

function setupSettings() {
    // Crossfade
    const ct = $('#crossfadeToggle');
    ct.classList.toggle('on', S.crossfade);
    ct.addEventListener('click', () => { S.crossfade = !S.crossfade; ct.classList.toggle('on', S.crossfade); });

    const cs = $('#cfSlider');
    cs.value = S.cfDur;
    cs.addEventListener('input', () => { S.cfDur = parseInt(cs.value); $('#cfVal').textContent = S.cfDur + 's'; });

    // Timer
    $('#timerBtns').addEventListener('click', e => {
        const btn = e.target.closest('.t-btn');
        if (!btn) return;
        const m = parseInt(btn.dataset.m);
        if (m === -1) { clearSleep(); return; }
        if (m === 0) { S.sleepEndOfSong = true; setTimerLabel('Song end'); return; }
        clearSleep();
        let rem = m * 60;
        setTimerLabel(fmt(rem));
        S.sleepTimer = setInterval(() => {
            rem--;
            if (rem <= 0) { clearSleep(); Player.pause(); S.playing = false; updatePlayIcons(); }
            else setTimerLabel(fmt(rem));
        }, 1000);
    });
}

function setTimerLabel(t) { $('#timerVal').textContent = t; $('.t-btn-stop').style.display = 'inline-flex'; }
function clearSleep() {
    if (S.sleepTimer) { clearInterval(S.sleepTimer); S.sleepTimer = null; }
    S.sleepEndOfSong = false;
    $('#timerVal').textContent = 'Off';
    $('.t-btn-stop').style.display = 'none';
}

// ═══════════════════════════════════════════════════════════════
// SEARCH
// ═══════════════════════════════════════════════════════════════

function setupSearch() {
    let t;
    const inp = $('#searchInput');
    const cl = $('#sClear');
    inp.addEventListener('input', () => {
        const q = inp.value.trim();
        cl.classList.toggle('show', q.length > 0);
        clearTimeout(t);
        if (q.length < 2) { $('#searchOut').innerHTML = '<div class="search-empty"><p>Type to search Soniq</p></div>'; return; }
        t = setTimeout(() => doSearch(q), 350);
    });
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { clearTimeout(t); doSearch(inp.value.trim()); } });
    cl.addEventListener('click', () => { inp.value = ''; cl.classList.remove('show'); $('#searchOut').innerHTML = '<div class="search-empty"><p>Type to search Soniq</p></div>'; inp.focus(); });
}

async function doSearch(q) {
    if (q.length < 2) return;
    showLoader(true);
    try {
        const r = await api(`/api/search/songs?query=${enc(q)}&limit=20`);
        if (r?.length) {
            S._sr = r;
            $('#searchOut').innerHTML = `<div class="results-label">Results · ${r.length}</div><div class="grid-list">${r.map((s, i) => listItem(s, '_sr', i).replace(`playFrom('_sr',${i})`, `playFromSearch(${i})`)).join('')}</div>`;
        } else {
            $('#searchOut').innerHTML = '<div class="search-empty">No results found</div>';
        }
    } catch (e) { $('#searchOut').innerHTML = '<div class="search-empty">Error. Try again.</div>'; }
    showLoader(false);
}

// ═══════════════════════════════════════════════════════════════
// KEYBOARD
// ═══════════════════════════════════════════════════════════════

function setupKeyboard() {
    document.addEventListener('keydown', e => {
        if (e.target.tagName === 'INPUT') return;
        switch (e.code) {
            case 'Space': e.preventDefault(); togglePlay(); break;
            case 'ArrowRight': e.shiftKey ? playNext() : Player.seek(Math.min(Player.getDuration(), Player.getTime() + 10)); break;
            case 'ArrowLeft': e.shiftKey ? playPrev() : Player.seek(Math.max(0, Player.getTime() - 10)); break;
            case 'ArrowUp': e.preventDefault(); S.volume = Math.min(1, S.volume + .05); Player.setVolume(S.volume); break;
            case 'ArrowDown': e.preventDefault(); S.volume = Math.max(0, S.volume - .05); Player.setVolume(S.volume); break;
            case 'Escape': $('#fsPlayer').classList.remove('open'); break;
        }
    });
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function drag(bar, cb) {
    let d = false;
    const pct = e => { const r = bar.getBoundingClientRect(); const x = e.clientX || e.touches?.[0]?.clientX || 0; return Math.max(0, Math.min(1, (x - r.left) / r.width)); };
    bar.addEventListener('mousedown', e => { d = true; cb(pct(e)); });
    document.addEventListener('mousemove', e => { if (d) cb(pct(e)); });
    document.addEventListener('mouseup', () => { d = false; });
    bar.addEventListener('touchstart', e => { e.preventDefault(); d = true; cb(pct(e.touches[0])); }, { passive: false });
    bar.addEventListener('touchmove', e => { e.preventDefault(); if (d) cb(pct(e.touches[0])); }, { passive: false });
    bar.addEventListener('touchend', () => { d = false; });
}

async function api(url) {
    const r = await fetch(url);
    const d = await r.json();
    return d.success ? d.data.results || d.data : null;
}

function bestUrl(urls) {
    if (!urls?.length) return null;
    for (const q of ['320kbps', '160kbps', '96kbps', '48kbps', '12kbps']) {
        const f = urls.find(d => d.quality === q && d.url);
        if (f) return f.url;
    }
    return urls[urls.length - 1]?.url || null;
}

function bestImg(imgs) {
    if (!imgs?.length) return '';
    for (const q of ['500x500', '150x150', '50x50']) {
        const f = imgs.find(i => i.quality === q && i.url);
        if (f) return f.url;
    }
    return imgs[imgs.length - 1]?.url || '';
}

function artists(s) {
    if (!s?.artists) return '';
    const p = s.artists.primary || [];
    if (p.length) return p.map(a => a.name).filter(Boolean).join(', ');
    return (s.artists.all || []).slice(0, 2).map(a => a.name).filter(Boolean).join(', ') || '';
}

function fmt(s) { if (!s || !isFinite(s)) return '0:00'; s = Math.floor(s); return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`; }
function esc(s) { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }
function enc(s) { return encodeURIComponent(s); }
function showLoader(v) { $('#ld').classList.toggle('show', v); }
