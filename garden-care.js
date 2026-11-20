// Observed lifecycle stage shared between the automatic garden and farm workspace.
export function normalizeCare(value){const level=Number.isInteger(value?.level)?Math.max(0,Math.min(4,value.level)):0;return {level,water:false,feed:false};}
export function readCare(){try{return normalizeCare(JSON.parse(localStorage.getItem('agridelta_garden_care_v1')));}catch{return normalizeCare(null);}}
export function recordGrowthStage(level){const s=normalizeCare({level});try{localStorage.setItem('agridelta_garden_care_v1',JSON.stringify(s));}catch{}window.dispatchEvent(new CustomEvent('agridelta-care-changed',{detail:s}));}
