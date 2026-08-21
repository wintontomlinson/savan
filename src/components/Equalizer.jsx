export default function Equalizer({ className = 'h-3.5' }) {
  return (
    <div className={`flex items-end gap-[2.5px] ${className}`} aria-hidden="true">
      <span className="eq-bar" />
      <span className="eq-bar" />
      <span className="eq-bar" />
      <span className="eq-bar" />
    </div>
  );
}
