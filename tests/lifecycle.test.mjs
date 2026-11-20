import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stageAt,nextRoot,STAGE_TIMES} from '../lifecycle-state.js';
test('one deliberate gesture unlocks one new branch, retaining previous branches',()=>{
 let count=0,active=-1;for(let i=0;i<5;i++){const next=nextRoot(count,active);assert.deepEqual(next,{count:i+1,index:i});count=next.count;active=next.index;}
 assert.deepEqual(nextRoot(count,active),{count:5,index:0});assert.deepEqual(nextRoot(5,0,-1),{count:5,index:4});
});
test('lifecycle includes flower and fruit after germination in botanical order',()=>{
 assert.deepEqual(STAGE_TIMES.map(stageAt),[0,1,2,3,4]);assert.equal(stageAt(28),4);
 const b=readFileSync(new URL('../public/assets/start-lifecycle-live.glb',import.meta.url));const j=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)).toString());
 assert.ok(j.asset.generator.includes('glTF-Transform')); assert.ok(j.animations[0].channels.length>40);
 assert.equal(j.nodes.filter(n=>Number.isInteger(n.extras?.rootIndex)&&n.extras.rootIndex>=0).length,5);
 assert.ok(j.nodes.some(n=>n.name==='Blender soil cutaway'));assert.ok(j.nodes.some(n=>n.name.includes('Tomato red fruit')));assert.ok(j.nodes.some(n=>n.name.includes('Blossom')));
 const last=Math.max(...j.animations[0].samplers.map(s=>j.accessors[s.input].max[0]));assert.ok(last>27);
});

test('automatic care and root anatomy survive the optimized Blender export',()=>{
 const b=readFileSync(new URL('../public/assets/start-lifecycle-live.glb',import.meta.url));const g=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)).toString());
 const roots=g.nodes.filter(n=>Number.isInteger(n.extras?.rootIndex));assert.equal(roots.length,6);
 roots.forEach(n=>{assert.equal(n.extras.connectedCollar,true);assert.deepEqual(n.extras.growthOrigin,[0,.2516,-.03]);g.meshes[n.mesh].primitives.forEach(p=>assert.ok(p.attributes._ROOT_TRAVEL!==undefined));});
 const water=g.nodes.filter(n=>n.extras?.automaticCare==='water'),feed=g.nodes.filter(n=>n.extras?.automaticCare==='feed');assert.equal(water.length,15);assert.equal(feed.length,10);
 for(const n of [...water,...feed])assert.ok(g.animations[0].channels.some(c=>c.target.node===g.nodes.indexOf(n)&&c.target.path==='translation'));
 const red=g.materials.find(m=>m.name==='Ripe tomato red').pbrMetallicRoughness.baseColorFactor;assert.ok(red[0]>.6&&red[1]<.03&&red[2]<.02);
 const ui=readFileSync(new URL('../root-guide.js',import.meta.url),'utf8');assert.ok(!ui.includes('data-care='));assert.ok(!ui.includes('readCare'));
});
