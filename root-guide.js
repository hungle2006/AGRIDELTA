import {createLiveEarth, createRootEarth} from './live-earth.js';
import {initAgrideltaMotion} from './interaction-motion.js';
import {initBeanTransitions} from './bean-drop-scene.js';
import {storyProgress, rootCountAt, rootRevealAt, rootScrollTarget} from './scroll-story-state.js';
import {FEATURES, guideIndex, searchGuides} from './root-guide-data.js';
import {START_IMAGES, startPhoto} from './start-photography.js';
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
import seedIcon from '@phosphor-icons/core/assets/regular/grains.svg?raw';
import flowerIcon from '@phosphor-icons/core/assets/regular/flower-lotus.svg?raw';

const icons = {
  farm: farmIcon, calendar: calendarIcon, clipboard: clipboardIcon, plant: plantIcon,
  cube: cubeIcon, leaf: leafIcon, book: bookIcon, search: searchIcon, right: rightIcon,
  left: leftIcon, down: downIcon, close: closeIcon, menu: menuIcon,
  seed: seedIcon, flower: flowerIcon,
};
const icon = name => `<span class="earth-icon" aria-hidden="true">${icons[name]}</span>`;
const titles = FEATURES.map(feature=>feature.label);
const symbols = ['farm', 'plant', 'cube'];
const stages = ['Hạt giống', 'Nảy mầm', 'Sinh trưởng', 'Ra hoa', 'Kết quả'];
const stageIcons = ['seed', 'plant', 'leaf', 'flower', 'seed'];
const stageNotes = [
  'Hạt hút ẩm và chuẩn bị nảy mầm.',
  'Mầm non vươn lên khỏi mặt đất.',
  'Thân vươn cao, lá mở rộng.',
  'Những bông hoa đầu tiên hé nở.',
  'Quả đậu lớn dần từ cuống hoa.',
];
const workflow = [
  {title:'Chọn khu vực',detail:'Tìm địa danh hoặc nhập tọa độ để xem dự báo môi trường.'},
  {title:'Kiểm tra ảnh cây',detail:'Chụp hoặc tải ảnh để nhận phân tích từ AI Plant Doctor.',image:'/assets/start-workflow-season.webp',width:960,height:540},
  {title:'Khám phá cây 3D',detail:'Quan sát mô hình Blender theo từng giai đoạn sinh trưởng.'},
];
const rootPoints = [[25.9,67.9],[52.4,78.2],[72.6,70.9]];
const beanDivider = (index,kind='secondary') =>
  '<div id="bean-transition-'+index+'" class="bean-transition bean-transition--'+kind+'" data-bean-divider="'+index+'" aria-hidden="true">'+
  '<span class="bean-transition-line"></span></div>';
const brand = `<img class="ag-eco-wordmark" src="/assets/agridelta-eco-logo.svg" alt="" width="2172" height="724" decoding="async">`;
const site = document.createElement('div');
site.id = 'rg-site';
site.className = 'earth-site';
site.innerHTML = `
  <a class="earth-skip" href="#rg-main">Bỏ qua điều hướng</a>
  <div class="site-field-backdrop" aria-hidden="true"></div>
  <div class="bean-fall-overlay" id="bean-fall-overlay" aria-hidden="true"></div>
  <span id="rg-top" class="start-page-top" aria-hidden="true"></span>
  <header class="earth-header">
    <div class="earth-container earth-header-inner">
      <a class="earth-brand" href="#rg-top" aria-label="AGRIDELTA — Trang chủ">${brand}</a>
      <nav class="earth-nav" id="earth-navigation" aria-label="Điều hướng chính">
        <a href="#rg-top" aria-current="page">Trang chủ</a>
        <a href="#rg-roots">Bộ rễ</a>
        <a href="#rg-guides">Tính năng</a>
        <button type="button" data-knowledge>Kiến thức</button>
        <button type="button" class="earth-mobile-nav-item" data-search>${icon('search')} Tìm kiếm</button>
        <button type="button" class="earth-mobile-nav-item" data-enter-auth>Tài khoản</button>
      </nav>
      <div class="earth-header-actions">
        <button type="button" class="earth-icon-button" aria-label="Tìm tính năng và hướng dẫn" data-search>${icon('search')}</button>
        <button type="button" class="earth-login" data-enter-auth>Tài khoản</button>
        <button type="button" class="earth-primary earth-header-cta" data-enter-page="home">Vào ứng dụng ${icon('right')}</button>
        <button type="button" class="earth-icon-button earth-menu" aria-label="Mở menu" aria-expanded="false" aria-controls="earth-navigation">${icon('menu')}</button>
      </div>
    </div>
  </header>
  <main id="rg-main" tabindex="-1">
    <section class="start-hero" data-hero-entrance="growing" aria-labelledby="start-title">
      <div class="earth-container hero-layout">
        <div class="earth-intro">
          <div class="hero-kicker-row">
            <p class="earth-eyebrow">${icon('plant')} Nông nghiệp thông minh</p>
            <span class="hero-issue" aria-hidden="true">FIELD JOURNAL / 01</span>
          </div>
          <h1 id="start-title">Từ hạt giống<br>đến mùa vụ<br><em>bền vững.</em></h1>
          <p class="earth-intro-copy">Dự báo môi trường, kiểm tra ảnh cây bằng AI và khám phá vòng đời cây đậu 3D — trong một không gian xanh.</p>
          <div class="earth-intro-actions">
            <button type="button" class="earth-primary" data-enter-page="home">Khám phá ứng dụng ${icon('right')}</button>
            <a class="earth-secondary" href="#rg-roots">${icon('down')} Khám phá bộ rễ</a>
          </div>
          <div class="hero-editorial-note" aria-label="Bức ảnh nông nghiệp thực tế">
            ${startPhoto(START_IMAGES.hero,"hero-editorial-photo","(max-width:760px) 110px, 156px")}
            <div class="hero-editorial-copy">
              <span class="hero-editorial-index">TỪ THỰC TẾ ĐẾN CÔNG NGHỆ</span>
              <strong>Từng mùa xanh bắt đầu từ sự thấu hiểu.</strong>
            </div>
          </div>
        </div>
        <figure class="plant-journey" aria-labelledby="journey-title">
          <div class="plant-art">
            <div class="plant-model" id="live-earth" data-scene-state="loading" aria-hidden="true">
              <img class="plant-poster" src="/assets/start-botanical-lifecycle-0.webp" alt="" width="580" height="580" fetchpriority="high">
            </div>
          </div>
          <figcaption class="plant-controls">
            <div class="plant-controls-heading">
              <h2 id="journey-title">Vòng đời<br>cây đậu.</h2>
              <p id="lifecycle-label" aria-live="polite">${stageNotes[0]}</p>
            </div>
            <ol class="plant-stages" aria-label="Các giai đoạn của cây đậu">${stages.map((stage,i) => `
              <li${i === 0 ? ' aria-current="step"' : ''}>${icon(stageIcons[i])}<span>${stage}</span></li>`).join('')}
            </ol>
          </figcaption>
        </figure>
      </div>
      <div class="earth-container hero-bottom-rail">
        <span class="hero-bottom-label">AGRIDELTA — GIEO MẦM CHO MỘT TƯƠNG LAI XANH</span>
        <a href="#rg-roots" aria-label="Cuộn xuống khám phá bộ rễ">KHÁM PHÁ BỘ RỄ ${icon('down')}</a>
        <span class="hero-bottom-index">01 — 03</span>
      </div>
    </section>

    ${beanDivider('01','hero')}
    <section class="start-workflow earth-container" aria-labelledby="workflow-title">
      <div class="start-workflow-head">
        <div><p class="earth-eyebrow">01 / KHỞI ĐẦU</p><h2 id="workflow-title">Bắt đầu một mùa vụ.</h2></div>
        <p>Ba bước đơn giản để biến việc chăm sóc cây trồng thành một hành trình rõ ràng, từ gieo hạt đến thu hoạch.</p>
      </div>
      <ol class="workflow-steps">
        ${workflow.map(({title, detail},i) => `
          <li style="--step: ${i}">
            <button class="workflow-card" type="button" data-open-guide="${i}" aria-haspopup="dialog" aria-controls="earth-dialog">
              ${startPhoto(START_IMAGES.workflow[i],"workflow-photo","(max-width:760px) 38vw, 31vw")}
              <span class="workflow-content">
                <span class="workflow-index">Bước ${i+1}</span>
                <strong>${title}</strong>
                <span>${detail}</span>
              </span>
              <span class="workflow-arrow">${icon('right')}</span>
            </button>
          </li>`).join('')}
      </ol>
    </section>

    ${beanDivider('02','secondary')}
    <section class="root-features" id="rg-roots" aria-labelledby="root-title">
      <div class="root-scroll-track">
        <div class="earth-container root-spread">
          <div class="root-discovery">
            <p class="earth-eyebrow">${icon('plant')} Bên dưới mặt đất</p>
            <h2 id="root-title" class="root-story-title">Một mùa vụ<br> bắt đầu từ rễ.</h2>
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
            <div class="root-visual-label">Mặt cắt bộ rễ</div>
            <div class="root-model-frame">
              <div class="root-model" data-scene-state="loading" aria-hidden="true">
                <img class="root-poster" src="/assets/start-botanical-root-2.webp" alt="" loading="lazy">
              </div>
              <div class="root-feature-track">${FEATURES.map((feature,i) => `
                <button type="button" class="root-feature" hidden data-open-guide="${i}" data-root-point data-root-index="${i+1}"
                  style="--root-x:${rootPoints[i][0]}%;--root-y:${rootPoints[i][1]}%"
                  aria-haspopup="dialog" aria-controls="earth-dialog" aria-label="Mở hướng dẫn ${feature.label}">${icon(symbols[i])}</button>`).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    ${beanDivider('03','secondary')}
    <section class="earth-container start-guides" id="rg-guides" aria-labelledby="start-guides-title">
      <div class="guide-intro">
        <div><p class="earth-eyebrow">${icon('leaf')} Hệ sinh thái AgriDelta</p><h2 id="start-guides-title">Ba hệ thống, một mùa xanh.</h2></div>
        <p>Chọn một tính năng để xem cách sử dụng và mở ngay trong ứng dụng.</p>
      </div>
      <div class="start-feature-dock">${FEATURES.map((feature,i) => `
        <button type="button" class="start-dock-button" style="--lane: ${i-1}; --distance: ${Math.abs(i-1)}" data-open-guide="${i}" aria-haspopup="dialog" aria-controls="earth-dialog">
          ${startPhoto(START_IMAGES.features[[0,3,1][i]],"dock-image","(max-width:760px) 38vw, (max-width:980px) 50vw, 32vw")}
          <span class="dock-content">
            <strong><span class="dock-icon">${icon(symbols[i])}</span>${feature.label}</strong>
            <span class="dock-summary">${feature.summary}</span>
          </span>
          <span class="dock-arrow">${icon('right')}</span>
        </button>`).join('')}
      </div>
    </section>
    ${beanDivider('04','secondary')}
    <section class="earth-container start-close" aria-labelledby="start-close-title">
      <div class="start-close-frame">
        ${startPhoto(START_IMAGES.closing,"start-closing-photo","(max-width:760px) 100vw, 90vw")}
        <div class="start-close-copy">
          <h2 id="start-close-title">Sẵn sàng cho mùa vụ tới?</h2>
          <button type="button" class="earth-primary" data-enter-page="home">Vào ứng dụng ${icon('right')}</button>
        </div>
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
site.hidden = true;
document.body.classList.add('rg-app-mode');
// Capture non-bubbling <img> error events and switch to the offline project asset.
site.addEventListener('error', event => {
  const img = event.target;
  if (!(img instanceof HTMLImageElement) || !img.dataset.photoFallback) return;
  const local = img.dataset.photoFallback;
  delete img.dataset.photoFallback;
  img.removeAttribute('srcset');
  img.removeAttribute('sizes');
  img.src = local;
}, true);

const find = selector => site.querySelector(selector);
const stageIndicators = [...site.querySelectorAll('.plant-stages li')];
const lifecycleLabel = find('#lifecycle-label');
const phaseNotes = {
  ripe: 'Ba quả đậu đã chín, chuẩn bị tách khỏi cành.',
  harvesting: 'Ba quả lần lượt rơi: trái, phải và thẳng xuống.',
  harvested: 'Ba quả đã rơi. Phần giới thiệu đang xuất hiện.',
};
const careNotes = {
  watering: 'Giọt nước rơi xuống làm ẩm đất.',
  fertilizing: 'Hạt phân rơi xuống quanh mầm đậu.',
};
let plantUI = '';
let harvestTriggered = false;
let onPlantPhase = () => {};
const plant = createLiveEarth(find('#live-earth'), (stage, phase, care) => {
  const key = `${stage}:${phase}:${care}`;
  if (key !== plantUI) {
    plantUI = key;
    stageIndicators.forEach((indicator, index) => {
      if (index === stage) indicator.setAttribute('aria-current', 'step');
      else indicator.removeAttribute('aria-current');
    });
    lifecycleLabel.textContent = phaseNotes[phase] ?? careNotes[care] ?? stageNotes[stage];
  }
  // Check phase even if the stage label has not changed.
  onPlantPhase(phase);
});

const rootSection = find('.root-features');
const track = find('.root-scroll-track');
const spread = find('.root-spread');
const header = find('.earth-header');
const rootButtons = [...site.querySelectorAll('[data-root-point]')];
const meter = [...site.querySelectorAll('.root-progress-meter i')];
const growButton = find('[data-grow-root]');
const earth = createRootEarth(find('.root-model'), rootButtons);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const hero = find('.start-hero');
const heroCopy = find('.earth-intro');
const heroScene = find('.plant-journey');
let heroEntranceFinished = false;
let heroTextComplete = false;
let introUnlockTimer = 0;
let lastTextTransition = null;
const lastHeroElement = find('.hero-editorial-note');
function setStartScrollLocked(locked) {
  const enabled = locked && !site.hidden && !reducedMotion.matches;
  site.classList.toggle('start-scroll-locked', enabled);
  document.documentElement.classList.toggle('ag-start-scroll-locked', enabled);
  document.body.classList.toggle('ag-start-scroll-locked', enabled);
}
function clearHeroUnlock() {
  window.clearTimeout(introUnlockTimer);
  introUnlockTimer = 0;
  if (lastTextTransition) lastHeroElement.removeEventListener('transitionend', lastTextTransition);
  lastTextTransition = null;
}
function unlockAfterText() {
  if (!heroEntranceFinished) return;
  heroTextComplete = true;
  clearHeroUnlock();
  setStartScrollLocked(false);
}
function centerHeroSpecimen() {
  if (site.hidden || heroEntranceFinished) return;
  if (window.innerWidth <= 900) {
    hero.style.removeProperty('--hero-center-offset');
    return;
  }
  const rect = heroScene.getBoundingClientRect();
  const previous = parseFloat(hero.style.getPropertyValue('--hero-center-offset')) || 0;
  const withoutShift = rect.left + rect.width / 2 - previous;
  const delta = window.innerWidth / 2 - withoutShift;
  const minimum = 16 - (rect.left - previous);
  const maximum = window.innerWidth - 16 - (rect.right - previous);
  const offset = Math.min(maximum, Math.max(minimum, delta));
  hero.style.setProperty('--hero-center-offset', offset.toFixed(1) + 'px');
}
function finishHeroEntrance() {
  if (heroEntranceFinished) return;
  heroEntranceFinished = true;
  hero.dataset.heroEntrance = 'complete';
  heroCopy.inert = false;
  if (reducedMotion.matches) { unlockAfterText(); return; }
  // The final small photo reveals last. Only then may the user swipe down.
  lastTextTransition = event => {
    if (event.target === lastHeroElement && event.propertyName === 'transform') unlockAfterText();
  };
  lastHeroElement.addEventListener('transitionend', lastTextTransition);
  introUnlockTimer = window.setTimeout(unlockAfterText, 2350);
}
function resetHeroEntrance() {
  clearHeroUnlock();
  heroEntranceFinished = false;
  heroTextComplete = false;
  hero.dataset.heroEntrance = 'growing';
  heroCopy.inert = true;
  setStartScrollLocked(true);
  centerHeroSpecimen();
  if (reducedMotion.matches) finishHeroEntrance();
}
onPlantPhase = phase => {
  if (site.hidden) return;
  if (phase === 'ripe' && !harvestTriggered) {
    harvestTriggered = true;
    // Defer until the current 3D update returns. Calling harvest() inside
    // its own update callback would cancel the freshly scheduled frame.
    queueMicrotask(() => {
      if (site.hidden) { harvestTriggered = false; return; }
      plant.harvest();
    });
  } else if (phase === 'harvested') {
    finishHeroEntrance();
  }
};
heroCopy.inert = true;
if (reducedMotion.matches) finishHeroEntrance();
window.addEventListener('resize', centerHeroSpecimen, {passive:true});
if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
  hero.addEventListener('pointermove', event => {
    if (reducedMotion.matches) return;
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX-rect.left)/rect.width-.5;
    const y = (event.clientY-rect.top)/rect.height-.5;
    hero.style.setProperty('--scene-x', `${(x*18).toFixed(1)}px`);
    hero.style.setProperty('--scene-y', `${(y*13).toFixed(1)}px`);
  }, {passive: true});
  hero.addEventListener('pointerleave', () => {
    hero.style.removeProperty('--scene-x');
    hero.style.removeProperty('--scene-y');
  });
}
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
    const isExposed = rootRevealAt(progress,Number(button.dataset.rootIndex)) > .84;
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

// The 3D harvest is automatic; scrolling no longer triggers falling beans.
window.addEventListener('scroll', scheduleRoots, {passive: true});
function sizeRootSpread() {
  if (!spread.offsetHeight) return;
  const rootTop = Math.min(header.offsetHeight, innerHeight - spread.offsetHeight - 10);
  spread.style.setProperty('--root-pin-top', `${rootTop}px`);
  scheduleRoots();
}

const rootLayoutObserver = new ResizeObserver(sizeRootSpread);
rootLayoutObserver.observe(spread);
rootLayoutObserver.observe(header);
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
    <ol class="guide-instructions">${feature.instructions.map((text, index) => `<li><span class="guide-step-number" aria-hidden="true">${index+1}</span><span>${text}</span></li>`).join('')}</ol>
    <div class="guide-sheet-bottom">
      <div class="guide-paging">
        <button type="button" class="earth-icon-button" data-guide-previous aria-label="Hướng dẫn trước">${icon('left')}</button>
        <span>0${activeGuide+1} / 0${FEATURES.length}</span>
        <button type="button" class="earth-icon-button" data-guide-next aria-label="Hướng dẫn tiếp theo">${icon('right')}</button>
      </div>
      <button class="earth-primary" type="button" data-enter-page="${feature.page}">Mở ${feature.label.toLowerCase()} ${icon('right')}</button>
    </div>
    <p class="guide-note">Dữ liệu của ứng dụng được lưu trên thiết bị này.</p>
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
      </button>`).join('') : '<p>Chưa tìm thấy kết quả. Thử “hồng ngoại”, “AI” hoặc “3D”.</p>';
  }
  input.addEventListener('input', update);
  update();
}

function openKnowledge() {
  displayDialog(`
    <p class="earth-eyebrow">${icon('book')} Kiến thức canh tác</p>
    <h2 id="earth-dialog-title">Chăm đúng từ gốc rễ.</h2>
    <div class="knowledge-list">
      <article>${icon('farm')}<div><h3>Hiểu khu đất trước khi gieo</h3><p>Chọn vị trí và xem dự báo nhiệt độ, độ ẩm cùng bức xạ khu vực.</p></div></article>
      <article>${icon('calendar')}<div><h3>Theo dõi từng mốc mùa vụ</h3><p>Quan sát mô hình cây đậu từ hạt giống đến ra hoa, kết quả.</p></div></article>
      <article>${icon('plant')}<div><h3>Quan sát đều đặn</h3><p>Chụp ảnh rõ nét để AI hỗ trợ nhận diện dấu hiệu bất thường.</p></div></article>
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
  setMenu(false);
  site.hidden = true;
  clearHeroUnlock();
  if (heroEntranceFinished) heroTextComplete = true;
  setStartScrollLocked(false);
  plant.setVisible(false);
  document.body.classList.remove('rg-experience-mode', 'earth-modal-open');
  document.body.classList.add('rg-app-mode');
  window.AGRIDELTAEnter?.(auth ? 'settings' : page);
  window.scrollTo({top: 0, behavior: 'instant'});
  const title = document.querySelector('#app h1, #app h2');
  title?.setAttribute('tabindex', '-1');
  title?.focus({preventScroll: true});
}

function open() {
  const url = new URL(window.location.href);
  if (url.searchParams.has('view')) {
    url.searchParams.delete('view');
    window.history.replaceState(window.history.state, '', url);
  }
  site.hidden = false;
  document.body.classList.add('rg-experience-mode');
  document.body.classList.remove('rg-app-mode');
  setStartScrollLocked(!heroTextComplete);
  plant.setVisible(true);
  const phase = find('#live-earth').dataset.harvestState;
  if (phase === 'ripe' && !harvestTriggered) onPlantPhase(phase);
  if (phase === 'harvested') finishHeroEntrance();
  centerHeroSpecimen();
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
  else if (button === growButton) growNext();
  else if (button.hasAttribute('data-search')) {
    setMenu(false);
    openSearch();
  }
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
initAgrideltaMotion(site);
initBeanTransitions(site, find('#bean-fall-overlay'));
window.AGRIDELTAStory = {replay: () => { harvestTriggered = false; resetHeroEntrance(); plant.replay(); open(); }};
 
// Keep the immersive Start as the normal public entry point.
// A dedicated query restores the observatory on reload. Login callbacks still enter authentication.
// Workspace access still requires a verified session in workspace-v2.js.
const appRoute = new URLSearchParams(window.location.search);
const authEntry = appRoute.get('app') === '1'
  || appRoute.get('login') === '1'
  || appRoute.has('code')
  || appRoute.has('error')
  || window.location.pathname === '/login'
  || window.location.pathname.startsWith('/auth/');
if (appRoute.get('view') === 'observatory' && appRoute.get('intro') !== '1') enter('observatory-reload');
else if (authEntry && appRoute.get('intro') !== '1') enter('home', true);
else open();
