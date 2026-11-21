/** Finite 3-card observatory: native touch swipes, mouse drag, arrow keys and no cloned slides. */
export function mountObservatory(observatory, initial, onChange = () => {}) {
  const rail = observatory.querySelector('.ag-carousel-track');
  const slides = [...rail.querySelectorAll('.ag-carousel-slide')];
  if (!slides.length) return () => {};
  const dots = [...observatory.querySelectorAll('[data-carousel-index]')];
  const arrows = [...observatory.querySelectorAll('[data-carousel-step]')];
  const controller = new AbortController();
  const {signal} = controller;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = value => Math.max(0, Math.min(slides.length - 1, value));
  let current = clamp(Math.max(0, slides.findIndex(slide => slide.dataset.tool === initial)));
  let frame = 0;
  let hoverTimer = 0;
  let spotlight = null;
  let drag = null;
  let suppressClick = false;

  function geometry() {
    const bounds = rail.getBoundingClientRect();
    const center = bounds.left + rail.clientWidth / 2;
    return slides.map(slide => {
      const rect = slide.getBoundingClientRect();
      return {distance: rect.left + rect.width / 2 - center, width: rect.width};
    });
  }
  function closest(items) {
    return items.reduce((best, item, index) =>
      Math.abs(item.distance) < Math.abs(items[best].distance) ? index : best, 0);
  }
  function render() {
    frame = 0;
    if (!rail.clientWidth) return;
    const metrics = geometry();
    const selected = closest(metrics);
    current = selected;
    slides.forEach((slide, index) => {
      const {distance, width} = metrics[index];
      const offset = Math.min(1, Math.abs(distance) / Math.max(1, width));
      slide.style.setProperty('--ag-card-scale', (1 - offset * .13).toFixed(3));
      slide.style.setProperty('--ag-card-angle', (Math.sign(distance) * offset * -8).toFixed(2) + 'deg');
      slide.style.setProperty('--ag-card-opacity', (1 - offset * .24).toFixed(2));
      slide.style.setProperty('--ag-card-depth', String(Math.round((1 - offset) * 10)));
      slide.style.setProperty('--ag-caption-opacity', String(Math.max(0, 1 - offset * 2.4)));
    });
    dots.forEach((dot, index) => {
      if (index === current) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    arrows.forEach(arrow => {
      const next = current + Number(arrow.dataset.carouselStep);
      arrow.disabled = next < 0 || next >= slides.length;
    });
    onChange(slides[current].dataset.tool);
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(render);
  }
  function move(index, smooth = true) {
    const target = clamp(index);
    if (!rail.clientWidth) return;
    const metrics = geometry();
    rail.scrollTo({
      left: rail.scrollLeft + metrics[target].distance,
      behavior: smooth && !reduceMotion.matches ? 'smooth' : 'auto'
    });
    schedule();
  }
  function cancelHover(clearSpotlight = true) {
    clearTimeout(hoverTimer);
    hoverTimer = 0;
    if (clearSpotlight) {
      spotlight?.classList.remove('is-spotlit');
      spotlight = null;
    }
  }
  function preview(slide) {
    cancelHover();
    spotlight = slide;
    spotlight.classList.add('is-spotlit');
    const target = slides.indexOf(slide);
    // Avoid unnecessary scrolling when the hovered card is already centered.
    if (target !== current || Math.abs(geometry()[target].distance) > 3) move(target);
  }
  slides.forEach(slide => {
    slide.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
      if (drag?.moving) return;
      cancelHover();
      hoverTimer = setTimeout(() => preview(slide), 2000);
    }, {signal});
    slide.addEventListener('pointerleave', () => {
      // Retain the preview during a smooth recenter; clear when the pointer leaves the rail.
      if (spotlight !== slide) cancelHover();
    }, {signal});
    slide.addEventListener('focusout', event => {
      if (!slide.contains(event.relatedTarget)) cancelHover();
    }, {signal});
  });
  rail.addEventListener('pointerleave', () => cancelHover(), {signal});
  rail.addEventListener('scroll', schedule, {passive:true, signal});
  observatory.addEventListener('click', event => {
    const arrow = event.target.closest('[data-carousel-step]');
    const dot = event.target.closest('[data-carousel-index]');
    if (arrow && !arrow.disabled) move(current + Number(arrow.dataset.carouselStep));
    if (dot) move(Number(dot.dataset.carouselIndex));
  }, {signal});
  observatory.addEventListener('keydown', event => {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const target = event.key === 'Home' ? 0 :
      event.key === 'End' ? slides.length - 1 :
      current + (event.key === 'ArrowLeft' ? -1 : 1);
    move(target);
  }, {signal});

  rail.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    suppressClick = false;
    drag = {id:event.pointerId, x:event.clientX, left:rail.scrollLeft, moving:false};
  }, {signal});
  window.addEventListener('pointermove', event => {
    if (!drag || drag.id !== event.pointerId) return;
    const delta = event.clientX - drag.x;
    if (!drag.moving && Math.abs(delta) < 7) return;
    if (!drag.moving) {
      drag.moving = true;
      cancelHover();
      rail.classList.add('is-dragging');
    }
    rail.scrollLeft = drag.left - delta;
    schedule();
  }, {signal});
  function stopDrag(event) {
    if (!drag || drag.id !== event.pointerId) return;
    suppressClick = drag.moving;
    drag = null;
    rail.classList.remove('is-dragging');
    if (suppressClick) {
      const target = closest(geometry());
      move(target);
    }
  }
  window.addEventListener('pointerup', stopDrag, {signal});
  window.addEventListener('pointercancel', stopDrag, {signal});
  rail.addEventListener('click', event => {
    const card = event.target.closest('.ag-carousel-slide');
    const index = slides.indexOf(card);
    if (suppressClick || (event.detail && index !== -1 && index !== closest(geometry()))) {
      event.preventDefault();
      event.stopPropagation();
      if (!suppressClick && index !== -1) move(index);
    }
    suppressClick = false;
  }, {capture: true, signal});
  const resize = new ResizeObserver(() => move(current, false));
  resize.observe(rail);
  move(current, false);
  return () => {
    cancelHover();
    controller.abort();
    resize.disconnect();
    cancelAnimationFrame(frame);
  };
}
