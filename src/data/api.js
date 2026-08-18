const BASE = 'https://jiosavan-api2.vercel.app/api';

async function fetchApi(endpoint) {
  try {
    const res = await fetch(`${BASE}${endpoint}`);
    const data = await res.json();
    if (data.success) return data.data;
    return null;
  } catch { return null; }
}

function bestImage(images) {
  if (!images?.length) return 'https://picsum.photos/seed/def/300/300';
  return images[images.length - 1]?.url || images[0]?.url;
}

// Get audio URL by quality
function getAudioByQuality(urls, quality) {
  if (!urls?.length) return '';
  const match = urls.find(u => u.quality === quality);
  if (match) return match.url;
  // Fallback to highest available
  return urls[urls.length - 1]?.url || '';
}

// Get current quality setting
export function getQuality() {
  try { return localStorage.getItem('audio_quality') || '320kbps'; }
  catch { return '320kbps'; }
}

export function setQuality(q) {
  try { localStorage.setItem('audio_quality', q); } catch {}
}

function mapSong(s) {
  const quality = getQuality();
  return {
    id: s.id,
    title: (s.name || '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#039;/g, "'"),
    artist: s.artists?.primary?.map(a => a.name).join(', ') || s.primaryArtists || '',
    artistId: s.artists?.primary?.[0]?.id || '',
    album: (s.album?.name || '').replace(/&quot;/g, '"'),
    albumId: s.album?.id || '',
    duration: s.duration || 0,
    thumbnail: bestImage(s.image),
    audio: getAudioByQuality(s.downloadUrl, quality),
    audioAll: s.downloadUrl || [], // All quality URLs for download
    plays: s.playCount || 0,
    language: s.language || '',
    year: s.year || '',
    hasLyrics: s.hasLyrics || false,
  };
}

function mapAlbum(a) {
  return {
    id: a.id,
    title: (a.name || '').replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
    artist: a.artists?.primary?.map(x => x.name).join(', ') || a.primaryArtists || '',
    artistId: a.artists?.primary?.[0]?.id || '',
    year: a.year || '',
    thumbnail: bestImage(a.image),
    songCount: a.songCount || 0,
  };
}

export async function searchSongs(query, limit = 15) {
  const data = await fetchApi(`/search/songs?query=${encodeURIComponent(query)}&limit=${limit}`);
  return (data?.results || []).map(mapSong);
}

export async function searchAlbums(query, limit = 10) {
  const data = await fetchApi(`/search/albums?query=${encodeURIComponent(query)}&limit=${limit}`);
  return (data?.results || []).map(mapAlbum);
}

export async function getAlbumById(id) {
  const data = await fetchApi(`/albums?id=${id}`);
  if (!data) return null;
  return { ...mapAlbum(data), songs: (data.songs || []).map(mapSong) };
}

// Download a song
export async function downloadSong(song) {
  if (!song) return;
  // Get highest quality URL
  const urls = song.audioAll || [];
  const best = urls.find(u => u.quality === '320kbps') || urls[urls.length - 1];
  if (!best?.url) return;

  try {
    const response = await fetch(best.url);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${song.title} - ${song.artist}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch {
    return false;
  }
}



// Fetch song lyrics
export async function getLyrics(songId) {
  if (!songId) return null;
  try {
    const res = await fetch(`${BASE}/songs/${songId}/lyrics`);
    const data = await res.json();
    if (data.success && data.data?.lyrics) {
      // Convert <br> to newlines, strip HTML
      return data.data.lyrics
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .trim();
    }
    return null;
  } catch { return null; }
}



// Get song suggestions (related songs) - BETTER than searching by artist
export async function getSongSuggestions(songId) {
  if (!songId) return [];
  try {
    const res = await fetch(`${BASE}/songs/${songId}/suggestions`);
    const data = await res.json();
    if (data.success && data.data) {
      return data.data.map(mapSong);
    }
    return [];
  } catch { return []; }
}

// Get full song details
export async function getSongDetails(songId) {
  if (!songId) return null;
  try {
    const res = await fetch(`${BASE}/songs/${songId}`);
    const data = await res.json();
    if (data.success && data.data?.[0]) {
      return mapSong(data.data[0]);
    }
    return null;
  } catch { return null; }
}
