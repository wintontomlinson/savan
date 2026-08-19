import { useState, useMemo } from 'react';
import { Heart, Clock, BarChart3, Music, Trophy, Flame } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { getHistory, analyzePreferences } from '../data/algorithm';
import SongRow from '../components/SongRow';

export default function Library() {
  const { likedSongs } = usePlayer();
  const [tab, setTab] = useState('history');
  const history = useMemo(() => getHistory(), []);
  const prefs = useMemo(() => analyzePreferences(), []);

  const likedFromHistory = history.filter(s => likedSongs.includes(s.id));

  const tabs = [
    { id: 'history', label: 'History', icon: Clock },
    { id: 'liked', label: 'Liked', icon: Heart, count: likedFromHistory.length },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
  ];

  return (
    <div className="pb-6 pt-2">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Your Library</h1>
        <p className="text-[12px] text-[#666] mt-0.5">{history.length} songs in history • {likedFromHistory.length} liked</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-medium transition-all duration-200 border ${
              tab === t.id
                ? 'bg-white text-black border-white'
                : 'bg-transparent text-[#999] border-white/[0.08] hover:border-white/[0.15] hover:text-white'
            }`}>
            <t.icon size={14} />
            {t.label}
            {t.count > 0 && <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-black/10' : 'bg-white/10'}`}>{t.count}</span>}
          </button>
        ))}
      </div>

      {/* History */}
      {tab === 'history' && (
        history.length > 0 ? (
          <div className="animate-in">
            <div className="bg-[#0e0e0e] rounded-2xl overflow-hidden border border-white/[0.04]">
              {history.slice(0, 40).map((s, i) => <SongRow key={`${s.id}-${i}`} song={s} index={i} songList={history} />)}
            </div>
          </div>
        ) : (
          <EmptyState icon={Clock} text="Your listening history will appear here" sub="Start playing songs to build your history" />
        )
      )}

      {/* Liked */}
      {tab === 'liked' && (
        likedFromHistory.length > 0 ? (
          <div className="animate-in">
            <div className="bg-[#0e0e0e] rounded-2xl overflow-hidden border border-white/[0.04]">
              {likedFromHistory.map((s, i) => <SongRow key={s.id} song={s} index={i} songList={likedFromHistory} />)}
            </div>
          </div>
        ) : (
          <EmptyState icon={Heart} text="No liked songs yet" sub="Tap ❤️ on songs to save them here" />
        )
      )}

      {/* Stats */}
      {tab === 'stats' && (
        prefs ? (
          <div className="space-y-3 animate-in">
            {/* Total plays card */}
            <div className="bg-gradient-to-br from-rose-500/10 to-purple-500/5 rounded-2xl p-5 border border-rose-500/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-rose-500/20 rounded-xl flex items-center justify-center">
                  <Music size={18} className="text-rose-400" />
                </div>
                <div>
                  <p className="text-[10px] text-[#888] uppercase tracking-wider font-medium">Total Played</p>
                  <p className="text-[28px] font-bold text-white leading-none">{prefs.totalPlays}</p>
                </div>
              </div>
              <p className="text-[11px] text-[#666]">songs since you started</p>
            </div>

            {/* Top Artists */}
            <div className="bg-[#0e0e0e] rounded-2xl p-5 border border-white/[0.04]">
              <div className="flex items-center gap-2 mb-4">
                <Trophy size={14} className="text-amber-400" />
                <p className="text-[13px] text-white font-semibold">Top Artists</p>
              </div>
              <div className="space-y-3">
                {prefs.topArtists.map((a, i) => (
                  <div key={typeof a === 'string' ? a : a.name || i} className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      i === 0 ? 'bg-amber-500/20 text-amber-400' :
                      i === 1 ? 'bg-gray-400/20 text-gray-400' :
                      i === 2 ? 'bg-orange-500/20 text-orange-400' :
                      'bg-white/[0.04] text-[#666]'
                    }`}>{i + 1}</span>
                    <span className="text-[13px] text-white flex-1 font-medium">{typeof a === 'string' ? a : a.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Peak time */}
            {prefs.peakTime && (
              <div className="bg-[#0e0e0e] rounded-2xl p-5 border border-white/[0.04]">
                <div className="flex items-center gap-2 mb-2">
                  <Flame size={14} className="text-orange-400" />
                  <p className="text-[13px] text-white font-semibold">Peak Listening</p>
                </div>
                <p className="text-[15px] font-medium text-white capitalize">{prefs.peakTime}</p>
                <p className="text-[11px] text-[#666] mt-0.5">When you listen the most</p>
              </div>
            )}
          </div>
        ) : (
          <EmptyState icon={BarChart3} text="Not enough data yet" sub="Play more songs to unlock your stats" />
        )
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, text, sub }) {
  return (
    <div className="text-center py-20 animate-in">
      <div className="w-16 h-16 mx-auto mb-4 bg-white/[0.04] rounded-2xl flex items-center justify-center">
        <Icon size={28} className="text-[#333]" />
      </div>
      <p className="text-[14px] text-white font-medium">{text}</p>
      <p className="text-[12px] text-[#666] mt-1">{sub}</p>
    </div>
  );
}
