import{Bell,Cast,User}from'lucide-react';
import{useAuth}from'../context/AuthContext';
import SearchBar from'./SearchBar';

export default function Header(){
  const{user}=useAuth();
  return(
    <header className="fixed top-0 left-0 right-0 h-16 z-40 flex items-center px-4 md:pl-[88px] lg:pl-[256px] gap-4" style={{background:'rgba(15,15,15,0.95)',backdropFilter:'blur(10px)'}}>
      <div className="flex-1 flex justify-center"><SearchBar/></div>
      <div className="flex items-center gap-2 shrink-0">
        <button className="p-2 text-[#AAAAAA] hover:text-white hidden sm:block"><Cast size={18}/></button>
        <button className="p-2 text-[#AAAAAA] hover:text-white relative"><Bell size={18}/><span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"/></button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold cursor-pointer">{user.name[0]}</div>
      </div>
    </header>
  );
}
