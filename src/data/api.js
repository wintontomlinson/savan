// Music Area data layer.
// JioSaavn (unofficial API) for catalogue, streams and suggestions.
// LRCLIB for time-synced lyrics, with JioSaavn plain lyrics as a fallback.

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

/** AbortSignal.timeout needs iOS 16, so build the same thing by hand. */
function timeoutSignal(ms) {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

// Data Normalization
function bestImage(images) {
  if (!images?.length) return '';
  return images[images.length - 1]?.url || images[0]?.url || '';
}

/**
 * JioSaavn returns a grey silhouette placeholder for artists it has no photo
 * for (and those URLs are hotlink-protected, so they often fail to load too).
 * Treat them as "no image" so the resolver below can look elsewhere.
 */
function isRealArtistImage(url) {
  if (!url) return false;
  return !/artist-default|\/_i\/3\.0\/|default-(film|music|artist)/i.test(url);
}

function getAudioByQuality(urls) {
  if (!urls?.length) return '';
  return [...urls]
    .filter(item => item?.url)
    .sort((a, b) => parseInt(b.quality, 10) - parseInt(a.quality, 10))[0]?.url || '';
}

function mapSong(s) {
  if (!s) return null;
  return {
    id: s.id,
    title: cleanText(s.name),
    artist: s.artists?.primary?.map(a => a.name).join(', ') || s.primaryArtists || '',
    artistId: s.artists?.primary?.[0]?.id || '',
    album: cleanText(s.album?.name),
    albumId: s.album?.id || '',
    duration: s.duration || 0,
    thumbnail: bestImage(s.image),
    audio: getAudioByQuality(s.downloadUrl),
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
  const img = bestImage(a.image);
  return {
    id: a.id,
    name: cleanText(a.name),
    img: isRealArtistImage(img) ? img : '',
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
      const res = await fetch(url, { signal: timeoutSignal(5000) });
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

// ---------------------------------------------------------------------------
// Artist images
//
// JioSaavn has no photo for a lot of artists. Resolution order:
//   1. JioSaavn's own artist photo, when it is not the default placeholder
//   2. Wikipedia, matched on the exact page title
//   3. Artwork from one of the artist's own tracks
//
// Wikipedia's free-text search is deliberately not used: querying names like
// "Hansika Pareek" or "AP Dhillon" returns a different musician's article, and
// showing the wrong person's face is worse than showing no photo at all.
// ---------------------------------------------------------------------------

const ARTIST_IMG_KEY = 'ma_artist_images';
const ARTIST_IMG_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days
const ARTIST_IMG_MAX = 400;

const artistImgMemo = new Map();
const artistImgInflight = new Map();

function loadArtistImgStore() {
  try {
    const store = JSON.parse(localStorage.getItem(ARTIST_IMG_KEY));
    return store && typeof store === 'object' ? store : {};
  } catch {
    return {};
  }
}

function saveArtistImg(name, url) {
  const key = name.toLowerCase();
  artistImgMemo.set(key, url);
  try {
    const store = loadArtistImgStore();
    store[key] = { url, ts: Date.now() };
    const keys = Object.keys(store);
    if (keys.length > ARTIST_IMG_MAX) {
      keys
        .sort((a, b) => (store[a].ts || 0) - (store[b].ts || 0))
        .slice(0, keys.length - ARTIST_IMG_MAX)
        .forEach((k) => delete store[k]);
    }
    localStorage.setItem(ARTIST_IMG_KEY, JSON.stringify(store));
  } catch {}
}

function readArtistImgCache(name) {
  const key = name.toLowerCase();
  if (artistImgMemo.has(key)) return { hit: true, url: artistImgMemo.get(key) };
  const entry = loadArtistImgStore()[key];
  if (!entry) return { hit: false };
  if (Date.now() - (entry.ts || 0) > ARTIST_IMG_TTL) return { hit: false };
  artistImgMemo.set(key, entry.url);
  return { hit: true, url: entry.url };
}

async function wikipediaPortrait(name) {
  const url =
    'https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&piprop=thumbnail' +
    `&pithumbsize=500&redirects=1&format=json&origin=*&titles=${encodeURIComponent(name)}`;
  try {
    const res = await fetch(url, { signal: timeoutSignal(6000) });
    if (!res.ok) return '';
    const data = await res.json();
    const page = Object.values(data?.query?.pages || {})[0];
    if (!page || page.missing !== undefined) return '';
    if (/disambiguation/i.test(page.title || '')) return '';
    return page.thumbnail?.source || '';
  } catch {
    return '';
  }
}

/**
 * Best available image for an artist name. Never rejects; resolves to '' when
 * nothing suitable exists. Results (including misses) are cached for 30 days.
 */
export async function resolveArtistImage(name) {
  if (!name?.trim()) return '';
  const cached = readArtistImgCache(name);
  if (cached.hit) return cached.url;
  if (artistImgInflight.has(name)) return artistImgInflight.get(name);

  const task = (async () => {
    const fromSaavn = (await searchArtists(name, 1))[0]?.img;
    if (fromSaavn) return fromSaavn;

    const fromWikipedia = await wikipediaPortrait(name);
    if (fromWikipedia) return fromWikipedia;

    const track = (await searchSongs(name, 1))[0];
    return track?.thumbnail || '';
  })();

  artistImgInflight.set(name, task);
  const url = await task;
  artistImgInflight.delete(name);
  saveArtistImg(name, url);
  return url;
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
