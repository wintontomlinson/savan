import { useState, useEffect, useRef } from 'react';
import { Shuffle, Play, LoaderCircle } from 'lucide-react';
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

      // Surface the artists that actually appear in these collections, keeping
      // one of their tracks around as artwork for the avatar.
      const artwork = {};
      pairs
        .flatMap(([, songs]) => songs)
        .forEach((song) => {
          (song.artist || '')
            .split(',')
            .map((n) => n.trim())
            .filter(Boolean)
            .forEach((name) => {
              if (!artwork[name]) artwork[name] = song.thumbnail;
            });
        });
      const names = Object.keys(artwork).slice(0, 14);
      const profiles = await Promise.all(names.map((name) => searchArtists(name, 1).then((r) => r[0]).catch(() => null)));
      if (cancelled) return;
      setArtists(profiles.filter(Boolean).map((p) => ({ ...p, art: artwork[p.name] || '' })));
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

  return (
    <div className="discover-page pt-5 sm:pt-7">
      <header className="discover-intro"><h1>Discover</h1></header>

      <section className="discover-genre-section">
        <div className="discover-genre-grid">
          {COLLECTIONS.map((c, index) => (
            <button
              key={c.id}
              onClick={() => openCollection(c)}
              className={`discover-genre-card lift ${index === 0 ? 'discover-genre-card-featured' : ''}`}
              style={{ background: `linear-gradient(145deg, ${c.from} 0%, ${c.to} 100%)` }}
            >
              <p>{c.label}</p>
              {collections[c.id]?.[0]?.thumbnail && <img src={collections[c.id][0].thumbnail} alt="" loading="lazy" />}
              <span className="discover-genre-shade" />
            </button>
          ))}
        </div>
      </section>

      {/* Artists */}
      <section className="mb-10">
        <div className="mb-3.5">
          <h2 className="text-[17px] font-bold tracking-tight sm:text-[19px]">Artists</h2>
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
                fallbackImage={a.art}
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
            <img
              src={activeArtist.img || activeArtist.art || artistSongs[0]?.thumbnail}
              alt=""
              className="h-14 w-14 rounded-full bg-surface-3 object-cover ring-2 ring-white/10"
            />
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
