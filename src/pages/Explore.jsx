import { useState } from 'react';
import { Loader2, Play } from 'lucide-react';
import { searchSongs } from '../data/api';
import { usePlayer } from '../context/PlayerContext';
import SongRow from '../components/SongRow';

const ARTISTS = [
  // Punjabi
  { name: 'Karan Aujla', img: 'https://c.saavncdn.com/artists/Karan_Aujla_004_20260810121947_500x500.jpg', cat: 'Punjabi' },
  { name: 'AP Dhillon', img: 'https://c.saavncdn.com/artists/AP_Dhillon_004_20251023102150_500x500.jpg', cat: 'Punjabi' },
  { name: 'Sidhu Moosewala', img: 'https://c.saavncdn.com/artists/Sidhu_Moose_Wala_004_20250617183705_500x500.jpg', cat: 'Punjabi' },
  { name: 'Shubh', img: 'https://c.saavncdn.com/artists/Shubh_000_20220921112507_500x500.jpg', cat: 'Punjabi' },
  { name: 'Diljit Dosanjh', img: 'https://c.saavncdn.com/artists/Diljit_Dosanjh_005_20231025073054_500x500.jpg', cat: 'Punjabi' },
  { name: 'Harrdy Sandhu', img: 'https://c.saavncdn.com/artists/Hardy_Sandhu_001_20190913112018_500x500.jpg', cat: 'Punjabi' },
  { name: 'Guru Randhawa', img: 'https://c.saavncdn.com/artists/Guru_Randhawa_004_20250701125845_500x500.jpg', cat: 'Punjabi' },
  { name: 'Jasmine Sandlas', img: 'https://c.saavncdn.com/artists/Jasmine_Sandlas_002_20240314115630_500x500.jpg', cat: 'Punjabi' },
  { name: 'Ammy Virk', img: 'https://c.saavncdn.com/artists/Ammy_Virk_005_20241101070506_500x500.jpg', cat: 'Punjabi' },
  { name: 'Bohemia', img: 'https://c.saavncdn.com/artists/Bohemia_500x500.jpg', cat: 'Punjabi' },
  // Bollywood
  { name: 'Arijit Singh', img: 'https://c.saavncdn.com/artists/Arijit_Singh_004_20241118063717_500x500.jpg', cat: 'Bollywood' },
  { name: 'Jubin Nautiyal', img: 'https://c.saavncdn.com/artists/Jubin_Nautiyal_003_20231130204020_500x500.jpg', cat: 'Bollywood' },
  { name: 'Shreya Ghoshal', img: 'https://c.saavncdn.com/artists/Shreya_Ghoshal_007_20241101074144_500x500.jpg', cat: 'Bollywood' },
  { name: 'B Praak', img: 'https://c.saavncdn.com/artists/B_Praak_001_20191118112005_500x500.jpg', cat: 'Bollywood' },
  { name: 'Pritam', img: 'https://c.saavncdn.com/artists/Pritam_Chakraborty-20170711073326_500x500.jpg', cat: 'Bollywood' },
  { name: 'Vishal Mishra', img: 'https://c.saavncdn.com/artists/Vishal_Mishra_005_20251120085316_500x500.jpg', cat: 'Bollywood' },
  { name: 'Neha Kakkar', img: 'https://c.saavncdn.com/artists/Neha_Kakkar_007_20241212115832_500x500.jpg', cat: 'Bollywood' },
  { name: 'Darshan Raval', img: 'https://c.saavncdn.com/artists/Darshan_Raval_006_20250807060352_500x500.jpg', cat: 'Bollywood' },
  { name: 'Armaan Malik', img: 'https://c.saavncdn.com/artists/Armaan_Malik_006_20260813132832_500x500.jpg', cat: 'Bollywood' },
  { name: 'A.R. Rahman', img: 'https://c.saavncdn.com/artists/AR_Rahman_002_20210120084455_500x500.jpg', cat: 'Bollywood' },
  // English
  { name: 'The Weeknd', img: 'https://c.saavncdn.com/artists/The_Weeknd_002_20241003071400_500x500.jpg', cat: 'English' },
  { name: 'Dua Lipa', img: 'https://c.saavncdn.com/artists/Dua_Lipa_004_20231120090922_500x500.jpg', cat: 'English' },
  { name: 'Drake', img: 'https://c.saavncdn.com/artists/Drake_006_20260520062317_500x500.jpg', cat: 'English' },
  { name: 'Taylor Swift', img: 'https://c.saavncdn.com/artists/Taylor_Swift_003_20200226074119_500x500.jpg', cat: 'English' },
  { name: 'Ed Sheeran', img: 'https://c.saavncdn.com/artists/Ed_Sheeran_002_20250625073038_500x500.jpg', cat: 'English' },
  { name: 'Billie Eilish', img: 'https://c.saavncdn.com/artists/Billie_Eilish_20190211151539_500x500.jpg', cat: 'English' },
  { name: 'Post Malone', img: 'https://c.saavncdn.com/artists/Post_Malone_004_20190911070147_500x500.jpg', cat: 'English' },
  { name: 'Justin Bieber', img: 'https://c.saavncdn.com/artists/Justin_Bieber_005_20201127112218_500x500.jpg', cat: 'English' },
  { name: 'Selena Gomez', img: 'https://c.saavncdn.com/artists/Selena_Gomez_003_20231023065157_500x500.jpg', cat: 'English' },
  { name: 'Eminem', img: 'https://c.saavncdn.com/artists/Eminem_003_20240403152835_500x500.jpg', cat: 'English' },
  { name: 'BTS', img: 'https://c.saavncdn.com/artists/BTS_006_20260624192553_500x500.jpg', cat: 'English' },
  { name: 'Akon', img: 'https://c.saavncdn.com/artists/Akon_500x500.jpg', cat: 'English' },
  // Hip-Hop / Rap
  { name: 'Badshah', img: 'https://c.saavncdn.com/artists/Badshah_006_20241118064015_500x500.jpg', cat: 'Hip-Hop' },
  { name: 'Honey Singh', img: 'https://c.saavncdn.com/artists/Yo_Yo_Honey_Singh_004_20260811095253_500x500.jpg', cat: 'Hip-Hop' },
  { name: 'Raftaar', img: 'https://c.saavncdn.com/artists/Raftaar_009_20230223100912_500x500.jpg', cat: 'Hip-Hop' },
  { name: 'Divine', img: 'https://c.saavncdn.com/artists/DIVINE_006_20250911071442_500x500.jpg', cat: 'Hip-Hop' },
  // Legends
  { name: 'Lata Mangeshkar', img: 'https://c.saavncdn.com/artists/Lata_Mangeshkar_004_20230623105323_500x500.jpg', cat: 'Legends' },
  { name: 'Kishore Kumar', img: 'https://c.saavncdn.com/artists/Kishore_Kumar_500x500.jpg', cat: 'Legends' },
];

const CATEGORIES = ['All', 'Punjabi', 'Bollywood', 'English', 'Hip-Hop', 'Legends'];

export default function Explore() {
  const [category, setCategory] = useState('All');
  const [activeArtist, setActiveArtist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const { playSong } = usePlayer();

  const filtered = category === 'All' ? ARTISTS : ARTISTS.filter(a => a.cat === category);

  const loadArtist = async (artist) => {
    setActiveArtist(artist.name);
    setLoading(true);
    const s = await searchSongs(artist.name, 15);
    setSongs(s);
    setLoading(false);
  };

  return (
    <div className="pb-6 pt-2">
      <h1 className="text-xl sm:text-2xl font-bold text-white mb-4">Explore</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 scroll-x pb-1">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => { setCategory(c); setActiveArtist(null); setSongs([]); }}
            className={`px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap shrink-0 transition-all ${category === c ? 'bg-[#FF0000] text-white' : 'bg-[#1a1a1a] text-[#999] active:bg-[#222]'}`}
          >{c}</button>
        ))}
      </div>

      {/* Artists */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
        {filtered.map(a => (
          <button key={a.name} onClick={() => loadArtist(a)}
            className={`flex flex-col items-center gap-2 p-2 sm:p-3 rounded-2xl transition-all active:scale-95 ${activeArtist === a.name ? 'bg-[#FF0000]/10 ring-2 ring-[#FF0000]/40' : ''}`}>
            <img src={a.img} alt={a.name} className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full object-cover shadow-lg" />
            <p className="text-[10px] sm:text-[11px] md:text-[12px] font-medium text-white text-center leading-tight">{a.name}</p>
          </button>
        ))}
      </div>

      {/* Songs */}
      {loading && <div className="flex justify-center py-10"><Loader2 size={22} className="text-[#FF0000] animate-spin" /></div>}

      {!loading && activeArtist && songs.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base sm:text-lg font-bold text-white">{activeArtist}</h2>
            <button onClick={() => playSong(songs[0], songs)} className="flex items-center gap-1.5 px-3.5 py-2 bg-[#FF0000] rounded-full text-[12px] text-white font-medium active:scale-95">
              <Play size={12} fill="white" />Play All
            </button>
          </div>
          <div className="bg-[#111] rounded-2xl overflow-hidden border border-[#1a1a1a]">
            {songs.map((s, i) => <SongRow key={s.id} song={s} index={i} songList={songs} />)}
          </div>
        </section>
      )}
    </div>
  );
}
