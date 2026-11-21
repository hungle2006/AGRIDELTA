/**
 * Bean harvest transitions: exactly two seconds per separator crossing.
 * No global loops; the next divider starts a new pod independently.
 */
export const BEAN_DROP_MS = 2000;
export const BEAN_DIVIDER_COUNT = 4;
const clamp = value => Math.max(0,Math.min(1,value));
export function beanDropPose(ms){
  const t=clamp(ms / BEAN_DROP_MS);
  if (t>=1)return {visible:false,x:0,y:-1.2,scale:1,tilt:1.18,opacity:0};
  if(t<.17){
    const p=t/.17;
    const ease=1-Math.pow(1-p,3);
    return {visible:true,x:0,y:.72,scale:.25+.75*ease,tilt:-.15+.12*ease,opacity:ease};
  }
  const p=clamp((t-.17)/.63);
  const downward=p*p;
  const fade=t>.8 ? clamp((1-t)/.2) : 1;
  return {
    visible:true,
    x:.18*Math.sin(Math.PI*p),
    y:.72-1.88*downward-(t>.8 ? .18*(t-.8)/.2 : 0),
    scale:1,
    tilt:-.03+1.27*p,
    opacity:fade
  };
}
