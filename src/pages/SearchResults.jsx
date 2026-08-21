import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  X,
  Play,
  LoaderCircle,
  SearchX,
  Clock,
  Trash2,
  Shuffle,
  ChevronLeft,
  Disc3,
  Music4,
  UserRound,
} from 'lucide-react';
import { searchSongs, searchArtists, searchAlbums, getAlbumById } from '../data/api';
import { COLLECTIONS } from '../data/catalog';
import { usePlayer } from '../context/PlayerContext';
import { getHistory } from '../data/algorithm';
import SongList from '../components/SongList';
import SongCard from '../components/SongCard';
import Shelf from '../components/Shelf';
import ChipRow from '../components/ChipRow';
import ArtistCircle from '../components/ArtistCircle';

const TABS = [
  { id: 'songs', label: 'Songs', icon: Music4 },
  { id: 'artists', label: 'Artists', icon: UserRound },
  { id: 'albums', label: 'Albums', icon: Disc3 },
];

export default function SearchResults() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const { playSong, playShuffled, showToast } = usePlayer();

  const [query, setQuery] = useState(q);
  const [tab, setTab] = useState('songs');
  const [results, setResults] = useState({ songs: [], artists: [], albums: [] });
  const [loading, setLoading] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [album, setAlbum] = useState(null);
  const [albumLoading, setAlbumLoading] = useState(false);
  const [recents, setRecents] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ma_recent_searches')) || [];
    } catch {
      return [];
    }
  });

  const inputRef = useRef(null);
  const requestId = useRef(0);
  const suggestTimer = useRef(null);

  const history = getHistory();
  const historyArtists = (() => {
    const seen = new Set();
    const out = [];
    for (const song of history.slice(0, 60)) {
      const name = song.artist?.split(',')[0]?.trim();
      if (name && !seen.has(name)) {
        seen.add(name);
        out.push({ name, img: song.thumbnail });
      }
      if (out.length >= 10) break;
    }
    return out;
  })();

  useEffect(() => setQuery(q), [q]);
  useEffect(() => {
    if (!q) inputRef.current?.focus();
  }, [q]);

  const runSearch = useCallback(
    async (term, which) => {
      if (!term.trim()) return;
      setLoading(true);
      setEmpty(false);
      setSuggestOpen(false);
      setAlbum(null);

      const id = ++requestId.current;
      const fetcher =
        which === 'artists'
          ? searchArtists(term, 24)
          : which === 'albums'
            ? searchAlbums(term, 24)
            : searchSongs(term, 30);
      const data = (await fetcher) || [];
      if (id !== requestId.current) return;

      setResults((prev) => ({ ...prev, [which]: data }));
      setEmpty(data.length === 0);
      setLoading(false);
    },
    [],
  );

  // Run whenever the query or the active tab changes.
  useEffect(() => {
    if (!q) {
      setResults({ songs: [], artists: [], albums: [] });
      setEmpty(false);
      return;
    }
    setRecents((prev) => {
      const next = [q, ...prev.filter((s) => s !== q)].slice(0, 12);
      try {
        localStorage.setItem('ma_recent_searches', JSON.stringify(next));
      } catch {}
      return next;
    });
    runSearch(q, tab);
  }, [q, tab, runSearch]);

  // Debounced inline suggestions.
  useEffect(() => {
    if (query.trim().length < 2 || query === q) {
      setSuggestions([]);
      setSuggestOpen(false);
      return;
    }
    setSuggestOpen(true);
    if (suggestTimer.current) clearTimeout(suggestTimer.current);
    suggestTimer.current = setTimeout(async () => {
      setSuggestions((await searchSongs(query, 6)) || []);
    }, 280);
    return () => clearTimeout(suggestTimer.current);
  }, [query, q]);

  const submit = (e) => {
    e.preventDefault();
    const term = query.trim();
    if (term) setParams({ q: term });
  };

  const jumpTo = (term) => {
    setQuery(term);
    setParams({ q: term });
  };

  const clearAll = () => {
    setQuery('');
    setParams({});
    setResults({ songs: [], artists: [], albums: [] });
    setEmpty(false);
    setAlbum(null);
    inputRef.current?.focus();
  };

  const openAlbum = async (item) => {
    setAlbumLoading(true);
    const detail = await getAlbumById(item.id);
    setAlbumLoading(false);
    if (detail?.songs?.length) setAlbum(detail);
    else showToast('Could not load that album', 'error');
  };

  const songs = results.songs;

  return (
    <div className="pt-6">
      {/* Search field */}
      <div className="sticky top-0 z-20 -mx-4 mb-6 bg-surface/95 px-4 pb-4 pt-1 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <form onSubmit={submit} className="relative">
          <div className="flex items-center rounded-2xl border border-hair bg-surface-2 transition-colors focus-within:border-hair-strong focus-within:bg-surface-3">
            <Search size={18} className="ml-4 shrink-0 text-white/35" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.trim().length >= 2 && query !== q && setSuggestOpen(true)}
              placeholder="Songs, artists, albums"
              className="w-full bg-transparent px-3.5 py-4 text-[15px] font-medium placeholder:text-white/25 focus:outline-none"
              autoComplete="off"
              spellCheck="false"
            />
            {query && (
              <button
                type="button"
                onClick={clearAll}
                aria-label="Clear search"
                className="press mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.1] text-white/70 hover:bg-white/[0.18]"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {suggestOpen && suggestions.length > 0 && (
            <div className="a-pop absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-2xl border border-hair bg-surface-2/95 shadow-2xl shadow-black/70 backdrop-blur-xl">
              {suggestions.map((song) => (
                <button
                  key={song.id}
                  onClick={() => {
                    playSong(song, suggestions);
                    setSuggestOpen(false);
                  }}
                  className="flex w-full items-center gap-3 border-b border-hair px-4 py-3 text-left transition-colors last:border-0 hover:bg-white/[0.05]"
                >
                  <img src={song.thumbnail} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" loading="lazy" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium">{song.title}</span>
                    <span className="block truncate text-[11px] text-white/35">{song.artist}</span>
                  </span>
                  <Play size={12} fill="currentColor" className="shrink-0 text-white/30" />
                </button>
              ))}
              <button
                onClick={submit}
                className="w-full px-4 py-3 text-center text-[12px] font-semibold text-accent transition-colors hover:bg-white/[0.04]"
              >
                See all results for “{query}”
              </button>
            </div>
          )}
        </form>

        {q && <ChipRow items={TABS} activeId={tab} onSelect={(t) => setTab(t.id)} className="mt-3" />}
      </div>

      {/* ---------- Idle state ---------- */}
      {!q && (
        <div className="a-fade-up space-y-9">
          {recents.length > 0 && (
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-[13px] font-bold text-white/60">
                  <Clock size={13} /> Recent searches
                </h2>
                <button
                  onClick={() => {
                    setRecents([]);
                    localStorage.removeItem('ma_recent_searches');
                  }}
                  className="press flex items-center gap-1 text-[11.5px] text-white/30 hover:text-white/60"
                >
                  <Trash2 size={11} /> Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recents.map((term) => (
                  <div key={term} className="flex items-center rounded-full bg-white/[0.06] transition-colors hover:bg-white/[0.1]">
                    <button onClick={() => jumpTo(term)} className="py-2 pl-3.5 pr-1.5 text-[12px] font-medium text-white/70">
                      {term}
                    </button>
                    <button
                      onClick={() => {
                        const next = recents.filter((s) => s !== term);
                        setRecents(next);
                        try {
                          localStorage.setItem('ma_recent_searches', JSON.stringify(next));
                        } catch {}
                      }}
                      aria-label={`Remove ${term}`}
                      className="press py-2 pr-3 text-white/25 hover:text-white/60"
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {historyArtists.length > 0 && (
            <section>
              <h2 className="mb-3.5 text-[17px] font-bold tracking-tight">Your artists</h2>
              <div className="scroll-x flex gap-4 pb-1">
                {historyArtists.map((a) => (
                  <ArtistCircle key={a.name} name={a.name} image={a.img} onClick={() => jumpTo(a.name)} />
                ))}
              </div>
            </section>
          )}

          {history.length > 0 && (
            <Shelf title="Recently played">
              {history.slice(0, 12).map((song) => (
                <SongCard key={song.id} song={song} songList={history.slice(0, 12)} />
              ))}
            </Shelf>
          )}

          <section>
            <h2 className="mb-3.5 text-[17px] font-bold tracking-tight">Browse categories</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {COLLECTIONS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => jumpTo(c.query)}
                  className="lift relative h-[96px] overflow-hidden rounded-xl p-3.5 text-left"
                  style={{ background: `linear-gradient(145deg, ${c.from} 0%, ${c.to} 100%)` }}
                >
                  <p className="text-[14px] font-bold leading-tight drop-shadow">{c.label}</p>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ---------- Album detail ---------- */}
      {album && (
        <div className="a-fade-up">
          <button
            onClick={() => setAlbum(null)}
            className="press mb-4 flex items-center gap-1.5 text-[12px] font-semibold text-white/50 hover:text-white"
          >
            <ChevronLeft size={14} /> Back to results
          </button>
          <div className="mb-5 flex flex-wrap items-end gap-4">
            <img src={album.thumbnail} alt="" className="art h-32 w-32 rounded-xl object-cover sm:h-40 sm:w-40" />
            <div className="min-w-0 flex-1">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-white/35">Album</p>
              <h2 className="mt-1 text-[24px] font-bold leading-tight tracking-tight sm:text-[30px]">{album.title}</h2>
              <p className="mt-1.5 text-[12.5px] text-white/45">
                {album.artist}
                {album.year ? ` · ${album.year}` : ''} · {album.songs.length} tracks
              </p>
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => playSong(album.songs[0], album.songs)}
                  className="press flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-[12px] font-bold text-white"
                >
                  <Play size={13} fill="white" /> Play
                </button>
                <button
                  onClick={() => playShuffled(album.songs)}
                  className="press flex items-center gap-2 rounded-full bg-white/[0.08] px-4 py-2.5 text-[12px] font-semibold text-white/75 hover:bg-white/[0.14]"
                >
                  <Shuffle size={13} /> Shuffle
                </button>
              </div>
            </div>
          </div>
          <SongList songs={album.songs} showAlbum={false} />
        </div>
      )}

      {/* ---------- Results ---------- */}
      {q && !album && (
        <div className="a-fade-up">
          {(loading || albumLoading) && (
            <div className="flex flex-col items-center gap-3 py-20">
              <LoaderCircle size={22} className="animate-spin text-white/35" />
              <p className="text-[12px] text-white/30">Searching “{q}”…</p>
            </div>
          )}

          {!loading && empty && (
            <div className="py-20 text-center">
              <SearchX size={28} className="mx-auto mb-3 text-white/12" />
              <p className="text-[14px] font-semibold text-white/55">No {tab} found for “{q}”</p>
              <p className="mt-1 text-[12px] text-white/25">Try a different spelling or another filter.</p>
            </div>
          )}

          {!loading && tab === 'songs' && songs.length > 0 && (
            <>
              <section className="mb-6">
                <p className="mb-2 text-[10.5px] font-bold uppercase tracking-[0.16em] text-white/30">Top result</p>
                <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-hair bg-surface-2/60 p-4">
                  <img src={songs[0].thumbnail} alt="" className="art h-20 w-20 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[19px] font-bold tracking-tight">{songs[0].title}</p>
                    <p className="mt-1 truncate text-[12.5px] text-white/45">{songs[0].artist}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => playShuffled(songs)}
                      aria-label="Shuffle results"
                      className="press flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.08] hover:bg-white/[0.14]"
                    >
                      <Shuffle size={15} />
                    </button>
                    <button
                      onClick={() => playSong(songs[0], songs)}
                      className="press flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-[12.5px] font-bold text-white"
                    >
                      <Play size={14} fill="white" /> Play
                    </button>
                  </div>
                </div>
              </section>

              <p className="mb-2 text-[10.5px] font-bold uppercase tracking-[0.16em] text-white/30">
                All songs · {songs.length}
              </p>
              <SongList songs={songs} />
            </>
          )}

          {!loading && tab === 'artists' && results.artists.length > 0 && (
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6">
              {results.artists.map((a) => (
                <div key={a.id || a.name} className="flex justify-center">
                  <ArtistCircle name={a.name} image={a.img} onClick={() => jumpTo(a.name)} />
                </div>
              ))}
            </div>
          )}

          {!loading && tab === 'albums' && results.albums.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
              {results.albums.map((a) => (
                <button key={a.id} onClick={() => openAlbum(a)} className="group text-left">
                  <div className="art mb-2.5 aspect-square overflow-hidden rounded-xl ring-1 ring-white/[0.06]">
                    <img
                      src={a.thumbnail}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <p className="truncate text-[13px] font-semibold">{a.title}</p>
                  <p className="mt-1 truncate text-[11.5px] text-white/40">{a.year || a.artist}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
