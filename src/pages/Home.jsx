import { useState, useEffect, useMemo } from 'react';
import { Play, Loader2, Radio } from 'lucide-react';
import { getGreeting } from '../data/mockData';
import { searchSongs } from '../data/api';
import { getHomeQueries, getHistory, analyzePreferences } from '../data/algorithm';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import SongCard from '../components/SongCard';
import HorizontalScroll from '../components/HorizontalScroll';
import SongRow from '../components/SongRow';

export default function Home() {
  const { playSong, currentSong, upNext } = usePlayer();
  const { user } = useAuth();
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);

  const queries = useMemo(() => getHomeQueries(currentSong), [currentSong]);
  const history = useMemo(() => getHistory(), []);
  const prefs = useMemo(() => analyzePreferences(), []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = {};
      await Promise.all(queries.map(async s => {
        res[s.key] = await searchSongs(s.query, 12);
      }));
      setSections(res);
      setLoading(false);
    }
    load();
  }, [queries]);

  const recentSongs = history.slice(0, 6);

  return (
    <div className="pb-6">
      {/* Greeting */}
      <section className="mb-6 rounded-2xl bg-gradient-to-r from-[#FF0000]/15 via-[#1A1A1A] to-[#1A1A1A] p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">{getGreeting()}, {user.name}</h1>
        <p className="text-sm text-[#AAAAAA]">
          {currentSong ? `Now: ${currentSong.title} — ${currentSong.artist}` : prefs ? `${prefs.totalPlays} songs played` : 'Start listening'}
        </p>
      </section>

      {loading && <div className="flex items-center justify-center py-16"><Loader2 size={24} className="text-[#FF0000] animate-spin" /></div>}

      {/* Up Next - what will play next */}
      {currentSong && upNext.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Radio size={16} className="text-[#FF0000]" />
            <h2 className="text-base font-semibold text-white">Playing Next</h2>
          </div>
          <div className="bg-[#1A1A1A] rounded-xl overflow-hidden">
            {upNext.slice(0, 5).map((s, i) => <SongRow key={s.id} song={s} index={i} songList={upNext} />)}
          </div>
        </section>
      )}

      {/* Recent - only when nothing playing */}
      {!currentSong && recentSongs.length > 0 && (
        <section className="mb-6">
          <h2 className="text-base font-semibold text-white mb-3">Jump Back In</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {recentSongs.map(s => (
              <button key={s.id} onClick={() => playSong(s)} className="group flex items-center gap-2.5 bg-[#1A1A1A] hover:bg-[#272727] rounded-lg overflow-hidden transition-colors">
                <img src={s.thumbnail} alt="" className="w-12 h-12 object-cover" />
                <p className="text-xs sm:text-sm font-medium text-white truncate pr-2 flex-1">{s.title}</p>
                <div className="w-7 h-7 bg-[#FF0000] rounded-full items-center justify-center mr-2 hidden group-hover:flex shrink-0">
                  <Play size={12} className="text-white ml-0.5" fill="white" />
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Sections from algorithm */}
      {queries.map(sec => {
        const songs = sections[sec.key] || [];
        if (!songs.length) return null;
        return <HorizontalScroll key={sec.key} title={sec.title}>{songs.map(s => <SongCard key={s.id} song={s} />)}</HorizontalScroll>;
      })}
    </div>
  );
}
