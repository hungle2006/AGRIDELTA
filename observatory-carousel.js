/** Fixed three-card observatory; no clones, carousel, drag or nested scrolling. */
export function mountObservatory(observatory, initial, onChange = () => {}) {
  const cards = [...observatory.querySelectorAll('.ag-carousel-slide')];
  const controller = new AbortController();
  const pending = new Map();
  const clear = card => {
    clearTimeout(pending.get(card));
    pending.delete(card);
    card.classList.remove('is-spotlit');
  };
  const activate = card => {
    pending.delete(card);
    cards.forEach(other => { if (other !== card) clear(other); });
    card.classList.add('is-spotlit');
    onChange(card.dataset.tool);
  };
  for (const card of cards) {
    card.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
      clear(card);
      pending.set(card, setTimeout(() => activate(card), 2000));
    }, {signal: controller.signal});
    card.addEventListener('pointerleave', () => clear(card), {signal: controller.signal});
    card.addEventListener('pointercancel', () => clear(card), {signal: controller.signal});
    card.addEventListener('focusout', event => {
      if (!card.contains(event.relatedTarget)) clear(card);
    }, {signal: controller.signal});
  }
  return () => {
    controller.abort();
    cards.forEach(clear);
  };
}
