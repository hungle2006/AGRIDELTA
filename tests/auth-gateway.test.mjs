import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {authScreen,base64url,OAUTH_VERIFIER_KEY} from '../auth-gateway.js';
const file=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('login-first screen contains Gmail email and real OAuth provider actions',()=>{
 const html=authScreen({configured:false});
 assert.match(html,/data-auth-provider="google"/);
 assert.match(html,/data-auth-email/);
 assert.match(html,/data-auth-provider="facebook"/);
 assert.match(html,/data-auth-provider="github"/);
 assert.match(html,/tenban@gmail.com/);
 assert.match(html,/Gmail/);
 assert.match(html,/Chưa kích hoạt đăng nhập/);
 assert.doesNotMatch(html,/data-enter-demo|Xem thử Demo/);
});
test('email and provider login never display fake success in unconfigured state',()=>{
 const ws=file('workspace-v2.js');
 assert.match(ws,/if\(!authVerified\)\{/);
 assert.match(ws,/authScreen\(/);
 assert.match(ws,/async function authValidate\(/);
 assert.match(ws,/auth\/v1\/user/);
 assert.match(ws,/if\(!cloudAvailable\)/);
 assert.match(ws,/async function finishOAuthRedirect/);
 assert.match(ws,/grant_type=pkce/);
 assert.doesNotMatch(ws,/window\.AGRIDELTAOpenDemo/);
});
test('plant doctor API requires authenticated Supabase account before analysis',()=>{
 const api=file('api/plant-diagnose.js');
 const frontend=file('farm-intelligence.js');
 assert.match(api,/AUTH_NOT_CONFIGURED/);
 assert.match(api,/LOGIN_REQUIRED/);
 assert.match(api,/INVALID_SESSION/);
 assert.match(frontend,/getAccessToken/);
 assert.match(frontend,/Authorization/);
});
test('root redirects entry routes to auth, with explicit optional intro',()=>{
 const root=file('root-guide.js');
 assert.match(root,/else enter\('home', true\)/);
 assert.match(root,/appRoute\.get\('intro'\) === '1'/);
 assert.doesNotMatch(root,/AGRIDELTAOpenDemo/);
});
test('PKCE URL-safe encoding and browser responsive styles exist',()=>{
 assert.equal(base64url(Uint8Array.from([255,238,170])),'_-6q');
 assert.equal(OAUTH_VERIFIER_KEY,'agridelta_pkce_verifier_v1');
 const css=file('auth-gateway.css');
 assert.match(css,/@media\(max-width:740px\)/);
 assert.match(css,/@media\(max-width:390px\)/);
 assert.match(css,/ag-auth-config/);
});
