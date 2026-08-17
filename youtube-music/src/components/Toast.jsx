import{usePlayer}from'../context/PlayerContext';
import{X,CheckCircle,Info,AlertCircle}from'lucide-react';

export default function Toast(){
  const{toasts,dismissToast}=usePlayer();
  if(!toasts.length)return null;
  const icons={success:CheckCircle,info:Info,error:AlertCircle};
  const colors={success:'text-green-400',info:'text-[#AAAAAA]',error:'text-red-400'};
  return(
    <div className="fixed bottom-24 left-4 z-[100] space-y-2">
      {toasts.map(t=>{const Icon=icons[t.type]||Info;return(
        <div key={t.id} className="flex items-center gap-2 bg-[#323232] border border-[#484848] px-4 py-3 rounded-xl shadow-2xl min-w-[250px] animate-[slideIn_0.3s_ease-out]">
          <Icon size={16} className={colors[t.type]||colors.info}/>
          <span className="text-sm text-white flex-1">{t.msg}</span>
          <button onClick={()=>dismissToast(t.id)} className="text-[#717171] hover:text-white"><X size={14}/></button>
        </div>
      );})}
    </div>
  );
}
