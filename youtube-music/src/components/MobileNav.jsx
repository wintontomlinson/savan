import{NavLink}from'react-router-dom';
import{Home,Compass,Library,Crown}from'lucide-react';
const items=[{to:'/',icon:Home,label:'Home'},{to:'/explore',icon:Compass,label:'Explore'},{to:'/library',icon:Library,label:'Library'},{to:'/premium',icon:Crown,label:'Premium'}];
export default function MobileNav(){
  return<div className="flex items-center justify-around h-full">{items.map(i=><NavLink key={i.to} to={i.to} className={({isActive})=>`flex flex-col items-center gap-0.5 ${isActive?'text-white':'text-[#717171]'}`}><i.icon size={20}/><span className="text-[9px]">{i.label}</span></NavLink>)}</div>;
}
