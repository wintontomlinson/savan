import { useState, useRef, useEffect } from 'react';
import { Loader2, Play, X, Shuffle, ChevronRight } from 'lucide-react';
import { searchSongs, getPlaylistById } from '../data/api';
import { usePlayer } from '../context/PlayerContext';
import SongRow from '../components/SongRow';
import SongCard from '../components/SongCard';
import HorizontalScroll from '../components/HorizontalScroll';

const GENRES = [
  { id: 'trending', label: 'Trending', playlistId: '1219706044', searchQuery: 'latest hindi hits trending', gradient: 'from-fuchsia-600 via-pink-500 to-rose-400', icon: '🔥' },
  { id: 'dance', label: 'Dance', playlistId: '1219706999', searchQuery: 'bollywood dance party', gradient: 'from-amber-500 via-orange-400 to-yellow-400', icon: '💃' },
  { id: 'retro', label: '90s', playlistId: '1167751266', searchQuery: '90s bollywood classic', gradient: 'from-emerald-500 via-teal-400 to-cyan-300', icon: '📻' },
  { id: 'english', label: 'English', playlistId: '303128179', searchQuery: 'english pop trending', gradient: 'from-blue-500 via-indigo-400 to-violet-400', icon: '🌍' },
  { id: 'lofi', label: 'Lo-Fi', playlistId: '1079336813', searchQuery: 'lofi chill hindi', gradient: 'from-violet-600 via-purple-500 to-fuchsia-400', icon: '🎧' },
  { id: 'hiphop', label: 'Hip-Hop', playlistId: '1265128247', searchQuery: 'indian hip hop rap', gradient: 'from-indigo-600 via-blue-500 to-sky-400', icon: '🎤' },
  { id: 'sad', label: 'Sad', playlistId: '802336660', searchQuery: 'sad hindi heartbreak', gradient: 'from-slate-600 via-gray-500 to-zinc-400', icon: '💔' },
  { id: 'workout', label: 'Workout', playlistId: '156710699', searchQuery: 'workout gym hindi', gradient: 'from-red-600 via-orange-500 to-amber-400', icon: '💪' },
  { id: 'punjabi', label: 'Punjabi', playlistId: '4144832', searchQuery: 'punjabi hits latest', gradient: 'from-pink-600 via-fuchsia-500 to-purple-400', icon: '🎵' },
  { id: 'sufi', label: 'Sufi', playlistId: '1262711873', searchQuery: 'sufi qawwali', gradient: 'from-teal-600 via-emerald-400 to-green-300', icon: '🌀' },
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
  const [expandedSection, setExpandedSection] = useState(null);
  const { playSong } = usePlayer();
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

  useEffect(() => { GENRES.slice(0, 4).forEach(g => loadBrowse(g)); }, []);

  useEffect(() => {
    if (songs.length > 0 && songsRef.current) songsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [songs]);

  return (
    <div className="pb-6 pt-3">
      {/* Title */}
      <h1 className="text-[26px] font-bold text-white tracking-tight mb-4 animate-in">Explore</h1>

      {/* Genre Pills */}
      <section className="mb-5 animate-in" style={{ animationDelay: '0.03s' }}>
        <div className="flex gap-2 scroll-x pb-1">
          {GENRES.map(g => (
            <button key={g.id} onClick={() => playGenre(g)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full shrink-0 bg-gradient-to-r ${g.gradient} text-white text-[11px] font-bold shadow-md hover:shadow-lg hover:scale-[1.05] active:scale-[0.95] transition-all duration-300 border border-white/[0.15]`}>
              <span>{g.icon}</span>
              {g.label}
            </button>
          ))}
        </div>
      </section>

      {/* Artists by Category */}
      {['Punjabi', 'Bollywood', 'English', 'Hip-Hop', 'Legends'].map((cat, ci) => {
        const catArtists = ARTISTS.filter(a => a.cat === cat);
        return (
          <section key={cat} className="mb-7 animate-in" style={{ animationDelay: `${(ci + 1) * 0.04}s` }}>
            <h2 className="text-[15px] font-bold text-white mb-4">{cat}</h2>
            <div className="artist-grid">
              {catArtists.map(a => (
                <button key={a.name} onClick={() => loadArtist(a)}
                  className="flex flex-col items-center gap-2 group active:scale-[0.92] transition-all duration-300">
                  <div className={`relative w-full aspect-square rounded-full overflow-hidden transition-all duration-300 shadow-lg ${
                    activeArtist === a.name
                      ? 'ring-2 ring-rose-400 shadow-xl shadow-rose-500/20 scale-105'
                      : 'ring-1 ring-white/[0.06] group-hover:ring-white/[0.15] group-hover:shadow-xl group-hover:scale-105'
                  }`}>
                    <img src={a.img} alt={a.name} className="w-full h-full object-cover group-hover:scale-110 group-hover:brightness-75 transition-all duration-500" loading="lazy" />
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent transition-opacity duration-300 ${activeArtist === a.name ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                    <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${activeArtist === a.name ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${
                        activeArtist === a.name ? 'bg-rose-500 scale-100' : 'bg-white/90 scale-75 group-hover:scale-100'
                      }`}>
                        <Play size={14} className={activeArtist === a.name ? 'text-white ml-0.5' : 'text-black ml-0.5'} fill={activeArtist === a.name ? 'white' : 'black'} />
                      </div>
                    </div>
                  </div>
                  <p className={`text-[11px] font-medium text-center truncate w-full transition-colors duration-200 ${
                    activeArtist === a.name ? 'text-rose-400' : 'text-white/60 group-hover:text-white'
                  }`}>{a.name}</p>
                </button>
              ))}
            </div>
          </section>
        );
      })}

      {/* Artist Songs Panel */}
      {activeArtist && (
        <div ref={songsRef} className="mb-6 animate-scale">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 size={18} className="text-white/25 animate-spin" /></div>
          ) : songs.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <img src={ARTISTS.find(a => a.name === activeArtist)?.img} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-fuchsia-400/40" />
                  <div>
                    <h3 className="text-[14px] font-bold text-white">{activeArtist}</h3>
                    <p className="text-[10px] text-white/25">{songs.length} songs</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => playSong(songs[0], songs)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white rounded-full text-[11px] font-bold shadow-md hover:scale-[1.03] active:scale-95 transition-all">
                    <Play size={11} fill="white" /> Play
                  </button>
                  <button onClick={() => { setActiveArtist(null); setSongs([]); scrollToTop(); }}
                    className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.1] active:scale-90">
                    <X size={12} className="text-white/40" />
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

      {/* Curated Playlists */}
      {GENRES.slice(0, 4).map(sec => {
        const data = browseData[sec.id];
        const isLoading = browseLoading[sec.id];
        const isExpanded = expandedSection === sec.id;
        if (!data && !isLoading) return null;
        return (
          <section key={sec.id} className="animate-in mb-2">
            {isLoading ? (
              <div className="flex justify-center py-3"><Loader2 size={14} className="text-white/15 animate-spin" /></div>
            ) : data && data.length > 0 && (
              <>
                {!isExpanded ? (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-[15px] sm:text-[17px] font-bold text-white">{sec.label}</h2>
                      <button onClick={() => setExpandedSection(sec.id)} className="flex items-center gap-0.5 text-[12px] text-white/35 hover:text-white/60 transition-colors active:scale-95">
                        More <ChevronRight size={14} />
                      </button>
                    </div>
                    <div className="flex gap-3 sm:gap-4 scroll-x pb-1 stagger">
                      {data.slice(0, 8).map(s => <SongCard key={s.id} song={s} />)}
                    </div>
                  </div>
                ) : (
                  <div className="animate-in">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-[17px] font-bold text-white">{sec.label}</h2>
                      <div className="flex items-center gap-2">
                        <button onClick={() => { const shuffled = [...data].sort(() => Math.random() - 0.5); playSong(shuffled[0], shuffled); }}
                          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white rounded-full text-[11px] font-bold shadow-md hover:scale-[1.03] active:scale-95 transition-all">
                          <Play size={11} fill="white" /> Play All
                        </button>
                        <button onClick={() => setExpandedSection(null)} className="text-[12px] text-white/35 hover:text-white/60 transition-colors active:scale-95">
                          Close
                        </button>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/[0.04] overflow-hidden">
                      {data.map((s, i) => <SongRow key={s.id} song={s} index={i} songList={data} />)}
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        );
      })}
    </div>
  );
}
