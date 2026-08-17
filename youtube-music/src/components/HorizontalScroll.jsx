import{useRef}from'react';
import{ChevronLeft,ChevronRight}from'lucide-react';

export default function HorizontalScroll({title,seeAll,children}){
  const ref=useRef(null);
  const scroll=(d)=>ref.current?.scrollBy({left:d==='l'?-300:300,behavior:'smooth'});
  return(
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <div className="flex items-center gap-2">
          {seeAll&&<button className="text-xs text-[#AAAAAA] hover:text-white">See all</button>}
          <button onClick={()=>scroll('l')} className="hidden sm:flex w-7 h-7 items-center justify-center rounded-full bg-white/5 hover:bg-white/10"><ChevronLeft size={16} className="text-white"/></button>
          <button onClick={()=>scroll('r')} className="hidden sm:flex w-7 h-7 items-center justify-center rounded-full bg-white/5 hover:bg-white/10"><ChevronRight size={16} className="text-white"/></button>
        </div>
      </div>
      <div ref={ref} className="flex gap-4 overflow-x-auto scroll-smooth pb-2" style={{scrollbarWidth:'none'}}>{children}</div>
    </section>
  );
}
