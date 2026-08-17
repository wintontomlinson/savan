import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Play, Loader2 } from 'lucide-react';
import { searchSongs } from '../data/api';
import { usePlayer } from '../context/PlayerContext';
import SongRow from '../components/SongRow';

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { playSong } = usePlayer();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) { setResults([]); return; }
    setLoading(true);
    searchSongs(query, 25).then(r => { setResults(r); setLoading(false); });
  }, [query]);

  if (!query) {
    return (
      <div className="text-center py-20">
        <p className="text-[18px] text-white font-medium">Search</p>
        <p className="text-[14px] text-[#98989F] mt-1">Find your favourite music</p>
      </div>
    );
  }

  return (
    <div className="pb-8 animate-fade-in-up">
      <h1 className="text-[22px] font-bold text-white mb-1">Results for "{query}"</h1>
      <p className="text-[13px] text-[#98989F] mb-5">{results.length} songs found</p>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={22} className="text-[#FC3C44] animate-spin" />
          <span className="ml-3 text-[14px] text-[#98989F]">Searching...</span>
        </div>
      )}

      {!loading && results.length === 0 && (
        <p className="text-center text-[#98989F] py-16">No results found</p>
      )}

      {!loading && results.length > 0 && (
        <>
          {/* Top Result */}
          <section className="mb-6">
            <h2 className="text-[15px] font-semibold text-[#98989F] uppercase tracking-wide mb-3">Top Result</h2>
            <button
              onClick={() => playSong(results[0], results)}
              className="group w-full sm:w-[380px] p-4 bg-[#1C1C1E] rounded-2xl border border-white/5 hover:bg-[#2C2C2E] transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                <img src={results[0].image} alt="" className="w-[72px] h-[72px] rounded-xl object-cover shadow-lg" />
                <div className="flex-1 min-w-0">
                  <p className="text-[17px] font-bold text-white truncate">{results[0].title}</p>
                  <p className="text-[14px] text-[#98989F] truncate">{results[0].artist}</p>
                </div>
                <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                  <Play size={16} className="text-black ml-0.5" fill="black" />
                </div>
              </div>
            </button>
          </section>

          {/* All Songs */}
          <section>
            <h2 className="text-[15px] font-semibold text-[#98989F] uppercase tracking-wide mb-3">Songs</h2>
            <div className="bg-[#1C1C1E] rounded-2xl overflow-hidden border border-white/5">
              {results.map((song, i) => (
                <SongRow key={song.id} song={song} index={i} songList={results} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
