import { useState } from 'react';
import { Play } from 'lucide-react';

export default function ArtistCircle({ name, image, active, onClick }) {
  const [broken, setBroken] = useState(false);

  return (
    <button
      onClick={onClick}
      className="group flex w-[86px] shrink-0 flex-col items-center gap-2 sm:w-[100px]"
      aria-label={`Play ${name}`}
    >
      <div
        className={`relative h-[86px] w-[86px] overflow-hidden rounded-full bg-surface-3 transition-all duration-300 sm:h-[100px] sm:w-[100px] ${
          active ? 'ring-2 ring-accent' : 'ring-1 ring-white/[0.08] group-hover:ring-white/20'
        }`}
      >
        {broken || !image ? (
          <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-surface-4 to-surface-2 text-[26px] font-bold text-white/35">
            {name?.charAt(0)?.toUpperCase() || '?'}
          </span>
        ) : (
          <img
            src={image}
            alt=""
            onError={() => setBroken(true)}
            className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-[0.6]"
            loading="lazy"
          />
        )}
        <span
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
            active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-full shadow-xl ${active ? 'bg-accent' : 'bg-white'}`}
          >
            <Play size={14} fill={active ? 'white' : 'black'} className={`ml-0.5 ${active ? 'text-white' : 'text-black'}`} />
          </span>
        </span>
      </div>
      <span
        className={`w-full truncate text-center text-[11.5px] font-semibold ${
          active ? 'text-accent' : 'text-white/70 group-hover:text-white'
        }`}
      >
        {name}
      </span>
    </button>
  );
}
