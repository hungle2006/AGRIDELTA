# AGRIDELTA

[Trang Start](https://agridelta.vercel.app/start)

Trang Start giới thiệu vòng đời cây đậu và dùng bộ rễ để dẫn đến năm hướng dẫn trong bản dùng thử. Có thể chọn từng giai đoạn hoặc phát cả vòng đời. Khi cuộn qua phần bộ rễ, rễ mở rộng theo chiều cuộn và thu lại khi quay lên. Các thẻ tính năng mở trực tiếp từng hướng dẫn.

Mô hình được dựng trong Blender. Các cành và cuống lá mọc từ những đốt xác định trên thân. Cuống hoa phát triển từ đốt thân và giữ vị trí khi hoa chuyển thành quả. Rễ phụ và rễ con bắt đầu tại điểm lấy mẫu trên chính đường cong của rễ mẹ. Three.js dùng thuộc tính chiều dài tăng trưởng trong GLB để hiện từng đoạn rễ. Thiết bị không hỗ trợ WebGL 2 dùng phim, ảnh giai đoạn và các lớp rễ kết xuất từ cùng mô hình Blender.

## Phát triển

```bash
npm ci
npm run dev -- --port 4173 --strictPort
node --test tests/*.test.mjs
npm run build
```

Bản dùng thử quản lý cánh đồng, mùa vụ, công việc, quan sát cây trồng và đơn hàng. Dữ liệu được lưu trong trình duyệt.

## Kết xuất lại mô hình Start

Chạy từ thư mục gốc của repo với Blender 4.3+ và FFmpeg.

```bash
blender -b -t 3 --python blender/start_lifecycle.py
blender -b -t 3 --python blender/render_start_fallback.py
bash scripts/encode-start-fallback.sh
```

Lệnh đầu tạo `blender/start_lifecycle.blend` để chỉnh trực tiếp trong Blender và xuất `public/assets/start-lifecycle-live.glb`. Lệnh thứ hai kết xuất các lớp trong thư mục tạm. Đặt `AGRIDELTA_START_FRAMES` nếu cần vị trí khác. Lệnh cuối mã hóa tài nguyên web có nền trong suốt.
