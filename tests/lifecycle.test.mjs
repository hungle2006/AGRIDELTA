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
 assert.match(j.asset.generator, /Blender|glTF-Transform/);
 assert.equal(j.animations.length,1);
 assert.ok(j.animations[0].channels.length>40);
 const roots=j.nodes.filter(n=>Number.isInteger(n.extras?.rootIndex));
 assert.deepEqual(roots.map(n=>n.extras.rootIndex).sort(),[0,1,2,3,4]);
 for(const root of roots){
  assert.equal(root.children.length,2);
  for(const child of root.children)assert.ok(j.meshes[j.nodes[child].mesh].primitives[0].attributes._ROOT_TRAVEL!==undefined);
 }
 assert.equal(j.nodes.filter(n=>n.name.startsWith('Connected internode')).length,6);
 assert.ok(j.nodes.some(n=>n.name==='Connected internode 1' && n.extras?.rootCollar));
 assert.equal(j.nodes.filter(n=>n.name.startsWith('Leaf branch from node')).length,5);
 assert.ok(j.nodes.some(n=>n.name==='Blender soil cutaway'));assert.ok(j.nodes.some(n=>n.name.includes('Fruit bean pod')));assert.ok(j.nodes.some(n=>n.name.includes('Blossom')));
 const last=Math.max(...j.animations[0].samplers.map(s=>j.accessors[s.input].max[0]));assert.ok(last>27);
});
