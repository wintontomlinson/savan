import { Lock } from 'lucide-react';

export default function PremiumBadge({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] bg-[#282828] text-[#AAAAAA] px-2 py-0.5 rounded-full ${className}`}>
      <Lock size={10} />
      <span>Premium</span>
    </span>
  );
}
