import { useState } from 'react';
import { Loader2, Play, X } from 'lucide-react';
import { searchSongs } from '../data/api';
import { usePlayer } from '../context/PlayerContext';
import SongRow from '../components/SongRow';

const ARTISTS = [
  { name: 'AP Dhillon', img: 'https://c.saavncdn.com/artists/AP_Dhillon_004_20251023102150_500x500.jpg', cat: 'Punjabi' },
  { name: 'Ammy Virk', img: 'https://c.saavncdn.com/artists/Ammy_Virk_005_20241101070506_500x500.jpg', cat: 'Punjabi' },
  { name: 'B Praak', img: 'https://c.saavncdn.com/artists/B_Praak_001_20191118112005_500x500.jpg', cat: 'Punjabi' },
  { name: 'Diljit Dosanjh', img: 'https://c.saavncdn.com/artists/Diljit_Dosanjh_005_20231025073054_500x500.jpg', cat: 'Punjabi' },
  { name: 'Guru Randhawa', img: 'https://c.saavncdn.com/artists/Guru_Randhawa_004_20250701125845_500x500.jpg', cat: 'Punjabi' },
  { name: 'Harrdy Sandhu', img: 'https://c.saavncdn.com/artists/Hardy_Sandhu_001_20190913112018_500x500.jpg', cat: 'Punjabi' },
  { name: 'Karan Aujla', img: 'https://c.saavncdn.com/artists/Karan_Aujla_004_20260810121947_500x500.jpg', cat: 'Punjabi' },
  { name: 'Shubh', img: 'https://c.saavncdn.com/artists/Shubh_000_20220921112507_500x500.jpg', cat: 'Punjabi' },
  { name: 'Sidhu Moosewala', img: 'https://c.saavncdn.com/artists/Sidhu_Moose_Wala_004_20250617183705_500x500.jpg', cat: 'Punjabi' },
  { name: 'Arijit Singh', img: 'https://c.saavncdn.com/artists/Arijit_Singh_004_20241118063717_500x500.jpg', cat: 'Bollywood' },
  { name: 'Jubin Nautiyal', img: 'https://c.saavncdn.com/artists/Jubin_Nautiyal_003_20231130204020_500x500.jpg', cat: 'Bollywood' },
  { name: 'Shreya Ghoshal', img: 'https://c.saavncdn.com/artists/Shreya_Ghoshal_007_20241101074144_500x500.jpg', cat: 'Bollywood' },
  { name: 'Neha Kakkar', img: 'https://c.saavncdn.com/artists/Neha_Kakkar_007_20241212115832_500x500.jpg', cat: 'Bollywood' },
  { name: 'Vishal Mishra', img: 'https://c.saavncdn.com/artists/Vishal_Mishra_005_20251120085316_500x500.jpg', cat: 'Bollywood' },
  { name: 'Atif Aslam', img: 'https://c.saavncdn.com/artists/Atif_Aslam_500x500.jpg', cat: 'Bollywood' },
  { name: 'Darshan Raval', img: 'https://c.saavncdn.com/artists/Darshan_Raval_006_20250807060352_500x500.jpg', cat: 'Bollywood' },
  { name: 'Pritam', img: 'https://c.saavncdn.com/artists/Pritam_Chakraborty-20170711073326_500x500.jpg', cat: 'Bollywood' },
  { name: 'A.R. Rahman', img: 'https://c.saavncdn.com/artists/AR_Rahman_002_20210120084455_500x500.jpg', cat: 'Bollywood' },
  { name: 'The Weeknd', img: 'https://c.saavncdn.com/artists/The_Weeknd_002_20241003071400_500x500.jpg', cat: 'English' },
  { name: 'Dua Lipa', img: 'https://c.saavncdn.com/artists/Dua_Lipa_004_20231120090922_500x500.jpg', cat: 'English' },
  { name: 'Drake', img: 'https://c.saavncdn.com/artists/Drake_006_20260520062317_500x500.jpg', cat: 'English' },
  { name: 'Ed Sheeran', img: 'https://c.saavncdn.com/artists/Ed_Sheeran_002_20250625073038_500x500.jpg', cat: 'English' },
  { name: 'Taylor Swift', img: 'https://c.saavncdn.com/artists/Taylor_Swift_003_20200226074119_500x500.jpg', cat: 'English' },
  { name: 'Justin Bieber', img: 'https://c.saavncdn.com/artists/Justin_Bieber_005_20201127112218_500x500.jpg', cat: 'English' },
  { name: 'Eminem', img: 'https://c.saavncdn.com/artists/Eminem_003_20240403152835_500x500.jpg', cat: 'English' },
  { name: 'Billie Eilish', img: 'https://c.saavncdn.com/artists/Billie_Eilish_20190211151539_500x500.jpg', cat: 'English' },
  { name: 'Badshah', img: 'https://c.saavncdn.com/artists/Badshah_006_20241118064015_500x500.jpg', cat: 'Hip-Hop' },
  { name: 'Honey Singh', img: 'https://c.saavncdn.com/artists/Yo_Yo_Honey_Singh_004_20260811095253_500x500.jpg', cat: 'Hip-Hop' },
  { name: 'Divine', img: 'https://c.saavncdn.com/artists/DIVINE_006_20250911071442_500x500.jpg', cat: 'Hip-Hop' },
  { name: 'Raftaar', img: 'https://c.saavncdn.com/artists/Raftaar_009_20230223100912_500x500.jpg', cat: 'Hip-Hop' },
];

const CATEGORIES = ['All', 'Punjabi', 'Bollywood', 'English', 'Hip-Hop'];

export default function Explore() {
  const [category, setCategory] = useState('All');
  const [activeArtist, setActiveArtist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const { playSong } = usePlayer();

  const filtered = category === 'All' ? ARTISTS : ARTISTS.filter(a => a.cat === category);

  const loadArtist = async (artist) => {
    if (activeArtist === artist.name) { setActiveArtist(null); setSongs([]); return; }
    setActiveArtist(artist.name);
    setLoading(true);
    const s = await searchSongs(artist.name, 15) || [];
    setSongs(s);
    setLoading(false);
  };

  return (
    <div className="pb-6 pt-2">
      {/* Category Filter */}
      <div className="flex gap-2 mb-5 scroll-x pb-1 sticky top-0 z-10 bg-[#080808] pt-1">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => { setCategory(c); setActiveArtist(null); setSongs([]); }}
            className={`px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap shrink-0 transition-all duration-200 ${
              category === c ? 'bg-white text-black' : 'bg-[#1a1a1a] text-[#aaa] hover:text-white'
            }`}
          >{c}</button>
        ))}
      </div>

      {/* Artist Songs (shows on top when active) */}
      {loading && <div className="flex justify-center py-10 mb-5"><Loader2 size={20} className="text-white animate-spin" /></div>}

      {!loading && activeArtist && songs.length > 0 && (
        <div className="mb-6 animate-in">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <img src={filtered.find(a => a.name === activeArtist)?.img} alt="" className="w-10 h-10 rounded-full object-cover" />
              <div>
                <p className="text-[14px] text-white font-bold">{activeArtist}</p>
                <p className="text-[11px] text-[#666]">{songs.length} songs</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => playSong(songs[0], songs)} className="flex items-center gap-1.5 px-4 py-2 bg-white rounded-full text-[12px] text-black font-semibold btn-press">
                <Play size={12} fill="black" /> Play
              </button>
              <button onClick={() => { setActiveArtist(null); setSongs([]); }} className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center btn-press">
                <X size={14} className="text-[#aaa]" />
              </button>
            </div>
          </div>
          <div className="bg-[#0e0e0e] rounded-2xl overflow-hidden border border-white/[0.04]">
            {songs.map((s, i) => <SongRow key={s.id} song={s} index={i} songList={songs} />)}
          </div>
        </div>
      )}

      {/* Artist Grid - simple, clear */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {filtered.map(a => (
          <button key={a.name} onClick={() => loadArtist(a)}
            className={`flex flex-col items-center gap-2 p-2 rounded-2xl transition-all duration-200 btn-press ${
              activeArtist === a.name ? 'bg-white/[0.08]' : ''
            }`}>
            <img src={a.img} alt={a.name} 
              className={`w-full aspect-square rounded-full object-cover transition-all duration-200 ${
                activeArtist === a.name ? 'ring-[3px] ring-white' : 'ring-1 ring-white/[0.06]'
              }`} 
              loading="lazy" />
            <p className={`text-[11px] font-medium text-center truncate w-full ${
              activeArtist === a.name ? 'text-white' : 'text-[#aaa]'
            }`}>{a.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
