import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {workflowRevealProgress} from '../workflow-fan.js';
const file = name => readFileSync(new URL('../'+name,import.meta.url),'utf8');
test('three original Start cards separate one by one from a single stack on scroll',()=>{
 const root=file('root-guide.js'),fan=file('workflow-fan.js'),css=file('workflow-fan.css');
 assert.match(root,/data-workflow-fan/);
 assert.match(root,/class="start-workflow-stage"/);
 assert.match(root,/initWorkflowFan\(site\)/);
 assert.match(fan,/items\.length !== 3/);
 assert.match(fan,/progress - \.10/);
 assert.match(fan,/progress - \.51/);
 assert.match(fan,/style\.transform/);
 assert.match(fan,/style\.clipPath/);
 assert.match(fan,/card\.inert = phase < \.97/);
 assert.match(fan,/addEventListener\('scroll',schedule,\{passive:true,signal\}\)/);
 assert.match(css,/position:sticky/);
 assert.match(css,/animation:none!important/);
 assert.match(css,/@media\(max-width:760px\)/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
test('older generic card reveal is disabled, feature-dock motion remains',()=>{
 const motion=file('interaction-motion.js');
 assert.doesNotMatch(motion,/const REVEALS='\.workflow-card/);
 assert.match(motion,/const DOCK_CARDS/);
 assert.match(file('index.html'),/workflow-fan\.css/);
});

test('workflow is fully expanded by the time its heading reaches the visible upper area',()=>{
 assert.equal(workflowRevealProgress(650,700),0);
 assert.ok(workflowRevealProgress(430,700)>0 && workflowRevealProgress(430,700)<1);
 assert.equal(workflowRevealProgress(252,700),1);
 assert.equal(workflowRevealProgress(55,700),1);
 const css=file('workflow-fan.css');
 assert.match(css,/--workflow-travel:clamp\(70px,14svh,150px\)/);
 assert.match(css,/--workflow-travel:clamp\(58px,11svh,112px\)/);
});
