import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ROOT_STARTS,ROOT_ORDER,clamp01,rootRevealAt,rootCountAt,rootScrollTarget,storyProgress} from '../scroll-story-state.js';

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
  if(i===2)assert.ok(rootRevealAt(0,i)>.1,'A small real Blender root should already be visible at the first fold');
  else assert.equal(rootRevealAt(0,i),0);
  assert.equal(rootRevealAt(1,i),1);
  const values=samples.map(p=>rootRevealAt(p,i));
  for(let j=1;j<values.length;j++)assert.ok(values[j]>=values[j-1]);
  for(let j=samples.length-2;j>=0;j--)assert.ok(values[j]<=values[j+1]);
 }
 assert.equal(rootCountAt(0),1);
 assert.equal(rootCountAt(1),5);
 assert.ok(rootScrollTarget(0)>ROOT_STARTS[ROOT_ORDER[0]]);
 assert.equal(rootScrollTarget(4)<1,true);
 assert.deepEqual(ROOT_ORDER,[2,1,3,0,4]);
 for(let i=0;i<ROOT_ORDER.length;i++){
  assert.ok(rootRevealAt(rootScrollTarget(i),ROOT_ORDER[i])>.93,'next root exposes its guide');
  if(i<ROOT_ORDER.length-1)assert.ok(rootScrollTarget(i)<ROOT_STARTS[ROOT_ORDER[i+1]],'next root button should not skip branches');
 }
});

test('Start scroll story keeps native scrolling and clips the Blender geometry by root travel',()=>{
 const script=readFileSync(new URL('../root-guide.js',import.meta.url),'utf8');
 const css=readFileSync(new URL('../start-scroll-story.css',import.meta.url),'utf8');
 const live=readFileSync(new URL('../live-earth.js',import.meta.url),'utf8');
 const fallback=readFileSync(new URL('../earth-fallback.js',import.meta.url),'utf8');
 assert.ok(script.includes("window.addEventListener('scroll'"));
 assert.ok(script.includes('earth.setScrollRoots(progress)'));
 // Passive wheel listeners may restore scrolling after the Start text reveal;
 // native wheel motion must never be intercepted or cancelled.
 assert.match(script,/site\.addEventListener\('wheel', unlockIfIntroVisible, \{passive:true\}\)/);
 assert.doesNotMatch(script,/event\.preventDefault\(\)/);
 assert.match(css,/position:\s*sticky/);
 assert.match(css,/root-scroll-track::after\s*\{/);
 assert.ok(live.includes('vRootTravel > uRootGrowth'));
 assert.ok(fallback.includes("asset('root', index)"));
 assert.ok(fallback.includes('start-lifecycle-film.webm'));
 assert.ok(script.includes('Math.exp(-elapsed/95)'));
 assert.ok(css.includes('.root-story-title'));
});
