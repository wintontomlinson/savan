import { useRef, useState, useCallback } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration } from '../data/format';

/**
 * Draggable playback rail. Uses pointer events so mouse, touch and pen all
 * share one code path.
 */
export default function Seekbar({ showTimes = false, thickness = 4, className = '' }) {
  const { currentTime, duration, seekTo } = usePlayer();
  const trackRef = useRef(null);
  const [drag, setDrag] = useState(null);

  const ratio = (clientX) => {
    const rect = trackRef.current.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  };

  const onPointerDown = useCallback((e) => {
    if (!trackRef.current || !duration) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag(ratio(e.clientX));
  }, [duration]);

  const onPointerMove = useCallback((e) => {
    if (drag === null) return;
    setDrag(ratio(e.clientX));
  }, [drag]);

  const onPointerUp = useCallback((e) => {
    if (drag === null) return;
    seekTo(ratio(e.clientX) * duration);
    setDrag(null);
  }, [drag, duration, seekTo]);

  const progress = drag ?? (duration > 0 ? currentTime / duration : 0);
  const active = drag !== null;

  return (
    <div className={className}>
      <div
        ref={trackRef}
        role="slider"
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={Math.round(duration) || 0}
        aria-valuenow={Math.round(drag !== null ? drag * duration : currentTime)}
        tabIndex={-1}
        className="rail group w-full rounded-full bg-white/[0.16]"
        style={{ height: thickness }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className={`relative h-full rounded-full transition-colors ${active ? 'bg-accent' : 'bg-white group-hover:bg-accent'}`}
          style={{ width: `${progress * 100}%` }}
        >
          <span
            className={`absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 translate-x-1/2 rounded-full bg-white shadow-md transition-opacity ${
              active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          />
        </div>
      </div>

      {showTimes && (
        <div className="mt-1.5 flex justify-between text-[10.5px] font-medium tabular-nums text-white/40">
          <span>{formatDuration(drag !== null ? drag * duration : currentTime)}</span>
          <span>-{formatDuration(Math.max(0, duration - (drag !== null ? drag * duration : currentTime)))}</span>
        </div>
      )}
    </div>
  );
}
