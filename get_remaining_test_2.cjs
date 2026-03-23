const fs = require('fs');

let headerTest = fs.readFileSync('src/components/layouts/Header.test.jsx', 'utf8');
headerTest = headerTest.replace(/Nguyễn Văn A/g, 'header.user');
headerTest = headerTest.replace(/Đăng xuất/g, 'header.logout');
fs.writeFileSync('src/components/layouts/Header.test.jsx', headerTest, 'utf8');

let landingNavTest = fs.readFileSync('src/components/landing/LandingNavbar.test.jsx', 'utf8');
landingNavTest = landingNavTest.replace(/Đăng nhập/g, 'landing.login');
landingNavTest = landingNavTest.replace(/Bắt đầu ngay/g, 'landing.getStarted');
fs.writeFileSync('src/components/landing/LandingNavbar.test.jsx', landingNavTest, 'utf8');

let ctaSectionTest = fs.readFileSync('src/components/landing/CTASection.test.jsx', 'utf8');
ctaSectionTest = ctaSectionTest.replace(/Dùng thử miễn phí/g, 'landing.tryFree');
fs.writeFileSync('src/components/landing/CTASection.test.jsx', ctaSectionTest, 'utf8');

let featuresSectionTest = fs.readFileSync('src/components/landing/FeaturesSection.test.jsx', 'utf8');
featuresSectionTest = featuresSectionTest.replace(/Giải pháp cho mọi vai trò/g, 'landing.featuresTitle');
featuresSectionTest = featuresSectionTest.replace(/Tổ chức dự án/g, 'landing.managerDesc');
fs.writeFileSync('src/components/landing/FeaturesSection.test.jsx', featuresSectionTest, 'utf8');

let heroSectionTest = fs.readFileSync('src/components/landing/HeroSection.test.jsx', 'utf8');
heroSectionTest = heroSectionTest.replace(/Số hóa dữ liệu/g, 'landing.heroTitle1');
heroSectionTest = heroSectionTest.replace(/Bắt đầu ngay/g, 'landing.getStarted');
fs.writeFileSync('src/components/landing/HeroSection.test.jsx', heroSectionTest, 'utf8');

let authLeftTest = fs.readFileSync('src/components/auth/auth-left/AuthLeft.test.jsx', 'utf8');
authLeftTest = authLeftTest.replace(/Label data with/g, 'Label data with'); // it looks like authLeft text uses precision?
fs.writeFileSync('src/components/auth/auth-left/AuthLeft.test.jsx', authLeftTest, 'utf8');

let authRightTest = fs.readFileSync('src/components/auth/auth-right/AuthRight.test.jsx', 'utf8');
authRightTest = authRightTest.replace(/Label data with precision/g, 'Label data with authLeft.precision');
fs.writeFileSync('src/components/auth/auth-right/AuthRight.test.jsx', authRightTest, 'utf8');
