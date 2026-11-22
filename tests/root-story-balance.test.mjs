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
  for(const token of ['root-story-title','root-story-desc','root-discovery-actions','root-next','root-skip'])assert.ok(layout.includes(token),token);
  assert.doesNotMatch(layout,/root-progress-meter|\.root-progress\{/);
  assert.doesNotMatch(root,/root-progress-text|root-progress-meter|class="root-progress"/);
  assert.match(layout,/grid-template-areas:"copy" "scene"/);
  assert.match(layout,/min-height:46px/);
  assert.match(layout,/prefers-reduced-motion:reduce/);
  assert.match(root,/data-grow-root/);
  assert.match(root,/data-root-point/);
  assert.match(root,/earth\.setScrollRoots\(progress\)/);
});

test('Vietnamese heading keeps safe spacing between Một and bắt on all screens',()=>{
  assert.match(root,/Một mùa vụ<br> bắt đầu từ rễ\./);
  const desktop=layout.match(/\.earth-site \.root-story-title\s*\{[^}]*line-height:([\d.]+)/);
  assert.ok(desktop && Number(desktop[1])>=1.28,'Desktop line-height should clear Vietnamese diacritics');
  const mobile=layout.match(/@media \(max-width:760px\)[\s\S]*?\.earth-site \.root-story-title\s*\{[^}]*line-height:([\d.]+)/);
  assert.ok(mobile && Number(mobile[1])>=1.3,'Mobile line-height should clear Vietnamese diacritics');
});
