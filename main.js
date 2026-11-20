import {readCare} from './garden-care.js';
import {normalizeQuery} from './root-guide-data.js';
import {listObservations, saveObservation, deleteObservation} from './observations.js';

import ui0 from '@phosphor-icons/core/assets/regular/leaf.svg?raw';
import ui1 from '@phosphor-icons/core/assets/regular/house.svg?raw';
import ui2 from '@phosphor-icons/core/assets/regular/calendar-dots.svg?raw';
import ui3 from '@phosphor-icons/core/assets/regular/map-trifold.svg?raw';
import ui4 from '@phosphor-icons/core/assets/regular/camera.svg?raw';
import ui5 from '@phosphor-icons/core/assets/regular/package.svg?raw';
import ui6 from '@phosphor-icons/core/assets/regular/user.svg?raw';
import ui7 from '@phosphor-icons/core/assets/regular/bell.svg?raw';
import ui8 from '@phosphor-icons/core/assets/regular/drop.svg?raw';
import ui9 from '@phosphor-icons/core/assets/regular/arrow-up-right.svg?raw';
import ui10 from '@phosphor-icons/core/assets/regular/check.svg?raw';
import ui11 from '@phosphor-icons/core/assets/regular/plus.svg?raw';
import ui12 from '@phosphor-icons/core/assets/regular/x.svg?raw';
import ui13 from '@phosphor-icons/core/assets/regular/magnifying-glass.svg?raw';
import ui14 from '@phosphor-icons/core/assets/regular/trash.svg?raw';
import ui15 from '@phosphor-icons/core/assets/regular/pencil-simple.svg?raw';
import ui16 from '@phosphor-icons/core/assets/regular/clipboard-text.svg?raw';
import ui17 from '@phosphor-icons/core/assets/regular/arrow-left.svg?raw';
import ui18 from '@phosphor-icons/core/assets/regular/sign-out.svg?raw';
import ui19 from '@phosphor-icons/core/assets/regular/plant.svg?raw';

const icons = {
  'leaf':ui0,
  'house':ui1,
  'calendar-dots':ui2,
  'map-trifold':ui3,
  'camera':ui4,
  'package':ui5,
  'user':ui6,
  'bell':ui7,
  'drop':ui8,
  'arrow-up-right':ui9,
  'check':ui10,
  'plus':ui11,
  'x':ui12,
  'magnifying-glass':ui13,
  'trash':ui14,
  'pencil-simple':ui15,
  'clipboard-text':ui16,
  'arrow-left':ui17,
  'sign-out':ui18,
  'plant':ui19,
};
const I = name => `<span class="app-icon" aria-hidden="true">${icons[name] ?? icons.leaf}</span>`;
const $ = selector => document.querySelector(selector);
const app = $('#app');
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const eq = (a, b) => String(a) === String(b);
const nav = [
  ['home','Tổng quan','house'], ['fields','Cánh đồng','map-trifold'], ['season','Mùa vụ','calendar-dots'],
  ['tasks','Công việc','clipboard-text'], ['scan','Quan sát','camera'], ['orders','Đơn hàng','package'],
];
const status = {
  field:['Đang phát triển','Ổn định','Cần kiểm tra'],
  season:['Đã lên lịch','Đang canh tác','Đã thu hoạch'],
  order:['Mới tạo','Đang chuẩn bị','Đã giao','Đã hủy'],
  task:['Cần làm','Hoàn thành'],
  observation:['Ổn định','Cần theo dõi','Cần xử lý'],
};
const sampleTasks = [
  {id:1,title:'Kiểm tra độ ẩm đất',field:'Vườn rau phía Đông',time:'07:00',done:false},
  {id:2,title:'Tưới nhỏ giọt khu A2',field:'Khu canh tác A2',time:'09:30',done:true},
  {id:3,title:'Ghi nhật ký mùa vụ',field:'Tất cả khu vực',time:'15:00',done:false},
];
const sampleFields = [
  {id:1,name:'Vườn rau phía Đông',type:'Rau xanh',area:'1,2 ha',status:'Đang phát triển',moisture:72},
  {id:2,name:'Khu canh tác A2',type:'Lúa hữu cơ',area:'2,8 ha',status:'Cần kiểm tra',moisture:48},
  {id:3,name:'Khu vườn Mặt Trời',type:'Cây ăn quả',area:'0,8 ha',status:'Ổn định',moisture:65},
];
function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem('agri_' + key)) ?? fallback; }
  catch { return fallback; }
}

const data = {
  fields:load('fields',sampleFields), season:load('season',[]), tasks:load('tasks',sampleTasks), orders:load('orders',[]),
};
for (const key of Object.keys(data)) if (!Array.isArray(data[key])) data[key] = [];
let page = 'home';
let demo = false;
let filters = {query:'',status:''};
let trigger;
let currentForm;
let imageFile;
let previewUrl;
let observationStatus = 'loading';
let observations = [];
let photoUrls = [];

const sectionCopy = {
  fields:['Cánh đồng','Lưu diện tích, cây đang trồng và tình trạng từng khu canh tác.'],
  season:['Mùa vụ','Theo dõi các mốc từ ngày gieo đến lúc thu hoạch.'],
  tasks:['Công việc','Sắp xếp việc chăm sóc theo khu vực, thời hạn và người phụ trách.'],
  scan:['Quan sát cây trồng','Lưu ảnh, tình trạng và nhận xét để đối chiếu theo thời gian.'],
  orders:['Đơn hàng','Theo dõi sản phẩm, số lượng và trạng thái giao hàng.'],
  profile:['Phiên dùng thử','Xem thông tin về dữ liệu đang lưu trên thiết bị.'],
};
const fieldOptions = () => data.fields.map(item => item.name);
const schemas = {
  field:{store:'fields',label:'khu canh tác',title:'Tên khu canh tác',fields:[
    ['name','Tên khu canh tác','text'], ['type','Loại cây trồng','text'], ['area','Diện tích','text'],
    ['moisture','Độ ẩm tham khảo (%)','number',false], ['status','Trạng thái','select',true,() => status.field],
  ]},
  season:{store:'season',label:'mùa vụ',title:'Tên mùa vụ',fields:[
    ['name','Tên mùa vụ','text'], ['field','Khu vực','text',true,fieldOptions], ['date','Ngày bắt đầu','date'],
    ['harvest','Ngày thu hoạch dự kiến','date',false], ['status','Trạng thái','select',true,() => status.season],
  ]},
  task:{store:'tasks',label:'công việc',title:'Tên công việc',fields:[
    ['title','Tên công việc','text'], ['field','Khu vực','text',true,fieldOptions], ['date','Ngày thực hiện','date',false],
    ['time','Giờ thực hiện','time',false], ['assignee','Người phụ trách','text',false],
    ['category','Loại công việc','select',true,() => ['Chăm sóc','Kiểm tra','Thu hoạch','Khác']],
  ]},
  order:{store:'orders',label:'đơn hàng',title:'Sản phẩm',fields:[
    ['name','Sản phẩm','text'], ['customer','Khách hàng','text'], ['quantity','Số lượng','text'],
    ['status','Trạng thái','select',true,() => status.order], ['note','Ghi chú','textarea',false],
  ]},
  observation:{label:'quan sát',title:'Tên quan sát',fields:[
    ['name','Tên quan sát','text'], ['field','Khu vực','text',true,fieldOptions], ['date','Ngày quan sát','date'],
    ['status','Tình trạng cây','select',true,() => status.observation], ['note','Ghi chú','textarea',true],
  ]},
};
const activeLabel = () => nav.find(([id]) => id === page)?.[1] ?? 'Phiên dùng thử';
function badge(text) {
  const tone = ['Cần kiểm tra','Cần theo dõi','Đang chuẩn bị'].includes(text) ? 'amber' : ['Cần xử lý','Đã hủy'].includes(text) ? 'red' : 'green';
  return `<span class="farm-badge" data-tone="${tone}">${escapeHtml(text)}</span>`;
}
function formatDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? '')) return '';
  return value.split('-').reverse().join('/');
}
const validPage = id => [...nav.map(item => item[0]),'profile'].includes(id) ? id : 'home';
const records = type => type === 'observation' ? observations : data[schemas[type].store];
const recordTitle = (type, item) => item[type === 'task' ? 'title' : 'name'];
const recordStatus = (type,item) => type === 'task' ? status.task[Number(Boolean(item.done))] : item.status || status[type][0];

function toolbar(type) {
  return `<div class="farm-toolbar">
    <label class="farm-search">${I('magnifying-glass')}<input type="search" id="record-search" aria-label="Tìm ${schemas[type].label}" placeholder="Tìm ${schemas[type].label}…" value="${escapeHtml(filters.query)}"></label>
    <label class="farm-filter"><span class="farm-sr">Lọc trạng thái</span><select id="record-filter"><option value="">Mọi trạng thái</option>
      ${status[type].map(value => `<option ${filters.status === value ? 'selected' : ''}>${value}</option>`).join('')}
    </select></label>
    <button class="farm-primary" data-create="${type}">${I('plus')} ${type === 'observation' ? 'Ghi quan sát' : 'Thêm ' + schemas[type].label}</button>
  </div>`;
}
function filtered(type) {
  const query = normalizeQuery(filters.query).trim();
  return records(type).filter(item => (!filters.status || recordStatus(type,item) === filters.status) &&
    normalizeQuery([recordTitle(type,item),item.type,item.field,item.customer,item.assignee,item.category,item.note].filter(Boolean).join(' ')).includes(query));
}
function empty(type) {
  return `<div class="farm-empty">${I('leaf')}<h2>${filters.query || filters.status ? 'Không có kết quả phù hợp' : 'Chưa có ' + schemas[type].label}</h2>
    <p>${filters.query || filters.status ? 'Đổi từ khóa hoặc bộ lọc để tìm lại.' : 'Thêm bản ghi đầu tiên để bắt đầu theo dõi.'}</p></div>`;
}
function list(type) {
  if (type === 'observation' && observationStatus !== 'ready') {
    return `<p class="farm-empty" role="status">${observationStatus === 'loading' ? 'Đang tải lịch sử quan sát…' : 'Không mở được lịch sử quan sát trên trình duyệt này.'}</p>`;
  }
  const entries = filtered(type);
  if (!entries.length) return empty(type);
  if (type === 'field') return `<div class="farm-field-grid">${entries.map(item => `<article class="farm-field">
    <div class="farm-field-header"><span class="farm-module-icon">${I('map-trifold')}</span>${badge(recordStatus(type,item))}</div>
    <h2>${escapeHtml(item.name)}</h2><p>${escapeHtml(item.type)} · ${escapeHtml(item.area)}</p>
    <div class="farm-field-footer"><span>${I('drop')} ${item.moisture === '' || item.moisture == null ? 'Chưa ghi độ ẩm' : escapeHtml(item.moisture) + '% độ ẩm'}</span>
      <button class="farm-outline" data-detail="field" data-id="${escapeHtml(item.id)}">Chi tiết</button></div>
  </article>`).join('')}</div>`;
  const columns = {
    season:['Mùa vụ','Khu vực','Lịch gieo / thu hoạch'],
    task:['Công việc','Khu vực / Phụ trách','Thời hạn'],
    observation:['Quan sát','Khu vực','Ngày ghi nhận'],
    order:['Sản phẩm','Khách hàng','Số lượng'],
  }[type];
  return `<table class="farm-table"><thead><tr>${columns.map(column=>`<th scope="col">${column}</th>`).join('')}<th scope="col">Trạng thái</th><th scope="col"><span class="farm-sr">Thao tác</span></th></tr></thead><tbody>
    ${entries.map(item => {
      const subtitle = type === 'order' ? item.customer : [item.field,item.assignee].filter(Boolean).join(' · ');
      const date = type === 'order' ? item.quantity : [formatDate(item.date),formatDate(item.harvest),item.time].filter(Boolean).join(' · ');
      const itemName = escapeHtml(recordTitle(type,item));
      return `<tr><td><button class="farm-name" data-detail="${type}" data-id="${escapeHtml(item.id)}">${itemName}</button>${item.category ? `<small>${escapeHtml(item.category)}</small>` : ''}</td>
      <td data-col="${columns[1]}">${escapeHtml(subtitle || '—')}</td><td data-col="${columns[2]}">${escapeHtml(date || '—')}</td>
      <td>${badge(recordStatus(type,item))}</td><td><div class="farm-row-actions">
        ${type === 'task' ? `<button class="farm-outline" data-toggle-task data-id="${escapeHtml(item.id)}" aria-label="${item.done ? 'Mở lại' : 'Hoàn thành'} ${itemName}">${I(item.done ? 'x' : 'check')}${item.done ? 'Mở lại' : 'Xong'}</button>` : ''}
        <button class="farm-outline" data-detail="${type}" data-id="${escapeHtml(item.id)}">Chi tiết</button>
      </div></td></tr>`;
    }).join('')}
  </tbody></table>`;
}
function dashboard() {
  const done = data.tasks.filter(item => item.done).length;
  const pending = data.tasks.filter(item => !item.done);
  const moisture = data.fields.map(field => field.moisture).filter(v => v !== '' && v != null && Number.isFinite(Number(v)));
  const moistureLabel = moisture.length ? Math.round(moisture.reduce((sum,n) => sum + Number(n),0) / moisture.length) + '%' : '—';
  const gardenLabels = ['Hạt giống','Nảy mầm','Sinh trưởng','Ra hoa','Cà chua chín đỏ'];
  return `<section class="farm-overview">
    <div class="farm-hero">
      <span>Không gian canh tác · Dùng thử</span>
      <h1 tabindex="-1">Khu vườn của bạn</h1><p>Xem các việc cần làm, tình trạng cánh đồng và kế hoạch mùa vụ.</p>
      <button class="farm-primary" data-create="field">${I('plus')} Thêm khu canh tác</button>
    </div>
    <aside class="farm-story-card"><span>Vòng đời cây cà chua</span><strong>${gardenLabels[readCare().level]}</strong>
      <button class="farm-inverse" data-farm-action="garden">Về cảnh cây 3D ${I('arrow-up-right')}</button>
    </aside>
  </section>
  <div class="farm-stat-grid">
    ${[['map-trifold',data.fields.length,'Khu canh tác','fields'],['clipboard-text',done + '/' + data.tasks.length,'Công việc hoàn thành','tasks'],['drop',moistureLabel,'Độ ẩm nhập thủ công','fields'],['calendar-dots',data.season.length,'Kế hoạch mùa vụ','season']].map(([icon,value,label,destination])=>`<button class="farm-stat" data-page="${destination}">${I(icon)}<strong>${value}</strong><span>${label}</span></button>`).join('')}
  </div>
  <section class="farm-panel farm-today"><div class="farm-panel-head"><h2>Việc cần làm <span>${pending.length}</span></h2><button class="farm-outline" data-page="tasks">Mở công việc ${I('arrow-up-right')}</button></div>
    ${pending.length ? pending.slice(0,5).map(item => `<div class="farm-todo"><button class="farm-icon" aria-label="Hoàn thành ${escapeHtml(item.title)}" data-toggle-task data-id="${escapeHtml(item.id)}">${I('check')}</button><div><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.field)}</small></div><span>${escapeHtml(item.time || formatDate(item.date))}</span></div>`).join('') : '<p>Hiện không còn việc đang chờ.</p>'}
    ${data.tasks.length ? `<div class="farm-completion"><span>${done} / ${data.tasks.length} công việc đã hoàn thành</span><progress max="${data.tasks.length}" value="${done}" aria-label="Tiến độ công việc"></progress></div>` : ''}
  </section>`;
}
function profile() {
  return `<div class="farm-panel farm-profile"><h2>Dữ liệu trên thiết bị</h2><p>Bản dùng thử lưu dữ liệu trong trình duyệt này. Dữ liệu không đồng bộ giữa thiết bị và có thể mất nếu xóa dữ liệu trình duyệt.</p>
    <button class="farm-outline" data-farm-action="leave">${I('sign-out')} Thoát bản dùng thử</button></div>`;
}
function account() {
  return `<section class="farm-account">
    <button class="farm-outline" data-farm-action="garden">${I('arrow-left')} Trang chủ</button>
    <div class="farm-account-card"><img src="/assets/agridelta-mark.svg" width="54" height="54" alt=""><h1 tabindex="-1">Tài khoản AGRIDELTA</h1>
      <p>Đăng nhập và đăng ký chưa khả dụng trên phiên bản này. Bạn có thể vào bản dùng thử để tạo và quản lý bản ghi trên thiết bị.</p>
      <button class="farm-primary" data-farm-action="demo">Vào bản dùng thử ${I('arrow-up-right')}</button>
    </div>
  </section>`;
}
function modulePage() {
  if (page === 'home') return dashboard();
  const [heading,description] = sectionCopy[page];
  const type = {fields:'field',season:'season',tasks:'task',scan:'observation',orders:'order'}[page];
  return `<div class="farm-page-heading"><h1 tabindex="-1">${heading}</h1><p>${description}</p></div>${page === 'profile' ? profile() :
    `${toolbar(type)}<section class="farm-panel farm-records" id="farm-records" data-type="${type}" aria-label="Danh sách ${schemas[type].label}">${list(type)}</section>`}`;
}
function draw({focus = false} = {}) {
  let content = account();
  if (demo) {
    content = `<header class="farm-header"><div class="farm-container farm-header-row">
      <button class="farm-brand" data-page="home" aria-label="AGRIDELTA, tổng quan"><img src="/assets/agridelta-mark.svg" width="37" height="37" alt=""><span>AGRIDELTA</span></button>
      <nav class="farm-nav" aria-label="Các chức năng quản lý">${nav.map(([id,label,symbol]) => `<button data-page="${id}" ${page === id ? 'aria-current="page"' : ''}>${I(symbol)}<span>${label}</span></button>`).join('')}</nav>
      <div class="farm-header-actions"><button class="farm-icon" data-farm-action="notice" aria-label="Công việc đang chờ">${I('bell')}</button><button class="farm-icon" data-page="profile" aria-label="Phiên dùng thử">${I('user')}</button></div>
    </div></header>
    <main class="farm-container farm-main" id="main-content">
      <div class="farm-crumb"><span>Bản dùng thử <span aria-hidden="true">/</span> ${activeLabel()}</span><button class="farm-text" data-farm-action="garden">${I('plant')} Trở về cảnh cây</button></div>
      ${modulePage()}
    </main>
    <footer class="farm-container farm-footer">© 2026 AGRIDELTA <span>Dữ liệu mẫu và bản ghi trên thiết bị</span></footer>`;
  }
  app.innerHTML = `<div class="farm-app">${content}<dialog class="farm-dialog" aria-labelledby="farm-dialog-title"></dialog><div class="farm-toast" role="status"></div></div>`;
  if (focus) app.querySelector('h1')?.focus({preventScroll:true});
}
function showToast(message) {
  const toast = app.querySelector('.farm-toast');
  toast.textContent = message;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => { toast.textContent = ''; }, 3300);
}
function navigate(destination) {
  closeDialog();
  page = validPage(destination);
  filters = {query:'',status:''};
  draw({focus:true});
  scrollTo({top:0,behavior:'instant'});
  if (page === 'scan') refreshObservations();
}
function refreshList() {
  const panel = $('#farm-records');
  if (panel) panel.innerHTML = list(panel.dataset.type);
}
async function refreshObservations() {
  try {
    observations = (await listObservations()).sort((a,b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
    observationStatus = 'ready';
  } catch { observationStatus = 'error'; }
  if (page === 'scan') refreshList();
}
function persist(type, entries) {
  const key = schemas[type].store;
  try { localStorage.setItem('agri_' + key,JSON.stringify(entries)); }
  catch { return false; }
  data[key] = entries;
  return true;
}
function showDialog(content, source) {
  const dialog = app.querySelector('.farm-dialog');
  if (!dialog.open) trigger = source;
  dialog.innerHTML = `<div class="farm-dialog-content"><button class="farm-icon farm-dialog-close" data-farm-action="close" aria-label="Đóng">${I('x')}</button>${content}</div>`;
  if (!dialog.open) {
    dialog.showModal();
    dialog.addEventListener('close', () => {
    for (const url of photoUrls.splice(0)) URL.revokeObjectURL(url);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = null;
    imageFile = null;
    currentForm = null;
      if (trigger?.isConnected) trigger.focus();
      else app.querySelector('[data-create], h1')?.focus({preventScroll:true});
    }, {once:true});
  }
  (dialog.querySelector('input:not([type=file]), h2') ?? dialog).focus();
}
function fieldInput([key,label,kind,required = true,options], entry, type) {
  const value = entry?.[key] ?? (key === 'date' && type === 'observation' ? new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Ho_Chi_Minh'}) : '');
  const needed = required ? 'required' : '';
  let control;
  if (kind === 'select') control = `<select name="${key}" ${needed}>${options().map(option=>`<option ${option === value ? 'selected' : ''}>${escapeHtml(option)}</option>`).join('')}</select>`;
  else if (kind === 'textarea') control = `<textarea name="${key}" maxlength="500" rows="3" ${needed}>${escapeHtml(value)}</textarea>`;
  else control = `<input name="${key}" type="${kind}" value="${escapeHtml(value)}" ${needed} ${kind === 'number' ? 'min="0" max="100" step="1"' : ''} ${kind === 'text' ? 'maxlength="100"' : ''} ${options ? `list="farm-options-${key}"` : ''}>${options ? `<datalist id="farm-options-${key}">${options().map(item=>`<option value="${escapeHtml(item)}"></option>`).join('')}</datalist>` : ''}`;
  return `<label>${label}${control}</label>`;
}
function openForm(type, entry, source) {
  const schema = schemas[type];
  currentForm = {type,entry};
  imageFile = null;
  showDialog(`<h2 id="farm-dialog-title" tabindex="-1">${entry ? 'Sửa' : 'Thêm'} ${schema.label}</h2>
    <form id="farm-form" class="farm-form">${schema.fields.map(field=>fieldInput(field,entry,type)).join('')}
    ${type === 'observation' ? `<div class="farm-photo-controls"><label>Ảnh từ thiết bị<input id="farm-image" type="file" accept="image/*"></label><label>Chụp ảnh<input id="farm-camera" type="file" accept="image/*" capture="environment"></label><img id="farm-photo-preview" alt="Xem trước ảnh" hidden></div>` : ''}
    <p class="farm-form-error" role="alert"></p><button type="submit" class="farm-primary">Lưu ${schema.label}</button></form>`,source);
}
function detail(type, entry, source) {
  const schema = schemas[type];
  const url = entry.photo ? URL.createObjectURL(entry.photo) : '';
  if (url) photoUrls.push(url);
  const fields = schema.fields.filter(([key]) => key !== 'title' && key !== 'name' && entry[key] !== '' && entry[key] != null);
  showDialog(`<h2 id="farm-dialog-title" tabindex="-1">${escapeHtml(recordTitle(type,entry))}</h2>
    ${url ? `<img class="farm-detail-photo" src="${url}" alt="Ảnh từ lần quan sát này">` : ''}
    <dl class="farm-detail-grid">${fields.map(([key,label,input]) => `<div><dt>${label}</dt><dd>${escapeHtml(input === 'date' ? formatDate(entry[key]) : entry[key])}</dd></div>`).join('')}</dl>
    <div class="farm-dialog-actions"><button class="farm-primary" data-edit="${type}" data-id="${escapeHtml(entry.id)}">${I('pencil-simple')} Sửa</button>
    <button class="farm-outline farm-danger" data-remove="${type}" data-id="${escapeHtml(entry.id)}">${I('trash')} Xóa</button></div>`,source);
}
function closeDialog() { app.querySelector('.farm-dialog')?.close(); }
async function removeRecord(type, id) {
  try {
    if (type === 'observation') { await deleteObservation(String(id)); await refreshObservations(); }
    else if (!persist(type,records(type).filter(item => !eq(item.id,id)))) throw Error('Lưu thất bại');
    closeDialog();
    if (page === 'home') draw();
    else refreshList();
    showToast('Đã xóa bản ghi.');
  } catch { app.querySelector('.farm-form-error').textContent = 'Không thể xóa bản ghi. Hãy thử lại.'; }
}
app.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  const {page:destination, create, detail:showDetail, edit, remove, confirmRemove, id, farmAction} = button.dataset;
  if (destination) navigate(destination);
  if (create) openForm(create,null,button);
  if (showDetail) {
    const record = records(showDetail).find(item => eq(item.id,id));
    if (record) detail(showDetail,record,button);
  }
  if (edit) {
    const record = records(edit).find(item => eq(item.id,id));
    if (record) openForm(edit,record,trigger);
  }
  if (remove) showDialog(`<h2 id="farm-dialog-title" tabindex="-1">Xóa ${schemas[remove].label}?</h2><p>Bản ghi sẽ bị xóa khỏi thiết bị này.</p><p class="farm-form-error" role="alert"></p>
    <div class="farm-dialog-actions"><button class="farm-outline" data-farm-action="close">Hủy</button><button class="farm-primary farm-danger" data-confirm-remove="${remove}" data-id="${escapeHtml(id)}">Xóa bản ghi</button></div>`,trigger);
  if (confirmRemove) removeRecord(confirmRemove,id);
  if (button.hasAttribute('data-toggle-task')) {
    const ok = persist('task',data.tasks.map(item=>eq(item.id,id)?{...item,done:!item.done}:item));
    if (ok && page === 'home') draw();
    else if (ok) refreshList();
    showToast(ok ? 'Đã cập nhật công việc.' : 'Không lưu được thay đổi.');
    app.querySelector(`[data-toggle-task][data-id="${CSS.escape(id)}"]`)?.focus();
  }
  if (farmAction === 'close') closeDialog();
  if (farmAction === 'garden' || farmAction === 'leave') window.AGRIDELTARootGuide?.open();
  if (farmAction === 'demo') window.AGRIDELTAOpenDemo('home');
  if (farmAction === 'notice') {
    const pending = data.tasks.filter(item=>!item.done);
    showDialog(`<h2 id="farm-dialog-title" tabindex="-1">Công việc đang chờ</h2><p>Bạn có ${pending.length} công việc chưa hoàn thành.</p><button class="farm-primary" data-page="tasks">Xem công việc</button>`,button);
  }
});
app.addEventListener('input', event => {
  if (event.target.id === 'record-search') { filters.query = event.target.value; refreshList(); }
});
app.addEventListener('change', event => {
  const input = event.target;
  if (input.id === 'record-filter') { filters.status = input.value; refreshList(); }
  if (!['farm-image','farm-camera'].includes(input.id)) return;
  const file = input.files?.[0];
  if (!file) return;
  const error = $('#farm-form .farm-form-error');
  if (!file.type.startsWith('image/') || file.size > 8 * 1024 * 1024) {
    error.textContent = 'Chọn ảnh có dung lượng không quá 8 MB.';
    input.value = '';
    return;
  }
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  imageFile = file;
  previewUrl = URL.createObjectURL(file);
  const preview = $('#farm-photo-preview');
  preview.src = previewUrl;
  preview.hidden = false;
  error.textContent = '';
});
app.addEventListener('submit', async event => {
  if (event.target.id !== 'farm-form' || !currentForm) return;
  event.preventDefault();
  const form = event.target;
  const {type,entry} = currentForm;
  const values = Object.fromEntries([...new FormData(form)].map(([key,value]) => [key,value.trim()]));
  const error = form.querySelector('.farm-form-error');
  if (schemas[type].fields.some(([key,, ,required = true]) => required && !values[key])) { error.textContent = 'Vui lòng điền đủ các mục bắt buộc.'; return; }
  if (values.harvest && values.date && values.harvest < values.date) { error.textContent = 'Ngày thu hoạch cần sau hoặc trùng ngày bắt đầu.'; return; }
  const next = {...(entry ?? {}),...values,id:entry?.id ?? crypto.randomUUID()};
  if (type === 'task' && !entry) next.done = false;
  const submit = form.querySelector('button[type=submit]');
  submit.disabled = true;
  try {
    if (type === 'observation') {
      if (imageFile) next.photo = imageFile;
      await saveObservation(next);
      await refreshObservations();
    } else {
      const previous = records(type);
      const saved = entry ? previous.map(item => eq(item.id,entry.id) ? next : item) : [next,...previous];
      if (!persist(type,saved)) throw Error('Lưu thất bại');
    }
    closeDialog();
    if (page === 'home') draw();
    else refreshList();
    showToast('Đã lưu thông tin.');
  } catch {
    error.textContent = 'Không lưu được bản ghi trên thiết bị này. Hãy thử lại.';
    submit.disabled = false;
  }
});
window.AGRIDELTAOpenDemo = function(destination = 'home') {
  demo = true;
  navigate(destination);
};
window.AGRIDELTAOpenAuth = function() {
  demo = false;
  draw({focus:true});
};
window.addEventListener('agridelta-care-changed', () => {
  if (demo && page === 'home' && !app.querySelector('dialog[open]') && !app.closest('body.rg-experience-mode')) draw();
});
