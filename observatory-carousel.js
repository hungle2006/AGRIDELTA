/** Keep the native scroll position and the visual focus in sync. */
export function mountObservatory(carousel, initial, onChange) {
  const rail = carousel.querySelector('.ag-carousel-track');
  const slides = [...rail.querySelectorAll('.ag-carousel-slide')];
  const positions = [...carousel.querySelectorAll('[data-carousel-index]')];
  const previous = carousel.querySelector('[data-carousel-step="-1"]');
  const next = carousel.querySelector('[data-carousel-step="1"]');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const listeners = new AbortController();
  const {signal} = listeners;
  let current = Math.max(0, slides.findIndex(slide => slide.dataset.tool === initial));
  let frame = 0;
  let drag = null;
  let suppressClick = false;

  function measure() {
    const center = rail.getBoundingClientRect().left + rail.clientWidth / 2;
    return slides.map(slide => {
      const bounds = slide.getBoundingClientRect();
      return {offset: bounds.left + bounds.width / 2 - center, width: bounds.width};
    });
  }
  const nearest = geometry => geometry.reduce((closest, item, index) =>
    Math.abs(item.offset) < Math.abs(geometry[closest].offset) ? index : closest, 0);
  function update() {
    frame = 0;
    if (!rail.clientWidth) return;
    const geometry = measure();
    current = nearest(geometry);
    slides.forEach((slide, index) => {
      const {offset, width} = geometry[index];
      const distance = Math.min(1, Math.abs(offset) / width);
      slide.style.setProperty('--ag-card-scale', (1 - distance * .13).toFixed(3));
      slide.style.setProperty('--ag-card-angle', String(Math.sign(offset) * distance * -12) + 'deg');
      slide.style.setProperty('--ag-card-opacity', (1 - distance * .26).toFixed(2));
      slide.style.setProperty('--ag-card-depth', String(Math.round((1 - distance) * 10)));
      if (index === current) positions[index].setAttribute('aria-current', 'true');
      else positions[index].removeAttribute('aria-current');
    });
    previous.setAttribute('aria-disabled', String(current === 0));
    next.setAttribute('aria-disabled', String(current === slides.length - 1));
    onChange(slides[current].dataset.tool);
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(update);
  }
  function move(index, smooth = true) {
    if (!rail.clientWidth || index < 0 || index >= slides.length) return;
    const animate = smooth && !motion.matches;
    rail.scrollTo({
      left: rail.scrollLeft + measure()[index].offset,
      behavior: animate ? 'smooth' : 'instant'
    });
    if (animate) schedule();
    else {
      cancelAnimationFrame(frame);
      update();
    }
  }

  rail.addEventListener('scroll', schedule, {passive: true, signal});
  carousel.addEventListener('click', event => {
    const step = event.target.closest('[data-carousel-step]');
    const position = event.target.closest('[data-carousel-index]');
    if (step) move(nearest(measure()) + Number(step.dataset.carouselStep));
    if (position) move(Number(position.dataset.carouselIndex));
  }, {signal});
  carousel.addEventListener('keydown', event => {
    const center = nearest(measure());
    const targets = {ArrowLeft: center - 1, ArrowRight: center + 1, Home: 0, End: slides.length - 1};
    if (event.key in targets) {
      event.preventDefault();
      move(targets[event.key]);
    }
  }, {signal});
  rail.addEventListener('focusin', event => {
    const slide = event.target.closest('.ag-carousel-slide');
    if (slide && event.target.matches(':focus-visible')) move(slides.indexOf(slide), false);
  }, {signal});

  rail.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    suppressClick = false;
    drag = {id: event.pointerId, x: event.clientX, left: rail.scrollLeft, moving: false};
  }, {signal});
  window.addEventListener('pointermove', event => {
    if (!drag || drag.id !== event.pointerId) return;
    const delta = event.clientX - drag.x;
    if (!drag.moving && Math.abs(delta) < 7) return;
    if (!drag.moving) {
      drag.moving = true;
      rail.classList.add('is-dragging');
    }
    rail.scrollLeft = drag.left - delta;
  }, {signal});
  function endDrag(event) {
    if (!drag || drag.id !== event.pointerId) return;
    suppressClick = drag.moving;
    drag = null;
    if (!suppressClick) return;
    rail.classList.remove('is-dragging');
    update();
    move(current);
  }
  window.addEventListener('pointerup', endDrag, {signal});
  window.addEventListener('pointercancel', endDrag, {signal});
  rail.addEventListener('click', event => {
    const index = slides.indexOf(event.target.closest('.ag-carousel-slide'));
    if (event.detail && (suppressClick || (index >= 0 && index !== current))) {
      event.preventDefault();
      event.stopPropagation();
      if (!suppressClick) move(index);
    }
    suppressClick = false;
  }, {capture: true, signal});

  const resize = new ResizeObserver(() => move(current, false));
  resize.observe(rail);
  move(current, false);
  return () => {
    listeners.abort();
    resize.disconnect();
    cancelAnimationFrame(frame);
  };
}
