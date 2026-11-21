import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const get=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('Start, app and favicon use approved scalable ecological logo',()=>{
 const root=get('root-guide.js'),work=get('workspace-v2.js'),index=get('index.html');
 for(const t of [root,work])assert.match(t,/agridelta-eco-logo\.svg/);
 assert.doesNotMatch(root,/agridelta-brand-mark\.webp/);
 assert.doesNotMatch(work,/agridelta-brand-mark\.webp/);
 assert.match(index,/agridelta-eco-symbol\.svg/);
 assert.match(index,/eco-brand\.css/);
 for(const path of ['public/assets/agridelta-eco-logo.svg','public/assets/agridelta-eco-symbol.svg']){
   const asset=get(path);
   assert.match(asset,/^<svg[^>]+viewBox=/);
   assert.match(asset,/fill-rule="evenodd"/);
   assert.match(asset,/linearGradient/);
 }
});
test('Eco wordmark respects compact mobile and app navigation',()=>{
 const css=get('eco-brand.css');
 assert.match(css,/max-width:760px/);
 assert.match(css,/max-width:365px/);
 assert.match(css,/\.ag-app \.ag-brand/);
 assert.match(css,/aspect-ratio:2172\/724/);
});
