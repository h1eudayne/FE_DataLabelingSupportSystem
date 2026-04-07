# Báo cáo Kiểm tra Hệ thống & Đề xuất Chỉnh sửa

Ngày báo cáo: 2024 (Automated Audit)

## 1. Tổng quan
Hệ thống Frontend React (Vite + Redux Toolkit) đã được kiểm tra toàn diện. Mặc dù Unit Tests chạy qua 100% (151/151 tests), nhưng tồn tại nhiều lỗi logic nghiêm trọng có thể gây hỏng luồng Authentication và hiệu năng kém.

## 2. Các lỗi Nghiêm trọng (Critical Issues)

### 2.1. Bất nhất về Token Key (Authentication Breakdown)
- **Mô tả:** Hệ thống không đồng bộ về tên key lưu trữ token trong `localStorage`.
- **Chi tiết:**
  - `src/App.jsx` kiểm tra key: `"accessToken"`.
  - `src/services/axios.customize.js` lấy key: `"access_token"`.
  - `src/store/auth/auth.slice.js` (theo test log) lưu key: `"access_token"` hoặc `"accessToken"` (cần chuẩn hóa).
- **Hậu quả:** Người dùng có thể đăng nhập thành công (API trả về token) nhưng App vẫn coi là chưa đăng nhập (hoặc ngược lại), hoặc API call tiếp theo bị lỗi 401 do gửi sai/thiếu token.

### 2.2. Thiếu xử lý Token hết hạn (401 Interceptor)
- **Mô tả:** `src/services/axios.customize.js` hiện chỉ có *Request Interceptor*, **thiếu hoàn toàn** *Response Interceptor*.
- **Hậu quả:** Khi token hết hạn, API trả về 401, nhưng ứng dụng không tự động logout hay redirect về trang login. Người dùng sẽ bị kẹt ở màn hình hiện tại với dữ liệu không load được.

### 2.3. Mất trạng thái Auth khi Refresh (F5)
- **Mô tả:** `RoleProtectedRoute.jsx` kiểm tra quyền dựa trên Redux state (`state.auth.isAuthenticated`).
- **Hậu quả:** Redux store không được persist (lưu) vào localStorage. Khi người dùng nhấn F5, Redux store bị reset về initial state -> `isAuthenticated = false` -> Redirect về Login ngay cả khi token trong localStorage vẫn còn hiệu lực.

### 2.4. React 19 Conflict
- **Mô tả:** Dự án dùng React 19 nhưng thư viện `reactstrap` và `react-popper` yêu cầu React 18.
- **Hậu quả:** Cảnh báo `peer dependency` nghiêm trọng, tiềm ẩn lỗi runtime do sự thay đổi của React 19 (ví dụ: thay đổi về context hoặc ref).

## 3. Vấn đề Hiệu năng (Performance)

### 3.1. Bundle Size quá lớn
- **JS Chunk:** ~1.6 MB.
- **CSS Chunk:** ~1.3 MB.
- **Nguyên nhân:**
  - Import thủ công hàng loạt file CSS/Icon lớn trong `App.jsx` (`icons.min.css`, `bootstrap.min.css`).
  - Load thừa thãi nhiều bộ icon (RemixIcon, BoxIcons, LineAwesome, MDI) cùng lúc.
  - Không sử dụng Code Splitting (Dynamic Import) cho các routes.

## 4. Chất lượng Code & Architecture

### 4.1. Mã nguồn chết (Dead Code)
- Công cụ `knip` phát hiện **30 file không sử dụng**, bao gồm các component có vẻ quan trọng như `Header.jsx`, `Sidebar.jsx` (có thể do đã thay thế bằng phiên bản khác nhưng chưa xóa).
- Dependency thừa: `tailwindcss` (project dùng `@tailwindcss/vite` nhưng vẫn khai báo package cũ), `apexcharts`.

### 4.2. Import sai đường dẫn
- Một số file service (ví dụ `annotator.api.js`) import axios bằng đường dẫn tuyệt đối bắt đầu bằng `/src/...`. Điều này sai chuẩn và có thể gây lỗi khi build hoặc test ở môi trường khác.

### 4.3. Anti-patterns
- Nhiều component (`UserModal`, `ProfileModal`) sử dụng `useEffect` để sync props vào state. Điều này gây dư thừa render và khó quản lý state. Nên thay thế bằng `key` prop để reset component.

## 5. Đề xuất Kế hoạch Chỉnh sửa (Action Plan)

Tôi đề xuất thực hiện 3 giai đoạn sửa lỗi:

### Giai đoạn 1: Sửa lỗi Authentication (Ưu tiên cao nhất)
1.  **Chuẩn hóa Token Key:** Quyết định sử dụng duy nhất key `access_token` trên toàn hệ thống (`App.jsx`, `axios`, `Redux`).
2.  **Thêm Interceptor:** Cài đặt Response Interceptor trong `axios.customize.js` để bắt lỗi 401 và thực hiện logout.
3.  **Persist Auth State:** Cập nhật logic khởi tạo Redux store để đọc trạng thái ban đầu từ `localStorage` (hoặc dùng `redux-persist`), đảm bảo F5 không bị logout.

### Giai đoạn 2: Refactor & Clean up
1.  **Xóa Dead Code:** Xóa 30 file không sử dụng và các dependency thừa.
2.  **Sửa đường dẫn Import:** Fix lỗi `/src/` thành `@/` hoặc relative path.
3.  **React 19 Compatibility:** Cân nhắc thay thế `reactstrap`/`react-popper` bằng phiên bản tương thích hoặc giải pháp khác nếu lỗi runtime xảy ra (hiện tại build vẫn chạy được).

### Giai đoạn 3: Tối ưu Hiệu năng
1.  **Code Splitting:** Áp dụng `React.lazy` và `Suspense` cho các routes trong `App.jsx`.
2.  **Optimize Assets:** Loại bỏ các bộ icon không dùng, chỉ import những gì cần thiết. Tách file CSS lớn.

---
*Báo cáo được tạo tự động bởi Jules.*
