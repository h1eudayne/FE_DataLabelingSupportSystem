const fs = require('fs');

let appTest = fs.readFileSync('src/App.test.jsx', 'utf8');
// Replace matches for i18n
appTest = appTest.replace(/\/Đăng nhập/g, '/auth.loginBtn');
appTest = appTest.replace(/\/Nhập tài khoản/g, '/auth.loginSubtitle');
appTest = appTest.replace(/\/Tìm kiếm\.\.\./g, '/header.searchPlaceholder');
fs.writeFileSync('src/App.test.jsx', appTest, 'utf8');

// The App test seems to be missing i18n translations mock. Or we can just mock useTranslation.
// It is better to use translation keys instead of hardcoded text as instructed by memories:
// "The application uses react-i18next for internationalization. UI test selectors must use translation keys (e.g., 'auth.welcomeBack', 'landing.login') rather than hardcoded text."
// So in App.test.jsx we should look for "landing.login" for Landing page login button.
// For the auth page, it's probably "auth.login".

appTest = fs.readFileSync('src/App.test.jsx', 'utf8');
appTest = appTest.replace(/\/auth\.loginBtn/g, '/landing.login|auth.loginBtn/');
fs.writeFileSync('src/App.test.jsx', appTest, 'utf8');
