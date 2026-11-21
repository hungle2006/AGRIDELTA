import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {farmTools} from '../farm-intelligence.js';

test('carousel has exactly three unique cards, arrows and three positions',()=>{
  const html = farmTools();
  assert.equal((html.match(/class="ag-carousel-slide"/g)||[]).length,3);
  assert.equal((html.match(/class="ag-tool-card ag-photo-card/g)||[]).length,3);
  assert.equal((html.match(/data-carousel-index=/g)||[]).length,3);
  assert.equal((html.match(/data-carousel-step=/g)||[]).length,2);
});
test('swipe is finite: no clone or wrap; mouse hover after two seconds',()=>{
  const js=readFileSync(new URL('../observatory-carousel.js',import.meta.url),'utf8');
  assert.doesNotMatch(js,/cloneNode|data-carousel-copy|normalizeCenter|asOriginal/);
  assert.match(js,/Math\.min\(slides\.length - 1, value\)/);
  assert.match(js,/hoverTimer = setTimeout\(\(\) => preview\(slide\), 2000\)/);
  assert.match(js,/scrollTo\(/);
  const css=readFileSync(new URL('../workspace-v2.css',import.meta.url),'utf8');
  assert.match(css,/overflow-x: auto/);
  assert.match(css,/touch-action: pan-x/);
  assert.match(css,/scroll-snap-type: x mandatory/);
});
test('photo source dropdown is not visible in the footer',()=>{
  const ws=readFileSync(new URL('../workspace-v2.js',import.meta.url),'utf8');
  assert.doesNotMatch(ws,/\$\{photoCredits\(\)\}/);
  assert.match(ws,/photo-credits\.html/);
});


test('hover enlarges immediately and auto-centers after two seconds',()=>{
  const js=readFileSync(new URL('../observatory-carousel.js',import.meta.url),'utf8');
  assert.match(js,/hoverTimer = setTimeout\(\(\) => preview\(slide\), 2000\)/);
  assert.match(js,/Math\.abs\(geometry\(\)\[target\]\.distance\) > 3/);
  const css=readFileSync(new URL('../workspace-v2.css',import.meta.url),'utf8');
  assert.match(css,/\.ag-carousel-slide:hover \.ag-photo-card/);
  assert.match(css,/scale\(1\.15\)/);
});
test('observatory viewport never vertically scrolls but horizontal swipes remain',()=>{
  const css=readFileSync(new URL('../workspace-v2.css',import.meta.url),'utf8');
  assert.match(css,/body\.rg-app-mode:has\(\.ag-observatory\) \{ height: 100dvh; overflow: hidden/);
  assert.match(css,/grid-template-rows: auto minmax\(0,1fr\) auto/);
  assert.match(css,/touch-action: pan-x/);
  assert.match(css,/overflow-x: auto/);
  assert.match(css,/overflow-y: hidden/);
  assert.match(css,/@media\(max-width:600px\)/);
});
