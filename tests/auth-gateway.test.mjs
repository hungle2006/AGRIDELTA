import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {authScreen} from '../auth-gateway.js';
import {firebaseConfig,firebaseConfigured,friendlyFirebaseError} from '../firebase-auth.js';
const file=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('Firebase configuration matches the dedicated AGRIDELTA application',()=>{
 assert.equal(firebaseConfig.projectId,'agridelta-a40b7');
 assert.equal(firebaseConfig.authDomain,'agridelta-a40b7.firebaseapp.com');
 assert.ok(firebaseConfigured);
 const sdk=file('firebase-auth.js');
 for(const feature of ['GoogleAuthProvider','FacebookAuthProvider','GithubAuthProvider','signInWithEmailAndPassword','createUserWithEmailAndPassword','onAuthStateChanged','signOut','sendPasswordResetEmail'])
   assert.ok(sdk.includes(feature),feature);
 assert.doesNotMatch(sdk,/supabase\.co|grant_type=pkce/i);
});
test('Start is public by default and explicit app routes require Firebase authentication',()=>{
 const root=file('root-guide.js');
 const workspace=file('workspace-v2.js');
 assert.match(root,/else open\(\)/);
 assert.match(root,/appRoute\.get\('app'\) === '1'/);
 assert.match(root,/window\.location\.pathname\.startsWith\('\/auth\/'\)/);
 assert.match(workspace,/if\(!authVerified\)/);
 assert.match(workspace,/watchFirebaseUser/);
 assert.match(workspace,/getFirebaseToken/);
 assert.match(workspace,/window\.AGRIDELTAEnter/);
 assert.doesNotMatch(workspace,/window\.AGRIDELTAOpenDemo/);
});
test('Login form provides four requested choices and password recovery',()=>{
 const html=authScreen({configured:true});
 for(const provider of ['google','facebook','github'])assert.ok(html.includes('data-auth-provider="'+provider+'"'));
 assert.match(html,/data-auth-email/);
 assert.match(html,/data-auth-recover/);
 assert.match(html,/ag-auth-email/);
 assert.match(html,/ag-auth-password/);
 assert.doesNotMatch(html,/Chưa kích hoạt đăng nhập/);
 const copy=authScreen({configured:true,mode:'register'});
 assert.match(copy,/Tạo tài khoản/);
});
test('Plant Doctor verifies Firebase token on server before calling AI',()=>{
 const api=file('api/plant-diagnose.js');
 const client=file('farm-intelligence.js');
 assert.match(api,/identitytoolkit\.googleapis\.com\/v1\/accounts:lookup/);
 assert.match(api,/INVALID_FIREBASE_SESSION/);
 assert.match(api,/LOGIN_REQUIRED/);
 assert.match(client,/await getAccessToken\(\)/);
 assert.doesNotMatch(api,/VITE_SUPABASE_URL|auth\/v1\/user/);
});
test('Firebase error display is user friendly',()=>{
 assert.match(friendlyFirebaseError({code:'auth/unauthorized-domain'}),/Domain/);
 assert.match(friendlyFirebaseError({code:'auth/popup-blocked'}),/pop-up/);
});


test('Login and signup prevent document scrolling while fitting the viewport',()=>{
 const css=file('auth-gateway.css');
 assert.match(css,/html:has\(\.ag-auth\), body:has\(\.ag-auth\)/);
 assert.match(css,/body:has\(\.ag-auth\) #app \{ height: 100dvh; min-height: 0; overflow: hidden/);
 assert.match(css,/\.ag-auth \{[\s\S]*?max-height: 100dvh;/);
 assert.match(css,/\.ag-auth-visual \{ height: 100%; min-height: 0;/);
 assert.match(css,/grid-template-rows: auto minmax\(0,1fr\)/);
 assert.match(css,/@media\(max-width:820px\)/);
 assert.match(css,/@media\(max-height:650px\)/);
 assert.match(css,/overflow-y: auto;/);
});
 
test('Login form uses consistent label and section spacing',()=>{
 const css=file('auth-gateway.css');
 assert.match(css,/Authentication typography rhythm/);
 assert.match(css,/\.ag-auth-intro \{[\s\S]*?row-gap: clamp\(6px,1\.1dvh,11px\)/);
 assert.match(css,/\.ag-auth-form > label \{[\s\S]*?margin: 0 0 8px/);
 assert.match(css,/\.ag-auth-form > \.ag-auth-label-row \{[\s\S]*?margin: clamp\(14px,2\.5dvh,22px\) 0 8px/);
 assert.match(css,/\.ag-auth-switch \{[\s\S]*?line-height: 1\.6/);
 assert.match(css,/@media\(max-height:640px\)/);
});
test('Authentication image contains no visible attribution links',()=>{
 const html=authScreen({configured:true});
 assert.match(html,/class="ag-auth-visual-image"/);
 assert.match(html,/Đọc dấu hiệu/);
 assert.doesNotMatch(html,/Ảnh Basile Morin|CC BY-SA 4\.0|creativecommons\.org|commons\.wikimedia\.org/);
 const credits=file('public/photo-credits.html');
 assert.match(credits,/Basile Morin/);
 assert.match(credits,/CC BY-SA 4\.0/);
});
