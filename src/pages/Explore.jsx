import { useState, useRef, useEffect } from 'react';
import { Loader2, Play, X, Shuffle, Disc3, TrendingUp, ListMusic, Mic, Users, Radio, ArrowUpRight } from 'lucide-react';
import { searchSongs, searchArtists, getPlaylistById } from '../data/api';
import { usePlayer } from '../context/PlayerContext';
import SongRow from '../components/SongRow';
import SongCard from '../components/SongCard';
import HorizontalScroll from '../components/HorizontalScroll';

// Browse sections — diverse genres with search queries for more variety
const BROWSE_SECTIONS = [
  { id: 'trending', label: 'Trending Now', icon: TrendingUp, playlistId: '1219706044', searchQuery: 'latest hindi hits 2024 trending', color: 'from-rose-500/20 to-pink-600/10', iconColor: 'text-rose-400' },
  { id: 'dance', label: 'Dance Hits', icon: Disc3, playlistId: '1219706999', searchQuery: 'bollywood dance party songs', color: 'from-amber-500/20 to-orange-600/10', iconColor: 'text-amber-400' },
  { id: 'retro', label: '90s Bollywood', icon: Radio, playlistId: '1167751266', searchQuery: '90s bollywood songs classic hindi', color: 'from-emerald-500/20 to-green-600/10', iconColor: 'text-emerald-400' },
  { id: 'english', label: 'English Pop', icon: Users, playlistId: '303128179', searchQuery: 'english pop songs trending 2024', color: 'from-blue-500/20 to-cyan-600/10', iconColor: 'text-blue-400' },
  { id: 'lofi', label: 'Lo-Fi Chill', icon: ListMusic, playlistId: '1079336813', searchQuery: 'lofi hindi chill relax', color: 'from-purple-500/20 to-violet-600/10', iconColor: 'text-purple-400' },
  { id: 'hiphop', label: 'Hip-Hop', icon: Mic, playlistId: '1265128247', searchQuery: 'indian hip hop rap songs', color: 'from-indigo-500/20 to-purple-600/10', iconColor: 'text-indigo-400' },
  { id: 'sad', label: 'Sad Songs', icon: ListMusic, playlistId: '802336660', searchQuery: 'sad hindi songs heartbreak', color: 'from-sky-500/20 to-blue-600/10', iconColor: 'text-sky-400' },
  { id: 'workout', label: 'Workout', icon: TrendingUp, playlistId: '156710699', searchQuery: 'workout gym motivation hindi songs', color: 'from-orange-500/20 to-red-600/10', iconColor: 'text-orange-400' },
  { id: 'sufi', label: 'Sufi', icon: Radio, playlistId: '1262711873', searchQuery: 'sufi songs qawwali hindi', color: 'from-teal-500/20 to-emerald-600/10', iconColor: 'text-teal-400' },
  { id: 'punjabi', label: 'Punjabi Hits', icon: Disc3, playlistId: '4144832', searchQuery: 'punjabi songs latest hits', color: 'from-pink-500/20 to-rose-600/10', iconColor: 'text-pink-400' },
];

export default function Explore() {
  const [activeArtist, setActiveArtist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [browseData, setBrowseData] = useState({});
  const [browseLoading, setBrowseLoading] = useState({});
  const [artists, setArtists] = useState([]);
  const [artistsLoading, setArtistsLoading] = useState(true);
  const { playSong, currentSong } = usePlayer();
  const songsRef = useRef(null);

  const loadArtist = async (artist) => {
    if (activeArtist === artist.name) { setActiveArtist(null); setSongs([]); scrollToTop(); return; }
    setActiveArtist(artist.name);
    setLoading(true);
    const s = await searchSongs(artist.name, 20) || [];
    setSongs(s);
    setLoading(false);
  };

  const scrollToTop = () => {
    const main = document.getElementById('main-scroll');
    if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadBrowse = async (section, shouldPlay = false) => {
    if (shouldPlay) {
      // On click — fetch fresh 30 songs via search for variety
      const fresh = await searchSongs(section.searchQuery, 30) || [];
      if (fresh.length > 0) {
        const filtered = fresh.filter(s => s.id !== (currentSong?.id || ''));
        const toPlay = filtered.length > 0 ? filtered : fresh;
        const shuffled = [...toPlay].sort(() => Math.random() - 0.5);
        playSong(shuffled[0], shuffled);
      }
      return;
    }
    // On mount — load playlist for display
    if (browseData[section.id]) return;
    setBrowseLoading(p => ({ ...p, [section.id]: true }));
    const results = await getPlaylistById(section.playlistId) || [];
    setBrowseData(p => ({ ...p, [section.id]: results }));
    setBrowseLoading(p => ({ ...p, [section.id]: false }));
  };

  useEffect(() => {
    let cancelled = false;
    const loadExploreData = async () => {
      setBrowseLoading(Object.fromEntries(BROWSE_SECTIONS.map(section => [section.id, true])));
      const collections = await Promise.all(BROWSE_SECTIONS.map(async section => [section.id, await getPlaylistById(section.playlistId) || []]));
      if (cancelled) return;
      const data = Object.fromEntries(collections);
      setBrowseData(data);
      setBrowseLoading({});

      const names = [...new Set(collections.flatMap(([, songs]) => songs.flatMap(song => song.artist.split(',').map(name => name.trim()).filter(Boolean))))];
      const profiles = await Promise.all(names.map(async name => (await searchArtists(name, 1))[0]));
      if (!cancelled) {
        setArtists(profiles.filter(Boolean));
        setArtistsLoading(false);
      }
    };
    loadExploreData();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (songs.length > 0 && songsRef.current) {
      songsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [songs]);

  const shufflePlay = (list) => {
    const shuffled = [...list].sort(() => Math.random() - 0.5);
    playSong(shuffled[0], shuffled);
  };

  return (
    <div className="pb-8 pt-3">
      <div className="mb-8 flex items-end justify-between border-b border-white/[0.07] pb-5">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-white sm:text-3xl">Explore</h1>
          <p className="mt-1 text-[13px] text-white/45">New songs, artists and playlists from across music.</p>
        </div>
        <button onClick={() => loadBrowse(BROWSE_SECTIONS[0], true)} className="flex shrink-0 items-center gap-2 rounded-full bg-rose-500 px-4 py-2.5 text-[11px] font-bold text-white transition-colors hover:bg-rose-400 active:scale-95">
          <Play size={13} fill="currentColor" /> Play trending
        </button>
      </div>

      <section className="mb-9">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-rose-300/70">Find a feeling</p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-white">Browse by mood</h2>
          </div>
          <span className="hidden text-[11px] text-white/35 sm:block">Play a fresh mix from any collection</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {BROWSE_SECTIONS.map((sec, index) => (
            <button key={sec.id} onClick={() => loadBrowse(sec, true)}
              className={`group relative min-h-[122px] overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-br ${sec.color} p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.16] hover:shadow-xl hover:shadow-black/25 active:scale-[0.98]`}>
              <span className="absolute right-3 top-3 text-[10px] font-bold text-white/25">0{index + 1}</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/20 ring-1 ring-white/[0.08] backdrop-blur-sm">
                <sec.icon size={18} className={sec.iconColor} />
              </div>
              <p className="mt-6 text-[13px] font-bold text-white">{sec.label}</p>
              <ArrowUpRight size={15} className="absolute bottom-4 right-4 text-white/0 transition-all duration-300 group-hover:text-white/80" />
            </button>
          ))}
        </div>
      </section>

      <section className="mb-10 animate-in" style={{ animationDelay: '0.05s' }}>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-rose-300/70">Live from the music catalog</p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-white">Top artists</h2>
          </div>
          <span className="text-[11px] text-white/35">{artists.length} artists</span>
        </div>
        {artistsLoading ? (
          <div className="flex gap-4 overflow-hidden pb-2">{[1, 2, 3, 4, 5, 6].map(item => <div key={item} className="h-24 w-20 shrink-0 rounded-full skeleton" />)}</div>
        ) : (
        <div className="flex gap-4 scroll-x pb-2">
          {artists.map(a => (
            <ArtistCard key={a.name} artist={a} isActive={activeArtist === a.name} onClick={() => loadArtist(a)} />
          ))}
        </div>)}
      </section>

      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-rose-300/70">Ready when you are</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-white">Curated collections</h2>
        </div>
      </div>

      {BROWSE_SECTIONS.map(sec => {
        const data = browseData[sec.id];
        const isLoading = browseLoading[sec.id];
        if (!data && !isLoading) return null;
        return (
          <section key={sec.id} className="mb-7 animate-in">
            {isLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 size={18} className="text-white/40 animate-spin" />
              </div>
            ) : data && data.length > 0 && (
              <HorizontalScroll title={sec.label}>
                {data.map(s => <SongCard key={s.id} song={s} />)}
              </HorizontalScroll>
            )}
          </section>
        );
      })}

      {activeArtist && (
        <div ref={songsRef} className="mb-8 animate-scale">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={22} className="text-white/60 animate-spin" />
            </div>
          ) : songs.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <img src={artists.find(a => a.name === activeArtist)?.img} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10 shrink-0" />
                  <div className="min-w-0">
                    <h2 className="text-[17px] font-bold text-white truncate">{activeArtist}</h2>
                    <p className="text-[11px] text-white/40">{songs.length} songs</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => shufflePlay(songs)} className="w-9 h-9 rounded-full bg-white/[0.08] flex items-center justify-center btn-press hover:bg-white/[0.12] transition-colors">
                    <Shuffle size={14} className="text-white" />
                  </button>
                  <button onClick={() => playSong(songs[0], songs)} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 rounded-full text-[12px] text-white font-bold btn-press shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 hover:scale-[1.02] transition-all duration-300">
                    <Play size={13} fill="white" /> Play All
                  </button>
                  <button onClick={() => { setActiveArtist(null); setSongs([]); scrollToTop(); }} className="w-9 h-9 rounded-full bg-white/[0.08] flex items-center justify-center btn-press hover:bg-white/[0.12] transition-colors">
                    <X size={14} className="text-white/60" />
                  </button>
                </div>
              </div>
              <div className="bg-[#0c0c0c] rounded-2xl overflow-hidden border border-white/[0.04]">
                {songs.map((s, i) => <SongRow key={s.id} song={s} index={i} songList={songs} />)}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

function ArtistCard({ artist, isActive, onClick }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 shrink-0 group transition-all duration-300 active:scale-[0.93]">
      <div className="relative w-20 h-20 sm:w-[90px] sm:h-[90px]">
        {isActive && <div className="absolute -inset-1 rounded-full bg-gradient-to-b from-rose-500/30 to-rose-600/10 blur-md" />}
        <div className={`relative w-full h-full rounded-full overflow-hidden transition-all duration-300 ${
          isActive
            ? 'ring-2 ring-rose-400 shadow-xl shadow-rose-500/25'
            : 'ring-1 ring-white/[0.08] shadow-lg shadow-black/40 group-hover:ring-white/[0.15] group-hover:shadow-xl'
        }`}>
          <img src={artist.img} alt={artist.name}
            className={`w-full h-full object-cover transition-all duration-300 ${
              isActive ? 'scale-110 brightness-90' : 'group-hover:scale-110 group-hover:brightness-75'
            }`} loading="lazy" />
          <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
            isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`} />
          <div className={`absolute inset-0 flex items-center justify-center transition-all duration-250 ${
            isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-xl transition-all duration-250 ${
              isActive 
                ? 'bg-rose-500 scale-100 shadow-rose-500/30' 
                : 'bg-white/90 scale-75 group-hover:scale-100'
            }`}>
              <Play size={14} className={isActive ? 'text-white ml-0.5' : 'text-black ml-0.5'} fill={isActive ? 'white' : 'black'} />
            </div>
          </div>
        </div>
      </div>
      <p className={`text-[11px] font-semibold text-center leading-tight truncate w-20 sm:w-[90px] transition-colors duration-200 ${
        isActive ? 'text-rose-400' : 'text-white/70 group-hover:text-white'
      }`}>{artist.name}</p>
    </button>
  );
}
