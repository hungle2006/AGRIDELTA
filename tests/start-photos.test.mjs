import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {startPhotos,START_IMAGES,startPhoto} from '../start-photography.js';
test('Start has exactly ten distinct sourced real photos',()=>{
 const photos=startPhotos();
 assert.equal(photos.length,10);
 assert.equal(new Set(photos.map(p=>p.id)).size,10);
 assert.equal(new Set(photos.map(p=>p.source)).size,10);
 photos.forEach(p=>{
  assert.match(p.url,/^https:\/\/images\.unsplash\.com\/photo-/);
  assert.match(p.source,/^https:\/\/unsplash\.com\/photos\//);
  assert.match(p.fallback,/^\/assets\/.*\.webp$/);
  assert.ok(p.alt.length>15);
 });
});
test('cards render srcset, safe local fallback and retain 3D plant & root story',()=>{
 const src=readFileSync(new URL('../root-guide.js',import.meta.url),'utf8');
 const css=readFileSync(new URL('../start-editorial.css',import.meta.url),'utf8');
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 assert.match(startPhoto(START_IMAGES.features[0]),/srcset=/);
 assert.match(src,/startPhoto\(START_IMAGES\.workflow\[i\]/);
 assert.match(src,/startPhoto\(START_IMAGES\.features\[/);
 assert.match(src,/startPhoto\(START_IMAGES\.closing/);
 assert.match(src,/dataset\.photoFallback/);
 assert.match(src,/createLiveEarth/);
 assert.match(src,/createRootEarth/);
 assert.ok(css.includes(START_IMAGES.hero.id));
 assert.ok(html.includes('/start-editorial.css'));
 assert.match(css,/prefers-reduced-motion:reduce/);
});
