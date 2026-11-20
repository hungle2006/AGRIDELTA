export const LIFECYCLE_SECONDS=28;
export const STAGE_TIMES=[0,3.2,10.4,19,25.8];
export const stageAt=t=>t<2.5?0:t<8?1:t<17?2:t<22.5?3:4;
export const nextRoot=(count,active,direction=1)=>count<5?{count:count+1,index:count}:{count,index:(active+direction+5)%5};
