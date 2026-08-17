import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HorizontalScroll({ title, children, className = '' }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className={`mb-8 ${className}`}>
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-xl sm:text-2xl font-bold text-white">{title}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-all duration-200 hover:scale-110 btn-press"
          >
            <ChevronLeft size={18} className="text-white" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-all duration-200 hover:scale-110 btn-press"
          >
            <ChevronRight size={18} className="text-white" />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 px-2 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>
    </section>
  );
}
