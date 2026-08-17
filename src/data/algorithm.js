import { searchSongs } from './api';

const HISTORY_KEY = 'ma_history';
const playedSet = new Set();

export function getHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
  catch { return []; }
}

export function addToHistory(song) {
  if (!song) return;
  playedSet.add(song.id);
  const history = getHistory();
  const updated = [{ ...song, playedAt: Date.now() }, ...history.filter(s => s.id !== song.id)].slice(0, 100);
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(updated)); } catch {}
}

export function isPlayed(id) {
  return playedSet.has(id);
}

export function resetPlayed() {
  playedSet.clear();
}

// THE CORE: Get next songs to play based on current song
// Simple logic: same artist → same language popular → done
export async function getNextSongs(currentSong) {
  if (!currentSong) return [];

  const artist = currentSong.artist?.split(',')[0]?.trim();
  const lang = currentSong.language || 'hindi';

  let results = [];

  // Step 1: Get more from same artist
  if (artist) {
    const artistSongs = await searchSongs(`${artist}`, 20);
    const fresh = artistSongs.filter(s => !playedSet.has(s.id) && s.id !== currentSong.id);
    results = [...results, ...fresh.slice(0, 5)];
  }

  // Step 2: Get popular songs in same language (different artists)
  if (results.length < 8) {
    const langSongs = await searchSongs(`${lang} top songs 2024`, 20);
    const fresh = langSongs.filter(s => !playedSet.has(s.id) && s.id !== currentSong.id && !results.find(r => r.id === s.id));
    results = [...results, ...fresh.slice(0, 8 - results.length)];
  }

  return results;
}

// Get sections for Home page
export function getHomeQueries(currentSong) {
  const prefs = analyzePrefs();

  // If playing something, show related
  if (currentSong) {
    const artist = currentSong.artist?.split(',')[0]?.trim();
    const lang = currentSong.language || 'hindi';
    const queries = [];
    if (artist) queries.push({ key: 'playing', query: artist, title: `More ${artist}` });
    queries.push({ key: 'lang', query: `${lang} top songs 2024`, title: `${lang.charAt(0).toUpperCase() + lang.slice(1)} Hits` });
    // Add user's other top artists
    if (prefs) {
      prefs.topArtists.filter(a => a !== artist).slice(0, 2).forEach(a => {
        queries.push({ key: `art_${a}`, query: a, title: a });
      });
    }
    return queries;
  }

  // No song playing — show based on history or defaults
  if (prefs && prefs.topArtists.length > 0) {
    return prefs.topArtists.slice(0, 4).map(a => ({
      key: `art_${a}`, query: `${a} songs`, title: a
    }));
  }

  // New user defaults
  return [
    { key: 'bol', query: 'bollywood latest 2024', title: '🎬 Bollywood' },
    { key: 'pun', query: 'punjabi top 2024', title: '🎵 Punjabi' },
    { key: 'eng', query: 'english pop hits', title: '🌍 English' },
    { key: 'lofi', query: 'lofi chill hindi', title: '😌 Lo-Fi' },
    { key: 'rom', query: 'romantic hindi songs', title: '❤️ Romance' },
  ];
}

function analyzePrefs() {
  const history = getHistory();
  if (history.length < 2) return null;

  const artistCount = {};
  history.forEach(song => {
    const a = song.artist?.split(',')[0]?.trim();
    if (a) artistCount[a] = (artistCount[a] || 0) + 1;
  });

  const topArtists = Object.entries(artistCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name);

  return { topArtists, totalPlays: history.length };
}

export { analyzePrefs as analyzePreferences };
