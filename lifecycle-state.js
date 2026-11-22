export const LIFECYCLE_SECONDS = 28;
export const HARVEST_SECONDS = 32.5;
// 3x faster than the previously deployed 1.04x Start playback.
// 28 Blender seconds now play in about 9 real seconds, before harvest.
// Root exploration and the three pod-drop animation keep their existing timing.
export const GROWTH_RATE = 3.12;
export const SCROLL_GROWTH_RATE = GROWTH_RATE;
export const HARVEST_RATE = 0.8;

// The GLB already animates three bean pods falling one after another.
// Add horizontal motion after Blender's falling keyframes (not before).
export const POD_FALL_DIRECTIONS = Object.freeze([-1,1,0]);
export function podFallOffset(index, ripeY, animatedY) {
  const direction = POD_FALL_DIRECTIONS[index] ?? 0;
  const drop = Math.max(0, ripeY - animatedY);
  const span = Math.max(.65, Math.abs(ripeY) * .8);
  const progress = Math.min(1, Math.max(0, (drop - .035) / span));
  const smooth = progress * progress * (3 - 2 * progress);
  return {
    x: direction === 0 || smooth === 0 ? 0 : direction * 1.15 * smooth,
    tilt: direction === 0 || smooth === 0 ? 0 : direction * -.18 * smooth,
    progress,
  };
}


export function plantPhase(time, harvestRequested) {
  if (time < LIFECYCLE_SECONDS) return 'growing';
  if (time >= HARVEST_SECONDS) return 'harvested';
  return harvestRequested ? 'harvesting' : 'ripe';
}

export function advancePlantTime(time, elapsed, harvestRequested) {
  if (time < LIFECYCLE_SECONDS) {
    const rate = harvestRequested ? SCROLL_GROWTH_RATE : GROWTH_RATE;
    return Math.min(LIFECYCLE_SECONDS, time + rate*elapsed);
  }
  return harvestRequested ? Math.min(HARVEST_SECONDS, time+HARVEST_RATE*elapsed) : time;
}
export const careAt = time => time >= .33 && time < 3.5 ? 'watering'
  : time >= 3.70 && time < 6.3 ? 'fertilizing' : '';
export const STAGE_TIMES = [0, 3.4, 16.45, 19.2, 27.35];
export const stageAt = time => time < 2.5 ? 0 : time < 7.5 ? 1 : time < 17.4 ? 2 : time < 22.5 ? 3 : 4;
export const nextRoot = (count, active, direction = 1) => count < 5
  ? {count: count + 1, index: count}
  : {count, index: (active + direction + 5) % 5};
