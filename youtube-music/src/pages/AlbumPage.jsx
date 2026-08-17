import{useState,useEffect}from'react';
import{useParams,useNavigate}from'react-router-dom';
import{Play,Shuffle,Loader2}from'lucide-react';
import{getAlbumById}from'../data/api';
import{formatDuration}from'../data/mockData';
import{usePlayer}from'../context/PlayerContext';
import SongRow from'../components/SongRow';

export default function AlbumPage(){
  const{id}=useParams();
  const nav=useNavigate();
  const{playSong}=usePlayer();
  const[album,setAlbum]=useState(null);
  const[loading,setLoading]=useState(true);

  useEffect(()=>{getAlbumById(id).then(a=>{setAlbum(a);setLoading(false);});},[id]);

  if(loading)return<div className="flex justify-center py-20"><Loader2 size={24} className="text-[#FF0000] animate-spin"/></div>;
  if(!album)return<p className="text-center text-[#717171] py-20">Album not found</p>;

  const albumSongs=album.songs||[];
  const total=albumSongs.reduce((a,s)=>a+s.duration,0);

  return(
    <div className="pb-8 animate-[fadeIn_0.3s_ease-out]">
      <section className="flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-6">
        <img src={album.thumbnail} alt="" className="w-[200px] h-[200px] sm:w-[220px] sm:h-[220px] rounded-xl shadow-2xl object-cover"/>
        <div className="text-center sm:text-left">
          <p className="text-xs text-[#717171] uppercase mb-1">Album</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{album.title}</h1>
          <button onClick={()=>album.artistId&&nav(`/artist/${album.artistId}`)} className="text-sm text-[#AAAAAA] hover:text-white">{album.artist}</button>
          <p className="text-xs text-[#717171] mt-1">{album.year} • {albumSongs.length} songs • {formatDuration(total)}</p>
        </div>
      </section>
      <div className="flex gap-3 mb-6">
        <button onClick={()=>albumSongs.length&&playSong(albumSongs[0],albumSongs)} className="w-11 h-11 bg-[#FF0000] rounded-full flex items-center justify-center hover:bg-[#CC0000]"><Play size={20} className="text-white ml-0.5" fill="white"/></button>
        <button onClick={()=>{const s=[...albumSongs].sort(()=>Math.random()-0.5);if(s.length)playSong(s[0],s);}} className="p-2.5 hover:bg-[#272727] rounded-full text-[#AAAAAA]"><Shuffle size={20}/></button>
      </div>
      <div className="bg-[#1A1A1A] rounded-xl overflow-hidden">{albumSongs.map((s,i)=><SongRow key={s.id} song={s} index={i} showAlbum={false} songList={albumSongs}/>)}</div>
    </div>
  );
}
