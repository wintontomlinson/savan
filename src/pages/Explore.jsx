import { useState, useEffect, useRef } from 'react';
import { Shuffle, Play, X, LoaderCircle } from 'lucide-react';
import { searchSongs, searchArtists, getPlaylistById } from '../data/api';
import { COLLECTIONS } from '../data/catalog';
import { usePlayer } from '../context/PlayerContext';
import SongCard from '../components/SongCard';
import SongList from '../components/SongList';
import Shelf from '../components/Shelf';
import ArtistCircle from '../components/ArtistCircle';

export default function Explore() {
  const { playSong, playShuffled } = usePlayer();
  const [collections, setCollections] = useState({});
  const [loading, setLoading] = useState(true);
  const [artists, setArtists] = useState([]);
  const [artistsLoading, setArtistsLoading] = useState(true);
  const [activeArtist, setActiveArtist] = useState(null);
  const [artistSongs, setArtistSongs] = useState([]);
  const [artistLoading, setArtistLoading] = useState(false);
  const detailRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const pairs = await Promise.all(
        COLLECTIONS.map(async (c) => [c.id, (await getPlaylistById(c.playlistId)) || []]),
      );
      if (cancelled) return;
      setCollections(Object.fromEntries(pairs));
      setLoading(false);

      // Surface the artists that actually appear in these collections.
      const names = [
        ...new Set(
          pairs
            .flatMap(([, songs]) => songs)
            .flatMap((song) => (song.artist || '').split(',').map((n) => n.trim()))
            .filter(Boolean),
        ),
      ].slice(0, 14);
      const profiles = await Promise.all(names.map((name) => searchArtists(name, 1).then((r) => r[0]).catch(() => null)));
      if (cancelled) return;
      setArtists(profiles.filter(Boolean));
      setArtistsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const openCollection = async (collection) => {
    const fresh = (await searchSongs(collection.query, 30)) || collections[collection.id] || [];
    if (fresh.length) playShuffled(fresh);
  };

  const openArtist = async (artist) => {
    if (activeArtist?.name === artist.name) {
      setActiveArtist(null);
      setArtistSongs([]);
      return;
    }
    setActiveArtist(artist);
    setArtistLoading(true);
    const songs = (await searchSongs(artist.name, 24)) || [];
    setArtistSongs(songs);
    setArtistLoading(false);
    detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const everything = [...new Map(Object.values(collections).flat().map((s) => [s.id, s])).values()];

  return (
    <div className="pt-6">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-[10.5px] font-bold uppercase tracking-[0.18em] text-accent">Browse</p>
          <h1 className="text-[26px] font-bold tracking-tight sm:text-[32px]">Explore music</h1>
          <p className="mt-1 text-[13px] text-white/40">Genres, moods and the artists behind them.</p>
        </div>
        {everything.length > 0 && (
          <button
            onClick={() => playShuffled(everything)}
            className="press flex shrink-0 items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[12px] font-bold text-black transition-transform hover:scale-[1.03]"
          >
            <Shuffle size={14} /> Discovery mix
          </button>
        )}
      </header>

      {/* Genre tiles */}
      <section className="mb-10">
        <h2 className="mb-3.5 text-[17px] font-bold tracking-tight sm:text-[19px]">Browse all</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {COLLECTIONS.map((c) => (
            <button
              key={c.id}
              onClick={() => openCollection(c)}
              className="lift relative h-[112px] overflow-hidden rounded-xl p-3.5 text-left"
              style={{ background: `linear-gradient(145deg, ${c.from} 0%, ${c.to} 100%)` }}
            >
              <p className="relative z-10 max-w-[70%] text-[14.5px] font-bold leading-tight drop-shadow">{c.label}</p>
              {collections[c.id]?.[0]?.thumbnail && (
                <img
                  src={collections[c.id][0].thumbnail}
                  alt=""
                  className="absolute -bottom-2 -right-4 h-[72px] w-[72px] rotate-[25deg] rounded-md object-cover shadow-2xl shadow-black/50"
                  loading="lazy"
                />
              )}
              <span className="absolute inset-0 bg-black/10" />
            </button>
          ))}
        </div>
      </section>

      {/* Artists */}
      <section className="mb-10">
        <div className="mb-3.5 flex items-end justify-between">
          <div>
            <h2 className="text-[17px] font-bold tracking-tight sm:text-[19px]">Artists in rotation</h2>
            <p className="mt-0.5 text-[11.5px] text-white/35">Tap one to load their tracks below.</p>
          </div>
          {!artistsLoading && <span className="text-[11.5px] text-white/30">{artists.length} artists</span>}
        </div>
        {artistsLoading ? (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="shrink-0">
                <div className="skeleton h-[86px] w-[86px] rounded-full sm:h-[100px] sm:w-[100px]" />
              </div>
            ))}
          </div>
        ) : (
          <div className="scroll-x flex gap-4 pb-1">
            {artists.map((a) => (
              <ArtistCircle
                key={a.id || a.name}
                name={a.name}
                image={a.img}
                active={activeArtist?.name === a.name}
                onClick={() => openArtist(a)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Artist detail */}
      {activeArtist && (
        <section ref={detailRef} className="a-fade-up mb-10">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <img src={activeArtist.img} alt="" className="h-14 w-14 rounded-full object-cover ring-2 ring-white/10" />
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-[19px] font-bold tracking-tight">{activeArtist.name}</h2>
              <p className="text-[11.5px] text-white/35">
                {artistLoading ? 'Loading tracks…' : `${artistSongs.length} tracks`}
              </p>
            </div>
            {artistSongs.length > 0 && (
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => playShuffled(artistSongs)}
                  aria-label="Shuffle artist"
                  className="press flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.08] hover:bg-white/[0.14]"
                >
                  <Shuffle size={14} />
                </button>
                <button
                  onClick={() => playSong(artistSongs[0], artistSongs)}
                  className="press flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-[12px] font-bold text-white"
                >
                  <Play size={13} fill="white" /> Play all
                </button>
                <button
                  onClick={() => {
                    setActiveArtist(null);
                    setArtistSongs([]);
                  }}
                  aria-label="Close artist"
                  className="press flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.08] text-white/55 hover:bg-white/[0.14]"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
          {artistLoading ? (
            <div className="flex justify-center py-10">
              <LoaderCircle size={20} className="animate-spin text-white/40" />
            </div>
          ) : (
            <SongList songs={artistSongs} />
          )}
        </section>
      )}

      {/* Collection shelves */}
      {loading
        ? Array.from({ length: 3 }).map((_, row) => (
            <div key={row} className="mb-9">
              <div className="skeleton mb-4 h-4 w-36" />
              <div className="flex gap-4 overflow-hidden">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="w-[144px] shrink-0 sm:w-[164px]">
                    <div className="skeleton mb-2.5 aspect-square rounded-xl" />
                    <div className="skeleton mb-1.5 h-3 w-3/4" />
                    <div className="skeleton h-2.5 w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          ))
        : COLLECTIONS.map((c) => {
            const songs = collections[c.id] || [];
            if (!songs.length) return null;
            return (
              <Shelf key={c.id} title={c.label} seeAllTo={`/search?q=${encodeURIComponent(c.query)}`}>
                {songs.map((song) => (
                  <SongCard key={song.id} song={song} songList={songs} />
                ))}
              </Shelf>
            );
          })}
    </div>
  );
}
