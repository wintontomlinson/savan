/** YouTube Music style filter chips. */
export default function ChipRow({ items, activeId, onSelect, className = '' }) {
  return (
    <div className={`scroll-x -mx-1 flex gap-2 px-1 pb-1 ${className}`}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item)}
          data-active={activeId === item.id}
          className="chip shrink-0"
        >
          {item.icon && <item.icon size={14} />}
          {item.label}
        </button>
      ))}
    </div>
  );
}
