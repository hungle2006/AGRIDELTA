import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL(`../${p}`,import.meta.url));
const source=read('root-guide.js').toString();
const bytes=read('public/assets/living-growth.glb');
const gltf=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());
const binaryOffset=20+bytes.readUInt32LE(12)+8;
function values(index){const a=gltf.accessors[index],v=gltf.bufferViews[a.bufferView];assert.equal(a.componentType,5126);const count=a.count*({SCALAR:1,VEC3:3,VEC4:4}[a.type]);return Array.from({length:count},(_,i)=>bytes.readFloatLE(binaryOffset+(v.byteOffset||0)+(a.byteOffset||0)+4*i));}
test('growth is one synchronized 16-second clip with independently growing plant parts',()=>{
 assert.equal(gltf.animations.length,1);
 const clip=gltf.animations[0];
 assert.ok(clip.channels.length>=25);
 const targets=clip.channels.map(c=>gltf.nodes[c.target.node].name);
 for(const part of ['Seed shell left','Seed shell right','Stem internode 00','Cotyledon west','True leaf 01','Apical young leaf'])assert.ok(targets.includes(part),part);
 const scales=clip.channels.filter(c=>c.target.path==='scale');
 assert.ok(scales.length>=20);
 for(const c of scales){const a=values(clip.samplers[c.sampler].output);assert.ok(a[0]<.01);assert.ok(a.at(-1)>.9);}
 const times=clip.samplers.flatMap(s=>values(s.input));assert.ok(Math.max(...times)>15&&Math.max(...times)<17);
 assert.ok(clip.channels.every(c=>!/Soil|Camera/.test(gltf.nodes[c.target.node].name)));
 assert.ok(gltf.images?.length>0,'embedded leaf texture');
});
test('each guide opens the corresponding working app route',()=>{
 for(const p of ['fields','season','home','scan','orders'])assert.ok(source.includes(`page:'${p}'`));
 assert.ok(!source.includes('auto-rotate'));
 assert.ok(source.includes('repetitions:1'));
 assert.ok(source.includes('prefers-reduced-motion'));
 assert.ok(source.includes('IntersectionObserver'));
});
