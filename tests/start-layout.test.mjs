import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const root=readFileSync(new URL('../root-guide.js',import.meta.url),'utf8');
const visual=readFileSync(new URL('../start-editorial.css',import.meta.url),'utf8');
test('Start editorial redesign keeps the fully functional WebGL lifecycle and navigation',()=>{
  assert.match(root,/id="live-earth"/);
  assert.match(root,/class="plant-art"/);
  assert.match(root,/class="plant-controls"/);
  assert.match(root,/data-pause/);
  assert.match(root,/id="lifecycle-label"/);
  assert.match(root,/data-enter-page="home"/);
  assert.match(root,/href="#rg-roots"/);
  assert.match(root,/class="hero-scroll-note"/);
  assert.match(root,/class="start-workflow-head"/);
  assert.match(root,/earth\.setScrollRoots\(progress\)/);
});
test('Start v4 has mobile, small laptop and reduced-motion geometry safeguards',()=>{
  assert.match(visual,/START V4 — BOTANICAL EDITORIAL COMPOSITION/);
  assert.match(visual,/max-width:760px/);
  assert.match(visual,/max-width:370px/);
  assert.match(visual,/max-height:670px/);
  assert.match(visual,/prefers-reduced-motion:reduce/);
  assert.match(visual,/plant-art-topline/);
  assert.match(visual,/plant-journey::before/);
  assert.match(visual,/grid-template-columns:minmax\(0,\.96fr\) minmax\(0,1\.04fr\)/);
});
