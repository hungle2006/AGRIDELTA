# AGRIDELTA · kiểm tra trước khi thiết kế lại

Mốc đối chiếu là production và mã nguồn `c6f3c12`. Trang dùng Vite, Three.js, GLB xuất từ Blender và video Blender trong trình duyệt không có WebGL. Các chức năng quản lý hiện dùng dữ liệu mẫu và `localStorage`. Không có mã API xác thực hoặc đồng bộ trong repository.

| Mức độ | Khu vực | Hiện trạng trước khi sửa |
|---|---|---|
| P0 | Phạm vi | Không phát hiện lỗi chặn vào landing hoặc bảng điều khiển dùng thử trong luồng đã mở. |
| P1 | Tài khoản | Nhãn Đăng nhập mở màn đề nghị dùng thử. Không có phiên xác thực máy chủ. |
| P1 | Cây và rễ | Giới hạn phát đặt ở cuối trình tự. Nước và phân hiển thị theo thời gian, chưa phải điều kiện để cây phát triển. Camera cố định. |
| P1 | Hướng dẫn | Năm nút trên rễ lặp với năm thẻ phía dưới. Chọn một nhánh xa chạy lần lượt các đoạn rễ rồi cuộn tới cuối trang. |
| P1 | Quan sát | Có xem trước ảnh, chưa lưu lịch sử. Công việc nằm trong Tổng quan. Đơn hàng và mùa vụ chỉ có một nhãn trạng thái cố định. |
| P2 | Responsive | Nhiều phần tử absolute dựa trên cùng cấu hình cảnh. Trên điện thoại phải cuộn qua khoảng cách lớn để xem điều khiển cây. |
| P2 | Hiệu năng | Three.js tải tĩnh cùng landing. Vòng render tiếp tục khi cảnh nằm ngoài màn hình. |

## Tham khảo và bố cục

| Tham khảo | Áp dụng cho AGRIDELTA | Giới hạn |
|---|---|---|
| [Apple AirPods Pro](https://www.apple.com/airpods-pro/) | Một vật thể chính, nhịp nhìn chuyển từ toàn cảnh đến chi tiết. | Không lấy bố cục, hiệu ứng hoặc hình của Apple. |
| [Patagonia Regenerative Organic](https://www.patagonia.com/regenerative-organic/) | Kể chuyện qua các chương và đặt đất ở trung tâm. | Không dùng thông điệp chứng nhận hay hình ảnh của Patagonia. |
| [OneSoil Crop Rotation](https://help.onesoil.ai/en/articles/5235420-how-to-plan-crop-rotation-with-onesoil) | Tổ chức bản ghi theo cánh đồng, ngày và trạng thái. | Không mô phỏng NDVI, bản đồ vệ tinh hay số liệu cảm biến. |

Sitemap: Start → Khám phá rễ → Chọn tính năng → Chi tiết hướng dẫn → Tổng quan / Cánh đồng / Mùa vụ / Công việc / Quan sát / Đơn hàng. Tài khoản là một điểm vào riêng, ghi rõ trạng thái xác thực. Hồ sơ dùng thử và dữ liệu lưu trên thiết bị giữ riêng với câu chuyện giới thiệu.

Desktop: tiêu đề và CTA trên nền kem cạnh cảnh 3D. Cuộn đi từ mặt đất xuống rễ trên cùng một khung, với một panel hướng dẫn cạnh cảnh. Mobile: tiêu đề và CTA trước, khung cây dọc, tiếp đến nút theo rễ cạnh nhau theo lưới, và thẻ chi tiết dưới khung.

Màu: #15372B (chữ nền sáng), #4F8161 (cây), #CDE3AE (trạng thái chọn), #F6F3EA (nền), #5C4030 (đất), #DF4B3D (cà chua). Be Vietnam Pro và icon Phosphor. Bước khoảng cách 4/8px, vùng chạm 44px, container khoảng 1280px.
