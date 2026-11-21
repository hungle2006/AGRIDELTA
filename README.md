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


## AGRIDELTA Intelligence (thử nghiệm)

Trong ứng dụng quản lý, chọn **AI nông nghiệp** ở menu bên trái hoặc thanh điều hướng điện thoại:

- **Dự báo hồng ngoại nhiệt theo khu vực**: tìm địa danh hoặc nhập tọa độ, chọn bán kính 5/20/50 km và khoảng 24/72 giờ hoặc 7 ngày. Dùng dự báo nhiệt độ, độ ẩm và độ che phủ mây từ [Open-Meteo](https://open-meteo.com/en/docs) tại 9 điểm; áp dụng công thức độ phát xạ trời quang Brutsaert và hiệu chỉnh mây đơn giản để **ước tính** longwave xuống mặt đất (W/m²). Không phải phép đo vệ tinh, sản phẩm ECMWF `strd` hay một ML model đã được hiệu chuẩn. Nếu dịch vụ khí tượng không khả dụng, hiển thị lỗi chứ không tạo dữ liệu mẫu.
- **Bác sĩ cây trồng**: tải/chụp JPEG, PNG, WebP; trình duyệt tự nén JPEG. Chỉ gửi ảnh khi người dùng bấm phân tích. Vercel Function `api/plant-diagnose.js` gọi Gemini để sàng lọc bất thường và trả kết quả có độ bất định. **Chỉ hoạt động khi cấu hình** `GEMINI_API_KEY` trong Vercel (để trống sẽ trả 503 `AI_NOT_CONFIGURED`); tùy chọn `GEMINI_MODEL`, mặc định `gemini-2.5-flash`. Không đưa khóa vào `VITE_` hay frontend. Trước khi bật cho người dùng thật, cần bổ sung giới hạn truy cập/chi phí phía máy chủ.
- **Digital Twin 3D**: xem và điều khiển các giai đoạn sinh trưởng bằng GLB Blender gốc và các ghi chú môi trường khi đã chọn khu vực. Đây là mô phỏng; không phải phép đo tình trạng thực của cây.

Tìm địa danh dựa trên Open-Meteo Geocoding. Bản đồ nhiệt 3×3 sử dụng Leaflet và OpenStreetMap làm nền; khi không tải được bản đồ, phần số liệu (nếu đã nhận được từ API khí tượng) vẫn được hiển thị. Độ phân giải các mô hình thời tiết **không tương đương với độ phân giải của một mảnh vườn**.

Phương trình bức xạ là ước tính bán thực nghiệm; chưa chứng minh sai số MAE/RMSE trên các điểm quan trắc tại Việt Nam. Vì vậy **không dùng nó để tự động quyết định tưới/phun thuốc hoặc khẳng định bức xạ là nguyên nhân gây bệnh**.

### Kiểm thử tính năng

```bash
node --test tests/*.test.mjs
npm run build
```

## Đăng nhập bắt buộc — Google/Gmail, Facebook, GitHub và email

AGRIDELTA mặc định mở **trang Start 3D**; khi nhấn **Bắt đầu/Vào ứng dụng**, người chưa xác thực sẽ chuyển đến trang đăng nhập trước khi cho vào workspace. Không còn quyền vào hệ thống qua `AGRIDELTAOpenDemo`, đường dẫn `?app=1` hay API điều hướng frontend mà chưa xác minh phiên.

- Nút **Google** là đăng nhập OAuth qua tài khoản Google, bao gồm Gmail.
- Form **Gmail/email** là **đăng ký và đăng nhập bằng email + mật khẩu**, không dùng mật khẩu tài khoản Google nếu bạn chưa đặt mật khẩu AGRIDELTA.
- **Facebook** và **GitHub** đăng nhập qua OAuth. Luồng PKCE dùng mã verifier trong sessionStorage, callback tại `https://agridelta.vercel.app/auth/callback`, sau đó gọi Supabase `/auth/v1/user` để xác minh token trước khi hiển thị workspace.
- Trang Start hiển thị mặc định tại `/` hoặc `/start`; `/?intro=1` vẫn hoạt động. Các đường dẫn `?app=1`, `?login=1`, `/login` và `/auth/callback` vào trang xác thực; nút Bắt đầu luôn yêu cầu xác thực trước khi vào workspace.

**Cấu hình còn thiếu trên production (không có đăng nhập giả):**

1. Tạo một Supabase project **riêng cho AGRIDELTA**, không tái sử dụng database của ứng dụng khác. Chạy SQL trong `supabase/agridelta_records.sql`, giữ RLS và quyền sở hữu.
2. Thêm `VITE_SUPABASE_URL` và `VITE_SUPABASE_PUBLISHABLE_KEY` của project riêng vào Vercel cho Production và Preview, rồi redeploy.
3. Trong Supabase **Authentication > URL Configuration**, đặt Site URL thành `https://agridelta.vercel.app` và thêm redirect URL `https://agridelta.vercel.app/auth/callback` (thêm preview origin riêng nếu cần). Cấu hình email confirmation và SMTP/email deliverability.
4. Trong **Authentication > Sign In / Providers**, bật Google, Facebook, GitHub. Mỗi provider yêu cầu OAuth app riêng và Client ID/Secret cấu hình **ở Supabase**, không nhúng secret vào Vite hay mã nguồn. Callback đăng ký trên bảng điều khiển Google/Meta/GitHub phải trỏ đến `https://<project-ref>.supabase.co/auth/v1/callback` (URL cụ thể hiển thị trong Supabase), không trỏ trực tiếp vào Vercel.
5. Thử OAuth cho cả ba nhà cung cấp bằng tài khoản thật; kiểm tra email signup, refresh session, logout, truy cập thẳng `/?app=1` chưa đăng nhập, và xác nhận mỗi tài khoản không thấy bản ghi của tài khoản khác.

**Quan trọng:** Frontend có route guard; `/api/plant-diagnose` cũng xác minh token Supabase trước khi cho phép gọi Gemini. Bảo vệ dữ liệu thực tế phụ thuộc vào Supabase RLS và việc xác thực request trên server. OAuth hiện chỉ có giao diện và luồng mã nguồn; nếu chưa cấu hình Supabase/provider, các nút sẽ thông báo chưa hoạt động, không hiển thị đăng nhập giả.

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
