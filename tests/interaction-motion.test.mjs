import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const get=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const js=get('interaction-motion.js'),css=get('interaction-motion.css'),app=get('workspace-v2.js'),root=get('root-guide.js'),index=get('index.html');
test('Motion on touch is delegated, passive, and respects reduced motion',()=>{
 for(const token of ['pointerdown','pointercancel','IntersectionObserver','prefers-reduced-motion: reduce'])assert.ok(js.includes(token),token);
 for(const token of ['hover:hover','pointer:coarse','touch-action:manipulation','font-size:16px!important','prefers-reduced-motion:reduce'])assert.ok(css.includes(token),token);
 assert.doesNotMatch(css,/transition:\s*all\b/);
 assert.match(index,/interaction-motion\.css/);
 assert.match(root,/initAgrideltaMotion\(site\)/);
});
