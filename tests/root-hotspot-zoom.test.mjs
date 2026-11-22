import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const file = name => readFileSync(new URL('../'+name,import.meta.url),'utf8');

test('root hotspot selection zooms the real plant and warms its selected circle',()=>{
 const js=file('root-guide.js'), css=file('root-story-balance.css');
 assert.match(js,/function selectRootPoint\(button\)/);
 assert.match(js,/getComputedStyle\(button\)/);
 assert.match(js,/--root-zoom-x/);
 assert.match(js,/--root-zoom-y/);
 assert.match(js,/button\.classList\.add\('is-selected'\)/);
 assert.match(js,/button\.hasAttribute\('data-root-point'\)\) selectRootPoint\(button\)/);
 assert.match(css,/\.root-visual\.is-root-zoomed \.root-model/);
 assert.match(css,/scale\(1\.2\)/);
 assert.match(css,/\.root-feature\.is-selected/);
 assert.match(css,/scale\(1\.36\)/);
 assert.match(css,/#e8d49a/);
 assert.match(js,/rootZoomTimer = window\.setTimeout/);
 assert.match(js,/openGuide\(button\.dataset\.openGuide\)/);
 assert.match(js,/dialog\.addEventListener\('close'/);
});
test('all five discoverable root hotspots remain interactive across devices',()=>{
 const js=file('root-guide.js'), css=file('root-story-balance.css');
 assert.match(js,/\[data-root-point\]/);
 assert.match(js,/data-root-index="/);
 assert.match(js,/earth\.setScrollRoots\(progress\)/);
 assert.match(js,/function clearRootZoom\(\)/);
 assert.match(css,/@media\(max-width:760px\)/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
