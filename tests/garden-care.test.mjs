import test from 'node:test';import assert from 'node:assert/strict';
import {normalizeCare} from '../garden-care.js';
import {CARE_WINDOWS,carePhase,stageAt,createGrowthClock} from '../lifecycle-state.js';
test('automatic care supplies water then fertilizer before each new stage',()=>{CARE_WINDOWS.forEach(([start,waterEnd,feedEnd],i)=>{assert.equal(carePhase((start+waterEnd)/2).water,true);assert.equal(carePhase((start+waterEnd)/2).feed,false);assert.equal(carePhase((waterEnd+feedEnd)/2).feed,true);assert.equal(carePhase((waterEnd+feedEnd)/2).water,false);assert.equal(stageAt(feedEnd+.5),i===0?1:i+1);});});
test('mature garden stops care and describes red tomato fruit',()=>{assert.equal(carePhase(27.7).water,false);assert.equal(carePhase(27.7).feed,false);assert.match(carePhase(27.7).message,/chín đỏ/);});
test('stored garden stages tolerate invalid state',()=>{assert.equal(normalizeCare({level:99}).level,4);assert.equal(normalizeCare({level:'4'}).level,0);assert.equal(normalizeCare(null).level,0);});

test('automatic growth remains gated when either input is absent', () => {
  for (const signals of [{water:false}, {feed:false}]) {
    const clock = createGrowthClock();
    assert.equal(clock.advance(28, signals), 2.49);
    assert.equal(clock.state, 'SEED');
    assert.equal(clock.advance(28, signals), 2.49);
  }
});

test('growth clock moves through every simulated stage and replay resets the gates', () => {
  const clock = createGrowthClock();
  for (let time = 0; time <= 28; time += .025) {
    assert.ok(Math.abs(clock.advance(time) - Math.min(time, 27.7)) < .001);
  }
  assert.equal(clock.state, 'FRUITING');
  clock.seek(0);
  assert.equal(clock.state, 'SEED');
  assert.equal(clock.advance(4, {feed:false}), 2.49);
});
