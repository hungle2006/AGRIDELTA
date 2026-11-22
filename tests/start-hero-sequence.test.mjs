import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const file = name => readFileSync(new URL('../'+name,import.meta.url),'utf8');
test('Start waits for Blender completion before revealing the intro from the left',()=>{
 const js=file('root-guide.js'), css=file('start-hero-sequence.css');
 assert.match(js,/data-hero-entrance="growing"/);
 assert.match(js,/if \(phase !== 'growing'\) revealHeroAfterGrowth\(\)/);
 assert.match(js,/hero\.dataset\.heroEntrance = 'complete'/);
 assert.match(js,/heroCopy\.inert = true/);
 assert.match(file('index.html'),/start-hero-sequence\.css/);
 assert.match(css,/--hero-center-offset/);
 assert.match(css,/translate3d\(-64px,0,0\)/);
 assert.match(css,/transition-delay:810ms/);
 assert.match(css,/@media\(max-width:900px\)/);
});
