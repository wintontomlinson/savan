import { useRef } from 'react';
import { ChevronRight } from 'lucide-react';

export default function HorizontalScroll({ title, children, subtitle }) {
  const ref = useRef(null);
  return (
    <section className="mb-8 animate-in">
      <div className="flex items-baseline justify-between mb-3 px-1">
        <div>
          <h2 className="text-[15px] sm:text-[17px] font-semibold text-white">{title}</h2>
          {subtitle && <p className="text-[11px] text-[#71717A] mt-0.5">{subtitle}</p>}
        </div>
        <button onClick={() => ref.current?.scrollBy({ left: 240, behavior: 'smooth' })}
          className="text-[12px] text-[#A1A1AA] hover:text-white flex items-center gap-0.5 transition-fast">
          See all <ChevronRight size={13} />
        </button>
      </div>
      <div ref={ref} className="flex gap-3 sm:gap-4 scroll-x pb-1 -mx-1 px-1">{children}</div>
    </section>
  );
}
