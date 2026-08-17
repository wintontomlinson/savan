import { useState, useEffect, useMemo } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { getGreeting } from '../data/data';
import { searchSongs } from '../data/api';
import { usePlayer } from '../context/PlayerContext';
import SongCard from '../components/SongCard';
import HorizontalScroll from '../components/HorizontalScroll';
import SongRow from '../components/SongRow';

// Curated sections - Spotify style
const SECTIONS = [
  { key: 'top_hindi', query: 'latest hindi songs 2024 trending', title: 'Top Hindi' },
  { key: 'top_global', query: 'global top songs 2024 trending', title: 'Top Global' },
  { key: 'new_releases', query: 'new release 2024 latest', title: 'New Releases' },
  { key: 'arijit', query: 'Arijit Singh latest 2024', title: 'Arijit Singh' },
  { key: 'punjabi', query: 'Punjabi latest hits 2024 AP Dhillon Diljit', title: 'Punjabi Hits' },
  { key: 'pop', query: 'english pop hits 2024 Dua Lipa Taylor Swift', title: 'Pop Hits' },
  { key: 'romantic', query: 'romantic hindi songs love', title: 'Romance' },
  { key: 'hiphop', query: 'hip hop rap 2024 trending', title: 'Hip-Hop' },
  { key: 'lofi', query: 'lofi chill beats hindi', title: 'Lo-Fi & Chill' },
  { key: 'party', query: 'party songs bollywood punjabi 2024', title: 'Party' },
  { key: 'devotional', query: 'bhajan aarti devotional hindi', title: 'Devotional' },
  { key: 'workout', query: 'workout gym motivation songs', title: 'Workout' },
];

// Analyze user preferences from history
function getUserPrefs(recentlyPlayed, likedSongs) {
  const all = [...recentlyPlayed, ...likedSongs];
  if (all.length === 0) return null;
  const artistCount = {};
  all.forEach(s => {
    const a = s.artist?.split(',')[0]?.trim();
    if (a) artistCount[a] = (artistCount[a] || 0) + 1;
  });
  const topArtists = Object.entries(artistCount).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([n]) => n);
  return topArtists;
}

export default function Home() {
  const { playSong, recentlyPlayed, likedSongs } = usePlayer();
  const [sections, setSections] = useState({});
  const [recSongs, setRecSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  const topArtists = useMemo(() => getUserPrefs(recentlyPlayed, likedSongs), [recentlyPlayed, likedSongs]);

  // Fetch all sections
  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      const results = {};
      const promises = SECTIONS.map(async (s) => {
        const songs = await searchSongs(s.query, 10);
        results[s.key] = songs;
      });
      await Promise.all(promises);
      setSections(results);
      setLoading(false);
    }
    fetchAll();
  }, []);

  // Fetch personalized recommendations
  useEffect(() => {
    if (!topArtists || topArtists.length === 0) return;
    async function fetchRec() {
      const songs = await searchSongs(`${topArtists[0]} ${topArtists[1] || ''} similar`, 10);
      setRecSongs(songs);
    }
    fetchRec();
  }, [topArtists]);

  const quickPickSongs = useMemo(() => {
    const merged = [...likedSongs.slice(0, 3), ...recentlyPlayed.slice(0, 6)];
    return [...new Map(merged.map(s => [s.id, s])).values()].slice(0, 6);
  }, [likedSongs, recentlyPlayed]);

  return (
    <div className="pb-8">
      {/* Greeting */}
      <section className="mb-6 animate-fade-in-up">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">{getGreeting()}</h1>
        <p className="text-sm text-[#AAAAAA]">
          {topArtists?.length ? `For you • ${topArtists.join(', ')}` : 'Discover new music'}
        </p>
      </section>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="text-[#FF0000] animate-spin" />
          <span className="ml-3 text-[#AAAAAA] text-sm">Loading...</span>
        </div>
      )}

      {/* Quick Picks */}
      {quickPickSongs.length > 0 && (
        <section className="mb-6 animate-fade-in-up">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {quickPickSongs.map((song) => (
              <button
                key={song.id}
                onClick={() => playSong(song, quickPickSongs)}
                className="group flex items-center gap-2 bg-[#1A1A1A] hover:bg-[#2A2A2A] rounded-md overflow-hidden transition-colors"
              >
                <img src={song.image} alt="" className="w-11 h-11 sm:w-12 sm:h-12 object-cover" />
                <p className="text-xs sm:text-sm font-medium text-white truncate pr-2 flex-1">{song.title}</p>
                <div className="w-8 h-8 bg-[#1DB954] rounded-full items-center justify-center mr-2 hidden group-hover:flex shadow-lg">
                  <Play size={14} className="text-black ml-0.5" fill="black" />
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Personalized "Made For You" */}
      {recSongs.length > 0 && (
        <HorizontalScroll title="Made For You">
          {recSongs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </HorizontalScroll>
      )}

      {/* Top Hindi Chart */}
      {(sections.top_hindi?.length > 0) && (
        <section className="mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-3">🇮🇳 Top Hindi</h2>
          <div className="bg-[#1A1A1A] rounded-xl overflow-hidden">
            {sections.top_hindi.slice(0, 8).map((song, i) => (
              <SongRow key={song.id} song={song} index={i} songList={sections.top_hindi} />
            ))}
          </div>
        </section>
      )}

      {/* Sections as carousels */}
      {SECTIONS.filter(s => s.key !== 'top_hindi').map((sec) => {
        const songs = sections[sec.key] || [];
        if (songs.length === 0) return null;
        return (
          <HorizontalScroll key={sec.key} title={sec.title}>
            {songs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </HorizontalScroll>
        );
      })}
    </div>
  );
}
