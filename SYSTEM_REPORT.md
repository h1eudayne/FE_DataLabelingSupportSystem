# Báo cáo Kiểm tra Hệ thống (System Health Report)

## 1. Tổng quan
- **Trạng thái Build**: ✅ Thành công (Warning: Bundle size quá lớn)
- **Trạng thái Test**: ❌ Thất bại (13/62 tests failed)
- **Chất lượng Code (Lint)**: ❌ 3 Lỗi nghiêm trọng, 1 Cảnh báo

## 2. Các sai sót chi tiết

### A. Lỗi Logic Nghiêm trọng (Lint Errors)
Các lỗi này có thể gây treo trình duyệt (infinite loop) hoặc giảm hiệu năng nghiêm trọng:
1.  **`src/components/admin/managementUser/UserModal.jsx`**: Gọi `setFormData` trực tiếp trong `useEffect` mà không có điều kiện kiểm soát chặt chẽ.
2.  **`src/page/admin/SettingUserManagement.jsx`**: Gọi `fetchUsers` (gây setState) trong `useEffect`.
3.  **`src/page/annotator/dashboard/AnnotatorDashboard.jsx`**: Gọi `setProjectId` trong `useEffect` khi dependency thay đổi liên tục.

### B. Lỗi Kiểm thử (Test Failures)
Hệ thống Test đang kiểm tra sai ngôn ngữ so với giao diện thực tế:
1.  **Sai lệch ngôn ngữ**: Test đang tìm các chuỗi tiếng Anh ("Enter email", "Sign In", "Welcome back") trong khi giao diện sử dụng tiếng Việt ("Đăng nhập", "Chào mừng trở lại").
    - File ảnh hưởng: `LoginPage.test.jsx`, `App.test.jsx`.
2.  **Lỗi tương tác (Act Warning)**: Test `Header.test.jsx` thực hiện update state mà không bọc trong `act(...)`, gây flaky test.
3.  **Lỗi Selector**: `MainLayouts.test.jsx` không tìm thấy phần tử `#topnav-hamburger-icon`.

### C. Vấn đề Kiến trúc & Hiệu năng
1.  **Bundle Size quá lớn**: File JS chính (`index.js`) nặng **2.2MB**, CSS nặng **1.3MB**. Điều này làm chậm tốc độ tải trang ban đầu.
2.  **Lỗi cú pháp tại `src/main.jsx`**: Có dấu phẩy thừa `,` sau thẻ `</BrowserRouter>`, có thể gây lỗi runtime hoặc warning không đáng có.
3.  **Xử lý API (`src/services/axios.customize.js`)**:
    - Chỉ có `request interceptor` (gửi token).
    - **Thiếu `response interceptor`**: Không tự động xử lý khi Token hết hạn (Lỗi 401) để logout hoặc refresh token.
4.  **Kiểm tra đăng nhập (`src/App.jsx`)**:
    - Code: `const isLoggedIn = !!localStorage.getItem("accessToken");`
    - Vấn đề: Kiểm tra đồng bộ mỗi lần render. Nếu token giả mạo hoặc hết hạn nhưng vẫn còn trong localStorage, user vẫn vào được (dù API sẽ chặn sau đó, nhưng UX kém).

## 3. Đề xuất chỉnh sửa (Action Plan)

### Bước 1: Sửa lỗi Critical (Ưu tiên cao nhất)
- [ ] Xóa dấu phẩy thừa trong `src/main.jsx`.
- [ ] Refactor lại logic `useEffect` trong 3 file bị lỗi Lint để tránh re-render loop.

### Bước 2: Cập nhật Test Suite
- [ ] Cập nhật toàn bộ file test (`LoginPage.test.jsx`, `App.test.jsx`) để sử dụng text tiếng Việt khớp với UI.
- [ ] Thêm `act()` cho các test case trong `Header.test.jsx`.

### Bước 3: Tối ưu hóa & Kiến trúc
- [ ] **Code Splitting**: Sử dụng `React.lazy` và `Suspense` trong `src/App.jsx` để chia nhỏ bundle, giảm tải ban đầu.
- [ ] **API Security**: Thêm `instance.interceptors.response` vào `axios.customize.js` để catch lỗi 401 và redirect về trang login.

### Bước 4: Clean Code
- [ ] Xóa các file CSS import thừa thãi trong `App.jsx` nếu đã có trong `main.jsx`.
- [ ] Chuyển các hardcoded string sang file Constant hoặc file ngôn ngữ (i18n) nếu dự án có kế hoạch mở rộng.
