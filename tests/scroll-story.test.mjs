import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ROOT_STARTS,clamp01,rootRevealAt,rootCountAt,rootScrollTarget,storyProgress} from '../scroll-story-state.js';

test('scroll progress clamps to the page and handles zero travel',()=>{
 assert.equal(storyProgress(-100,200),0);
 assert.equal(storyProgress(100,200),.5);
 assert.equal(storyProgress(999,200),1);
 assert.equal(storyProgress(0,0),0);
 assert.equal(clamp01(NaN),0);
});

test('five Blender roots grow monotonically and retract on reverse scroll',()=>{
 const samples=[0,.1,.3,.5,.7,1];
 for(let i=0;i<5;i++){
  assert.equal(rootRevealAt(0,i),0);
  assert.equal(rootRevealAt(1,i),1);
  const values=samples.map(p=>rootRevealAt(p,i));
  for(let j=1;j<values.length;j++)assert.ok(values[j]>=values[j-1]);
  for(let j=samples.length-2;j>=0;j--)assert.ok(values[j]<=values[j+1]);
 }
 assert.equal(rootCountAt(0),0);
 assert.equal(rootCountAt(1),5);
 assert.equal(rootScrollTarget(0)>ROOT_STARTS[0],true);
 assert.equal(rootScrollTarget(4)<1,true);
 for(let i=0;i<ROOT_STARTS.length-1;i++)assert.ok(rootScrollTarget(i)<ROOT_STARTS[i+1],'next root button should not skip branches');
});

test('Start scroll story retains real GLB and never blocks vertical wheel scrolling',()=>{
 const script=readFileSync(new URL('../root-guide.js',import.meta.url),'utf8');
 const css=readFileSync(new URL('../start-scroll-story.css',import.meta.url),'utf8');
 const live=readFileSync(new URL('../live-earth.js',import.meta.url),'utf8');
 const fallback=readFileSync(new URL('../video-earth.js',import.meta.url),'utf8');
 assert.ok(script.includes("window.addEventListener('scroll'"));
 assert.ok(script.includes('earth.setScrollRoots(progress)'));
 assert.ok(!script.includes('e.preventDefault();if(newGesture)growNext'));
 assert.ok(css.includes('position:sticky!important'));
 assert.ok(css.includes('overflow-y:auto!important'));
 assert.ok(live.includes('trunk.uniform.value=THREE.MathUtils.smoothstep'));
 assert.ok(fallback.includes('setScrollRoots(progress)'));
});
