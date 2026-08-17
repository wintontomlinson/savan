import{X}from'lucide-react';
export default function Modal({isOpen,onClose,title,children}){
  if(!isOpen)return null;
  return(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-[#212121] border border-[#383838] rounded-2xl p-6 w-full max-w-md shadow-2xl animate-[scaleIn_0.2s_ease-out]">
        <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold text-white">{title}</h3><button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full"><X size={18} className="text-[#AAAAAA]"/></button></div>
        {children}
      </div>
    </div>
  );
}
