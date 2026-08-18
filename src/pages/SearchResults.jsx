import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Play, Loader2, SearchX, TrendingUp, Clock, RefreshCw } from 'lucide-react';
import { searchSongs } from '../data/api';
import { usePlayer } from '../context/PlayerContext';
import { getHistory } from '../data/algorithm';
import SongRow from '../components/SongRow';

const TRENDING = ['Arijit Singh', 'Diljit Dosanjh', 'AP Dhillon', 'Shreya Ghoshal', 'Sidhu Moose Wala', 'Atif Aslam', 'KK', 'Jubin Nautiyal'];

export default function SearchResults() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const { playSong } = usePlayer();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const requestId = useRef(0);

  const doSearch = async () => {
    if (!q?.trim()) return;
    setLoading(true);
    setError(false);
    const id = ++requestId.current;
    const s = await searchSongs(q, 30) || [];
    if (id !== requestId.current) return;
    if (s.length === 0) { setError(true); setLoading(false); return; }
    setSongs(s);
    setLoading(false);
  };

  useEffect(() => { if (q) doSearch(); }, [q]);

  const quickSearch = (term) => {
    setParams({ q: term });
  };

  // Recent searches from history
  const recentArtists = [...new Set(getHistory().slice(0, 20).map(s => s.artist?.split(',')[0]?.trim()).filter(Boolean))].slice(0, 5);

  return (
    <div className="pb-6 pt-2">
      {/* No query — show suggestions */}
      {!q && (
        <div className="mt-4 animate-in">
          {/* Recent */}
          {recentArtists.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3 px-1">
                <Clock size={14} className="text-[#666]" />
                <p className="text-[13px] text-[#888] font-medium">Recent</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentArtists.map(a => (
                  <button key={a} onClick={() => quickSearch(a)}
                    className="px-4 py-2 bg-[#161616] hover:bg-[#1e1e1e] rounded-full text-[13px] text-white border border-white/[0.04] transition-colors btn-press">
                    {a}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trending */}
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <TrendingUp size={14} className="text-rose-400" />
              <p className="text-[13px] text-[#888] font-medium">Trending</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {TRENDING.map(t => (
                <button key={t} onClick={() => quickSearch(t)}
                  className="px-4 py-2 bg-[#161616] hover:bg-[#1e1e1e] rounded-full text-[13px] text-white border border-white/[0.04] transition-colors btn-press">
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search results */}
      {q && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-4 px-1">
            <div>
              <h2 className="text-[16px] font-bold text-white">"{q}"</h2>
              <p className="text-[11px] text-[#666] mt-0.5">{loading ? 'Searching...' : songs.length > 0 ? `${songs.length} songs found` : ''}</p>
            </div>
            {songs.length > 0 && (
              <button onClick={() => playSong(songs[0], songs)}
                className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-[12px] font-semibold rounded-full transition-colors btn-press">
                <Play size={12} fill="white" /> Play All
              </button>
            )}
          </div>

          {loading && <div className="flex justify-center py-16"><Loader2 size={22} className="text-rose-500 animate-spin" /></div>}

          {error && !loading && (
            <div className="text-center py-16 animate-in">
              <SearchX size={36} className="text-[#333] mx-auto mb-3" />
              <p className="text-white text-sm">No results found</p>
              <p className="text-[12px] text-[#666] mt-1 mb-4">Try different keywords</p>
              <button onClick={() => doSearch(q)} className="flex items-center gap-2 mx-auto px-4 py-2 bg-rose-500 text-white text-[13px] rounded-full btn-press">
                <RefreshCw size={14} /> Retry
              </button>
            </div>
          )}

          {!loading && !error && songs.length > 0 && (
            <div className="bg-[#0e0e0e] rounded-2xl overflow-hidden border border-white/[0.03]">
              {songs.map((s, i) => <SongRow key={`${s.id}-${i}`} song={s} index={i} songList={songs} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
