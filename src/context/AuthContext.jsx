import{createContext,useContext,useState}from'react';
const Ctx=createContext();
export const useAuth=()=>useContext(Ctx);
export function AuthProvider({children}){
  const[user]=useState({name:'Alex',email:'alex@music.com'});
  return<Ctx.Provider value={{user}}>{children}</Ctx.Provider>;
}
