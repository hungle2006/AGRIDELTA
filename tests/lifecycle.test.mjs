import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 advancePlantTime, careAt, HARVEST_SECONDS, LIFECYCLE_SECONDS, nextRoot, plantPhase, stageAt, STAGE_TIMES,
} from '../lifecycle-state.js';
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


test('growth holds the ripe pods until harvest is requested', () => {
 assert.ok(advancePlantTime(0, 1, false) > 1);
 assert.ok(advancePlantTime(0, 1, true) > advancePlantTime(0, 1, false));
 assert.equal(advancePlantTime(0, 20, true), LIFECYCLE_SECONDS);
 assert.equal(advancePlantTime(LIFECYCLE_SECONDS, 30, false), LIFECYCLE_SECONDS);
 assert.equal(plantPhase(LIFECYCLE_SECONDS, false), 'ripe');
 assert.equal(plantPhase(LIFECYCLE_SECONDS, true), 'harvesting');
 assert.equal(advancePlantTime(LIFECYCLE_SECONDS, 30, true), HARVEST_SECONDS);
 assert.equal(plantPhase(HARVEST_SECONDS, true), 'harvested');
 assert.deepEqual([careAt(0),careAt(1),careAt(5),careAt(8)],['','watering','fertilizing','']);
});

test('Blender animates the farm care and lets each pod rest before the next drops', () => {
 const file = readFileSync(new URL('../public/assets/start-lifecycle-live.glb', import.meta.url));
 const jsonLength = file.readUInt32LE(12);
 const gltf = JSON.parse(file.subarray(20,20+jsonLength).toString());
 const clip = gltf.animations[0];

 function values(index, component = 0) {
  const accessor = gltf.accessors[index];
  const view = gltf.bufferViews[accessor.bufferView];
  const width = accessor.type === 'SCALAR' ? 1 : 3;
  const start = 28 + jsonLength + (view.byteOffset ?? 0) + (accessor.byteOffset ?? 0);
  return Array.from({length: accessor.count}, (_, i) => file.readFloatLE(start + (view.byteStride ?? width*4)*i + component*4));
 }

 function track(node, path, component) {
  const {sampler} = clip.channels.find(channel => channel.target.node === node && channel.target.path === path);
  const {input, output} = clip.samplers[sampler];
  const times = values(input);
  return values(output, component).map((value,i) => ({time: times[i], value}));
 }

 const particles = gltf.nodes.flatMap((node,i) => node.extras?.careKind ? [[i,node.extras.careKind]] : []);
 assert.deepEqual(new Set(particles.map(([,kind])=>kind)),new Set(['Water droplet','Fertilizer pellet']));
 particles.forEach(([node]) => {
  const heights = track(node,'translation',1);
  assert.ok(heights.some(({value}) => value>2.5) && heights.some(({value}) => value<.15));
 });

 const pods = gltf.nodes.flatMap((node,i) => Number.isInteger(node.extras?.podIndex) ? [i] : []);
 assert.equal(pods.length,3);
 let previousGone = LIFECYCLE_SECONDS;
 for (const node of pods) {
  const trajectory = track(node,'translation',1);
  const startHeight = trajectory[0].value;
  const falling = trajectory.find(({value}) => value < startHeight-.05);
  const landed = trajectory.find(({time,value}) => time>=falling.time && value < .1);
  const scale = track(node,'scale',0);
  const resting = scale.find(({time,value}) => time>=landed.time+.25 && value>.9);
  const gone = scale.find(({time,value}) => time>=landed.time && value<.01);
  assert.ok(resting && gone && landed.time < resting.time && gone.time > resting.time);
  assert.ok(falling.time > previousGone);
  previousGone = gone.time;
 }
 assert.ok(previousGone <= HARVEST_SECONDS);

});
