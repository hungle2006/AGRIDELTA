export const LIFECYCLE_SECONDS = 28;
export const MAX_GROWTH_TIME = 27.7;
export const STAGE_TIMES = [0, 3.2, 10.4, 19, 25.8];
export const GROWTH_STATES = ['SEED', 'GERMINATING', 'VEGETATIVE', 'FLOWERING', 'FRUITING'];
export const CARE_WINDOWS = [[0,1.25,2.42],[5.88,7.17,8],[14.71,16,16.92],[19.79,21.08,22.08]];
const thresholds = [2.5, 8, 17, 22.5];

export function stageAt(time) {
  return thresholds.filter(threshold => time >= threshold).length;
}
export const nextRoot = (count, active, direction = 1) => count < 5 ? {count:count + 1,index:count} : {count,index:(active + direction + 5) % 5};

export function createGrowthClock() {
  let time = 0;
  let stage = 0;
  const resources = CARE_WINDOWS.map(() => ({water:0, feed:0}));

  function advance(requestedTime, {water = true, feed = true} = {}) {
    const next = Math.min(MAX_GROWTH_TIME, Math.max(time, requestedTime));
    for (let i = stage; i < thresholds.length; i += 1) {
      const [start, irrigated, fed] = CARE_WINDOWS[i];
      const overlap = (a, b) => Math.max(0, Math.min(next,b) - Math.max(time,a));
      if (water) resources[i].water += overlap(start,irrigated);
      if (feed) resources[i].feed += overlap(irrigated,fed);
      if (next < thresholds[i]) break;
      if (resources[i].water + .0001 < irrigated - start || resources[i].feed + .0001 < fed - irrigated) {
        time = Math.min(next, thresholds[i] - .01);
        return time;
      }
      stage = i + 1;
    }
    time = next;
    return time;
  }

  function seek(requestedTime) {
    time = 0;
    stage = 0;
    for (const resource of resources) { resource.water = 0; resource.feed = 0; }
    return advance(requestedTime);
  }

  return {advance, seek, get state() { return GROWTH_STATES[stage]; }};
}

export function carePhase(time) {
  for (const [start, irrigated, fed] of CARE_WINDOWS) {
    if (time >= start && time < irrigated) return {water:true,feed:false,message:'Nước thấm dần xuống vùng rễ.'};
    if (time >= irrigated && time < fed) return {water:false,feed:true,message:'Dưỡng chất di chuyển cùng nước trong đất.'};
  }
  return {water:false,feed:false,message:time >= 22.5 ? 'Đủ nước và dưỡng chất, cà chua dần chín đỏ.' : 'Rễ hấp thụ nước và dưỡng chất để cây lớn lên.'};
}
