import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 advancePlantTime, careAt, HARVEST_SECONDS, LIFECYCLE_SECONDS, GROWTH_RATE, SCROLL_GROWTH_RATE, HARVEST_RATE, nextRoot, plantPhase, stageAt, STAGE_TIMES, POD_FALL_DIRECTIONS, podFallOffset,
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
 assert.ok(advancePlantTime(0, 1, false) > 0);
 assert.ok(advancePlantTime(0, 1, false) < 1.2,'Seedling should advance smoothly at double speed');
 assert.equal(advancePlantTime(0, 1, false), advancePlantTime(0, 1, true),'Scrolling does not accelerate growth');
 assert.equal(advancePlantTime(0, 60, true), LIFECYCLE_SECONDS);
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

test('Bean grows smoothly across all five stages in roughly 27 seconds at double speed',()=>{
 assert.equal(GROWTH_RATE,SCROLL_GROWTH_RATE);
 assert.equal(GROWTH_RATE,1.04);
 assert.ok(LIFECYCLE_SECONDS/GROWTH_RATE>=25 && LIFECYCLE_SECONDS/GROWTH_RATE<=30);
 assert.ok(HARVEST_RATE>0 && HARVEST_RATE<1);
 const stages=[0,2.5,7.5,17.4,22.5,LIFECYCLE_SECONDS];
 for(let i=1;i<stages.length;i++)assert.ok((stages[i]-stages[i-1])/GROWTH_RATE>2);
 const play=scroll=>Array.from({length:15},()=>1).reduce((t,delta)=>advancePlantTime(t,delta,scroll),0);
 assert.equal(play(false),play(true));
 assert.ok(play(false)<LIFECYCLE_SECONDS);
});
test('No pause button or pause logic is shipped in the Start experience',()=>{
 const root=readFileSync(new URL('../root-guide.js',import.meta.url),'utf8');
 const live=readFileSync(new URL('../live-earth.js',import.meta.url),'utf8');
 assert.doesNotMatch(root,/data-pause|plantControl|togglePause|Tạm dừng chuyển động/);
 assert.doesNotMatch(live,/togglePause|paused\s*=/);
 assert.match(root,/id="live-earth"/);
 assert.match(root,/id="lifecycle-label"/);
});

test('The three pods move to the left, right and downward only when falling',()=>{
  assert.deepEqual(POD_FALL_DIRECTIONS,[-1,1,0]);
  for(let i=0;i<3;i++)assert.equal(podFallOffset(i,2.2,2.2).x,0);
  const left=podFallOffset(0,2.2,.4);
  const right=podFallOffset(1,2.2,.4);
  const down=podFallOffset(2,2.2,.4);
  assert.ok(left.x < -.8 && right.x > .8);
  assert.equal(down.x,0);
  assert.equal(down.tilt,0);
  const renderer=readFileSync(new URL('../live-earth.js',import.meta.url),'utf8');
  assert.match(renderer,/pod\.ripeY = pod\.node\.position\.y/);
  assert.match(renderer,/node\.position\.x \+= x/);
});
