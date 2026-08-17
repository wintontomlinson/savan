import{useState}from'react';
import{Check,X,ChevronDown,Crown,Ban,Smartphone,Download,Music,SkipForward,FileText,Tv,Mic}from'lucide-react';
import{usePlayer}from'../context/PlayerContext';

const features=[{icon:Ban,t:'No ads'},{icon:Smartphone,t:'Background play'},{icon:Download,t:'Offline downloads'},{icon:Music,t:'High quality (320kbps)'},{icon:SkipForward,t:'Unlimited skips'},{icon:FileText,t:'Lyrics access'},{icon:Tv,t:'YouTube Premium included'},{icon:Mic,t:'Exclusive content'}];
const plans=[{name:'Individual',price:'₹99',period:'/month',desc:'For one person',highlight:true},{name:'Student',price:'₹59',period:'/month',desc:'Verified students'},{name:'Family',price:'₹149',period:'/month',desc:'Up to 6 members'}];
const compare=[['Ad-free',false,true],['Background play',false,true],['Downloads',false,true],['Audio quality','Normal','Very High'],['Skip limit','6/hr','Unlimited'],['Lyrics',false,true],['YT Premium',false,true]];
const faqs=[['What is included?','Premium includes ad-free music, background play, offline downloads, high quality audio, and lyrics access.'],['Can I cancel anytime?','Yes! Cancel anytime from your account settings. You keep access until the billing period ends.'],['After free trial?','You will be charged the monthly fee after your 1 month free trial unless cancelled.'],['Is Family plan worth it?','If you have 2+ people, Family plan saves money. Each member gets their own account.'],['Audio quality?','Free streams at 128kbps. Premium unlocks 320kbps high-quality streaming.']];

export default function Premium(){
  const[openFaq,setOpenFaq]=useState(null);
  const{showToast}=usePlayer();

  return(
    <div className="pb-8 animate-[fadeIn_0.3s_ease-out] max-w-4xl mx-auto">
      {/* Hero */}
      <section className="rounded-2xl bg-gradient-to-br from-[#FF0000] via-[#CC0000] to-[#0F0F0F] p-8 sm:p-12 text-center mb-10">
        <Crown size={32} className="text-yellow-400 mx-auto mb-3"/>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Music, made for you.</h1>
        <p className="text-base text-white/80 mb-6">Ad-free, offline, unlimited.</p>
        <button onClick={()=>showToast('Free trial started!','success')} className="px-8 py-3 bg-white text-black rounded-full font-bold text-base hover:bg-white/90">Try 1 month free</button>
      </section>

      {/* Features */}
      <section className="mb-10"><h2 className="text-xl font-bold text-white text-center mb-6">Everything you need</h2><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{features.map((f,i)=><div key={i} className="flex items-center gap-3 p-4 bg-[#1A1A1A] rounded-xl"><f.icon size={20} className="text-[#FF0000] shrink-0"/><span className="text-sm text-white">{f.t}</span></div>)}</div></section>

      {/* Pricing */}
      <section className="mb-10"><h2 className="text-xl font-bold text-white text-center mb-6">Choose your plan</h2><div className="grid grid-cols-1 md:grid-cols-3 gap-4">{plans.map(p=><div key={p.name} className={`p-6 rounded-2xl border transition-all ${p.highlight?'bg-[#FF0000]/10 border-[#FF0000]/50':'bg-[#1A1A1A] border-[#383838]'}`}>{p.highlight&&<span className="text-[10px] bg-[#FF0000] text-white px-2 py-0.5 rounded-full font-bold mb-3 inline-block">Popular</span>}<h3 className="text-lg font-bold text-white">{p.name}</h3><p className="text-xs text-[#AAAAAA] mb-3">{p.desc}</p><p className="text-2xl font-bold text-white mb-4">{p.price}<span className="text-sm text-[#717171]">{p.period}</span></p><button onClick={()=>showToast(`${p.name} selected!`)} className="w-full py-2.5 bg-[#FF0000] hover:bg-[#CC0000] text-white rounded-full text-sm font-medium">Get {p.name}</button><p className="text-[10px] text-[#717171] text-center mt-2">Cancel anytime</p></div>)}</div></section>

      {/* Comparison */}
      <section className="mb-10"><h2 className="text-xl font-bold text-white text-center mb-6">Free vs Premium</h2><div className="bg-[#1A1A1A] rounded-xl overflow-hidden"><div className="grid grid-cols-3 px-4 py-3 border-b border-[#383838] bg-[#272727]"><span className="text-xs text-[#AAAAAA]">Feature</span><span className="text-xs text-[#AAAAAA] text-center">Free</span><span className="text-xs text-[#FF0000] text-center">Premium</span></div>{compare.map(([feat,free,prem],i)=><div key={i} className="grid grid-cols-3 px-4 py-3 border-b border-[#383838] last:border-0"><span className="text-sm text-white">{feat}</span><span className="text-center">{free===false?<X size={16} className="text-[#717171] mx-auto"/>:typeof free==='string'?<span className="text-xs text-[#717171]">{free}</span>:<Check size={16} className="text-green-500 mx-auto"/>}</span><span className="text-center">{prem===true?<Check size={16} className="text-[#FF0000] mx-auto"/>:<span className="text-xs text-white">{prem}</span>}</span></div>)}</div></section>

      {/* FAQ */}
      <section><h2 className="text-xl font-bold text-white text-center mb-6">FAQ</h2><div className="space-y-2">{faqs.map(([q,a],i)=><div key={i} className="bg-[#1A1A1A] rounded-xl border border-[#383838] overflow-hidden"><button onClick={()=>setOpenFaq(openFaq===i?null:i)} className="w-full flex items-center justify-between px-5 py-4 text-left"><span className="text-sm text-white">{q}</span><ChevronDown size={16} className={`text-[#AAAAAA] transition-transform ${openFaq===i?'rotate-180':''}`}/></button>{openFaq===i&&<div className="px-5 pb-4"><p className="text-sm text-[#AAAAAA]">{a}</p></div>}</div>)}</div></section>
    </div>
  );
}
