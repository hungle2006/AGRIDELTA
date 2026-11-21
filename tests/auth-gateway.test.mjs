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
test('Account data and image keys are scoped by Firebase user, legacy import is opt-in',()=>{
 const ws=file('workspace-v2.js');
 assert.match(ws,/firebaseUserStorageKey/);
 assert.match(ws,/scopedPhotoKey/);
 assert.match(ws,/localStorage\.setItem\(firebaseUserStorageKey\(authUser\.uid\)/);
 assert.match(ws,/normalize\(read\(firebaseUserStorageKey\(user\.uid\),blank\(\)\)\)/);
 assert.match(ws,/if\(!confirm\('Nhập dữ liệu AGRI cũ/);
 assert.doesNotMatch(ws,/VITE_SUPABASE_URL|cloudSession|remoteSave|remoteRemove/);
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
