import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../root-guide.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../start-composition.css',import.meta.url),'utf8');
const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');
test('Start has actual three-zone storytelling with real source photo and live Blender',()=>{
 for(const token of ['hero-editorial-note','START_IMAGES.hero','plant-art','plant-controls','lifecycle-label','hero-bottom-rail','id="live-earth"','href="#rg-roots"']) assert.ok(html.includes(token),token);
 assert.doesNotMatch(html,/stageReadout\.innerHTML/);
 assert.ok(index.includes('/start-composition.css'));
 assert.match(css,/grid-template-columns:minmax\(0,1fr\) clamp\(175px,14vw,230px\)/);
});
test('The stage rail stacks to horizontal on phones and keeps the plant visible',()=>{
 assert.match(css,/@media\s*\(max-width:600px\)/);
 assert.match(css,/grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/);
 assert.match(css,/\.plant-art\s*\{\s*height:clamp\(288px,78vw,410px\)/);
 assert.match(css,/width:min\(96cqw,96cqh\)/);
 assert.match(css,/prefers-reduced-motion:reduce/);
});
