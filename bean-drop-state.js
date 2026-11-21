/**
 * One bean-pod transition: emerge on a section divider, fall vertically to
 * the document bottom, and disappear after two seconds.
 *
 * Position is in the Start page coordinate system, NOT the divider viewport.
 */
export const BEAN_DROP_MS = 2000;
export const BEAN_DIVIDER_COUNT = 4;
const clamp = value => Math.max(0,Math.min(1,value));

export function beanDropPose(milliseconds){
  const t=clamp(milliseconds/BEAN_DROP_MS);
  if(t>=1)return {visible:false,progress:1,x:0,scale:1,tilt:1.05,opacity:0};
  // The pod appears at the actual horizontal rule, then travels all the way
  // to the foot of the page with gravitational-style acceleration.
  const emergence=clamp(t/.12);
  const fall=clamp((t-.12)/.88);
  const progress=Math.pow(fall,1.35);
  const opacity=t<.12 ? 1-Math.pow(1-emergence,2.5) : t>.85 ? clamp((1-t)/.15) : 1;
  return {
    visible:true,
    progress,
    x:0, // No sideways drift: user explicitly requested a straight fall.
    scale:.25+.75*(1-Math.pow(1-emergence,3)),
    tilt:.03+fall*1.02,
    opacity
  };
}
export function beanDropPosition(milliseconds,startY,bottomY){
  const {progress}=beanDropPose(milliseconds);
  const from=Number.isFinite(startY)?startY:0;
  const bottom=Math.max(from,Number.isFinite(bottomY)?bottomY:from);
  return from+(bottom-from)*progress;
}
