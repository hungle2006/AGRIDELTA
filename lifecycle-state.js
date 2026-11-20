export const LIFECYCLE_SECONDS=28;
export const STAGE_TIMES=[0,3.2,10.4,19,25.8];
export const stageAt=t=>t<2.5?0:t<8?1:t<17?2:t<22.5?3:4;
export const nextRoot=(count,active,direction=1)=>count<5?{count:count+1,index:count}:{count,index:(active+direction+5)%5};

/** Matches the exported Blender care bursts; status follows the animation clock. */
export function carePhaseAt(t){
 if(t>=26.9)return {key:'harvest',icon:'seed',label:'Cà chua đỏ chín. Một hành trình trọn vẹn.'};
 if([[1.45,3.05],[8.5,10.3],[16.8,18.6],[21.65,23.5]].some(([a,b])=>t>=a&&t<b))return {key:'feed',icon:'leaf',label:'Hạt phân rơi xuống, bổ sung dinh dưỡng cho đất.'};
 if([[0,1.45],[7.5,8.5],[15.75,16.8],[20.75,21.65]].some(([a,b])=>t>=a&&t<b))return {key:'water',icon:'drop',label:'Nước thấm đất, nuôi dưỡng từng mạch rễ.'};
 return {key:'grow',icon:'plant',label:t<17?'Đủ nước và dinh dưỡng, cây vươn lên từng ngày.':'Từ hoa nhỏ, những quả cà chua dần lớn lên.'};
}
