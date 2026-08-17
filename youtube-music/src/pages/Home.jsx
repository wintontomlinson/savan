import { useState, useEffect } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { moods, getGreeting } from '../data/data';
import { searchSongs } from '../data/api';
import { usePlayer } from '../context/PlayerContext';
import SongCard from '../components/SongCard';
import HorizontalScroll from '../components/HorizontalScroll';
import SongRow from '../components/SongRow';

// Categories to fetch from API
const CATEGORIES = [
  { key: 'trending', query: 'trending top hits 2024', title: '🔥 Trending Now' },
  { key: 'bollywood', query: 'Arijit Singh Pritam latest bollywood', title: '❤️ Bollywood Romance' },
  { key: 'punjabi', query: 'AP Dhillon Sidhu Moosewala Punjabi', title: '🔥 Punjabi Hits' },
  { key: 'english', query: 'The Weeknd Dua Lipa Taylor Swift pop', title: '🌍 English Pop' },
  { key: 'chill', query: 'lofi chill relax', title: '😌 Chill & Relax' },
  { key: 'party', query: 'party dance songs hindi english', title: '🎉 Party Mix' },
];

export default function Home() {
  const { playSong, recentlyPlayed } = usePlayer();
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      const results = {};
      const promises = CATEGORIES.map(async (cat) => {
        const songs = await searchSongs(cat.query, 12);
        results[cat.key] = songs;
      });
      await Promise.all(promises);
      setSections(results);
      setLoading(false);
    }
    fetchAll();
  }, []);

  const trendingSongs = sections.trending || [];

  return (
    <div className="pb-8">
      {/* Greeting */}
      <section className="mb-8 px-2 animate-fade-in-up">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#FF0000]/20 via-[#1F1F1F] to-[#1F1F1F] p-8 sm:p-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 animate-text-reveal">{getGreeting()}</h1>
          <p className="text-[#AAAAAA] text-sm">Stream real music from JioSaavn</p>
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
          <span className="ml-3 text-[#AAAAAA] text-sm">Loading music...</span>
        </div>
      )}

      {/* Quick Picks from Trending */}
      {trendingSongs.length > 0 && (
        <section className="mb-8 px-2 animate-fade-in-up">
          <h2 className="text-xl font-bold text-white mb-4">Quick Picks</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {trendingSongs.slice(0, 6).map((song) => (
              <button
                key={song.id}
                onClick={() => playSong(song, trendingSongs)}
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

      {/* Recently Played */}
      {recentlyPlayed.length > 0 && (
        <HorizontalScroll title="🕐 Recently Played">
          {recentlyPlayed.slice(0, 10).map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </HorizontalScroll>
      )}

      {/* Category Sections */}
      {CATEGORIES.map((cat) => {
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

      {/* Trending Chart */}
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
