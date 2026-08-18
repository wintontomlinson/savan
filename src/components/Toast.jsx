import { usePlayer } from '../context/PlayerContext';
import { CheckCircle, Info, X } from 'lucide-react';

export default function Toast() {
  const { toasts, dismissToast } = usePlayer();
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-28 md:bottom-24 left-1/2 -translate-x-1/2 z-[100] space-y-2 w-[85%] max-w-[280px]">
      {toasts.map(t => (
        <div key={t.id} className="flex items-center gap-2.5 bg-[#1a1a1a] border border-white/[0.06] px-4 py-3 rounded-2xl shadow-2xl shadow-black/40 animate-scale">
          {t.type === 'success' ? <CheckCircle size={15} className="text-emerald-400 shrink-0" /> : <Info size={15} className="text-[#888] shrink-0" />}
          <span className="text-[12px] text-white flex-1 font-medium">{t.msg}</span>
          <button onClick={() => dismissToast(t.id)} className="text-[#555] shrink-0 btn-press"><X size={13} /></button>
        </div>
      ))}
    </div>
  );
}
