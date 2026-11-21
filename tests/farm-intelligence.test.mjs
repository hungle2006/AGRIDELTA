import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {estimateLongwave,createFarmIntelligence} from '../farm-intelligence.js';

test('clear-sky longwave estimate is physically plausible and finite',()=>{
  const result=estimateLongwave(27,70,0);
  assert.ok(result>300&&result<470,'longwave W/m² should be in plausible tropical clear-sky range');
});
test('cloud-fraction adjustment is not interpreted as solar irradiance',()=>{
  const clear=estimateLongwave(25,65,0);
  const overcast=estimateLongwave(25,65,100);
  assert.ok(overcast>clear,'more clouds increases estimated downwelling thermal infrared');
  assert.ok(overcast<500);
});
test('missing or invalid meteorology cannot be used as measured data',()=>{
  assert.equal(estimateLongwave(null,50,50),null);
  assert.equal(estimateLongwave(25,undefined,50),null);
  assert.equal(estimateLongwave(NaN,50,50),null);
  assert.equal(estimateLongwave(-150,50,50),null);
});
test('workspace integrates the three feature tabs and preserves original startup',()=>{
  const ws=readFileSync(new URL('../workspace-v2.js',import.meta.url),'utf8');
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const css=readFileSync(new URL('../farm-intelligence.css',import.meta.url),'utf8');
  assert.ok(ws.includes("intelligence:()=>'<div id=\"ag-ai-root\"></div>'"));
  assert.ok(ws.includes("intelligence.mount"));
  assert.ok(html.includes('farm-intelligence.css'));
  assert.ok(html.includes('/root-guide.js'));
  assert.ok(css.includes('@media(max-width:600px)'));
  assert.equal(typeof createFarmIntelligence,'function');
});
test('optional image AI endpoint never fabricates results without a server key',()=>{
  const api=readFileSync(new URL('../api/plant-diagnose.js',import.meta.url),'utf8');
  assert.ok(api.includes('GEMINI_API_KEY'));
  assert.ok(api.includes('AI_NOT_CONFIGURED'));
  assert.ok(!api.includes('console.log(image)'));
});
