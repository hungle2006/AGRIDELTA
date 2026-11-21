/** Keep the native scroll position and the visual focus in sync. */
export function mountObservatory(carousel, initial, onChange) {
  const rail = carousel.querySelector('.ag-carousel-track');
  const originals = [...rail.querySelectorAll('.ag-carousel-slide')];
  function duplicate(slide) {
    const copy = slide.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    copy.setAttribute('data-carousel-copy', '');
    const button = copy.querySelector('button');
    const preview = document.createElement('div');
    preview.className = button.className;
    preview.append(...button.childNodes);
    button.replaceWith(preview);
    return copy;
  }
  const before = duplicate(originals.at(-1));
  const after = duplicate(originals[0]);
  rail.prepend(before);
  rail.append(after);
  const slides = [before, ...originals, after];
  const asOriginal = index => index === 0 ? originals.length : index === slides.length - 1 ? 1 : index;
  const positions = [...carousel.querySelectorAll('[data-carousel-index]')];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const listeners = new AbortController();
  const {signal} = listeners;
  let current = 1 + Math.max(0, originals.findIndex(slide => slide.dataset.tool === initial));
  let frame = 0;
  let settleTimer = 0;
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
      slide.style.setProperty('--ag-caption-opacity', String(Math.max(0, 1 - distance * 2.4)));
    });
    positions.forEach((position, index) => {
      if (index + 1 === asOriginal(current)) position.setAttribute('aria-current', 'true');
      else position.removeAttribute('aria-current');
    });
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

  function normalizeCenter() {
    const geometry = measure();
    const index = nearest(geometry);
    if (Math.abs(geometry[index].offset) < 3 && index !== asOriginal(index)) {
      move(asOriginal(index), false);
      return asOriginal(index);
    }
    return index;
  }
  function finishScroll() {
    clearTimeout(settleTimer);
    if (!drag?.moving) normalizeCenter();
  }
  rail.addEventListener('scroll', () => {
    schedule();
    clearTimeout(settleTimer);
    settleTimer = setTimeout(finishScroll, 120);
  }, {passive: true, signal});
  rail.addEventListener('scrollend', finishScroll, {signal});
  carousel.addEventListener('click', event => {
    const step = event.target.closest('[data-carousel-step]');
    const position = event.target.closest('[data-carousel-index]');
    if (step) move(normalizeCenter() + Number(step.dataset.carouselStep));
    if (position) move(Number(position.dataset.carouselIndex) + 1);
  }, {signal});
  carousel.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key))return;
    const center = normalizeCenter();
    const targets = {ArrowLeft: center - 1, ArrowRight: center + 1, Home: 1, End: originals.length};
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
    if (event.detail && (suppressClick || (index >= 0 && (index !== nearest(measure()) || index !== asOriginal(index))))) {
      event.preventDefault();
      event.stopPropagation();
      if (!suppressClick) move(index);
    }
    suppressClick = false;
  }, {capture: true, signal});

  const resize = new ResizeObserver(() => move(asOriginal(current), false));
  resize.observe(rail);
  move(current, false);
  return () => {
    listeners.abort();
    resize.disconnect();
    cancelAnimationFrame(frame);
    clearTimeout(settleTimer);
  };
}
