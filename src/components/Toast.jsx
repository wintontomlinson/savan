import { usePlayer } from '../context/PlayerContext';

export default function Toast() {
  const { toasts } = usePlayer();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-24 md:bottom-20 left-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto animate-toastIn max-w-md mx-auto sm:mx-0 sm:ml-auto">
          <div className={`px-4 py-3 rounded-xl border shadow-2xl shadow-black/60 backdrop-blur-xl flex items-center gap-3 ${
            t.type === 'error' ? 'bg-red-500/20 border-red-500/30 text-red-300' :
            t.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' :
            'bg-white/[0.08] border-white/[0.12] text-white'
          }`}>
            <span className="flex-1 text-sm font-medium">{t.msg}</span>
          </div>
        </div>
      ))}
    </div>
  );
}