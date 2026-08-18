// YouTube Music Search via Piped API (reliable alternative to broken YT Music internal API)
// Piped provides search + audio streams from YouTube without authentication

const PIPED_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://pipedapi.adminforge.de',
  'https://pipedapi.in.projectsegfau.lt',
  'https://api.piped.privacydev.net',
  'https://pipedapi.darkness.services',
];

let currentInstance = 0;

function getApiBase() {
  return PIPED_INSTANCES[currentInstance % PIPED_INSTANCES.length];
}

function rotateInstance() {
  currentInstance = (currentInstance + 1) % PIPED_INSTANCES.length;
}

async function pipedFetch(path, { timeout = 8000, retries = 2 } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const base = getApiBase();
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);

      const res = await fetch(`${base}${path}`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      });
      clearTimeout(timer);

      if (!res.ok) {
        // Rotate to next instance on server error
        if (res.status >= 500) {
          rotateInstance();
          continue;
        }
        return null;
      }

      return await res.json();
    } catch (e) {
      // On timeout or network error, try next instance
      rotateInstance();
      if (attempt < retries) continue;
      return null;
    }
  }
  return null;
}

// Search YouTube Music for songs using Piped
export async function ytmSearchSongs(query, limit = 10) {
  if (!query?.trim()) return [];

  const data = await pipedFetch(`/search?q=${encodeURIComponent(query)}&filter=music_songs`);
  if (!data?.items?.length) return [];

  const results = [];
  for (const item of data.items) {
    if (results.length >= limit) break;
    if (!item?.url || item.duration <= 0) continue;

    // Extract videoId from URL like /watch?v=xxxxx
    const videoId = item.url?.replace('/watch?v=', '') || '';
    if (!videoId) continue;

    // Clean up uploader name (remove " - Topic" suffix)
    const artist = (item.uploaderName || item.uploader || '')
      .replace(/\s*-\s*Topic$/i, '')
      .trim();

    results.push({
      id: `ytm_${videoId}`,
      videoId,
      title: (item.title || '').trim(),
      artist,
      thumbnail: item.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      duration: item.duration || 0,
      source: 'youtube',
    });
  }

  return results;
}

// Get audio stream URL for a YouTube video via Piped
export async function getYtAudioStream(videoId) {
  if (!videoId) return null;

  const data = await pipedFetch(`/streams/${videoId}`);
  if (!data?.audioStreams?.length) return null;

  // Sort audio streams by bitrate (highest first) and pick the best one
  const audioStreams = data.audioStreams
    .filter(s => s.mimeType?.startsWith('audio/') && s.url)
    .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));

  if (audioStreams.length === 0) return null;

  // Prefer mp4/m4a format, otherwise take highest bitrate
  const m4a = audioStreams.find(s => s.mimeType?.includes('mp4') || s.format === 'M4A');
  return m4a?.url || audioStreams[0].url;
}

// Get related/suggestions for a video
export async function ytmGetRelated(videoId) {
  if (!videoId) return [];

  const data = await pipedFetch(`/streams/${videoId}`);
  if (!data?.relatedStreams?.length) return [];

  return data.relatedStreams
    .filter(item => item.duration > 0 && item.duration < 600) // Only short videos (likely songs)
    .slice(0, 10)
    .map(item => {
      const id = item.url?.replace('/watch?v=', '') || '';
      if (!id) return null;

      const artist = (item.uploaderName || '')
        .replace(/\s*-\s*Topic$/i, '')
        .trim();

      return {
        id: `ytm_${id}`,
        videoId: id,
        title: (item.title || '').trim(),
        artist,
        thumbnail: item.thumbnail || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        duration: item.duration || 0,
        source: 'youtube',
      };
    })
    .filter(Boolean);
}
