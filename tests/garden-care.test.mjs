import test from 'node:test';import assert from 'node:assert/strict';
import {applyCare,normalizeCare,careLimit} from '../garden-care.js';
test('water alone cannot advance, repeated water cannot replace fertilizer',()=>{let s=applyCare(null,'water');assert.equal(s.level,0);s=applyCare(s,'water');assert.equal(s.level,0);assert.equal(careLimit(s),0);s=applyCare(s,'feed');assert.equal(s.level,1);assert.equal(s.water,false);assert.equal(s.feed,false);});
test('both actions in either order required for every growth stage',()=>{let s=null;for(let i=0;i<4;i++){s=applyCare(s,'feed');assert.equal(s.level,i);s=applyCare(s,'water');assert.equal(s.level,i+1);}assert.equal(careLimit(s),27.7);assert.deepEqual(applyCare(s,'feed'),s);});
test('restored state validates corrupt data and preserves partial care',()=>{assert.equal(normalizeCare({level:99}).level,4);assert.equal(normalizeCare({level:'4'}).level,0);assert.deepEqual(applyCare({level:2,water:true},'feed'),{level:3,water:false,feed:false});});
