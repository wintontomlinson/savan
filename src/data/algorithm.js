import { getSongSuggestions, searchSongs } from './api';

const HISTORY_KEY = 'ma_history';
const TOTAL_PLAYS_KEY = 'ma_total_plays';
const LIKED_SONGS_KEY = 'ma_liked_songs';
const MAX_HISTORY = 100;
const playedSet = new Set();

function readList(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function readNumber(key, fallback = 0) {
  try {
    const value = Number.parseInt(localStorage.getItem(key) || '', 10);
    return Number.isFinite(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

function leadArtist(song) {
  return (song?.artist || '').split(',')[0].trim();
}

function language(song) {
  return (song?.language || '').trim().toLowerCase() || 'hindi';
}

function norm(value) {
  return (value || '').trim().toLocaleLowerCase();
}

function trackKey(song) {
  return song?.id || `${norm(song?.title)}:${norm(leadArtist(song))}`;
}

export function getHistory() {
  return readList(HISTORY_KEY).filter((song) => song && song.id);
}

function likedIds() {
  return new Set(readList(LIKED_SONGS_KEY).map((song) => song?.id).filter(Boolean));
}

/**
 * Builds a small private taste profile in browser storage. Recent listening is
 * weighted much more heavily than older listening, so recommendations adapt
 * quickly without requiring an account or server-side tracking.
 */
function buildProfile() {
  const history = getHistory();
  if (history.length < 2) return null;

  const artistScores = new Map();
  const languageScores = new Map();
  const albumScores = new Map();
  const liked = likedIds();

  history.forEach((song, index) => {
    const recency = Math.max(0.24, 1 - index / Math.max(history.length, 1));
    const favoriteBonus = liked.has(song.id) ? 1.3 : 1;
    const score = recency * favoriteBonus;
    const artist = leadArtist(song);
    const lang = language(song);
    const album = norm(song.album);

    if (artist) artistScores.set(norm(artist), (artistScores.get(norm(artist)) || 0) + score);
    if (lang) languageScores.set(lang, (languageScores.get(lang) || 0) + score);
    if (album) albumScores.set(album, (albumScores.get(album) || 0) + score);
  });

  const top = (scores, limit) =>
    [...scores.entries()]
      .sort(([, left], [, right]) => right - left)
      .slice(0, limit)
      .map(([name, score]) => ({ name, score }));

  return {
    topArtists: top(artistScores, 5),
    topLanguages: top(languageScores, 3),
    topAlbums: top(albumScores, 3),
    totalPlays: Math.max(readNumber(TOTAL_PLAYS_KEY, history.length), history.length),
  };
}

export function addToHistory(song) {
  if (!song?.id) return;
  playedSet.add(song.id);
  const history = getHistory();
  const updated = [{ ...song, playedAt: Date.now() }, ...history.filter((item) => item.id !== song.id)].slice(0, MAX_HISTORY);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    localStorage.setItem(TOTAL_PLAYS_KEY, String(readNumber(TOTAL_PLAYS_KEY) + 1));
  } catch {}
}

export function resetPlayed() {
  playedSet.clear();
}

function scoreCandidates(groups, currentSong, profile) {
  const currentArtist = norm(leadArtist(currentSong));
  const currentLanguage = language(currentSong);
  const historyKeys = new Set(getHistory().slice(0, 12).map(trackKey));
  const liked = likedIds();
  const merged = new Map();

  groups.forEach(({ songs, sourceScore }) => {
    (songs || []).forEach((song, position) => {
      const key = trackKey(song);
      if (!key || key === trackKey(currentSong) || playedSet.has(song.id) || historyKeys.has(key)) return;
      const result = merged.get(key) || { song, score: 0, bestPosition: position };
      result.score += sourceScore + Math.max(0, 10 - position) * 0.45;
      result.bestPosition = Math.min(result.bestPosition, position);
      merged.set(key, result);
    });
  });

  const artistScores = new Map(profile?.topArtists?.map(({ name, score }) => [name, score]) || []);
  const languageScores = new Map(profile?.topLanguages?.map(({ name, score }) => [name, score]) || []);
  const albumScores = new Map(profile?.topAlbums?.map(({ name, score }) => [name, score]) || []);

  merged.forEach((candidate) => {
    const song = candidate.song;
    const artist = norm(leadArtist(song));
    const lang = language(song);
    const album = norm(song.album);
    candidate.score += (artistScores.get(artist) || 0) * 9;
    candidate.score += (languageScores.get(lang) || 0) * 4;
    candidate.score += (albumScores.get(album) || 0) * 2;
    if (artist === currentArtist) candidate.score += 7;
    if (lang === currentLanguage) candidate.score += 3;
    if (liked.has(song.id)) candidate.score += 14;
  });

  const artistCounts = new Map();
  return [...merged.values()]
    .sort((left, right) => right.score - left.score || left.bestPosition - right.bestPosition)
    .filter((candidate) => {
      const artist = norm(leadArtist(candidate.song));
      const count = artistCounts.get(artist) || 0;
      if (artist && count >= 2) return false;
      artistCounts.set(artist, count + 1);
      return true;
    })
    .map(({ song }) => song);
}

/**
 * Mixes provider-related songs with artist, language and personal-taste
 * candidates. The ranker gives related tracks priority but avoids recent plays
 * and over-concentrating a queue around a single artist.
 */
export async function getNextSongs(currentSong) {
  if (!currentSong?.id) return [];
  const profile = buildProfile();
  const artist = leadArtist(currentSong);
  const lang = language(currentSong);
  const personalArtists = (profile?.topArtists || []).map(({ name }) => name).filter((name) => norm(name) !== norm(artist)).slice(0, 2);

  const [related, artistSongs, languageSongs, ...tasteResults] = await Promise.all([
    getSongSuggestions(currentSong.id).catch(() => []),
    artist ? searchSongs(artist, 18).catch(() => []) : Promise.resolve([]),
    searchSongs(`${lang} hits`, 18).catch(() => []),
    ...personalArtists.map((name) => searchSongs(name, 12).catch(() => [])),
  ]);

  return scoreCandidates(
    [
      { songs: related, sourceScore: 42 },
      { songs: artistSongs, sourceScore: 21 },
      { songs: languageSongs, sourceScore: 11 },
      ...tasteResults.map((songs) => ({ songs, sourceScore: 17 })),
    ],
    currentSong,
    profile,
  ).slice(0, 18);
}

export function getHomeQueries(currentSong) {
  const profile = buildProfile();
  const query = (key, value, title, subtitle) => ({ key, query: value, title, subtitle });
  const unique = new Set();
  const add = (section, sections) => {
    if (!section?.query || unique.has(norm(section.query))) return;
    unique.add(norm(section.query));
    sections.push(section);
  };
  const sections = [];

  if (currentSong) {
    const artist = leadArtist(currentSong);
    const lang = language(currentSong);
    if (artist) add(query('playing-artist', `${artist} songs`, `More from ${artist}`, 'Based on what is playing'), sections);
    add(query('playing-language', `${lang} hits`, `${lang[0].toUpperCase()}${lang.slice(1)} on repeat`, 'Tuned to your current sound'), sections);
  }

  (profile?.topArtists || []).slice(0, 3).forEach(({ name }, index) => {
    add(query(`artist-${index}`, `${name} songs`, `For fans of ${name}`, 'Built from your listening'), sections);
  });
  (profile?.topLanguages || []).slice(0, 2).forEach(({ name }, index) => {
    const label = `${name[0].toUpperCase()}${name.slice(1)}`;
    add(query(`language-${index}`, `${name} latest hits`, `${label} essentials`, 'Your most played language'), sections);
  });

  if (sections.length) return sections.slice(0, 5);

  return [
    query('bollywood', 'bollywood latest hits', 'Bollywood now', 'Fresh picks for the week'),
    query('punjabi', 'punjabi top hits', 'Punjabi picks', 'Big hooks and bigger energy'),
    query('global', 'english pop hits', 'Global pop', 'Singalong essentials'),
    query('late-night', 'lofi chill hindi', 'Late night focus', 'Low-key instrumentals and easy listens'),
    query('romance', 'romantic hindi songs', 'Soft hours', 'Romantic songs for unhurried evenings'),
  ];
}

export function analyzePreferences() {
  const profile = buildProfile();
  if (!profile) return null;
  return {
    totalPlays: profile.totalPlays,
    topArtists: profile.topArtists.map(({ name }) => name),
    topLanguages: profile.topLanguages.map(({ name }) => name),
  };
}
