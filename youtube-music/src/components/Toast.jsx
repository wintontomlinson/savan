import { usePlayer } from '../context/PlayerContext';
import { CheckCircle } from 'lucide-react';

export default function Toast() {
  const { toast } = usePlayer();

  if (!toast) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] animate-bounce-in">
      <div className="flex items-center gap-2 bg-white text-black px-4 py-2.5 rounded-lg shadow-2xl text-sm font-medium">
        <CheckCircle size={16} className="text-green-600" />
        {toast}
      </div>
    </div>
  );
}
