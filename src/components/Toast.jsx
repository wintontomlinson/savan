import { usePlayer } from '../context/PlayerContext';
import { CheckCircle, Info, AlertCircle, X } from 'lucide-react';

export default function Toast() {
  const { toasts, dismissToast } = usePlayer();
  if (!toasts.length) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] space-y-2.5 w-[90%] max-w-[340px] pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} 
          className="pointer-events-auto flex items-center gap-3 bg-[#1c1c1e]/95 backdrop-blur-xl border border-white/[0.08] px-4 py-3.5 rounded-2xl shadow-2xl shadow-black/60 animate-[toastIn_0.4s_cubic-bezier(0.16,1,0.3,1)_both]">
          
          {/* Icon */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
            t.type === 'success' ? 'bg-emerald-500/15' : 
            t.type === 'error' ? 'bg-red-500/15' : 'bg-white/[0.06]'
          }`}>
            {t.type === 'success' ? <CheckCircle size={16} className="text-emerald-400" /> : 
             t.type === 'error' ? <AlertCircle size={16} className="text-red-400" /> :
             <Info size={16} className="text-white/50" />}
          </div>

          {/* Message */}
          <span className="text-[13px] text-white/90 flex-1 font-medium leading-tight">{t.msg}</span>
          
          {/* Dismiss */}
          <button onClick={() => dismissToast(t.id)} className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0 hover:bg-white/[0.1] transition-colors active:scale-90">
            <X size={11} className="text-white/40" />
          </button>
        </div>
      ))}
    </div>
  );
}
