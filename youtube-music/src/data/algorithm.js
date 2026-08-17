// Smart Recommendation Algorithm
const STORAGE_KEY = 'savan_history';

export function getHistory() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

export function addToHistory(song) {
  if (!song) return;
  const history = getHistory();
  const filtered = history.filter(s => s.id !== song.id);
  const updated = [{ ...song, playedAt: Date.now() }, ...filtered].slice(0, 100);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
}

export function analyzePreferences() {
  const history = getHistory();
  if (history.length === 0) return null;

  const artistCount = {};
  const languageCount = {};
  const hourCount = {};

  history.forEach(song => {
    const artist = song.artist?.split(',')[0]?.trim();
    if (artist) artistCount[artist] = (artistCount[artist] || 0) + 1;
    const lang = song.language || 'hindi';
    languageCount[lang] = (languageCount[lang] || 0) + 1;
    const hour = new Date(song.playedAt || Date.now()).getHours();
    const period = hour < 6 ? 'night' : hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 21 ? 'evening' : 'night';
    hourCount[period] = (hourCount[period] || 0) + 1;
  });

  const topArtists = Object.entries(artistCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }));
  const topLanguages = Object.entries(languageCount).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([lang]) => lang);
  const peakTime = Object.entries(hourCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'evening';

  return { topArtists, topLanguages, peakTime, totalPlays: history.length };
}

export function getSmartQueries(currentSong) {
  const prefs = analyzePreferences();
  const hour = new Date().getHours();
  const queries = [];

  // If currently playing a song, prioritize related content
  if (currentSong) {
    const artist = currentSong.artist?.split(',')[0]?.trim();
    if (artist) queries.push({ key: 'now_artist', query: `${artist} best songs`, title: `More ${artist}` });
    if (currentSong.album) queries.push({ key: 'now_album', query: `${currentSong.album} songs`, title: `From ${currentSong.album}` });
    if (currentSong.language && artist) queries.push({ key: 'now_lang', query: `${currentSong.language} similar ${artist}`, title: `${currentSong.language} Similar` });
  }

  if (!prefs || prefs.totalPlays < 3) {
    queries.push(
      { key: 'bollywood', query: 'latest bollywood 2024', title: '🎬 Bollywood' },
      { key: 'punjabi', query: 'punjabi hits 2024', title: '🎵 Punjabi' },
      { key: 'english', query: 'english pop hits 2024', title: '🌍 English' },
      { key: 'romantic', query: 'romantic hindi songs', title: '❤️ Romance' },
      { key: 'lofi', query: 'lofi chill hindi beats', title: '😌 Lo-Fi' },
      { key: 'party', query: 'party dance bollywood', title: '🎉 Party' },
    );
    return queries;
  }

  // Personalized sections from history
  prefs.topArtists.slice(0, 3).forEach(({ name }) => {
    // Don't duplicate if already showing "More [artist]" from current song
    if (!currentSong || !currentSong.artist?.includes(name)) {
      queries.push({ key: `artist_${name}`, query: `${name} songs`, title: `${name}` });
    }
  });

  prefs.topLanguages.forEach(lang => {
    const titles = { hindi: '🎬 Hindi Hits', punjabi: '🎵 Punjabi', english: '🌍 English', tamil: '🎶 Tamil', telugu: '🎶 Telugu' };
    if (!queries.find(q => q.key === `now_lang` && currentSong?.language === lang)) {
      queries.push({ key: `lang_${lang}`, query: `${lang} latest songs 2024`, title: titles[lang] || `${lang} Hits` });
    }
  });

  // Time-based
  if (hour >= 22 || hour < 6) queries.push({ key: 'sleep', query: 'calm sleep relaxing', title: '🌙 Night Vibes' });
  else if (hour < 9) queries.push({ key: 'morning', query: 'fresh morning songs', title: '☀️ Morning Fresh' });
  else if (hour >= 17 && hour < 22) queries.push({ key: 'evening', query: 'chill evening lofi', title: '🌆 Evening Chill' });

  return queries;
}

// Build related song queries for auto-next (rotates between similar artists)
export function getRelatedQueries(song) {
  if (!song) return [];
  const queries = [];
  const artist = song.artist?.split(',')[0]?.trim();
  const lang = song.language || 'hindi';

  // Related artists map - when playing one artist, suggest others in same scene
  const relatedArtists = {
    // Punjabi scene
    'Karan Aujla': ['Sidhu Moosewala', 'AP Dhillon', 'Shubh', 'Diljit Dosanjh', 'Cheema Y'],
    'AP Dhillon': ['Karan Aujla', 'Shubh', 'Sidhu Moosewala', 'Diljit Dosanjh', 'Cheema Y'],
    'Sidhu Moosewala': ['Karan Aujla', 'AP Dhillon', 'Shubh', 'Cheema Y', 'Amrit Maan'],
    'Shubh': ['AP Dhillon', 'Karan Aujla', 'Sidhu Moosewala', 'Cheema Y', 'Diljit Dosanjh'],
    'Diljit Dosanjh': ['Karan Aujla', 'AP Dhillon', 'Amrit Maan', 'Sidhu Moosewala', 'Babbu Maan'],
    'Cheema Y': ['Karan Aujla', 'Sidhu Moosewala', 'Shubh', 'AP Dhillon', 'Singga'],
    // Bollywood
    'Arijit Singh': ['Jubin Nautiyal', 'B Praak', 'Atif Aslam', 'Pritam', 'Vishal Mishra'],
    'Jubin Nautiyal': ['Arijit Singh', 'B Praak', 'Vishal Mishra', 'Darshan Raval', 'Stebin Ben'],
    'B Praak': ['Arijit Singh', 'Jubin Nautiyal', 'Vishal Mishra', 'Ammy Virk', 'Jaani'],
    'Pritam': ['Arijit Singh', 'Vishal Shekhar', 'A.R. Rahman', 'Sachin-Jigar', 'Amit Trivedi'],
    'Atif Aslam': ['Arijit Singh', 'Rahat Fateh Ali Khan', 'B Praak', 'Jubin Nautiyal'],
    // English
    'The Weeknd': ['Drake', 'Post Malone', 'Dua Lipa', 'Travis Scott', 'Billie Eilish'],
    'Drake': ['The Weeknd', 'Post Malone', 'Travis Scott', 'J. Cole', 'Kendrick Lamar'],
    'Taylor Swift': ['Ed Sheeran', 'Dua Lipa', 'Billie Eilish', 'Olivia Rodrigo', 'Ariana Grande'],
    'Dua Lipa': ['The Weeknd', 'Taylor Swift', 'Harry Styles', 'Olivia Rodrigo'],
    'Ed Sheeran': ['Taylor Swift', 'Shawn Mendes', 'Dua Lipa', 'Coldplay', 'Post Malone'],
  };

  // Priority 1: Same artist (but only 2-3 songs)
  if (artist) queries.push(`${artist} top songs`);

  // Priority 2: Related artists from the same scene
  const related = relatedArtists[artist];
  if (related) {
    // Pick 2-3 random related artists
    const shuffled = [...related].sort(() => Math.random() - 0.5);
    shuffled.slice(0, 3).forEach(a => {
      queries.push(`${a} top songs`);
    });
  } else {
    // Unknown artist - try language-based similar
    if (lang === 'punjabi') queries.push('Karan Aujla Shubh AP Dhillon top', 'Sidhu Moosewala Cheema Y songs');
    else if (lang === 'hindi') queries.push('Arijit Singh Jubin Nautiyal latest', 'B Praak Vishal Mishra songs');
    else queries.push(`${lang} top artists songs 2024`);
  }

  // Priority 3: Language-based trending (fallback)
  queries.push(`${lang} latest hits 2024`);

  return queries;
}
