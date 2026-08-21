import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Horizontal section: Apple Music heading + "See all", Spotify scroll arrows.
 */
export default function Shelf({ title, subtitle, seeAllTo, children, className = '' }) {
  const ref = useRef(null);
  const nudge = (dir) => ref.current?.scrollBy({ left: dir * 480, behavior: 'smooth' });

  return (
    <section className={`mb-9 ${className}`}>
      <div className="mb-3.5 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="truncate text-[17px] font-bold tracking-tight sm:text-[19px]">{title}</h2>
          {subtitle && <p className="mt-0.5 truncate text-[11.5px] text-white/35">{subtitle}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {seeAllTo && (
            <Link
              to={seeAllTo}
              className="text-[12px] font-semibold text-accent transition-opacity hover:opacity-80"
            >
              See all
            </Link>
          )}
          <div className="hidden items-center gap-1 sm:flex">
            <button
              onClick={() => nudge(-1)}
              aria-label="Scroll left"
              className="press flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06] text-white/55 transition-colors hover:bg-white/[0.12] hover:text-white"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              onClick={() => nudge(1)}
              aria-label="Scroll right"
              className="press flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06] text-white/55 transition-colors hover:bg-white/[0.12] hover:text-white"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
      <div ref={ref} className="scroll-x stagger flex gap-3.5 pb-1 sm:gap-4">
        {children}
      </div>
    </section>
  );
}
