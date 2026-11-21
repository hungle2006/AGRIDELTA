import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const root=read('root-guide.js');
const css=read('start-plant-refine.css');
const index=read('index.html');

test('3D display has no microcopy or duplicated stage counter in the DOM',()=>{
  assert.doesNotMatch(root,/class="plant-art-topline"/);
  assert.doesNotMatch(root,/class="plant-art-side"/);
  assert.doesNotMatch(root,/class="plant-art-groundnote"/);
  assert.doesNotMatch(root,/class="plant-controls-kicker"/);
  assert.doesNotMatch(root,/class="plant-controls-foot"/);
  assert.doesNotMatch(root,/GROW WITH NATURE|BLENDER \/ 3D|SOIL \/ ROOTS \/ GROWTH|THE GROWTH JOURNEY/);
});
test('Plant lifecycle and interaction are retained with evenly spaced stages',()=>{
  assert.match(root,/id="live-earth"/);
  assert.match(root,/id="lifecycle-label"/);
  assert.doesNotMatch(root,/data-pause/);
  assert.match(root,/createLiveEarth/);
  assert.match(root,/stageIndicators\.forEach/);
  assert.match(css,/grid-template-rows:repeat\(5,minmax\(0,1fr\)\)/);
  assert.match(css,/grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/);
  assert.match(css,/prefers-reduced-motion:reduce/);
  assert.match(index,/start-plant-refine\.css/);
});
