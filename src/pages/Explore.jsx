import { useState } from 'react';
import { Loader2, Play, Pause, Shuffle } from 'lucide-react';
import { searchSongs } from '../data/api';
import { usePlayer } from '../context/PlayerContext';
import SongRow from '../components/SongRow';
import SongCard from '../components/SongCard';

const ARTISTS = [
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
  { name: 'Badshah', img: 'https://c.saavncdn.com/artists/Badshah_006_20241118064015_500x500.jpg', cat: 'Hip-Hop' },
  { name: 'Divine', img: 'https://c.saavncdn.com/artists/DIVINE_006_20250911071442_500x500.jpg', cat: 'Hip-Hop' },
  { name: 'Honey Singh', img: 'https://c.saavncdn.com/artists/Yo_Yo_Honey_Singh_004_20260811095253_500x500.jpg', cat: 'Hip-Hop' },
  { name: 'Raftaar', img: 'https://c.saavncdn.com/artists/Raftaar_009_20230223100912_500x500.jpg', cat: 'Hip-Hop' },
  { name: 'Kishore Kumar', img: 'https://c.saavncdn.com/artists/Kishore_Kumar_500x500.jpg', cat: 'Legends' },
  { name: 'Lata Mangeshkar', img: 'https://c.saavncdn.com/artists/Lata_Mangeshkar_004_20230623105323_500x500.jpg', cat: 'Legends' },
  { name: 'Mohammed Rafi', img: 'https://c.saavncdn.com/artists/Mohammed_Rafi_500x500.jpg', cat: 'Legends' },
  { name: 'Mukesh', img: 'https://c.saavncdn.com/artists/Mukesh_500x500.jpg', cat: 'Legends' },
];

const CATEGORIES = ['All', 'Punjabi', 'Bollywood', 'English', 'Hip-Hop', 'Legends'];

const QUICK_MIXES = [
  { title: 'Trending India', query: 'trending hindi 2024 latest', color: 'from-[#e11d48] to-[#9f1239]', icon: '🔥' },
  { title: 'Punjabi Fire', query: 'punjabi hits 2024 new', color: 'from-[#d97706] to-[#b45309]', icon: '⚡' },
  { title: 'Chill Vibes', query: 'lofi chill hindi relax', color: 'from-[#0891b2] to-[#155e75]', icon: '🌊' },
  { title: 'Party Mix', query: 'party dance bollywood 2024', color: 'from-[#7c3aed] to-[#5b21b6]', icon: '🪩' },
  { title: 'Romantic', query: 'romantic hindi love songs', color: 'from-[#db2777] to-[#9d174d]', icon: '💕' },
  { title: 'English Hits', query: 'english pop hits 2024', color: 'from-[#059669] to-[#065f46]', icon: '🌍' },
];

export default function Explore() {
  const [category, setCategory] = useState('All');
  const [activeArtist, setActiveArtist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mixSongs, setMixSongs] = useState([]);
  const [activeMix, setActiveMix] = useState(null);
  const [mixLoading, setMixLoading] = useState(false);
  const { playSong, currentSong, isPlaying } = usePlayer();

  const filtered = category === 'All' ? ARTISTS : ARTISTS.filter(a => a.cat === category);

  const loadArtist = async (artist) => {
    if (activeArtist === artist.name) { setActiveArtist(null); setSongs([]); return; }
    setActiveArtist(artist.name);
    setActiveMix(null); setMixSongs([]);
    setLoading(true);
    const s = await searchSongs(artist.name, 20) || [];
    setSongs(s);
    setLoading(false);
  };

  const loadMix = async (mix) => {
    if (activeMix === mix.title) { setActiveMix(null); setMixSongs([]); return; }
    setActiveMix(mix.title);
    setActiveArtist(null); setSongs([]);
    setMixLoading(true);
    const s = await searchSongs(mix.query, 15) || [];
    setMixSongs(s);
    setMixLoading(false);
  };

  const shufflePlay = (list) => {
    const shuffled = [...list].sort(() => Math.random() - 0.5);
    playSong(shuffled[0], shuffled);
  };

  return (
    <div className="pb-6 pt-2">
      {/* Quick Mixes */}
      <section className="mb-8 animate-in">
        <h2 className="text-[16px] font-bold text-white mb-4">Quick Mixes</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {QUICK_MIXES.map(mix => (
            <button key={mix.title} onClick={() => loadMix(mix)}
              className={`relative overflow-hidden rounded-2xl h-[80px] sm:h-[90px] text-left btn-press transition-all duration-300 ${
                activeMix === mix.title ? 'ring-2 ring-white/40 scale-[0.97]' : 'hover:scale-[1.02]'
              }`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${mix.color}`} />
              <div className="relative flex items-end justify-between h-full p-4">
                <span className="text-[14px] font-bold text-white drop-shadow-md">{mix.title}</span>
                <span className="text-[22px] opacity-80">{mix.icon}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Mix Results */}
      {mixLoading && <div className="flex justify-center py-8 mb-6"><Loader2 size={20} className="text-white animate-spin" /></div>}
      {!mixLoading && activeMix && mixSongs.length > 0 && (
        <section className="mb-8 animate-in">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[16px] font-bold text-white">{activeMix}</h2>
              <p className="text-[11px] text-[#666]">{mixSongs.length} songs</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => shufflePlay(mixSongs)} className="w-9 h-9 rounded-full bg-white/[0.08] hover:bg-white/[0.12] flex items-center justify-center btn-press transition-colors">
                <Shuffle size={14} className="text-white" />
              </button>
              <button onClick={() => playSong(mixSongs[0], mixSongs)} className="flex items-center gap-1.5 px-4 py-2 bg-white rounded-full text-[12px] text-black font-semibold btn-press shadow-lg shadow-white/10">
                <Play size={12} fill="black" /> Play
              </button>
            </div>
          </div>
          <div className="flex gap-3 scroll-x pb-2 stagger">
            {mixSongs.map(s => <SongCard key={s.id} song={s} />)}
          </div>
        </section>
      )}

      {/* Category Tabs */}
      <section className="mb-4 animate-in" style={{ animationDelay: '0.05s' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-bold text-white">Artists</h2>
          {activeArtist && (
            <button onClick={() => { setActiveArtist(null); setSongs([]); }} className="text-[11px] text-[#888] hover:text-white transition-colors btn-press">Close</button>
          )}
        </div>
        <div className="flex gap-2 scroll-x pb-2">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => { setCategory(c); setActiveArtist(null); setSongs([]); }}
              className={`px-4 py-2.5 rounded-full text-[12px] font-semibold whitespace-nowrap shrink-0 transition-all duration-300 ${
                category === c 
                  ? 'bg-white text-black shadow-md shadow-white/10' 
                  : 'bg-white/[0.06] text-[#999] hover:bg-white/[0.1] hover:text-white'
              }`}
            >{c}</button>
          ))}
        </div>
      </section>

      {/* Artist Grid */}
      <section className="mb-6">
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {filtered.map((a, idx) => (
            <button key={a.name} onClick={() => loadArtist(a)}
              className={`group flex flex-col items-center gap-2 transition-all duration-300 btn-press animate-in ${
                activeArtist === a.name ? 'scale-95' : ''
              }`} style={{ animationDelay: `${idx * 0.02}s` }}>
              <div className={`relative w-full aspect-square rounded-full overflow-hidden transition-all duration-300 ${
                activeArtist === a.name 
                  ? 'ring-[3px] ring-white shadow-xl shadow-white/20' 
                  : 'ring-1 ring-white/[0.06] group-hover:ring-white/[0.2] group-hover:shadow-lg group-hover:shadow-black/40'
              }`}>
                <img src={a.img} alt={a.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                {activeArtist === a.name && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <Play size={14} className="text-black ml-0.5" fill="black" />
                    </div>
                  </div>
                )}
              </div>
              <p className={`text-[10px] sm:text-[11px] font-medium text-center truncate w-full px-1 transition-colors duration-200 ${
                activeArtist === a.name ? 'text-white' : 'text-[#999] group-hover:text-white'
              }`}>{a.name}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Artist Songs */}
      {loading && <div className="flex justify-center py-12"><Loader2 size={22} className="text-white animate-spin" /></div>}

      {!loading && activeArtist && songs.length > 0 && (
        <section className="animate-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img src={filtered.find(a => a.name === activeArtist)?.img} alt="" className="w-12 h-12 rounded-full object-cover ring-1 ring-white/[0.1]" />
              <div>
                <h2 className="text-[16px] font-bold text-white">{activeArtist}</h2>
                <p className="text-[11px] text-[#666]">{songs.length} songs</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => shufflePlay(songs)} className="w-10 h-10 rounded-full bg-white/[0.08] hover:bg-white/[0.12] flex items-center justify-center btn-press transition-colors">
                <Shuffle size={15} className="text-white" />
              </button>
              <button onClick={() => playSong(songs[0], songs)} className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-full text-[12px] text-black font-bold btn-press shadow-xl shadow-white/15">
                <Play size={13} fill="black" /> Play All
              </button>
            </div>
          </div>
          <div className="bg-[#0c0c0c] rounded-2xl overflow-hidden border border-white/[0.04]">
            {songs.map((s, i) => <SongRow key={s.id} song={s} index={i} songList={songs} />)}
          </div>
        </section>
      )}
    </div>
  );
}
