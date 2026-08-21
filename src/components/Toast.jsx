import { Check, CircleAlert, Info, X } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

const STYLES = {
  success: { icon: Check, ring: 'border-emerald-400/25', tint: 'text-emerald-300' },
  error: { icon: CircleAlert, ring: 'border-red-400/25', tint: 'text-red-300' },
  info: { icon: Info, ring: 'border-hair-strong', tint: 'text-white/60' },
};

export default function Toast() {
  const { toasts, dismissToast } = usePlayer();
  if (!toasts.length) return null;

  return (
    <div className="pointer-events-none fixed bottom-[132px] left-0 right-0 z-[200] flex flex-col items-center gap-2 px-4 md:bottom-[96px]">
      {toasts.map((t) => {
        const style = STYLES[t.type] || STYLES.info;
        return (
          <div
            key={t.id}
            className={`a-pop chrome pointer-events-auto flex max-w-[400px] items-center gap-2.5 rounded-full border py-2.5 pl-4 pr-2.5 shadow-2xl shadow-black/60 ${style.ring}`}
          >
            <style.icon size={15} className={`shrink-0 ${style.tint}`} />
            <span className="text-[12.5px] font-medium">{t.msg}</span>
            <button
              onClick={() => dismissToast(t.id)}
              aria-label="Dismiss"
              className="press rounded-full p-1 text-white/30 hover:text-white"
            >
              <X size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
