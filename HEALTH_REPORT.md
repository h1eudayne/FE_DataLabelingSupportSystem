# Báo cáo Kiểm tra Sức khỏe Dự án (Project Health Check Report)

## 1. Tổng quan (Overview)
- **Cấu trúc:** React + Vite + Redux Toolkit.
- **Trạng thái Test:** ✅ 151/151 test case đã vượt qua (Vitest).
- **Trạng thái Build:** ✅ Build thành công.

## 2. Vấn đề Nghiêm trọng (Critical Issues) 🚨
### 2.1. Không đồng nhất Key Token
- **Mô tả:** Có sự không nhất quán trong việc lưu trữ và truy xuất token xác thực.
- **Chi tiết:**
  - `App.jsx` và `App.test.jsx` sử dụng key: **`accessToken`**.
  - Redux (`auth.thunk.js`, `auth.slice.js`) và `axios.customize.js` sử dụng key: **`access_token`**.
- **Hậu quả:** Người dùng có thể gặp lỗi đăng nhập, hoặc bị logout bất ngờ khi reload trang vì `App.jsx` không tìm thấy token đúng key.

### 2.2. Đường dẫn tuyệt đối sai
- **Mô tả:** Sử dụng đường dẫn tuyệt đối bắt đầu bằng `/src/` không đúng chuẩn.
- **File ảnh hưởng:**
  - `src/services/annotator/dashboard/annotator.api.js`
  - `src/services/annotator/labeling/taskService.js`
  - Và các file test tương ứng.
- **Hậu quả:** Gây lỗi module resolution trong một số môi trường (như Knip đã báo cáo).

## 3. Hiệu năng (Performance) ⚠️
- **Kích thước Bundle lớn:**
  - JS: ~1.62 MB (Vượt quá khuyến nghị 500kB).
  - CSS: ~1.29 MB.
- **Nguyên nhân:**
  - Import toàn bộ thư viện icon lớn (RemixIcon, BoxIcons, LineAwesome, MDI).
  - Font SVG/WOFF lớn được bundle trực tiếp.
  - Thiếu Code Splitting hiệu quả.

## 4. Chất lượng mã nguồn (Code Quality) 🛠️
### 4.1. Unused Code (Mã thừa)
- **30 file không sử dụng:** Bao gồm các component lớn như `AnnotatorDashboard`, `Header`, `Sidebar`.
- **Dependencies thừa:** `tailwindcss` (có thể do cấu hình sai hoặc không dùng), `apexcharts`, `swiper`.

### 4.2. Linting Issues
- **Lỗi phổ biến:** `setState` được gọi trực tiếp trong `useEffect` mà không có điều kiện hoặc sai logic, gây re-render liên tục.
- **File ảnh hưởng:** `UserModal.jsx`, `ProfileModal.jsx`, `AdminContainer.jsx`, v.v.

### 4.3. Test Warnings
- `act(...)` warning trong `Header.test.jsx`.
- Console error "Network Error" trong `cloudinaryService.test.js` (dù test pass, đây là log của lỗi được catch).

## 5. Khuyến nghị (Recommendations)
1. **Ưu tiên 1 (Critical):** Thống nhất toàn bộ key token trong dự án thành `access_token` để khớp với backend/redux.
2. **Ưu tiên 2 (Fix):** Sửa các import `/src/` thành đường dẫn tương đối (`../../`) hoặc alias (`@/`).
3. **Ưu tiên 3 (Clean):** Xóa các file code chết và dependencies không dùng để giảm nhiễu.
4. **Ưu tiên 4 (Optimize):** Cấu hình lại Vite để split chunks, và xem xét dynamic import cho các bộ icon lớn.
