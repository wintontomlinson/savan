import { useState, useRef, useEffect } from 'react';
import { Loader2, Play, X, Shuffle, ChevronRight, Disc3, TrendingUp, ListMusic, Mic, Users, Radio } from 'lucide-react';
import { searchSongs, getPlaylistById } from '../data/api';
import { usePlayer } from '../context/PlayerContext';
import SongRow from '../components/SongRow';
import SongCard from '../components/SongCard';
import HorizontalScroll from '../components/HorizontalScroll';

// Browse sections — all using real JioSaavn playlist IDs
const BROWSE_SECTIONS = [
  { id: 'new', label: 'New Releases', icon: Disc3, playlistId: '1300709425', color: 'from-rose-500/20 to-pink-600/10', iconColor: 'text-rose-400' },
  { id: 'charts', label: 'Top Charts', icon: TrendingUp, playlistId: '110858205', color: 'from-amber-500/20 to-orange-600/10', iconColor: 'text-amber-400' },
  { id: 'playlists', label: 'Romantic', icon: ListMusic, playlistId: '1302033575', color: 'from-emerald-500/20 to-green-600/10', iconColor: 'text-emerald-400' },
  { id: 'dance', label: 'Dance', icon: Mic, playlistId: '932189657', color: 'from-purple-500/20 to-violet-600/10', iconColor: 'text-purple-400' },
  { id: 'chill', label: 'Chill', icon: Users, playlistId: '1079336813', color: 'from-blue-500/20 to-cyan-600/10', iconColor: 'text-blue-400' },
  { id: 'punjabi', label: 'Punjabi Hits', icon: Radio, playlistId: '4144832', color: 'from-indigo-500/20 to-purple-600/10', iconColor: 'text-indigo-400' },
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
  { name: 'Ammy Virk', img: 'https://c.saavncdn.com/artists/Ammy_Virk_005_20241101070506_500x500.jpg', cat: 'Punjabi' },
  { name: 'Bohemia', img: 'https://c.saavncdn.com/artists/Bohemia_500x500.jpg', cat: 'Punjabi' },
  { name: 'Garry Sandhu', img: 'https://c.saavncdn.com/artists/Garry_Sandhu_500x500.jpg', cat: 'Punjabi' },
  { name: 'Jasmine Sandlas', img: 'https://c.saavncdn.com/artists/Jasmine_Sandlas_002_20240314115630_500x500.jpg', cat: 'Punjabi' },
  { name: 'Mankirt Aulakh', img: 'https://c.saavncdn.com/artists/Mankirt_Aulakh_500x500.jpg', cat: 'Punjabi' },
  { name: 'Arijit Singh', img: 'https://c.saavncdn.com/artists/Arijit_Singh_004_20241118063717_500x500.jpg', cat: 'Bollywood' },
  { name: 'Shreya Ghoshal', img: 'https://c.saavncdn.com/artists/Shreya_Ghoshal_007_20241101074144_500x500.jpg', cat: 'Bollywood' },
  { name: 'Jubin Nautiyal', img: 'https://c.saavncdn.com/artists/Jubin_Nautiyal_003_20231130204020_500x500.jpg', cat: 'Bollywood' },
  { name: 'Vishal Mishra', img: 'https://c.saavncdn.com/artists/Vishal_Mishra_005_20251120085316_500x500.jpg', cat: 'Bollywood' },
  { name: 'Neha Kakkar', img: 'https://c.saavncdn.com/artists/Neha_Kakkar_007_20241212115832_500x500.jpg', cat: 'Bollywood' },
  { name: 'Atif Aslam', img: 'https://c.saavncdn.com/artists/Atif_Aslam_500x500.jpg', cat: 'Bollywood' },
  { name: 'Darshan Raval', img: 'https://c.saavncdn.com/artists/Darshan_Raval_006_20250807060352_500x500.jpg', cat: 'Bollywood' },
  { name: 'A.R. Rahman', img: 'https://c.saavncdn.com/artists/AR_Rahman_002_20210120084455_500x500.jpg', cat: 'Bollywood' },
  { name: 'Pritam', img: 'https://c.saavncdn.com/artists/Pritam_Chakraborty-20170711073326_500x500.jpg', cat: 'Bollywood' },
  { name: 'Armaan Malik', img: 'https://c.saavncdn.com/artists/Armaan_Malik_006_20260813132832_500x500.jpg', cat: 'Bollywood' },
  { name: 'Sonu Nigam', img: 'https://c.saavncdn.com/artists/Sonu_Nigam_500x500.jpg', cat: 'Bollywood' },
  { name: 'Sunidhi Chauhan', img: 'https://c.saavncdn.com/artists/Sunidhi_Chauhan_500x500.jpg', cat: 'Bollywood' },
  { name: 'The Weeknd', img: 'https://c.saavncdn.com/artists/The_Weeknd_002_20241003071400_500x500.jpg', cat: 'English' },
  { name: 'Drake', img: 'https://c.saavncdn.com/artists/Drake_006_20260520062317_500x500.jpg', cat: 'English' },
  { name: 'Taylor Swift', img: 'https://c.saavncdn.com/artists/Taylor_Swift_003_20200226074119_500x500.jpg', cat: 'English' },
  { name: 'Ed Sheeran', img: 'https://c.saavncdn.com/artists/Ed_Sheeran_002_20250625073038_500x500.jpg', cat: 'English' },
  { name: 'Dua Lipa', img: 'https://c.saavncdn.com/artists/Dua_Lipa_004_20231120090922_500x500.jpg', cat: 'English' },
  { name: 'Justin Bieber', img: 'https://c.saavncdn.com/artists/Justin_Bieber_005_20201127112218_500x500.jpg', cat: 'English' },
  { name: 'Eminem', img: 'https://c.saavncdn.com/artists/Eminem_003_20240403152835_500x500.jpg', cat: 'English' },
  { name: 'Billie Eilish', img: 'https://c.saavncdn.com/artists/Billie_Eilish_20190211151539_500x500.jpg', cat: 'English' },
  { name: 'Bruno Mars', img: 'https://c.saavncdn.com/artists/Bruno_Mars_500x500.jpg', cat: 'English' },
  { name: 'Selena Gomez', img: 'https://c.saavncdn.com/artists/Selena_Gomez_003_20231023065157_500x500.jpg', cat: 'English' },
  { name: 'Charlie Puth', img: 'https://c.saavncdn.com/artists/Charlie_Puth_003_20231023065325_500x500.jpg', cat: 'English' },
  { name: 'Post Malone', img: 'https://c.saavncdn.com/artists/Post_Malone_004_20190911070147_500x500.jpg', cat: 'English' },
  { name: 'Imagine Dragons', img: 'https://c.saavncdn.com/artists/Imagine_Dragons_500x500.jpg', cat: 'English' },
  { name: 'Marshmello', img: 'https://c.saavncdn.com/artists/Marshmello_500x500.jpg', cat: 'English' },
  { name: 'Badshah', img: 'https://c.saavncdn.com/artists/Badshah_006_20241118064015_500x500.jpg', cat: 'Hip-Hop' },
  { name: 'Honey Singh', img: 'https://c.saavncdn.com/artists/Yo_Yo_Honey_Singh_004_20260811095253_500x500.jpg', cat: 'Hip-Hop' },
  { name: 'Divine', img: 'https://c.saavncdn.com/artists/DIVINE_006_20250911071442_500x500.jpg', cat: 'Hip-Hop' },
  { name: 'Raftaar', img: 'https://c.saavncdn.com/artists/Raftaar_009_20230223100912_500x500.jpg', cat: 'Hip-Hop' },
  { name: 'Kishore Kumar', img: 'https://c.saavncdn.com/artists/Kishore_Kumar_500x500.jpg', cat: 'Legends' },
  { name: 'Lata Mangeshkar', img: 'https://c.saavncdn.com/artists/Lata_Mangeshkar_004_20230623105323_500x500.jpg', cat: 'Legends' },
  { name: 'Mohammed Rafi', img: 'https://c.saavncdn.com/artists/Mohammed_Rafi_500x500.jpg', cat: 'Legends' },
  { name: 'Mukesh', img: 'https://c.saavncdn.com/artists/Mukesh_500x500.jpg', cat: 'Legends' },
];

const CATEGORIES = ['Punjabi', 'Bollywood', 'English', 'Hip-Hop', 'Legends'];

export default function Explore() {
  const [activeArtist, setActiveArtist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpandedCats] = useState({});
  const [browseData, setBrowseData] = useState({});
  const [browseLoading, setBrowseLoading] = useState({});
  const { playSong } = usePlayer();
  const songsRef = useRef(null);

  const loadArtist = async (artist) => {
    if (activeArtist === artist.name) { setActiveArtist(null); setSongs([]); return; }
    setActiveArtist(artist.name);
    setLoading(true);
    const s = await searchSongs(artist.name, 20) || [];
    setSongs(s);
    setLoading(false);
  };

  const loadBrowse = async (section) => {
    if (browseData[section.id]) return; // already loaded, do nothing
    setBrowseLoading(p => ({ ...p, [section.id]: true }));
    let results = [];
    if (section.playlistId) {
      results = await getPlaylistById(section.playlistId) || [];
    } else {
      results = await searchSongs(section.query, 15) || [];
    }
    setBrowseData(p => ({ ...p, [section.id]: results }));
    setBrowseLoading(p => ({ ...p, [section.id]: false }));
  };

  // Load all browse sections on mount
  useEffect(() => {
    BROWSE_SECTIONS.forEach(sec => loadBrowse(sec));
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

  const toggleExpand = (cat) => {
    setExpandedCats(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  return (
    <div className="pb-6 pt-2">
      {/* Page Title */}
      <div className="mb-5">
        <h1 className="text-[22px] sm:text-[26px] font-bold text-white">Explore</h1>
        <p className="text-[13px] text-white/40 mt-1">Discover music you love</p>
      </div>

      {/* Browse Categories Grid */}
      <section className="mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {BROWSE_SECTIONS.map(sec => (
            <button key={sec.id} onClick={() => loadBrowse(sec)}
              className={`relative overflow-hidden rounded-2xl p-4 text-left transition-all duration-200 active:scale-[0.97] border border-white/[0.04] hover:border-white/[0.08] bg-gradient-to-br ${sec.color}`}>
              <sec.icon size={20} className={`${sec.iconColor} mb-2`} />
              <p className="text-[13px] font-semibold text-white">{sec.label}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Browse Section Results — horizontal scroll cards */}
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

      {/* Songs Panel — shows when artist selected */}
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
                  <img src={ARTISTS.find(a => a.name === activeArtist)?.img} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10 shrink-0" />
                  <div className="min-w-0">
                    <h2 className="text-[17px] font-bold text-white truncate">{activeArtist}</h2>
                    <p className="text-[11px] text-white/40">{songs.length} songs</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => shufflePlay(songs)} className="w-9 h-9 rounded-full bg-white/[0.08] flex items-center justify-center btn-press hover:bg-white/[0.12] transition-colors">
                    <Shuffle size={14} className="text-white" />
                  </button>
                  <button onClick={() => playSong(songs[0], songs)} className="flex items-center gap-1.5 px-4 py-2.5 bg-white rounded-full text-[12px] text-black font-bold btn-press shadow-md hover:shadow-lg transition-shadow">
                    <Play size={12} fill="black" /> Play All
                  </button>
                  <button onClick={() => { setActiveArtist(null); setSongs([]); }} className="w-9 h-9 rounded-full bg-white/[0.08] flex items-center justify-center btn-press hover:bg-white/[0.12] transition-colors">
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

      {/* Top Artists by Category */}
      <div className="space-y-8">
        {CATEGORIES.map(cat => {
          const artists = ARTISTS.filter(a => a.cat === cat);
          const isExpanded = expanded[cat];
          const visible = isExpanded ? artists : artists.slice(0, 8);

          return (
            <section key={cat} className="animate-in">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[16px] sm:text-[18px] font-bold text-white">{cat}</h2>
                {artists.length > 8 && (
                  <button onClick={() => toggleExpand(cat)} className="flex items-center gap-1 text-[12px] text-white/40 hover:text-white/70 transition-colors duration-200 btn-press">
                    <span>{isExpanded ? 'Show less' : 'See all'}</span>
                    <ChevronRight size={14} className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                  </button>
                )}
              </div>
              <div className="artist-grid">
                {visible.map(a => (
                  <ArtistCard key={a.name} artist={a} isActive={activeArtist === a.name} onClick={() => loadArtist(a)} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function ArtistCard({ artist, isActive, onClick }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 group transition-all duration-300 active:scale-[0.93]">
      <div className="relative w-full aspect-square">
        {/* Outer glow for active */}
        {isActive && <div className="absolute -inset-1 rounded-full bg-gradient-to-b from-rose-500/30 to-rose-600/10 blur-md" />}
        
        {/* Image container */}
        <div className={`relative w-full h-full rounded-full overflow-hidden transition-all duration-300 ${
          isActive
            ? 'ring-2 ring-rose-400 shadow-xl shadow-rose-500/25'
            : 'ring-1 ring-white/[0.08] shadow-lg shadow-black/40 group-hover:ring-white/[0.15] group-hover:shadow-xl group-hover:shadow-black/60'
        }`}>
          <img src={artist.img} alt={artist.name}
            className={`w-full h-full object-cover transition-all duration-300 ${
              isActive ? 'scale-110 brightness-90' : 'group-hover:scale-110 group-hover:brightness-75'
            }`} loading="lazy" />
          
          {/* Gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
            isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`} />
          
          {/* Play button */}
          <div className={`absolute inset-0 flex items-center justify-center transition-all duration-250 ${
            isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}>
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-xl transition-all duration-250 ${
              isActive 
                ? 'bg-rose-500 scale-100 shadow-rose-500/30' 
                : 'bg-white/90 scale-75 group-hover:scale-100 shadow-black/30'
            }`}>
              <Play size={14} className={isActive ? 'text-white ml-0.5' : 'text-black ml-0.5'} fill={isActive ? 'white' : 'black'} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Name */}
      <p className={`text-[11px] sm:text-[12px] font-semibold text-center leading-tight truncate w-full px-0.5 transition-colors duration-200 ${
        isActive ? 'text-rose-400' : 'text-white/70 group-hover:text-white'
      }`}>{artist.name}</p>
    </button>
  );
}
