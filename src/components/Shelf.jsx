import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export default function Shelf({ title, seeAllTo, children, className = '' }) {
  return (
    <section className={`content-shelf mb-11 ${className}`}>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div className="min-w-0"><p className="shelf-kicker">Curated collection</p><h2 className="truncate text-[20px] font-extrabold tracking-[-0.04em] sm:text-[23px]">{title}</h2></div>
        {seeAllTo && <Link to={seeAllTo} className="shelf-link shrink-0">See all <ArrowUpRight size={14} /></Link>}
      </div>
      <div className="scroll-x stagger flex gap-4 pb-2 sm:gap-5">{children}</div>
    </section>
  );
}
