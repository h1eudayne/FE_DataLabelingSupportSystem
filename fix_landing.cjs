const fs = require('fs');

let test1 = fs.readFileSync('src/container/LandingContainer.test.jsx', 'utf8');
test1 = test1.replace(/Đăng nhập/g, 'landing.login');
test1 = test1.replace(/Bắt đầu ngay/g, 'landing.getStarted');
test1 = test1.replace(/Số hóa dữ liệu/g, 'landing.heroTitle1');
test1 = test1.replace(/Thông minh & Hiệu quả/g, 'landing.heroTitle2');
test1 = test1.replace(/Giải pháp cho mọi vai trò/g, 'landing.featuresTitle');
fs.writeFileSync('src/container/LandingContainer.test.jsx', test1, 'utf8');
