import {FEATURES, normalizeQuery, searchGuides} from './root-guide-data.js';
import {MAX_GROWTH_TIME, STAGE_TIMES, carePhase} from './lifecycle-state.js';
import {recordGrowthStage} from './garden-care.js';
import farm from '@phosphor-icons/core/assets/regular/farm.svg?raw';
import calendar from '@phosphor-icons/core/assets/regular/calendar-dots.svg?raw';
import tasks from '@phosphor-icons/core/assets/regular/clipboard-text.svg?raw';
import plant from '@phosphor-icons/core/assets/regular/plant.svg?raw';
import box from '@phosphor-icons/core/assets/regular/package.svg?raw';
import leaf from '@phosphor-icons/core/assets/regular/leaf.svg?raw';
import drop from '@phosphor-icons/core/assets/regular/drop.svg?raw';
import arrow from '@phosphor-icons/core/assets/regular/arrow-down-right.svg?raw';
import down from '@phosphor-icons/core/assets/regular/arrow-down.svg?raw';
import close from '@phosphor-icons/core/assets/regular/x.svg?raw';
import menu from '@phosphor-icons/core/assets/regular/list.svg?raw';
import search from '@phosphor-icons/core/assets/regular/magnifying-glass.svg?raw';
import pause from '@phosphor-icons/core/assets/regular/pause.svg?raw';
import play from '@phosphor-icons/core/assets/regular/play.svg?raw';
import replay from '@phosphor-icons/core/assets/regular/arrow-counter-clockwise.svg?raw';
import flower from '@phosphor-icons/core/assets/regular/flower.svg?raw';

const icons = {farm, calendar, tasks, plant, box, leaf, drop, arrow, down, close, menu, search, pause, play, replay, flower};
const symbol = ['farm', 'calendar', 'tasks', 'plant', 'box'];
const stageNames = ['Hạt giống', 'Nảy mầm', 'Sinh trưởng', 'Ra hoa', 'Kết quả'];
const icon = name => `<span class="earth-icon" aria-hidden="true">${icons[name]}</span>`;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const title = ['Quản lý cánh đồng', 'Quản lý mùa vụ', 'Công việc hằng ngày', 'Quan sát cây trồng', 'Quản lý đơn hàng'];
const landscape = '/assets/start-landscape-clear.webp';
const app = document.querySelector('#app');
const site = document.querySelector('#rg-site');
const get = selector => site.querySelector(selector);
const menuLinks = `<a href="#rg-top">Trang chủ</a><a href="#rg-roots">Tính năng</a><button data-knowledge>Kiến thức</button>`;
site.innerHTML = `
<a class="earth-skip" href="#rg-roots">Đi đến các tính năng</a>
<header class="garden-header">
  <div class="garden-container garden-header-inner">
    <a href="#rg-top" class="garden-brand" aria-label="AGRIDELTA, trang chủ">
      <img src="/assets/agridelta-mark.svg" width="41" height="41" alt=""><span>AGRIDELTA<small>Nhật ký canh tác</small></span>
    </a>
    <nav class="garden-nav" id="garden-nav" aria-label="Điều hướng trang chủ">${menuLinks}</nav>
    <div class="garden-header-actions">
      <button class="garden-icon-button" data-search aria-label="Tìm tính năng">${icon('search')}</button>
      <button class="garden-account" data-enter-auth>Tài khoản</button>
      <button class="garden-icon-button garden-menu" aria-label="Mở menu" aria-controls="garden-nav" aria-expanded="false">${icon('menu')}</button>
    </div>
  </div>
</header>
<main id="rg-top" class="garden-container garden-main">
  <section class="garden-story" aria-labelledby="garden-title">
    <div class="story-copy">
      <div class="story-intro">
        <span class="garden-label"><i></i> NÔNG NGHIỆP THÔNG MINH</span>
        <h1 id="garden-title">Gieo một hạt.<br><em>Hiểu cả khu vườn.</em></h1>
        <p>Theo dõi cánh đồng, chăm cây đúng lúc và ghi lại từng mùa vụ trong một không gian.</p>
        <div class="garden-actions">
          <a class="garden-primary" href="#rg-roots">Khám phá bộ rễ ${icon('down')}</a>
          <button class="garden-secondary" data-enter-page="home">Vào bản dùng thử ${icon('arrow')}</button>
        </div>
      </div>
      <div class="root-context" id="rg-roots" tabindex="-1">
        <span class="garden-label"><i></i> BÊN DƯỚI MẶT ĐẤT</span>
        <h2>Một bộ rễ.<br><em>Năm việc canh tác.</em></h2>
        <p>Chọn một điểm trên rễ để xem hướng dẫn và đi thẳng vào chức năng tương ứng.</p>
        <button class="garden-secondary" data-enter-page="home">Mở tổng quan ${icon('arrow')}</button>
        <div class="guide-inline" id="guide-inline" hidden></div>
      </div>
    </div>
    <figure class="garden-figure" aria-label="Vòng đời cây cà chua và năm điểm hướng dẫn trên bộ rễ">
      <div class="garden-viewport">
        <img class="garden-landscape" src="${landscape}" alt="" fetchpriority="high" width="1536" height="1024">
        <div class="garden-camera">
          <div id="live-earth" class="live-earth" data-scene-state="loading" data-root-count="0" aria-hidden="true"></div>
          <div class="garden-nodes" aria-label="Năm chức năng AGRIDELTA">
            ${FEATURES.map((feature, index) => `<button class="garden-node" aria-label="${title[index]}" aria-expanded="false" aria-controls="guide-inline" data-open-guide="${index}" tabindex="-1">${icon(symbol[index])}<span class="node-caption">${feature.label}</span></button>`).join('')}
          </div>
        </div>
        <div class="garden-scene-tag">${icon('plant')} <span>Cà chua · Từ hạt đến quả</span></div>
        <div class="garden-load" role="status"><img src="/assets/agridelta-brand-mark.webp" width="32" height="32" alt=""> <span>Đang tải mô hình Blender…</span></div>
        <div class="soil-legend" aria-label="Các lớp đất"><span>Lớp mùn</span><span>Đất giữ ẩm</span><span>Tầng rễ sâu</span></div>
      </div>
      <figcaption class="garden-timeline">
        <div class="garden-timeline-top"><strong id="lifecycle-label">Hạt giống</strong><div class="garden-playback">
          <button class="garden-icon-button" data-replay aria-label="Xem lại quá trình cây phát triển">${icon('replay')}</button>
          <button class="garden-icon-button" data-pause aria-label="Tạm dừng cây phát triển">${icon('pause')}</button>
        </div></div>
        <div class="garden-stage-buttons" role="group" aria-label="Xem từng giai đoạn">
          ${stageNames.map((name, index) => `<button data-plant-stage="${index}" aria-pressed="${index === 0}"><span></span>${name}</button>`).join('')}
        </div>
        <p class="garden-care" id="care-message">${icon('drop')} <span>Nước và dưỡng chất được cung cấp tự động.</span></p>
      </figcaption>
    </figure>
  </section>
  <section class="garden-workspace-link" aria-labelledby="workspace-link-title">
    <div><h2 id="workspace-link-title">Ghi lại mùa vụ của bạn.</h2><p>Tạo cánh đồng đầu tiên hoặc mở các bản ghi đã lưu trên thiết bị này.</p></div>
    <button class="garden-primary" data-enter-page="home">Mở không gian canh tác ${icon('arrow')}</button>
  </section>
</main>
<footer class="garden-footer garden-container">
  <a class="garden-brand" href="#rg-top"><img src="/assets/agridelta-mark.svg" width="29" height="29" alt="">AGRIDELTA</a>
  <span>© 2026 AGRIDELTA</span><button data-enter-auth>Tài khoản</button>
</footer>
<dialog id="garden-mobile-detail" class="garden-dialog" aria-labelledby="garden-dialog-title">
  <div class="garden-dialog-inner">
    <button class="garden-icon-button garden-dialog-close" aria-label="Đóng cửa sổ">${icon('close')}</button>
    <div class="garden-dialog-content"></div>
  </div>
</dialog>`;

document.body.classList.add('rg-experience-mode');
const figure = get('.garden-figure');
const viewport = get('.garden-viewport');
const sceneHost = get('#live-earth');
const rootContext = get('#rg-roots');
const guide = get('#guide-inline');
const dialog = get('.garden-dialog');
const nodes = [...site.querySelectorAll('.garden-node')];
let pointLayout = [{x:16.22,y:66.2},{x:32.34,y:72.6},{x:50,y:75.8},{x:67.48,y:72.3},{x:83.78,y:66.2}];
let scene;
let selected = -1;
let scrollFrame = 0;
let stage = 0;
let careStatus = '';
let sceneInView = true;
const initialRootAnchor = location.hash === '#rg-roots';
let currentProgress = 0;
let menuOpen = false;
let attemptedFallback = false;
let guideTrigger;

function updateStage(index) {
  if (stage !== index) recordGrowthStage(index);
  stage = index;
  get('#lifecycle-label').textContent = stageNames[index];
  site.querySelectorAll('button[data-plant-stage]').forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
}

function updateCare(time) {
  const phase = carePhase(time);
  if (phase.message === careStatus) return;
  careStatus = phase.message;
  const box = get('#care-message');
  box.dataset.phase = phase.water ? 'water' : phase.feed ? 'feed' : 'growth';
  box.lastElementChild.textContent = careStatus;
}

function playback(playing, completed = false) {
  const button = get('[data-pause]');
  button.innerHTML = icon(playing ? 'pause' : 'play');
  button.setAttribute('aria-label', completed ? 'Phát lại cây phát triển' : playing ? 'Tạm dừng cây phát triển' : 'Tiếp tục cây phát triển');
}

function layoutScene() {
  const width = viewport.clientWidth;
  const height = viewport.clientHeight;
  if (!width || !height) return;
  const referenceWidth = height * 960 / 536;
  const scale = Math.min(1, (width - 72) / (referenceWidth * .68));
  sceneHost.style.setProperty('--root-scale', scale);
  viewport.style.setProperty('--reference-width', `${referenceWidth}px`);
  nodes.forEach((node, index) => {
    const p = pointLayout[index];
    node.style.left = `calc(50% + ${(p.x / 100 - .5) * referenceWidth * scale}px)`;
    node.style.top = `${p.y}%`;
  });
  const controls = matchMedia('(max-width: 800px)').matches ? 'garden-mobile-detail' : 'guide-inline';
  nodes.forEach(node => node.setAttribute('aria-controls',controls));
  scene?.setRootScale?.(scale);
  scheduleScroll();
}

fetch('/assets/earth-layout.json').then(response => response.ok ? response.json() : null).then(points => {
  if (points?.length === nodes.length) pointLayout = points;
  layoutScene();
}).catch(() => {});
new ResizeObserver(layoutScene).observe(viewport);

function updateScroll() {
  scrollFrame = 0;
  if (site.hidden) return;
  const mobile = matchMedia('(max-width: 800px)').matches;
  const contextTop = rootContext.getBoundingClientRect().top;
  const start = mobile ? innerHeight * .89 : Math.min(innerHeight * .84, 685);
  const end = mobile ? innerHeight * .64 : innerHeight * .22;
  const progress = Math.max(0, Math.min(1, (start - contextTop) / (start - end)));
  currentProgress = progress;
  const eased = reducedMotion.matches ? Number(progress > .48) : progress * progress * (3 - 2 * progress);
  const focus = selected < 0 || eased < .6 ? 0 : (pointLayout[selected].x - 50) * -.032;
  viewport.style.setProperty('--camera-shift', `${-18 * eased}%`);
  viewport.style.setProperty('--camera-focus', `${focus}%`);
  viewport.style.setProperty('--camera-zoom', 1 + eased * (mobile ? .018 : .032));
  viewport.dataset.underground = String(progress > .42);
  figure.dataset.rootView = String(progress > .45);
  nodes.forEach((node, i) => {
    node.tabIndex = progress > .45 ? 0 : -1;
    node.setAttribute('aria-hidden', String(progress <= .45));
    if (progress > .27 + i * .085) scene?.revealRoot(i);
  });
}
function scheduleScroll() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);
}
window.addEventListener('scroll', scheduleScroll, {passive:true});
window.addEventListener('resize', scheduleScroll);
new IntersectionObserver(([entry]) => {
  sceneInView = entry.isIntersecting;
  scene?.setVisible(sceneInView && !site.hidden);
}, {rootMargin:'100px'}).observe(figure);

const sceneOptions = {
  onReady() {
    get('.garden-load').hidden = true;
    scene.setGrowthLimit(MAX_GROWTH_TIME);
    scene.setVisible(sceneInView && !site.hidden);
    if (reducedMotion.matches) { scene.seekStage(4); playback(false); }
    layoutScene();
  },
  onStage:updateStage,
  onTime:updateCare,
  onComplete:() => playback(false, true),
  onRootFinished(index) { nodes[index]?.classList.add('root-ready'); },
  async onError() {
    if (!attemptedFallback) {
      attemptedFallback = true;
      scene?.destroy?.();
      const {createVideoEarth} = await import('./video-earth.js');
      sceneHost.replaceChildren();
      scene = createVideoEarth(sceneHost, sceneOptions);
      return;
    }
    get('.garden-load').hidden = false;
    get('.garden-load span').textContent = 'Cảnh 3D chưa tải được. Bạn vẫn có thể chọn chức năng.';
    sceneHost.dataset.sceneState = 'error';
  },
};
function loadScene() {
  import('./live-earth.js').then(({createLiveEarth}) => {
    scene = createLiveEarth(sceneHost, sceneOptions);
    layoutScene();
  }).catch(sceneOptions.onError);
}
requestAnimationFrame(() => setTimeout(loadScene, 0));

function scrollToRoots() {
  const mobile = matchMedia('(max-width: 800px)').matches;
  const top = window.scrollY + rootContext.getBoundingClientRect().top - (mobile ? innerHeight * .53 : 44);
  window.scrollTo({top, behavior:'instant'});
  updateScroll();
}

function openGuide(index, trigger) {
  const feature = FEATURES[index];
  if (!feature) return;
  const mobile = matchMedia('(max-width: 800px)').matches;
  if (dialog.open && !mobile) dialog.close();
  selected = index;
  guideTrigger = trigger?.matches('.garden-node') ? trigger : nodes[index];
  nodes.forEach((node, i) => node.setAttribute('aria-expanded', String(i === index)));
  guide.innerHTML = `
    <article class="garden-guide" aria-labelledby="selected-guide">
      <button class="garden-icon-button garden-guide-close" aria-label="Đóng hướng dẫn">${icon('close')}</button>
      <img src="/assets/guide-${feature.image}.webp" alt="" width="440" height="265">
      <div class="garden-guide-content">
        <h3 id="selected-guide" tabindex="-1">${title[index]}</h3>
        <p>${feature.summary}</p>
        <ol>${feature.instructions.map(step => `<li>${step}</li>`).join('')}</ol>
        <button class="garden-primary" data-enter-page="${feature.page}">Mở ${normalizeQuery(feature.label) === 'cong viec' ? 'công việc' : feature.label.toLowerCase()} ${icon('arrow')}</button>
      </div>
    </article>`;
  guide.hidden = false;
  site.classList.add('garden-guide-open');
  for (let i = 0; i <= index; i += 1) scene?.revealRoot(i);
  if (mobile) {
    const dialogGuide = guide.innerHTML;
    guide.hidden = true;
    dialog.classList.add('garden-bottom-sheet');
    showDialog(dialogGuide);
    guide.replaceChildren();
  } else if (guide.getBoundingClientRect().bottom > innerHeight) {
    guide.scrollIntoView({behavior:'instant',block:'nearest'});
  }
  (dialog.open ? dialog.querySelector('#selected-guide') : guide.querySelector('#selected-guide'))?.focus({preventScroll:true});
  scheduleScroll();
}

function closeGuide() {
  if (selected < 0) return;
  const focus = guideTrigger;
  guide.hidden = true;
  selected = -1;
  site.classList.remove('garden-guide-open');
  if (dialog.open && dialog.classList.contains('garden-bottom-sheet')) dialog.close();
  nodes.forEach(node => node.setAttribute('aria-expanded', 'false'));
  if (focus?.tabIndex === 0 && !site.hidden) focus.focus({preventScroll:true});
  scheduleScroll();
}

function closeMenu() {
  menuOpen = false;
  site.classList.remove('garden-menu-open');
  const button = get('.garden-menu');
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-label', 'Mở menu');
  button.innerHTML = icon('menu');
}

function showDialog(content) {
  get('.garden-dialog-content').innerHTML = content;
  dialog.setAttribute('aria-labelledby',dialog.classList.contains('garden-bottom-sheet')?'selected-guide':'garden-dialog-title');
  if (!dialog.open) dialog.showModal();
}
dialog.addEventListener('close', () => {
  if (dialog.open || !dialog.classList.contains('garden-bottom-sheet')) return;
  dialog.classList.remove('garden-bottom-sheet');
  closeGuide();
});
function showSearch() {
  showDialog(`<h2 id="garden-dialog-title">Tìm tính năng</h2><label class="garden-search">${icon('search')}<input type="search" placeholder="Ví dụ: mùa vụ" aria-label="Tìm tính năng" autofocus></label><div class="garden-search-results"></div>`);
  const input = dialog.querySelector('input');
  const results = dialog.querySelector('.garden-search-results');
  const update = () => {
    const matches = searchGuides(input.value);
    results.innerHTML = matches.length ? matches.map(({index}) => `<button data-open-guide="${index}">${icon(symbol[index])}${title[index]}</button>`).join('') : '<p>Chưa tìm thấy tính năng phù hợp.</p>';
  };
  input.addEventListener('input', update);
  update();
  input.focus();
}
function showKnowledge() {
  showDialog(`<h2 id="garden-dialog-title">Kiến thức canh tác</h2><ul class="garden-knowledge"><li><strong>Bắt đầu từ đất.</strong> Ghi lại loại đất, khu vực và cây đang trồng.</li><li><strong>Theo dõi mùa vụ.</strong> Đặt ngày gieo và các mốc chăm sóc để chủ động công việc.</li><li><strong>Quan sát thường xuyên.</strong> Ghi ngày và tình trạng cây để so sánh các lần kiểm tra.</li></ul>`);
}

function enter(page, auth = false) {
  closeMenu();
  if (dialog.open) dialog.close();
  scene?.setVisible(false);
  site.hidden = true;
  document.body.classList.remove('rg-experience-mode');
  document.body.classList.add('rg-app-mode');
  if (auth) window.AGRIDELTAOpenAuth?.();
  else window.AGRIDELTAOpenDemo?.(page);
  app.querySelector('h1, h2')?.setAttribute('tabindex','-1');
  app.querySelector('h1, h2')?.focus({preventScroll:true});
  window.scrollTo({top:0, behavior:'instant'});
}
function open() {
  site.hidden = false;
  document.body.classList.add('rg-experience-mode');
  document.body.classList.remove('rg-app-mode');
  closeMenu();
  closeGuide();
  if (location.hash === '#rg-roots') history.replaceState(null,'',location.pathname + location.search);
  window.scrollTo({top:0,behavior:'instant'});
  scene?.setVisible(sceneInView);
  layoutScene();
}
get('.garden-menu').addEventListener('click', () => {
  if (menuOpen) { closeMenu(); return; }
  menuOpen = true;
  site.classList.add('garden-menu-open');
  const button = get('.garden-menu');
  button.setAttribute('aria-expanded','true');
  button.setAttribute('aria-label','Đóng menu');
  button.innerHTML = icon('close');
});
site.addEventListener('click', event => {
  const target = event.target.closest('button,a');
  if (!target) return;
  if (target.matches('[data-enter-page]')) enter(target.dataset.enterPage);
  if (target.matches('[data-enter-auth]')) enter('home', true);
  if (target.matches('[data-open-guide]')) {
    if (currentProgress < .45) scrollToRoots();
    openGuide(Number(target.dataset.openGuide), target);
  }
  if (target.matches('.garden-dialog-close')) dialog.close();
  if (target.matches('.garden-guide-close')) closeGuide();
  if (target.matches('[data-search]')) showSearch();
  if (target.matches('[data-knowledge]')) { closeMenu(); showKnowledge(); }
  if (target.matches('[data-replay]') && scene?.ready) { scene.replay(); playback(true); }
  if (target.matches('[data-pause]') && scene?.ready) playback(scene.toggle());
  if (target.matches('[data-plant-stage]') && scene?.ready) {
    const chapter = Number(target.dataset.plantStage);
    if (STAGE_TIMES[chapter] != null) { scene.seekStage(chapter); playback(false); }
  }
  if (target.matches('a[href="#rg-roots"]')) {
    event.preventDefault();
    history.replaceState(null, '', '#rg-roots');
    closeMenu();
    scrollToRoots();
    if (event.detail === 0) nodes[0].focus({preventScroll:true});
  }
  if (target.matches('a[href="#rg-top"]')) {
    closeMenu();
    scheduleScroll();
  }
});
site.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !dialog.open) { closeGuide(); closeMenu(); }
  if (event.target.matches('.garden-node') && ['ArrowLeft','ArrowRight'].includes(event.key)) {
    event.preventDefault();
    const index = nodes.indexOf(event.target);
    nodes[(index + (event.key === 'ArrowRight' ? 1 : nodes.length - 1)) % nodes.length].focus();
  }
});
window.AGRIDELTARootGuide = {open, garden:open, close:() => enter('home'), go:enter};
window.AGRIDELTAStory = {replay:() => { open(); scene?.replay(); playback(true); }};
if (initialRootAnchor) requestAnimationFrame(scrollToRoots);
