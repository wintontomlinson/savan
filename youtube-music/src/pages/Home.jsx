import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Loader2, Settings2 } from 'lucide-react';
import { getGreeting } from '../data/data';
import { searchSongs } from '../data/api';
import { usePlayer } from '../context/PlayerContext';
import { ARTISTS, GENRES } from './Preferences';
import SongCard from '../components/SongCard';
import HorizontalScroll from '../components/HorizontalScroll';
import SongRow from '../components/SongRow';

// Genre to search query map
const GENRE_QUERIES = {
  bollywood: 'latest bollywood hindi 2024',
  punjabi: 'punjabi latest 2024 hits',
  pop: 'global pop hits 2024',
  hiphop: 'hip hop rap trending 2024',
  lofi: 'lofi hindi chill beats',
  romantic: 'romantic love songs hindi',
  party: 'party dance songs 2024',
  devotional: 'bhajan aarti devotional',
  retro: 'old classic hindi 90s songs',
  kpop: 'kpop korean hits 2024',
  workout: 'workout gym motivation songs',
  sad: 'sad emotional hindi songs',
};

export default function Home() {
  const { playSong, recentlyPlayed, likedSongs } = usePlayer();
  const navigate = useNavigate();
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);

  // Load user preferences
  const prefArtists = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('yt_pref_artists')) || []; } catch { return []; }
  }, []);
  const prefGenres = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('yt_pref_genres')) || []; } catch { return []; }
  }, []);

  const hasPrefs = prefArtists.length > 0 || prefGenres.length > 0;

  // Build fetch list based on preferences
  const fetchList = useMemo(() => {
    const list = [];

    // Top chart always
    list.push({ key: 'top', query: 'top trending india 2024', title: '🇮🇳 Top Charts' });

    // Artist sections from preferences
    prefArtists.forEach(id => {
      const artist = ARTISTS.find(a => a.id === id);
      if (artist) list.push({ key: `artist_${id}`, query: `${artist.query} latest hits`, title: artist.name });
    });

    // Genre sections from preferences
    prefGenres.forEach(id => {
      const genre = GENRES.find(g => g.id === id);
      if (genre && GENRE_QUERIES[id]) list.push({ key: `genre_${id}`, query: GENRE_QUERIES[id], title: genre.name });
    });

    // If no preferences, show defaults
    if (!hasPrefs) {
      list.push(
        { key: 'new', query: 'new release hindi 2024', title: 'New Releases' },
        { key: 'arijit', query: 'Arijit Singh hits', title: 'Arijit Singh' },
        { key: 'punjabi', query: 'Punjabi top 2024', title: 'Punjabi Hits' },
        { key: 'pop', query: 'english pop hits 2024', title: 'Pop Hits' },
        { key: 'romantic', query: 'romantic bollywood songs', title: 'Romance' },
      );
    }

    return list;
  }, [prefArtists, prefGenres, hasPrefs]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = {};
      await Promise.all(fetchList.map(async (s) => { res[s.key] = await searchSongs(s.query, 12); }));
      setSections(res);
      setLoading(false);
    }
    load();
  }, [fetchList]);

  const quickPicks = useMemo(() => {
    const m = [...likedSongs.slice(0, 3), ...recentlyPlayed.slice(0, 6)];
    return [...new Map(m.map(s => [s.id, s])).values()].slice(0, 6);
  }, [likedSongs, recentlyPlayed]);

  const topSongs = sections.top || [];

  return (
    <div className="pb-6">
      {/* Header */}
      <section className="flex items-center justify-between mb-6 animate-fade-in-up">
        <div>
          <h1 className="text-[24px] sm:text-[30px] font-bold text-white tracking-tight">{getGreeting()}</h1>
          {hasPrefs && <p className="text-[13px] text-[#98989F] mt-0.5">Personalized for you</p>}
        </div>
        <button
          onClick={() => navigate('/preferences')}
          className="p-2.5 bg-[#1C1C1E] rounded-xl hover:bg-[#2C2C2E] transition-colors"
          title="Edit Preferences"
        >
          <Settings2 size={18} className="text-[#98989F]" />
        </button>
      </section>

      {/* No preferences prompt */}
      {!hasPrefs && !loading && (
        <section className="mb-7 animate-fade-in-up">
          <button
            onClick={() => navigate('/preferences')}
            className="w-full p-5 bg-gradient-to-r from-[#FC3C44]/20 to-[#1C1C1E] rounded-2xl border border-[#FC3C44]/30 text-left hover:border-[#FC3C44]/50 transition-colors"
          >
            <p className="text-[16px] font-bold text-white mb-1">Tell us what you like</p>
            <p className="text-[13px] text-[#98989F]">Pick your favourite artists & genres for personalized music →</p>
          </button>
        </section>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={22} className="text-[#FC3C44] animate-spin" />
          <span className="ml-3 text-[14px] text-[#98989F]">Loading your music...</span>
        </div>
      )}

      {/* Quick Picks */}
      {quickPicks.length > 0 && (
        <section className="mb-7 animate-fade-in-up">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {quickPicks.map((song) => (
              <button
                key={song.id}
                onClick={() => playSong(song, quickPicks)}
                className="group flex items-center gap-2.5 bg-[#1C1C1E] hover:bg-[#2C2C2E] rounded-xl overflow-hidden transition-colors"
              >
                <img src={song.image} alt="" className="w-[50px] h-[50px] object-cover" />
                <p className="text-[11px] sm:text-[12px] font-medium text-white truncate pr-2 flex-1">{song.title}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Top Chart */}
      {topSongs.length > 0 && (
        <section className="mb-7">
          <h2 className="text-[17px] sm:text-[19px] font-bold text-white mb-3">🇮🇳 Top Charts</h2>
          <div className="bg-[#1C1C1E] rounded-2xl overflow-hidden border border-white/5">
            {topSongs.slice(0, 10).map((song, i) => (
              <SongRow key={song.id} song={song} index={i} songList={topSongs} />
            ))}
          </div>
        </section>
      )}

      {/* Dynamic Sections (artist + genre based on preferences) */}
      {fetchList.filter(s => s.key !== 'top').map((sec) => {
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
