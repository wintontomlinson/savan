import { ListMusic, X } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration } from '../data/format';

export default function QueuePanel() {
  const { queueOpen, setQueueOpen, queue, playSong, removeFromQueue } = usePlayer();
  if (!queueOpen) return null;

  return (
    <aside className="a-slide-right hidden w-[320px] shrink-0 flex-col overflow-hidden rounded-2xl border border-hair bg-surface lg:flex">
      <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-hair px-4">
        <div className="flex items-center gap-2"><ListMusic size={16} className="text-accent" /><h2 className="text-[13.5px] font-bold">Queue</h2></div>
        <button onClick={() => setQueueOpen(false)} aria-label="Close queue" className="press rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white"><X size={16} /></button>
      </div>
      <div className="scroll-y flex-1 px-3 py-3">
        {queue.length === 0 ? (
          <div className="px-2 py-10 text-center"><ListMusic size={22} className="mx-auto mb-2 text-white/12" /><p className="text-[12px] text-white/35">Queue is empty</p></div>
        ) : (
          <ul className="space-y-0.5">
            {queue.map((song, index) => (
              <li key={`${song.id}-${index}`} className="group flex items-center gap-2.5 rounded-xl p-2 transition-colors hover:bg-white/[0.05]">
                <button onClick={() => playSong(song, queue)} className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
                  <img src={song.thumbnail} alt="" className="h-9 w-9 shrink-0 rounded-md object-cover" loading="lazy" />
                  <span className="min-w-0 flex-1"><span className="block truncate text-[12px] font-medium text-white/85">{song.title}</span><span className="block truncate text-[10.5px] text-white/35">{song.artist}</span></span>
                </button>
                <span className="shrink-0 text-[10px] tabular-nums text-white/25 group-hover:hidden">{formatDuration(song.duration)}</span>
                <button onClick={() => removeFromQueue(index)} aria-label={`Remove ${song.title} from queue`} className="press hidden shrink-0 rounded-md p-1 text-white/40 hover:text-white group-hover:block"><X size={13} /></button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
