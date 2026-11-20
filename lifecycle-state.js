export const LIFECYCLE_SECONDS = 28;
export const STAGE_TIMES = [0, 3.4, 16.45, 19.2, 27.35];
export const stageAt = time => time < 2.5 ? 0 : time < 7.5 ? 1 : time < 17.4 ? 2 : time < 22.5 ? 3 : 4;
export const nextRoot = (count, active, direction = 1) => count < 5
  ? {count: count + 1, index: count}
  : {count, index: (active + direction + 5) % 5};
