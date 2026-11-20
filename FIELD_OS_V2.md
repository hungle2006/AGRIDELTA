# AGRIDELTA Field OS 2.0 — triển khai ứng dụng

## Kiến trúc
Trang Start tiếp tục dùng Blender/Three.js và hệ rễ cuộn trang. Khi bấm Start, ứng dụng nạp \`workspace-v2.js\` / \`workspace-v2.css\`, hoàn toàn thay màn hình quản lý cũ. \`main.js\` được giữ nguyên để tham khảo hoặc rollback nhưng không còn được nạp.

- Tổng quan: chỉ số theo dữ liệu thực tế đã nhập, công việc gần tới hạn và các cánh đồng gần đây.
- Cánh đồng: CRUD tên, diện tích (ha), cây trồng, độ ẩm nhập tay, trạng thái và ghi chú.
- Mùa vụ: CRUD kế hoạch với ngày gieo/thu hoạch, liên kết cánh đồng và thanh tiến độ.
- Công việc: CRUD, mức ưu tiên, hạn thực hiện, hoàn thành, theo khu vực.
- Quan sát: nhật ký cây trồng và ảnh thực (lưu trong IndexedDB tại thiết bị).
- Đơn hàng: CRUD, tính thành tiền từ số lượng và đơn giá, trạng thái.
- Cài đặt: xuất/nhập JSON bản ghi và nhập dữ liệu từ bộ nhớ của bản cũ nếu người dùng đồng ý.

Không có dữ liệu mẫu tự sinh hoặc tài khoản giả. Nếu chưa có backend riêng, ứng dụng làm việc ngoại tuyến, dữ liệu nằm trong \`localStorage\` / IndexedDB; dữ liệu **không** đồng bộ liên thiết bị, và việc đăng ký/đăng nhập **không** được bật.

## Kích hoạt tài khoản thực và phân quyền
1. Chọn hoặc tạo một project Supabase **riêng cho AGRIDELTA**. Không sử dụng database của Pharmacy, NoteApp hay sản phẩm khác.
2. Trong SQL Editor của project đó, chạy \`supabase/agridelta_records.sql\`. Kiểm tra RLS và quyền SELECT/INSERT/UPDATE/DELETE.
3. Trong Vercel project \`agridelta\`, cấu hình \`VITE_SUPABASE_URL\` và \`VITE_SUPABASE_PUBLISHABLE_KEY\` cho Production (và Preview nếu cần). Chỉ dùng publishable key, tuyệt đối không dùng service_role.
4. Deploy lại. Trang Cài đặt sẽ hiện Đăng ký/Đăng nhập thực bằng Supabase Auth; mỗi truy vấn records dùng access token của tài khoản và được RLS giới hạn theo \`user_id\`.
5. Xác nhận email, truy cập bằng hai tài khoản khác nhau, thử truy xuất dữ liệu người khác (phải bị từ chối). Kiểm tra ứng dụng trên nhiều thiết bị.

**Giới hạn:** ảnh quan sát vẫn lưu cục bộ, chưa tự tải lên Supabase Storage; chưa có cảm biến độ ẩm hoặc AI chẩn đoán. Bản sao JSON không chứa bytes ảnh. Trạng thái offline không được gọi là đồng bộ máy chủ.

## Chất lượng
- Run: \`npm ci && node --test tests/*.test.mjs && npm run build\`
- Kiểm tra 320, 390, 768, 1024, 1440px; tất cả form CRUD, tìm kiếm, các trạng thái trống, xuất/nhập, thao tác camera và Esc khi đóng modal.
- Chuyển từ Start sang app và từ app về Start phải không làm hỏng 3D/scroll roots.
- Tắt mạng khi dùng local; khi cấu hình Supabase, thử login, RLS, refresh token, signout, mạng mất và sao lưu.
