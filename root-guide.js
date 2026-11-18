/* AGRIDELTA · THE LIVING ROOTS — a continuous, scroll-driven field guide.
 * No slideshow, modal or scroll hijacking. JavaScript only controls SVG stroke progress,
 * accessible highlights, and transitions into the existing farm-management demo.
 */
(() => {
  'use strict';
  const instructions = [
    {num:'01',eyebrow:'KHU VƯỜN ĐẦU TIÊN',name:'Cánh đồng',tag:'Ghi dấu từng thửa đất.',copy:'Mọi mùa vụ đều bắt đầu từ một mảnh đất. Thêm khu vực canh tác để quản lý diện tích, cây trồng và độ ẩm ghi nhận.',steps:['Chọn mục Cánh đồng trong ứng dụng.','Nhấn “Thêm khu canh tác”, nhập tên và diện tích.','Xem thông tin và cập nhật khi khu vườn thay đổi.'],page:'fields',action:'Tạo khu canh tác',side:'left',icon:'▦'},
    {num:'02',eyebrow:'GIEO GÌ, KHI NÀO?',name:'Mùa vụ',tag:'Chọn đúng mùa để gieo.',copy:'Lên kế hoạch mùa vụ để không bỏ lỡ những thời điểm quan trọng của khu vườn.',steps:['Mở Mùa vụ trong thanh điều hướng.','Thêm tên mùa vụ, khu vực và ngày bắt đầu.','Dùng danh sách mùa vụ để theo dõi tiến độ.'],page:'season',action:'Lập kế hoạch mùa vụ',side:'right',icon:'◷'},
    {num:'03',eyebrow:'CHĂM CÂY MỖI NGÀY',name:'Công việc',tag:'Tốt lên từ việc nhỏ.',copy:'Một thói quen tưới nước và chăm sóc đều đặn có thể thay đổi cả mùa màng.',steps:['Vào Tổng quan để xem việc cần làm.','Nhấn dấu +, nhập việc, khu vực và thời gian.','Đánh dấu hoàn thành hoặc xoá việc đã không cần.'],page:'home',action:'Xem công việc hôm nay',side:'left',icon:'✓'},
    {num:'04',eyebrow:'NHÌN THẬT GẦN',name:'Quan sát',tag:'Lắng nghe từng chiếc lá.',copy:'Ghi lại những thay đổi bằng hình ảnh thực tế, để bạn hiểu khu vườn qua từng thời điểm.',steps:['Mở mục Quan sát cây trồng.','Cho phép camera hoặc tải ảnh từ thiết bị.','Xem trước ảnh; ứng dụng demo chưa chẩn đoán bệnh bằng AI.'],page:'scan',action:'Mở góc quan sát',side:'right',icon:'◎'},
    {num:'05',eyebrow:'TỪ MÙA VỤ ĐẾN NGƯỜI DÙNG',name:'Đơn hàng',tag:'Thu hoạch điều tốt đẹp.',copy:'Ghi lại số lượng sản phẩm, khách hàng và đơn hàng để quản lý vụ mùa thuận tiện hơn.',steps:['Chọn Đơn hàng trong ứng dụng.','Tạo đơn mới với sản phẩm và số lượng.','Theo dõi, kiểm tra và xoá các đơn thử nghiệm.'],page:'orders',action:'Quản lý đơn hàng',side:'left',icon:'↗'}
  ];
  const roots=[
    ['M314 198 C305 245 324 259 312 315 C299 384 323 402 311 460 C302 522 314 563 307 637 C299 700 318 751 302 861',0,11],
    ['M314 299 C272 283 251 309 225 317 C179 335 152 327 105 356',.04,8],
    ['M312 392 C355 383 385 405 420 423 C464 444 494 432 548 465',.21,7],
    ['M310 494 C271 478 240 507 208 528 C158 561 145 551 82 578',.40,6],
    ['M309 612 C355 593 388 632 432 646 C479 662 502 685 563 692',.59,5],
    ['M305 730 C261 714 233 748 201 784 C169 816 129 808 93 854',.76,4.7],
    ['M272 311 Q243 284 204 292 M235 319 Q216 343 180 367 M284 276 Q258 258 241 266 M295 361 Q269 380 239 382',.13,2.6],
    ['M379 407 Q408 377 448 382 M450 436 Q480 463 514 454 M314 462 Q338 470 360 493',.30,2.2],
    ['M233 514 Q213 482 180 488 M185 541 Q169 569 135 599 M317 545 Q348 552 363 578',.50,2.1],
    ['M442 643 Q464 612 500 614 M501 665 Q531 678 572 679 M211 785 Q177 767 145 771 M145 817 Q129 840 100 861',.68,1.9]
  ];
  const rootSVG=`<svg viewBox="0 0 640 900" id="rg-root-drawing" class="rg-root-drawing" aria-hidden="true" preserveAspectRatio="xMidYMid meet"><defs>
    <linearGradient id="rg-wood" x1="0" y1="0" x2="1" y2=".2"><stop stop-color="#d5aa72"/><stop offset=".48" stop-color="#a87849"/><stop offset="1" stop-color="#533926"/></linearGradient>
    <linearGradient id="rg-stem" x1="0" y1="1" x2="1" y2="0"><stop stop-color="#427b3e"/><stop offset=".5" stop-color="#80b65e"/><stop offset="1" stop-color="#bad587"/></linearGradient>
    <linearGradient id="rg-leaf" x1="0" y1="1" x2="1" y2="0"><stop stop-color="#3c7839"/><stop offset=".54" stop-color="#83b75b"/><stop offset="1" stop-color="#c9dd8d"/></linearGradient>
    <radialGradient id="rg-light"><stop stop-color="#e6db98" stop-opacity=".3"/><stop offset="1" stop-color="#e6db98" stop-opacity="0"/></radialGradient>
    <filter id="rg-glow"><feGaussianBlur stdDeviation="6"/></filter>
  </defs>
  <ellipse cx="316" cy="130" rx="190" ry="188" fill="url(#rg-light)"/>
  <g class="rg-shoot-graphic"><path d="M314 202 Q303 160 318 110 Q327 74 311 40" fill="none" stroke="url(#rg-stem)" stroke-width="10" stroke-linecap="round"/>
   <path d="M312 142 Q252 154 204 107 Q218 78 261 96 Q296 110 312 142Z" fill="url(#rg-leaf)"/>
   <path d="M314 125 Q330 71 401 88 Q389 132 314 125Z" fill="url(#rg-leaf)"/>
   <path d="M311 71 Q279 38 312 3 Q343 37 311 71Z" fill="#a6cb71"/>
   <g stroke="#d7e7ac" stroke-width="1.6" opacity=".7" fill="none"><path d="M312 141Q267 112 207 107 M314 125Q353 95 398 90 M311 70Q318 35 313 8"/><path d="M264 117l-21 -4m42 12-20 -24m70 4 20-20m-9 29 27-9"/></g>
  </g>
  <path d="M45 198Q187 187 314 198Q445 205 608 195" fill="none" stroke="#b18a61" stroke-width="3" opacity=".7"/>
  <g class="rg-root-lines">${roots.map(([d,t,w],i)=>`<path class="rg-growing-root ${i===0?'rg-taproot':''}" d="${d}" data-threshold="${t}" stroke="url(#rg-wood)" stroke-width="${w}" stroke-linecap="round" fill="none"/>`).join('')}</g>
  ${[[105,356],[548,465],[82,578],[563,692],[93,854]].map(([x,y],i)=>`<g class="rg-root-node" data-node="${i}" transform="translate(${x} ${y})"><circle r="26" class="rg-node-halo"/><circle r="15" class="rg-node-face"/><text text-anchor="middle" dominant-baseline="middle">${i+1}</text></g>`).join('')}
 </svg>`;
  const cards=instructions.map((step,index)=>`<article class="rg-guide-card" id="rg-step-${index+1}" data-step="${index}" aria-labelledby="rg-step-title-${index}"><div class="rg-card-top"><span class="rg-step-number">${step.num} / 05</span><span class="rg-step-name">${step.eyebrow}</span></div><span class="rg-card-icon" aria-hidden="true">${step.icon}</span><h3 id="rg-step-title-${index}">${step.tag}</h3><p>${step.copy}</p><details class="rg-howto" ${index===0?'open':''}><summary>Xem cách sử dụng <span aria-hidden="true">＋</span></summary><ol>${step.steps.map(s=>`<li>${s}</li>`).join('')}</ol></details><button type="button" class="rg-step-cta" data-enter-page="${step.page}">${step.action}<span aria-hidden="true">↗</span></button></article>`).join('');
  const html=`<div id="rg-site" class="rg-site"><a class="rg-skip-link" href="#rg-guide">Bỏ qua phần giới thiệu, xem hướng dẫn</a>
    <header class="rg-nav"><a class="rg-logo" href="#rg-top" aria-label="AGRIDELTA, về đầu trang"><span class="rg-logo-mark">✳</span><span>AGRI<b>DELTA</b><small>GROW WITH NATURE</small></span></a><nav aria-label="Điều hướng hành trình"><a href="#rg-guide">Hướng dẫn sử dụng</a><a href="#rg-end">Khám phá</a><button data-enter-page="home" class="rg-nav-btn">Vào ứng dụng <span>↗</span></button></nav></header>
    <main><section class="rg-hero" id="rg-top" aria-label="Chào mừng đến AGRIDELTA">
      <div class="rg-hero-grain" aria-hidden="true"></div><div class="rg-hero-light" aria-hidden="true"></div>
      <div class="rg-hero-copy"><div class="rg-micro"><span class="rg-line"></span> AGRIDELTA · HÀNH TRÌNH XANH</div><h1>Để cây vươn cao,<br>hãy bắt đầu <em>từ rễ.</em></h1><p>Mỗi hạt giống mang một câu chuyện. Hãy cuộn xuống để theo dấu mầm non, để bộ rễ dẫn bạn khám phá cách chăm sóc từng mảnh đất.</p>
        <div class="rg-hero-actions"><a class="rg-primary" href="#rg-guide">Khám phá từ bộ rễ <span aria-hidden="true">↓</span></a><button type="button" data-enter-page="home" class="rg-plain">Vào khu vườn <span>↗</span></button></div><div class="rg-hero-note"><span class="rg-dot"></span> KHÔNG GIAN NÔNG NGHIỆP TÁI SINH</div></div>
      <div class="rg-hero-art"><div class="rg-orbit rg-orbit-1"></div><div class="rg-orbit rg-orbit-2"></div><div class="rg-photo-fallback" aria-hidden="true"><img src="/assets/harvest-hero.webp" alt=""/></div>
       <model-viewer id="rg-plant-model" class="rg-plant-model" src="/assets/agridelta_seed_to_harvest_model.glb" alt="Mô hình 3D mầm cây xanh với đất, thân, lá có gân và hệ rễ" camera-controls auto-rotate rotation-per-second="4deg" auto-rotate-delay="0" interaction-prompt="none" shadow-intensity="1.1" shadow-softness="0.75" exposure="1.18" environment-image="neutral" camera-orbit="-35deg 72deg 5.8m" field-of-view="28deg" min-camera-orbit="auto auto 3.2m" max-camera-orbit="auto auto 9m" loading="eager" reveal="auto" poster="/assets/harvest-hero.webp"></model-viewer>
       <div class="rg-visual-tag"><span>LIVE GROWTH STUDY</span><strong>01 <i>/</i> 05</strong></div></div>
      <a href="#rg-guide" class="rg-scroll-note"><span class="rg-scroll-icon">↓</span><span>CUỘN XUỐNG<br><b>ĐỂ KHÁM PHÁ</b></span></a>
    </section>
    <section class="rg-guide" id="rg-guide" aria-labelledby="rg-guide-title"><div class="rg-guide-heading"><span class="rg-micro">DƯỚI LÒNG ĐẤT · THE ROOT SYSTEM</span><h2 id="rg-guide-title">Mỗi nhánh rễ,<br><em>một điều bạn cần biết.</em></h2><p>Cuộn tự nhiên để bộ rễ lan rộng. Chạm vào mỗi hướng dẫn và mở thẳng chức năng tương ứng trong ứng dụng.</p></div>
      <div class="rg-guide-layout"><aside class="rg-root-sticky" aria-label="Hệ rễ sinh trưởng theo vị trí cuộn"><div class="rg-root-earth"></div><div class="rg-root-label">FROM SEED <span>TO PURPOSE</span></div>${rootSVG}<div class="rg-root-footer"><span>HỆ RỄ · <b id="rg-node-counter">00 / 05</b></span><span>SCROLL TO GROW ↓</span></div></aside>
        <div class="rg-guide-cards">${cards}</div></div></section>
    <section class="rg-finish" id="rg-end"><div class="rg-finish-glow" aria-hidden="true">✳</div><span class="rg-micro">MỘT MÙA VỤ TỐT BẮT ĐẦU TỪ BẠN</span><h2>Gốc rễ đã vững.<br><em>Bây giờ, hãy gieo điều tốt đẹp.</em></h2><p>Bạn đã khám phá năm nhánh rễ. Hãy bước vào ứng dụng để bắt đầu hành trình canh tác của chính mình.</p><div class="rg-finish-actions"><button type="button" class="rg-primary" data-enter-page="home">Bắt đầu khám phá ứng dụng <span>↗</span></button><a href="#rg-top" class="rg-plain">Về đầu trang ↑</a></div><small>© 2026 AGRIDELTA · GROW WITH NATURE</small></section>
    </main><div class="rg-reader-status" id="rg-reader-status" aria-live="polite"></div></div>`;
  const container=document.createElement('div');container.innerHTML=html;const site=container.firstElementChild;document.body.insertBefore(site,document.getElementById('app'));document.body.classList.add('rg-experience-mode');
  const rootPaths=[...site.querySelectorAll('.rg-growing-root')].map(el=>({el,len:el.getTotalLength(),th:Number(el.dataset.threshold)}));rootPaths.forEach(({el,len})=>{el.style.strokeDasharray=`${len}`;el.style.strokeDashoffset=`${len}`});
  const nodes=[...site.querySelectorAll('.rg-root-node')];const chapters=[...site.querySelectorAll('.rg-guide-card')];const sticky=site.querySelector('.rg-root-sticky');const guide=site.querySelector('#rg-guide');const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;let active=-1,raf=0;
  const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));
  function paint(){raf=0;if(site.hidden)return;const begin=guide.getBoundingClientRect().top+window.scrollY;const size=Math.max(100,guide.offsetHeight-window.innerHeight*.42);const progress=clamp((window.scrollY+window.innerHeight*.55-begin)/size);
    rootPaths.forEach(({el,len,th},i)=>{const total=i===0?clamp((progress-.01)/.95):clamp((progress-th)/.23);el.style.strokeDashoffset=String(len*(1-(reduce?total:total*total*(3-2*total))));el.style.opacity=String(.16+.84*total)});
    let ix=-1;const compare=window.innerHeight*(window.innerWidth<690?.77:.57);chapters.forEach((c,i)=>{if(c.getBoundingClientRect().top<compare)ix=i});if(guide.getBoundingClientRect().top>window.innerHeight*.7)ix=-1;
    if(ix!==active){active=ix;chapters.forEach((c,i)=>c.classList.toggle('rg-current',i===ix));nodes.forEach((n,i)=>n.classList.toggle('rg-illuminated',i<=ix));site.querySelector('#rg-node-counter').textContent=`0${Math.max(0,ix+1)} / 05`;if(ix>=0)site.querySelector('#rg-reader-status').textContent=`Hướng dẫn ${ix+1} trong 5: ${instructions[ix].name}`}
    sticky.style.setProperty('--rg-scroll-progress',String(progress));
  }
  const schedule=()=>{if(!raf)raf=requestAnimationFrame(paint)};
  function enter(page='home'){site.hidden=true;document.body.classList.remove('rg-experience-mode');document.body.classList.add('rg-app-mode');if(window.AGRIDELTAOpenDemo)window.AGRIDELTAOpenDemo(page);window.scrollTo({top:0,behavior:'instant'});setTimeout(()=>{document.querySelector('#main-content, .auth-panel')?.focus?.({preventScroll:true})},30)}
  function open(){document.body.classList.remove('rg-app-mode');document.body.classList.add('rg-experience-mode');site.hidden=false;window.scrollTo({top:0,behavior:'instant'});active=-1;schedule();site.querySelector('.rg-nav-btn')?.focus({preventScroll:true})}
  site.querySelectorAll('[data-enter-page]').forEach(el=>el.addEventListener('click',()=>enter(el.dataset.enterPage||'home')));
  const mdl=site.querySelector('#rg-plant-model');if(mdl){mdl.addEventListener('load',()=>site.classList.add('rg-model-loaded'));mdl.addEventListener('error',()=>site.classList.add('rg-model-failed'));}
  window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule,{passive:true});document.addEventListener('visibilitychange',schedule);window.AGRIDELTARootGuide={open,close:()=>enter('home'),go:enter};
  // Preserve a compatible entry for legacy replay buttons in the existing app.
  window.AGRIDELTAStory={replay:open};
  schedule();
})();
