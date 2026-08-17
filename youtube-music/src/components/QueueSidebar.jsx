import { X, Trash2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration } from '../data/data';

export default function QueueSidebar() {
  const { isQueueOpen, setIsQueueOpen, currentSong, queue, removeFromQueue, clearQueue, playSong } = usePlayer();

  if (!isQueueOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 animate-fade-in" onClick={() => setIsQueueOpen(false)} />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-[340px] max-w-[85vw] bg-[#1F1F1F] border-l border-white/5 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">Queue</h2>
          <div className="flex gap-2">
            {queue.length > 0 && (
              <button onClick={clearQueue} className="p-2 rounded-full hover:bg-white/10 text-[#AAAAAA] hover:text-white">
                <Trash2 size={16} />
              </button>
            )}
            <button onClick={() => setIsQueueOpen(false)} className="p-2 rounded-full hover:bg-white/10">
              <X size={18} className="text-white" />
            </button>
          </div>
        </div>

        {/* Now Playing */}
        {currentSong && (
          <div className="p-4 border-b border-white/5">
            <p className="text-xs text-[#AAAAAA] uppercase mb-2">Now Playing</p>
            <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
              <img src={currentSong.image} alt="" className="w-11 h-11 rounded object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{currentSong.title}</p>
                <p className="text-xs text-[#AAAAAA] truncate">{currentSong.artist}</p>
              </div>
            </div>
          </div>
        )}

        {/* Queue */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-xs text-[#AAAAAA] uppercase mb-2">Up Next ({queue.length})</p>
          {queue.length === 0 ? (
            <p className="text-sm text-[#AAAAAA]/60 text-center py-8">Queue is empty</p>
          ) : (
            <div className="space-y-1">
              {queue.map((song, i) => (
                <div key={`${song.id}-${i}`} className="group flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer" onClick={() => playSong(song, queue)}>
                  <img src={song.image} alt="" className="w-9 h-9 rounded object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{song.title}</p>
                    <p className="text-xs text-[#AAAAAA] truncate">{song.artist}</p>
                  </div>
                  <span className="text-xs text-[#AAAAAA]">{formatDuration(song.duration)}</span>
                  <button onClick={(e) => { e.stopPropagation(); removeFromQueue(i); }} className="p-1 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-full">
                    <X size={12} className="text-[#AAAAAA]" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
