import { Link } from 'react-router-dom';

export default function Shelf({ title, seeAllTo, children, className = '' }) {
  return (
    <section className={`mb-9 ${className}`}>
      <div className="mb-3.5 flex items-end justify-between gap-4">
        <h2 className="min-w-0 truncate text-[17px] font-bold tracking-tight sm:text-[19px]">{title}</h2>
        {seeAllTo && <Link to={seeAllTo} className="shrink-0 text-[12px] font-semibold text-accent transition-opacity hover:opacity-80">See all</Link>}
      </div>
      <div className="scroll-x stagger flex gap-3.5 pb-1 sm:gap-4">{children}</div>
    </section>
  );
}
