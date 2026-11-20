# AGRIDELTA — Field OS 2.0

**Website:** https://agridelta.vercel.app/start  
**Workspace:** https://agridelta.vercel.app/start?app=1

AGRIDELTA là ứng dụng tổ chức dữ liệu canh tác gồm cánh đồng, mùa vụ, công việc, nhật ký quan sát và đơn hàng. Trang Start vẫn sử dụng mô hình cây đậu Blender/Three.js, mô phỏng nước, phân và bộ rễ phát triển theo cuộn trang.

## Ứng dụng quản lý

- **Tổng quan**: thống kê số khu canh tác, mùa vụ, tiến độ công việc và giá trị đơn hàng.
- **Cánh đồng**: thêm/sửa/xóa, ảnh thật của khu vực, diện tích, cây trồng, độ ẩm nhập thủ công và ghi chú.
- **Mùa vụ**: kế hoạch gieo trồng, ngày thu hoạch, tiến độ và khu vực liên kết.
- **Công việc**: thêm/sửa/xóa, hạn thực hiện, ưu tiên và đánh dấu hoàn thành.
- **Quan sát**: nhật ký cây trồng với ảnh từ camera hoặc thư viện thiết bị.
- **Đơn hàng**: quản lý khách hàng, sản phẩm, số lượng, đơn giá, trạng thái; thống kê giá trị.
- **Dữ liệu**: sao lưu/khôi phục JSON; nhập dữ liệu từ bản cũ theo yêu cầu.

Mặc định **không có dữ liệu mẫu hoặc tài khoản giả**. Dữ liệu ở chế độ chưa kết nối máy chủ được lưu trong trình duyệt (`localStorage`) và ảnh trong IndexedDB. Chúng không được đồng bộ qua các thiết bị.

## Kết nối dữ liệu thực bằng Supabase

Mã nguồn đã có lớp đăng ký/đăng nhập Supabase và bảng bản ghi theo chủ sở hữu với RLS, nhưng **chưa bật trên Production** vì dự án AGRIDELTA chưa được kết nối với một Supabase riêng.

Quy trình triển khai, migration SQL, biến môi trường và những hạn chế hiện tại được ghi tại [FIELD_OS_V2.md](FIELD_OS_V2.md). Không sử dụng project Supabase của ứng dụng khác khi chưa được xác nhận.

## Phát triển

```bash
npm ci
node --test tests/*.test.mjs
npm run dev
npm run build
```

Chỉ các file `workspace-v2.js` và `workspace-v2.css` được nạp cho ứng dụng hậu Start; `main.js` là phiên bản cũ được giữ để rollback. Mọi tính năng trong workspace được thiết kế tương thích desktop và mobile.

### Mô hình Start

Kết xuất từ Blender 4.3+ (và FFmpeg nếu cần video dự phòng):

```bash
blender -b -t 3 --python blender/start_lifecycle.py
blender -b -t 3 --python blender/render_start_fallback.py
bash scripts/encode-start-fallback.sh
```

Mô hình cây chính xuất thành `public/assets/start-lifecycle-live.glb`. Thiết bị thiếu WebGL 2 sử dụng hình ảnh/phim kết xuất dự phòng.
