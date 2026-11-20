import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const get=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const app=get('workspace-v2.js'), css=get('workspace-v2.css'), html=get('index.html');
test('Start enters a redesigned, actual CRUD workspace, not the mock main.js',()=>{
 assert.match(html,/src="\/workspace-v2\.js"/);
 assert.doesNotMatch(html,/src="\/main\.js"/);
 assert.match(html,/href="\/workspace-v2\.css"/);
 for(const name of ['dashboard','fieldsPage','seasonsPage','tasksPage','observationsPage','ordersPage','settingsPage','saveRecord','removeRecord','toggleTask']) assert.ok(app.includes(name),name);
 assert.match(app,/window\.AGRIDELTAOpenDemo/);
 assert.match(app,/window\.AGRIDELTAOpenAuth/);
});
test('Workspace does not auto-seed fake data or fake authentication',()=>{
 assert.match(app,/const blank = \(\) => Object\.fromEntries/);
 assert.doesNotMatch(app,/defaultFields|startingTasks|demo-note|tài khoản demo/i);
 assert.match(app,/cloudAvailable = Boolean/);
 assert.match(app,/if\(!cloudSession\)/);
 assert.match(app,/indexedDB\.open/);
});
test('UI responds to screens and respects reduced motion',()=>{
 for(const v of ['930px','680px','365px','prefers-reduced-motion','ag-mobile-nav','ag-field-grid','ag-task-columns','ag-dialog'])assert.ok(css.includes(v),v);
});
test('Supabase data policies are owner-restricted and avoid client secrets',()=>{
 const sql=get('supabase/agridelta_records.sql');
 assert.match(sql,/enable row level security/);
 assert.match(sql,/for select to authenticated/);
 assert.match(sql,/for insert to authenticated/);
 assert.match(sql,/for update to authenticated/);
 assert.match(sql,/for delete to authenticated/);
 assert.match(sql,/auth\.uid\(\)\) = user_id/);
 assert.doesNotMatch(app,/service_role/);
});

test('Field photos come from the user and persist in IndexedDB without repeated fake imagery',()=>{
  assert.match(app,/data-image-id/);
  assert.match(app,/kind==='observations'\|\|kind==='fields'/);
  assert.match(app,/node\.prepend\(img\)/);
  assert.match(css,/\.ag-field-cover img/);
});
