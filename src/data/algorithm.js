import { searchSongs, getSongSuggestions } from './api';

const HISTORY_KEY = 'ma_history';
const playedSet = new Set();

export function getHistory() {
  try {
    const list = JSON.parse(localStorage.getItem(HISTORY_KEY));
    return Array.isArray(list) ? list.filter((s) => s && s.id) : [];
  } catch {
    return [];
  }
}

export function addToHistory(song) {
  if (!song) return;
  playedSet.add(song.id);
  const history = getHistory();
  const updated = [{ ...song, playedAt: Date.now() }, ...history.filter(s => s.id !== song.id)].slice(0, 100);
  try { 
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    // Track total plays count separately (history is capped at 100)
    const total = parseInt(localStorage.getItem('ma_total_plays') || '0') + 1;
    localStorage.setItem('ma_total_plays', total.toString());
  } catch {}
}

export function resetPlayed() {
  playedSet.clear();
}

// THE CORE: Get next songs to play based on current song
// Simple logic: same artist → same language popular → done
export async function getNextSongs(currentSong) {
  if (!currentSong) return [];

  let results = [];
  const seenIds = new Set([currentSong.id]);

  const addUnique = (songs) => {
    songs.forEach(s => {
      if (!seenIds.has(s.id) && !playedSet.has(s.id)) {
        seenIds.add(s.id);
        results.push(s);
      }
    });
  };

  // Step 1: Use suggestions API (best quality related songs)
  const suggestions = await getSongSuggestions(currentSong.id);
  addUnique(suggestions);

  // Step 2: If not enough, search same artist
  if (results.length < 5) {
    const artist = currentSong.artist?.split(',')[0]?.trim();
    if (artist) {
      const artistSongs = await searchSongs(artist, 15);
      addUnique(artistSongs);
    }
  }

  // Step 3: If still not enough, search by language
  if (results.length < 5) {
    const lang = currentSong.language || 'hindi';
    const langSongs = await searchSongs(`${lang} songs 2024`, 15);
    addUnique(langSongs);
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
    queries.push({ key: 'lang', query: `${lang} top songs`, title: `${lang.charAt(0).toUpperCase() + lang.slice(1)} hits` });
    // Add user's other top artists
    if (prefs) {
      prefs.topArtists.filter(a => a !== artist).slice(0, 2).forEach(a => {
        queries.push({ key: `art_${a}`, query: a, title: a });
      });
    }
    return queries;
  }

  // No song playing, so use history or defaults
  if (prefs && prefs.topArtists.length > 0) {
    return prefs.topArtists.slice(0, 4).map(a => ({
      key: `art_${a}`, query: `${a} songs`, title: a
    }));
  }

  // New user defaults. No hardcoded year: those queries go stale and start
  // returning nothing, which silently removes a whole shelf from the page.
  return [
    { key: 'bol', query: 'bollywood latest hits', title: 'Bollywood now' },
    { key: 'pun', query: 'punjabi top hits', title: 'Punjabi picks' },
    { key: 'eng', query: 'english pop hits', title: 'Global pop' },
    { key: 'lofi', query: 'lofi chill hindi', title: 'Lo-fi and chill' },
    { key: 'rom', query: 'romantic hindi songs', title: 'Late night romance' },
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

  const totalPlays = parseInt(localStorage.getItem('ma_total_plays') || '0') || history.length;

  return { topArtists, totalPlays };
}

export { analyzePrefs as analyzePreferences };
