import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const get=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const motion=get('interaction-motion.js');
const styles=get('interaction-motion.css');
const original=get('root-guide.css');
const ui=get('root-guide.js');

test('Feature cards no longer receive generic reveal which suppresses scroll animations',()=>{
  const revealLine=motion.split('\n').find(x=>x.startsWith('const REVEALS='));
  assert.ok(revealLine);
  assert.doesNotMatch(revealLine,/start-dock-button/);
  assert.match(motion,/const DOCK_CARDS=/);
  assert.match(motion,/delete card\.dataset\.agReveal/);
  assert.match(ui,/start-feature-dock/);
  assert.match(ui,/data-open-guide="\$\{i\}"/);
});
test('Restores original reversible 3D spread and mobile arrival effects',()=>{
  assert.match(original,/@keyframes guide-spread/);
  assert.match(original,/@keyframes guide-arrival/);
  assert.match(styles,/animation:guide-spread ease-out both/);
  assert.match(styles,/animation-timeline:--guide-deck/);
  assert.match(styles,/animation:guide-arrival ease-out both/);
  assert.match(styles,/perspective:1050px/);
  assert.match(styles,/prefers-reduced-motion:reduce/);
});
test('Unsupported scroll-timeline browsers receive a touch-friendly fallback',()=>{
  assert.match(motion,/CSS\.supports\('animation-timeline: view\(\)'\)/);
  assert.match(motion,/!nativeTimeline&&'IntersectionObserver' in window/);
  assert.match(motion,/dataset\.dockReveal='pending'/);
  assert.match(motion,/dataset\.dockReveal='shown'/);
  assert.match(styles,/data-dock-reveal="pending"/);
  assert.match(styles,/data-dock-reveal="shown"/);
});
