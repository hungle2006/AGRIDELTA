## Phiên bản hiện tại: ba hệ thống, không sidebar

Ứng dụng sau đăng nhập chỉ gồm **Dự báo hồng ngoại khu vực**, **AI Plant Doctor**, **Digital Twin 3D**. Điều hướng bằng ba tab ngang, hỗ trợ laptop và điện thoại. Trang Start và mô hình Blender được giữ lại; các task quản lý cũ không còn trong ứng dụng.

- Dự báo: tìm địa danh, nhập tọa độ, bản đồ, bán kính 5/20/50 km, thời hạn 24/72 giờ hoặc 7 ngày. Bức xạ hồng ngoại hướng xuống được ước tính từ khí tượng Open-Meteo, không phải số đo cảm biến tại cây.
- AI Plant Doctor: chụp ảnh hoặc chọn ảnh, nén ảnh và gọi API có xác thực Firebase. Cần `GEMINI_API_KEY` phía server trên Vercel để kích hoạt phân tích thật.
- Digital Twin: mô hình cây đậu Blender/GLB, năm giai đoạn sinh trưởng, tham chiếu dự báo khu vực đã chọn.
- Giữ đăng nhập Firebase và đăng xuất. Không tải hoặc ghi các bản ghi quản lý cũ.

Kiểm tra: `npm ci`, `npm run build`, `node --test tests/*.test.mjs`.

Các phần bên dưới ghi lại các phiên bản trước.

---

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

## Tài khoản Firebase và dữ liệu

AGRIDELTA đã chuyển **xác thực tài khoản** sang Firebase Authentication của dự án `agridelta-a40b7`. Các tùy chọn Google/Gmail, Facebook, GitHub và Email/Mật khẩu được tích hợp trong `firebase-auth.js`. Website vẫn mở **Start 3D** trước khi đăng nhập.

**Lưu trữ:** bản ghi quản lý hiện ở trình duyệt, chia theo UID Firebase; **chưa đồng bộ giữa các thiết bị** và chưa cấu hình Firestore Security Rules. Bản ghi cũ vẫn được giữ để người dùng chủ động nhập vào tài khoản hiện tại.

Tài liệu `FIELD_OS_V2.md` và `supabase/agridelta_records.sql` là thông tin của kiến trúc Supabase **trước đây**, không còn là luồng xác thực đang chạy.


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

## Đăng nhập Firebase chính thức (AGRIDELTA)

Trang **Start 3D/Blender** vẫn mở mặc định tại https://agridelta.vercel.app. Nhấn **Bắt đầu/Vào ứng dụng** để mở trang đăng nhập. Truy cập trực tiếp bằng `/?app=1` cũng phải xác thực.

Firebase Web App đã kết nối với **project `agridelta-a40b7`**, sử dụng Firebase Authentication chính thức:

- **Google**: `GoogleAuthProvider` (đăng nhập được tài khoản Gmail).
- **Facebook**: `FacebookAuthProvider`, cần cấu hình Meta OAuth hợp lệ.
- **GitHub**: `GithubAuthProvider`, cần cấu hình GitHub OAuth callback.
- **Email/Mật khẩu**: `createUserWithEmailAndPassword` và `signInWithEmailAndPassword`; có chức năng khôi phục mật khẩu qua email.

Trang Start không bị thay đổi mô hình GLB, bộ rễ, vòng đời cây hoặc nút điều hướng. Không còn lệnh Supabase auth hoặc nút demo cho phép vào ứng dụng không cần xác thực.

**Cấu hình Firebase (public web config):** `firebase-auth.js` sử dụng Firebase Web SDK chính thức phiên bản **12.19.0** từ `www.gstatic.com` được cố định phiên bản, không cần gói npm mới; không tải Firebase Analytics vì chưa cần. Giá trị `apiKey` của Firebase Web App không phải service-account private key. Cần giới hạn/giám sát API key phù hợp, không bao giờ đưa OAuth Client Secret vào client.

**Bắt buộc kiểm tra trên Firebase Console:**

1. Firebase Authentication → Sign-in method: Enable Google, Facebook, GitHub và Email/Password.
2. Firebase Authentication → Settings → Authorized domains: `agridelta.vercel.app`.
3. Facebook OAuth callback và GitHub callback ở trang nhà cung cấp: `https://agridelta-a40b7.firebaseapp.com/__/auth/handler`.
4. Facebook Login app phải có quyền hoạt động phù hợp (tài khoản tester khi còn development); GitHub OAuth App phải có client credentials hợp lệ.
5. Kiểm thử đăng nhập lần đầu, refresh, logout, quên mật khẩu, dùng 2 tài khoản và browser mobile (cửa sổ popup có thể bị trình duyệt chặn). Nếu popup bị chặn, cho phép popup cho domain này.

**Dữ liệu nông trại:** hiện lưu **cục bộ, chia khóa theo Firebase UID**. Chưa tự đồng bộ qua thiết bị hoặc dùng Cloud Firestore. Dữ liệu cũ `agridelta_workspace_v2` và ảnh cũ được giữ nguyên, không bị chuyển tự động sang tài khoản bất kỳ; trong Cài đặt có nút **Nhập dữ liệu cũ trên máy** (cần xác nhận) để nhập vào tài khoản hiện tại. Ảnh ở bản sao JSON chưa bao gồm byte ảnh. Đây chưa phải lưu trữ đám mây an toàn cấp máy chủ; trước khi bật Firestore cần cấu hình Firestore Security Rules theo `request.auth.uid`.

**Plant Doctor API:** `/api/plant-diagnose` kiểm tra Firebase ID token với Firebase Identity Toolkit `accounts:lookup` trước khi gọi Gemini. Riêng tính năng nhận diện bệnh qua AI vẫn cần cấu hình `GEMINI_API_KEY` trên Vercel. Không gửi khóa Gemini, OAuth secrets hoặc Firebase Admin service account ra client.


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
