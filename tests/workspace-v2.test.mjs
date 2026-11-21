import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {farmTools, photoCredits, farmToolName} from '../farm-intelligence.js';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../workspace-v2.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'');
function setup(){
  let userChanged;const calls=[],events={};
  const app={innerHTML:'',querySelector:()=>({}),addEventListener:(type,fn)=>events[type]=fn};
  const context={mountObservatory:(_,initial)=>{calls.push(['center',initial]);return ()=>{}},farmTools,photoCredits,farmToolName,document:{querySelector:()=>app},window:{scrollTo(){}},authScreen:()=>'<main>Login</main>',firebaseConfigured:true,createFarmIntelligence:()=>({detach:()=>calls.push('detach'),mount:(_,tab)=>calls.push(['mount',tab]),openTab:tab=>calls.push(['tab',tab])}),watchFirebaseUser:async fn=>{userChanged=fn;},getFirebaseToken:async()=>'token'};
  vm.runInNewContext(source,context);
  return {context,app,calls,login:user=>userChanged(user)};
}
test('Unauthenticated routes remain behind real Firebase authentication',()=>{
  const s=setup();assert.match(s.app.innerHTML,/Login/);
  s.context.window.AGRIDELTAEnter('home');
  assert.match(s.app.innerHTML,/Phòng quan sát/);
  assert.deepEqual([...s.app.innerHTML.matchAll(/data-afi-tab="([^"]+)"/g)].map(match=>match[1]),['forecast','doctor','twin']);
  assert.equal((s.app.innerHTML.match(/observatory-\w+\.webp/g)||[]).length,3);
  assert.doesNotMatch(s.app.innerHTML,/Login|ag-sidebar|ag-mobile-nav/);
  s.context.window.AGRIDELTAEnter('twin');s.login(null);
  assert.match(s.app.innerHTML,/Login/);
  assert.equal(s.calls.some(c=>Array.isArray(c)&&c[0]==='mount'),false);
  assert.equal(s.context.window.AGRIDELTAWorkspace.authenticated,false);
});
test('Login always opens forecast before other tools can be selected',()=>{
  const s=setup();s.context.window.AGRIDELTAEnter('twin');
  s.login({uid:'qa',email:'<script>@example.test'});
  assert.deepEqual(s.calls.findLast(c=>Array.isArray(c)&&c[0]==='mount'),['mount','forecast']);
  assert.match(s.app.innerHTML,/&lt;script&gt;/);
  assert.doesNotMatch(s.app.innerHTML,/<aside|ag-sidebar|ag-mobile-nav|data-new|data-go|<script>/);
  for(const tab of ['forecast','doctor','twin']){s.context.window.AGRIDELTAEnter(tab);assert.deepEqual(s.calls.at(-1),['tab',tab]);}
  s.context.window.AGRIDELTAEnter('home');assert.deepEqual(s.calls.at(-1),['center','twin']);
  assert.match(s.app.innerHTML,/observatory-forecast\.webp/);
});
test('Signout detaches active systems and returns to authentication',()=>{
  const s=setup();s.login({uid:'qa'});s.login(null);
  assert.match(s.app.innerHTML,/Login/);assert.equal(s.calls.at(-1),'detach');
  assert.equal(s.context.window.AGRIDELTAWorkspace.authenticated,false);
});

test('Observatory reload centers forecast for guests and opens it for a restored session',()=>{
  const guest=setup();
  guest.context.window.AGRIDELTAEnter('observatory-reload');
  assert.deepEqual(guest.calls.at(-1),['center','forecast']);
  guest.login({uid:'returning-user'});
  assert.ok(guest.calls.some(c=>Array.isArray(c)&&c[0]==='mount'&&c[1]==='forecast'));
  const restored=setup();
  restored.login({uid:'already-ready'});
  restored.context.window.AGRIDELTAEnter('observatory-reload');
  assert.ok(restored.calls.some(c=>Array.isArray(c)&&['mount','tab'].includes(c[0])&&c[1]==='forecast'));
});
