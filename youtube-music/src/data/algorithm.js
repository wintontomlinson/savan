// Smart Recommendation Algorithm
// Analyzes listening history to personalize content

const STORAGE_KEY = 'savan_history';

// Get listening history
export function getHistory() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

// Add song to history (max 100)
export function addToHistory(song) {
  if (!song) return;
  const history = getHistory();
  const filtered = history.filter(s => s.id !== song.id);
  const updated = [{ ...song, playedAt: Date.now() }, ...filtered].slice(0, 100);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
}

// Analyze user's preferences from history
export function analyzePreferences() {
  const history = getHistory();
  if (history.length === 0) return null;

  const artistCount = {};
  const languageCount = {};
  const hourCount = {};

  history.forEach(song => {
    // Artist frequency
    const artist = song.artist?.split(',')[0]?.trim();
    if (artist) artistCount[artist] = (artistCount[artist] || 0) + 1;

    // Language preference
    const lang = song.language || 'hindi';
    languageCount[lang] = (languageCount[lang] || 0) + 1;

    // Time-of-day preference
    const hour = new Date(song.playedAt || Date.now()).getHours();
    const period = hour < 6 ? 'night' : hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 21 ? 'evening' : 'night';
    hourCount[period] = (hourCount[period] || 0) + 1;
  });

  // Sort by frequency
  const topArtists = Object.entries(artistCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }));
  const topLanguages = Object.entries(languageCount).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([lang]) => lang);
  const peakTime = Object.entries(hourCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'evening';

  return { topArtists, topLanguages, peakTime, totalPlays: history.length };
}

// Build smart search queries based on preferences + time of day
export function getSmartQueries() {
  const prefs = analyzePreferences();
  const hour = new Date().getHours();
  const queries = [];

  // Always show trending
  queries.push({ key: 'trending', query: 'trending hindi 2024', title: '🔥 Trending' });

  if (!prefs || prefs.totalPlays < 3) {
    // New user - show popular categories
    queries.push(
      { key: 'bollywood', query: 'latest bollywood 2024', title: '🎬 Bollywood' },
      { key: 'punjabi', query: 'punjabi hits 2024', title: '🎵 Punjabi' },
      { key: 'english', query: 'english pop hits 2024', title: '🌍 English' },
      { key: 'romantic', query: 'romantic hindi songs', title: '❤️ Romance' },
      { key: 'party', query: 'party dance bollywood', title: '🎉 Party' },
    );
    return queries;
  }

  // Personalized based on preferences
  // Top artists sections
  prefs.topArtists.slice(0, 3).forEach(({ name }) => {
    queries.push({ key: `artist_${name}`, query: `${name} songs`, title: `${name}` });
  });

  // Language-based
  prefs.topLanguages.forEach(lang => {
    const titles = { hindi: '🎬 Hindi Hits', punjabi: '🎵 Punjabi', english: '🌍 English', tamil: '🎶 Tamil', telugu: '🎶 Telugu' };
    queries.push({ key: `lang_${lang}`, query: `${lang} latest songs 2024`, title: titles[lang] || `${lang} Hits` });
  });

  // Time-based mood
  if (hour >= 22 || hour < 6) {
    queries.push({ key: 'sleep', query: 'calm sleep relaxing hindi', title: '🌙 Night Vibes' });
  } else if (hour < 9) {
    queries.push({ key: 'morning', query: 'fresh morning hindi songs', title: '☀️ Morning Fresh' });
  } else if (hour >= 17 && hour < 22) {
    queries.push({ key: 'evening', query: 'chill evening hindi lofi', title: '🌆 Evening Chill' });
  }

  // Discovery - mix based on top artist similar
  if (prefs.topArtists.length >= 2) {
    queries.push({ key: 'discover', query: `${prefs.topArtists[0].name} ${prefs.topArtists[1].name} similar`, title: '✨ Discover' });
  }

  return queries;
}

// Get "Up Next" recommendations based on current song
export function getRelatedQuery(song) {
  if (!song) return null;
  const artist = song.artist?.split(',')[0]?.trim();
  return artist || null;
}
