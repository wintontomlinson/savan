import { usePlayer } from '../context/PlayerContext';
import { CheckCircle, Info, X } from 'lucide-react';

export default function Toast() {
  const { toasts, dismissToast } = usePlayer();
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-28 md:bottom-24 left-1/2 -translate-x-1/2 z-[100] space-y-2 w-[90%] max-w-[300px]">
      {toasts.map(t => (
        <div key={t.id} className="flex items-center gap-2 bg-[#222] border border-[#333] px-4 py-3 rounded-2xl shadow-2xl animate-scale">
          {t.type === 'success' ? <CheckCircle size={16} className="text-green-400 shrink-0" /> : <Info size={16} className="text-[#888] shrink-0" />}
          <span className="text-[13px] text-white flex-1">{t.msg}</span>
          <button onClick={() => dismissToast(t.id)} className="text-[#555] shrink-0"><X size={14} /></button>
        </div>
      ))}
    </div>
  );
}
