import { useState, useRef, useEffect } from 'react';
import { Loader2, Play, X, Shuffle, ChevronRight, Disc3, TrendingUp, ListMusic, Mic, Users, Radio, Flame, Heart, Music } from 'lucide-react';
import { searchSongs, getPlaylistById } from '../data/api';
import { usePlayer } from '../context/PlayerContext';
import SongRow from '../components/SongRow';
import SongCard from '../components/SongCard';
import HorizontalScroll from '../components/HorizontalScroll';

const GENRES = [
  { id: 'trending', label: 'Trending', playlistId: '1219706044', searchQuery: 'latest hindi hits trending', color: 'from-fuchsia-600 via-pink-500 to-rose-500', icon: Flame },
  { id: 'dance', label: 'Dance', playlistId: '1219706999', searchQuery: 'bollywood dance party', color: 'from-amber-500 via-orange-500 to-yellow-500', icon: Disc3 },
  { id: 'retro', label: '90s Hits', playlistId: '1167751266', searchQuery: '90s bollywood classic', color: 'from-emerald-500 via-teal-400 to-cyan-400', icon: Radio },
  { id: 'english', label: 'English', playlistId: '303128179', searchQuery: 'english pop trending', color: 'from-blue-500 via-indigo-400 to-violet-400', icon: Users },
  { id: 'lofi', label: 'Lo-Fi', playlistId: '1079336813', searchQuery: 'lofi chill hindi', color: 'from-violet-600 via-purple-500 to-fuchsia-400', icon: Music },
  { id: 'hiphop', label: 'Hip-Hop', playlistId: '1265128247', searchQuery: 'indian hip hop rap', color: 'from-indigo-600 via-blue-500 to-cyan-400', icon: Mic },
  { id: 'sad', label: 'Sad', playlistId: '802336660', searchQuery: 'sad hindi heartbreak', color: 'from-slate-600 via-gray-500 to-zinc-400', icon: Heart },
  { id: 'workout', label: 'Workout', playlistId: '156710699', searchQuery: 'workout gym hindi', color: 'from-red-600 via-orange-500 to-amber-400', icon: TrendingUp },
  { id: 'punjabi', label: 'Punjabi', playlistId: '4144832', searchQuery: 'punjabi hits latest', color: 'from-pink-600 via-fuchsia-500 to-purple-400', icon: Disc3 },
  { id: 'sufi', label: 'Sufi', playlistId: '1262711873', searchQuery: 'sufi qawwali', color: 'from-teal-600 via-emerald-400 to-green-300', icon: Radio },
];

const ARTISTS = [
  { name: 'AP Dhillon', img: 'https://c.saavncdn.com/artists/AP_Dhillon_004_20251023102150_500x500.jpg', cat: 'Punjabi' },
  { name: 'Diljit Dosanjh', img: 'https://c.saavncdn.com/artists/Diljit_Dosanjh_005_20231025073054_500x500.jpg', cat: 'Punjabi' },
  { name: 'Sidhu Moosewala', img: 'https://c.saavncdn.com/artists/Sidhu_Moose_Wala_004_20250617183705_500x500.jpg', cat: 'Punjabi' },
  { name: 'Karan Aujla', img: 'https://c.saavncdn.com/artists/Karan_Aujla_004_20260810121947_500x500.jpg', cat: 'Punjabi' },
  { name: 'Shubh', img: 'https://c.saavncdn.com/artists/Shubh_000_20220921112507_500x500.jpg', cat: 'Punjabi' },
  { name: 'Guru Randhawa', img: 'https://c.saavncdn.com/artists/Guru_Randhawa_004_20250701125845_500x500.jpg', cat: 'Punjabi' },
  { name: 'Arijit Singh', img: 'https://c.saavncdn.com/artists/Arijit_Singh_004_20241118063717_500x500.jpg', cat: 'Bollywood' },
  { name: 'Shreya Ghoshal', img: 'https://c.saavncdn.com/artists/Shreya_Ghoshal_007_20241101074144_500x500.jpg', cat: 'Bollywood' },
  { name: 'Jubin Nautiyal', img: 'https://c.saavncdn.com/artists/Jubin_Nautiyal_003_20231130204020_500x500.jpg', cat: 'Bollywood' },
  { name: 'Atif Aslam', img: 'https://c.saavncdn.com/artists/Atif_Aslam_500x500.jpg', cat: 'Bollywood' },
  { name: 'A.R. Rahman', img: 'https://c.saavncdn.com/artists/AR_Rahman_002_20210120084455_500x500.jpg', cat: 'Bollywood' },
  { name: 'Pritam', img: 'https://c.saavncdn.com/artists/Pritam_Chakraborty-20170711073326_500x500.jpg', cat: 'Bollywood' },
  { name: 'The Weeknd', img: 'https://c.saavncdn.com/artists/The_Weeknd_002_20241003071400_500x500.jpg', cat: 'English' },
  { name: 'Drake', img: 'https://c.saavncdn.com/artists/Drake_006_20260520062317_500x500.jpg', cat: 'English' },
  { name: 'Taylor Swift', img: 'https://c.saavncdn.com/artists/Taylor_Swift_003_20200226074119_500x500.jpg', cat: 'English' },
  { name: 'Ed Sheeran', img: 'https://c.saavncdn.com/artists/Ed_Sheeran_002_20250625073038_500x500.jpg', cat: 'English' },
  { name: 'Dua Lipa', img: 'https://c.saavncdn.com/artists/Dua_Lipa_004_20231120090922_500x500.jpg', cat: 'English' },
  { name: 'Eminem', img: 'https://c.saavncdn.com/artists/Eminem_003_20240403152835_500x500.jpg', cat: 'English' },
  { name: 'Badshah', img: 'https://c.saavncdn.com/artists/Badshah_006_20241118064015_500x500.jpg', cat: 'Hip-Hop' },
  { name: 'Honey Singh', img: 'https://c.saavncdn.com/artists/Yo_Yo_Honey_Singh_004_20260811095253_500x500.jpg', cat: 'Hip-Hop' },
  { name: 'Divine', img: 'https://c.saavncdn.com/artists/DIVINE_006_20250911071442_500x500.jpg', cat: 'Hip-Hop' },
  { name: 'Kishore Kumar', img: 'https://c.saavncdn.com/artists/Kishore_Kumar_500x500.jpg', cat: 'Legends' },
  { name: 'Lata Mangeshkar', img: 'https://c.saavncdn.com/artists/Lata_Mangeshkar_004_20230623105323_500x500.jpg', cat: 'Legends' },
  { name: 'Mohammed Rafi', img: 'https://c.saavncdn.com/artists/Mohammed_Rafi_500x500.jpg', cat: 'Legends' },
];

const CATEGORIES = ['Punjabi', 'Bollywood', 'English', 'Hip-Hop', 'Legends'];

export default function Explore() {
  const [activeArtist, setActiveArtist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [browseData, setBrowseData] = useState({});
  const [browseLoading, setBrowseLoading] = useState({});
  const { playSong, currentSong } = usePlayer();
  const songsRef = useRef(null);

  const loadArtist = async (artist) => {
    if (activeArtist === artist.name) { setActiveArtist(null); setSongs([]); return; }
    setActiveArtist(artist.name);
    setLoading(true);
    const s = await searchSongs(artist.name, 20) || [];
    setSongs(s);
    setLoading(false);
  };

  const playGenre = async (genre) => {
    const fresh = await searchSongs(genre.searchQuery, 30) || [];
    if (fresh.length > 0) {
      const shuffled = [...fresh].sort(() => Math.random() - 0.5);
      playSong(shuffled[0], shuffled);
    }
  };

  const loadBrowse = async (section) => {
    if (browseData[section.id]) return;
    setBrowseLoading(p => ({ ...p, [section.id]: true }));
    const results = await getPlaylistById(section.playlistId) || [];
    setBrowseData(p => ({ ...p, [section.id]: results }));
    setBrowseLoading(p => ({ ...p, [section.id]: false }));
  };

  useEffect(() => { GENRES.forEach(g => loadBrowse(g)); }, []);

  useEffect(() => {
    if (songs.length > 0 && songsRef.current) songsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [songs]);

  return (
    <div className="pb-6 pt-3">
      {/* Title */}
      <section className="mb-7 animate-in">
        <div className="relative overflow-hidden rounded-2xl p-5 sm:p-6 border border-white/[0.08]" style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 35%, #1a1145 65%, #0d0620 100%)' }}>
          <div className="absolute top-[-30%] left-[10%] w-28 h-28 bg-fuchsia-500/[0.12] rounded-full blur-[50px] animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-[-20%] right-[15%] w-24 h-24 bg-violet-400/[0.1] rounded-full blur-[40px] animate-pulse" style={{ animationDuration: '3s', animationDelay: '1.5s' }} />
          <div className="relative">
            <h1 className="text-[26px] sm:text-[30px] font-black text-transparent bg-clip-text tracking-tight" style={{ backgroundImage: 'linear-gradient(90deg, #fff 0%, #e879f9 50%, #a78bfa 100%)' }}>Explore</h1>
            <p className="text-[12px] text-white/30 mt-1 font-medium">Discover your next obsession</p>
          </div>
        </div>
      </section>

      {/* Genre Cards */}
      <section className="mb-8 animate-in" style={{ animationDelay: '0.05s' }}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {GENRES.map((g, i) => (
            <button key={g.id} onClick={() => playGenre(g)}
              style={{ animationDelay: `${i * 40}ms` }}
              className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 text-left bg-gradient-to-br ${g.color} transition-all duration-300 active:scale-[0.93] hover:scale-[1.04] hover:shadow-2xl hover:shadow-black/40 group animate-in border border-white/[0.1]`}>
              {/* Inner glow */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/[0.05]" />
              {/* Shine sweep */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <g.icon size={22} className="relative text-white/90 mb-2.5 group-hover:scale-125 group-hover:rotate-12 transition-all duration-400 drop-shadow-lg" />
              <p className="relative text-[13px] font-bold text-white drop-shadow-sm">{g.label}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Curated Playlists */}
      {GENRES.slice(0, 6).map(sec => {
        const data = browseData[sec.id];
        const isLoading = browseLoading[sec.id];
        if (!data && !isLoading) return null;
        return (
          <section key={sec.id} className="animate-in">
            {isLoading ? (
              <div className="flex justify-center py-4"><Loader2 size={16} className="text-white/15 animate-spin" /></div>
            ) : data && data.length > 0 && (
              <HorizontalScroll title={sec.label}>{data.map(s => <SongCard key={s.id} song={s} />)}</HorizontalScroll>
            )}
          </section>
        );
      })}

      {/* Artist Songs Panel */}
      {activeArtist && (
        <div ref={songsRef} className="mb-8 animate-scale">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 size={20} className="text-fuchsia-400/50 animate-spin" /></div>
          ) : songs.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4 p-4 rounded-2xl border border-white/[0.06]" style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #15102a 100%)' }}>
                <div className="flex items-center gap-3">
                  <img src={ARTISTS.find(a => a.name === activeArtist)?.img} alt="" className="w-14 h-14 rounded-full object-cover ring-2 ring-fuchsia-400/30 shadow-xl shadow-fuchsia-500/10" />
                  <div>
                    <h2 className="text-[17px] font-bold text-white">{activeArtist}</h2>
                    <p className="text-[11px] text-white/30">{songs.length} songs</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { const s = [...songs].sort(() => Math.random() - 0.5); playSong(s[0], s); }}
                    className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.1] active:scale-90 transition-all">
                    <Shuffle size={14} className="text-white/60" />
                  </button>
                  <button onClick={() => playSong(songs[0], songs)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white rounded-full text-[12px] font-bold shadow-lg shadow-fuchsia-500/20 hover:shadow-fuchsia-500/30 hover:scale-[1.03] active:scale-95 transition-all">
                    <Play size={13} fill="white" /> Play
                  </button>
                  <button onClick={() => { setActiveArtist(null); setSongs([]); }}
                    className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.1] active:scale-90 transition-all">
                    <X size={14} className="text-white/40" />
                  </button>
                </div>
              </div>
              <div className="rounded-2xl border border-white/[0.04] overflow-hidden">
                {songs.map((s, i) => <SongRow key={s.id} song={s} index={i} songList={songs} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Artists by Category */}
      <div className="space-y-8 mt-4">
        {CATEGORIES.map((cat, ci) => {
          const artists = ARTISTS.filter(a => a.cat === cat);
          return (
            <section key={cat} className="animate-in" style={{ animationDelay: `${ci * 0.05}s` }}>
              <h2 className="text-[16px] font-bold text-white mb-4">{cat}</h2>
              <div className="artist-grid">
                {artists.map((a, i) => (
                  <button key={a.name} onClick={() => loadArtist(a)}
                    className="flex flex-col items-center gap-2 group active:scale-[0.92] transition-all duration-300">
                    <div className={`relative w-full aspect-square rounded-full overflow-hidden shadow-lg transition-all duration-300 ${
                      activeArtist === a.name
                        ? 'ring-2 ring-fuchsia-400 shadow-xl shadow-fuchsia-500/20 scale-105'
                        : 'ring-1 ring-white/[0.06] group-hover:ring-fuchsia-400/30 group-hover:shadow-xl group-hover:shadow-fuchsia-500/10 group-hover:scale-105'
                    }`}>
                      <img src={a.img} alt={a.name} className="w-full h-full object-cover group-hover:scale-110 group-hover:brightness-75 transition-all duration-500" loading="lazy" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500 flex items-center justify-center shadow-2xl shadow-fuchsia-500/30 scale-50 group-hover:scale-100 transition-transform duration-400">
                          <Play size={14} className="text-white ml-0.5" fill="white" />
                        </div>
                      </div>
                    </div>
                    <p className={`text-[11px] font-medium text-center truncate w-full transition-colors duration-200 ${
                      activeArtist === a.name ? 'text-fuchsia-300' : 'text-white/50 group-hover:text-white/90'
                    }`}>{a.name}</p>
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
