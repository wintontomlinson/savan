import { useRef } from 'react';
import { ChevronRight } from 'lucide-react';

export default function HorizontalScroll({ title, children }) {
  const ref = useRef(null);
  return (
    <section className="mb-7 animate-in">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[15px] sm:text-[17px] font-bold text-white">{title}</h2>
        <button onClick={() => ref.current?.scrollBy({ left: 200, behavior: 'smooth' })}
          className="text-[12px] text-[#FF0000] font-medium flex items-center gap-0.5 active:opacity-60">
          More <ChevronRight size={14} />
        </button>
      </div>
      <div ref={ref} className="flex gap-3 sm:gap-4 scroll-x pb-1">{children}</div>
    </section>
  );
}
