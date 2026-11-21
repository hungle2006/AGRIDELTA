/* Dedicated AGRIDELTA authentication screen. */
const e = value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const providers=[['google','Google'],['facebook','Facebook'],['github','GitHub']];

export function authScreen({mode='login',error='',info='',configured=false,pending=false,feature=''}={}){
  const signup=mode==='register';
  const heading=signup?'Tạo tài khoản':'Đăng nhập';
  const description=signup?'Tạo tài khoản để sử dụng các công cụ canh tác.':feature?'Đăng nhập để mở '+e(feature)+'.':'Đăng nhập để tiếp tục vào Phòng quan sát.';
  return `<main class="ag-auth" id="ag-auth" aria-labelledby="ag-auth-heading">
    <div class="ag-auth-visual">
      <img class="ag-auth-visual-image" src="/assets/observatory-forecast.webp" width="1080" height="720" alt="">
      <div class="ag-auth-visual-copy">
        <p>Đọc dấu hiệu<br>từ đồng ruộng.</p>
        <a href="https://commons.wikimedia.org/wiki/File:Water_reflection_of_mountains,_hut,_green_rice_sheaves_scattered_in_a_paddy_field_and_clouds_with_blue_sky_in_Vang_Vieng,_Laos.jpg">Ảnh Basile Morin</a>
        <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>
      </div>
    </div>
    <div class="ag-auth-content">
      <header class="ag-auth-header">
        <a class="ag-auth-logo" href="/start" aria-label="AGRIDELTA · Start 3D"><img src="/assets/agridelta-eco-logo.svg" width="2172" height="724" alt="AGRIDELTA"></a>
        <button type="button" class="ag-auth-back" data-action="workspace"><span aria-hidden="true">←</span> Phòng quan sát</button>
      </header>
      <section class="ag-auth-form-wrap">
        <header class="ag-auth-intro">
          <h1 id="ag-auth-heading">${heading}</h1>
          <p class="ag-auth-sub">${description}</p>
        </header>
        ${pending?`<div class="ag-auth-wait" role="status"><span class="ag-auth-spinner"></span> Đang xác minh tài khoản…</div>`:`
          ${error?`<p class="ag-auth-error" role="alert">${e(error)}</p>`:''}
          ${info?`<p class="ag-auth-info" role="status">${e(info)}</p>`:''}
          ${configured?'':'<p class="ag-auth-config" role="status">Chưa kích hoạt đăng nhập cho AGRIDELTA.</p>'}
          <form id="ag-login-form" class="ag-auth-form">
            <label for="ag-auth-email" data-auth-email>Email</label>
            <input id="ag-auth-email" type="email" name="email" placeholder="tenban@gmail.com" autocomplete="email" maxlength="254" required>
            <div class="ag-auth-label-row"><label for="ag-auth-password">Mật khẩu</label>${signup?'':'<button class="ag-auth-text-button" type="button" data-auth-recover>Quên mật khẩu?</button>'}</div>
            <input id="ag-auth-password" type="password" name="password" placeholder="Nhập mật khẩu" minlength="8" maxlength="128" autocomplete="${signup?'new-password':'current-password'}" required>
            <button class="ag-auth-submit" type="submit">${heading}<span aria-hidden="true">→</span></button>
          </form>
          <div class="ag-auth-divider">Hoặc tiếp tục với</div>
          <div class="ag-auth-social" aria-label="Đăng nhập bằng tài khoản liên kết">
            ${providers.map(([key,name])=>`<button type="button" data-auth-provider="${key}"><span class="ag-auth-provider" aria-hidden="true"></span>${name}</button>`).join('')}
          </div>
          <p class="ag-auth-switch">${signup?'Đã có tài khoản?':'Chưa có tài khoản?'} <button type="button" class="ag-auth-text-button" data-auth-switch>${signup?'Đăng nhập':'Đăng ký'}</button></p>`}
      </section>
    </div>
  </main>`;
}
