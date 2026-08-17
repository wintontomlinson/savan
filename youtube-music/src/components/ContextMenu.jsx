import { useState, useRef, useEffect } from 'react';
import { MoreVertical, ListPlus, Library, Share2, Disc3, User, Download, Lock } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useNavigate } from 'react-router-dom';

export default function ContextMenu({ song }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const { addToQueue, showToast } = usePlayer();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { icon: ListPlus, label: 'Add to queue', action: () => addToQueue(song) },
    { icon: Library, label: 'Save to library', action: () => showToast('Saved to library') },
    { icon: Share2, label: 'Share', action: () => showToast('Link copied!') },
    { icon: Disc3, label: 'Go to album', action: () => navigate(`/album/${song.albumId}`) },
    { icon: User, label: 'Go to artist', action: () => navigate(`/artist/${song.artistId}`) },
    { icon: Download, label: 'Download', premium: true, action: () => showToast('Premium feature') },
  ];

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1.5 rounded-full hover:bg-white/10 transition-all duration-200 hover:scale-110 btn-press"
      >
        <MoreVertical size={18} className="text-white" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-52 bg-[#282828] rounded-xl shadow-2xl border border-white/10 overflow-hidden z-50 animate-scale-in">
          {menuItems.map((item, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                item.action();
                setIsOpen(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-white hover:bg-white/10 transition-all duration-200 hover:pl-5"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <item.icon size={16} className="text-[#AAAAAA] transition-colors duration-200 group-hover:text-white" />
              <span>{item.label}</span>
              {item.premium && (
                <Lock size={12} className="ml-auto text-[#AAAAAA]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
