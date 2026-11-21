/* Dedicated AGRIDELTA authentication screen; never displays fake accounts. */
const e = value=>String(value==null?'':value).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
export function authScreen({mode='login',error='',info='',configured=false,pending=false}={}){
  const signup=mode==='register';
  const heading=signup?'Bắt đầu mùa vụ mới.':'Chào mừng trở lại.';
  return '<main class="ag-auth" id="ag-auth" aria-labelledby="ag-auth-heading">'+
   '<section class="ag-auth-visual" aria-label="AGRIDELTA nông nghiệp thông minh">'+
    '<div class="ag-auth-visual-image"></div>'+
    '<div class="ag-auth-visual-inner">'+
      '<a class="ag-auth-logo" href="/" aria-label="AGRIDELTA — Trang Start"><img src="/assets/agridelta-eco-logo.svg" alt="AGRIDELTA" /></a>'+
      '<span class="ag-auth-eyebrow">NỀN TẢNG NÔNG NGHIỆP THÔNG MINH</span>'+
      '<h2>Mỗi mùa xanh,<br><em>một hành trình mới.</em></h2>'+
      '<p>Kết nối dữ liệu nông trại, quan sát cây trồng và dự báo môi trường trong một không gian riêng của bạn.</p>'+
      '<div class="ag-auth-chips"><span>AI Plant Doctor</span><span>Infrared Forecast</span><span>Digital Twin 3D</span></div>'+
    '</div>'+
    '<div class="ag-auth-visual-bottom"><span>AGRIDELTA / FIELD INTELLIGENCE</span><span>© 2026</span></div>'+
   '</section>'+
   '<section class="ag-auth-content"><div class="ag-auth-form-wrap">'+
    '<div class="ag-auth-mobile-brand"><img src="/assets/agridelta-eco-logo.svg" alt="AGRIDELTA"></div>'+
    '<span class="ag-auth-kicker">TÀI KHOẢN AGRIDELTA</span>'+
    '<h1 id="ag-auth-heading">'+heading+'</h1>'+
    '<p class="ag-auth-sub">'+(signup?'Tạo tài khoản cá nhân để quản lý trang trại và dữ liệu riêng.':'Đăng nhập để quản lý nông trại, dự báo và theo dõi cây trồng.')+'</p>'+
    (pending?'<div class="ag-auth-wait" role="status"><span class="ag-auth-spinner"></span> Đang xác minh tài khoản…</div>':
      '<div class="ag-auth-form-body">'+
       (error?'<div class="ag-auth-error" role="alert">'+e(error)+'</div>':'')+
       (info?'<div class="ag-auth-info" role="status">'+e(info)+'</div>':'')+
       (!configured?'<div class="ag-auth-config" role="status"><strong>Chưa kích hoạt đăng nhập</strong><span>AGRIDELTA cần được kết nối với dự án Supabase riêng trước khi sử dụng các tài khoản thật. Không có chế độ demo hoặc tài khoản giả.</span></div>':'')+
       '<div class="ag-auth-social">'+
        '<button type="button" data-auth-email><span class="ag-auth-provider ag-auth-gmail" aria-hidden="true">✉</span>Tiếp tục bằng Gmail / Email</button>'+
        '<button type="button" data-auth-provider="google"><span class="ag-auth-provider ag-auth-google" aria-hidden="true">G</span>Tiếp tục với Google <small>(Gmail)</small></button>'+
        '<button type="button" data-auth-provider="facebook"><span class="ag-auth-provider ag-auth-facebook" aria-hidden="true">f</span>Tiếp tục với Facebook</button>'+
        '<button type="button" data-auth-provider="github"><span class="ag-auth-provider ag-auth-github" aria-hidden="true">GH</span>Tiếp tục với GitHub</button>'+
       '</div>'+
       '<div class="ag-auth-divider"><span>Đăng nhập bằng email và mật khẩu</span></div>'+
       '<form id="ag-login-form" class="ag-auth-form"><label for="ag-auth-email">Email (có thể dùng Gmail)</label>'+
        '<input id="ag-auth-email" type="email" name="email" placeholder="tenban@gmail.com" autocomplete="email" maxlength="254" required />'+
        '<label for="ag-auth-password">Mật khẩu</label>'+
        '<input id="ag-auth-password" type="password" name="password" placeholder="Nhập mật khẩu" minlength="8" maxlength="128" autocomplete="'+(signup?'new-password':'current-password')+'" required />'+
        '<button class="ag-auth-submit" type="submit">'+(signup?'Tạo tài khoản':'Đăng nhập')+' <span aria-hidden="true">→</span></button>'+
       '</form>'+
       '<div class="ag-auth-switch">'+(signup?'Đã có tài khoản?':'Chưa có tài khoản?')+' <button type="button" data-auth-switch>'+(signup?'Đăng nhập':'Đăng ký ngay')+'</button></div>'+
       '<p class="ag-auth-assurance">Thông tin cá nhân được lưu riêng theo tài khoản. Các nhà cung cấp chỉ được sử dụng khi kết nối OAuth hợp lệ.</p>'+
      '</div>')+
     '</div></section>'+
   '</main>';
}
export const OAUTH_VERIFIER_KEY='agridelta_pkce_verifier_v1';
export const base64url=bytes=>btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
export async function beginOAuth({endpoint,provider,callback=window.location.origin+'/auth/callback'}){
 if(!['google','facebook','github'].includes(provider))throw Error('Nhà cung cấp không được hỗ trợ');
 if(!endpoint)throw Error('AGRIDELTA chưa kết nối dịch vụ xác thực.');
 if(!window.crypto?.subtle)throw Error('Trình duyệt cần kết nối HTTPS để đăng nhập an toàn.');
 const verifier=base64url(crypto.getRandomValues(new Uint8Array(48)));
 const hash=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier)));
 sessionStorage.setItem(OAUTH_VERIFIER_KEY,JSON.stringify({value:verifier,created:Date.now()}));
 const url=new URL(endpoint+'/auth/v1/authorize');
 url.searchParams.set('provider',provider);
 url.searchParams.set('redirect_to',callback);
 url.searchParams.set('code_challenge',base64url(hash));
 url.searchParams.set('code_challenge_method','s256');
 window.location.assign(url.toString());
}
export function consumePKCEVerifier(){
 const raw=sessionStorage.getItem(OAUTH_VERIFIER_KEY);
 sessionStorage.removeItem(OAUTH_VERIFIER_KEY);
 if(!raw)return null;
 try{const item=JSON.parse(raw);if(typeof item.value==='string'&&Date.now()-item.created<10*60*1000)return item.value;}catch{}
 return null;
}
