# FE Data Labeling Support System

Frontend React + Vite cho hệ thống Data Labeling Support System.

## Stack
* React 19
* Vite 6
* Redux Toolkit
* React Router
* Axios
* SignalR

## Local Development
1. Cài dependencies:

```bash
npm install
```

2. Dùng file env local:

```bash
cp .env.example .env.development
```

3. Chạy app:

```bash
npm run dev
```

Frontend mặc định gọi backend local tại `https://localhost:7025`.

## Frontend Environment Variables
Các biến môi trường quan trọng:

* `VITE_BACKEND_URL`
  URL public của backend API. Ví dụ `https://your-backend.up.railway.app`

* `VITE_SIGNALR_URL`
  URL base cho SignalR. Thường để giống `VITE_BACKEND_URL`

* `VITE_CLOUDINARY_CLOUD_NAME`
  Cloud name cho upload ảnh mẫu / ảnh nhãn

* `VITE_CLOUDINARY_UPLOAD_PRESET`
  Unsigned upload preset cho Cloudinary

## Production Checklist
Khi deploy frontend lên Vercel hoặc host khác:

1. Set `VITE_BACKEND_URL` thành domain backend Railway.
2. Set `VITE_SIGNALR_URL` thành cùng domain backend Railway.
3. Trên backend, set `Cors__AllowedOrigins` chứa domain frontend production.
4. Set đủ 2 biến Cloudinary nếu frontend có upload ảnh trực tiếp.
5. Build lại frontend sau khi cập nhật env.
6. Kiểm tra các luồng sau:
    Login
    Avatar
    Notifications realtime
    Upload dataset / label example images

## Vercel + Railway
Nếu frontend lên Vercel và backend lên Railway:

* `VITE_BACKEND_URL=https://your-backend.up.railway.app`
* `VITE_SIGNALR_URL=https://your-backend.up.railway.app`
* Backend `Cors__AllowedOrigins=https://data-labeling-support-system.vercel.app`

File `vercel.json` đã có rewrite cho SPA routing.

## Build
```bash
npm run build
```

## Test
```bash
npm run test
```
