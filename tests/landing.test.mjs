import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {FEATURES,guideIndex,searchGuides} from '../root-guide-data.js';
test('horizontal root navigation wraps correctly in either direction',()=>{
 assert.equal(guideIndex(-1),4);assert.equal(guideIndex(5),0);assert.equal(guideIndex(-6),4);assert.equal(guideIndex(13),3);
});
test('guide search accepts Vietnamese diacritics and unaccented phone input',()=>{
 assert.ok(searchGuides('canh dong').some(x=>x.feature.page==='fields'));
 assert.ok(searchGuides('mùa vụ').some(x=>x.feature.page==='season'));
 assert.equal(searchGuides('not-a-real-guide').length,0);
 assert.equal(searchGuides('').length,5);
});
test('every guide connects to a unique usable workflow and a projected Blender root',()=>{
 const layout=JSON.parse(readFileSync(new URL('../public/assets/earth-layout.json',import.meta.url)));
 assert.equal(layout.length,FEATURES.length);assert.equal(new Set(FEATURES.map(f=>f.page)).size,5);
 layout.forEach((p,i)=>{assert.ok(p.x>5&&p.x<95);assert.ok(p.y>50&&p.y<85);if(i)assert.ok(layout[i-1].x<p.x);assert.equal(FEATURES[i].instructions.length,3);});
 for(const name of ['earth-ground-v2','guide-orb-v2',...FEATURES.map((_,i)=>`earth-plant-${i}`),...FEATURES.map((_,i)=>`earth-root-focus-${i}`)])assert.ok(statSync(new URL(`../public/assets/${name}.webp`,import.meta.url)).size>1000);
});
