/* AGRIDELTA Intelligence — independent feature module.
 * Atmospheric downwelling longwave is a physical estimate, not direct ECMWF strd or measured IR.
 * Values use forecast meteorology from Open-Meteo and Brutsaert clear-sky emissivity
 * with a simple cloud-fraction adjustment. Not field-level measured data.
 */
const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const num = (x, d=0) => Number.isFinite(Number(x)) ? Number(x).toFixed(d) : "—";
const clamp = (n,a,b) => Math.min(b,Math.max(a,n));
const dateLabel = (s) => new Date(s.endsWith("Z")?s:s+"Z").toLocaleString("vi-VN",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});
export function estimateLongwave(tempC, relativeHumidity, cloudCover) {
  if (![tempC,relativeHumidity,cloudCover].every(x => x !== null && x !== undefined && Number.isFinite(Number(x)))) return null;
  const t = Number(tempC), rh = clamp(Number(relativeHumidity),0,100), clouds = clamp(Number(cloudCover)/100,0,1);
  if(t < -90 || t > 65) return null;
  const kelvin = t+273.15;
  const vapour = (rh/100)*6.112*Math.exp(17.67*t/(t+243.5)); // hPa
  const clearEmissivity = clamp(1.24*Math.pow(Math.max(0.01,vapour)/kelvin,1/7),0.5,0.99);
  const skyEmissivity = clearEmissivity + (1-clearEmissivity)*0.85*clouds*clouds;
  return 5.670374419e-8*Math.pow(kelvin,4)*skyEmissivity;
}
const palette = value => {
  const fraction=clamp((value-260)/220,0,1);
  const hue=Math.round(203-192*fraction);
  return "hsl("+hue+" 75% 49%)";
};
const requestJSON=async (url, options={}) => {
  const res=await fetch(url,options);
  if(!res.ok)throw new Error("Dịch vụ dữ liệu trả về lỗi HTTP "+res.status);
  return res.json();
};
const restoreArea=()=>{
  try {const a=JSON.parse(localStorage.getItem("agridelta_ir_area_v1"));if(a&&Number.isFinite(a.lat)&&Number.isFinite(a.lon)&&Math.abs(a.lat)<=90&&Math.abs(a.lon)<=180)return a;}catch{}
  return null;
};
const geoSamples=(area,radiusKm) => {
  const a=radiusKm/111.32;
  const b=radiusKm/(111.32*Math.max(.18,Math.cos(area.lat*Math.PI/180)));
  const result=[];
  for(let y=-1;y<=1;y++)for(let x=-1;x<=1;x++)result.push({
    lat:clamp(area.lat+y*a*.72,-89.9,89.9),
    lon:((area.lon+x*b*.72+540)%360)-180,x,y
  });
  return result;
};
let leafletPromise=null;
function leafletLoader() {
  if(window.L) return Promise.resolve(window.L);
  if(leafletPromise)return leafletPromise;
  leafletPromise=new Promise((resolve,reject)=>{
    if(!document.querySelector("#agridelta-leaflet-css")){
      const link=document.createElement("link");link.id="agridelta-leaflet-css";link.rel="stylesheet";
      link.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";document.head.appendChild(link);
    }
    const script=document.createElement("script");script.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload=()=>window.L?resolve(window.L):reject(new Error("Không mở được bản đồ"));
    script.onerror=()=>reject(new Error("Không tải được thư viện bản đồ"));
    document.head.appendChild(script);
  }).catch(e=>{leafletPromise=null;throw e;});
  return leafletPromise;
}
export function createFarmIntelligence({getFields=()=>[],getSeasons=()=>[] }={}) {
  let root=null,tab="forecast",hours=72,radius=20,area=restoreArea(),places=[],forecast=null,slots=[],index=0,loading=false,error="",lookupBusy=false,lookupError="";
  let map=null,sequence=0,photo=null,photoPreview="",doctorResult=null,doctorError="",doctorBusy=false,doctorCrop="đậu",stage=1,modelLoaded=false;
  let mapGeneration=0;
  const stages=["Hạt giống","Nảy mầm","Sinh trưởng","Ra hoa","Kết quả"];
  const available=() => {
    if(!forecast||!forecast[4])return [];
    const center=forecast[4].hourly||{}, now=Date.now()-3600000;
    return (center.time||[]).map((time,i)=>({i,time,timestamp:Date.parse(time+"Z"),lw:estimateLongwave(center.temperature_2m?.[i],center.relative_humidity_2m?.[i],center.cloud_cover?.[i]),
      temperature:center.temperature_2m?.[i],rh:center.relative_humidity_2m?.[i],cloud:center.cloud_cover?.[i],solar:center.shortwave_radiation?.[i],rain:center.precipitation?.[i]}))
      .filter(x=>x.timestamp>=now&&Number.isFinite(x.lw)).slice(0,hours);
  };
  function current(){const a=available();return a[Math.min(index,a.length-1)]||null;}
  function dayAdvice(p) {
    if(!p)return "Chọn khu vực để nhận dữ liệu dự báo.";
    if(p.temperature>=35&&p.solar>=500)return "Nhiệt độ và bức xạ mặt trời cùng cao: kiểm tra nước trong đất, dấu hiệu héo và cân nhắc che nắng phù hợp cây trồng.";
    if(p.rain>=3)return "Có mưa dự báo. Kiểm tra khả năng thoát nước; không kết luận cây cần tưới chỉ từ mức bức xạ hồng ngoại.";
    if(p.rh<45&&p.temperature>=31)return "Không khí nóng và khô: cần quan sát lá, kiểm tra độ ẩm đất và đối chiếu nhật ký tưới.";
    return "Bức xạ hồng ngoại nhiệt là một yếu tố của cân bằng năng lượng. Hãy xem thêm nhiệt độ, độ ẩm, ánh sáng và tình trạng thực tế trước khi xử lý cây.";
  }
  const icon=(name)=>({forecast:"☀",doctor:"✿",twin:"❀"}[name]||"✿");
  function headline(){
    return '<section class="afi-hero"><div><span class="afi-kicker">AGRIDELTA / FARM INTELLIGENCE</span><h1>Hiểu môi trường.<br><em>Nuôi dưỡng mùa xanh.</em></h1><p>Đưa dữ liệu khí tượng, quan sát cây và mô hình sinh trưởng vào cùng một không gian.</p></div><div class="afi-hero-symbol" aria-hidden="true">✳</div></section>'+
      '<nav class="afi-tabs" aria-label="Các hệ thống AI">'+[
      ["forecast","Dự báo hồng ngoại"],["doctor","Bác sĩ cây trồng"],["twin","Digital Twin 3D"]]
      .map(a=>'<button type="button" data-afi-tab="'+a[0]+'" class="'+(tab===a[0]?'is-active':'')+'" aria-current="'+(tab===a[0]?'page':'false')+'"><span aria-hidden="true">'+icon(a[0])+'</span>'+a[1]+'</button>').join("")+'</nav>';
  }
  function forecastView(){
    const point=current(),entries=available(),high=entries.length?Math.max(...entries.map(p=>p.lw)):null;
    const low=entries.length?Math.min(...entries.map(p=>p.lw)):null;
    const mean=entries.length?entries.reduce((s,p)=>s+p.lw,0)/entries.length:null;
    return '<section class="afi-topbar"><div><span class="afi-eyebrow">DỰ BÁO KHU VỰC</span><h2>Hồng ngoại nhiệt hướng xuống</h2><p>Ước tính bức xạ từ khí quyển xuống mặt đất (W/m²), dựa trên thời tiết dự báo.</p></div><span class="afi-source">MÔ HÌNH VẬT LÝ · KHÔNG PHẢI CẢM BIẾN</span></section>'+
      '<div class="afi-layout"><section class="afi-panel afi-control-panel">'+
      '<h3>Chọn khu vực</h3><form id="afi-place-form" class="afi-place-form"><label class="afi-label" for="afi-place">Tìm tỉnh, thành phố hoặc địa danh</label><div class="afi-input-row"><input id="afi-place" name="place" placeholder="VD: Đà Nẵng, Hội An..." autocomplete="off" required minlength="2"><button class="afi-primary" type="submit" '+(lookupBusy?'disabled':'')+'>Tìm</button></div></form>'+
      (lookupBusy?'<p class="afi-note">Đang tra cứu địa danh…</p>':'')+(lookupError?'<p class="afi-error">'+esc(lookupError)+'</p>':'')+
      (places.length?'<div class="afi-location-results">'+places.map((p,i)=>'<button type="button" data-afi-location="'+i+'">'+esc(p.name)+(p.admin1?', '+esc(p.admin1):'')+(p.country?', '+esc(p.country):'')+'</button>').join('')+'</div>':'')+
      '<form id="afi-coordinate-form" class="afi-coordinates"><label>Vĩ độ<input name="lat" type="number" step="any" min="-90" max="90" placeholder="15.880" value="'+(area?esc(area.lat):'')+'" required></label><label>Kinh độ<input name="lon" type="number" step="any" min="-180" max="180" placeholder="108.338" value="'+(area?esc(area.lon):'')+'" required></label><button type="submit">Áp dụng tọa độ</button></form>'+
      (area?'<p class="afi-location"><strong>'+esc(area.name)+'</strong><span>'+num(area.lat,4)+'°, '+num(area.lon,4)+'°</span></p>':'<p class="afi-note">Chưa chọn khu vực. Không tự giả định vị trí của bạn.</p>')+
      '<div class="afi-field-row"><label for="afi-radius">Bán kính khảo sát</label><select id="afi-radius"><option value="5" '+(radius===5?'selected':'')+'>5 km</option><option value="20" '+(radius===20?'selected':'')+'>20 km</option><option value="50" '+(radius===50?'selected':'')+'>50 km</option></select></div>'+
      '<div class="afi-field-row"><label for="afi-hours">Thời hạn dự báo</label><select id="afi-hours"><option value="24" '+(hours===24?'selected':'')+'>24 giờ</option><option value="72" '+(hours===72?'selected':'')+'>72 giờ</option><option value="168" '+(hours===168?'selected':'')+'>7 ngày</option></select></div>'+
      '<button type="button" class="afi-primary afi-full" data-afi-action="forecast" '+(!area||loading?'disabled':'')+'>'+(loading?'Đang tải dữ liệu…':'Cập nhật dự báo')+'</button>'+
      '<p class="afi-micro">Kết quả là ước tính bán thực nghiệm từ dữ liệu khí tượng Open-Meteo. Không phải quan sát vệ tinh hay mô hình AI đã huấn luyện; ô lưới khí tượng có thể lớn hơn vườn của bạn.</p>'+
      '</section><section class="afi-panel afi-map-panel"><div class="afi-panel-head"><h3>Bản đồ bức xạ khu vực</h3><span>'+ (area?esc(area.name):'CHỜ CHỌN VỊ TRÍ')+'</span></div><div id="afi-map" class="afi-map"><div class="afi-map-empty">Chọn một khu vực và tải dự báo để xem bản đồ nhiệt.</div></div>'+
      '<div class="afi-legend"><span>Thấp hơn</span><div class="afi-legend-gradient"></div><span>Cao hơn</span></div>'+
      '<p class="afi-micro">Các ô màu thể hiện giá trị ước tính tại 9 điểm lấy mẫu trên lưới dự báo, không thể hiện nhiệt độ lá hay mức độ nguy hiểm của cây.</p></section></div>'+
      (error?'<p class="afi-error afi-message">'+esc(error)+'</p>':'')+
      (point?'<section class="afi-results"><div class="afi-panel-head"><div><h3>Dự báo bức xạ</h3><p>'+esc(area?.name||'')+' · '+dateLabel(point.time)+'</p></div><span class="afi-source">Nguồn thời tiết: Open-Meteo</span></div>'+
      '<div class="afi-metrics"><div><small>Thời điểm đã chọn</small><strong>'+num(point.lw,0)+' <i>W/m²</i></strong></div><div><small>Trung bình '+hours+' giờ</small><strong>'+num(mean,0)+' <i>W/m²</i></strong></div><div><small>Khoảng ước tính trong kỳ</small><strong>'+num(low,0)+'–'+num(high,0)+'</strong></div><div><small>Nhiệt độ không khí</small><strong>'+num(point.temperature,1)+' <i>°C</i></strong></div></div>'+
      chart(entries)+
      '<div class="afi-range"><label for="afi-time-slider">Thời điểm trên bản đồ: <strong>'+dateLabel(point.time)+'</strong></label><input id="afi-time-slider" type="range" min="0" max="'+Math.max(0,entries.length-1)+'" value="'+index+'" step="1"></div>'+
      '<div class="afi-advice"><strong>Gợi ý quan sát cây trồng</strong><p>'+esc(dayAdvice(point))+'</p></div></section>':'')+
      '<section class="afi-disclosure">TIR hướng xuống khác với cận hồng ngoại NIR và khác với chỉ số UV. Không diễn giải màu bản đồ là xác suất sâu bệnh; dữ liệu này chưa được hiệu chuẩn bằng trạm đo bức xạ tại Việt Nam.</section>';
  }
  function chart(points){
    if(!points.length)return "";
    const vals=points.map(p=>p.lw);
    const lo=Math.floor((Math.min(...vals)-12)/10)*10,hi=Math.ceil((Math.max(...vals)+12)/10)*10;
    const W=740,H=174,x=i=>12+(points.length<2?0:i/(points.length-1))*714;
    const y=v=>12+(hi-v)/(hi-lo||1)*132;
    const coords=points.map((p,i)=>num(x(i),1)+","+num(y(p.lw),1)).join(" ");
    const circles=points.map((p,i)=>i===index?'<circle cx="'+num(x(i),1)+'" cy="'+num(y(p.lw),1)+'" r="5.5" fill="#256745" stroke="#fff" stroke-width="2"/>':'').join("");
    return '<div class="afi-chart" role="img" aria-label="Biểu đồ dự báo hồng ngoại nhiệt từ '+num(lo)+' đến '+num(hi)+' W/m²"><div class="afi-chart-caption"><span>W/m²</span><span>'+dateLabel(points[0].time)+' – '+dateLabel(points[points.length-1].time)+'</span></div><svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none" aria-hidden="true"><path d="M12 12 H726 M12 78 H726 M12 144 H726" fill="none" stroke="#e3ebe2" stroke-width="1"/><polygon points="12,144 '+coords+' 726,144" fill="#b8d8c0" opacity=".28"/><polyline points="'+coords+'" fill="none" stroke="#2b7951" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>'+circles+'</svg></div>';
  }
  function doctorView(){
    const fields=getFields();
    return '<section class="afi-topbar"><div><span class="afi-eyebrow">AI PLANT DOCTOR</span><h2>Bác sĩ cây trồng</h2><p>Chụp hoặc tải ảnh lá, thân, quả. AI đánh giá dấu hiệu có thể có — không thay cho kiểm tra thực địa.</p></div></section>'+
      '<div class="afi-doctor-grid"><section class="afi-panel"><h3>Gửi ảnh quan sát</h3><label class="afi-label" for="afi-doctor-crop">Loại cây</label><select id="afi-doctor-crop" class="afi-select"><option value="đậu">Cây đậu</option><option value="cà chua">Cà chua</option><option value="lúa">Lúa</option><option value="ớt">Ớt</option><option value="khác">Cây trồng khác</option></select>'+
      (fields.length?'<p class="afi-micro">Các khu vườn đã khai báo: '+esc(fields.slice(0,3).map(f=>f.name).join(', '))+'</p>':'')+
      '<label class="afi-upload" for="afi-doctor-file">'+(photoPreview?'<img src="'+photoPreview+'" alt="Ảnh cây do người dùng chọn">':'<span class="afi-upload-symbol">⌾</span><strong>Chọn ảnh hoặc chụp ảnh cây</strong><small>JPG, PNG, WebP · Ảnh sẽ được nén trước khi gửi phân tích</small>')+'</label>'+
      '<input id="afi-doctor-file" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" hidden>'+
      '<button type="button" class="afi-primary afi-full" data-afi-action="diagnose" '+(!photo||doctorBusy?'disabled':'')+'>'+(doctorBusy?'Đang phân tích ảnh…':'Phân tích ảnh bằng AI')+'</button>'+
      '<p class="afi-micro">Ảnh chỉ gửi đến dịch vụ AI khi bạn bấm Phân tích. Tính năng cần cấu hình GEMINI_API_KEY trên Vercel để thực hiện suy luận.</p></section>'+
      '<section class="afi-panel"><h3>Kết quả chẩn đoán</h3>'+
      (doctorError?'<p class="afi-error">'+esc(doctorError)+'</p>':'')+
      (doctorResult?'<div class="afi-doctor-result"><span class="afi-source">ĐÁNH GIÁ ẢNH BẰNG AI · CẦN KIỂM TRA LẠI</span><h4>'+esc(doctorResult.condition||"Chưa xác định")+'</h4><p>'+esc(doctorResult.explanation||"Không có mô tả")+'</p><h5>Điều cần kiểm tra</h5><ul>'+(doctorResult.checks||[]).map(t=>'<li>'+esc(t)+'</li>').join("")+'</ul><h5>Hướng xử lý an toàn</h5><ul>'+(doctorResult.actions||[]).map(t=>'<li>'+esc(t)+'</li>').join("")+'</ul><small>'+esc(doctorResult.uncertainty||"Đây là ý kiến sàng lọc, không phải kết luận chắc chắn.")+'</small></div>':
      '<div class="afi-empty-result"><span>✿</span><strong>Chưa có kết quả AI</strong><p>Chọn một ảnh rõ nét của bộ phận cây cần kiểm tra. Nếu chưa có API key, hệ thống sẽ thông báo cấu hình thay vì tạo kết quả giả.</p></div>')+
      '<div class="afi-advice"><strong>Mẹo chụp ảnh</strong><p>Chụp cả lá khỏe và lá bất thường trong ánh sáng tự nhiên; nếu nhiều bộ phận bị ảnh hưởng, chụp bổ sung và ghi thời điểm xuất hiện triệu chứng.</p></div></section></div>';
  }
  function twinView(){
    const fields=getFields(),seasons=getSeasons(),point=current();
    const label=stages[stage], progressed=[2,20,45,72,97][stage];
    return '<section class="afi-topbar"><div><span class="afi-eyebrow">LIVING DIGITAL TWIN</span><h2>Cây trồng song sinh 3D</h2><p>Tận dụng mô hình cây đậu Blender hiện tại và mô phỏng các giai đoạn sinh trưởng một cách trực quan.</p></div><span class="afi-source">MÔ PHỎNG · KHÔNG PHẢI ẢNH CÂY THẬT</span></section>'+
      '<div class="afi-twin-layout"><section class="afi-panel afi-twin-scene"><div class="afi-panel-head"><h3>Vòng đời cây đậu</h3><span>BLENDER / GLB</span></div>'+
      '<model-viewer id="afi-twin-model" src="/assets/start-lifecycle-live.glb" poster="/assets/start-botanical-lifecycle-2.webp" alt="Cây đậu 3D với thân lá và bộ rễ" camera-controls interaction-prompt="none" loading="eager" shadow-intensity="1" exposure="1.06" camera-orbit="35deg 75deg 105%" field-of-view="28deg"></model-viewer>'+
      '<p class="afi-micro">Kéo xoay cây để xem từng góc. Dùng thanh giai đoạn để quan sát các mốc sinh trưởng từ mô hình hoạt ảnh. Không suy ra sức khỏe cây từ kết xuất này.</p></section>'+
      '<section class="afi-panel afi-twin-control"><h3>Quan sát sinh trưởng</h3><span class="afi-eyebrow">GIAI ĐOẠN HIỆN TẠI</span><div class="afi-stage-heading"><strong>'+label+'</strong><span>'+progressed+'% mốc mô phỏng</span></div>'+
      '<input id="afi-stage" aria-label="Chọn giai đoạn sinh trưởng" type="range" min="0" max="4" value="'+stage+'" step="1">'+
      '<div class="afi-stage-markers">'+stages.map((s,i)=>'<button type="button" data-afi-stage="'+i+'" class="'+(stage===i?'is-active':'')+'">'+esc(s)+'</button>').join("")+'</div>'+
      '<div class="afi-twin-facts"><div><small>Cánh đồng đã khai báo</small><strong>'+fields.length+'</strong></div><div><small>Mùa vụ đã tạo</small><strong>'+seasons.length+'</strong></div></div>'+
      '<div class="afi-advice"><strong>Dữ liệu môi trường liên quan</strong><p>'+(point?'Dự báo hồng ngoại gần nhất cho '+esc(area?.name||'khu vực đã chọn')+': '+num(point.lw,0)+' W/m² ('+dateLabel(point.time)+'). Đây là dữ liệu khu vực, không phải số đo riêng của cây.':'Chọn khu vực trong tab Dự báo hồng ngoại để tham khảo thêm điều kiện môi trường cho cây mô phỏng.')+'</p></div>'+
      '<p class="afi-micro">Digital Twin hiện ở chế độ trực quan hóa vòng đời. Để phản ánh sinh trưởng thực tế, cần nhật ký chăm sóc và dữ liệu đo liên tục theo từng mùa vụ.</p></section></div>';
  }
  function render() {
    if(!root||!root.isConnected)return;
    if(map){map.remove();map=null;}
    mapGeneration++;
    root.innerHTML='<div class="afi-workspace">'+headline()+(tab==="forecast"?forecastView():tab==="doctor"?doctorView():twinView())+'</div>';
    wire();
    if(tab==="forecast"&&forecast&&area&&current())initMap(mapGeneration);
    if(tab==="twin")initModel();
  }
  function wire(){
    root.querySelectorAll("[data-afi-tab]").forEach(b=>b.addEventListener("click",()=>{tab=b.dataset.afiTab;render();}));
    if(tab==="forecast"){
      root.querySelector("#afi-place-form")?.addEventListener("submit",async e=>{e.preventDefault();await lookup(e.target.place.value);});
      root.querySelector("#afi-coordinate-form")?.addEventListener("submit",e=>{
        e.preventDefault();const form=e.currentTarget;const lat=Number(form.elements.lat.value),lon=Number(form.elements.lon.value);
        if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180){error="Vĩ độ hoặc kinh độ không hợp lệ";render();return;}
        setArea({lat,lon,name:"Vị trí tùy chọn"});load();
      });
      root.querySelectorAll("[data-afi-location]").forEach(b=>b.addEventListener("click",()=>{
        const p=places[Number(b.dataset.afiLocation)];if(p){setArea({lat:p.latitude,lon:p.longitude,name:[p.name,p.admin1,p.country].filter(Boolean).join(", ")});load();}
      }));
      root.querySelector("#afi-radius")?.addEventListener("change",e=>{radius=Number(e.target.value);forecast=null;index=0;render();if(area)load();});
      root.querySelector("#afi-hours")?.addEventListener("change",e=>{hours=Number(e.target.value);index=0;render();if(area&&!forecast)load();});
      root.querySelector("#afi-time-slider")?.addEventListener("input",e=>{const t=available()[Number(e.target.value)];const label=root.querySelector(".afi-range label strong");if(t&&label)label.textContent=dateLabel(t.time);});
      root.querySelector("#afi-time-slider")?.addEventListener("change",e=>{index=Number(e.target.value);render();});
      root.querySelector('[data-afi-action="forecast"]')?.addEventListener("click",()=>load());
    }
    if(tab==="doctor"){
      const crop=root.querySelector("#afi-doctor-crop");if(crop){crop.value=doctorCrop;crop.addEventListener("change",e=>{doctorCrop=e.target.value;});}
      root.querySelector("#afi-doctor-file")?.addEventListener("change",async e=>{
        const file=e.target.files?.[0];if(!file)return;
        doctorResult=null;doctorError="";photo=null;
        try{const result=await compressImage(file);photo=result.split(",")[1];photoPreview=result;}
        catch(ex){doctorError=ex.message||"Không thể đọc ảnh";}
        render();
      });
      root.querySelector('[data-afi-action="diagnose"]')?.addEventListener("click",diagnose);
    }
    if(tab==="twin"){
      root.querySelector("#afi-stage")?.addEventListener("input",e=>{stage=Number(e.target.value);seekModel();const el=root.querySelector(".afi-stage-heading strong");if(el)el.textContent=stages[stage];root.querySelectorAll("[data-afi-stage]").forEach(b=>b.classList.toggle("is-active",Number(b.dataset.afiStage)===stage));});
      root.querySelector("#afi-stage")?.addEventListener("change",()=>render());
      root.querySelectorAll("[data-afi-stage]").forEach(b=>b.addEventListener("click",()=>{stage=Number(b.dataset.afiStage);render();}));
    }
  }
  async function lookup(name){
    if(!name||name.trim().length<2)return;
    lookupBusy=true;lookupError="";places=[];render();
    try{
      const data=await requestJSON("https://geocoding-api.open-meteo.com/v1/search?name="+encodeURIComponent(name.trim())+"&count=7&language=vi&format=json");
      places=(data.results||[]).filter(p=>Number.isFinite(p.latitude)&&Number.isFinite(p.longitude));
      if(!places.length)lookupError="Không tìm thấy địa danh. Thử tên tỉnh/thành phố khác hoặc nhập tọa độ.";
    }catch(e){lookupError=e.message||"Không tìm được địa danh";}
    finally{lookupBusy=false;render();}
  }
  function setArea(a){
    area=a;forecast=null;places=[];error="";index=0;
    try{localStorage.setItem("agridelta_ir_area_v1",JSON.stringify(a));}catch{}
    render();
  }
  async function load(){
    if(!area)return;
    const ticket=++sequence;loading=true;error="";render();
    const pts=geoSamples(area,radius), hourly="temperature_2m,relative_humidity_2m,cloud_cover,shortwave_radiation,precipitation";
    const params=new URLSearchParams({latitude:pts.map(p=>p.lat.toFixed(5)).join(","),longitude:pts.map(p=>p.lon.toFixed(5)).join(","),hourly,timezone:"UTC",forecast_days:"8"});
    try{
      const data=await requestJSON("https://api.open-meteo.com/v1/forecast?"+params);
      if(ticket!==sequence)return;
      const items=Array.isArray(data)?data:[data];
      if(items.length!==9||!items.every(it=>it.hourly&&it.hourly.time?.length&&it.hourly.temperature_2m?.length))throw new Error("Dữ liệu dự báo khu vực chưa đầy đủ");
      forecast=items;slots=pts;index=0;
    }catch(e){if(ticket===sequence){forecast=null;error="Không lấy được dữ liệu khí tượng: "+(e.message||"Lỗi mạng")+". Thử lại sau.";}}
    finally{if(ticket===sequence){loading=false;render();}}
  }
  async function initMap(ticket){
    const slot=root?.querySelector("#afi-map");if(!slot||!area)return;
    slot.innerHTML='<div class="afi-map-empty">Đang tải bản đồ nền…</div>';
    try{
      const L=await leafletLoader();
      if(ticket!==mapGeneration||!slot.isConnected||!current())return;
      slot.replaceChildren();
      map=L.map(slot,{zoomControl:true,scrollWheelZoom:false});
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',maxZoom:18}).addTo(map);
      const pts=slots, chosen=current(), sampleIndex=chosen.i;
      let rects=[];
      pts.forEach((p,j)=>{
        const h=forecast[j].hourly||{};
        const val=estimateLongwave(h.temperature_2m?.[sampleIndex],h.relative_humidity_2m?.[sampleIndex],h.cloud_cover?.[sampleIndex]);
        if(!Number.isFinite(val))return;
        const latDist=radius/111.32*.36,lonDist=radius/(111.32*Math.max(.18,Math.cos(area.lat*Math.PI/180)))*.36;
        const rectangle=L.rectangle([[p.lat-latDist,p.lon-lonDist],[p.lat+latDist,p.lon+lonDist]],{color:palette(val),fillColor:palette(val),weight:1,fillOpacity:.35}).addTo(map);
        rectangle.bindPopup("Ước tính: "+num(val,0)+" W/m²<br>"+esc(dateLabel(chosen.time)));
        rects.push(rectangle);
      });
      L.circleMarker([area.lat,area.lon],{radius:6,color:"#fff",weight:2,fillColor:"#175b3c",fillOpacity:1}).addTo(map).bindPopup(esc(area.name));
      if(rects.length)map.fitBounds(L.featureGroup(rects).getBounds(),{padding:[24,24],maxZoom:11});
      else map.setView([area.lat,area.lon],9);
      setTimeout(()=>{if(map&&slot.isConnected)map.invalidateSize();},150);
    }catch(e){if(slot.isConnected)slot.innerHTML='<div class="afi-map-empty">Không tải được bản đồ nền. Dữ liệu trong biểu đồ vẫn có thể sử dụng.</div>';}
  }
  function compressImage(file){
    return new Promise((resolve,reject)=>{
      if(!/^image\/(jpeg|png|webp)$/.test(file.type))return reject(new Error("Chỉ hỗ trợ JPEG, PNG và WebP"));
      if(file.size>12*1024*1024)return reject(new Error("Ảnh vượt quá 12 MB"));
      const url=URL.createObjectURL(file),image=new Image();
      image.onload=()=>{
        const ratio=Math.min(1,1200/Math.max(image.naturalWidth,image.naturalHeight));
        const canvas=document.createElement("canvas");canvas.width=Math.round(image.naturalWidth*ratio);canvas.height=Math.round(image.naturalHeight*ratio);
        const ctx=canvas.getContext("2d");if(!ctx){URL.revokeObjectURL(url);reject(new Error("Trình duyệt không hỗ trợ xử lý ảnh"));return;}
        ctx.drawImage(image,0,0,canvas.width,canvas.height);URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/jpeg",.79));
      };
      image.onerror=()=>{URL.revokeObjectURL(url);reject(new Error("Ảnh không hợp lệ"));};
      image.src=url;
    });
  }
  async function diagnose(){
    if(!photo||doctorBusy)return;
    doctorBusy=true;doctorError="";doctorResult=null;render();
    try{
      const data=await requestJSON("/api/plant-diagnose",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({image:photo,mimeType:"image/jpeg",crop:doctorCrop})});
      if(!data||!data.condition)throw new Error("Phản hồi AI không hợp lệ");
      doctorResult=data;
    }catch(e){doctorError=e.message?.includes("503")?"Dịch vụ AI chưa được cấu hình. Cần thêm GEMINI_API_KEY trong Environment Variables của Vercel để phân tích ảnh.":(e.message||"Không thể chẩn đoán ảnh");}
    finally{doctorBusy=false;render();}
  }
  async function initModel(){
    const model=root?.querySelector("#afi-twin-model");if(!model)return;
    if(window.customElements?.get("model-viewer")){seekModel();return;}
    try{await import("@google/model-viewer");if(model.isConnected)seekModel();}
    catch{const note=root?.querySelector(".afi-twin-scene .afi-micro");if(note)note.textContent="Thiết bị chưa hỗ trợ mô hình 3D; hình poster vẫn có thể dùng để tham khảo.";}
  }
  function seekModel(){
    const model=root?.querySelector("#afi-twin-model");if(!model)return;
    const move=()=>{try{if(model.availableAnimations?.length){model.animationName=model.availableAnimations[0];model.pause();if(model.duration>0)model.currentTime=model.duration*[.02,.18,.46,.72,.97][stage];}}catch{}};
    if(model.loaded)move();
    else model.addEventListener("load",move,{once:true});
  }
  return {mount(el){root=el;render();},detach(){sequence++;if(map){map.remove();map=null;}root=null;},getTab(){return tab;}};
}
