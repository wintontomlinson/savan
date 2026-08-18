import { useState } from 'react';
import { Loader2, Play, ChevronRight } from 'lucide-react';
import { searchSongs } from '../data/api';
import { usePlayer } from '../context/PlayerContext';
import SongRow from '../components/SongRow';
import SongCard from '../components/SongCard';

const ARTISTS = [
  // Punjabi
  { name: 'AP Dhillon', img: 'https://c.saavncdn.com/artists/AP_Dhillon_004_20251023102150_500x500.jpg', cat: 'Punjabi' },
  { name: 'Ammy Virk', img: 'https://c.saavncdn.com/artists/Ammy_Virk_005_20241101070506_500x500.jpg', cat: 'Punjabi' },
  { name: 'B Praak', img: 'https://c.saavncdn.com/artists/B_Praak_001_20191118112005_500x500.jpg', cat: 'Punjabi' },
  { name: 'Bohemia', img: 'https://c.saavncdn.com/artists/Bohemia_500x500.jpg', cat: 'Punjabi' },
  { name: 'Diljit Dosanjh', img: 'https://c.saavncdn.com/artists/Diljit_Dosanjh_005_20231025073054_500x500.jpg', cat: 'Punjabi' },
  { name: 'Garry Sandhu', img: 'https://c.saavncdn.com/artists/Garry_Sandhu_500x500.jpg', cat: 'Punjabi' },
  { name: 'Guru Randhawa', img: 'https://c.saavncdn.com/artists/Guru_Randhawa_004_20250701125845_500x500.jpg', cat: 'Punjabi' },
  { name: 'Harrdy Sandhu', img: 'https://c.saavncdn.com/artists/Hardy_Sandhu_001_20190913112018_500x500.jpg', cat: 'Punjabi' },
  { name: 'Jasmine Sandlas', img: 'https://c.saavncdn.com/artists/Jasmine_Sandlas_002_20240314115630_500x500.jpg', cat: 'Punjabi' },
  { name: 'Karan Aujla', img: 'https://c.saavncdn.com/artists/Karan_Aujla_004_20260810121947_500x500.jpg', cat: 'Punjabi' },
  { name: 'Mankirt Aulakh', img: 'https://c.saavncdn.com/artists/Mankirt_Aulakh_500x500.jpg', cat: 'Punjabi' },
  { name: 'Shubh', img: 'https://c.saavncdn.com/artists/Shubh_000_20220921112507_500x500.jpg', cat: 'Punjabi' },
  { name: 'Sidhu Moosewala', img: 'https://c.saavncdn.com/artists/Sidhu_Moose_Wala_004_20250617183705_500x500.jpg', cat: 'Punjabi' },
  // Bollywood
  { name: 'A.R. Rahman', img: 'https://c.saavncdn.com/artists/AR_Rahman_002_20210120084455_500x500.jpg', cat: 'Bollywood' },
  { name: 'Arijit Singh', img: 'https://c.saavncdn.com/artists/Arijit_Singh_004_20241118063717_500x500.jpg', cat: 'Bollywood' },
  { name: 'Armaan Malik', img: 'https://c.saavncdn.com/artists/Armaan_Malik_006_20260813132832_500x500.jpg', cat: 'Bollywood' },
  { name: 'Atif Aslam', img: 'https://c.saavncdn.com/artists/Atif_Aslam_500x500.jpg', cat: 'Bollywood' },
  { name: 'Darshan Raval', img: 'https://c.saavncdn.com/artists/Darshan_Raval_006_20250807060352_500x500.jpg', cat: 'Bollywood' },
  { name: 'Jubin Nautiyal', img: 'https://c.saavncdn.com/artists/Jubin_Nautiyal_003_20231130204020_500x500.jpg', cat: 'Bollywood' },
  { name: 'Neha Kakkar', img: 'https://c.saavncdn.com/artists/Neha_Kakkar_007_20241212115832_500x500.jpg', cat: 'Bollywood' },
  { name: 'Pritam', img: 'https://c.saavncdn.com/artists/Pritam_Chakraborty-20170711073326_500x500.jpg', cat: 'Bollywood' },
  { name: 'Shreya Ghoshal', img: 'https://c.saavncdn.com/artists/Shreya_Ghoshal_007_20241101074144_500x500.jpg', cat: 'Bollywood' },
  { name: 'Sonu Nigam', img: 'https://c.saavncdn.com/artists/Sonu_Nigam_500x500.jpg', cat: 'Bollywood' },
  { name: 'Sunidhi Chauhan', img: 'https://c.saavncdn.com/artists/Sunidhi_Chauhan_500x500.jpg', cat: 'Bollywood' },
  { name: 'Vishal Mishra', img: 'https://c.saavncdn.com/artists/Vishal_Mishra_005_20251120085316_500x500.jpg', cat: 'Bollywood' },
  // English
  { name: 'Billie Eilish', img: 'https://c.saavncdn.com/artists/Billie_Eilish_20190211151539_500x500.jpg', cat: 'English' },
  { name: 'Bruno Mars', img: 'https://c.saavncdn.com/artists/Bruno_Mars_500x500.jpg', cat: 'English' },
  { name: 'Charlie Puth', img: 'https://c.saavncdn.com/artists/Charlie_Puth_003_20231023065325_500x500.jpg', cat: 'English' },
  { name: 'Drake', img: 'https://c.saavncdn.com/artists/Drake_006_20260520062317_500x500.jpg', cat: 'English' },
  { name: 'Dua Lipa', img: 'https://c.saavncdn.com/artists/Dua_Lipa_004_20231120090922_500x500.jpg', cat: 'English' },
  { name: 'Ed Sheeran', img: 'https://c.saavncdn.com/artists/Ed_Sheeran_002_20250625073038_500x500.jpg', cat: 'English' },
  { name: 'Eminem', img: 'https://c.saavncdn.com/artists/Eminem_003_20240403152835_500x500.jpg', cat: 'English' },
  { name: 'Imagine Dragons', img: 'https://c.saavncdn.com/artists/Imagine_Dragons_500x500.jpg', cat: 'English' },
  { name: 'Justin Bieber', img: 'https://c.saavncdn.com/artists/Justin_Bieber_005_20201127112218_500x500.jpg', cat: 'English' },
  { name: 'Marshmello', img: 'https://c.saavncdn.com/artists/Marshmello_500x500.jpg', cat: 'English' },
  { name: 'Post Malone', img: 'https://c.saavncdn.com/artists/Post_Malone_004_20190911070147_500x500.jpg', cat: 'English' },
  { name: 'Selena Gomez', img: 'https://c.saavncdn.com/artists/Selena_Gomez_003_20231023065157_500x500.jpg', cat: 'English' },
  { name: 'Taylor Swift', img: 'https://c.saavncdn.com/artists/Taylor_Swift_003_20200226074119_500x500.jpg', cat: 'English' },
  { name: 'The Weeknd', img: 'https://c.saavncdn.com/artists/The_Weeknd_002_20241003071400_500x500.jpg', cat: 'English' },
  // Hip-Hop
  { name: 'Badshah', img: 'https://c.saavncdn.com/artists/Badshah_006_20241118064015_500x500.jpg', cat: 'Hip-Hop' },
  { name: 'Divine', img: 'https://c.saavncdn.com/artists/DIVINE_006_20250911071442_500x500.jpg', cat: 'Hip-Hop' },
  { name: 'Honey Singh', img: 'https://c.saavncdn.com/artists/Yo_Yo_Honey_Singh_004_20260811095253_500x500.jpg', cat: 'Hip-Hop' },
  { name: 'Raftaar', img: 'https://c.saavncdn.com/artists/Raftaar_009_20230223100912_500x500.jpg', cat: 'Hip-Hop' },
  // Legends
  { name: 'Kishore Kumar', img: 'https://c.saavncdn.com/artists/Kishore_Kumar_500x500.jpg', cat: 'Legends' },
  { name: 'Lata Mangeshkar', img: 'https://c.saavncdn.com/artists/Lata_Mangeshkar_004_20230623105323_500x500.jpg', cat: 'Legends' },
  { name: 'Mohammed Rafi', img: 'https://c.saavncdn.com/artists/Mohammed_Rafi_500x500.jpg', cat: 'Legends' },
  { name: 'Mukesh', img: 'https://c.saavncdn.com/artists/Mukesh_500x500.jpg', cat: 'Legends' },
];

const CATEGORIES = ['All', 'Punjabi', 'Bollywood', 'English', 'Hip-Hop', 'Legends'];

const QUICK_MIXES = [
  { title: 'Trending India', query: 'trending hindi 2024 latest', color: 'from-rose-600 to-pink-700' },
  { title: 'Punjabi Fire', query: 'punjabi hits 2024 new', color: 'from-amber-500 to-orange-600' },
  { title: 'Chill Vibes', query: 'lofi chill hindi relax', color: 'from-cyan-500 to-blue-600' },
  { title: 'Party Mix', query: 'party dance bollywood 2024', color: 'from-violet-500 to-purple-700' },
  { title: 'Romantic', query: 'romantic hindi love songs', color: 'from-pink-500 to-rose-600' },
  { title: 'English Hits', query: 'english pop hits 2024', color: 'from-emerald-500 to-teal-600' },
];

export default function Explore() {
  const [category, setCategory] = useState('All');
  const [activeArtist, setActiveArtist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mixSongs, setMixSongs] = useState([]);
  const [activeMix, setActiveMix] = useState(null);
  const [mixLoading, setMixLoading] = useState(false);
  const { playSong } = usePlayer();

  const filtered = category === 'All' ? ARTISTS : ARTISTS.filter(a => a.cat === category);

  const loadArtist = async (artist) => {
    if (activeArtist === artist.name) { setActiveArtist(null); setSongs([]); return; }
    setActiveArtist(artist.name);
    setActiveMix(null);
    setLoading(true);
    const s = await searchSongs(artist.name, 15) || [];
    setSongs(s);
    setLoading(false);
  };

  const loadMix = async (mix) => {
    if (activeMix === mix.title) { setActiveMix(null); setMixSongs([]); return; }
    setActiveMix(mix.title);
    setActiveArtist(null);
    setMixLoading(true);
    const s = await searchSongs(mix.query, 12) || [];
    setMixSongs(s);
    setMixLoading(false);
  };

  return (
    <div className="pb-6 pt-2">
      {/* Quick Mixes */}
      <section className="mb-7 animate-in">
        <h2 className="text-[15px] font-bold text-white mb-3">Quick Mixes</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {QUICK_MIXES.map(mix => (
            <button key={mix.title} onClick={() => loadMix(mix)}
              className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 text-left btn-press transition-all ${activeMix === mix.title ? 'ring-2 ring-white/30' : ''}`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${mix.color} opacity-90`} />
              <span className="relative text-[13px] sm:text-[14px] font-bold text-white drop-shadow-sm">{mix.title}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Mix Results */}
      {mixLoading && <div className="flex justify-center py-8 mb-6"><Loader2 size={20} className="text-rose-500 animate-spin" /></div>}
      {!mixLoading && activeMix && mixSongs.length > 0 && (
        <section className="mb-7 animate-in">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-bold text-white">{activeMix}</h2>
            <button onClick={() => playSong(mixSongs[0], mixSongs)} className="flex items-center gap-1.5 px-3.5 py-2 bg-white rounded-full text-[11px] text-black font-semibold btn-press">
              <Play size={11} fill="black" /> Play
            </button>
          </div>
          <div className="flex gap-3 scroll-x pb-1 stagger">
            {mixSongs.map(s => <SongCard key={s.id} song={s} />)}
          </div>
        </section>
      )}

      {/* Category Tabs */}
      <section className="mb-5 animate-in" style={{ animationDelay: '0.05s' }}>
        <h2 className="text-[15px] font-bold text-white mb-3">Artists</h2>
        <div className="flex gap-2 scroll-x pb-1">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => { setCategory(c); setActiveArtist(null); setSongs([]); }}
              className={`px-4 py-2 rounded-full text-[12px] font-medium whitespace-nowrap shrink-0 transition-all duration-200 ${
                category === c 
                  ? 'bg-white text-black' 
                  : 'bg-white/[0.06] text-[#aaa] hover:bg-white/[0.1]'
              }`}
            >{c}</button>
          ))}
        </div>
      </section>

      {/* Artist Grid */}
      <section className="mb-5">
        <div className="flex gap-4 scroll-x pb-2 stagger">
          {filtered.map(a => (
            <button key={a.name} onClick={() => loadArtist(a)}
              className={`group flex flex-col items-center gap-2 shrink-0 transition-all duration-200 ${activeArtist === a.name ? 'scale-105' : ''}`}>
              <div className={`relative w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] rounded-full overflow-hidden ring-2 transition-all duration-200 ${
                activeArtist === a.name ? 'ring-white shadow-lg shadow-white/10' : 'ring-white/[0.06] group-hover:ring-white/[0.15]'
              }`}>
                <img src={a.img} alt={a.name} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <p className={`text-[10px] sm:text-[11px] font-medium text-center w-[72px] sm:w-[84px] truncate transition-colors ${
                activeArtist === a.name ? 'text-white' : 'text-[#aaa]'
              }`}>{a.name}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Artist Songs */}
      {loading && <div className="flex justify-center py-10"><Loader2 size={20} className="text-rose-500 animate-spin" /></div>}

      {!loading && activeArtist && songs.length > 0 && (
        <section className="animate-in">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-[16px] font-bold text-white">{activeArtist}</h2>
              <p className="text-[11px] text-[#666]">{songs.length} songs</p>
            </div>
            <button onClick={() => playSong(songs[0], songs)} className="flex items-center gap-1.5 px-4 py-2.5 bg-white rounded-full text-[12px] text-black font-semibold btn-press shadow-lg shadow-white/10">
              <Play size={12} fill="black" /> Play All
            </button>
          </div>
          <div className="bg-[#0e0e0e] rounded-2xl overflow-hidden border border-white/[0.04]">
            {songs.map((s, i) => <SongRow key={s.id} song={s} index={i} songList={songs} />)}
          </div>
        </section>
      )}
    </div>
  );
}
