import { usePlayer } from '../context/PlayerContext';
import { Check, Heart, Music, Download, ListPlus, Moon, X } from 'lucide-react';

// Smart icon selection based on message content
function getToastIcon(msg, type) {
  const m = msg.toLowerCase();
  if (m.includes('liked') || m.includes('❤')) return { icon: Heart, color: 'text-rose-400', bg: 'bg-rose-500/15' };
  if (m.includes('download') || m.includes('saving') || m.includes('offline') || m.includes('saved')) return { icon: Download, color: 'text-blue-400', bg: 'bg-blue-500/15' };
  if (m.includes('queue')) return { icon: ListPlus, color: 'text-violet-400', bg: 'bg-violet-500/15' };
  if (m.includes('sleep') || m.includes('night') || m.includes('🌙')) return { icon: Moon, color: 'text-indigo-400', bg: 'bg-indigo-500/15' };
  if (type === 'success' || m.includes('✓') || m.includes('✔')) return { icon: Check, color: 'text-emerald-400', bg: 'bg-emerald-500/15' };
  return { icon: Music, color: 'text-white/50', bg: 'bg-white/[0.06]' };
}

export default function Toast() {
  const { toasts, dismissToast } = usePlayer();
  if (!toasts.length) return null;

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[200] space-y-2 pointer-events-none" style={{ width: 'min(88%, 320px)' }}>
      {toasts.map(t => {
        const { icon: Icon, color, bg } = getToastIcon(t.msg, t.type);
        return (
          <div key={t.id} 
            className="pointer-events-auto flex items-center gap-3 bg-[#1a1a1a] border border-white/[0.06] pl-3 pr-2 py-2.5 rounded-full shadow-2xl shadow-black/50 animate-[toastIn_0.35s_cubic-bezier(0.16,1,0.3,1)_both]">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${bg}`}>
              <Icon size={13} className={color} />
            </div>
            <span className="text-[12px] text-white/85 flex-1 font-medium truncate">{t.msg}</span>
            <button onClick={() => dismissToast(t.id)} className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 hover:bg-white/[0.08] transition-colors active:scale-90">
              <X size={10} className="text-white/30" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
