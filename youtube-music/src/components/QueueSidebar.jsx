import { X, GripVertical, Trash2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration } from '../data/data';

export default function QueueSidebar() {
  const { isQueueOpen, setIsQueueOpen, currentSong, queue, removeFromQueue, clearQueue, playSong } = usePlayer();

  if (!isQueueOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 animate-fade-in"
        onClick={() => setIsQueueOpen(false)}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-[350px] max-w-[90vw] bg-[#1F1F1F] border-l border-white/5 shadow-2xl flex flex-col overflow-hidden animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">Queue</h2>
          <div className="flex items-center gap-2">
            {queue.length > 0 && (
              <button
                onClick={clearQueue}
                className="p-2 rounded-full hover:bg-white/10 transition-all duration-200 text-[#AAAAAA] hover:text-white hover:scale-110 btn-press"
              >
                <Trash2 size={18} />
              </button>
            )}
            <button
              onClick={() => setIsQueueOpen(false)}
              className="p-2 rounded-full hover:bg-white/10 transition-all duration-200 hover:rotate-90 btn-press"
            >
              <X size={20} className="text-white" />
            </button>
          </div>
        </div>

        {/* Now Playing */}
        {currentSong && (
          <div className="p-4 border-b border-white/5 animate-fade-in-up">
            <p className="text-xs text-[#AAAAAA] uppercase font-medium mb-3">Now Playing</p>
            <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-[#FF0000]/20">
              <div className="relative">
                <img src={currentSong.image} alt="" className="w-12 h-12 rounded object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded">
                  <div className="flex items-end gap-0.5">
                    <div className="w-[2px] bg-[#FF0000] rounded-full animate-wave-1"></div>
                    <div className="w-[2px] bg-[#FF0000] rounded-full animate-wave-2"></div>
                    <div className="w-[2px] bg-[#FF0000] rounded-full animate-wave-3"></div>
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{currentSong.title}</p>
                <p className="text-xs text-[#AAAAAA] truncate">{currentSong.artist}</p>
              </div>
              <span className="text-xs text-[#AAAAAA]">{formatDuration(currentSong.duration)}</span>
            </div>
          </div>
        )}

        {/* Up Next */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-xs text-[#AAAAAA] uppercase font-medium mb-3">
            Up Next {queue.length > 0 && `(${queue.length})`}
          </p>
          {queue.length === 0 ? (
            <div className="text-center py-8 animate-fade-in">
              <p className="text-sm text-[#AAAAAA]">Queue is empty</p>
              <p className="text-xs text-[#AAAAAA]/70 mt-1">Add songs from the three-dot menu</p>
            </div>
          ) : (
            <div className="space-y-1 stagger-children">
              {queue.map((song, index) => (
                <div
                  key={`${song.id}-${index}`}
                  className="group flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-all duration-200 animate-fade-in-up cursor-pointer"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <GripVertical size={16} className="text-[#AAAAAA] flex-shrink-0 cursor-grab hover:text-white transition-colors" />
                  <img
                    src={song.image}
                    alt=""
                    className="w-10 h-10 rounded object-cover flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
                    onClick={() => playSong(song, queue)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate group-hover:text-[#FF0000] transition-colors duration-200">{song.title}</p>
                    <p className="text-xs text-[#AAAAAA] truncate">{song.artist}</p>
                  </div>
                  <span className="text-xs text-[#AAAAAA]">{formatDuration(song.duration)}</span>
                  <button
                    onClick={() => removeFromQueue(index)}
                    className="p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white/10 hover:rotate-90"
                  >
                    <X size={14} className="text-[#AAAAAA]" />
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
