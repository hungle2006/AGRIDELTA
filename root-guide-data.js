export const FEATURES = [
  {label:'Dự báo hồng ngoại',name:'Hiểu môi trường quanh cây.',eyebrow:'DỰ BÁO KHU VỰC',summary:'Tìm địa danh hoặc nhập tọa độ, xem bản đồ và dự báo hồng ngoại nhiệt trong 24 giờ, 72 giờ hoặc 7 ngày.',instructions:['Chọn tab Dự báo hồng ngoại.','Tìm địa danh hoặc nhập vĩ độ, kinh độ.','Chọn thời hạn và xem bản đồ, biểu đồ bức xạ ước tính.'],page:'forecast',image:'fields',symbol:'field',side:'left'},
  {label:'AI Plant Doctor',name:'Lắng nghe lời của chiếc lá.',eyebrow:'AI PLANT DOCTOR',summary:'Chụp hoặc tải ảnh cây để phân tích dấu hiệu bất thường và nhận gợi ý kiểm tra, chăm sóc khi dịch vụ AI được kích hoạt.',instructions:['Chọn tab AI Plant Doctor.','Chọn loại cây và chụp hoặc tải ảnh rõ nét.','Bấm Phân tích ảnh bằng AI để xem nhận định và gợi ý.'],page:'doctor',image:'observation',symbol:'scan',side:'right'},
  {label:'Digital Twin 3D',name:'Khám phá từng nhịp sinh trưởng.',eyebrow:'LIVING DIGITAL TWIN',summary:'Xoay mô hình cây đậu Blender, chuyển giai đoạn từ hạt đến kết quả và tham khảo dữ liệu môi trường khu vực.',instructions:['Chọn tab Digital Twin 3D.','Kéo để xoay mô hình và chọn giai đoạn sinh trưởng.','Tham khảo dữ liệu môi trường đã chọn trong tab Dự báo hồng ngoại.'],page:'twin',image:'seasons',symbol:'leaf',side:'left'}
];

export const guideIndex=(index,count=FEATURES.length)=>((Number(index)%count)+count)%count;
export const normalizeQuery=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[đĐ]/g,'d').toLowerCase();
export const searchGuides=query=>{const q=normalizeQuery(query).trim();return FEATURES.map((feature,index)=>({feature,index})).filter(({feature})=>normalizeQuery(feature.label+' '+feature.summary+' '+feature.instructions.join(' ')).includes(q));};
