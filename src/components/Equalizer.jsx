export default function Equalizer({ size = 'sm' }) {
  const h = size === 'lg' ? 'h-6' : size === 'md' ? 'h-5' : 'h-4';
  return (
    <div className={`flex items-end gap-[2px] ${h}`}>
      <span className="eq-bar" /><span className="eq-bar" /><span className="eq-bar" /><span className="eq-bar" /><span className="eq-bar" />
    </div>
  );
}
