import { useState, useEffect, useMemo } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { getGreeting } from '../data/data';
import { searchSongs } from '../data/api';
import { usePlayer } from '../context/PlayerContext';
import SongCard from '../components/SongCard';
import HorizontalScroll from '../components/HorizontalScroll';
import SongRow from '../components/SongRow';

const SECTIONS = [
  { key: 'top_india', query: 'top charts india 2024 latest', title: 'Top Charts: India' },
  { key: 'new_music', query: 'new release hindi 2024', title: 'New Music Daily' },
  { key: 'arijit', query: 'Arijit Singh hits', title: 'Arijit Singh Essentials' },
  { key: 'pop_hits', query: 'global pop hits 2024', title: 'Today\'s Hits' },
  { key: 'punjabi', query: 'Punjabi top 2024 Diljit AP Dhillon', title: 'Punjabi Hits' },
  { key: 'romance', query: 'romantic hindi songs bollywood love', title: 'Love & Romance' },
  { key: 'hiphop', query: 'hip hop rap india english 2024', title: 'Hip-Hop Hits' },
  { key: 'lofi', query: 'lofi hindi chill study', title: 'Lo-Fi Chill' },
  { key: 'workout', query: 'workout gym energy songs', title: 'Pure Workout' },
  { key: 'retro', query: 'old hindi songs classic 90s', title: 'Retro Bollywood' },
];

function getUserTopArtists(recently, liked) {
  const all = [...recently, ...liked];
  if (all.length === 0) return [];
  const count = {};
  all.forEach(s => { const a = s.artist?.split(',')[0]?.trim(); if (a) count[a] = (count[a] || 0) + 1; });
  return Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([n]) => n);
}

export default function Home() {
  const { playSong, recentlyPlayed, likedSongs } = usePlayer();
  const [sections, setSections] = useState({});
  const [forYou, setForYou] = useState([]);
  const [loading, setLoading] = useState(true);

  const topArtists = useMemo(() => getUserTopArtists(recentlyPlayed, likedSongs), [recentlyPlayed, likedSongs]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = {};
      await Promise.all(SECTIONS.map(async (s) => { res[s.key] = await searchSongs(s.query, 12); }));
      setSections(res);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (topArtists.length === 0) return;
    searchSongs(`${topArtists[0]} ${topArtists[1] || ''} similar`, 12).then(setForYou);
  }, [topArtists]);

  const quickPicks = useMemo(() => {
    const m = [...likedSongs.slice(0, 3), ...recentlyPlayed.slice(0, 6)];
    return [...new Map(m.map(s => [s.id, s])).values()].slice(0, 6);
  }, [likedSongs, recentlyPlayed]);

  const topIndia = sections.top_india || [];

  return (
    <div className="pb-6">
      {/* Greeting */}
      <section className="mb-6 animate-fade-in-up">
        <h1 className="text-[26px] sm:text-[32px] font-bold text-white tracking-tight">{getGreeting()}</h1>
        {topArtists.length > 0 && (
          <p className="text-[14px] text-[#98989F] mt-0.5">Based on {topArtists.join(', ')}</p>
        )}
      </section>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={22} className="text-[#FC3C44] animate-spin" />
          <span className="ml-3 text-[14px] text-[#98989F]">Loading...</span>
        </div>
      )}

      {/* Quick Picks - Apple style compact row */}
      {quickPicks.length > 0 && (
        <section className="mb-7 animate-fade-in-up">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {quickPicks.map((song) => (
              <button
                key={song.id}
                onClick={() => playSong(song, quickPicks)}
                className="group flex items-center gap-2.5 bg-[#1C1C1E] hover:bg-[#2C2C2E] rounded-xl overflow-hidden transition-colors"
              >
                <img src={song.image} alt="" className="w-[52px] h-[52px] object-cover" />
                <p className="text-[12px] sm:text-[13px] font-medium text-white truncate pr-3 flex-1">{song.title}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* For You */}
      {forYou.length > 0 && (
        <HorizontalScroll title="Made For You">
          {forYou.map((song) => <SongCard key={song.id} song={song} />)}
        </HorizontalScroll>
      )}

      {/* Top India Chart */}
      {topIndia.length > 0 && (
        <section className="mb-7">
          <h2 className="text-[17px] sm:text-[19px] font-bold text-white mb-3">🇮🇳 Top Charts: India</h2>
          <div className="bg-[#1C1C1E] rounded-2xl overflow-hidden border border-white/5">
            {topIndia.slice(0, 10).map((song, i) => (
              <SongRow key={song.id} song={song} index={i} songList={topIndia} />
            ))}
          </div>
        </section>
      )}

      {/* Sections */}
      {SECTIONS.filter(s => s.key !== 'top_india').map((sec) => {
        const songs = sections[sec.key] || [];
        if (songs.length === 0) return null;
        return (
          <HorizontalScroll key={sec.key} title={sec.title}>
            {songs.map((song) => <SongCard key={song.id} song={song} />)}
          </HorizontalScroll>
        );
      })}
    </div>
  );
}
