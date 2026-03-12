# Báo cáo Kiểm tra Hệ thống (System Audit Report)

Ngày kiểm tra: 24/02/2025
Người thực hiện: Jules (AI Assistant)

## 1. 🚨 Sai sót Logic Nghiêm trọng (Critical Errors)
Các lỗi này ảnh hưởng trực tiếp đến luồng hoạt động chính của ứng dụng.

*   **Không đồng nhất Key lưu Token (Token Key Inconsistency)**
    *   **Mô tả:** `App.jsx` kiểm tra `localStorage.getItem("accessToken")`, trong khi `auth.thunk.js` và `axios.customize.js` sử dụng `access_token`.
    *   **Hậu quả:** Người dùng đăng nhập thành công nhưng ứng dụng vẫn coi là chưa đăng nhập và chuyển hướng về trang Login.
    *   **File ảnh hưởng:** `src/App.jsx`, `src/store/auth/auth.slice.js`, `src/utils/axios.customize.js`.

*   **Mất trạng thái đăng nhập khi tải lại trang (Persist State Issue)**
    *   **Mô tả:** `auth.thunk.js` không thực hiện lưu token vào `localStorage` sau khi nhận phản hồi từ API. Redux store bị reset khi F5 và không có cơ chế khôi phục lại từ localStorage.
    *   **Hậu quả:** Người dùng bị đăng xuất mỗi khi refresh trang.
    *   **File ảnh hưởng:** `src/store/auth/auth.thunk.js`, `src/routes/RoleProtectedRoute.jsx`.

*   **Đường dẫn Import tuyệt đối sai (Incorrect Absolute Imports)**
    *   **Mô tả:** Sử dụng đường dẫn bắt đầu bằng `/src/...` (Ví dụ: `import ... from "/src/services/..."`).
    *   **Hậu quả:** Gây lỗi khi chạy Unit Test (Vitest) và tiềm ẩn lỗi build trên một số môi trường CI/CD.
    *   **File ảnh hưởng:** `src/services/annotator/dashboard/annotator.api.js` và các file API khác.

*   **Thiếu xử lý lỗi 401 (Missing 401 Interceptor)**
    *   **Mô tả:** Axios chưa cấu hình Response Interceptor để tự động logout khi nhận mã lỗi 401 (Unauthorized).
    *   **File ảnh hưởng:** `src/services/axios.customize.js`.

## 2. ⚠️ Lỗi Code & Anti-Patterns (React 19)
*   **Anti-pattern: SetState trong UseEffect**
    *   **Mô tả:** Gọi `setState` trực tiếp trong `useEffect` mà không có điều kiện chặn tối ưu, gây re-render không cần thiết.
    *   **File ảnh hưởng:**
        *   `src/components/admin/managementUser/UserModal.jsx`
        *   `src/components/home/ProfileModal.jsx`
        *   `src/container/AdminContainer.jsx`
        *   `src/container/ProfileContainer.jsx`
        *   `src/page/admin/SettingUserManagement.jsx`
        *   `src/page/annotator/dashboard/AnnotatorDashboard.jsx`

*   **Unit Test Thất bại**
    *   **Số lượng:** 6 test case failed.
    *   **Nguyên nhân:** Do lỗi logic Auth (không lưu token) và Component Header không tìm thấy dữ liệu user.

## 3. 🐢 Hiệu năng & Build (Performance)
*   **Bundle Size quá lớn**
    *   `index.js`: ~1.6MB
    *   `index.css`: ~1.3MB
    *   **Nguyên nhân:** Load toàn bộ các bộ icon (RemixIcon, BoxIcons, MDI) thay vì tree-shaking hoặc dynamic import.
*   **Mã thừa (Dead Code)**
    *   **30 file không sử dụng** (theo báo cáo Knip), bao gồm các file cũ như `Header.jsx`, `Sidebar.jsx`.
    *   **Unused Dependencies:** `tailwindcss`, `apexcharts`, `swiper`.

## 4. 🏛️ Đề xuất Chỉnh sửa (Proposal)

### Bước 1: Sửa lỗi Logic (Ưu tiên cao nhất)
1.  Đồng nhất toàn bộ project dùng key `access_token`.
2.  Thêm code `localStorage.setItem("access_token", token)` vào `auth.thunk.js`.
3.  Cập nhật `auth.slice.js` để khởi tạo state từ localStorage.
4.  Replace toàn bộ `/src/` thành relative path hoặc alias `@/`.
5.  Thêm Interceptor 401 cho Axios.

### Bước 2: Refactor Code
1.  Sửa các `useEffect` trong Modal (dùng `key` để reset form).
2.  Xóa các file và thư viện thừa.

### Bước 3: Tối ưu Build
1.  Cấu hình Vite `manualChunks`.
2.  Tối ưu hóa import Icon.
