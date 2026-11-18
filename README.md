# AGRIDELTA — Living Roots

**AGRIDELTA** là bản thử nghiệm web app nông nghiệp xanh, có trang giới thiệu tương tác từ **cây non 3D đến hệ rễ hướng dẫn sử dụng**. Trang web được thiết kế để cuộn liên tục — không phải slideshow, không khóa cuộn và không có sidebar.

**Website:** https://agridelta.vercel.app

## Trải nghiệm

- **Cây non 3D:** mô hình glTF `public/assets/agridelta_seed_to_harvest_model.glb` có lá cong, gân lá, giọt sương, đất và rễ. Người dùng có thể xoay/quan sát khi trình duyệt hỗ trợ WebGL.
- **Bộ rễ theo vị trí cuộn:** cuộn xuống làm rễ chính và các rễ nhánh mở dần. Có 5 hướng dẫn: Cánh đồng, Mùa vụ, Công việc, Quan sát, Đơn hàng.
- **Hướng dẫn tương tác:** mở từng phần “Xem cách sử dụng”, bấm nút đi thẳng đến chức năng.
- **Laptop & điện thoại:** thanh điều hướng trên, bố cục tự điều chỉnh, ảnh thay thế khi 3D không tải được, hỗ trợ `prefers-reduced-motion`.
- **Không gian demo:** trang tổng quan, quản lý khu canh tác, công việc, mùa vụ, xem trước ảnh, quản lý đơn hàng.
- **Không dùng bộ chương trình 5 slide mở đầu:** `intro.js` và `intro.css` được giữ trong mã nguồn làm tư liệu tham khảo, nhưng không được nạp ở trang production.

## Chạy trên máy

Cần Node.js 22+ và npm:

```bash
npm install
npm run dev
```

Truy cập URL do Vite hiển thị. Kiểm tra build:

```bash
node --check main.js
node --check root-guide.js
npm run build
```

## Thư mục quan trọng

```text
index.html              Entry point: root-guide + ứng dụng
root-guide.js/.css      Scrollytelling với SVG và hướng dẫn
main.js/style.css       Giao diện và chức năng quản lý demo
public/assets/          GLB 3D và ảnh poster
blender/                Script tạo cảnh và animation trong Blender
enhance_seedling_model.py  Công cụ tạo thêm chi tiết hình học vào GLB
.github/workflows/      Kiểm tra nguồn và build
vercel.json             Cấu hình deploy
```

## Kết nối GitHub → Vercel

Repo **`hungle2006/AGRIDELTA`** được kết nối với dự án **`agridelta`** trong Vercel. Mỗi lần push lên `main` sẽ kích hoạt Vercel build/deploy vào domain hiện tại. Kiểm tra trạng thái deployment và build logs trong Vercel trước khi xác nhận phát hành.

## Blender và tính chân thực

`blender/seed_to_harvest.py` là script dựng cảnh sinh trưởng 3D với keyframe, chạy bằng Blender được cài trên máy:

```bash
blender --background --python blender/seed_to_harvest.py
```

**Giới hạn:** GLB dùng trên trang web hiện là hình học 3D được tạo bằng code (Trimesh), **không phải video render Blender** và **chưa chứa animation sinh trưởng đầy đủ**. Hoạt ảnh rễ khi cuộn là SVG điều khiển bằng JavaScript. Cần một bước render/export và tích hợp animation glTF riêng nếu muốn cây 3D thực sự mọc theo thời gian.

## Bảo mật và dữ liệu

Đây là **bản demo công khai**, không phải ứng dụng có backend xác thực an toàn. Dữ liệu mẫu và tài khoản demo được lưu ở trình duyệt, không đồng bộ giữa thiết bị. **Không sử dụng mật khẩu thật, thông tin khách hàng hay dữ liệu canh tác riêng tư.** Cần tích hợp Auth và database có phân quyền server-side trước khi sử dụng thực tế. Ảnh chỉ được xem trước; ứng dụng không chẩn đoán bệnh bằng AI.

## Kiểm tra

Kiểm tra trên màn hình 1440px (laptop), 390px và 320px (điện thoại): hiển thị cây, cuộn phát triển rễ, mở chi tiết hướng dẫn, điều hướng vào app, bàn phím, không tràn ngang. CI và Vercel kiểm tra build của mã nguồn mỗi khi cập nhật.
