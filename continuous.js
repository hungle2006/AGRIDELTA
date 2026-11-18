/* AGRIDELTA · Continuous Roots — a natural scrollytelling experience */
(()=>{'use strict';
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const original=window.AGRIDELTARootGuide;if(!original)return;
 const root=()=>document.getElementById('rg-app');
 // Reuse the existing five branch cards, preserving their working app destinations.
 const baseOpen=original.open,baseClose=original.close,baseGo=original.go;
 function paint(){
  const box=root();if(!box||box.hidden)return;
  const guide=box.querySelector('.rg-layout');if(!guide)return;
  const rect=guide.getBoundingClientRect();
  const full=Math.max(1,guide.offsetHeight-innerHeight*.45);
  const t=Math.min(1,Math.max(0,(-rect.top+innerHeight*.62)/full));
  box.querySelectorAll('.rg-root-path').forEach((path,i)=>{
   const len=path.getTotalLength();
   const th=Number(path.dataset.threshold||0);
   const p=i===0?Math.max(0,Math.min(1,(t-.01)/.9)):Math.max(0,Math.min(1,(t-th)/.18));
   path.style.strokeDasharray=String(len);
   path.style.strokeDashoffset=String(len*(1-(reduce?p:p*p*(3-2*p))));
   path.style.opacity=String(.20+.80*p);
  });
  let index=-1;
  const cards=[...box.querySelectorAll('.rg-chapter')];
  cards.forEach((card,i)=>{if(card.getBoundingClientRect().top<innerHeight*.63)index=i;});
  if(rect.top>innerHeight*.6)index=-1;
  box.querySelectorAll('.rg-chapter').forEach((card,i)=>card.classList.toggle('rg-chapter-active',i===index));
  box.querySelectorAll('.rg-node').forEach((node,i)=>node.classList.toggle('rg-node-active',i<=index));
  const count=box.querySelector('#rg-count');if(count)count.innerHTML='0'+Math.max(0,index+1)+'<span> / 05</span>';
  const fill=box.querySelector('#rg-progress-fill');if(fill)fill.style.height=Math.round(100*t)+'%';
 }
 let scheduled=false;function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;paint()});}
 function enhance(){
   const box=root();if(!box||box.dataset.continuous)return;
   box.dataset.continuous='true';
   box.setAttribute('role','main');box.removeAttribute('aria-modal');
   box.querySelector('.rg-scroll')?.removeAttribute('tabindex');
   const intro=box.querySelector('.rg-intro');
   if(intro){
    intro.insertAdjacentHTML('beforeend','<div class="rg-living-plant" aria-label="Mô hình mầm cây 3D"><span class="rg-plant-orbit"></span><img class="rg-plant-poster" src="/assets/harvest-hero.webp" alt="Mầm cây mọc lên trong đất ẩm"><model-viewer src="/assets/agridelta_seed_to_harvest_model.glb" alt="Mô hình 3D cây con, lá có gân, rễ tơ và đất" camera-controls auto-rotate auto-rotate-delay="0" rotation-per-second="4deg" interaction-prompt="none" exposure="1.2" shadow-intensity="1.1" environment-image="neutral" camera-orbit="-35deg 72deg 5.6m" field-of-view="28deg" loading="eager"></model-viewer><span class="rg-plant-caption">THIÊN NHIÊN BẮT ĐẦU TỪ NHỮNG ĐIỀU NHỎ BÉ</span></div>');
    const mdl=intro.querySelector('model-viewer');
    mdl?.addEventListener('load',()=>intro.classList.add('rg-plant-ready'));
   }
   const scroll=box.querySelector('.rg-scroll');
   if(scroll){scroll.style.scrollBehavior='auto';scroll.style.overflowY='visible';}
   box.querySelector('.rg-intro h1')?.setAttribute('aria-label','Muốn vươn cao, hãy bắt đầu từ rễ');
   box.querySelectorAll('.rg-chapter').forEach((card,i)=>{
    card.style.scrollMarginTop=innerWidth<650?'48vh':'92px';
   });
   // Old click handlers close the guide and navigate to the existing demo.
   box.addEventListener('click',event=>{
    if(event.target.closest('#rg-exit,#rg-end-enter,[data-root-page]')){
      document.body.classList.remove('rg-story-mode');
      document.body.classList.add('rg-app-mode');
    }
   },true);
   window.addEventListener('scroll',schedule,{passive:true});
   window.addEventListener('resize',schedule,{passive:true});
 }
 function open(){document.body.classList.remove('rg-app-mode');document.body.classList.add('rg-story-mode');baseOpen();enhance();window.scrollTo({top:0,behavior:'instant'});schedule();}
 function close(){baseClose();document.body.classList.remove('rg-story-mode');document.body.classList.add('rg-app-mode');}
 function go(page){close();window.AGRIDELTAOpenDemo?.(page);}
 window.AGRIDELTARootGuide={open,close,go};
 window.AGRIDELTAStory={replay:open};
 // Opening the website should directly reveal the living story, not a presentation modal.
 open();
})();