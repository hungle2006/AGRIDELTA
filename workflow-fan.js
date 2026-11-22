/** Scroll-controlled, reversible one-to-three card fan on the Start page.
 *  The cards must have fully opened by the time the section title is near
 *  the top of the screen; the prior header-relative progress waited too long.
 */
export function workflowRevealProgress(sectionTop, viewportHeight) {
  const enter = viewportHeight * .86;
  const complete = viewportHeight * .36;
  return Math.max(0, Math.min(1, (enter - sectionTop) / Math.max(1, enter-complete)));
}
export function initWorkflowFan(site) {
  const section = site.querySelector('.start-workflow[data-workflow-fan]');
  if (!section) return () => {};
  const panel = section.querySelector('.start-workflow-stage');
  const items = [...section.querySelectorAll('.workflow-steps > li')];
  if (items.length !== 3) return () => {};
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = n => Math.max(0, Math.min(1, n));
  const smooth = n => n*n*(3-2*n);
  const controller = new AbortController();
  const {signal} = controller;
  let frame = 0, geometry = [];


  function render() {
    frame = 0;
    if (site.hidden || !panel.isConnected) return;
    const rect = section.getBoundingClientRect();
    // Reveal while the heading and first card enter the viewport,
    // not after the user scrolls below the cards.
    const progress = reduced.matches ? 1 : workflowRevealProgress(rect.top, window.innerHeight);
    const phases = [1, smooth(clamp((progress - .10)/.38)), smooth(clamp((progress - .51)/.39))];
    items.forEach((card,i) => {
      const phase = phases[i];
      const pos = geometry[i] || {x:0,y:0};
      card.style.transform = `translate3d(${(pos.x*(1-phase)).toFixed(2)}px,${(pos.y*(1-phase)).toFixed(2)}px,0)`;
      card.style.opacity = String(i===0 ? 1 : clamp(phase*2.3));
      card.style.visibility = phase <= 0 ? 'hidden' : 'visible';
      card.style.clipPath = i===0 ? 'none' : `inset(0 ${((1-phase)*100).toFixed(2)}% 0 0 round 16px)`;
      card.style.pointerEvents = phase>=.97 ? '' : 'none';
      card.inert = phase < .97;
    });
    section.dataset.workflowStage = progress >= .90 ? 'three' : progress >= .48 ? 'two' : 'one';
  }
  function schedule() {if (!frame) frame = requestAnimationFrame(render);}
  function measure() {
    // The Start DOM is initially hidden. Read geometry only once it is visible.
    if (site.hidden) return;
    // offset positions ignore transforms; all cards start at the first card's origin.
    const first = items[0];
    geometry = items.map(card => ({x:first.offsetLeft-card.offsetLeft,y:first.offsetTop-card.offsetTop}));
    render();
    section.dataset.workflowReady = 'true';
  }
  measure();
  site.addEventListener('agridelta-start-open',measure,{signal});
  window.addEventListener('scroll',schedule,{passive:true,signal});
  window.addEventListener('resize',measure,{passive:true,signal});
  const observer = new ResizeObserver(measure);
  observer.observe(panel);
  return () => {
    controller.abort();
    observer.disconnect();
    cancelAnimationFrame(frame);
    items.forEach(card => {card.removeAttribute('style');card.inert = false;});
    delete section.dataset.workflowReady;
    delete section.dataset.workflowStage;
  };
}
