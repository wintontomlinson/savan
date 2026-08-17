import { useState, useEffect, useMemo } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { moods, getGreeting } from '../data/data';
import { searchSongs } from '../data/api';
import { usePlayer } from '../context/PlayerContext';
import SongCard from '../components/SongCard';
import HorizontalScroll from '../components/HorizontalScroll';
import SongRow from '../components/SongRow';

// Default categories (shown when user has no history)
const DEFAULT_CATEGORIES = [
  { key: 'trending', query: 'trending top hits 2024', title: '🔥 Trending Now' },
  { key: 'bollywood', query: 'Arijit Singh latest', title: '❤️ Bollywood Hits' },
  { key: 'punjabi', query: 'AP Dhillon Punjabi hits', title: '🔥 Punjabi Fire' },
  { key: 'english', query: 'The Weeknd Dua Lipa pop', title: '🌍 English Pop' },
  { key: 'chill', query: 'lofi chill relax', title: '😌 Chill Vibes' },
];

// Analyze user's listening history to build recommendations
function analyzePreferences(recentlyPlayed, likedSongs) {
  const allSongs = [...recentlyPlayed, ...likedSongs];
  if (allSongs.length === 0) return null;

  // Count artists
  const artistCount = {};
  const languageCount = {};

  allSongs.forEach(song => {
    // Track artists
    const artist = song.artist?.split(',')[0]?.trim();
    if (artist) artistCount[artist] = (artistCount[artist] || 0) + 1;

    // Track languages
    const lang = song.language || 'hindi';
    languageCount[lang] = (languageCount[lang] || 0) + 1;
  });

  // Top artists (sorted by frequency)
  const topArtists = Object.entries(artistCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name);

  // Top languages
  const topLanguages = Object.entries(languageCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([lang]) => lang);

  return { topArtists, topLanguages };
}

// Build recommendation queries based on user preferences
function buildRecommendationQueries(prefs) {
  if (!prefs) return [];

  const queries = [];

  // Recommend based on top artists
  prefs.topArtists.slice(0, 3).forEach((artist, i) => {
    queries.push({
      key: `rec-artist-${i}`,
      query: `${artist} songs`,
      title: `🎵 More from ${artist}`,
    });
  });

  // Recommend based on language
  const langTitles = { hindi: '🇮🇳 Hindi For You', punjabi: '🎶 Punjabi For You', english: '🌍 English For You', tamil: '🎵 Tamil For You', telugu: '🎵 Telugu For You' };
  prefs.topLanguages.forEach((lang, i) => {
    if (i < 2) {
      queries.push({
        key: `rec-lang-${lang}`,
        query: `latest ${lang} songs 2024`,
        title: langTitles[lang] || `🎵 ${lang.charAt(0).toUpperCase() + lang.slice(1)} For You`,
      });
    }
  });

  // "Because you listened to X" style
  if (prefs.topArtists.length >= 2) {
    queries.push({
      key: 'rec-similar',
      query: `${prefs.topArtists[0]} ${prefs.topArtists[1]} similar`,
      title: `✨ Recommended For You`,
    });
  }

  return queries;
}

export default function Home() {
  const { playSong, recentlyPlayed, likedSongs } = usePlayer();
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);

  // Analyze preferences
  const prefs = useMemo(() => analyzePreferences(recentlyPlayed, likedSongs), [recentlyPlayed, likedSongs]);
  const recommendationQueries = useMemo(() => buildRecommendationQueries(prefs), [prefs]);

  // Decide what to fetch: recommendations if history exists, else defaults
  const categoriesToFetch = useMemo(() => {
    if (recommendationQueries.length > 0) {
      // User has history — show personalized + trending
      return [
        { key: 'trending', query: 'trending top hits 2024', title: '🔥 Trending Now' },
        ...recommendationQueries,
      ];
    }
    return DEFAULT_CATEGORIES;
  }, [recommendationQueries]);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      const results = {};
      const promises = categoriesToFetch.map(async (cat) => {
        const songs = await searchSongs(cat.query, 12);
        results[cat.key] = songs;
      });
      await Promise.all(promises);
      setSections(results);
      setLoading(false);
    }
    fetchAll();
  }, [categoriesToFetch]);

  const trendingSongs = sections.trending || [];
  const hasHistory = recentlyPlayed.length > 0;

  return (
    <div className="pb-8">
      {/* Greeting */}
      <section className="mb-8 px-2 animate-fade-in-up">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#FF0000]/20 via-[#1F1F1F] to-[#1F1F1F] p-8 sm:p-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 animate-text-reveal">{getGreeting()}</h1>
          <p className="text-[#AAAAAA] text-sm">
            {hasHistory
              ? `Based on your taste • ${prefs?.topArtists?.[0] || ''}, ${prefs?.topArtists?.[1] || ''} & more`
              : 'Discover music you love'}
          </p>
          <div className="absolute right-4 top-4 w-24 h-24 opacity-10">
            <svg viewBox="0 0 200 200" className="w-full h-full fill-[#FF0000] animate-float">
              <circle cx="100" cy="100" r="80" />
            </svg>
          </div>
        </div>
      </section>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={28} className="text-[#FF0000] animate-spin" />
          <span className="ml-3 text-[#AAAAAA] text-sm">
            {hasHistory ? 'Building recommendations for you...' : 'Loading music...'}
          </span>
        </div>
      )}

      {/* Quick Picks - mix of liked + recently played, personalized */}
      {recentlyPlayed.length > 0 && (
        <section className="mb-8 px-2 animate-fade-in-up">
          <h2 className="text-xl font-bold text-white mb-1">Quick Picks</h2>
          <p className="text-xs text-[#AAAAAA] mb-4">Based on what you listen to</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {[...new Map([...likedSongs.slice(0, 3), ...recentlyPlayed.slice(0, 6)].map(s => [s.id, s])).values()].slice(0, 6).map((song) => (
              <button
                key={song.id}
                onClick={() => playSong(song, recentlyPlayed)}
                className="group flex items-center gap-3 p-2 rounded-lg bg-[#1F1F1F] hover:bg-[#282828] transition-all duration-200"
              >
                <img src={song.image} alt="" className="w-12 h-12 rounded object-cover" />
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-white truncate group-hover:text-[#FF0000] transition-colors">{song.title}</p>
                  <p className="text-xs text-[#AAAAAA] truncate">{song.artist}</p>
                </div>
                <div className="w-8 h-8 bg-[#FF0000] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity btn-press">
                  <Play size={14} className="text-white ml-0.5" fill="white" />
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Personalized Recommendation Sections */}
      {categoriesToFetch.map((cat) => {
        const catSongs = sections[cat.key] || [];
        if (catSongs.length === 0) return null;
        return (
          <HorizontalScroll key={cat.key} title={cat.title}>
            {catSongs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </HorizontalScroll>
        );
      })}

      {/* Top Chart */}
      {trendingSongs.length > 0 && (
        <section className="mb-8 px-2">
          <h2 className="text-xl font-bold text-white mb-4">📊 Top Chart</h2>
          <div className="bg-[#1F1F1F] rounded-xl overflow-hidden">
            {trendingSongs.map((song, index) => (
              <SongRow key={song.id} song={song} index={index} songList={trendingSongs} />
            ))}
          </div>
        </section>
      )}

      {/* Moods */}
      <section className="mb-8 px-2">
        <h2 className="text-xl font-bold text-white mb-4">Moods & Genres</h2>
        <div className="flex flex-wrap gap-3">
          {moods.map((mood) => (
            <button key={mood.id} className={`${mood.color} px-5 py-2.5 rounded-full text-white text-sm font-medium transition-all hover:scale-105 btn-press`}>
              <span className="mr-1.5">{mood.icon}</span>{mood.name}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
