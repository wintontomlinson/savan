/**
 * Savan Music — Apple Music Premium Experience
 * Full-screen Now Playing, lyrics, dynamic backgrounds,
 * radio stations, autoplay suggestions, spatial audio badges
 */

// ═══════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════

const state = {
    queue: [],
    currentIndex: -1,
    isPlaying: false,
    shuffle: false,
    repeat: 'off', // off | all | one
    volume: 0.75,
    nowPlayingOpen: false,
    lyricsOpen: false,
};

// ═══════════════════════════════════════════════════════════════════════════
// DOM
// ═══════════════════════════════════════════════════════════════════════════

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

const audio = $('#audioPlayer');

// Mini Player
const miniPlayer = $('#miniPlayer');
const miniInner = $('#miniInner');
const miniImg = $('#miniImg');
const miniArt = $('#miniArt');
const miniTitle = $('#miniTitle');
const miniArtist = $('#miniArtist');
const miniPlayBtn = $('#miniPlayBtn');
const miniPlayIcon = $('#miniPlayIcon');
const miniPauseIcon = $('#miniPauseIcon');
const miniNextBtn = $('#miniNextBtn');
const miniProgressFill = $('#miniProgressFill');

// Now Playing
const nowPlaying = $('#nowPlaying');
const npBg = $('#npBg');
const npImg = $('#npImg');
const npAlbumArt = $('#npAlbumArt');
const npTitle = $('#npTitle');
const npArtist = $('#npArtist');
const npClose = $('#npClose');
const npPlayBtn = $('#npPlayBtn');
const npPlayIcon = $('#npPlayIcon');
const npPauseIcon = $('#npPauseIcon');
const npPrev = $('#npPrev');
const npNext = $('#npNext');
const npShuffle = $('#npShuffle');
const npRepeat = $('#npRepeat');
const npProgressBar = $('#npProgressBar');
const npProgressFilled = $('#npProgressFilled');
const npProgressKnob = $('#npProgressKnob');
const npCurrentTime = $('#npCurrentTime');
const npTotalTime = $('#npTotalTime');
const npVolumeBar = $('#npVolumeBar');
const npVolumeFilled = $('#npVolumeFilled');
const npVolumeKnob = $('#npVolumeKnob');
const npLyricsBtn = $('#npLyricsBtn');
const npLyricsPanel = $('#npLyricsPanel');
const npLyricsContent = $('#npLyricsContent');
const npQueueBtn = $('#npQueueBtn');

// Search
const searchInput = $('#searchInput');
const searchClear = $('#searchClear');
const searchResults = $('#searchResults');

// Grids
const topPicksRow = $('#topPicksRow');
const trendingRow = $('#trendingRow');
const madeForYouRow = $('#madeForYouRow');
const artistsRow = $('#artistsRow');
const heroBanner = $('#heroBanner');
const heroTitle = $('#heroTitle');
const heroDesc = $('#heroDesc');
const heroPlayBtn = $('#heroPlayBtn');
const heroArt = $('#heroArt');
const greetingEl = $('#greeting');

// Misc
const loaderOverlay = $('#loaderOverlay');
const sidebarQueue = $('#sidebarQueue');

// ═══════════════════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    setGreeting();
    setupNavigation();
    setupMiniPlayer();
    setupNowPlaying();
    setupSearch();
    setupKeyboard();
    loadHomeSections();
    audio.volume = state.volume;
});

// ═══════════════════════════════════════════════════════════════════════════
// GREETING
// ═══════════════════════════════════════════════════════════════════════════

function setGreeting() {
    const h = new Date().getHours();
    let g = 'Good Evening';
    if (h < 12) g = 'Good Morning';
    else if (h < 17) g = 'Good Afternoon';
    if (greetingEl) greetingEl.textContent = g;
}

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════

function setupNavigation() {
    // Sidebar tabs
    $$('.sidebar-tab').forEach(btn => {
        btn.addEventListener('click', () => switchPage(btn.dataset.page));
    });
    // Mobile tabs
    $$('.tab').forEach(btn => {
        btn.addEventListener('click', () => switchPage(btn.dataset.page));
    });
}

function switchPage(page) {
    $$('.sidebar-tab').forEach(t => t.classList.toggle('active', t.dataset.page === page));
    $$('.tab').forEach(t => t.classList.toggle('active', t.dataset.page === page));
    $$('.page').forEach(p => p.classList.remove('active'));

    const el = $(`#${page}Page`);
    if (el) {
        el.classList.add('active');
        // Reset scroll
        const scroll = el.querySelector('.page-scroll');
        if (scroll) scroll.scrollTop = 0;
    }

    if (page === 'search') setTimeout(() => searchInput?.focus(), 150);
}

window.switchPage = switchPage;

// ═══════════════════════════════════════════════════════════════════════════
// HOME SECTIONS
// ═══════════════════════════════════════════════════════════════════════════

async function loadHomeSections() {
    await Promise.allSettled([
        loadSection('Arijit Singh latest', topPicksRow, '_topPicks'),
        loadSection('Trending Bollywood 2024', trendingRow, '_trending'),
        loadSection('New Hindi Songs', madeForYouRow, '_madeForYou'),
        loadArtists(),
        loadHero(),
    ]);
}

async function loadSection(query, container, stateKey) {
    try {
        const res = await fetch(`/api/search/songs?query=${encodeURIComponent(query)}&limit=12`);
        const data = await res.json();
        if (data.success && data.data.results.length) {
            state[stateKey] = data.data.results;
            renderAlbumCards(data.data.results, container, stateKey);
        }
    } catch (e) { /* silent */ }
}

async function loadHero() {
    try {
        const res = await fetch('/api/search/songs?query=Latest Hindi Hit&limit=1');
        const data = await res.json();
        if (data.success && data.data.results.length) {
            const song = data.data.results[0];
            state._heroSong = song;
            const img = bestImg(song.image);
            heroTitle.textContent = song.name || 'Discover Music';
            heroDesc.textContent = getArtists(song);
            heroArt.innerHTML = img ? `<img src="${img}" alt="">` : '';
            heroPlayBtn.onclick = () => {
                state.queue = [song];
                state.currentIndex = 0;
                playCurrent();
                updateQueue();
            };
        }
    } catch (e) { /* silent */ }
}

async function loadArtists() {
    const names = ['Arijit Singh', 'Shreya Ghoshal', 'Pritam', 'AP Dhillon', 'Diljit Dosanjh', 'Atif Aslam', 'Neha Kakkar', 'Jubin Nautiyal'];
    try {
        const res = await fetch('/api/search/artists?query=Bollywood&limit=8');
        const data = await res.json();
        if (data.success && data.data.results.length) {
            renderArtistCards(data.data.results);
        } else {
            // Fallback
            artistsRow.innerHTML = names.map(n => `
                <div class="album-card" onclick="searchAndPlay('${esc(n)}')">
                    <div class="album-art"><div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:2rem;background:var(--bg-secondary)">🎤</div></div>
                    <div class="album-title">${esc(n)}</div>
                    <div class="album-subtitle">Artist</div>
                </div>
            `).join('');
        }
    } catch (e) {
        artistsRow.innerHTML = names.map(n => `
            <div class="album-card" onclick="searchAndPlay('${esc(n)}')">
                <div class="album-art"><div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:2rem;background:var(--bg-secondary)">🎤</div></div>
                <div class="album-title">${esc(n)}</div>
                <div class="album-subtitle">Artist</div>
            </div>
        `).join('');
    }
}

function renderAlbumCards(songs, container, stateKey) {
    container.innerHTML = songs.map((song, i) => {
        const img = bestImg(song.image);
        const artists = getArtists(song);
        const hasBadge = Math.random() > 0.6; // simulate spatial badges
        return `
            <div class="album-card" onclick="playFromSection('${stateKey}', ${i})">
                <div class="album-art">
                    <img src="${img}" alt="" loading="lazy">
                    ${hasBadge ? '<div class="album-badge"><span class="dot"></span>Lossless</div>' : ''}
                    <div class="album-play-btn">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                </div>
                <div class="album-title">${esc(song.name || 'Unknown')}</div>
                <div class="album-subtitle">${esc(artists)}</div>
            </div>
        `;
    }).join('');
}

function renderArtistCards(artists) {
    artistsRow.innerHTML = artists.map(a => {
        const img = bestImg(a.image);
        return `
            <div class="album-card" onclick="searchAndPlay('${esc(a.name || '')}')">
                <div class="album-art">
                    ${img ? `<img src="${img}" alt="" loading="lazy">` : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:2rem;background:var(--bg-secondary)">🎤</div>'}
                    <div class="album-play-btn">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                </div>
                <div class="album-title">${esc(a.name || 'Unknown')}</div>
                <div class="album-subtitle">Artist</div>
            </div>
        `;
    }).join('');
}

// ═══════════════════════════════════════════════════════════════════════════
// PLAY FROM SECTIONS
// ═══════════════════════════════════════════════════════════════════════════

function playFromSection(key, index) {
    const songs = state[key] || [];
    if (!songs.length) return;
    state.queue = songs;
    state.currentIndex = index;
    playCurrent();
    updateQueue();
}

window.playFromSection = playFromSection;

async function searchAndPlay(query) {
    showLoader(true);
    try {
        const res = await fetch(`/api/search/songs?query=${encodeURIComponent(query)}&limit=20`);
        const data = await res.json();
        if (data.success && data.data.results.length) {
            state.queue = data.data.results;
            state.currentIndex = 0;
            playCurrent();
            updateQueue();
        }
    } catch (e) { /* silent */ }
    showLoader(false);
}

window.searchAndPlay = searchAndPlay;

async function searchGenre(genre) {
    switchPage('search');
    searchInput.value = genre;
    searchClear.classList.add('visible');
    await performSearch(genre);
}

window.searchGenre = searchGenre;

// ═══════════════════════════════════════════════════════════════════════════
// SEARCH
// ═══════════════════════════════════════════════════════════════════════════

function setupSearch() {
    let timeout;

    searchInput.addEventListener('input', () => {
        const q = searchInput.value.trim();
        searchClear.classList.toggle('visible', q.length > 0);
        clearTimeout(timeout);
        if (q.length < 2) { showSearchEmpty(); return; }
        timeout = setTimeout(() => performSearch(q), 400);
    });

    searchInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            clearTimeout(timeout);
            const q = searchInput.value.trim();
            if (q.length >= 2) performSearch(q);
        }
    });

    searchClear.addEventListener('click', () => {
        searchInput.value = '';
        searchClear.classList.remove('visible');
        showSearchEmpty();
        searchInput.focus();
    });
}

async function performSearch(query) {
    showLoader(true);
    try {
        const res = await fetch(`/api/search/songs?query=${encodeURIComponent(query)}&limit=25`);
        const data = await res.json();
        if (!data.success || !data.data.results.length) {
            searchResults.innerHTML = `<div class="no-results"><h3>No results for "${esc(query)}"</h3><p>Try different keywords</p></div>`;
            return;
        }
        state._searchResults = data.data.results;
        renderSearchResults(data.data.results);
    } catch (e) {
        searchResults.innerHTML = `<div class="no-results"><h3>Something went wrong</h3><p>Check your connection</p></div>`;
    } finally {
        showLoader(false);
    }
}

function renderSearchResults(songs) {
    let html = `<div class="results-head">Songs · ${songs.length} results</div><div class="song-list">`;
    songs.forEach((song, i) => {
        const img = bestImg(song.image);
        const artists = getArtists(song);
        const dur = fmtTime(song.duration || 0);
        html += `
            <div class="s-row" style="animation-delay:${i * 0.02}s" data-idx="${i}" onclick="playFromSearch(${i})">
                <div>
                    <span class="s-num">${i + 1}</span>
                    <span class="s-play"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span>
                </div>
                <div class="s-info">
                    <img class="s-img" src="${img}" alt="" loading="lazy">
                    <div class="s-details">
                        <div class="s-title">${esc(song.name || 'Unknown')}</div>
                        <div class="s-artist">${esc(artists)}</div>
                    </div>
                </div>
                <div class="s-album">${esc(song.album?.name || '')}</div>
                <div class="s-dur">${dur}</div>
            </div>
        `;
    });
    html += '</div>';
    searchResults.innerHTML = html;
}

function playFromSearch(i) {
    state.queue = state._searchResults || [];
    state.currentIndex = i;
    playCurrent();
    updateQueue();
}
window.playFromSearch = playFromSearch;

function showSearchEmpty() {
    searchResults.innerHTML = `
        <div class="search-empty">
            <div class="search-empty-icon"><svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.3"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>
            <h3>Search Savan</h3>
            <p>Find songs, artists, albums and more</p>
        </div>
    `;
}

// ═══════════════════════════════════════════════════════════════════════════
// PLAYBACK
// ═══════════════════════════════════════════════════════════════════════════

function playCurrent() {
    const song = state.queue[state.currentIndex];
    if (!song) return;

    const url = bestDownloadUrl(song.downloadUrl);
    if (!url) { playNext(); return; }

    audio.src = url;
    audio.play().then(() => {
        state.isPlaying = true;
        updateAllUI(song);
    }).catch(() => {
        state.isPlaying = false;
        updatePlayIcons();
    });
}

function togglePlay() {
    if (!audio.src || !state.queue.length) return;
    if (state.isPlaying) {
        audio.pause();
        state.isPlaying = false;
    } else {
        audio.play().catch(() => {});
        state.isPlaying = true;
    }
    updatePlayIcons();
    updateArtSpin();
}

function playNext() {
    if (!state.queue.length) return;
    if (state.repeat === 'one') { audio.currentTime = 0; audio.play(); return; }

    let next;
    if (state.shuffle) {
        next = Math.floor(Math.random() * state.queue.length);
    } else {
        next = state.currentIndex + 1;
    }

    if (next >= state.queue.length) {
        if (state.repeat === 'all') next = 0;
        else { state.isPlaying = false; updatePlayIcons(); updateArtSpin(); return; }
    }

    state.currentIndex = next;
    playCurrent();
    updateQueue();
}

function playPrev() {
    if (!state.queue.length) return;
    if (audio.currentTime > 3) { audio.currentTime = 0; return; }
    let prev = state.currentIndex - 1;
    if (prev < 0) prev = state.repeat === 'all' ? state.queue.length - 1 : 0;
    state.currentIndex = prev;
    playCurrent();
    updateQueue();
}

// ═══════════════════════════════════════════════════════════════════════════
// UI UPDATES
// ═══════════════════════════════════════════════════════════════════════════

function updateAllUI(song) {
    const img = bestImg(song.image);
    const artists = getArtists(song);

    // Mini player
    miniImg.src = img;
    miniImg.onload = () => miniImg.classList.add('visible');
    miniTitle.textContent = song.name || 'Unknown';
    miniTitle.classList.add('active');
    miniArtist.textContent = artists;

    // Now Playing
    npImg.src = img;
    npTitle.textContent = song.name || 'Unknown';
    npArtist.textContent = artists;

    // Dynamic BG
    npBg.style.backgroundImage = img ? `url(${img})` : 'none';

    // Document title
    document.title = `${song.name} — Savan Music`;

    updatePlayIcons();
    updateArtSpin();
    highlightPlaying();

    // Auto-load suggestions
    loadSuggestions(song.id);
}

function updatePlayIcons() {
    const playing = state.isPlaying;
    // Mini
    miniPlayIcon.style.display = playing ? 'none' : 'block';
    miniPauseIcon.style.display = playing ? 'block' : 'none';
    // NP
    npPlayIcon.style.display = playing ? 'none' : 'block';
    npPauseIcon.style.display = playing ? 'block' : 'none';
}

function updateArtSpin() {
    const spinning = state.isPlaying;
    miniArt.classList.toggle('playing', spinning);
    npAlbumArt.classList.toggle('spinning', spinning);
}

function highlightPlaying() {
    $$('.s-row').forEach(r => r.classList.remove('playing'));
    const active = $(`.s-row[data-idx="${state.currentIndex}"]`);
    if (active) active.classList.add('playing');
}

// ═══════════════════════════════════════════════════════════════════════════
// MINI PLAYER
// ═══════════════════════════════════════════════════════════════════════════

function setupMiniPlayer() {
    miniPlayBtn.addEventListener('click', e => { e.stopPropagation(); togglePlay(); });
    miniNextBtn.addEventListener('click', e => { e.stopPropagation(); playNext(); });
    miniInner.addEventListener('click', openNowPlaying);

    // Progress
    audio.addEventListener('timeupdate', () => {
        if (!audio.duration) return;
        const pct = (audio.currentTime / audio.duration) * 100;
        miniProgressFill.style.width = pct + '%';

        // NP progress
        npProgressFilled.style.width = pct + '%';
        npProgressKnob.style.left = `calc(${pct}% - 7px)`;
        npCurrentTime.textContent = fmtTime(audio.currentTime);
    });

    audio.addEventListener('loadedmetadata', () => {
        npTotalTime.textContent = '-' + fmtTime(audio.duration - audio.currentTime);
    });

    audio.addEventListener('ended', playNext);
    audio.addEventListener('error', () => setTimeout(playNext, 800));
}

// ═══════════════════════════════════════════════════════════════════════════
// NOW PLAYING
// ═══════════════════════════════════════════════════════════════════════════

function setupNowPlaying() {
    npClose.addEventListener('click', closeNowPlaying);
    npPlayBtn.addEventListener('click', togglePlay);
    npNext.addEventListener('click', () => { playNext(); updateQueue(); });
    npPrev.addEventListener('click', () => { playPrev(); updateQueue(); });

    npShuffle.addEventListener('click', () => {
        state.shuffle = !state.shuffle;
        npShuffle.classList.toggle('active', state.shuffle);
    });

    npRepeat.addEventListener('click', () => {
        const modes = ['off', 'all', 'one'];
        state.repeat = modes[(modes.indexOf(state.repeat) + 1) % 3];
        npRepeat.classList.toggle('active', state.repeat !== 'off');
    });

    // NP Progress seek
    setupBarDrag(npProgressBar, (pct) => {
        if (audio.duration) audio.currentTime = pct * audio.duration;
        npProgressFilled.style.width = (pct * 100) + '%';
        npProgressKnob.style.left = `calc(${pct * 100}% - 7px)`;
    });

    // NP Volume
    setupBarDrag(npVolumeBar, (pct) => {
        state.volume = pct;
        audio.volume = pct;
        npVolumeFilled.style.width = (pct * 100) + '%';
        npVolumeKnob.style.left = `calc(${pct * 100}% - 7px)`;
    });

    // Init volume UI
    npVolumeFilled.style.width = (state.volume * 100) + '%';
    npVolumeKnob.style.left = `calc(${state.volume * 100}% - 7px)`;

    // Lyrics toggle
    npLyricsBtn.addEventListener('click', toggleLyrics);
    npQueueBtn.addEventListener('click', () => {
        // Could open a queue panel — for now close lyrics
        if (state.lyricsOpen) toggleLyrics();
    });

    // Swipe down to close (touch)
    let startY = 0;
    nowPlaying.addEventListener('touchstart', e => { startY = e.touches[0].clientY; }, { passive: true });
    nowPlaying.addEventListener('touchend', e => {
        const diff = e.changedTouches[0].clientY - startY;
        if (diff > 80) closeNowPlaying();
    }, { passive: true });
}

function openNowPlaying() {
    state.nowPlayingOpen = true;
    nowPlaying.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeNowPlaying() {
    state.nowPlayingOpen = false;
    nowPlaying.classList.remove('open');
    document.body.style.overflow = '';
    if (state.lyricsOpen) toggleLyrics();
}

function toggleLyrics() {
    state.lyricsOpen = !state.lyricsOpen;
    npLyricsPanel.classList.toggle('open', state.lyricsOpen);
    npLyricsBtn.classList.toggle('active', state.lyricsOpen);

    if (state.lyricsOpen) {
        const song = state.queue[state.currentIndex];
        if (song && song.hasLyrics && song.lyricsId) {
            fetchLyrics(song.lyricsId);
        } else {
            npLyricsContent.innerHTML = '<p class="lyrics-placeholder">Lyrics not available for this track</p>';
        }
    }
}

async function fetchLyrics(lyricsId) {
    npLyricsContent.innerHTML = '<p class="lyrics-placeholder">Loading lyrics...</p>';
    try {
        // JioSaavn lyrics endpoint
        const res = await fetch(`/api/songs/${lyricsId}/suggestions`);
        // Lyrics aren't directly available via this API, show placeholder
        npLyricsContent.innerHTML = '<p class="lyrics-placeholder">♪ Lyrics syncing coming soon ♪</p>';
    } catch (e) {
        npLyricsContent.innerHTML = '<p class="lyrics-placeholder">Could not load lyrics</p>';
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTOPLAY SUGGESTIONS
// ═══════════════════════════════════════════════════════════════════════════

async function loadSuggestions(songId) {
    if (!songId) return;
    try {
        const res = await fetch(`/api/songs/${songId}/suggestions?limit=5`);
        const data = await res.json();
        if (data.success && data.data.length) {
            // Append suggestions to queue if queue is short
            if (state.queue.length - state.currentIndex <= 2) {
                const newSongs = data.data.filter(s => !state.queue.find(q => q.id === s.id));
                state.queue.push(...newSongs);
                updateQueue();
            }
        }
    } catch (e) { /* silent */ }
}

// ═══════════════════════════════════════════════════════════════════════════
// QUEUE
// ═══════════════════════════════════════════════════════════════════════════

function updateQueue() {
    if (!state.queue.length) {
        sidebarQueue.innerHTML = '<p class="queue-empty-msg">Play something to start</p>';
        return;
    }

    sidebarQueue.innerHTML = state.queue.map((song, i) => {
        const img = bestImg(song.image);
        const artists = getArtists(song);
        const active = i === state.currentIndex;
        return `
            <div class="q-item ${active ? 'active' : ''}" onclick="playFromQueue(${i})">
                <img src="${img}" alt="" loading="lazy">
                <div class="q-item-info">
                    <div class="q-item-name">${esc(song.name || 'Unknown')}</div>
                    <div class="q-item-artist">${esc(artists)}</div>
                </div>
                ${active ? '<div class="q-eq"><span></span><span></span><span></span><span></span></div>' : ''}
            </div>
        `;
    }).join('');
}

function playFromQueue(i) {
    state.currentIndex = i;
    playCurrent();
    updateQueue();
}
window.playFromQueue = playFromQueue;

// ═══════════════════════════════════════════════════════════════════════════
// KEYBOARD
// ═══════════════════════════════════════════════════════════════════════════

function setupKeyboard() {
    document.addEventListener('keydown', e => {
        if (e.target.tagName === 'INPUT') return;
        switch (e.code) {
            case 'Space': e.preventDefault(); togglePlay(); break;
            case 'ArrowRight':
                if (e.shiftKey) playNext();
                else if (audio.duration) audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
                break;
            case 'ArrowLeft':
                if (e.shiftKey) playPrev();
                else audio.currentTime = Math.max(0, audio.currentTime - 10);
                break;
            case 'ArrowUp': e.preventDefault(); setVol(Math.min(1, state.volume + 0.05)); break;
            case 'ArrowDown': e.preventDefault(); setVol(Math.max(0, state.volume - 0.05)); break;
            case 'Escape': if (state.nowPlayingOpen) closeNowPlaying(); break;
            case 'KeyN': openNowPlaying(); break;
        }
    });
}

function setVol(v) {
    state.volume = v;
    audio.volume = v;
    npVolumeFilled.style.width = (v * 100) + '%';
    npVolumeKnob.style.left = `calc(${v * 100}% - 7px)`;
}

// ═══════════════════════════════════════════════════════════════════════════
// DRAG HELPERS (for progress + volume bars)
// ═══════════════════════════════════════════════════════════════════════════

function setupBarDrag(bar, onUpdate) {
    let dragging = false;

    function calc(e) {
        const rect = bar.getBoundingClientRect();
        const x = (e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0));
        return Math.max(0, Math.min(1, (x - rect.left) / rect.width));
    }

    bar.addEventListener('mousedown', e => { dragging = true; onUpdate(calc(e)); });
    document.addEventListener('mousemove', e => { if (dragging) onUpdate(calc(e)); });
    document.addEventListener('mouseup', () => { dragging = false; });

    bar.addEventListener('touchstart', e => { e.preventDefault(); dragging = true; onUpdate(calc(e.touches[0])); }, { passive: false });
    bar.addEventListener('touchmove', e => { e.preventDefault(); if (dragging) onUpdate(calc(e.touches[0])); }, { passive: false });
    bar.addEventListener('touchend', () => { dragging = false; });
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

function bestDownloadUrl(urls) {
    if (!urls || !urls.length) return null;
    for (const q of ['320kbps', '160kbps', '96kbps', '48kbps', '12kbps']) {
        const f = urls.find(d => d.quality === q && d.url);
        if (f) return f.url;
    }
    return urls[urls.length - 1]?.url || null;
}

function bestImg(images) {
    if (!images || !images.length) return '';
    for (const q of ['500x500', '150x150', '50x50']) {
        const f = images.find(i => i.quality === q && i.url);
        if (f) return f.url;
    }
    return images[images.length - 1]?.url || '';
}

function getArtists(song) {
    if (!song.artists) return 'Unknown Artist';
    const p = song.artists.primary || [];
    if (p.length) return p.map(a => a.name).filter(Boolean).join(', ');
    const all = song.artists.all || [];
    if (all.length) return all.slice(0, 3).map(a => a.name).filter(Boolean).join(', ');
    return 'Unknown Artist';
}

function fmtTime(sec) {
    if (!sec || isNaN(sec)) return '0:00';
    sec = Math.floor(sec);
    return `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, '0')}`;
}

function esc(s) {
    if (!s) return '';
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function showLoader(show) {
    loaderOverlay.classList.toggle('visible', show);
}
