/**
 * Savan — Spotify-like Music Player
 * Full-featured player with search, playback, queue management
 * Credits: @ab_devs
 */

// ─── State ────────────────────────────────────────────────────────────────────

const state = {
    queue: [],
    currentIndex: -1,
    isPlaying: false,
    shuffle: false,
    repeat: 'off', // off, all, one
    volume: 0.7,
    searchTimeout: null,
};

// ─── DOM Elements ─────────────────────────────────────────────────────────────

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const audio = $('#audioPlayer');
const playerBar = $('#playerBar');
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
const trendingGrid = $('#trendingGrid');
const loadingOverlay = $('#loadingOverlay');
const greetingEl = $('#greeting');

// ─── Init ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    setGreeting();
    setupNavigation();
    setupPlayerControls();
    setupProgressBar();
    setupVolumeBar();
    setupSearch();
    loadTrending();
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
            const page = item.dataset.page;
            switchPage(page);
        });
    });
}

function switchPage(page) {
    $$('.nav-item').forEach(n => n.classList.remove('active'));
    $(`.nav-item[data-page="${page}"]`).classList.add('active');
    $$('.page').forEach(p => p.classList.remove('active'));
    $(`#${page}Page`).classList.add('active');

    if (page === 'search') {
        setTimeout(() => searchInput.focus(), 100);
    }
}

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
        const res = await fetch(`/api/search/songs?query=${encodeURIComponent(query)}&limit=20`);
        const data = await res.json();

        if (!data.success || !data.data.results.length) {
            searchResults.innerHTML = `
                <div class="no-results">
                    <h3>No results found</h3>
                    <p>Try searching for something else</p>
                </div>
            `;
            return;
        }

        renderSearchResults(data.data.results);
    } catch (err) {
        searchResults.innerHTML = `
            <div class="no-results">
                <h3>Something went wrong</h3>
                <p>Please try again later</p>
            </div>
        `;
    } finally {
        showLoading(false);
    }
}

function renderSearchResults(songs) {
    let html = `<div class="results-section"><h3>Songs</h3><div class="song-list">`;

    songs.forEach((song, i) => {
        const artists = getArtistNames(song);
        const img = getBestImage(song.image);
        const duration = formatTime(song.duration || 0);

        html += `
            <div class="song-row" data-index="${i}" onclick="playFromSearch(${i})">
                <div>
                    <span class="song-row-num">${i + 1}</span>
                    <span class="song-row-play">
                        <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z"/></svg>
                    </span>
                </div>
                <div class="song-row-info">
                    <img class="song-row-img" src="${img}" alt="" loading="lazy">
                    <div class="song-row-details">
                        <div class="song-row-title">${escapeHtml(song.name || 'Unknown')}</div>
                        <div class="song-row-artist">${escapeHtml(artists)}</div>
                    </div>
                </div>
                <div class="song-row-album">${escapeHtml(song.album?.name || '')}</div>
                <div class="song-row-duration">${duration}</div>
            </div>
        `;
    });

    html += `</div></div>`;
    searchResults.innerHTML = html;

    // Store search results for playback
    state._searchResults = songs;
}

function showSearchPlaceholder() {
    searchResults.innerHTML = `
        <div class="search-placeholder">
            <svg viewBox="0 0 24 24" width="64" height="64" fill="currentColor" opacity="0.3"><path d="M10.533 1.279c-5.18 0-9.407 4.14-9.407 9.279s4.226 9.279 9.407 9.279c2.234 0 4.29-.77 5.907-2.058l4.353 4.353a1 1 0 1 0 1.414-1.414l-4.344-4.344a9.157 9.157 0 0 0 2.077-5.816c0-5.14-4.226-9.28-9.407-9.28zm-7.407 9.28c0-4.006 3.302-7.28 7.407-7.28s7.407 3.274 7.407 7.28-3.302 7.279-7.407 7.279-7.407-3.273-7.407-7.28z"/></svg>
            <h2>Search for songs</h2>
            <p>Find your favourite songs, albums, and artists</p>
        </div>
    `;
}

// ─── Play from Search ─────────────────────────────────────────────────────────

function playFromSearch(index) {
    const songs = state._searchResults || [];
    if (!songs.length) return;

    state.queue = songs;
    state.currentIndex = index;
    playCurrent();
    updateQueueUI();
}

// ─── Trending ─────────────────────────────────────────────────────────────────

async function loadTrending() {
    const queries = ['Arijit Singh', 'Pritam', 'Diljit', 'AP Dhillon', 'Atif Aslam'];
    const randomQuery = queries[Math.floor(Math.random() * queries.length)];

    try {
        const res = await fetch(`/api/search/songs?query=${encodeURIComponent(randomQuery)}&limit=10`);
        const data = await res.json();

        if (data.success && data.data.results.length) {
            renderTrendingCards(data.data.results);
            state._trendingSongs = data.data.results;
        }
    } catch (err) {
        trendingGrid.innerHTML = `<p style="color: var(--text-subdued);">Could not load trending songs</p>`;
    }
}

function renderTrendingCards(songs) {
    trendingGrid.innerHTML = songs.map((song, i) => {
        const img = getBestImage(song.image);
        const artists = getArtistNames(song);
        return `
            <div class="song-card" onclick="playFromTrending(${i})">
                <div class="card-img-wrapper">
                    <img src="${img}" alt="${escapeHtml(song.name || '')}" loading="lazy">
                    <button class="card-play-btn" onclick="event.stopPropagation(); playFromTrending(${i})">
                        <svg viewBox="0 0 16 16" width="20" height="20" fill="black"><path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z"/></svg>
                    </button>
                </div>
                <div class="card-title">${escapeHtml(song.name || 'Unknown')}</div>
                <div class="card-artist">${escapeHtml(artists)}</div>
            </div>
        `;
    }).join('');
}

function playFromTrending(index) {
    const songs = state._trendingSongs || [];
    if (!songs.length) return;

    state.queue = songs;
    state.currentIndex = index;
    playCurrent();
    updateQueueUI();
}

// ─── Playback ─────────────────────────────────────────────────────────────────

function playCurrent() {
    const song = state.queue[state.currentIndex];
    if (!song) return;

    // Find best quality download URL
    const downloadUrl = getBestDownloadUrl(song.downloadUrl);
    if (!downloadUrl) {
        console.warn('No download URL for song:', song.name);
        // Try next song
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

    // Update page title
    document.title = `${song.name} • Savan`;

    // Album art animation
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

    // If more than 3 seconds in, restart song
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
}

function updateNowPlayingHighlight() {
    $$('.song-row').forEach(row => row.classList.remove('playing'));
    const activeRow = $(`.song-row[data-index="${state.currentIndex}"]`);
    if (activeRow) activeRow.classList.add('playing');
}

// ─── Player Controls Setup ────────────────────────────────────────────────────

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
        if (state.repeat === 'one') {
            btnRepeat.innerHTML = `<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M0 4.75A3.75 3.75 0 0 1 3.75 1h8.5A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l1.018 1.018a.75.75 0 1 1-1.06 1.06L7.46 13.27a.75.75 0 0 1 0-1.06l2.308-2.308a.75.75 0 0 1 1.06 1.06L9.811 12h2.439a2.25 2.25 0 0 0 2.25-2.25v-5a2.25 2.25 0 0 0-2.25-2.25h-8.5A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75v-5z"/><text x="8" y="11" text-anchor="middle" font-size="7" font-weight="bold">1</text></svg>`;
        } else {
            btnRepeat.innerHTML = `<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M0 4.75A3.75 3.75 0 0 1 3.75 1h8.5A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l1.018 1.018a.75.75 0 1 1-1.06 1.06L7.46 13.27a.75.75 0 0 1 0-1.06l2.308-2.308a.75.75 0 0 1 1.06 1.06L9.811 12h2.439a2.25 2.25 0 0 0 2.25-2.25v-5a2.25 2.25 0 0 0-2.25-2.25h-8.5A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75v-5z"/></svg>`;
        }
    });

    // Audio events
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', () => {
        totalTimeEl.textContent = formatTime(audio.duration);
    });
    audio.addEventListener('ended', playNext);
    audio.addEventListener('error', () => {
        console.error('Audio error, trying next...');
        setTimeout(playNext, 1000);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT') return;

        switch(e.code) {
            case 'Space':
                e.preventDefault();
                togglePlay();
                break;
            case 'ArrowRight':
                if (e.shiftKey) playNext();
                else audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
                break;
            case 'ArrowLeft':
                if (e.shiftKey) playPrev();
                else audio.currentTime = Math.max(0, audio.currentTime - 10);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setVolume(Math.min(1, state.volume + 0.05));
                break;
            case 'ArrowDown':
                e.preventDefault();
                setVolume(Math.max(0, state.volume - 0.05));
                break;
        }
    });
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function setupProgressBar() {
    let isDragging = false;

    function seekTo(e) {
        const rect = progressBar.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        if (audio.duration) {
            audio.currentTime = percent * audio.duration;
        }
        updateProgressUI(percent);
    }

    progressBar.addEventListener('mousedown', (e) => {
        isDragging = true;
        seekTo(e);
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) seekTo(e);
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Touch support
    progressBar.addEventListener('touchstart', (e) => {
        isDragging = true;
        seekTo(e.touches[0]);
    });

    progressBar.addEventListener('touchmove', (e) => {
        if (isDragging) seekTo(e.touches[0]);
    });

    progressBar.addEventListener('touchend', () => {
        isDragging = false;
    });
}

function updateProgress() {
    if (!audio.duration) return;
    const percent = audio.currentTime / audio.duration;
    updateProgressUI(percent);
    currentTimeEl.textContent = formatTime(audio.currentTime);
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
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        setVolume(percent);
    }

    volumeBar.addEventListener('mousedown', (e) => {
        isDragging = true;
        setVolumeFromEvent(e);
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) setVolumeFromEvent(e);
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    btnVolume.addEventListener('click', () => {
        if (state.volume > 0) {
            state._prevVolume = state.volume;
            setVolume(0);
        } else {
            setVolume(state._prevVolume || 0.7);
        }
    });

    // Set initial volume UI
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

    // Update icon
    const volumeIcon = $('#volumeIcon');
    if (val === 0) {
        volumeIcon.innerHTML = `<path d="M13.86 5.47a.75.75 0 0 0-1.061 0l-1.47 1.47-1.47-1.47A.75.75 0 0 0 8.8 6.53L10.269 8l-1.47 1.47a.75.75 0 1 0 1.06 1.06l1.47-1.47 1.47 1.47a.75.75 0 0 0 1.06-1.06L12.39 8l1.47-1.47a.75.75 0 0 0 0-1.06z"/><path d="M10.116 1.5A.75.75 0 0 0 8.991.85l-6.925 4a3.642 3.642 0 0 0-1.33 4.967 3.639 3.639 0 0 0 1.33 1.332l6.925 4a.75.75 0 0 0 1.125-.649v-13z"/>`;
    } else if (val < 0.5) {
        volumeIcon.innerHTML = `<path d="M9.741.85a.75.75 0 0 1 .375.65v13a.75.75 0 0 1-1.125.65l-6.925-4a3.642 3.642 0 0 1-1.33-4.967 3.639 3.639 0 0 1 1.33-1.332l6.925-4a.75.75 0 0 1 .75 0zm-6.924 5.3a2.139 2.139 0 0 0 0 3.7l5.8 3.35V2.8l-5.8 3.35zm8.683 4.29V5.56a2.75 2.75 0 0 1 0 4.88z"/>`;
    } else {
        volumeIcon.innerHTML = `<path d="M9.741.85a.75.75 0 0 1 .375.65v13a.75.75 0 0 1-1.125.65l-6.925-4a3.642 3.642 0 0 1-1.33-4.967 3.639 3.639 0 0 1 1.33-1.332l6.925-4a.75.75 0 0 1 .75 0zm-6.924 5.3a2.139 2.139 0 0 0 0 3.7l5.8 3.35V2.8l-5.8 3.35zm8.683 4.29V5.56a2.75 2.75 0 0 1 0 4.88z"/><path d="M11.5 13.614a5.752 5.752 0 0 0 0-11.228v1.55a4.252 4.252 0 0 1 0 8.127v1.55z"/>`;
    }
}

// ─── Queue UI ─────────────────────────────────────────────────────────────────

function updateQueueUI() {
    const libraryEmpty = $('.library-empty');
    if (state.queue.length === 0) {
        if (libraryEmpty) libraryEmpty.style.display = 'block';
        queueList.innerHTML = '';
        return;
    }

    if (libraryEmpty) libraryEmpty.style.display = 'none';

    queueList.innerHTML = state.queue.map((song, i) => {
        const img = getBestImage(song.image);
        const artists = getArtistNames(song);
        const isActive = i === state.currentIndex;
        return `
            <li class="queue-item ${isActive ? 'active' : ''}" onclick="playFromQueue(${i})">
                <img src="${img}" alt="" loading="lazy">
                <div class="queue-item-info">
                    <div class="queue-item-name">${escapeHtml(song.name || 'Unknown')}</div>
                    <div class="queue-item-artist">${escapeHtml(artists)}</div>
                </div>
                ${isActive ? '<div class="equalizer"><span></span><span></span><span></span><span></span></div>' : ''}
            </li>
        `;
    }).join('');
}

function playFromQueue(index) {
    state.currentIndex = index;
    playCurrent();
    updateQueueUI();
}

// Make it globally accessible
window.playFromQueue = playFromQueue;
window.playFromSearch = playFromSearch;
window.playFromTrending = playFromTrending;

// ─── Utilities ────────────────────────────────────────────────────────────────

function getBestDownloadUrl(downloadUrls) {
    if (!downloadUrls || !downloadUrls.length) return null;
    // Prefer 320kbps > 160kbps > 96kbps > others
    const preferred = ['320kbps', '160kbps', '96kbps', '48kbps', '12kbps'];
    for (const quality of preferred) {
        const found = downloadUrls.find(d => d.quality === quality);
        if (found && found.url) return found.url;
    }
    // Fallback to last available
    const last = downloadUrls[downloadUrls.length - 1];
    return last ? last.url : null;
}

function getBestImage(images) {
    if (!images || !images.length) return '';
    // Prefer 500x500 > 150x150 > 50x50
    const preferred = ['500x500', '150x150', '50x50'];
    for (const quality of preferred) {
        const found = images.find(img => img.quality === quality);
        if (found && found.url) return found.url;
    }
    return images[images.length - 1]?.url || '';
}

function getArtistNames(song) {
    if (!song.artists) return 'Unknown Artist';
    const primary = song.artists.primary || [];
    if (primary.length) {
        return primary.map(a => a.name).filter(Boolean).join(', ');
    }
    const all = song.artists.all || [];
    if (all.length) {
        return all.slice(0, 3).map(a => a.name).filter(Boolean).join(', ');
    }
    return 'Unknown Artist';
}

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    seconds = Math.floor(seconds);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function escapeHtml(str) {
    if (!str) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return str.replace(/[&<>"']/g, c => map[c]);
}

function showLoading(show) {
    loadingOverlay.classList.toggle('visible', show);
}

// ─── Card mouse tracking for gradient effect ──────────────────────────────────

document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll('.song-card');
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mouse-x', x + '%');
        card.style.setProperty('--mouse-y', y + '%');
    });
});
