export const CARE_LIMITS=[0,7.7,16.7,22.3,27.7];
export function normalizeCare(value){const level=Number.isInteger(value?.level)?Math.max(0,Math.min(4,value.level)):0;return {level,water:level<4&&value?.water===true,feed:level<4&&value?.feed===true};}
export function applyCare(value,action){const s=normalizeCare(value);if(s.level===4||!['water','feed'].includes(action))return s;s[action]=true;if(s.water&&s.feed)return {level:s.level+1,water:false,feed:false};return s;}
export const careLimit=s=>CARE_LIMITS[normalizeCare(s).level];
export function readCare(){try{return normalizeCare(JSON.parse(localStorage.getItem('agridelta_garden_care_v1')));}catch{return normalizeCare(null);}}
