# AGRIDELTA · Roots Edition

Mã nguồn web app quản lý canh tác mang chủ đề môi trường, với hành trình **hạt giống → nảy mầm → tưới nước → sinh trưởng → mùa vụ** và bộ rễ hướng dẫn sử dụng khi cuộn trang.

**Website hiện tại:** https://agridelta.vercel.app

## Tính năng

- Hành trình hạt giống tương tác trên Canvas, có thể bỏ qua hoặc xem lại.
- **Root Guide**: cuộn trang để các nhánh rễ dẫn đến hướng dẫn sử dụng từng chức năng.
- Desktop: thanh điều hướng ngang. Mobile: thanh điều hướng phía dưới. Không có sidebar.
- Dashboard, khu canh tác, công việc, mùa vụ, quan sát ảnh và đơn hàng trong chế độ demo.
- Mô hình cây 3D tĩnh `public/assets/agridelta_seed_to_harvest_model.glb` và kịch bản tạo cảnh Blender `blender/seed_to_harvest.py`.

## Chạy trên máy

Yêu cầu Node.js LTS và npm:

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

Thư mục `dist` là output của Vite.

## Cấu trúc

```text
index.html             Trang ứng dụng
main.js/style.css      Giao diện và các tác vụ
intro.js/intro.css     Chuyển động hạt giống
root-guide.js/.css     Bộ rễ hướng dẫn cuộn trang
blender/               Script dựng hoạt ảnh trong Blender
public/assets/         3D GLB và ảnh minh họa
.github/workflows/     CI kiểm tra và đồng bộ asset
vercel.json            Cấu hình triển khai Vercel
```

## Tạo hoạt ảnh bằng Blender

```bash
blender --background --python blender/seed_to_harvest.py
```

**Lưu ý:** hiện GLB trong repo là mô hình tĩnh, còn sinh trưởng trên web dùng Canvas. Script Blender cần được chạy trên máy đã cài Blender để tạo bản dựng 3D động; chưa tích hợp thành animation GLB trong web.

## Quyền riêng tư và an toàn

Đây là **prototype dùng dữ liệu demo**, không phải hệ thống xác thực sản xuất. Đăng nhập/tài khoản demo lưu ở trình duyệt; **không dùng mật khẩu thật hoặc dữ liệu canh tác riêng tư**. Để triển khai cho người dùng thật, cần backend Auth, cơ sở dữ liệu với phân quyền theo tài khoản, kiểm tra quyền truy cập và xử lý dữ liệu ảnh an toàn. Chỉ số cảm biến, độ ẩm và trạng thái mẫu không phải dữ liệu đo trực tiếp.

## Triển khai

Repository này phục vụ quản lý phiên bản và tự động kiểm thử. Để tự động deploy, kết nối repo GitHub này đến dự án `agridelta` trong Vercel > Settings > Git, chọn branch `main`. Không chuyển domain khỏi dự án hiện tại.

Phần asset nhị phân được đồng bộ từ bản phát hành Vercel đã kiểm chứng bởi workflow `bootstrap-assets.yml`, có đối chiếu SHA-256 trước khi commit.
