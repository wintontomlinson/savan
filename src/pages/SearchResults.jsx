import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Play, Loader2, SearchX, RefreshCw } from 'lucide-react';
import { searchSongs } from '../data/api';
import { ytmSearchSongs, getYtAudioStream } from '../data/ytmusic';
import { usePlayer } from '../context/PlayerContext';
import SongRow from '../components/SongRow';

export default function SearchResults() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const { playSong, showToast } = usePlayer();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const requestId = useRef(0);

  const doSearch = async () => {
    if (!q) return;
    setLoading(true);
    setError(false);
    const id = ++requestId.current;
    
    // JioSaavn is primary — always try it
    let saavnResults = [];
    let ytResults = [];
    try {
      saavnResults = await searchSongs(q, 25) || [];
    } catch { saavnResults = []; }
    
    // YT Music is optional bonus — don't let it break anything
    try {
      ytResults = await ytmSearchSongs(q, 5) || [];
    } catch { ytResults = []; }
    
    if (id !== requestId.current) return;
    if (saavnResults.length === 0 && ytResults.length === 0) { setError(true); setLoading(false); return; }
    
    // Combine: JioSaavn first (directly playable), then YT results
    const combined = [
      ...saavnResults,
      ...ytResults.map(r => ({ ...r, ytOnly: true })),
    ];
    
    setSongs(combined);
    setLoading(false);
  };

  // Play a song — handles both JioSaavn (direct) and YT (needs stream fetch)
  const handlePlay = async (song, songList) => {
    if (song.ytOnly && song.videoId) {
      showToast('Loading...');
      try {
        const audioUrl = await getYtAudioStream(song.videoId);
        if (audioUrl) {
          const playableSong = { ...song, audio: audioUrl, ytOnly: undefined };
          playSong(playableSong, songList?.filter(s => !s.ytOnly));
        } else {
          // Fallback: search this song on JioSaavn instead
          showToast('Searching on JioSaavn...');
          const fallback = await searchSongs(`${song.title} ${song.artist}`, 1);
          if (fallback?.length > 0) {
            playSong(fallback[0], songList?.filter(s => !s.ytOnly));
          } else {
            showToast('Song not available', 'error');
          }
        }
      } catch {
        showToast('Error loading song', 'error');
      }
    } else {
      playSong(song, songList);
    }
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
          <p className="text-white text-sm">Unable to load results</p>
          <p className="text-[12px] text-[#666] mt-1 mb-4">Please check your connection</p>
          <button onClick={doSearch} className="flex items-center gap-2 mx-auto px-4 py-2 bg-[#FF0000] text-white text-[13px] rounded-full active:scale-95">
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {!loading && !error && !songs.length && (
        <div className="text-center py-16">
          <SearchX size={36} className="text-[#333] mx-auto mb-3" />
          <p className="text-white text-sm">No results for "{q}"</p>
          <p className="text-[12px] text-[#666] mt-1">Try different keywords</p>
        </div>
      )}

      {!loading && !error && songs.length > 0 && (
        <>
          <button onClick={() => handlePlay(songs[0], songs)}
            className="flex items-center gap-3 p-3 bg-[#111] rounded-2xl border border-[#1a1a1a] w-full sm:w-[340px] mb-5 active:scale-[0.98] transition-transform text-left">
            <img src={songs[0].thumbnail} alt="" className="w-14 h-14 rounded-xl object-cover" loading="lazy" />
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold text-white truncate">{songs[0].title}</p>
              <div className="flex items-center gap-2">
                <p className="text-[12px] text-[#888] truncate">{songs[0].artist}</p>
                {songs[0].ytOnly && <span className="text-[8px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full shrink-0">YT</span>}
              </div>
            </div>
            <div className="w-9 h-9 bg-[#FF0000] rounded-full flex items-center justify-center shrink-0">
              <Play size={14} className="text-white ml-0.5" fill="white" />
            </div>
          </button>
          <div className="bg-[#111] rounded-2xl overflow-hidden border border-[#1a1a1a]">
            {songs.map((s, i) => (
              <SongRow key={`${s.id}-${i}`} song={s} index={i} songList={songs} onPlay={s.ytOnly ? () => handlePlay(s, songs) : undefined} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
