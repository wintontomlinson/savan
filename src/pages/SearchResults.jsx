import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Play, Loader2, SearchX, RefreshCw } from 'lucide-react';
import { searchSongs } from '../data/api';
import { usePlayer } from '../context/PlayerContext';
import SongRow from '../components/SongRow';

export default function SearchResults() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const { playSong } = usePlayer();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const requestId = useRef(0);

  const doSearch = async () => {
    if (!q) return;
    setLoading(true);
    setError(false);
    const id = ++requestId.current;
    const s = await searchSongs(q, 30) || [];
    if (id !== requestId.current) return;
    if (s.length === 0) { setError(true); setLoading(false); return; }
    setSongs(s);
    setLoading(false);
  };

  useEffect(() => { doSearch(); }, [q]);

  if (!q) return <div className="text-center py-20"><p className="text-base text-white">Search for music</p><p className="text-sm text-[#666] mt-1">Type in the search bar above</p></div>;

  return (
    <div className="pb-6 pt-2">
      <h1 className="text-lg sm:text-xl font-bold text-white mb-1">"{q}"</h1>
      <p className="text-[12px] text-[#666] mb-5">{loading ? 'Searching...' : `${songs.length} results`}</p>

      {loading && <div className="flex justify-center py-16"><Loader2 size={22} className="text-[#FF0000] animate-spin" /></div>}

      {error && !loading && (
        <div className="text-center py-16">
          <SearchX size={36} className="text-[#333] mx-auto mb-3" />
          <p className="text-white text-sm">No results for "{q}"</p>
          <p className="text-[12px] text-[#666] mt-1 mb-4">Try different keywords</p>
          <button onClick={doSearch} className="flex items-center gap-2 mx-auto px-4 py-2 bg-[#FF0000] text-white text-[13px] rounded-full active:scale-95">
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {!loading && !error && songs.length > 0 && (
        <>
          <button onClick={() => playSong(songs[0], songs)}
            className="flex items-center gap-3 p-3 bg-[#111] rounded-2xl border border-[#1a1a1a] w-full sm:w-[340px] mb-5 active:scale-[0.98] transition-transform text-left">
            <img src={songs[0].thumbnail} alt="" className="w-14 h-14 rounded-xl object-cover" loading="lazy" />
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold text-white truncate">{songs[0].title}</p>
              <p className="text-[12px] text-[#888]">{songs[0].artist}</p>
            </div>
            <div className="w-9 h-9 bg-[#FF0000] rounded-full flex items-center justify-center shrink-0">
              <Play size={14} className="text-white ml-0.5" fill="white" />
            </div>
          </button>
          <div className="bg-[#111] rounded-2xl overflow-hidden border border-[#1a1a1a]">
            {songs.map((s, i) => <SongRow key={`${s.id}-${i}`} song={s} index={i} songList={songs} />)}
          </div>
        </>
      )}
    </div>
  );
}
