import{useParams}from'react-router-dom';
import{Play,Shuffle,Heart}from'lucide-react';
import{getPlaylistById,songs,formatDuration}from'../data/mockData';
import{usePlayer}from'../context/PlayerContext';
import SongRow from'../components/SongRow';

export default function PlaylistPage(){
  const{id}=useParams();
  const{playSong,showToast}=usePlayer();
  const playlist=getPlaylistById(id);
  if(!playlist)return<p className="text-center text-[#717171] py-20">Playlist not found</p>;
  const playlistSongs=playlist.songs.map(sid=>songs.find(s=>s.id===sid)).filter(Boolean);
  const total=playlistSongs.reduce((a,s)=>a+s.duration,0);

  return(
    <div className="pb-8 animate-[fadeIn_0.3s_ease-out]">
      <section className="flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-6">
        <img src={playlist.thumbnail} alt="" className="w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] rounded-xl shadow-2xl object-cover"/>
        <div className="text-center sm:text-left">
          <p className="text-xs text-[#717171] uppercase mb-1">Playlist</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">{playlist.title}</h1>
          <p className="text-sm text-[#AAAAAA] mb-1">{playlist.description}</p>
          <p className="text-xs text-[#717171]">{playlist.owner} • {playlistSongs.length} songs • {formatDuration(total)}</p>
        </div>
      </section>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={()=>playlistSongs.length&&playSong(playlistSongs[0],playlistSongs)} className="w-11 h-11 bg-[#FF0000] rounded-full flex items-center justify-center hover:bg-[#CC0000]"><Play size={20} className="text-white ml-0.5" fill="white"/></button>
        <button onClick={()=>{const s=[...playlistSongs].sort(()=>Math.random()-0.5);if(s.length)playSong(s[0],s);}} className="p-2.5 hover:bg-[#272727] rounded-full text-[#AAAAAA] hover:text-white"><Shuffle size={20}/></button>
        <button onClick={()=>showToast('Saved!')} className="p-2.5 hover:bg-[#272727] rounded-full text-[#AAAAAA] hover:text-white"><Heart size={20}/></button>
      </div>
      <div className="bg-[#1A1A1A] rounded-xl overflow-hidden">{playlistSongs.map((s,i)=><SongRow key={s.id} song={s} index={i} songList={playlistSongs}/>)}</div>
    </div>
  );
}
