import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const js=readFileSync(new URL('../root-guide.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../start-mobile-clean.css',import.meta.url),'utf8');
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
test('mobile header keeps account and search accessible from menu',()=>{
  assert.match(js,/class="earth-mobile-nav-item" data-search/);
  assert.match(js,/class="earth-mobile-nav-item" data-enter-auth/);
  assert.match(js,/hasAttribute\('data-search'\)/);
  assert.match(js,/hasAttribute\('data-enter-auth'\)/);
  assert.ok(html.includes('/start-mobile-clean.css'));
});
test('mobile layout removes repetitive and decorative elements, preserves 3D and stages',()=>{
  for(const s of ['hero-editorial-note','plant-art-topline','plant-art-side','plant-art-groundnote','hero-bottom-rail'])assert.ok(css.includes(s),s);
  assert.match(css,/max-width:760px/);
  assert.match(css,/max-width:370px/);
  assert.match(js,/id="live-earth"/);
  assert.match(js,/id="lifecycle-label"/);
  assert.match(js,/data-pause/);
  assert.match(js,/id="rg-roots"/);
});
