/**
 * AGRIDELTA Motion — delegated input, one-time editorial entrance,
 * and passive scroll feedback. No touchmove prevention or layout reads per frame.
 */
const INTERACT='.earth-site button,.earth-site .earth-secondary,.earth-site .hero-bottom-rail a,.ag-app button,.ag-app .ag-btn';
const PRIMARY='.earth-site .earth-primary,.earth-site .root-next,.ag-app .ag-btn-primary';
const REVEALS='.workflow-card,.start-dock-button,.guide-intro,.start-workflow-head,.root-discovery,.start-close-frame';
export function initAgrideltaMotion(site){
  if(document.documentElement.dataset.agMotionReady==='true')return;
  document.documentElement.dataset.agMotionReady='true';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const active=new Map();
  function unpress(event){const el=active.get(event.pointerId);if(el){el.classList.remove('ag-pressing');active.delete(event.pointerId);}}
  document.addEventListener('pointerdown',event=>{
    if(event.button!==0||!event.isPrimary)return;
    const el=event.target instanceof Element?event.target.closest(INTERACT):null;
    if(!el||el.matches(':disabled')||el.closest('[hidden],[inert]'))return;
    el.classList.add('ag-pressing');
    active.set(event.pointerId,el);
    if(reduced.matches||!el.matches(PRIMARY))return;
    const rect=el.getBoundingClientRect();
    const ripple=document.createElement('span');
    ripple.className='ag-tap-ripple';
    ripple.style.left=(event.clientX-rect.left)+'px';
    ripple.style.top=(event.clientY-rect.top)+'px';
    el.appendChild(ripple);
    ripple.addEventListener('animationend',()=>ripple.remove(),{once:true});
  },{passive:true});
  document.addEventListener('pointerup',unpress,{passive:true});
  document.addEventListener('pointercancel',unpress,{passive:true});
  window.addEventListener('blur',()=>{active.forEach(el=>el.classList.remove('ag-pressing'));active.clear();});
  if(!reduced.matches&&'IntersectionObserver' in window){
    const targets=[...site.querySelectorAll(REVEALS)];
    const io=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting)return;
        entry.target.dataset.agReveal='shown';
        io.unobserve(entry.target);
      });
    },{rootMargin:'0px 0px -28px 0px',threshold:.07});
    targets.forEach((el,i)=>{
      el.dataset.agReveal='pending';
      el.style.setProperty('--ag-stagger',Math.min(i%3,2)*40+'ms');
      io.observe(el);
    });
  }
  const header=site.querySelector('.earth-header');
  if(header){
    let frame=0;
    const sync=()=>{frame=0;header.classList.toggle('ag-raised',window.scrollY>25&&!site.hidden);};
    window.addEventListener('scroll',()=>{
      if(!frame)frame=requestAnimationFrame(sync);
    },{passive:true});
    sync();
  }
}
