/**
 * Reversible scroll-story geometry: one scroll position determines every root.
 * No sticky state: reversing the scroll retracts the branches and scales nodes down.
 */
export const ROOT_STARTS=Object.freeze([-0.08,0.19,0.385,0.58,0.775]);
export const ROOT_GROW_SPAN=0.215;
export const clamp01=value=>Math.min(1,Math.max(0,Number.isFinite(Number(value))?Number(value):0));
export const smoothstep=value=>{const t=clamp01(value);return t*t*(3-2*t);};
export function storyProgress(scrollDistance,scrollTravel){
 const total=Math.max(1,Number(scrollTravel)||0);
 return clamp01(Math.max(0,Number(scrollDistance)||0)/total);
}
export function rootRevealAt(progress,index){
 if(index<0||index>=ROOT_STARTS.length)return 0;
 return smoothstep((clamp01(progress)-ROOT_STARTS[index])/ROOT_GROW_SPAN);
}
export function rootCountAt(progress){
 return ROOT_STARTS.reduce((count,_,i)=>count+(rootRevealAt(progress,i)>0.035?1:0),0);
}
export function rootScrollTarget(index){
 const i=Math.max(0,Math.min(ROOT_STARTS.length-1,Math.trunc(Number(index)||0)));
 return clamp01(ROOT_STARTS[i]+ROOT_GROW_SPAN*.62);
}
