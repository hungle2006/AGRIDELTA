import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
const read=p=>readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
const page=read('root-guide.js');
const css=read('root-guide.css');
const html=read('index.html');
const files=['fields','seasons','tasks','observation','orders'];

test('one continuous scroll story replaces legacy slideshow',()=>{
  assert.match(page,/ag-root-layout/);
  assert.match(page,/ag-root-path/);
  assert.match(page,/strokeDashoffset/);
  assert.ok(!html.includes('src="/intro.js"'));
});

test('all five features have real instructions and routes',()=>{
  for(const f of files)assert.ok(page.includes(`image:'${f}'`),`missing ${f}`);
  for(const p of ['fields','season','home','scan','orders'])assert.ok(page.includes(`page:'${p}'`),`missing route ${p}`);
  assert.match(page,/ag-modal-steps/);
});

test('3d, fallback imagery, logo and responsive layouts exist',()=>{
  assert.match(page,/model-viewer/);
  assert.match(page,/seedling-photo.png/);
  assert.match(page,/ag-logo-icon/);
  for(const width of ['720px','390px'])assert.ok(css.includes(`max-width:${width}`));
  assert.ok(statSync(new URL('../public/assets/agridelta_seed_to_harvest_model.glb',import.meta.url)).size>250000);
  assert.ok(statSync(new URL('../public/assets/sunrise-farm.webp',import.meta.url)).size>100000);
});
