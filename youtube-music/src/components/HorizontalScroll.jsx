import { useRef } from 'react';
import { ChevronRight } from 'lucide-react';

export default function HorizontalScroll({ title, children }) {
  const scrollRef = useRef(null);

  return (
    <section className="mb-7">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[17px] sm:text-[19px] font-bold text-white">{title}</h2>
        <button
          onClick={() => scrollRef.current?.scrollBy({ left: 250, behavior: 'smooth' })}
          className="text-[#FC3C44] text-[13px] font-medium flex items-center gap-0.5 hover:opacity-70 transition-opacity"
        >
          See All <ChevronRight size={14} />
        </button>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-3.5 overflow-x-auto scroll-smooth"
        style={{ scrollbarWidth: 'none' }}
      >
        {children}
      </div>
    </section>
  );
}
