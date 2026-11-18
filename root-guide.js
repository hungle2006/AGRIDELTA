/* AGRIDELTA ROOTS: scroll-linked, accessible onboarding guide.
   Scroll updates SVG path drawing (browser-safe fallback to animation-timeline).
   Roots introduce actual app destinations. No backend or camera permissions needed. */
(() => {
  'use strict';
  const STEPS = [
    { number:'01', kicker:'BƯỚC ĐẦU TIÊN', title:'Hiểu từng\nmảnh đất.', emphasis:'mảnh đất.', description:'Bắt đầu bằng việc thêm khu canh tác. Đặt tên vườn, ghi diện tích, loại cây trồng và trạng thái để mọi thứ có một nơi bắt đầu rõ ràng.', action:'Mở quản lý cánh đồng', page:'fields', icon:'▦', tip:'Cánh đồng → Thêm khu canh tác', side:'left' },
    { number:'02', kicker:'GIEO ĐÚNG THỜI ĐIỂM', title:'Gieo một\nmùa vụ mới.', emphasis:'mùa vụ mới.', description:'Tạo kế hoạch gieo trồng theo từng mùa: giống cây, thời gian bắt đầu, ngày dự kiến thu hoạch và các ghi chú trong suốt hành trình.', action:'Xem lịch mùa vụ', page:'season', icon:'◷', tip:'Mùa vụ → Tạo mùa vụ', side:'right' },
    { number:'03', kicker:'THÓI QUEN NUÔI DƯỠNG', title:'Mỗi ngày\nmột việc nhỏ.', emphasis:'một việc nhỏ.', description:'Lập lịch tưới, kiểm tra đất, bổ sung dinh dưỡng và đánh dấu đã hoàn thành. Những việc nhỏ đều góp phần nuôi cây khỏe mạnh.', action:'Bắt đầu công việc', page:'home', icon:'☑', tip:'Tổng quan → Việc cần làm', side:'left' },
    { number:'04', kicker:'HỌC CÁCH QUAN SÁT', title:'Lắng nghe\ntừng chiếc lá.', emphasis:'từng chiếc lá.', description:'Dùng camera hoặc tải ảnh từ thiết bị để ghi nhận tình trạng cây. Tính năng hiện xem trước hình ảnh, không đưa ra chẩn đoán AI chưa được kiểm chứng.', action:'Đi tới góc quan sát', page:'scan', icon:'◎', tip:'Góc quan sát → Chụp hoặc tải ảnh', side:'right' },
    { number:'05', kicker:'TRÁI NGỌT CỦA SỰ CHĂM SÓC', title:'Tốt tươi\ntừ gốc rễ.', emphasis:'từ gốc rễ.', description:'Khi mùa vụ sẵn sàng, tạo và theo dõi đơn hàng. Mỗi mùa vụ khép lại cũng là khởi đầu của một vòng sinh trưởng mới.', action:'Khám phá đơn hàng', page:'orders', icon:'✳', tip:'Đơn hàng → Tạo đơn hàng', side:'left' }
  ];
  const rootMarkup=`<section class="rg-app" role="dialog" aria-modal="true" aria-labelledby="rg-title" id="rg-app">
  <header class="rg-header"><a href="#rg-intro" class="rg-brand" aria-label="AGRIDELTA — về phần giới thiệu"><span class="rg-mark">✳</span> AGRI<strong>DELTA</strong><small>GROW FROM WITHIN</small></a><div class="rg-header-right"><span class="rg-small-status"><span class="rg-dot"></span> BẢN ĐỒ KHÁM PHÁ</span><button class="rg-exit" type="button" id="rg-exit">Vào ứng dụng <span aria-hidden="true">↗</span></button></div></header>
  <div class="rg-scroll" id="rg-scroll" tabindex="0" aria-label="Cuộn để khám phá 5 nhánh rễ dẫn đến các hướng dẫn sử dụng">
   <div class="rg-intro" id="rg-intro"><span class="rg-eyebrow">A FIELD GUIDE BY AGRIDELTA · 2026</span><h1 id="rg-title">Muốn vươn cao,<br>hãy <em>bắt đầu từ rễ.</em></h1><p>Cùng hạt giống khám phá 5 nhánh rễ. Mỗi lần bạn cuộn xuống, một nhánh mới mở ra và dẫn tới cách sử dụng AGRIDELTA.</p><div class="rg-scrollhint"><span class="rg-mouse"><span></span></span> CUỘN XUỐNG ĐỂ CÂY TỎA RỄ <b>↓</b></div></div>
   <div class="rg-layout">
    <div class="rg-roots-panel"><span class="rg-visual-caption">NHỮNG ĐIỀU TỐT ĐẸP BẮT ĐẦU TỪ BÊN DƯỚI</span>
      <svg class="rg-root-svg" id="rg-root-svg" viewBox="0 0 600 850" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Mầm cây phía trên mặt đất, bộ rễ chính và năm nhánh rễ mở dần theo vị trí cuộn"><defs>
        <linearGradient id="rg-root-grad" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#dfc399"/><stop offset=".56" stop-color="#ae8457"/><stop offset="1" stop-color="#6b4d30"/></linearGradient>
        <linearGradient id="rg-shoot" x1="0" y1="1" x2="0.6" y2="0"><stop stop-color="#4b713a"/><stop offset=".5" stop-color="#93b95d"/><stop offset="1" stop-color="#d4e7a3"/></linearGradient>
        <radialGradient id="rg-halo"><stop stop-color="#bad682" stop-opacity=".27"/><stop offset="1" stop-color="#bad682" stop-opacity="0"/></radialGradient>
      </defs>
      <ellipse cx="306" cy="101" rx="123" ry="120" fill="url(#rg-halo)" />
      <path class="rg-plant-stalk" d="M301 216 C288 177 310 141 301 90" stroke="url(#rg-shoot)" stroke-width="10" stroke-linecap="round" fill="none"/>
      <path d="M301 162 C243 173 207 125 209 110 C264 108 299 129 301 162Z" fill="#72984c"/><path d="M301 150 C327 99 372 94 401 100 C384 147 339 169 301 150Z" fill="#a0be70"/><path d="M298 119 C272 77 300 43 307 30 C330 65 320 99 298 119Z" fill="#b1cf81"/>
      <path d="M210 111 Q265 141 302 161 M304 150 Q353 122 398 101" fill="none" stroke="#cadc9c" stroke-width="2" opacity=".8"/>
      <path d="M105 216 Q306 206 506 216" stroke="#8e7455" stroke-width="3" fill="none" opacity=".9"/>
      <path class="rg-root-path rg-main-root" data-threshold="0" d="M301 215 C286 251 310 273 304 309 C294 369 315 407 305 469 C297 523 302 581 296 636 C295 706 308 748 298 820" stroke="url(#rg-root-grad)" stroke-width="9" stroke-linecap="round" fill="none"/>
      <path class="rg-root-path rg-subroot" data-threshold="0.03" d="M304 279 C275 276 260 296 223 315 S157 318 114 340" stroke="url(#rg-root-grad)" stroke-width="6" fill="none"/>
      <path class="rg-root-path rg-subroot" data-threshold="0.2" d="M307 366 C350 360 363 386 408 398 S464 410 516 426" stroke="url(#rg-root-grad)" stroke-width="5.7" fill="none"/>
      <path class="rg-root-path rg-subroot" data-threshold="0.4" d="M305 469 C268 458 235 494 193 521 S141 543 85 550" stroke="url(#rg-root-grad)" stroke-width="5" fill="none"/>
      <path class="rg-root-path rg-subroot" data-threshold="0.6" d="M297 569 C345 564 357 588 409 614 S475 642 534 655" stroke="url(#rg-root-grad)" stroke-width="4.4" fill="none"/>
      <path class="rg-root-path rg-subroot" data-threshold="0.79" d="M299 689 C272 677 231 712 195 750 S135 786 105 806" stroke="url(#rg-root-grad)" stroke-width="4.4" fill="none"/>
      <path class="rg-root-path rg-fibrous" data-threshold="0.1" d="M245 310 Q218 290 191 299 M215 322 Q187 343 168 369 M278 264 Q255 244 234 251 M297 402 Q275 426 245 428" stroke="#99744d" stroke-width="2" fill="none"/>
      <path class="rg-root-path rg-fibrous" data-threshold="0.33" d="M393 396 Q417 368 447 373 M425 401 Q447 430 485 445 M295 507 Q335 521 354 538" stroke="#99744d" stroke-width="2" fill="none"/>
      <path class="rg-root-path rg-fibrous" data-threshold="0.57" d="M208 511 Q193 478 175 478 M172 538 Q155 565 130 579 M297 616 Q258 637 257 665" stroke="#99744d" stroke-width="1.8" fill="none"/>
      <path class="rg-root-path rg-fibrous" data-threshold="0.77" d="M432 629 Q447 598 477 605 M491 642 Q511 664 532 677 M183 755 Q155 733 128 744 M153 772 Q140 799 118 819" stroke="#99744d" stroke-width="1.6" fill="none"/>
      ${[[114,340],[516,426],[85,550],[534,655],[105,806]].map(([x,y],i)=>`<g class="rg-node" data-index="${i}" transform="translate(${x} ${y})"><circle r="25" class="rg-node-glow"/><circle r="12" class="rg-node-core"/><text y="5" text-anchor="middle">${i+1}</text></g>`).join('')}
      </svg><div class="rg-index"><span>ROOT SYSTEM / 05 BRANCHES</span><b id="rg-count">01<span> / 05</span></b></div>
    </div>
    <div class="rg-chapters">${STEPS.map((c,i)=>`<article class="rg-chapter" data-step="${i}" id="rg-step-${i+1}" aria-labelledby="rg-title-${i}"><div class="rg-chapter-inner"><span class="rg-chapter-no">${c.number} / 05 <i></i> ${c.kicker}</span><span class="rg-chapter-symbol" aria-hidden="true">${c.icon}</span><h2 id="rg-title-${i}">${c.title.replace('\n','<br>').replace(c.emphasis,`<em>${c.emphasis}</em>`)}</h2><p>${c.description}</p><div class="rg-how"><span>CÁCH SỬ DỤNG</span><strong>${c.tip}</strong></div><button class="rg-open-feature" type="button" data-root-page="${c.page}">${c.action} <span aria-hidden="true">↗</span></button></div></article>`).join('')}</div>
   </div>
   <footer class="rg-end"><span>✳</span><h2>Rễ vững, cây xanh.<br><em>Hành trình bắt đầu từ bạn.</em></h2><p>Bây giờ bạn đã biết 5 chức năng cơ bản. Hãy vào khu vườn của mình.</p><button type="button" id="rg-end-enter">Bước vào AGRIDELTA <span aria-hidden="true">↗</span></button><button type="button" id="rg-start-over">Xem lại bộ rễ ↑</button><small>AGRI<span>DELTA</span> · CULTIVATING A BETTER FUTURE</small></footer>
  </div><div class="rg-progress-side"><span id="rg-progress-label">01</span><div><i id="rg-progress-fill"></i></div><span>05</span></div>
  <span class="rg-live" id="rg-live" role="status" aria-live="polite"></span>
 </section>`;
 let container=null, scroller=null, rAF=0, lengths=[], lastFocus=null, reduced=false, active=-1;
 const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
 function draw(){rAF=0;if(!container||!scroller)return;
   const max=Math.max(1,scroller.scrollHeight-scroller.clientHeight);let progress=clamp(scroller.scrollTop/max);
   const main=container.querySelector('.rg-main-root');
   if(main)main.style.strokeDashoffset=String(lengths[0]*(1-(reduced?1:clamp((progress-.05)/.85))));
   container.querySelectorAll('.rg-root-path').forEach((p,i)=>{
     if(i===0)return;
     let th=Number(p.dataset.threshold||0), amount=reduced?1:clamp((progress-th)/.17);
     p.style.strokeDashoffset=String(lengths[i]*(1-amount));
     p.style.opacity=String(.35+amount*.65);
   });
   const chapters=[...container.querySelectorAll('.rg-chapter')];
   let index=0;const center=scroller.getBoundingClientRect().top+scroller.clientHeight*.54;
   for(let i=0;i<chapters.length;i++)if(chapters[i].getBoundingClientRect().top<center)index=i;
   const guideTop=container.querySelector('.rg-layout').offsetTop;
   if(scroller.scrollTop<guideTop-120)index=-1;
   if(active!==index){active=index;container.querySelectorAll('.rg-node').forEach((n,i)=>n.classList.toggle('rg-node-active',i===index));chapters.forEach((c,i)=>c.classList.toggle('rg-chapter-active',i===index));if(index>=0){container.querySelector('#rg-live').textContent=`Hướng dẫn ${index+1}/5: ${STEPS[index].kicker}`;container.querySelector('#rg-count').innerHTML=`0${index+1}<span> / 05</span>`;}}
   container.querySelector('#rg-progress-label').textContent=`0${Math.max(1,index+1)}`;
   container.querySelector('#rg-progress-fill').style.height=(progress*100)+'%';
 }
 const schedule=()=>{if(!rAF)rAF=requestAnimationFrame(draw)};
 function open(){
   if(container){container.hidden=false;document.body.classList.add('rg-open');scroller.scrollTop=0;active=-2;schedule();container.querySelector('#rg-exit').focus({preventScroll:true});return;}
   lastFocus=document.activeElement;
   container=document.createElement('div');container.innerHTML=rootMarkup;container=container.firstElementChild;document.body.appendChild(container);scroller=container.querySelector('#rg-scroll');reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   container.querySelectorAll('.rg-root-path').forEach(p=>{const l=p.getTotalLength();lengths.push(l);p.style.strokeDasharray=String(l);p.style.strokeDashoffset=String(l)});
   container.querySelector('#rg-exit').addEventListener('click',close);
   container.querySelector('#rg-end-enter').addEventListener('click',()=>go('home'));
   container.querySelector('#rg-start-over').addEventListener('click',()=>scroller.scrollTo({top:0,behavior:reduced?'instant':'smooth'}));
   container.querySelectorAll('[data-root-page]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.rootPage)));
   container.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close()}if(e.key==='Tab'){
     const focusable=[...container.querySelectorAll('button,a[href],[tabindex="0"]')].filter(el=>el.offsetWidth||el.offsetHeight);
     const first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
   }});
   scroller.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule,{passive:true});
   document.body.classList.add('rg-open');schedule();container.querySelector('#rg-exit').focus({preventScroll:true});
 }
 function close(){if(!container)return;container.hidden=true;document.body.classList.remove('rg-open');lastFocus?.focus?.({preventScroll:true})}
 function go(page){close();if(window.AGRIDELTAOpenDemo)window.AGRIDELTAOpenDemo(page)}
 window.AGRIDELTARootGuide={open,close,go};
})();
