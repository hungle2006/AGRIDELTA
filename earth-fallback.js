import {LIFECYCLE_SECONDS, HARVEST_SECONDS, stageAt} from './lifecycle-state.js';

const asset = (layer, index) => `/assets/start-botanical-${layer}-${index}.webp`;

export function mountPlantFallback(host) {
  const layers = Array.from({length: 6}, (_, index) => {
    const image = new Image();
    image.alt = '';
    image.decoding = 'async';
    image.className = 'plant-fallback-frame';
    image.src = index === 5 ? '/assets/start-botanical-harvested.webp' : asset('lifecycle', index);
    host.append(image);
    return image;
  });
  const film = document.createElement('video');
  film.className = 'plant-fallback-film';
  film.muted = true;
  film.playsInline = true;
  film.preload = 'none';
  host.append(film);
  let activeStage = -1;
  let playing = false;
  let targetTime = 0;
  let lastTime = 0;

  function syncTime() {
    if (film.readyState && Math.abs(film.currentTime-targetTime) > .28) film.currentTime = targetTime;
  }

  function startFilm() {
    film.src ||= '/assets/start-lifecycle-film.webm';
    syncTime();
    film.play().catch(() => {});
  }

  film.addEventListener('loadedmetadata', syncTime);
  film.addEventListener('seeked', () => {
    if (playing && film.readyState >= 2) film.classList.add('is-visible');
  });
  film.addEventListener('playing', () => {
    if (Math.abs(film.currentTime-targetTime) <= .30) film.classList.add('is-visible');
  });

  return (time, shouldPlay, rate) => {
    const stage = time >= HARVEST_SECONDS ? 5 : stageAt(time);
    if (stage !== activeStage) {
      layers.forEach((image, index) => image.classList.toggle('is-current', index === stage));
      activeStage = stage;
    }
    targetTime = time;
    const jumped = time < lastTime-.001 || time-lastTime > .42;
    lastTime = time;
    if (shouldPlay) {
      if (film.playbackRate !== rate) film.playbackRate = rate;
      if (jumped) film.classList.remove('is-visible');
      if (!playing || jumped) startFilm();
      else syncTime();
    } else if (playing || jumped) {
      film.pause();
      if (jumped || time === LIFECYCLE_SECONDS || time >= HARVEST_SECONDS) film.classList.remove('is-visible');
    }
    playing = shouldPlay;
  };
}

export function mountRootFallback(host) {
  const layers = Array.from({length: 5}, (_, index) => {
    const image = new Image();
    image.alt = '';
    image.decoding = 'async';
    image.className = 'root-fallback-layer';
    image.src = asset('root', index);
    host.append(image);
    return image;
  });
  return amounts => layers.forEach((image, index) => {
    image.style.setProperty('--reach', `${amounts[index]*56}%`);
  });
}
