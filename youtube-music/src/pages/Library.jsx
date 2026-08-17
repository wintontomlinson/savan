import{Heart,Music}from'lucide-react';
import{usePlayer}from'../context/PlayerContext';

export default function Library(){
  const{likedSongs}=usePlayer();
  return(
    <div className="pb-8 animate-[fadeIn_0.3s_ease-out]">
      <h1 className="text-2xl font-bold text-white mb-6">Your Library</h1>
      <div className="flex items-center gap-4 p-4 mb-4 rounded-xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-white/5">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center"><Heart size={20} className="text-white" fill="white"/></div>
        <div><p className="text-sm font-bold text-white">Liked Songs</p><p className="text-xs text-[#AAAAAA]">{likedSongs.length} songs liked</p></div>
      </div>
      {likedSongs.length===0?(
        <div className="text-center py-16"><Music size={40} className="text-[#383838] mx-auto mb-3"/><p className="text-[#AAAAAA]">Songs you like will appear here</p><p className="text-xs text-[#717171] mt-1">Tap ❤️ on any song</p></div>
      ):<p className="text-sm text-[#717171]">Play songs and like them to build your library.</p>}
    </div>
  );
}
