import{Play,Pause,SkipBack,SkipForward,Shuffle,Repeat,Repeat1,Heart,ChevronDown,Volume2,VolumeX,ListPlus,Share2}from'lucide-react';
import{usePlayer}from'../context/PlayerContext';
import{formatDuration,lyrics}from'../data/mockData';

export default function ExpandedPlayer(){
  const{currentSong,isPlaying,togglePlay,playNext,playPrev,currentTime,duration,seekTo,volume,setVolume,isMuted,toggleMute,shuffleMode,toggleShuffle,repeatMode,cycleRepeat,toggleLike,likedSongs,isExpanded,setExpanded,showToast}=usePlayer();
  if(!isExpanded||!currentSong)return null;
  const liked=likedSongs.includes(currentSong.id);
  const progress=duration>0?(currentTime/duration)*100:0;
  const songLyrics=lyrics[currentSong.id]||null;
  const currentLineIdx=songLyrics?Math.min(Math.floor(currentTime/(duration/songLyrics.length)),songLyrics.length-1):0;

  return(
    <div className="fixed inset-0 z-[60] flex flex-col animate-[slideUp_0.35s_ease-out]">
      <div className="absolute inset-0"><img src={currentSong.thumbnail} alt="" className="w-full h-full object-cover blur-[80px] scale-125 opacity-30"/><div className="absolute inset-0 bg-black/70"/></div>
      <div className="relative flex-1 flex flex-col lg:flex-row overflow-y-auto">
        {/* Left/Main */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 gap-5">
          <div className="w-full flex justify-between items-center"><button onClick={()=>setExpanded(false)} className="p-2 hover:bg-white/10 rounded-full"><ChevronDown size={24} className="text-white"/></button><p className="text-xs text-[#AAAAAA]">Now Playing</p><div className="w-10"/></div>
          <img src={currentSong.thumbnail} alt="" className={`w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] rounded-2xl object-cover shadow-2xl ${isPlaying?'animate-[spin_30s_linear_infinite]':''}`} style={{animationPlayState:isPlaying?'running':'paused'}}/>
          <div className="text-center w-full max-w-sm">
            <h1 className="text-xl font-bold text-white truncate">{currentSong.title}</h1>
            <p className="text-sm text-[#AAAAAA]">{currentSong.artist}</p>
          </div>
          <button onClick={()=>toggleLike(currentSong.id)} className={`${liked?'text-[#FF0000]':'text-[#AAAAAA]'}`}><Heart size={22} fill={liked?'currentColor':'none'}/></button>
          <div className="w-full max-w-sm">
            <div className="w-full h-[5px] bg-white/20 rounded-full cursor-pointer group" onClick={e=>{const r=e.currentTarget.getBoundingClientRect();seekTo((e.clientX-r.left)/r.width*duration);}}>
              <div className="h-full bg-white rounded-full relative" style={{width:`${progress}%`}}><div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow opacity-0 group-hover:opacity-100"/></div>
            </div>
            <div className="flex justify-between mt-1 text-[11px] text-[#AAAAAA]"><span>{formatDuration(currentTime)}</span><span>{formatDuration(duration)}</span></div>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={toggleShuffle} className={shuffleMode?'text-[#FF0000]':'text-[#AAAAAA]'}><Shuffle size={20}/></button>
            <button onClick={playPrev} className="text-white"><SkipBack size={28} fill="white"/></button>
            <button onClick={togglePlay} className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-transform">{isPlaying?<Pause size={26} className="text-black" fill="black"/>:<Play size={26} className="text-black ml-1" fill="black"/>}</button>
            <button onClick={playNext} className="text-white"><SkipForward size={28} fill="white"/></button>
            <button onClick={cycleRepeat} className={repeatMode!=='none'?'text-[#FF0000]':'text-[#AAAAAA]'}>{repeatMode==='one'?<Repeat1 size={20}/>:<Repeat size={20}/>}</button>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <button onClick={()=>showToast('Added to playlist')} className="text-[#AAAAAA] hover:text-white"><ListPlus size={18}/></button>
            <button onClick={()=>showToast('Link copied!')} className="text-[#AAAAAA] hover:text-white"><Share2 size={18}/></button>
            <div className="hidden sm:flex items-center gap-2 ml-4"><button onClick={toggleMute} className="text-[#AAAAAA]">{isMuted?<VolumeX size={16}/>:<Volume2 size={16}/>}</button><input type="range" min="0" max="1" step="0.01" value={isMuted?0:volume} onChange={e=>setVolume(parseFloat(e.target.value))} className="w-24 h-1 appearance-none bg-white/20 rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"/></div>
          </div>
        </div>
        {/* Right - Lyrics */}
        {songLyrics&&<div className="hidden lg:flex flex-col w-[380px] border-l border-white/10 p-6 overflow-y-auto">
          <h3 className="text-sm font-semibold text-white mb-4">Lyrics</h3>
          <div className="space-y-3">{songLyrics.map((line,i)=><p key={i} className={`text-sm transition-all ${i===currentLineIdx?'text-white text-base font-medium':'text-[#717171]'}`}>{line}</p>)}</div>
        </div>}
      </div>
    </div>
  );
}
