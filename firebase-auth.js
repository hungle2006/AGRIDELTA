/* Firebase Authentication for AGRIDELTA.
 * This file contains only public Firebase Web App config, NOT OAuth secrets.
 * The official Firebase ESM SDK is served from Google's version-pinned CDN
 * so the existing Vite project's dependency lockfile remains unchanged.
 */
export const firebaseConfig=Object.freeze({
  apiKey:"AIzaSyBHCj_9n9CPXOx-fftNmxSdYFjm0xUFTk8",
  authDomain:"agridelta-a40b7.firebaseapp.com",
  projectId:"agridelta-a40b7",
  storageBucket:"agridelta-a40b7.firebasestorage.app",
  messagingSenderId:"608063948790",
  appId:"1:608063948790:web:f17cc1df458263418029d7"
});
export const firebaseConfigured=Boolean(firebaseConfig.apiKey&&firebaseConfig.authDomain);
let sdkPromise;
async function firebaseSDK(){
  if(!sdkPromise)sdkPromise=Promise.all([
    import(/* @vite-ignore */ "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js"),
    import(/* @vite-ignore */ "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js")
  ]).then(([appSDK,authSDK])=>{
    const app=appSDK.getApps().find(a=>a.name==='[DEFAULT]')||appSDK.initializeApp(firebaseConfig);
    const auth=authSDK.getAuth(app);
    auth.languageCode='vi';
    return {auth,api:authSDK};
  }).catch(e=>{sdkPromise=null;throw e;});
  return sdkPromise;
}
export async function watchFirebaseUser(onChange,onFailure){
  const {auth,api}=await firebaseSDK();
  return api.onAuthStateChanged(auth,onChange,onFailure);
}
export async function loginWithEmail(email,password){
  const {auth,api}=await firebaseSDK();
  return api.signInWithEmailAndPassword(auth,email,password);
}
export async function registerWithEmail(email,password){
  const {auth,api}=await firebaseSDK();
  return api.createUserWithEmailAndPassword(auth,email,password);
}
export async function sendPasswordRecovery(email){
  const {auth,api}=await firebaseSDK();
  return api.sendPasswordResetEmail(auth,email);
}
export async function loginWithProvider(provider){
  const {auth,api}=await firebaseSDK();
  const identities={google:api.GoogleAuthProvider,facebook:api.FacebookAuthProvider,github:api.GithubAuthProvider};
  if(!Object.hasOwn(identities,provider))throw Error('Nhà cung cấp đăng nhập không được hỗ trợ');
  const identity=new identities[provider]();
  // Popup preserves the current Vercel origin. Redirect on a different authDomain
  // can fail on browsers that block third-party storage.
  return api.signInWithPopup(auth,identity);
}
export async function logoutFirebase(){
  const {auth,api}=await firebaseSDK();
  return api.signOut(auth);
}
export async function getFirebaseToken(forceRefresh=false){
  const {auth,api}=await firebaseSDK();
  if(!auth.currentUser)return '';
  return api.getIdToken(auth.currentUser,forceRefresh);
}
export function friendlyFirebaseError(err){
  const code=String(err?.code||'');
  const cases={
    'auth/invalid-email':'Email không hợp lệ.',
    'auth/invalid-credential':'Email hoặc mật khẩu chưa đúng.',
    'auth/wrong-password':'Email hoặc mật khẩu chưa đúng.',
    'auth/user-not-found':'Tài khoản không tồn tại.',
    'auth/email-already-in-use':'Email này đã được đăng ký. Hãy đăng nhập hoặc chọn phương thức đã dùng.',
    'auth/weak-password':'Mật khẩu cần ít nhất 6 ký tự (AGRIDELTA yêu cầu 8 ký tự).',
    'auth/operation-not-allowed':'Phương thức này chưa được cho phép trong Firebase Authentication.',
    'auth/unauthorized-domain':'Domain chưa được cấp quyền trong Firebase Authentication → Authorized domains.',
    'auth/account-exists-with-different-credential':'Email đã liên kết với phương thức đăng nhập khác. Hãy dùng phương thức đã đăng ký ban đầu.',
    'auth/popup-blocked':'Trình duyệt chặn cửa sổ đăng nhập. Hãy cho phép pop-up của agridelta.vercel.app rồi thử lại.',
    'auth/popup-closed-by-user':'Bạn đã đóng cửa sổ đăng nhập trước khi hoàn tất.',
    'auth/cancelled-popup-request':'Một cửa sổ đăng nhập khác đang hoạt động.',
    'auth/network-request-failed':'Không kết nối được Firebase. Kiểm tra Internet và thử lại.',
    'auth/too-many-requests':'Có quá nhiều lần thử đăng nhập. Hãy thử lại sau.',
    'auth/user-disabled':'Tài khoản này đã bị vô hiệu hóa.',
    'auth/api-key-not-valid':'Firebase API key không hợp lệ hoặc đang bị hạn chế.',
    'auth/invalid-api-key':'Firebase API key không hợp lệ.',
    'auth/internal-error':'Firebase gặp lỗi tạm thời. Vui lòng thử lại.'
  };
  return cases[code]||'Không hoàn tất được xác thực Firebase'+(code?' ('+code+')':'')+'.';
}
