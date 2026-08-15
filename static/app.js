/**
 * Savan — Premium Music Player
 * Categorised, professional UI/UX
 * Credits: @ab_devs
 */

// ─── State ────────────────────────────────────────────────────────────────────

const state = {
    queue: [],
    currentIndex: -1,
    isPlaying: false,
    shuffle: false,
    repeat: 'off',
    volume: 0.7,
    searchTimeout: null,
    _searchResults: [],
    _trendingSongs: [],
    _newReleases: [],
};

// ─── DOM Helpers ──────────────────────────────────────────────────────────────

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ─── Elements ─────────────────────────────────────────────────────────────────

const audio = $('#audioPlayer');
const playerImg = $('#playerImg');
const playerAlbumArt = $('#playerAlbumArt');
const playerSongName = $('#playerSongName');
const playerArtistName = $('#playerArtistName');
const btnPlay = $('#btnPlay');
const btnPrev = $('#btnPrev');
const btnNext = $('#btnNext');
const btnShuffle = $('#btnShuffle');
const btnRepeat = $('#btnRepeat');
const playIcon = $('#playIcon');
const pauseIcon = $('#pauseIcon');
const progressBar = $('#progressBar');
const progressFilled = $('#progressFilled');
const progressThumb = $('#progressThumb');
const currentTimeEl = $('#currentTime');
const totalTimeEl = $('#totalTime');
const volumeBar = $('#volumeBar');
const volumeFilled = $('#volumeFilled');
const volumeThumb = $('#volumeThumb');
const btnVolume = $('#btnVolume');
const searchInput = $('#searchInput');
const searchClear = $('#searchClear');
const searchResults = $('#searchResults');
const queueList = $('#queueList');
const queueCount = $('#queueCount');
const trendingGrid = $('#trendingGrid');
const newReleasesGrid = $('#newReleasesGrid');
const topArtistsGrid = $('#topArtistsGrid');
const quickPicksGrid = $('#quickPicksGrid');
const loadingOverlay = $('#loadingOverlay');
const greetingEl = $('#greeting');
const playerProgressTop = $('#playerProgressFilledTop');

// ─── Init ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    setGreeting();
    setupNavigation();
    setupPlayerControls();
    setupProgressBar();
    setupVolumeBar();
    setupSearch();
    setupMobilePlayer();
    loadHomeContent();
    audio.volume = state.volume;
});

// ─── Greeting ─────────────────────────────────────────────────────────────────

function setGreeting() {
    const hour = new Date().getHours();
    let greeting = 'Good Evening';
    if (hour < 12) greeting = 'Good Morning';
    else if (hour < 17) greeting = 'Good Afternoon';
    greetingEl.textContent = greeting;
}

// ─── Navigation ───────────────────────────────────────────────────────────────

function setupNavigation() {
    $$('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            switchPage(item.dataset.page);
        });
    });

    $$('.mobile-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            switchPage(tab.dataset.page);
        });
    });
}

function switchPage(page) {
    // Desktop nav
    $$('.nav-item').forEach(n => n.classList.remove('active'));
    const desktopItem = $(`.nav-item[data-page="${page}"]`);
    if (desktopItem) desktopItem.classList.add('active');

    // Mobile nav
    $$('.mobile-tab').forEach(t => t.classList.remove('active'));
    const mobileTab = $(`.mobile-tab[data-page="${page}"]`);
    if (mobileTab) mobileTab.classList.add('active');

    // Pages
    $$('.page').forEach(p => p.classList.remove('active'));
    const pageEl = $(`#${page}Page`);
    if (pageEl) pageEl.classList.add('active');

    if (page === 'search') {
        setTimeout(() => searchInput.focus(), 150);
    }

    // Scroll to top
    const mainContent = $('#mainContent');
    if (mainContent) mainContent.scrollTop = 0;
}

// Make switchPage globally accessible
window.switchPage = switchPage;

// ─── Home Content Loading ─────────────────────────────────────────────────────

async function loadHomeContent() {
    await Promise.all([
        loadQuickPicks(),
        loadTrending(),
        loadNewReleases(),
        loadTopArtists(),
    ]);
}

async function loadQuickPicks() {
    try {
        const res = await fetch('/api/search/songs?query=Hindi Top&limit=6');
        const data = await res.json();
        if (data.success && data.data.results.length) {
            renderQuickPicks(data.data.results);
            state._quickPicks = data.data.results;
        }
    } catch (e) { /* silent */ }
}

function renderQuickPicks(songs) {
    quickPicksGrid.innerHTML = songs.map((song, i) => {
        const img = getBestImage(song.image);
        return `
            <div class="quick-pick-card" onclick="playFromQuickPicks(${i})">
                <img class="quick-pick-img" src="${img}" alt="" loading="lazy">
                <div class="quick-pick-info">
                    <div class="quick-pick-name">${esc(song.name || 'Unknown')}</div>
                </div>
                <div class="quick-pick-play">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="black"><path d="M8 5v14l11-7z"/></svg>
                </div>
            </div>
        `;
    }).join('');
}

async function loadTrending() {
    try {
        const res = await fetch('/api/search/songs?query=Trending Bollywood 2024&limit=12');
        const data = await res.json();
        if (data.success && data.data.results.length) {
            renderSongCards(data.data.results, trendingGrid, 'Trending');
            state._trendingSongs = data.data.results;
        }
    } catch (e) {
        trendingGrid.innerHTML = '';
    }
}

async function loadNewReleases() {
    try {
        const res = await fetch('/api/search/songs?query=New Hindi Songs 2024&limit=12');
        const data = await res.json();
        if (data.success && data.data.results.length) {
            renderSongCards(data.data.results, newReleasesGrid, 'NewRelease');
            state._newReleases = data.data.results;
        }
    } catch (e) {
        newReleasesGrid.innerHTML = '';
    }
}

async function loadTopArtists() {
    const artists = ['Arijit Singh', 'Pritam', 'AP Dhillon', 'Diljit Dosanjh', 'Shreya Ghoshal', 'Atif Aslam', 'Jubin Nautiyal', 'Badshah'];
    
    try {
        const res = await fetch(`/api/search/artists?query=Arijit Singh&limit=8`);
        const data = await res.json();
        if (data.success && data.data.results.length) {
            renderTopArtists(data.data.results);
        }
    } catch (e) {
        // Fallback — create artist cards from known names
        topArtistsGrid.innerHTML = artists.map(name => `
            <div class="artist-card" onclick="searchAndPlay('${name}')">
                <div class="artist-img" style="background: var(--bg-elevated); display:flex; align-items:center; justify-content:center; font-size:2rem;">🎤</div>
                <div class="artist-name">${name}</div>
                <div class="artist-label">Artist</div>
            </div>
        `).join('');
    }
}

function renderTopArtists(artists) {
    topArtistsGrid.innerHTML = artists.map(artist => {
        const img = getBestImage(artist.image);
        return `
            <div class="artist-card" onclick="searchAndPlay('${esc(artist.name || '')}')">
                <img class="artist-img" src="${img || ''}" alt="${esc(artist.name || '')}" loading="lazy" onerror="this.style.display='none'">
                <div class="artist-name">${esc(artist.name || 'Unknown')}</div>
                <div class="artist-label">Artist</div>
            </div>
        `;
    }).join('');
}

function renderSongCards(songs, container, source) {
    container.innerHTML = songs.map((song, i) => {
        const img = getBestImage(song.image);
        const artists = getArtistNames(song);
        return `
            <div class="song-card" onclick="playFrom${source}(${i})">
                <div class="card-img-wrapper">
                    <img src="${img}" alt="${esc(song.name || '')}" loading="lazy">
                    <button class="card-play-btn" onclick="event.stopPropagation(); playFrom${source}(${i})">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="black"><path d="M8 5v14l11-7z"/></svg>
                    </button>
                </div>
                <div class="card-title">${esc(song.name || 'Unknown')}</div>
                <div class="card-artist">${esc(artists)}</div>
            </div>
        `;
    }).join('');
}

// ─── Play Functions ───────────────────────────────────────────────────────────

function playFromQuickPicks(i) {
    state.queue = state._quickPicks || [];
    state.currentIndex = i;
    playCurrent();
    updateQueueUI();
}

function playFromTrending(i) {
    state.queue = state._trendingSongs || [];
    state.currentIndex = i;
    playCurrent();
    updateQueueUI();
}

function playFromNewRelease(i) {
    state.queue = state._newReleases || [];
    state.currentIndex = i;
    playCurrent();
    updateQueueUI();
}

function playFromSearch(i) {
    state.queue = state._searchResults || [];
    state.currentIndex = i;
    playCurrent();
    updateQueueUI();
}

function playFromQueue(i) {
    state.currentIndex = i;
    playCurrent();
    updateQueueUI();
}

async function searchAndPlay(query) {
    showLoading(true);
    try {
        const res = await fetch(`/api/search/songs?query=${encodeURIComponent(query)}&limit=20`);
        const data = await res.json();
        if (data.success && data.data.results.length) {
            state.queue = data.data.results;
            state.currentIndex = 0;
            playCurrent();
            updateQueueUI();
        }
    } catch (e) { /* silent */ }
    showLoading(false);
}

async function searchGenre(genre) {
    switchPage('search');
    searchInput.value = genre;
    searchClear.classList.add('visible');
    await performSearch(genre);
}

// Make functions globally accessible
window.playFromQuickPicks = playFromQuickPicks;
window.playFromTrending = playFromTrending;
window.playFromNewRelease = playFromNewRelease;
window.playFromSearch = playFromSearch;
window.playFromQueue = playFromQueue;
window.searchAndPlay = searchAndPlay;
window.searchGenre = searchGenre;

// ─── Search ───────────────────────────────────────────────────────────────────

function setupSearch() {
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim();
        searchClear.classList.toggle('visible', query.length > 0);

        clearTimeout(state.searchTimeout);
        if (query.length < 2) {
            showSearchPlaceholder();
            return;
        }

        state.searchTimeout = setTimeout(() => performSearch(query), 400);
    });

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            clearTimeout(state.searchTimeout);
            const query = searchInput.value.trim();
            if (query.length >= 2) performSearch(query);
        }
    });

    searchClear.addEventListener('click', () => {
        searchInput.value = '';
        searchClear.classList.remove('visible');
        showSearchPlaceholder();
        searchInput.focus();
    });
}

async function performSearch(query) {
    showLoading(true);
    try {
        const res = await fetch(`/api/search/songs?query=${encodeURIComponent(query)}&limit=25`);
        const data = await res.json();

        if (!data.success || !data.data.results.length) {
            searchResults.innerHTML = `
                <div class="no-results">
                    <h3>No results for "${esc(query)}"</h3>
                    <p>Try different keywords or browse categories</p>
                </div>
            `;
            return;
        }

        state._searchResults = data.data.results;
        renderSearchResults(data.data.results);
    } catch (err) {
        searchResults.innerHTML = `
            <div class="no-results">
                <h3>Something went wrong</h3>
                <p>Please check your connection and try again</p>
            </div>
        `;
    } finally {
        showLoading(false);
    }
}

function renderSearchResults(songs) {
    let html = `<div class="results-section"><h3>Songs • ${songs.length} results</h3><div class="song-list">`;

    songs.forEach((song, i) => {
        const artists = getArtistNames(song);
        const img = getBestImage(song.image);
        const duration = formatTime(song.duration || 0);

        html += `
            <div class="song-row" style="--i:${i+1}" data-index="${i}" onclick="playFromSearch(${i})">
                <div>
                    <span class="song-row-num">${i + 1}</span>
                    <span class="song-row-play">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    </span>
                </div>
                <div class="song-row-info">
                    <img class="song-row-img" src="${img}" alt="" loading="lazy">
                    <div class="song-row-details">
                        <div class="song-row-title">${esc(song.name || 'Unknown')}</div>
                        <div class="song-row-artist">${esc(artists)}</div>
                    </div>
                </div>
                <div class="song-row-album">${esc(song.album?.name || '')}</div>
                <div class="song-row-duration">${duration}</div>
            </div>
        `;
    });

    html += `</div></div>`;
    searchResults.innerHTML = html;
}

function showSearchPlaceholder() {
    searchResults.innerHTML = `
        <div class="search-placeholder">
            <div class="search-placeholder-icon">
                <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <h2>Discover Music</h2>
            <p>Search for songs, artists, or albums</p>
        </div>
    `;
}

// ─── Playback ─────────────────────────────────────────────────────────────────

function playCurrent() {
    const song = state.queue[state.currentIndex];
    if (!song) return;

    const downloadUrl = getBestDownloadUrl(song.downloadUrl);
    if (!downloadUrl) {
        playNext();
        return;
    }

    audio.src = downloadUrl;
    audio.play().then(() => {
        state.isPlaying = true;
        updatePlayButton();
        updatePlayerInfo(song);
        updateNowPlayingHighlight();
    }).catch(err => {
        console.error('Playback failed:', err);
        state.isPlaying = false;
        updatePlayButton();
    });
}

function updatePlayerInfo(song) {
    const img = getBestImage(song.image);
    const artists = getArtistNames(song);

    playerImg.src = img;
    playerImg.onload = () => playerImg.classList.add('loaded');
    playerSongName.textContent = song.name || 'Unknown';
    playerSongName.classList.add('active');
    playerArtistName.textContent = artists;

    document.title = `${song.name} — Savan`;
    playerAlbumArt.classList.add('playing');
}

function togglePlay() {
    if (!audio.src || state.queue.length === 0) return;

    if (state.isPlaying) {
        audio.pause();
        state.isPlaying = false;
        playerAlbumArt.classList.remove('playing');
    } else {
        audio.play().catch(() => {});
        state.isPlaying = true;
        playerAlbumArt.classList.add('playing');
    }
    updatePlayButton();
}

function playNext() {
    if (state.queue.length === 0) return;

    if (state.repeat === 'one') {
        audio.currentTime = 0;
        audio.play();
        return;
    }

    let nextIndex;
    if (state.shuffle) {
        nextIndex = Math.floor(Math.random() * state.queue.length);
    } else {
        nextIndex = state.currentIndex + 1;
    }

    if (nextIndex >= state.queue.length) {
        if (state.repeat === 'all') {
            nextIndex = 0;
        } else {
            state.isPlaying = false;
            updatePlayButton();
            playerAlbumArt.classList.remove('playing');
            return;
        }
    }

    state.currentIndex = nextIndex;
    playCurrent();
    updateQueueUI();
}

function playPrev() {
    if (state.queue.length === 0) return;

    if (audio.currentTime > 3) {
        audio.currentTime = 0;
        return;
    }

    let prevIndex = state.currentIndex - 1;
    if (prevIndex < 0) {
        prevIndex = state.repeat === 'all' ? state.queue.length - 1 : 0;
    }

    state.currentIndex = prevIndex;
    playCurrent();
    updateQueueUI();
}

function updatePlayButton() {
    if (state.isPlaying) {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
    } else {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
    }
    // Update mobile play button too
    const mobilePlayBtn = $('#mobilePlayBtn');
    if (mobilePlayBtn) {
        mobilePlayBtn.innerHTML = state.isPlaying 
            ? '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>'
            : '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
    }
}

function updateNowPlayingHighlight() {
    $$('.song-row').forEach(row => row.classList.remove('playing'));
    const activeRow = $(`.song-row[data-index="${state.currentIndex}"]`);
    if (activeRow) activeRow.classList.add('playing');
}

// ─── Mobile Player ────────────────────────────────────────────────────────────

function setupMobilePlayer() {
    // Add mobile play/next buttons to player-right on mobile
    const playerRight = $('.player-right');
    if (playerRight) {
        const mobileBtn = document.createElement('button');
        mobileBtn.className = 'control-btn';
        mobileBtn.id = 'mobilePlayBtn';
        mobileBtn.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
        mobileBtn.addEventListener('click', togglePlay);
        playerRight.prepend(mobileBtn);

        const mobileNextBtn = document.createElement('button');
        mobileNextBtn.className = 'control-btn';
        mobileNextBtn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>';
        mobileNextBtn.addEventListener('click', playNext);
        playerRight.appendChild(mobileNextBtn);
    }
}

// ─── Player Controls ──────────────────────────────────────────────────────────

function setupPlayerControls() {
    btnPlay.addEventListener('click', togglePlay);
    btnNext.addEventListener('click', playNext);
    btnPrev.addEventListener('click', playPrev);

    btnShuffle.addEventListener('click', () => {
        state.shuffle = !state.shuffle;
        btnShuffle.classList.toggle('active', state.shuffle);
    });

    btnRepeat.addEventListener('click', () => {
        const modes = ['off', 'all', 'one'];
        const current = modes.indexOf(state.repeat);
        state.repeat = modes[(current + 1) % 3];
        btnRepeat.classList.toggle('active', state.repeat !== 'off');
    });

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', () => {
        totalTimeEl.textContent = formatTime(audio.duration);
    });
    audio.addEventListener('ended', playNext);
    audio.addEventListener('error', () => {
        setTimeout(playNext, 1000);
    });

    // Keyboard
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT') return;
        switch(e.code) {
            case 'Space': e.preventDefault(); togglePlay(); break;
            case 'ArrowRight':
                if (e.shiftKey) playNext();
                else if (audio.duration) audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
                break;
            case 'ArrowLeft':
                if (e.shiftKey) playPrev();
                else audio.currentTime = Math.max(0, audio.currentTime - 10);
                break;
            case 'ArrowUp': e.preventDefault(); setVolume(Math.min(1, state.volume + 0.05)); break;
            case 'ArrowDown': e.preventDefault(); setVolume(Math.max(0, state.volume - 0.05)); break;
        }
    });
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function setupProgressBar() {
    let isDragging = false;

    function seekTo(e) {
        const rect = progressBar.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        if (audio.duration) audio.currentTime = percent * audio.duration;
        updateProgressUI(percent);
    }

    progressBar.addEventListener('mousedown', (e) => { isDragging = true; seekTo(e); });
    document.addEventListener('mousemove', (e) => { if (isDragging) seekTo(e); });
    document.addEventListener('mouseup', () => { isDragging = false; });

    progressBar.addEventListener('touchstart', (e) => { e.preventDefault(); isDragging = true; seekTo(e.touches[0]); }, { passive: false });
    progressBar.addEventListener('touchmove', (e) => { e.preventDefault(); if (isDragging) seekTo(e.touches[0]); }, { passive: false });
    progressBar.addEventListener('touchend', () => { isDragging = false; });
}

function updateProgress() {
    if (!audio.duration) return;
    const percent = audio.currentTime / audio.duration;
    updateProgressUI(percent);
    currentTimeEl.textContent = formatTime(audio.currentTime);

    // Update mobile top progress bar
    if (playerProgressTop) {
        playerProgressTop.style.width = (percent * 100) + '%';
    }
}

function updateProgressUI(percent) {
    const pct = (percent * 100) + '%';
    progressFilled.style.width = pct;
    progressThumb.style.left = `calc(${pct} - 6px)`;
}

// ─── Volume ───────────────────────────────────────────────────────────────────

function setupVolumeBar() {
    let isDragging = false;

    function setVolumeFromEvent(e) {
        const rect = volumeBar.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        setVolume(percent);
    }

    volumeBar.addEventListener('mousedown', (e) => { isDragging = true; setVolumeFromEvent(e); });
    document.addEventListener('mousemove', (e) => { if (isDragging) setVolumeFromEvent(e); });
    document.addEventListener('mouseup', () => { isDragging = false; });

    volumeBar.addEventListener('touchstart', (e) => { e.preventDefault(); isDragging = true; setVolumeFromEvent(e.touches[0]); }, { passive: false });
    volumeBar.addEventListener('touchmove', (e) => { e.preventDefault(); if (isDragging) setVolumeFromEvent(e.touches[0]); }, { passive: false });
    volumeBar.addEventListener('touchend', () => { isDragging = false; });

    btnVolume.addEventListener('click', () => {
        if (state.volume > 0) { state._prevVolume = state.volume; setVolume(0); }
        else setVolume(state._prevVolume || 0.7);
    });

    updateVolumeUI(state.volume);
}

function setVolume(val) {
    state.volume = val;
    audio.volume = val;
    updateVolumeUI(val);
}

function updateVolumeUI(val) {
    const pct = (val * 100) + '%';
    volumeFilled.style.width = pct;
    volumeThumb.style.left = `calc(${pct} - 6px)`;
}

// ─── Queue UI ─────────────────────────────────────────────────────────────────

function updateQueueUI() {
    queueCount.textContent = state.queue.length;
    const queueEmpty = $('.queue-empty');

    if (state.queue.length === 0) {
        if (queueEmpty) queueEmpty.style.display = 'block';
        queueList.innerHTML = '';
        return;
    }

    if (queueEmpty) queueEmpty.style.display = 'none';

    queueList.innerHTML = state.queue.map((song, i) => {
        const img = getBestImage(song.image);
        const artists = getArtistNames(song);
        const isActive = i === state.currentIndex;
        return `
            <li class="queue-item ${isActive ? 'active' : ''}" onclick="playFromQueue(${i})">
                <img src="${img}" alt="" loading="lazy">
                <div class="queue-item-info">
                    <div class="queue-item-name">${esc(song.name || 'Unknown')}</div>
                    <div class="queue-item-artist">${esc(artists)}</div>
                </div>
                ${isActive ? '<div class="equalizer"><span></span><span></span><span></span><span></span></div>' : ''}
            </li>
        `;
    }).join('');
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function getBestDownloadUrl(urls) {
    if (!urls || !urls.length) return null;
    const preferred = ['320kbps', '160kbps', '96kbps', '48kbps', '12kbps'];
    for (const q of preferred) {
        const found = urls.find(d => d.quality === q);
        if (found && found.url) return found.url;
    }
    return urls[urls.length - 1]?.url || null;
}

function getBestImage(images) {
    if (!images || !images.length) return '';
    const preferred = ['500x500', '150x150', '50x50'];
    for (const q of preferred) {
        const found = images.find(img => img.quality === q);
        if (found && found.url) return found.url;
    }
    return images[images.length - 1]?.url || '';
}

function getArtistNames(song) {
    if (!song.artists) return 'Unknown Artist';
    const primary = song.artists.primary || [];
    if (primary.length) return primary.map(a => a.name).filter(Boolean).join(', ');
    const all = song.artists.all || [];
    if (all.length) return all.slice(0, 3).map(a => a.name).filter(Boolean).join(', ');
    return 'Unknown Artist';
}

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    seconds = Math.floor(seconds);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function esc(str) {
    if (!str) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return str.replace(/[&<>"']/g, c => map[c]);
}

function showLoading(show) {
    loadingOverlay.classList.toggle('visible', show);
}
