export const LIFECYCLE_SECONDS=28;
export const STAGE_TIMES=[0,3.2,10.4,19,25.8];
export const stageAt=t=>t<2.5?0:t<8?1:t<17?2:t<22.5?3:4;
export const nextRoot=(count,active,direction=1)=>count<5?{count:count+1,index:count}:{count,index:(active+direction+5)%5};

export const CARE_WINDOWS=[[0,1.25,2.42],[5.88,7.17,8],[14.71,16,16.92],[19.79,21.08,22.08]];
export function carePhase(time){const t=Number.isFinite(time)?Math.max(0,time):0;for(const [start,wet,feed] of CARE_WINDOWS){if(t>=start&&t<wet)return {water:true,feed:false,message:'Nước đang thấm vào đất, đánh thức bộ rễ.'};if(t>=wet&&t<feed)return {water:false,feed:true,message:'Dinh dưỡng hữu cơ nuôi cây chuyển giai đoạn.'};}return {water:false,feed:false,message:t>=22.5?'Đủ nước, đủ dưỡng chất. Cà chua đang chín đỏ.':'Bộ rễ hấp thụ dưỡng chất, cây tiếp tục lớn lên.'};}
