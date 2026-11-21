import {createFarmIntelligence} from './farm-intelligence.js';
const app = document.querySelector('#app');
  const TYPES = ['fields','seasons','tasks','observations','orders'];
  const KEY = 'agridelta_workspace_v2';
  const CLOUD_SESSION = 'agridelta_cloud_session';
  const ENDPOINT = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/+$/,'');
  const PUBLIC_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  const cloudAvailable = Boolean(ENDPOINT && PUBLIC_KEY);
  const IMG_DB = 'agridelta_plant_photos';
  const iconPaths = {
    grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    leaf:'<path d="M20 4C10 3 4 9 4 16a5 5 0 0 0 5 5c8 0 12-8 11-17Z"/><path d="M5 20c4-7 8-10 14-14"/>',
    field:'<path d="M3 20 9 4l6 16M9 4l12 16M3 20h18"/><path d="M6 13h12"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    clipboard:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M9 11h6M9 15h6"/>',
    camera:'<path d="M14 5h-4L8 8H4a2 2 0 0 0-2 2v8h16v-8a2 2 0 0 0-2-2h-2z"/><circle cx="12" cy="13" r="3"/>',
    box:'<path d="m3 7 9-4 9 4v11l-9 4-9-4zM3 7l9 5 9-5m-9 5v10"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2.1 2.1m9.8 9.8L19 19M19 5l-2.1 2.1m-9.8 9.8L5 19"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
    search:'<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/>',
    close:'<path d="M5 5 19 19M19 5 5 19"/>',
    edit:'<path d="m4 20 4-.8L20 7l-3-3L5 16z"/>',
    trash:'<path d="M4 7h16M9 7V4h6v3m3 0-1 14H7L6 7m4 4v6m4-6v6"/>',
    down:'<path d="m7 10 5 5 5-5"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>',
    drop:'<path d="M12 2C8 8 5 12 5 16a7 7 0 0 0 14 0c0-4-3-8-7-14Z"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2"/>',
    shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
    download:'<path d="M12 3v13m-5-5 5 5 5-5M4 19h16"/>',
    upload:'<path d="M12 21V8m-5 5 5-5 5 5M4 5h16"/>',
    user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-5 4-8 8-8s8 3 8 8"/>',
    logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14 5-5-5-5m5 5H9"/>',
    menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
    bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 9h18c0-1-3-2-3-9zm-8 13h4"/>',
    refresh:'<path d="M20 11a8 8 0 1 0-2.3 6M20 4v7h-7"/>',
    wifi:'<path d="M2 9a16 16 0 0 1 20 0M5 13a11 11 0 0 1 14 0m-11 4a6 6 0 0 1 8 0"/><circle cx="12" cy="20" r="1"/>'
  };
  const I = (name,size=20) => '<svg width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(iconPaths[name]||iconPaths.leaf)+'</svg>';
  const esc = x => String(x == null ? '' : x).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
  const attr = esc;
  const uid = () => crypto.randomUUID ? crypto.randomUUID() : String(Date.now())+Math.random().toString(36).slice(2);
  const read = (key, fallback) => { try { const v=JSON.parse(localStorage.getItem(key));return v ?? fallback; } catch {return fallback;} };
  const blank = () => Object.fromEntries(TYPES.map(t=>[t,[]]));
  const normalize = value => {
    const d=blank();
    TYPES.forEach(k=>{ if(Array.isArray(value?.[k])) d[k]=value[k].filter(x=>x&&typeof x==='object'&&typeof x.id==='string').slice(0,5000); });
    return d;
  };
  let local=normalize(read(KEY,blank()));
  let records=local;
  const intelligence=createFarmIntelligence({getFields:()=>records.fields,getSeasons:()=>records.seasons});
  let page='overview', query='', filter='all', modal=null, editing=null, notice='', noticeTimer=0, menuOpen=false, loginMode='login', cloudSession=read(CLOUD_SESSION,null);
  let syncState='local', working=false, authError='', selectedPhoto=null, hydrationToken=0;
  const NAV=[
    ['overview','Tổng quan','grid'],['fields','Cánh đồng','field'],['seasons','Mùa vụ','calendar'],['tasks','Công việc','clipboard'],
    ['observations','Quan sát','camera'],['intelligence','AI nông nghiệp','sun'],['orders','Đơn hàng','box']
  ];
  const titleOf={overview:'Tổng quan',fields:'Cánh đồng',seasons:'Mùa vụ',tasks:'Công việc',observations:'Góc quan sát',intelligence:'AI nông nghiệp',orders:'Đơn hàng',settings:'Tài khoản & dữ liệu'};
  const fmt = n => new Intl.NumberFormat('vi-VN').format(Number(n)||0);
  const money = n => fmt(n)+' ₫';
  const dateText = v => { if(!v)return 'Chưa có ngày';const d=new Date(v);return Number.isNaN(d.getTime())?'Chưa có ngày':d.toLocaleDateString('vi-VN'); };
  const dateTimeText = v => { if(!v)return 'Chưa lên lịch';const d=new Date(v);return Number.isNaN(d.getTime())?'Chưa lên lịch':d.toLocaleString('vi-VN',{dateStyle:'short',timeStyle:'short'}); };
  const todayISO = () => new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
  const fieldName = id => records.fields.find(f=>f.id===id)?.name || 'Chưa chọn khu vực';
  const sumOrders = () => records.orders.reduce((s,o)=>s+Math.max(0,Number(o.quantity)||0)*Math.max(0,Number(o.price)||0),0);
  const missing = (heading,description,kind) =>
    '<div class="ag-empty"><span class="ag-empty-mark">'+I('leaf',29)+'</span><h3>'+heading+'</h3><p>'+description+'</p><button class="ag-btn ag-btn-primary" data-new="'+kind+'">'+I('plus',17)+' Tạo mới</button></div>';
  function persist(){try{localStorage.setItem(KEY,JSON.stringify(local));}catch{toast('Bộ nhớ đầy. Hãy xuất dữ liệu hoặc xóa ảnh không cần thiết.');}}
  function toast(text){notice=text;renderToast();clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>{notice='';renderToast();},3700);}
  function renderToast(){let node=document.querySelector('#ag-toast'); if(node){node.textContent=notice;node.hidden=!notice;}}
  function header(){
    return '<header class="ag-header"><div class="ag-mobile-header"><button class="ag-icon-btn" data-menu aria-controls="ag-app-sidebar" aria-expanded="false" aria-label="Mở điều hướng">'+I('menu')+'</button><span>AGRIDELTA</span></div><div class="ag-breadcrumb">KHÔNG GIAN CANH TÁC <span>/</span> '+esc(titleOf[page]||'Tổng quan')+'</div><div class="ag-head-actions"><span class="ag-storage '+(cloudSession?'is-cloud':'')+'">'+I(cloudSession?'wifi':'shield',15)+' '+(cloudSession?'Tài khoản đồng bộ':cloudAvailable?'Chế độ thiết bị':'Lưu trên thiết bị')+'</span><button class="ag-icon-btn" data-go="settings" aria-label="Tài khoản và dữ liệu">'+I('user')+'</button></div></header>';
  }
  function sidebar(){
    return '<aside id="ag-app-sidebar" class="ag-sidebar '+(menuOpen?'is-open':'')+'"><div class="ag-brand"><img class="ag-eco-wordmark" src="/assets/agridelta-eco-logo.svg" alt="AGRIDELTA" width="2172" height="724" decoding="async"/><button class="ag-sidebar-close" data-menu aria-label="Đóng điều hướng">'+I('close',18)+'</button></div><div class="ag-nav-kicker">KHÔNG GIAN LÀM VIỆC</div><nav class="ag-nav" aria-label="Quản lý canh tác">'+NAV.map(([p,label,ico])=>'<button type="button" class="'+(page===p?'is-active':'')+'" data-go="'+p+'">'+I(ico,19)+' <span>'+label+'</span>'+(p==='tasks'&&records.tasks.filter(t=>!t.done).length?'<small>'+records.tasks.filter(t=>!t.done).length+'</small>':'')+'</button>').join('')+'</nav><div class="ag-nav-spacer"></div><button class="ag-side-settings '+(page==='settings'?'is-active':'')+'" data-go="settings">'+I('settings',18)+' Cài đặt & dữ liệu</button><div class="ag-sidebar-foot"><span class="ag-live-mark"></span><span><strong>Vườn của bạn, theo cách của bạn.</strong><small>'+ (cloudSession?'Dữ liệu thuộc tài khoản đang đăng nhập.':'Dữ liệu được giữ trên trình duyệt này.')+'</small></span></div><button class="ag-back-start" data-action="start">'+I('arrow',16)+' Về trang giới thiệu</button></aside><div class="ag-side-overlay '+(menuOpen?'is-open':'')+'" data-menu></div>';
  }
  function mobileNav(){return '<nav class="ag-mobile-nav" aria-label="Điều hướng điện thoại">'+[['overview','Tổng quan','grid'],['fields','Cánh đồng','field'],['intelligence','AI','sun'],['observations','Quan sát','camera'],['settings','Thêm','menu']].map(([p,label,ico])=>'<button data-go="'+p+'" class="'+(page===p?'is-active':'')+'">'+I(ico,20)+'<span>'+label+'</span></button>').join('')+'</nav>';}
  function pageHead(kicker,heading,description,kind,btn='Thêm mới'){
    return '<div class="ag-page-heading"><div><span class="ag-eyebrow">'+esc(kicker)+'</span><h1>'+heading+'</h1><p>'+esc(description)+'</p></div>'+(kind?'<button class="ag-btn ag-btn-primary" data-new="'+kind+'">'+I('plus',18)+' '+esc(btn)+'</button>':'')+'</div>';
  }
  function surfaceHeading(label,sub,link){
    return '<div class="ag-surface-head"><div><span class="ag-eyebrow">'+esc(sub)+'</span><h2>'+esc(label)+'</h2></div>'+(link?'<button class="ag-link" data-go="'+link+'">Xem tất cả '+I('arrow',16)+'</button>':'')+'</div>';
  }
  function dashboard(){
    const complete=records.tasks.filter(t=>t.done).length, upcoming=[...records.tasks].filter(t=>!t.done).sort((a,b)=>(a.due||'9999').localeCompare(b.due||'9999')).slice(0,5);
    const metrics=[
      {label:'Khu canh tác',value:fmt(records.fields.length),foot:'Khu vực đã ghi nhận',ico:'field'},
      {label:'Mùa vụ',value:fmt(records.seasons.filter(s=>s.status!=='finished').length),foot:'Đang lên kế hoạch',ico:'calendar'},
      {label:'Tiến độ công việc',value:fmt(complete)+'/'+fmt(records.tasks.length),foot:'Việc đã hoàn thành',ico:'check'},
      {label:'Giá trị đơn hàng',value:money(sumOrders()),foot:'Theo đơn hàng đã nhập',ico:'box'}
    ];
    return '<section class="ag-dash-intro"><div class="ag-dash-copy"><span class="ag-eyebrow">MỘT KHÔNG GIAN, TRỌN MÙA VỤ</span><h1>Chăm từng mảnh đất.<br><em>Gặt những điều tốt.</em></h1><p>Quản lý khu vườn, công việc và mùa vụ thật của bạn — tất cả được tổ chức theo một dòng chảy dễ theo dõi.</p><div class="ag-intro-actions"><button class="ag-btn ag-btn-white" data-new="fields">'+I('plus',18)+' Thêm khu canh tác</button><button class="ag-btn ag-btn-glass" data-go="tasks">Việc hôm nay '+I('arrow',18)+'</button></div></div><img class="ag-dash-photo" alt="Cánh đồng đang được canh tác" src="https://images.unsplash.com/photo-1590001372353-4999716673a5?auto=format&fit=crop&w=1100&q=83" loading="lazy"/></section>'
      +'<div class="ag-section-label"><h2>Tổng quan khu vườn</h2><span>Chỉ số dựa trên dữ liệu đã nhập</span></div><section class="ag-metric-grid">'+metrics.map((m,i)=>'<article class="ag-metric"><div class="ag-metric-top"><span>'+esc(m.label)+'</span>'+I(m.ico,20)+'</div><strong class="'+(i===3?'is-money':'')+'">'+esc(m.value)+'</strong><small>'+esc(m.foot)+'</small></article>').join('')+'</section>'
      +'<section class="ag-dashboard-grid"><div class="ag-surface">'+surfaceHeading('Nhịp việc gần đây','CÔNG VIỆC', 'tasks')+(upcoming.length?'<div class="ag-compact-list">'+upcoming.map(t=>'<div class="ag-compact-task"><button class="ag-check" aria-label="Hoàn thành công việc" data-toggle="'+attr(t.id)+'">'+I('check',15)+'</button><div><strong>'+esc(t.title)+'</strong><small>'+esc(fieldName(t.fieldId))+'</small></div><time>'+esc(dateText(t.due))+'</time></div>').join('')+'</div>':missing('Chưa có công việc','Tạo công việc đầu tiên để bắt đầu theo dõi tiến độ.','tasks'))+'</div>'
      +'<div class="ag-surface">'+surfaceHeading('Mảnh đất đang theo dõi','CÁNH ĐỒNG','fields')+(records.fields.length?'<div class="ag-feature-fields">'+records.fields.slice(0,3).map((f,i)=>'<div class="ag-feature-field"><span class="ag-field-number">0'+(i+1)+'</span><span><strong>'+esc(f.name)+'</strong><small>'+esc(f.crop||'Chưa chọn loại cây')+' · '+fmt(f.area||0)+' ha</small></span><button class="ag-icon-btn" data-edit="fields" data-id="'+attr(f.id)+'" aria-label="Sửa khu vực">'+I('arrow',17)+'</button></div>').join('')+'</div>':missing('Cánh đồng bắt đầu ở đây','Thêm khu canh tác để tập hợp mọi ghi chép.','fields'))+'</div></section>';
  }
  function searchBar(placeholder){
    return '<div class="ag-toolbar"><label class="ag-search">'+I('search',18)+'<input id="ag-search" type="search" value="'+attr(query)+'" placeholder="'+esc(placeholder)+'" aria-label="'+esc(placeholder)+'"></label><span class="ag-toolbar-count">'+fmt(records[page]?.length||0)+' bản ghi</span></div>';
  }
  function filterRows(rows,fn){const term=query.toLocaleLowerCase('vi').trim();return !term?rows:rows.filter(r=>fn(r).toLocaleLowerCase('vi').includes(term));}
  function actions(kind,id){return '<div class="ag-card-actions"><button data-edit="'+kind+'" data-id="'+attr(id)+'" aria-label="Chỉnh sửa">'+I('edit',17)+'</button><button data-remove="'+kind+'" data-id="'+attr(id)+'" aria-label="Xóa">'+I('trash',17)+'</button></div>';}
  function fieldsPage(){
    const rows=filterRows(records.fields,f=>f.name+' '+f.crop+' '+f.note);
    return pageHead('01 / QUẢN LÝ ĐẤT','Cánh đồng <em>của bạn.</em>','Mỗi khu đất có thông tin riêng: diện tích, cây trồng, độ ẩm và ghi chú.','fields','Thêm cánh đồng')+searchBar('Tìm tên cánh đồng hoặc cây trồng')
      +(rows.length?'<div class="ag-field-grid">'+rows.map((f,i)=>'<article class="ag-field-card"><div class="ag-field-cover ag-field-cover-'+i%4+'" data-image-id="'+attr(f.id)+'"><div class="ag-field-cover-top"><span>KHU VỰC / '+String(i+1).padStart(2,'0')+'</span><span class="ag-pill">'+esc(f.status==='active'?'Đang canh tác':f.status==='planned'?'Chuẩn bị':f.status==='resting'?'Đất nghỉ':f.status||'Đang theo dõi')+'</span></div><span class="ag-field-cover-icon">'+I('leaf',44)+'</span></div><div class="ag-field-body"><div class="ag-card-row"><div><h3>'+esc(f.name)+'</h3><p>'+esc(f.crop||'Chưa khai báo cây')+'</p></div>'+actions('fields',f.id)+'</div><div class="ag-field-data"><span>'+I('field',16)+' '+fmt(f.area||0)+' ha</span><span>'+I('drop',16)+' '+(f.moisture===''||f.moisture==null?'Chưa đo':fmt(f.moisture)+'%')+'</span></div>'+(f.note?'<p class="ag-field-note">'+esc(f.note)+'</p>':'')+'</div></article>').join('')+'</div>':missing('Chưa có khu canh tác','Lưu mảnh đất đầu tiên, sau đó liên kết mùa vụ và công việc với nó.','fields'));
  }
  function seasonsPage(){
    const rows=filterRows(records.seasons,s=>s.name+' '+s.crop+' '+fieldName(s.fieldId));
    return pageHead('02 / NHỊP MÙA VỤ','Lịch mùa vụ <em>rõ ràng.</em>','Theo dõi gieo trồng, ngày dự kiến thu hoạch và tiến độ từng vụ.','seasons','Lên mùa vụ')+searchBar('Tìm mùa vụ hoặc cây trồng')
      +(rows.length?'<div class="ag-surface ag-rows">'+rows.map(s=>{
        const start=Date.parse(s.start||''),end=Date.parse(s.end||''); const p=Number.isFinite(start)&&Number.isFinite(end)&&end>start?Math.max(0,Math.min(100,Math.round((Date.now()-start)/(end-start)*100))):0;
        return '<article class="ag-timeline-row"><span class="ag-timeline-icon">'+I('calendar',23)+'</span><div class="ag-row-main"><div class="ag-card-row"><div><span class="ag-eyebrow">'+esc(fieldName(s.fieldId))+'</span><h3>'+esc(s.name)+'</h3></div>'+actions('seasons',s.id)+'</div><p>'+esc(s.crop||'Chưa ghi cây trồng')+' · '+dateText(s.start)+' — '+dateText(s.end)+'</p><div class="ag-season-progress"><span style="width:'+p+'%"></span></div><div class="ag-row-sub"><small>'+p+'% thời gian đã qua</small><span class="ag-status">'+esc(s.status==='finished'?'Đã thu hoạch':s.status==='active'?'Đang canh tác':'Kế hoạch')+'</span></div></div></article>';
      }).join('')+'</div>':missing('Một vụ mùa đang chờ','Tạo lịch gieo trồng để thấy từng cột mốc phát triển.','seasons'));
  }
  function tasksPage(){
    const tasks=filterRows(records.tasks,t=>t.title+' '+fieldName(t.fieldId));
    const open=tasks.filter(t=>!t.done).sort((a,b)=>(a.due||'9999').localeCompare(b.due||'9999')),done=tasks.filter(t=>t.done);
    const taskRows=(items)=>items.map(t=>'<article class="ag-task-row '+(t.done?'is-done':'')+'"><button class="ag-check '+(t.done?'is-checked':'')+'" data-toggle="'+attr(t.id)+'" aria-label="'+(t.done?'Đánh dấu chưa hoàn thành':'Đánh dấu hoàn thành')+'">'+I('check',18)+'</button><div class="ag-task-description"><strong>'+esc(t.title)+'</strong><small>'+esc(fieldName(t.fieldId))+' · '+esc(dateTimeText(t.due))+'</small></div><span class="ag-priority ag-priority-'+esc(t.priority||'normal')+'">'+esc(t.priority==='high'?'Ưu tiên':t.priority==='low'?'Thấp':'Bình thường')+'</span>'+actions('tasks',t.id)+'</article>').join('');
    return pageHead('03 / CÔNG VIỆC','Làm việc <em>có nhịp.</em>','Tạo, ưu tiên và hoàn thành công việc chăm sóc cây theo lịch của bạn.','tasks','Thêm công việc')+searchBar('Tìm công việc hoặc khu vực')
      +'<div class="ag-task-columns"><section class="ag-surface">'+surfaceHeading('Cần thực hiện',fmt(open.length)+' CÔNG VIỆC')+(open.length?taskRows(open):missing('Danh sách đã rõ ràng','Chưa có công việc cần thực hiện.','tasks'))+'</section><section class="ag-surface">'+surfaceHeading('Đã hoàn thành',fmt(done.length)+' HOÀN TẤT')+(done.length?taskRows(done):'<div class="ag-simple-empty">Việc đã hoàn thành sẽ xuất hiện ở đây.</div>')+'</section></div>';
  }
  function observationsPage(){
    const rows=filterRows(records.observations,o=>o.note+' '+fieldName(o.fieldId));
    return pageHead('04 / GHI NHẬN THỰC TẾ','Quan sát <em>từng thay đổi.</em>','Chụp ảnh, ghi chú tình trạng cây và xem lại theo thời gian.','observations','Ghi quan sát')+searchBar('Tìm theo ghi chú hoặc khu vực')
      +(rows.length?'<div class="ag-observe-grid">'+rows.map(o=>'<article class="ag-observe-card"><div class="ag-observe-image" data-image-id="'+attr(o.id)+'">'+I('camera',30)+'</div><div class="ag-observe-body"><span class="ag-eyebrow">'+esc(dateText(o.date))+'</span><h3>'+esc(fieldName(o.fieldId))+'</h3><p>'+esc(o.note||'Không có ghi chú')+'</p>'+actions('observations',o.id)+'</div></article>').join('')+'</div>':missing('Hãy lưu quan sát đầu tiên','Mỗi bức ảnh và ghi chú đều là một phần nhật ký cây trồng.','observations'))
      +'<p class="ag-privacy-note">'+I('shield',18)+' Ảnh được lưu riêng trong bộ nhớ thiết bị, chưa tự tải lên máy chủ.</p>';
  }
  function ordersPage(){
    const rows=filterRows(records.orders,o=>o.customer+' '+o.product);
    return pageHead('05 / THÀNH QUẢ','Đơn hàng <em>mùa vụ.</em>','Ghi lại khách hàng, số lượng, giá trị và trạng thái đơn hàng.','orders','Thêm đơn hàng')
      +'<div class="ag-order-summary"><span>Giá trị đơn hàng đã ghi</span><strong>'+money(sumOrders())+'</strong><small>Tổng theo số lượng và đơn giá người dùng nhập</small></div>'+searchBar('Tìm khách hàng hoặc sản phẩm')
      +(rows.length?'<div class="ag-surface ag-orders-table"><div class="ag-table-scroll"><table><thead><tr><th>Sản phẩm / Khách hàng</th><th>Số lượng</th><th>Giá trị</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>'+rows.map(o=>'<tr><td><strong>'+esc(o.product)+'</strong><small>'+esc(o.customer)+'</small></td><td>'+fmt(o.quantity)+' '+esc(o.unit||'kg')+'</td><td><b>'+money((Number(o.quantity)||0)*(Number(o.price)||0))+'</b></td><td><span class="ag-status">'+esc(o.status==='delivered'?'Đã giao':o.status==='processing'?'Đang xử lý':'Đơn mới')+'</span></td><td>'+actions('orders',o.id)+'</td></tr>').join('')+'</tbody></table></div></div>':missing('Đơn hàng đầu tiên','Ghi một đơn hàng để theo dõi doanh thu dự kiến và trạng thái.','orders'));
  }
  function selectField(value=''){
    return '<select name="fieldId"><option value="">Chưa gắn khu vực</option>'+records.fields.map(f=>'<option value="'+attr(f.id)+'" '+(value===f.id?'selected':'')+'>'+esc(f.name)+'</option>').join('')+'</select>';
  }
  const input=(name,label,type,value='',required=false,extra='')=>'<label class="ag-form-field"><span>'+label+'</span><input name="'+name+'" type="'+type+'" value="'+attr(value)+'" '+(required?'required':'')+' '+extra+' /></label>';
  const select=(name,label,options,value)=>'<label class="ag-form-field"><span>'+label+'</span><select name="'+name+'">'+options.map(([v,l])=>'<option value="'+attr(v)+'" '+(v===value?'selected':'')+'>'+esc(l)+'</option>').join('')+'</select></label>';
  function formFields(type,d={}){
    const fieldSel='<label class="ag-form-field"><span>Khu vực canh tác</span>'+selectField(d.fieldId||'')+'</label>';
    const notes=(name='note',label='Ghi chú')=>'<label class="ag-form-field ag-span"><span>'+label+'</span><textarea name="'+name+'" rows="3" maxlength="1200">'+esc(d[name]||'')+'</textarea></label>';
    if(type==='fields')return input('name','Tên cánh đồng','text',d.name||'',true,'maxlength="100"')+input('crop','Cây trồng','text',d.crop||'',false,'maxlength="100"')+input('area','Diện tích (ha)','number',d.area??'',true,'min="0.001" max="100000" step="any"')+input('moisture','Độ ẩm nhập thủ công (%)','number',d.moisture??'',false,'min="0" max="100" step="1"')+select('status','Trạng thái',[['active','Đang canh tác'],['planned','Chuẩn bị'],['resting','Đất nghỉ']],d.status||'active')+notes()+'<label class="ag-form-field ag-span"><span>Ảnh thực tế của cánh đồng (tuỳ chọn, tối đa 8MB)</span><input type="file" name="photo" accept="image/*" /></label>';
    if(type==='seasons')return input('name','Tên mùa vụ','text',d.name||'',true,'maxlength="100"')+fieldSel+input('crop','Cây trồng','text',d.crop||'',false,'maxlength="100"')+input('start','Ngày gieo trồng','date',d.start||todayISO(),true)+input('end','Ngày dự kiến thu hoạch','date',d.end||'',true)+select('status','Trạng thái',[['planned','Kế hoạch'],['active','Đang canh tác'],['finished','Đã thu hoạch']],d.status||'planned')+notes();
    if(type==='tasks')return input('title','Tên công việc','text',d.title||'',true,'maxlength="150"')+fieldSel+input('due','Thời gian thực hiện','datetime-local',d.due||'',true)+select('priority','Mức ưu tiên',[['normal','Bình thường'],['high','Ưu tiên cao'],['low','Ưu tiên thấp']],d.priority||'normal')+notes();
    if(type==='orders')return input('customer','Tên khách hàng','text',d.customer||'',true,'maxlength="100"')+input('product','Sản phẩm','text',d.product||'',true,'maxlength="100"')+input('quantity','Số lượng','number',d.quantity||'',true,'min=".001" step="any"')+select('unit','Đơn vị',[['kg','kg'],['tấn','tấn'],['thùng','thùng'],['cái','cái']],d.unit||'kg')+input('price','Đơn giá (₫)','number',d.price??'',true,'min="0" step="1"')+select('status','Trạng thái',[['new','Đơn mới'],['processing','Đang xử lý'],['delivered','Đã giao']],d.status||'new')+notes();
    if(type==='observations')return fieldSel+input('date','Ngày quan sát','date',d.date||todayISO(),true)+notes('note','Tình trạng cây trồng')+'<label class="ag-form-field ag-span"><span>Ảnh thực tế (tuỳ chọn, tối đa 8MB)</span><input type="file" name="photo" accept="image/*" /></label>';
    return '';
  }
  function modalView(){
    if(!modal)return '';
    const labels={fields:'cánh đồng',seasons:'mùa vụ',tasks:'công việc',observations:'quan sát',orders:'đơn hàng'};
    const existing=editing&&records[modal].find(x=>x.id===editing);
    return '<div class="ag-dialog-backdrop" data-dismiss><section class="ag-dialog" role="dialog" aria-modal="true" aria-labelledby="ag-dialog-title"><div class="ag-dialog-header"><div><span class="ag-eyebrow">AGRIDELTA / BẢN GHI</span><h2 id="ag-dialog-title">'+(existing?'Chỉnh sửa ':'Tạo ')+labels[modal]+'</h2></div><button class="ag-icon-btn" data-dismiss aria-label="Đóng">'+I('close')+'</button></div><form id="ag-record-form" class="ag-record-form" data-type="'+modal+'"><div class="ag-form-grid">'+formFields(modal,existing||{})+'</div><div class="ag-dialog-footer"><button type="button" class="ag-btn ag-btn-secondary" data-dismiss>Huỷ</button><button type="submit" class="ag-btn ag-btn-primary">'+I('check',17)+' Lưu thông tin</button></div></form></section></div>';
  }
  function settingsPage(){
    return pageHead('06 / TÀI KHOẢN & DỮ LIỆU','Dữ liệu <em>của bạn.</em>','Làm chủ dữ liệu: sao lưu, nhập lại và quản lý đồng bộ.')
      +'<div class="ag-settings-grid"><section class="ag-surface ag-settings-card">'+surfaceHeading('Dữ liệu trên thiết bị','SAO LƯU AN TOÀN')+'<p>Xuất bản sao JSON của cánh đồng, mùa vụ, công việc, ghi chú và đơn hàng. Ảnh quan sát được lưu riêng trong thiết bị và chưa nằm trong bản sao JSON.</p><div class="ag-settings-actions"><button class="ag-btn ag-btn-primary" data-action="export">'+I('download',17)+' Xuất bản sao</button><label class="ag-btn ag-btn-secondary">'+I('upload',17)+' Nhập bản sao<input type="file" id="ag-import" accept=".json,application/json" hidden></label><button class="ag-btn ag-btn-secondary" data-action="migrate">Nhập dữ liệu bản cũ</button></div><p class="ag-settings-help">Khi đổi trình duyệt hoặc xoá dữ liệu trang, các bản ghi chỉ lưu trên thiết bị có thể bị mất.</p></section>'
      +'<section class="ag-surface ag-settings-card">'+surfaceHeading('Tài khoản và đồng bộ','BẢO MẬT')+(cloudAvailable?cloudSession
        ?'<div class="ag-sync-status">'+I('shield',25)+'<div><strong>'+esc(cloudSession.user?.email||'Đã đăng nhập')+'</strong><small>Đã kết nối tài khoản riêng</small></div></div><div class="ag-settings-actions"><button class="ag-btn ag-btn-primary" data-action="sync">'+I('refresh',17)+' Đồng bộ ngay</button><button class="ag-btn ag-btn-secondary" data-action="signout">Đăng xuất</button></div><p class="ag-settings-help">Tải dữ liệu về trước khi đăng xuất nếu bạn cần sử dụng ngoại tuyến.</p>'
        :'<p>Tài khoản sử dụng email và mật khẩu. Mỗi người chỉ thấy bản ghi của mình nhờ chính sách phân quyền trên máy chủ.</p><form class="ag-login-form" id="ag-login-form"><label class="ag-form-field"><span>Email</span><input name="email" type="email" autocomplete="email" required></label><label class="ag-form-field"><span>Mật khẩu</span><input name="password" type="password" autocomplete="'+(loginMode==='register'?'new-password':'current-password')+'" required minlength="8"></label><button class="ag-btn ag-btn-primary" type="submit">'+(loginMode==='register'?'Đăng ký':'Đăng nhập')+'</button><button class="ag-link" type="button" data-action="switch-auth">'+(loginMode==='register'?'Đã có tài khoản? Đăng nhập':'Chưa có tài khoản? Đăng ký')+'</button></form>'+(authError?'<p class="ag-error">'+esc(authError)+'</p>':'')
        :'<div class="ag-sync-status ag-sync-unavailable">'+I('shield',25)+'<div><strong>Chưa kết nối máy chủ</strong><small>Hiện tại dữ liệu được lưu trên thiết bị. Không có tài khoản giả.</small></div></div><p>Giao diện đăng nhập và cơ chế phân quyền đã chuẩn bị sẵn; cần cấu hình một Supabase riêng cho AGRIDELTA để kích hoạt đồng bộ liên thiết bị.</p>')+'</section></div>';
  }
  function content(){return ({overview:dashboard,fields:fieldsPage,seasons:seasonsPage,tasks:tasksPage,observations:observationsPage,intelligence:()=>'<div id="ag-ai-root"></div>',orders:ordersPage,settings:settingsPage})[page]?.() || dashboard();}
  function render(){
    if(!app)return;
    const focusSearch=document.activeElement?.id==='ag-search';const caret=focusSearch?document.activeElement.selectionStart:null;
    app.innerHTML='<div class="ag-app">'+sidebar()+'<div class="ag-shell">'+header()+'<main id="ag-main" class="ag-main" tabindex="-1">'+content()+'</main><footer class="ag-footer"><span>© 2026 AGRIDELTA</span><span>Gieo điều tốt đẹp, quản lý bằng dữ liệu thật.</span></footer></div>'+mobileNav()+'</div>'+modalView()+'<div id="ag-toast" class="ag-toast" role="status" '+(notice?'':'hidden')+'>'+esc(notice)+'</div>';
    if(focusSearch){const x=app.querySelector('#ag-search');x?.focus();try{x?.setSelectionRange(caret,caret);}catch{}}
    showImages();
    if(page==='intelligence')intelligence.mount(app.querySelector('#ag-ai-root'));
    else intelligence.detach();
  }
  async function showImages(){
    const nodes=[...app.querySelectorAll('[data-image-id]')], token=++hydrationToken;
    for(const node of nodes){
      const blob=await imageGet(node.dataset.imageId);
      if(token!==hydrationToken)return;
      if(!blob)continue;
      const url=URL.createObjectURL(blob);
      const img=document.createElement('img');
      img.alt='Ảnh quan sát cây trồng';img.src=url;img.loading='lazy';img.onload=()=>URL.revokeObjectURL(url);
      if(node.classList.contains('ag-field-cover'))node.prepend(img);else node.replaceChildren(img);
    }
  }
  function imageDB(){
    return new Promise(resolve=>{
      if(!('indexedDB' in window)){resolve(null);return;}
      const req=indexedDB.open(IMG_DB,1);
      req.onupgradeneeded=()=>req.result.createObjectStore('images');
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>resolve(null);
    });
  }
  async function imagePut(id,blob){
    const db=await imageDB();if(!db)return false;
    return new Promise(resolve=>{const tx=db.transaction('images','readwrite');tx.objectStore('images').put(blob,id);tx.oncomplete=()=>{db.close();resolve(true);};tx.onerror=()=>{db.close();resolve(false);};});
  }
  async function imageGet(id){
    const db=await imageDB();if(!db)return null;
    return new Promise(resolve=>{const tx=db.transaction('images','readonly');const rq=tx.objectStore('images').get(id);rq.onsuccess=()=>resolve(rq.result||null);rq.onerror=()=>resolve(null);tx.oncomplete=()=>db.close();});
  }
  async function imageDelete(id){
    const db=await imageDB();if(!db)return;
    return new Promise(resolve=>{const tx=db.transaction('images','readwrite');tx.objectStore('images').delete(id);tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>{db.close();resolve();};});
  }
  let modalCloseTimer=null;
  function openModal(kind,id=null){
    clearTimeout(modalCloseTimer);
    modal=kind;editing=id;
    document.body.classList.add('ag-modal-open');
    render();
    app.querySelector('#ag-record-form input:not([type="hidden"])')?.focus({preventScroll:true});
  }
  function closeModal(){
    if(!modal)return;
    clearTimeout(modalCloseTimer);
    const previousKind=modal;
    const finish=()=>{
      modal=null;editing=null;
      document.body.classList.remove('ag-modal-open');
      render();
      app.querySelector('[data-new="'+previousKind+'"]')?.focus({preventScroll:true});
    };
    const backdrop=app.querySelector('.ag-dialog-backdrop');
    if(!backdrop||matchMedia('(prefers-reduced-motion: reduce)').matches){finish();return;}
    backdrop.classList.add('is-leaving');
    modalCloseTimer=setTimeout(finish,155);
  }
  function navigate(target){
    const previousPage=page;
    page=target==='home'?'overview':target==='season'?'seasons':target==='scan'?'observations':target;
    if(!titleOf[page])page='overview';
    query='';filter='all';menuOpen=false;modal=null;
    document.body.classList.remove('ag-modal-open');
    render();
    if(previousPage!==page)app.querySelector('.ag-main')?.classList.add('ag-page-enter');
    window.scrollTo({top:0,behavior:'instant'});
  }
  async function saveRecord(form){
    const kind=form.dataset.type, data=Object.fromEntries(new FormData(form).entries());
    const previous=editing?records[kind].find(r=>r.id===editing):null;
    const id=previous?.id||uid();
    const photo=data.photo;delete data.photo;
    Object.keys(data).forEach(k=>{if(typeof data[k]==='string')data[k]=data[k].trim();});
    if(kind==='fields') {data.area=Number(data.area);data.moisture=data.moisture===''?'':Number(data.moisture);if(!(data.area>0)||data.area>100000||data.moisture!==''&&(data.moisture<0||data.moisture>100)){toast('Diện tích hoặc độ ẩm không hợp lệ.');return;}}
    if(kind==='seasons'&&data.end<data.start){toast('Ngày thu hoạch phải sau hoặc trùng ngày gieo.');return;}
    if(kind==='orders'){data.quantity=Number(data.quantity);data.price=Number(data.price);if(!(data.quantity>0)||data.price<0){toast('Kiểm tra số lượng và đơn giá.');return;}}
    if(kind==='tasks')data.done=Boolean(previous?.done);
    const row={...previous,...data,id,createdAt:previous?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};
    if((kind==='observations'||kind==='fields')&&photo instanceof File&&photo.size){if(photo.size>8*1024*1024){toast('Ảnh không được vượt quá 8MB.');return;}if(!(await imagePut(id,photo))){toast('Không thể lưu ảnh trên thiết bị này.');return;}}
    const rows=[...records[kind]],at=rows.findIndex(x=>x.id===id);if(at<0)rows.unshift(row);else rows[at]=row;records[kind]=rows;
    if(!cloudSession){local=records;persist();}
    modal=null;editing=null;document.body.classList.remove('ag-modal-open');render();toast('Đã lưu '+(kind==='observations'?'quan sát':'thông tin')+'.');
    if(cloudSession)remoteSave(kind,row).catch(()=>{syncState='error';toast('Mất kết nối. Thay đổi chưa đồng bộ lên máy chủ.');});
  }
  async function removeRecord(kind,id){
    const row=records[kind]?.find(r=>r.id===id);if(!row)return;
    if(!confirm('Xóa bản ghi "'+(row.name||row.title||row.product||row.note?.slice(0,32)||'này')+'"?'))return;
    if(kind==='fields'&&(records.seasons.some(x=>x.fieldId===id)||records.tasks.some(x=>x.fieldId===id))&&!confirm('Khu vực đang được dùng trong mùa vụ hoặc công việc. Vẫn xóa khu vực?'))return;
    records[kind]=records[kind].filter(x=>x.id!==id);if(kind==='observations'||kind==='fields')await imageDelete(id);
    if(!cloudSession){local=records;persist();}
    render();toast('Đã xóa bản ghi.');
    if(cloudSession)remoteRemove(kind,id).catch(()=>toast('Không thể đồng bộ thao tác xóa. Hãy kiểm tra kết nối.'));
  }
  function toggleTask(id){
    const t=records.tasks.find(x=>x.id===id);if(!t)return;
    t.done=!t.done;t.updatedAt=new Date().toISOString();
    if(!cloudSession){local=records;persist();}
    render();if(cloudSession)remoteSave('tasks',t).catch(()=>toast('Không thể cập nhật lên máy chủ.'));
  }
  function exportJSON(){
    const blob=new Blob([JSON.stringify({app:'AGRIDELTA',version:2,exportedAt:new Date().toISOString(),records},null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='agridelta-backup-'+todayISO()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  async function importJSON(file){
    try{
      if(!file||file.size>4*1024*1024)throw Error('Tệp JSON không hợp lệ hoặc quá lớn.');
      const parsed=JSON.parse(await file.text());if(parsed.app!=='AGRIDELTA'||parsed.version!==2)throw Error('Chỉ hỗ trợ bản sao AGRIDELTA phiên bản 2.');
      const incoming=normalize(parsed.records);
      if(!confirm('Nhập dữ liệu từ bản sao? Các bản ghi trùng mã sẽ được cập nhật.'))return;
      TYPES.forEach(k=>{const byId=new Map(records[k].map(r=>[r.id,r]));incoming[k].forEach(r=>byId.set(r.id,r));records[k]=[...byId.values()];});
      if(!cloudSession){local=records;persist();}else await syncAll();
      render();toast('Đã nhập dữ liệu thành công.');
    }catch(e){toast(e.message||'Không thể đọc bản sao.');}
  }
  function legacyImport(){
    if(!confirm('Nhập dữ liệu đã lưu từ bản dùng thử trước đây? Hệ thống sẽ giữ các bản ghi đang có.'))return;
    const mapping={fields:'fields',season:'seasons',tasks:'tasks',orders:'orders'};
    let count=0;
    Object.entries(mapping).forEach(([old,k])=>{
      const data=read('agri_'+old,[]);
      if(!Array.isArray(data))return;
      const table=new Map(records[k].map(x=>[x.id,x]));
      data.forEach(row=>{
        if(!row||typeof row!=='object')return;
        const fresh={...row,id:'legacy-'+old+'-'+String(row.id),updatedAt:new Date().toISOString(),createdAt:new Date().toISOString()};
        if(old==='fields'){fresh.crop=row.type||'';fresh.area=parseFloat(String(row.area||'0').replace(',','.'))||0;fresh.status=row.status||'active';}
        if(old==='season'){fresh.start=row.date||'';fresh.end=row.date||'';fresh.status='planned';}
        if(old==='orders'){fresh.product=row.name||'';fresh.price=0;fresh.quantity=parseFloat(row.quantity)||0;}
        if(old==='tasks'){fresh.fieldId='';fresh.due=row.time?todayISO()+'T'+row.time:'';fresh.priority='normal';}
        table.set(fresh.id,fresh);count++;
      });
      records[k]=[...table.values()];
    });
    if(!cloudSession){local=records;persist();}else syncAll();
    render();toast('Đã nhập '+count+' bản ghi cũ. Hãy kiểm tra lại dữ liệu mẫu nếu có.');
  }
  function cloudHeaders(token){
    return {'apikey':PUBLIC_KEY,'Authorization':'Bearer '+token,'Content-Type':'application/json'};
  }
  async function cloudRequest(path,options={},session=cloudSession){
    if(!ENDPOINT||!PUBLIC_KEY)throw Error('Máy chủ chưa được cấu hình.');
    if(!session?.access_token)throw Error('Vui lòng đăng nhập.');
    let result=await fetch(ENDPOINT+path,{...options,headers:{...cloudHeaders(session.access_token),...(options.headers||{})}});
    if(result.status===401&&session.refresh_token){await refreshSession();result=await fetch(ENDPOINT+path,{...options,headers:{...cloudHeaders(cloudSession.access_token),...(options.headers||{})}});}
    if(!result.ok){const x=await result.text();throw Error(x.slice(0,250)||'Lỗi đồng bộ '+result.status);}
    return result.status===204?null:result.text().then(x=>x?JSON.parse(x):null);
  }
  async function refreshSession(){
    const response=await fetch(ENDPOINT+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{'apikey':PUBLIC_KEY,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:cloudSession.refresh_token})});
    if(!response.ok)throw Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
    cloudSession=await response.json();localStorage.setItem(CLOUD_SESSION,JSON.stringify(cloudSession));
    return cloudSession;
  }
  async function remoteSave(kind,row){
    await cloudRequest('/rest/v1/agridelta_records?on_conflict=user_id,kind,record_id',{
      method:'POST',
      headers:{'Prefer':'resolution=merge-duplicates,return=minimal'},
      body:JSON.stringify([{user_id:cloudSession.user.id,kind,record_id:row.id,payload:row}])
    });
    syncState='ok';
  }
  async function remoteRemove(kind,id){
    await cloudRequest('/rest/v1/agridelta_records?kind=eq.'+encodeURIComponent(kind)+'&record_id=eq.'+encodeURIComponent(id),{method:'DELETE'});
  }
  async function loadCloudRecords(){
    const data=await cloudRequest('/rest/v1/agridelta_records?select=kind,record_id,payload&limit=10000');
    const out=blank();
    (data||[]).forEach(x=>{if(TYPES.includes(x.kind)&&x.payload&&typeof x.payload==='object')out[x.kind].push({...x.payload,id:x.record_id});});
    records=normalize(out);syncState='ok';render();
  }
  async function syncAll(){
    if(!cloudSession)return;
    const entries=TYPES.flatMap(kind=>records[kind].map(row=>({user_id:cloudSession.user.id,kind,record_id:row.id,payload:row})));
    for(let i=0;i<entries.length;i+=100){
      await cloudRequest('/rest/v1/agridelta_records?on_conflict=user_id,kind,record_id',{method:'POST',headers:{'Prefer':'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(entries.slice(i,i+100))});
    }
    syncState='ok';toast('Đã gửi '+entries.length+' bản ghi lên tài khoản.');
  }
  async function authenticate(form){
    const email=form.email.value.trim(),password=form.password.value;
    authError='';working=true;
    try{
      const isNew=loginMode==='register';
      const result=await fetch(ENDPOINT+(isNew?'/auth/v1/signup':'/auth/v1/token?grant_type=password'),{
        method:'POST',headers:{'apikey':PUBLIC_KEY,'Content-Type':'application/json'},body:JSON.stringify({email,password})
      });
      const j=await result.json();
      if(!result.ok)throw Error(j.msg||j.error_description||j.message||'Không thể đăng nhập');
      if(!j.access_token){toast('Kiểm tra email để xác nhận đăng ký trước khi đăng nhập.');loginMode='login';render();return;}
      cloudSession=j;localStorage.setItem(CLOUD_SESSION,JSON.stringify(j));
      await loadCloudRecords();
      toast('Đăng nhập thành công. Chỉ các bản ghi thuộc tài khoản này được hiển thị.');
    }catch(e){authError=e.message||'Không thể kết nối tài khoản';render();}
    finally{working=false;}
  }
  async function signOut(){
    if(!confirm('Đăng xuất tài khoản? Dữ liệu trên máy chủ vẫn được giữ.'))return;
    try{await cloudRequest('/auth/v1/logout',{method:'POST'});}catch{}
    cloudSession=null;localStorage.removeItem(CLOUD_SESSION);records=local;render();toast('Đã đăng xuất.');
  }
  app.addEventListener('error',event=>{
    if(event.target instanceof HTMLImageElement && event.target.classList.contains('ag-dash-photo')){
      event.target.onerror=null;
      event.target.src='/assets/field-dashboard.webp';
    }
  },true);
  app.addEventListener('click',async event=>{
    const target=event.target.closest('[data-go],[data-new],[data-edit],[data-remove],[data-toggle],[data-action],[data-menu],[data-dismiss]');
    if(!target)return;
    if(target.hasAttribute('data-menu')){
      menuOpen=!menuOpen;
      app.querySelector('.ag-sidebar')?.classList.toggle('is-open',menuOpen);
      app.querySelector('.ag-side-overlay')?.classList.toggle('is-open',menuOpen);
      app.querySelector('.ag-mobile-header [data-menu]')?.setAttribute('aria-expanded',String(menuOpen));
      return;
    }
    if(target.hasAttribute('data-dismiss')){if(target.classList.contains('ag-dialog-backdrop')&&target!==event.target)return;closeModal();return;}
    if(target.dataset.go){navigate(target.dataset.go);return;}
    if(target.dataset.new){openModal(target.dataset.new);return;}
    if(target.dataset.edit){openModal(target.dataset.edit,target.dataset.id);return;}
    if(target.dataset.remove){await removeRecord(target.dataset.remove,target.dataset.id);return;}
    if(target.dataset.toggle){toggleTask(target.dataset.toggle);return;}
    const action=target.dataset.action;
    if(action==='start')window.AGRIDELTARootGuide?.open();
    if(action==='export')exportJSON();
    if(action==='migrate')legacyImport();
    if(action==='sync'){try{await syncAll();}catch(e){toast('Lỗi đồng bộ: '+e.message);}}
    if(action==='signout')await signOut();
    if(action==='switch-auth'){loginMode=loginMode==='register'?'login':'register';authError='';render();}
  });
  app.addEventListener('submit',async e=>{
    if(e.target.id==='ag-record-form'){e.preventDefault();if(!working){working=true;try{await saveRecord(e.target);}finally{working=false;}}}
    if(e.target.id==='ag-login-form'){e.preventDefault();if(!working)await authenticate(e.target);}
  });
  let searchTimer=null;
  app.addEventListener('input',e=>{
    if(e.target.id==='ag-search'){
      query=e.target.value;
      clearTimeout(searchTimer);
      searchTimer=setTimeout(()=>{if(!modal)render();},125);
    }
  });
  app.addEventListener('change',async e=>{
    if(e.target.id==='ag-import'&&e.target.files?.[0])await importJSON(e.target.files[0]);
  });
  window.addEventListener('keydown',e=>{
    if(e.key!=='Escape')return;
    if(modal){closeModal();return;}
    if(menuOpen){
      menuOpen=false;
      app.querySelector('.ag-sidebar')?.classList.remove('is-open');
      app.querySelector('.ag-side-overlay')?.classList.remove('is-open');
      const trigger=app.querySelector('.ag-mobile-header [data-menu]');
      trigger?.setAttribute('aria-expanded','false');
      trigger?.focus({preventScroll:true});
    }
  });
  window.AGRIDELTAOpenDemo = (target='home')=>navigate(target);
  window.AGRIDELTAOpenAuth = ()=>navigate('settings');
  window.AGRIDELTAWorkspace = {open:navigate, version:'2.0', cloudAvailable};
  render();
  if(cloudAvailable&&cloudSession){
    cloudRequest('/auth/v1/user').then(()=>loadCloudRecords()).catch(async()=>{
      try{await refreshSession();await loadCloudRecords();}
      catch{cloudSession=null;localStorage.removeItem(CLOUD_SESSION);records=local;render();}
    });
  }
