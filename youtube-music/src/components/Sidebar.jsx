import{NavLink}from'react-router-dom';
import{Home,Compass,Library,Crown,Settings,Music}from'lucide-react';
import{useAuth}from'../context/AuthContext';

const links=[{to:'/',icon:Home,label:'Home'},{to:'/explore',icon:Compass,label:'Explore'},{to:'/library',icon:Library,label:'Library'},{to:'/premium',icon:Crown,label:'Premium'}];

export default function Sidebar(){
  const{user}=useAuth();
  return(
    <aside className="hidden md:flex flex-col w-[72px] lg:w-[240px] h-full bg-[#1A1A1A] border-r border-[#383838] fixed left-0 top-0 z-30 pt-16">
      <div className="px-4 lg:px-6 py-4 flex items-center gap-2">
        <Music className="text-red-500 shrink-0"size={24}/>
        <span className="hidden lg:block text-white font-bold text-lg">MusicStream</span>
      </div>
      <nav className="flex-1 px-2 lg:px-3 mt-2 space-y-1">
        {links.map(l=>(
          <NavLink key={l.to} to={l.to} className={({isActive})=>`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${isActive?'bg-white/10 text-white border-l-2 border-red-500':'text-[#AAAAAA] hover:text-white hover:bg-white/5 border-l-2 border-transparent'}`}>
            <l.icon size={20} className="shrink-0"/>
            <span className="hidden lg:block">{l.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="px-3 lg:px-4 py-4 border-t border-[#383838] flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shrink-0">{user.name[0]}</div>
        <div className="hidden lg:block min-w-0">
          <p className="text-sm text-white truncate">{user.name}</p>
          <p className="text-xs text-[#717171] truncate">{user.email}</p>
        </div>
        <Settings size={16} className="hidden lg:block text-[#717171] ml-auto shrink-0 cursor-pointer hover:text-white"/>
      </div>
    </aside>
  );
}
