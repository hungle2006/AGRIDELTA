import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const root=readFileSync(new URL('../root-guide.js',import.meta.url),'utf8');
const visual=readFileSync(new URL('../start-editorial.css',import.meta.url),'utf8');
test('Start editorial redesign keeps the fully functional WebGL lifecycle and navigation',()=>{
  assert.match(root,/id="live-earth"/);
  assert.match(root,/class="plant-art"/);
  assert.match(root,/class="plant-controls"/);
  assert.doesNotMatch(root,/data-pause/);
  assert.match(root,/id="lifecycle-label"/);
  assert.match(root,/data-enter-page="home"/);
  assert.match(root,/href="#rg-roots"/);
  assert.match(root,/class="earth-container hero-bottom-rail"/);
  assert.match(root,/class="start-workflow-head"/);
  assert.match(root,/earth\.setScrollRoots\(progress\)/);
});
test('Start v4 has mobile, small laptop and reduced-motion geometry safeguards',()=>{
  assert.match(visual,/START V4 — BOTANICAL EDITORIAL COMPOSITION/);
  assert.match(visual,/max-width:760px/);
  assert.match(visual,/max-width:370px/);
  assert.match(visual,/max-height:670px/);
  assert.match(visual,/prefers-reduced-motion:reduce/);
  assert.match(visual,/plant-journey/);
  assert.match(visual,/plant-journey::before/);
  assert.match(visual,/grid-template-columns:\s*minmax\(0,\s*\.96fr\)\s+minmax\(0,\s*1\.04fr\)/);
});
