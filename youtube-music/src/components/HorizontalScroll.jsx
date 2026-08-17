import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HorizontalScroll({ title, children }) {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'left' ? -250 : 250, behavior: 'smooth' });
    }
  };

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base sm:text-lg font-bold text-white">{title}</h2>
        <div className="flex gap-1.5 hidden sm:flex">
          <button onClick={() => scroll('left')} className="p-1 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
            <ChevronLeft size={16} className="text-white" />
          </button>
          <button onClick={() => scroll('right')} className="p-1 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
            <ChevronRight size={16} className="text-white" />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto pb-1 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>
    </section>
  );
}
