import{Play,Pause,SkipBack,SkipForward,Shuffle,Repeat,Repeat1,Heart,Volume2,VolumeX,Maximize2,ListMusic}from'lucide-react';
import{usePlayer}from'../context/PlayerContext';
import{formatDuration}from'../data/mockData';

export default function MiniPlayer(){
  const{currentSong,isPlaying,togglePlay,playNext,playPrev,currentTime,duration,seekTo,volume,setVolume,isMuted,toggleMute,shuffleMode,toggleShuffle,repeatMode,cycleRepeat,toggleLike,likedSongs,setExpanded,setQueueOpen}=usePlayer();

  if(!currentSong)return(
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-[#212121] border-t border-[#383838] z-40 flex items-center justify-center md:pl-[72px] lg:pl-[240px]">
      <p className="text-sm text-[#717171]">Play a song to start listening</p>
    </div>
  );

  const liked=likedSongs.includes(currentSong.id);
  const progress=duration>0?(currentTime/duration)*100:0;

  return(
    <div className="fixed bottom-0 md:bottom-0 left-0 right-0 h-20 bg-[#212121] border-t border-[#383838] z-40 flex items-center px-4 md:pl-[88px] lg:pl-[256px] gap-3">
      {/* Left */}
      <div className="flex items-center gap-3 w-[30%] min-w-0">
        <img src={currentSong.thumbnail} alt="" className="w-14 h-14 rounded-lg object-cover cursor-pointer shrink-0 shadow-md" onClick={()=>setExpanded(true)}/>
        <div className="min-w-0 hidden sm:block">
          <p className="text-sm font-medium text-white truncate">{currentSong.title}</p>
          <p className="text-xs text-[#AAAAAA] truncate">{currentSong.artist}</p>
        </div>
        <button onClick={()=>toggleLike(currentSong.id)} className={`shrink-0 hidden sm:block ${liked?'text-[#FF0000]':'text-[#717171] hover:text-white'}`}><Heart size={16} fill={liked?'currentColor':'none'}/></button>
      </div>
      {/* Center */}
      <div className="flex-1 flex flex-col items-center gap-1 max-w-[600px] mx-auto">
        <div className="flex items-center gap-4">
          <button onClick={toggleShuffle} className={`hidden sm:block ${shuffleMode?'text-[#FF0000]':'text-[#AAAAAA] hover:text-white'}`}><Shuffle size={16}/></button>
          <button onClick={playPrev} className="text-white hover:text-[#FF0000]"><SkipBack size={18} fill="currentColor"/></button>
          <button onClick={togglePlay} className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform">
            {isPlaying?<Pause size={18} className="text-black" fill="black"/>:<Play size={18} className="text-black ml-0.5" fill="black"/>}
          </button>
          <button onClick={playNext} className="text-white hover:text-[#FF0000]"><SkipForward size={18} fill="currentColor"/></button>
          <button onClick={cycleRepeat} className={`hidden sm:block ${repeatMode!=='none'?'text-[#FF0000]':'text-[#AAAAAA] hover:text-white'}`}>{repeatMode==='one'?<Repeat1 size={16}/>:<Repeat size={16}/>}</button>
        </div>
        <div className="flex items-center gap-2 w-full">
          <span className="text-[10px] text-[#717171] w-8 text-right">{formatDuration(currentTime)}</span>
          <div className="flex-1 h-1 bg-[#383838] rounded-full cursor-pointer group relative" onClick={e=>{const r=e.currentTarget.getBoundingClientRect();seekTo((e.clientX-r.left)/r.width*duration);}}>
            <div className="h-full bg-[#FF0000] rounded-full relative" style={{width:`${progress}%`}}>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow"/>
            </div>
          </div>
          <span className="text-[10px] text-[#717171] w-8">{formatDuration(duration)}</span>
        </div>
      </div>
      {/* Right */}
      <div className="hidden md:flex items-center gap-2 w-[25%] justify-end">
        <button onClick={()=>setQueueOpen(p=>!p)} className="p-1.5 text-[#AAAAAA] hover:text-white"><ListMusic size={16}/></button>
        <button onClick={toggleMute} className="p-1.5 text-[#AAAAAA] hover:text-white">{isMuted?<VolumeX size={16}/>:<Volume2 size={16}/>}</button>
        <input type="range" min="0" max="1" step="0.01" value={isMuted?0:volume} onChange={e=>setVolume(parseFloat(e.target.value))} className="w-20 h-1 rounded-full appearance-none bg-[#383838] cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"/>
        <button onClick={()=>setExpanded(true)} className="p-1.5 text-[#AAAAAA] hover:text-white"><Maximize2 size={16}/></button>
      </div>
    </div>
  );
}
