export default function SkeletonLoader({type='card',count=5}){
  const shimmer='animate-pulse bg-[#272727]';
  if(type==='row')return<div className="space-y-2">{Array.from({length:count}).map((_,i)=><div key={i} className="flex items-center gap-3 px-4 py-2"><div className={`w-7 h-4 rounded ${shimmer}`}/><div className={`w-10 h-10 rounded ${shimmer}`}/><div className="flex-1 space-y-1"><div className={`h-3 w-1/3 rounded ${shimmer}`}/><div className={`h-2.5 w-1/4 rounded ${shimmer}`}/></div><div className={`w-10 h-3 rounded ${shimmer}`}/></div>)}</div>;
  if(type==='artist')return<div className="flex gap-4">{Array.from({length:count}).map((_,i)=><div key={i} className="flex-shrink-0 w-[140px] flex flex-col items-center"><div className={`w-[120px] h-[120px] rounded-full ${shimmer}`}/><div className={`h-3 w-20 rounded mt-2 ${shimmer}`}/></div>)}</div>;
  return<div className="flex gap-4">{Array.from({length:count}).map((_,i)=><div key={i} className="flex-shrink-0 w-[160px]"><div className={`aspect-square rounded-lg ${shimmer} mb-2`}/><div className={`h-3 w-3/4 rounded ${shimmer} mb-1`}/><div className={`h-2.5 w-1/2 rounded ${shimmer}`}/></div>)}</div>;
}
