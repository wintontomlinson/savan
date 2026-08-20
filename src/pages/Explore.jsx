import { useState, useRef, useEffect } from 'react';
import { Loader2, Play, X, Shuffle, ChevronRight, Disc3, TrendingUp, ListMusic, Mic, Users, Radio } from 'lucide-react';
import { searchSongs, getPlaylistById } from '../data/api';
import { usePlayer } from '../context/PlayerContext';
import SongRow from '../components/SongRow';
import SongCard from '../components/SongCard';
import HorizontalScroll from '../components/HorizontalScroll';

const BROWSE_SECTIONS = [
  { id: 'trending', label: 'Trending Now', icon: TrendingUp, playlistId: '1219706044', searchQuery: 'latest hindi hits 2024 trending', color: 'from-rose-500/20 to-pink-600/5' },
  { id: 'dance', label: 'Dance Hits', icon: Disc3, playlistId: '1219706999', searchQuery: 'bollywood dance party songs', color: 'from-amber-500/20 to-orange-600/5' },
  { id: 'retro', label: '90s Bollywood', icon: Radio, playlistId: '1167751266', searchQuery: '90s bollywood songs classic hindi', color: 'from-emerald-500/20 to-green-600/5' },
  { id: 'english', label: 'English Pop', icon: Users, playlistId: '303128179', searchQuery: 'english pop songs trending 2024', color: 'from-blue-500/20 to-cyan-600/5' },
  { id: 'lofi', label: 'Lo-Fi Chill', icon: ListMusic, playlistId: '1079336813', searchQuery: 'lofi hindi chill relax', color: 'from-purple-500/20 to-violet-600/5' },
  { id: 'hiphop', label: 'Hip-Hop', icon: Mic, playlistId: '1265128247', searchQuery: 'indian hip hop rap songs', color: 'from-indigo-500/20 to-purple-600/5' },
  { id: 'sad', label: 'Sad Songs', icon: ListMusic, playlistId: '802336660', searchQuery: 'sad hindi songs heartbreak', color: 'from-sky-500/20 to-blue-600/5' },
  { id: 'workout', label: 'Workout', icon: TrendingUp, playlistId: '156710699', searchQuery: 'workout gym motivation hindi songs', color: 'from-orange-500/20 to-red-600/5' },
  { id: 'sufi', label: 'Sufi', icon: Radio, playlistId: '1262711873', searchQuery: 'sufi songs qawwali hindi', color: 'from-teal-500/20 to-emerald-600/5' },
  { id: 'punjabi', label: 'Punjabi Hits', icon: Disc3, playlistId: '4144832', searchQuery: 'punjabi songs latest hits', color: 'from-pink-500/20 to-rose-600/5' },
];

const ARTISTS = [
  { name: 'AP Dhillon', img: 'https://c.saavncdn.com/artists/AP_Dhillon_004_20251023102150_500x500.jpg', cat: 'Punjabi' },
  { name: 'Diljit Dosanjh', img: 'https://c.saavncdn.com/artists/Diljit_Dosanjh_005_20231025073054_500x500.jpg', cat: 'Punjabi' },
  { name: 'Sidhu Moosewala', img: 'https://c.saavncdn.com/artists/Sidhu_Moose_Wala_004_20250617183705_500x500.jpg', cat: 'Punjabi' },
  { name: 'Karan Aujla', img: 'https://c.saavncdn.com/artists/Karan_Aujla_004_20260810121947_500x500.jpg', cat: 'Punjabi' },
  { name: 'Shubh', img: 'https://c.saavncdn.com/artists/Shubh_000_20220921112507_500x500.jpg', cat: 'Punjabi' },
  { name: 'Guru Randhawa', img: 'https://c.saavncdn.com/artists/Guru_Randhawa_004_20250701125845_500x500.jpg', cat: 'Punjabi' },
  { name: 'Harrdy Sandhu', img: 'https://c.saavncdn.com/artists/Hardy_Sandhu_001_20190913112018_500x500.jpg', cat: 'Punjabi' },
  { name: 'B Praak', img: 'https://c.saavncdn.com/artists/B_Praak_001_20191118112005_500x500.jpg', cat: 'Punjabi' },
  { name: 'Arijit Singh', img: 'https://c.saavncdn.com/artists/Arijit_Singh_004_20241118063717_500x500.jpg', cat: 'Bollywood' },
  { name: 'Shreya Ghoshal', img: 'https://c.saavncdn.com/artists/Shreya_Ghoshal_007_20241101074144_500x500.jpg', cat: 'Bollywood' },
  { name: 'Jubin Nautiyal', img: 'https://c.saavncdn.com/artists/Jubin_Nautiyal_003_20231130204020_500x500.jpg', cat: 'Bollywood' },
  { name: 'Vishal Mishra', img: 'https://c.saavncdn.com/artists/Vishal_Mishra_005_20251120085316_500x500.jpg', cat: 'Bollywood' },
  { name: 'Neha Kakkar', img: 'https://c.saavncdn.com/artists/Neha_Kakkar_007_20241212115832_500x500.jpg', cat: 'Bollywood' },
  { name: 'Atif Aslam', img: 'https://c.saavncdn.com/artists/Atif_Aslam_500x500.jpg', cat: 'Bollywood' },
  { name: 'A.R. Rahman', img: 'https://c.saavncdn.com/artists/AR_Rahman_002_20210120084455_500x500.jpg', cat: 'Bollywood' },
  { name: 'Pritam', img: 'https://c.saavncdn.com/artists/Pritam_Chakraborty-20170711073326_500x500.jpg', cat: 'Bollywood' },
  { name: 'The Weeknd', img: 'https://c.saavncdn.com/artists/The_Weeknd_002_20241003071400_500x500.jpg', cat: 'English' },
  { name: 'Drake', img: 'https://c.saavncdn.com/artists/Drake_006_20260520062317_500x500.jpg', cat: 'English' },
  { name: 'Taylor Swift', img: 'https://c.saavncdn.com/artists/Taylor_Swift_003_20200226074119_500x500.jpg', cat: 'English' },
  { name: 'Ed Sheeran', img: 'https://c.saavncdn.com/artists/Ed_Sheeran_002_20250625073038_500x500.jpg', cat: 'English' },
  { name: 'Dua Lipa', img: 'https://c.saavncdn.com/artists/Dua_Lipa_004_20231120090922_500x500.jpg', cat: 'English' },
  { name: 'Eminem', img: 'https://c.saavncdn.com/artists/Eminem_003_20240403152835_500x500.jpg', cat: 'English' },
  { name: 'Billie Eilish', img: 'https://c.saavncdn.com/artists/Billie_Eilish_20190211151539_500x500.jpg', cat: 'English' },
  { name: 'Bruno Mars', img: 'https://c.saavncdn.com/artists/Bruno_Mars_500x500.jpg', cat: 'English' },
  { name: 'Badshah', img: 'https://c.saavncdn.com/artists/Badshah_006_20241118064015_500x500.jpg', cat: 'Hip-Hop' },
  { name: 'Honey Singh', img: 'https://c.saavncdn.com/artists/Yo_Yo_Honey_Singh_004_20260811095253_500x500.jpg', cat: 'Hip-Hop' },
  { name: 'Divine', img: 'https://c.saavncdn.com/artists/DIVINE_006_20250911071442_500x500.jpg', cat: 'Hip-Hop' },
  { name: 'Raftaar', img: 'https://c.saavncdn.com/artists/Raftaar_009_20230223100912_500x500.jpg', cat: 'Hip-Hop' },
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

  const loadBrowse = async (section, shouldPlay = false) => {
    if (shouldPlay) {
      const fresh = await searchSongs(section.searchQuery, 30) || [];
      if (fresh.length > 0) {
        const shuffled = [...fresh].sort(() => Math.random() - 0.5);
        playSong(shuffled[0], shuffled);
      }
      return;
    }
    if (browseData[section.id]) return;
    setBrowseLoading(p => ({ ...p, [section.id]: true }));
    const results = await getPlaylistById(section.playlistId) || [];
    setBrowseData(p => ({ ...p, [section.id]: results }));
    setBrowseLoading(p => ({ ...p, [section.id]: false }));
  };

  useEffect(() => { BROWSE_SECTIONS.forEach(sec => loadBrowse(sec, false)); }, []);

  useEffect(() => {
    if (songs.length > 0 && songsRef.current) songsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [songs]);

  return (
    <div className="pb-6 pt-3">
      {/* Title */}
      <div className="mb-6">
        <h1 className="text-[26px] font-bold text-white tracking-tight">Explore</h1>
        <p className="text-[12px] text-white/35 mt-0.5">Discover new music</p>
      </div>

      {/* Genre Grid */}
      <section className="mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {BROWSE_SECTIONS.map(sec => (
            <button key={sec.id} onClick={() => loadBrowse(sec, true)}
              className={`relative rounded-2xl p-4 text-left transition-all duration-200 active:scale-[0.97] border border-white/[0.04] hover:border-white/[0.08] bg-gradient-to-br ${sec.color}`}>
              <sec.icon size={18} className="text-white/50 mb-2" />
              <p className="text-[12px] font-semibold text-white">{sec.label}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Curated Playlists */}
      {BROWSE_SECTIONS.map(sec => {
        const data = browseData[sec.id];
        const isLoading = browseLoading[sec.id];
        if (!data && !isLoading) return null;
        return (
          <section key={sec.id} className="mb-6">
            {isLoading ? (
              <div className="flex justify-center py-6"><Loader2 size={16} className="text-white/20 animate-spin" /></div>
            ) : data && data.length > 0 && (
              <HorizontalScroll title={sec.label}>{data.map(s => <SongCard key={s.id} song={s} />)}</HorizontalScroll>
            )}
          </section>
        );
      })}

      {/* Artist Songs */}
      {activeArtist && (
        <div ref={songsRef} className="mb-8 animate-in">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 size={20} className="text-white/30 animate-spin" /></div>
          ) : songs.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img src={ARTISTS.find(a => a.name === activeArtist)?.img} alt="" className="w-12 h-12 rounded-full object-cover ring-1 ring-white/10 shadow-lg" />
                  <div>
                    <h2 className="text-[17px] font-bold text-white">{activeArtist}</h2>
                    <p className="text-[11px] text-white/30">{songs.length} songs</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => playSong(songs[0], songs)} className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full text-[12px] font-bold shadow-md active:scale-95 transition-all">
                    <Play size={12} fill="black" /> Play
                  </button>
                  <button onClick={() => { setActiveArtist(null); setSongs([]); }} className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.1] active:scale-90">
                    <X size={14} className="text-white/50" />
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

      {/* Artists */}
      <div className="space-y-8">
        {CATEGORIES.map(cat => {
          const artists = ARTISTS.filter(a => a.cat === cat);
          return (
            <section key={cat}>
              <h2 className="text-[16px] font-bold text-white mb-4">{cat}</h2>
              <div className="artist-grid">
                {artists.map(a => (
                  <button key={a.name} onClick={() => loadArtist(a)} className="flex flex-col items-center gap-2 group active:scale-[0.93] transition-all">
                    <div className={`relative w-full aspect-square rounded-full overflow-hidden transition-all duration-300 ${
                      activeArtist === a.name ? 'ring-2 ring-white shadow-xl' : 'ring-1 ring-white/[0.06] group-hover:ring-white/[0.12]'
                    }`}>
                      <img src={a.img} alt={a.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" loading="lazy" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                        <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all shadow-lg">
                          <Play size={13} className="text-black ml-0.5" fill="black" />
                        </div>
                      </div>
                    </div>
                    <p className={`text-[11px] font-medium text-center truncate w-full ${activeArtist === a.name ? 'text-white' : 'text-white/50 group-hover:text-white/80'} transition-colors`}>{a.name}</p>
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
