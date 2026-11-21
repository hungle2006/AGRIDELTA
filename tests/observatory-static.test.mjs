import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {farmTools} from '../farm-intelligence.js';

test('observatory renders exactly three original cards and no carousel controls',()=>{
  const html=farmTools();
  assert.equal((html.match(/class="ag-carousel-slide"/g)||[]).length,3);
  assert.equal((html.match(/class="ag-tool-card ag-photo-card/g)||[]).length,3);
  assert.doesNotMatch(html,/data-carousel-step|data-carousel-index|ag-carousel-controls/);
});
test('no clone, drag, or rail scrolling; hover waits two seconds',()=>{
  const js=readFileSync(new URL('../observatory-carousel.js',import.meta.url),'utf8');
  assert.match(js,/setTimeout\(\(\) => activate\(card\), 2000\)/);
  assert.doesNotMatch(js,/cloneNode|scrollTo\(|scrollLeft|data-carousel-copy/);
  const css=readFileSync(new URL('../workspace-v2.css',import.meta.url),'utf8');
  assert.match(css,/grid-template-columns: repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(css,/touch-action: pan-y/);
});
test('photo source dropdown is removed from the visible footer',()=>{
  const js=readFileSync(new URL('../workspace-v2.js',import.meta.url),'utf8');
  assert.doesNotMatch(js,/\$\{photoCredits\(\)\}/);
  assert.match(js,/photo-credits\.html/);
});
