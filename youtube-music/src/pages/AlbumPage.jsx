import{useParams,useNavigate}from'react-router-dom';
import{Play,Shuffle,Heart,Download}from'lucide-react';
import{getAlbumById,songs,albums,formatDuration}from'../data/mockData';
import{usePlayer}from'../context/PlayerContext';
import SongRow from'../components/SongRow';
import AlbumCard from'../components/AlbumCard';
import HorizontalScroll from'../components/HorizontalScroll';

export default function AlbumPage(){
  const{id}=useParams();
  const nav=useNavigate();
  const{playSong,showToast}=usePlayer();
  const album=getAlbumById(id);
  if(!album)return<p className="text-center text-[#717171] py-20">Album not found</p>;
  const albumSongs=songs.filter(s=>s.albumId===id);
  const totalMin=Math.floor(album.totalDuration/60);
  const moreAlbums=albums.filter(a=>a.id!==id&&a.artistId===album.artistId);

  return(
    <div className="pb-8 animate-[fadeIn_0.3s_ease-out]">
      {/* Header */}
      <section className="flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-6">
        <img src={album.thumbnail} alt="" className="w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] rounded-xl shadow-2xl object-cover"/>
        <div className="text-center sm:text-left">
          <p className="text-xs text-[#717171] uppercase mb-1">Album</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{album.title}</h1>
          <button onClick={()=>nav(`/artist/${album.artistId}`)} className="text-sm text-[#AAAAAA] hover:text-white hover:underline">{album.artist}</button>
          <p className="text-xs text-[#717171] mt-1">{album.year} • {album.genre} • {albumSongs.length} songs • {totalMin} min</p>
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={()=>albumSongs.length&&playSong(albumSongs[0],albumSongs)} className="w-11 h-11 bg-[#FF0000] rounded-full flex items-center justify-center hover:bg-[#CC0000]"><Play size={20} className="text-white ml-0.5" fill="white"/></button>
        <button onClick={()=>{const s=[...albumSongs].sort(()=>Math.random()-0.5);if(s.length)playSong(s[0],s);}} className="p-2.5 hover:bg-[#272727] rounded-full text-[#AAAAAA] hover:text-white"><Shuffle size={20}/></button>
        <button onClick={()=>showToast('Saved to library')} className="p-2.5 hover:bg-[#272727] rounded-full text-[#AAAAAA] hover:text-white"><Heart size={20}/></button>
        <button onClick={()=>showToast('Premium feature')} className="p-2.5 hover:bg-[#272727] rounded-full text-[#AAAAAA] hover:text-white"><Download size={20}/></button>
      </div>

      {/* Songs */}
      <div className="bg-[#1A1A1A] rounded-xl overflow-hidden mb-8">{albumSongs.map((s,i)=><SongRow key={s.id} song={s} index={i} showAlbum={false} songList={albumSongs}/>)}</div>

      {moreAlbums.length>0&&<HorizontalScroll title={`More by ${album.artist}`}>{moreAlbums.map(a=><AlbumCard key={a.id} album={a}/>)}</HorizontalScroll>}
    </div>
  );
}
