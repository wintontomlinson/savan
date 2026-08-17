import{useParams,useNavigate}from'react-router-dom';
import{Play,Shuffle,UserPlus}from'lucide-react';
import{getArtistById,songs,albums,artists}from'../data/mockData';
import{usePlayer}from'../context/PlayerContext';
import SongRow from'../components/SongRow';
import AlbumCard from'../components/AlbumCard';
import ArtistCard from'../components/ArtistCard';
import HorizontalScroll from'../components/HorizontalScroll';

export default function ArtistPage(){
  const{id}=useParams();
  const{playSong,showToast}=usePlayer();
  const artist=getArtistById(id);
  if(!artist)return<p className="text-center text-[#717171] py-20">Artist not found</p>;
  const artistSongs=songs.filter(s=>s.artistId===id);
  const artistAlbums=albums.filter(a=>a.artistId===id);
  const similar=artists.filter(a=>a.id!==id).slice(0,6);

  return(
    <div className="pb-8 animate-[fadeIn_0.3s_ease-out]">
      {/* Hero */}
      <section className="relative h-[300px] -mx-4 sm:-mx-6 -mt-4 mb-6">
        <img src={artist.image} alt="" className="absolute inset-0 w-full h-full object-cover"/>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-[#0F0F0F]/60 to-transparent"/>
        <div className="absolute bottom-6 left-6">
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-1">{artist.name}</h1>
          <p className="text-sm text-[#AAAAAA]">{artist.monthlyListeners} monthly listeners</p>
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={()=>artistSongs.length&&playSong(artistSongs[0],artistSongs)} className="flex items-center gap-2 px-5 py-2.5 bg-[#FF0000] hover:bg-[#CC0000] text-white rounded-full text-sm font-medium"><Play size={16} fill="white"/>Play</button>
        <button onClick={()=>{const s=[...artistSongs].sort(()=>Math.random()-0.5);if(s.length)playSong(s[0],s);}} className="flex items-center gap-2 px-5 py-2.5 bg-[#272727] hover:bg-[#383838] text-white rounded-full text-sm font-medium"><Shuffle size={16}/>Shuffle</button>
        <button onClick={()=>showToast('Subscribed!')} className="flex items-center gap-2 px-5 py-2.5 border border-[#383838] hover:border-white text-white rounded-full text-sm font-medium"><UserPlus size={16}/>Subscribe</button>
      </div>

      {/* Songs */}
      <section className="mb-8"><h2 className="text-lg font-semibold text-white mb-3">Popular</h2><div className="bg-[#1A1A1A] rounded-xl overflow-hidden">{artistSongs.slice(0,8).map((s,i)=><SongRow key={s.id} song={s} index={i} songList={artistSongs}/>)}</div></section>

      {artistAlbums.length>0&&<HorizontalScroll title="Albums">{artistAlbums.map(a=><AlbumCard key={a.id} album={a}/>)}</HorizontalScroll>}
      <HorizontalScroll title="Fans Also Like">{similar.map(a=><ArtistCard key={a.id} artist={a}/>)}</HorizontalScroll>

      {/* About */}
      <section className="mt-4"><h2 className="text-lg font-semibold text-white mb-3">About</h2><div className="bg-[#1A1A1A] rounded-xl p-5"><p className="text-sm text-[#AAAAAA] mb-3">{artist.bio}</p><div className="flex flex-wrap gap-2">{artist.genres.map(g=><span key={g} className="px-3 py-1 bg-[#272727] rounded-full text-xs text-white">{g}</span>)}</div></div></section>
    </div>
  );
}
