import {createLiveEarth, createRootEarth} from './live-earth.js';
import {storyProgress, rootCountAt, rootRevealAt, rootScrollTarget} from './scroll-story-state.js';
import {FEATURES, guideIndex, searchGuides} from './root-guide-data.js';
import farmIcon from '@phosphor-icons/core/assets/regular/farm.svg?raw';
import calendarIcon from '@phosphor-icons/core/assets/regular/calendar-dots.svg?raw';
import clipboardIcon from '@phosphor-icons/core/assets/regular/clipboard-text.svg?raw';
import plantIcon from '@phosphor-icons/core/assets/regular/plant.svg?raw';
import cubeIcon from '@phosphor-icons/core/assets/regular/cube.svg?raw';
import leafIcon from '@phosphor-icons/core/assets/regular/leaf.svg?raw';
import bookIcon from '@phosphor-icons/core/assets/regular/book-open.svg?raw';
import searchIcon from '@phosphor-icons/core/assets/regular/magnifying-glass.svg?raw';
import rightIcon from '@phosphor-icons/core/assets/regular/arrow-right.svg?raw';
import leftIcon from '@phosphor-icons/core/assets/regular/arrow-left.svg?raw';
import downIcon from '@phosphor-icons/core/assets/regular/arrow-down.svg?raw';
import closeIcon from '@phosphor-icons/core/assets/regular/x.svg?raw';
import menuIcon from '@phosphor-icons/core/assets/regular/list.svg?raw';
import playIcon from '@phosphor-icons/core/assets/regular/play-circle.svg?raw';
import seedIcon from '@phosphor-icons/core/assets/regular/grains.svg?raw';
import flowerIcon from '@phosphor-icons/core/assets/regular/flower-lotus.svg?raw';
import pauseIcon from '@phosphor-icons/core/assets/regular/pause.svg?raw';
import replayIcon from '@phosphor-icons/core/assets/regular/arrow-counter-clockwise.svg?raw';

const icons = {
  farm: farmIcon, calendar: calendarIcon, clipboard: clipboardIcon, plant: plantIcon,
  cube: cubeIcon, leaf: leafIcon, book: bookIcon, search: searchIcon, right: rightIcon,
  left: leftIcon, down: downIcon, close: closeIcon, menu: menuIcon, play: playIcon,
  pause: pauseIcon, replay: replayIcon, seed: seedIcon, flower: flowerIcon,
};
const icon = name => `<span class="earth-icon" aria-hidden="true">${icons[name]}</span>`;
const titles = ['Quản lý cánh đồng', 'Quản lý mùa vụ', 'Công việc hằng ngày', 'Quan sát cây trồng', 'Quản lý đơn hàng'];
const symbols = ['farm', 'calendar', 'clipboard', 'plant', 'cube'];
const stages = ['Hạt giống', 'Nảy mầm', 'Sinh trưởng', 'Ra hoa', 'Kết quả'];
const stageIcons = ['seed', 'plant', 'leaf', 'flower', 'seed'];
const stageNotes = [
  'Hạt hút ẩm và chuẩn bị nảy mầm.',
  'Mầm non vươn lên khỏi mặt đất.',
  'Thân vươn cao, lá mở rộng.',
  'Những bông hoa đầu tiên hé nở.',
  'Quả đậu lớn dần từ cuống hoa.',
];
const rootPoints = [[8.8,51.3],[25.9,67.9],[52.4,78.2],[72.6,70.9],[91.4,47.8]];
const brand = `<img src="/assets/agridelta-brand-mark.webp" alt="" width="38" height="38"><strong>AGRIDELTA</strong>`;
const site = document.createElement('div');
site.id = 'rg-site';
site.className = 'earth-site';
site.innerHTML = `
  <a class="earth-skip" href="#rg-main">Bỏ qua điều hướng</a>
  <header class="earth-header" id="rg-top">
    <div class="earth-container earth-header-inner">
      <a class="earth-brand" href="#rg-top" aria-label="AGRIDELTA — Trang chủ">${brand}</a>
      <nav class="earth-nav" id="earth-navigation" aria-label="Điều hướng chính">
        <a href="#rg-top" aria-current="page">Trang chủ</a>
        <a href="#rg-roots">Bộ rễ</a>
        <a href="#rg-guides">Tính năng</a>
        <button type="button" data-knowledge>Kiến thức</button>
      </nav>
      <div class="earth-header-actions">
        <button type="button" class="earth-icon-button" aria-label="Tìm tính năng và hướng dẫn" data-search>${icon('search')}</button>
        <button type="button" class="earth-login" data-enter-auth>Đăng nhập</button>
        <button type="button" class="earth-primary earth-header-cta" data-enter-page="home">Dùng thử ${icon('right')}</button>
        <button type="button" class="earth-icon-button earth-menu" aria-label="Mở menu" aria-expanded="false" aria-controls="earth-navigation">${icon('menu')}</button>
      </div>
    </div>
  </header>
  <main id="rg-main" tabindex="-1">
    <section class="earth-container start-hero" aria-labelledby="start-title">
      <div class="earth-intro">
        <p class="earth-eyebrow">${icon('plant')} Nông nghiệp thông minh</p>
        <h1 id="start-title">Từ hạt giống<br>đến mùa vụ <em>bền vững.</em></h1>
        <p class="earth-intro-copy">Quản lý cánh đồng, theo dõi cây trồng và lên kế hoạch mùa vụ từ một nơi.</p>
        <div class="earth-intro-actions">
          <button type="button" class="earth-primary" data-enter-page="home">Bắt đầu miễn phí ${icon('right')}</button>
          <a class="earth-secondary" href="#rg-roots">${icon('down')} Khám phá bộ rễ</a>
        </div>
      </div>
      <figure class="plant-journey" aria-labelledby="journey-title">
        <div class="plant-landscape">
          <img class="plant-backdrop" src="/assets/start-landscape-clear.webp" alt="" fetchpriority="high">
          <div class="plant-art">
            <div class="plant-model" id="live-earth" data-scene-state="loading" aria-hidden="true">
              <img class="plant-poster" src="/assets/start-botanical-lifecycle-2.webp" alt="" fetchpriority="high">
            </div>
          </div>
          <div class="plant-visual-label"><span></span> Vòng đời cây đậu</div>
          <div class="plant-stage-tag" aria-hidden="true"><span class="stage-current-number">03</span><span>/ 05</span></div>
        </div>
        <figcaption class="plant-controls">
          <div class="plant-controls-heading">
            <div><h2 id="journey-title">Hành trình của cây</h2><p id="lifecycle-label">${stageNotes[2]}</p></div>
            <div class="plant-actions">
              <button type="button" class="earth-icon-button" data-replay aria-label="Phát từ hạt giống" title="Phát từ hạt giống">${icon('replay')}</button>
              <button type="button" class="earth-icon-button" data-pause aria-label="Phát vòng đời" title="Phát vòng đời">${icon('play')}</button>
            </div>
          </div>
          <div class="plant-stages" role="group" aria-label="Chọn giai đoạn của cây">${stages.map((stage,i) => `
            <button type="button" data-plant-stage="${i}" aria-pressed="${i === 2}">${icon(stageIcons[i])}<span>${stage}</span></button>`).join('')}
          </div>
        </figcaption>
      </figure>
    </section>

    <section class="root-features" id="rg-roots" aria-labelledby="root-title">
      <div class="root-scroll-track">
        <div class="earth-container root-spread">
          <div class="root-discovery">
            <p class="earth-eyebrow">${icon('plant')} Bên dưới mặt đất</p>
            <h2 id="root-title" class="root-story-title">Một mùa vụ<br>bắt đầu từ rễ.</h2>
            <p class="root-story-desc">Cuộn xuống để xem rễ chính vươn sâu và các rễ bên tỏa ra. Chạm vào một điểm trên rễ để mở hướng dẫn tương ứng.</p>
            <div class="root-progress" aria-label="Số nhánh rễ đã hiện">
              <span id="root-progress-text" role="status">01 / 05 nhánh rễ</span>
              <span class="root-progress-meter" aria-hidden="true">${'<i></i>'.repeat(5)}</span>
            </div>
            <div class="root-discovery-actions">
              <button type="button" class="root-next" data-grow-root>Nhánh tiếp theo ${icon('down')}</button>
              <a class="root-skip" href="#rg-guides">Xem tính năng ${icon('right')}</a>
            </div>
          </div>
          <div class="root-visual">
            <div class="root-visual-horizon" aria-hidden="true"></div>
            <div class="root-visual-label"><span></span> Mặt cắt bộ rễ</div>
            <div class="root-model-frame">
              <div class="root-model" data-scene-state="loading" aria-hidden="true">
                <img class="root-poster" src="/assets/start-botanical-root-2.webp" alt="" loading="lazy">
              </div>
              <div class="root-feature-track">${FEATURES.map((feature,i) => `
                <button type="button" class="root-feature" hidden data-open-guide="${i}" data-root-point
                  style="--root-x:${rootPoints[i][0]}%;--root-y:${rootPoints[i][1]}%"
                  aria-haspopup="dialog" aria-controls="earth-dialog" aria-label="Mở hướng dẫn ${feature.label}">${icon(symbols[i])}</button>`).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="earth-container start-guides" id="rg-guides" aria-labelledby="start-guides-title">
      <div class="guide-intro">
        <div><p class="earth-eyebrow">${icon('leaf')} Hệ sinh thái AgriDelta</p><h2 id="start-guides-title">Chăm trọn một mùa vụ.</h2></div>
        <p>Chọn một tính năng để xem cách sử dụng và mở ngay trong bản dùng thử.</p>
      </div>
      <div class="start-feature-dock">${FEATURES.map((feature,i) => `
        <button type="button" class="start-dock-button" data-open-guide="${i}" aria-haspopup="dialog" aria-controls="earth-dialog">
          <span class="dock-icon">${icon(symbols[i])}</span>
          <strong>${feature.label}</strong>
          <span class="dock-summary">${feature.summary}</span>
          <span class="dock-arrow">${icon('right')}</span>
        </button>`).join('')}
      </div>
    </section>
  </main>
  <footer class="earth-footer">
    <div class="earth-container earth-footer-inner">
      <a class="earth-brand" href="#rg-top" aria-label="AGRIDELTA — Về đầu trang">${brand}</a>
      <span>© 2026 AGRIDELTA</span>
      <button type="button" data-open-guide="0">Hướng dẫn sử dụng ${icon('right')}</button>
    </div>
  </footer>
  <dialog class="earth-dialog" id="earth-dialog" aria-labelledby="earth-dialog-title">
    <div class="earth-dialog-inner">
      <button type="button" class="earth-icon-button earth-dialog-close" aria-label="Đóng cửa sổ" data-close-dialog>${icon('close')}</button>
      <div id="earth-dialog-content"></div>
    </div>
  </dialog>
`;
document.body.insertBefore(site, document.querySelector('#app'));
document.body.classList.add('rg-experience-mode');

const find = selector => site.querySelector(selector);
const buttons = [...site.querySelectorAll('[data-plant-stage]')];
const plantControl = find('[data-pause]');
let plantUI = '';
const plant = createLiveEarth(find('#live-earth'), (stage, playing, ended) => {
  const key = `${stage}:${playing}:${ended}`;
  if (key === plantUI) return;
  plantUI = key;
  buttons.forEach((button,i) => button.setAttribute('aria-pressed', String(stage === i)));
  find('#lifecycle-label').textContent = stageNotes[stage];
  find('.stage-current-number').textContent = `0${stage+1}`;
  const label = playing ? 'Tạm dừng vòng đời' : ended ? 'Phát lại vòng đời' : 'Phát vòng đời';
  plantControl.innerHTML = icon(playing ? 'pause' : ended ? 'replay' : 'play');
  plantControl.title = label;
  plantControl.setAttribute('aria-label', label);
});

const rootSection = find('.root-features');
const track = find('.root-scroll-track');
const spread = find('.root-spread');
const rootButtons = [...site.querySelectorAll('[data-root-point]')];
const meter = [...site.querySelectorAll('.root-progress-meter i')];
const growButton = find('[data-grow-root]');
const earth = createRootEarth(find('.root-model'), rootButtons);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let progress = 0;
let target = 0;
let lastTick = 0;
let storyFrame = 0;
let rootCount = -1;

function scrollBounds() {
  const stickyTop = parseFloat(getComputedStyle(spread).top) || 0;
  return {
    offset: stickyTop,
    travel: Math.max(1, track.offsetHeight - spread.offsetHeight),
    top: track.getBoundingClientRect().top,
  };
}

function renderRoots(now) {
  storyFrame = 0;
  if (site.hidden) return;
  const elapsed = lastTick ? Math.min(64, now-lastTick) : 16;
  lastTick = now;
  const factor = reducedMotion.matches ? 1 : 1-Math.exp(-elapsed/95);
  progress += (target-progress)*factor;
  if (Math.abs(target-progress) < .0005) progress = target;
  earth.setScrollRoots(progress);
  rootSection.dataset.storyProgress = progress.toFixed(3);

  rootButtons.forEach((button,i) => {
    const isExposed = rootRevealAt(progress,i) > .93;
    if (!isExposed && button === document.activeElement) growButton.focus({preventScroll: true});
    button.hidden = !isExposed;
  });
  const count = rootCountAt(progress);
  if (rootCount !== count) {
    rootCount = count;
    find('#root-progress-text').textContent = `0${count} / 05 nhánh rễ`;
    growButton.innerHTML = count >= 5 ? `Xem các hướng dẫn ${icon('right')}` : `Nhánh tiếp theo ${icon('down')}`;
    meter.forEach((bar,i) => bar.classList.toggle('is-grown', i < count));
  }
  if (progress !== target) storyFrame = requestAnimationFrame(renderRoots);
  else lastTick = 0;
}

function scheduleRoots() {
  if (site.hidden) return;
  const {offset, travel, top} = scrollBounds();
  target = storyProgress(offset - top, travel);
  if (!storyFrame) storyFrame = requestAnimationFrame(renderRoots);
}

window.addEventListener('scroll', scheduleRoots, {passive: true});
function sizeRootSpread() {
  if (!spread.offsetHeight) return;
  spread.style.setProperty('--root-pin-top', `${Math.min(0, innerHeight - spread.offsetHeight - 10)}px`);
  scheduleRoots();
}

new ResizeObserver(sizeRootSpread).observe(spread);
window.addEventListener('resize', sizeRootSpread, {passive: true});
sizeRootSpread();

function growNext() {
  if (rootCount >= 5) {
    find('#rg-guides').scrollIntoView({behavior: reducedMotion.matches ? 'instant' : 'smooth'});
    find('.start-dock-button').focus({preventScroll: true});
    return;
  }
  const {offset, travel, top} = scrollBounds();
  window.scrollTo({
    top: window.scrollY + top - offset + travel * rootScrollTarget(rootCount),
    behavior: reducedMotion.matches ? 'instant' : 'smooth',
  });
}

const dialog = find('#earth-dialog');
const dialogContent = find('#earth-dialog-content');
let activeGuide = 0;

function displayDialog(content, focusSelector = '[data-close-dialog]') {
  dialogContent.innerHTML = content;
  if (!dialog.open) {
    dialog.showModal();
    document.body.classList.add('earth-modal-open');
  }
  find(focusSelector)?.focus({preventScroll: true});
}

dialog.addEventListener('close', () => document.body.classList.remove('earth-modal-open'));
dialog.addEventListener('click', event => {
  if (event.target === dialog || event.target.closest('[data-close-dialog]')) dialog.close();
});

function openGuide(index, focusSelector) {
  activeGuide = guideIndex(Number(index));
  const feature = FEATURES[activeGuide];
  displayDialog(`
    <p class="earth-eyebrow">${icon(symbols[activeGuide])} Hướng dẫn sử dụng</p>
    <h2 id="earth-dialog-title">${titles[activeGuide]}</h2>
    <p class="earth-dialog-summary">${feature.summary}</p>
    <ol class="guide-instructions">${feature.instructions.map(text => `<li>${text}</li>`).join('')}</ol>
    <div class="guide-sheet-bottom">
      <div class="guide-paging">
        <button type="button" class="earth-icon-button" data-guide-previous aria-label="Hướng dẫn trước">${icon('left')}</button>
        <span>0${activeGuide+1} / 05</span>
        <button type="button" class="earth-icon-button" data-guide-next aria-label="Hướng dẫn tiếp theo">${icon('right')}</button>
      </div>
      <button class="earth-primary" type="button" data-enter-page="${feature.page}">Mở ${feature.label.toLowerCase()} ${icon('right')}</button>
    </div>
    <p class="guide-note">Dữ liệu của bản dùng thử được lưu trên thiết bị này.</p>
  `, focusSelector);
}

function openSearch() {
  displayDialog(`
    <p class="earth-eyebrow">${icon('search')} Tìm kiếm</p>
    <h2 id="earth-dialog-title">Bạn cần tìm điều gì?</h2>
    <label class="earth-search-input">${icon('search')}<input type="search" id="earth-search-field"
      placeholder="Nhập tên tính năng" aria-label="Tìm tính năng hoặc hướng dẫn"></label>
    <div id="earth-search-results"></div>
  `, '#earth-search-field');
  const input = find('#earth-search-field');
  function update() {
    const found = searchGuides(input.value);
    find('#earth-search-results').innerHTML = found.length ? found.map(({feature,index}) => `
      <button type="button" data-open-guide="${index}">${icon(symbols[index])}
        <span><strong>${titles[index]}</strong><small>${feature.summary}</small></span>${icon('right')}
      </button>`).join('') : '<p>Chưa tìm thấy kết quả. Thử “mùa vụ”, “cánh đồng” hoặc “quan sát”.</p>';
  }
  input.addEventListener('input', update);
  update();
}

function openKnowledge() {
  displayDialog(`
    <p class="earth-eyebrow">${icon('book')} Kiến thức canh tác</p>
    <h2 id="earth-dialog-title">Chăm đúng từ gốc rễ.</h2>
    <div class="knowledge-list">
      <article>${icon('farm')}<div><h3>Hiểu khu đất trước khi gieo</h3><p>Ghi lại diện tích, loại đất và cây đang trồng để lên kế hoạch.</p></div></article>
      <article>${icon('calendar')}<div><h3>Theo dõi từng mốc mùa vụ</h3><p>Lưu ngày gieo và lịch chăm sóc phù hợp với từng loại cây.</p></div></article>
      <article>${icon('plant')}<div><h3>Quan sát đều đặn</h3><p>Ghi nhận màu lá, độ ẩm và hình ảnh của cây theo thời gian.</p></div></article>
    </div>
  `);
}

const menu = find('.earth-menu');
function setMenu(expanded) {
  site.classList.toggle('earth-menu-open', expanded);
  menu.setAttribute('aria-expanded', String(expanded));
  menu.setAttribute('aria-label', expanded ? 'Đóng menu' : 'Mở menu');
  menu.innerHTML = icon(expanded ? 'close' : 'menu');
}

function enter(page = 'home', auth = false) {
  if (dialog.open) dialog.close();
  plant.setVisible(false);
  setMenu(false);
  site.hidden = true;
  document.body.classList.remove('rg-experience-mode', 'earth-modal-open');
  document.body.classList.add('rg-app-mode');
  if (auth) window.AGRIDELTAOpenAuth?.();
  else window.AGRIDELTAOpenDemo?.(page);
  window.scrollTo({top: 0, behavior: 'instant'});
  const title = document.querySelector('#app h1, #app h2');
  title?.setAttribute('tabindex', '-1');
  title?.focus({preventScroll: true});
}

function open() {
  site.hidden = false;
  document.body.classList.add('rg-experience-mode');
  document.body.classList.remove('rg-app-mode');
  plant.setVisible(true);
  window.scrollTo({top: 0, behavior: 'instant'});
  scheduleRoots();
}

site.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (event.target.closest('.earth-nav a')) setMenu(false);
  if (!button) return;
  if (button === menu) setMenu(menu.getAttribute('aria-expanded') === 'false');
  else if (button.hasAttribute('data-open-guide')) openGuide(button.dataset.openGuide);
  else if (button.hasAttribute('data-enter-page')) enter(button.dataset.enterPage);
  else if (button.hasAttribute('data-enter-auth')) enter('home', true);
  else if (button.hasAttribute('data-plant-stage')) plant.seekStage(Number(button.dataset.plantStage));
  else if (button.hasAttribute('data-replay')) plant.replay();
  else if (button === plantControl) plant.toggle();
  else if (button === growButton) growNext();
  else if (button.hasAttribute('data-search')) openSearch();
  else if (button.hasAttribute('data-guide-previous')) openGuide(activeGuide - 1, '[data-guide-previous]');
  else if (button.hasAttribute('data-guide-next')) openGuide(activeGuide + 1, '[data-guide-next]');
  else if (button.hasAttribute('data-knowledge')) {
    if (menu.getAttribute('aria-expanded') === 'true') menu.focus({preventScroll: true});
    setMenu(false);
    openKnowledge();
  }
});
site.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !dialog.open && site.classList.contains('earth-menu-open')) {
    setMenu(false);
    menu.focus();
  }
});

window.AGRIDELTARootGuide = {open, close: () => enter(), go: enter};
window.AGRIDELTAStory = {replay: () => { open(); plant.replay(); }};
