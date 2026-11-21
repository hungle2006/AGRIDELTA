import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const get=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const root=get('root-guide.js'),layout=get('root-story-balance.css'),html=get('index.html');
test('Visible Unsplash license credit is removed from Start footer',()=>{
  assert.doesNotMatch(root,/start-photo-credit|Unsplash Free License|Ảnh chụp thực tế/);
  assert.match(root,/© 2026 AGRIDELTA/);
  assert.match(html,/root-story-balance\.css/);
});
test('Root story controls use consistent hierarchy and equal mobile touch targets',()=>{
  for(const token of ['root-story-title','root-story-desc','root-progress-meter','root-discovery-actions','root-next','root-skip'])assert.ok(layout.includes(token),token);
  assert.match(layout,/grid-template-areas:"copy" "scene"/);
  assert.match(layout,/min-height:46px/);
  assert.match(layout,/grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/);
  assert.match(layout,/prefers-reduced-motion:reduce/);
  assert.match(root,/data-grow-root/);
  assert.match(root,/data-root-point/);
  assert.match(root,/earth\.setScrollRoots\(progress\)/);
});
