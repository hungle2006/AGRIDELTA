import {createFarmIntelligence} from './farm-intelligence.js';
import {authScreen} from './auth-gateway.js';
import {firebaseConfigured,watchFirebaseUser,loginWithEmail,registerWithEmail,loginWithProvider,logoutFirebase,getFirebaseToken,sendPasswordRecovery,friendlyFirebaseError} from './firebase-auth.js';
const app=document.querySelector('#app');
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let authUser=null,authVerified=false,authPending=true,authError='',authInfo='',loginMode='login',working=false;
let requestedTab='forecast';
const createIntelligence=()=>createFarmIntelligence({getAccessToken:()=>authVerified?getFirebaseToken():''});
let intelligence=createIntelligence();
function toast(message){const node=app.querySelector('#ag-toast');if(node){node.textContent=message;node.hidden=false;}}
function render(){
  if(!app)return;
  intelligence.detach();
  if(!authVerified){
    app.innerHTML=authScreen({mode:loginMode,error:authError,info:authInfo,configured:firebaseConfigured,pending:authPending});
    return;
  }
  app.innerHTML=`<div class="ag-app">
    <a class="ag-skip" href="#ag-ai-root">Đến nội dung chính</a>
    <header class="ag-top-header">
      <button class="ag-home-brand" data-action="start" aria-label="AGRIDELTA — về trang Start"><img src="/assets/agridelta-eco-logo.svg" width="2172" height="724" alt="AGRIDELTA"></button>
      <div class="ag-account"><span class="ag-account-name" title="${esc(authUser.email||authUser.displayName||'')}">${esc(authUser.displayName||authUser.email||'Tài khoản')}</span><button class="ag-logout" data-action="signout">Đăng xuất</button></div>
    </header>
    <main class="ag-content" id="ag-ai-root" tabindex="-1"></main>
    <footer class="ag-bottom-footer"><span>© 2026 AGRIDELTA</span><span>Hiểu môi trường. Chăm cây tốt hơn.</span></footer>
    <div id="ag-toast" class="ag-toast" role="status" hidden></div>
  </div>`;
  intelligence.mount(app.querySelector('#ag-ai-root'),requestedTab);
}
function navigate(target='forecast'){
  requestedTab=['forecast','doctor','twin'].includes(target)?target:'forecast';
  if(!authVerified){render();return;}
  intelligence.openTab(requestedTab);
  window.scrollTo({top:0,behavior:'instant'});
}
function adoptFirebaseUser(user){
  authPending=false;
  if(authUser?.uid===user?.uid&&authVerified)return;
  intelligence.detach();
  intelligence=createIntelligence();
  authUser=user;authVerified=Boolean(user);authError='';authInfo='';
  if(!user)requestedTab='forecast';
  render();
}
  async function authenticate(form){
    const email=String(form.elements.email?.value||'').trim();
    const password=String(form.elements.password?.value||'');
    if(!email||!password||working)return;
    working=true;authError='';authInfo='';
    try{
      if(loginMode==='register'){
        await registerWithEmail(email,password);
        authInfo='Đăng ký thành công. Bạn đã đăng nhập bằng Firebase.';
      }else{
        await loginWithEmail(email,password);
      }
    }catch(err){authError=friendlyFirebaseError(err);}
    finally{working=false;render();}
  }
  async function startSocial(provider){
    if(working)return;
    working=true;authError='';authInfo='';
    try{
      await loginWithProvider(provider);
    }catch(err){
      if(err?.code!=='auth/popup-closed-by-user'&&err?.code!=='auth/cancelled-popup-request')
        authError=friendlyFirebaseError(err);
    }finally{working=false;render();}
  }
  async function recoverPassword(){
    const email=app.querySelector('#ag-auth-email')?.value?.trim();
    if(!email){authError='Nhập địa chỉ email ở ô bên trên trước khi yêu cầu đặt lại mật khẩu.';render();return;}
    if(working)return;
    working=true;authError='';authInfo='';
    try{
      await sendPasswordRecovery(email);
      authInfo='Nếu email đã đăng ký, Firebase sẽ gửi hướng dẫn đặt lại mật khẩu. Hãy kiểm tra hộp thư.';
    }catch(err){authError=friendlyFirebaseError(err);}
    finally{working=false;render();}
  }
  async function signOut(){
    try{
      await logoutFirebase();
      authInfo='Bạn đã đăng xuất.';
    }catch(err){toast(friendlyFirebaseError(err));}
  }
  async function restoreSession(){
    authPending=true;render();
    try{
      await watchFirebaseUser(
        user=>adoptFirebaseUser(user),
        err=>{authVerified=false;authPending=false;authError=friendlyFirebaseError(err);render();}
      );
    }catch(err){
      authVerified=false;authPending=false;
      authError='Không tải được Firebase Authentication. Kiểm tra Internet hoặc tải lại trang. '+friendlyFirebaseError(err);
      render();
    }
  }

app.addEventListener('click',async event=>{
  const button=event.target.closest('[data-action],[data-auth-provider],[data-auth-switch],[data-auth-email],[data-auth-recover]');
  if(!button)return;
  if(!authVerified){
    if(button.dataset.authProvider){await startSocial(button.dataset.authProvider);return;}
    if(button.hasAttribute('data-auth-email')){app.querySelector('#ag-auth-email')?.focus();return;}
    if(button.hasAttribute('data-auth-recover')){await recoverPassword();return;}
    if(button.hasAttribute('data-auth-switch')){loginMode=loginMode==='register'?'login':'register';authError='';authInfo='';render();}
    return;
  }
  if(button.dataset.action==='start')window.AGRIDELTARootGuide?.open();
  if(button.dataset.action==='signout')await signOut();
});
app.addEventListener('submit',async event=>{
  if(event.target.id!=='ag-login-form')return;
  event.preventDefault();if(!working)await authenticate(event.target);
});
window.AGRIDELTAEnter=navigate;
window.AGRIDELTAOpenAuth=()=>{if(!authVerified)render();};
window.AGRIDELTAWorkspace={open:navigate,version:'5.0',authProvider:'firebase',get authenticated(){return authVerified;}};
render();
restoreSession();
