// MusicArea API Layer
// MusicArea API Layer — JioSaavn + YouTube Music
// JioSaavn: audio playback, lyrics, suggestions
// YT Music: search discovery, trending
// MusicArea API Layer

const BASE = 'https://jiosavan-api2.vercel.app/api';

// In-Memory Cache
const cache = new Map();
const CACHE_TTL = {
  search: 5 * 60 * 1000,    // 5 min
  song: 30 * 60 * 1000,     // 30 min
  album: 30 * 60 * 1000,    // 30 min
  suggestions: 10 * 60 * 1000, // 10 min
  lyrics: 60 * 60 * 1000,   // 1 hour (lyrics don't change)
};

function getCached(key, ttl) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() - item.time > ttl) { cache.delete(key); return null; }
  return item.data;
}

function setCache(key, data) { cache.set(key, { data, time: Date.now() }); }

// Request with Timeout & Retry
const activeRequests = new Map(); // Prevent duplicate concurrent requests

async function fetchApi(endpoint, { retries = 2, timeout = 8000 } = {}) {
  const url = `${BASE}${endpoint}`;

  // Dedup: if same request is already in-flight, return its promise
  if (activeRequests.has(url)) return activeRequests.get(url);

  const request = (async () => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);

        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timer);

        if (!res.ok) {
          if (attempt < retries) { await delay(500 * (attempt + 1)); continue; }
          return null;
        }

        const data = await res.json();
        if (data.success) return data.data;
        return null;
      } catch (e) {
        if (e.name === 'AbortError' && attempt < retries) { await delay(500 * (attempt + 1)); continue; }
        if (attempt < retries) { await delay(500 * (attempt + 1)); continue; }
        return null;
      }
    }
    return null;
  })();

  activeRequests.set(url, request);
  const result = await request;
  activeRequests.delete(url);
  return result;
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// Data Normalization
function bestImage(images) {
  if (!images?.length) return 'https://picsum.photos/seed/def/300/300';
  return images[images.length - 1]?.url || images[0]?.url;
}

function getAudioByQuality(urls, quality) {
  if (!urls?.length) return '';
  // Always try 320kbps first (best quality)
  const match = urls.find(u => u.quality === '320kbps');
  if (match?.url) return match.url;
  // Fallback: try highest to lowest
  const order = ['160kbps', '96kbps', '48kbps'];
  for (const q of order) {
    const m = urls.find(u => u.quality === q);
    if (m?.url) return m.url;
  }
  return urls[urls.length - 1]?.url || '';
}

export function getQuality() {
  return '320kbps';
}

export function setQuality(q) {
  try { localStorage.setItem('audio_quality', q); } catch {}
}

function mapSong(s) {
  if (!s) return null;
  const quality = getQuality();
  return {
    id: s.id,
    title: cleanText(s.name),
    artist: s.artists?.primary?.map(a => a.name).join(', ') || s.primaryArtists || '',
    artistId: s.artists?.primary?.[0]?.id || '',
    album: cleanText(s.album?.name),
    albumId: s.album?.id || '',
    duration: s.duration || 0,
    thumbnail: bestImage(s.image),
    audio: getAudioByQuality(s.downloadUrl, quality),
    audioAll: s.downloadUrl || [],
    plays: s.playCount || 0,
    language: s.language || '',
    year: s.year || '',
    hasLyrics: s.hasLyrics || false,
  };
}

function mapAlbum(a) {
  if (!a) return null;
  return {
    id: a.id,
    title: cleanText(a.name),
    artist: a.artists?.primary?.map(x => x.name).join(', ') || a.primaryArtists || '',
    artistId: a.artists?.primary?.[0]?.id || '',
    year: a.year || '',
    thumbnail: bestImage(a.image),
    songCount: a.songCount || 0,
  };
}

function mapArtist(a) {
  if (!a) return null;
  return {
    id: a.id,
    name: cleanText(a.name),
    img: bestImage(a.image),
  };
}

function cleanText(str) {
  if (!str) return '';
  return str.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#039;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

// Public API Functions

export async function searchSongs(query, limit = 15) {
  if (!query?.trim()) return [];
  const cacheKey = `search:${query}:${limit}`;
  const cached = getCached(cacheKey, CACHE_TTL.search);
  if (cached) return cached;

  const data = await fetchApi(`/search/songs?query=${encodeURIComponent(query)}&limit=${limit}`);
  const results = (data?.results || []).map(mapSong).filter(Boolean);
  if (results.length > 0) setCache(cacheKey, results);
  return results;
}

export async function searchAlbums(query, limit = 10) {
  if (!query?.trim()) return [];
  const cacheKey = `albums:${query}:${limit}`;
  const cached = getCached(cacheKey, CACHE_TTL.search);
  if (cached) return cached;

  const data = await fetchApi(`/search/albums?query=${encodeURIComponent(query)}&limit=${limit}`);
  const results = (data?.results || []).map(mapAlbum).filter(Boolean);
  if (results.length > 0) setCache(cacheKey, results);
  return results;
}

export async function searchArtists(query, limit = 10) {
  if (!query?.trim()) return [];
  const cacheKey = `artists:${query}:${limit}`;
  const cached = getCached(cacheKey, CACHE_TTL.search);
  if (cached) return cached;

  const data = await fetchApi(`/search/artists?query=${encodeURIComponent(query)}&limit=${limit}`);
  const results = (data?.results || []).map(mapArtist).filter(Boolean);
  if (results.length > 0) setCache(cacheKey, results);
  return results;
}

export async function getAlbumById(id) {
  if (!id) return null;
  const cacheKey = `album:${id}`;
  const cached = getCached(cacheKey, CACHE_TTL.album);
  if (cached) return cached;

  const data = await fetchApi(`/albums?id=${id}`);
  if (!data) return null;
  const result = { ...mapAlbum(data), songs: (data.songs || []).map(mapSong).filter(Boolean) };
  setCache(cacheKey, result);
  return result;
}

export async function getPlaylistById(id) {
  if (!id) return [];
  const cacheKey = `playlist:${id}`;
  const cached = getCached(cacheKey, CACHE_TTL.album);
  if (cached) return cached;

  const data = await fetchApi(`/playlists?id=${id}`);
  if (!data?.songs) return [];
  const results = data.songs.map(mapSong).filter(Boolean);
  if (results.length > 0) setCache(cacheKey, results);
  return results;
}

export async function getSongSuggestions(songId) {
  if (!songId) return [];
  const cacheKey = `suggest:${songId}`;
  const cached = getCached(cacheKey, CACHE_TTL.suggestions);
  if (cached) return cached;

  const data = await fetchApi(`/songs/${songId}/suggestions`);
  if (!data) return [];
  const results = (Array.isArray(data) ? data : []).map(mapSong).filter(Boolean);
  if (results.length > 0) setCache(cacheKey, results);
  return results;
}

export async function getSongDetails(songId) {
  if (!songId) return null;
  const cacheKey = `song:${songId}`;
  const cached = getCached(cacheKey, CACHE_TTL.song);
  if (cached) return cached;

  const data = await fetchApi(`/songs/${songId}`);
  if (!data?.[0]) return null;
  const result = mapSong(data[0]);
  if (result) setCache(cacheKey, result);
  return result;
}

export async function getLyrics(songId, title, artist) {
  if (!songId) return null;
  const cacheKey = `lyrics:${songId}`;
  const cached = getCached(cacheKey, CACHE_TTL.lyrics);
  if (cached) return cached;

  // Try LRCLIB first (has real synced timestamps)
  if (title && artist) {
    try {
      const cleanArtist = artist.split(',')[0].trim();
      const url = `https://lrclib.net/api/search?track_name=${encodeURIComponent(title)}&artist_name=${encodeURIComponent(cleanArtist)}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const results = await res.json();
        const synced = results.find(r => r.syncedLyrics);
        if (synced?.syncedLyrics) {
          const result = { synced: true, data: synced.syncedLyrics };
          setCache(cacheKey, result);
          return result;
        }
        const plain = results.find(r => r.plainLyrics);
        if (plain?.plainLyrics) {
          const result = { synced: false, data: plain.plainLyrics };
          setCache(cacheKey, result);
          return result;
        }
      }
    } catch {}
  }

  // Fallback to JioSaavn lyrics (plain text only)
  const data = await fetchApi(`/songs/${songId}/lyrics`, { retries: 1, timeout: 5000 });
  if (!data?.lyrics) return null;
  const text = data.lyrics.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim();
  if (text) {
    const result = { synced: false, data: text };
    setCache(cacheKey, result);
    return result;
  }
  return null;
}

// Stream URL Refresh
// If a stream URL fails, re-fetch song details to get fresh URL
export async function refreshStreamUrl(songId) {
  if (!songId) return null;
  // Clear song cache to force fresh fetch
  cache.delete(`song:${songId}`);
  const song = await getSongDetails(songId);
  return song?.audio || null;
}

// Download
export async function downloadSong(song) {
  if (!song) return false;
  const urls = song.audioAll || [];
  const best = urls.find(u => u.quality === '320kbps') || urls[urls.length - 1];
  if (!best?.url) return false;

  try {
    const response = await fetch(best.url);
    if (!response.ok) return false;
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${song.title} - ${song.artist}.m4a`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch { return false; }
}

// Cache Management
export function clearCache() { cache.clear(); }
export function getCacheSize() { return cache.size; }
