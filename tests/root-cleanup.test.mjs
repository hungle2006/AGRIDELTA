import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const file = path => readFileSync(new URL('../'+path, import.meta.url),'utf8');

test('Root discovery removes the five-bar progress and count UI',()=>{
 const js=file('root-guide.js');
 const css=file('root-story-balance.css');
 assert.doesNotMatch(js,/root-progress-text|root-progress-meter|class="root-progress"/);
 assert.doesNotMatch(css,/root-progress-meter|\.root-progress\{/);
 assert.match(js,/class="root-discovery-actions"/);
 assert.match(js,/class="root-story-desc"/);
});
test('All five Blender roots and their navigation still work',()=>{
 const js=file('root-guide.js');
 assert.match(js,/const count = rootCountAt\(progress\)/);
 assert.match(js,/rootScrollTarget\(rootCount\)/);
 assert.match(js,/rootRevealAt\(progress,/);
 assert.match(js,/earth\.setScrollRoots\(progress\)/);
 assert.match(js,/count >= 5 \? `Xem các hướng dẫn/);
 assert.match(js,/data-grow-root/);
 assert.match(js,/id="rg-roots"/);
 const css=file('root-story-balance.css');
 assert.match(css,/\.earth-site \.root-discovery-actions\{/);
 assert.match(css,/@media \(max-width:760px\)/);
});
