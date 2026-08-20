import { useRef } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

export default function HorizontalScroll({ title, children }) {
  const ref = useRef(null);
  const scroll = (dir) => ref.current?.scrollBy({ left: dir * 250, behavior: 'smooth' });

  return (
    <section className="mb-8 animate-in">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[15px] sm:text-[17px] font-bold text-white">{title}</h2>
        <div className="flex items-center gap-1">
          <button onClick={() => scroll(-1)} className="w-7 h-7 rounded-full bg-white/[0.04] flex items-center justify-center hover:bg-white/[0.08] transition-all duration-200 active:scale-90 hidden sm:flex">
            <ChevronLeft size={14} className="text-white/50" />
          </button>
          <button onClick={() => scroll(1)} className="w-7 h-7 rounded-full bg-white/[0.04] flex items-center justify-center hover:bg-white/[0.08] transition-all duration-200 active:scale-90 hidden sm:flex">
            <ChevronRight size={14} className="text-white/50" />
          </button>
        </div>
      </div>
      <div ref={ref} className="flex gap-3 sm:gap-4 scroll-x pb-1 stagger">{children}</div>
    </section>
  );
}
