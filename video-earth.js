import {createGrowthClock, MAX_GROWTH_TIME, STAGE_TIMES, stageAt} from './lifecycle-state.js';

/** The alternate renderer plays the same Blender cutaway and branch animations. */
export function createVideoEarth(host, {onStage, onTime, onReady, onRootFinished, onComplete, onError}) {
  const events = new AbortController();
  const roots = new Map();
  const growth = createGrowthClock();
  let visible = true;
  let ready = false;
  let running = true;
  let complete = false;
  let stage = -1;
  let limit = MAX_GROWTH_TIME;
  let raf = 0;
  const plant = makeVideo('/assets/start-lifecycle-film.webm', 'blender-lifecycle-video');

  function makeVideo(src, className) {
    const video = document.createElement('video');
    video.className = className;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.setAttribute('aria-hidden', 'true');
    video.src = src;
    host.append(video);
    return video;
  }
  function draw() {
    cancelAnimationFrame(raf);
    raf = 0;
    if (!visible || document.hidden || !ready) return;
    const requested = plant.currentTime;
    const time = growth.advance(Math.min(limit, requested));
    if (requested - time > .005) plant.currentTime = time;
    host.dataset.lifecycleTime = time.toFixed(2);
    host.dataset.growthState = growth.state;
    const next = stageAt(time);
    if (stage !== next) {
      host.dataset.plantStage = String(next);
      stage = next;
      onStage(stage);
    }
    onTime(time);
    if (time >= limit - .008 && running && !complete) {
      plant.pause();
      running = false;
      complete = true;
      onComplete();
    }
    if (running) raf = requestAnimationFrame(draw);
  }
  function sync() {
    cancelAnimationFrame(raf);
    raf = 0;
    if (!visible || document.hidden) {
      plant.pause();
      for (const root of roots.values()) root.pause();
      return;
    }
    if (ready && running) plant.play().catch(() => {});
    for (const root of roots.values()) if (!root.ended) root.play().catch(() => {});
    draw();
  }
  plant.addEventListener('loadeddata', () => {
    if (ready) return;
    ready = true;
    host.dataset.sceneState = 'ready';
    host.dataset.geometry = 'blender-animated-video';
    onReady();
    sync();
  }, {signal:events.signal});
  plant.addEventListener('seeked', draw, {signal:events.signal});
  plant.addEventListener('error', onError, {signal:events.signal});
  document.addEventListener('visibilitychange', sync, {signal:events.signal});

  function seek(time) {
    plant.pause();
    running = false;
    growth.seek(time);
    plant.currentTime = time;
  }
  return {
    setGrowthLimit(time) { limit = time; sync(); },
    revealRoot(index) {
      if (roots.has(index)) return;
      const root = makeVideo(`/assets/start-root-motion-${index}.webm`, 'blender-root-video');
      roots.set(index, root);
      root.addEventListener('ended', () => {
        host.dataset.rootCount = String([...roots.values()].filter(video => video.ended).length);
        onRootFinished(index);
      }, {once:true,signal:events.signal});
      root.addEventListener('error', onError, {signal:events.signal});
      if (visible && !document.hidden) root.play().catch(() => {});
    },
    seekStage(index) { seek(Math.min(limit, STAGE_TIMES[index] ?? 0)); },
    replay() { seek(0); complete = false; running = true; sync(); },
    toggle() {
      if (complete) { this.replay(); return true; }
      running = !running;
      sync();
      if (!running) plant.pause();
      return running;
    },
    setVisible(value) { if (visible !== value) { visible = value; sync(); } },
    destroy() {
      events.abort();
      cancelAnimationFrame(raf);
      for (const video of [plant, ...roots.values()]) {
        video.pause();
        video.removeAttribute('src');
        video.load();
        video.remove();
      }
    },
    get ready() { return ready; }
  };
}
