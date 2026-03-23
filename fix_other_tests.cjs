const fs = require('fs');

function applyRegexReplace(filePath, pattern, replacement) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        content = content.replace(pattern, replacement);
        fs.writeFileSync(filePath, content, 'utf8');
    } catch (e) {
        console.log(`Failed to apply to ${filePath}: ${e.message}`);
    }
}

// Header.test.jsx
applyRegexReplace('src/components/layouts/Header.test.jsx',
  /vi\.mock\("react-i18next", \(\) => \(\{\n\s*useTranslation: \(\) => \(\{\n\s*t: \(key\) => key,\n\s*i18n: \{ changeLanguage: vi\.fn\(\) \},\n\s*\}\),\n\}\)\);/,
  ''); // Add if missing or replace
applyRegexReplace('src/components/layouts/Header.test.jsx',
  /import \{ describe, it, expect, vi \} from "vitest";/g,
  'import { describe, it, expect, vi } from "vitest";\nvi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key) => key, i18n: { changeLanguage: vi.fn() } }) }));');

// AuthRightHeader.test.jsx
applyRegexReplace('src/components/auth/auth-right/AuthRightHeader.test.jsx',
  /Chào mừng trở lại/g, 'auth.welcomeBack');
applyRegexReplace('src/components/auth/auth-right/AuthRightHeader.test.jsx',
  /Đăng nhập để tiếp tục với AILABEL/g, 'auth.loginToContinue');

// AuthRight.test.jsx
applyRegexReplace('src/components/auth/auth-right/AuthRight.test.jsx',
  /Chào mừng trở lại/g, 'auth.welcomeBack');
applyRegexReplace('src/components/auth/auth-right/AuthRight.test.jsx',
  /Đăng nhập/g, 'auth.loginBtn');

// AuthRegisterLink.test.jsx
applyRegexReplace('src/components/auth/auth-right/AuthRegisterLink.test.jsx',
  /Chưa có tài khoản\?/g, 'auth.noAccount');
applyRegexReplace('src/components/auth/auth-right/AuthRegisterLink.test.jsx',
  /Đăng ký ngay/g, 'auth.register');

// AuthLoginForm.test.jsx
applyRegexReplace('src/components/auth/auth-right/AuthLoginForm.test.jsx',
  /Nhập email/g, 'auth.emailPlaceholder');
// wait, the test fails at 'Nhập email'. The screen outputs 'auth.emailPlaceholder' as placeholder
applyRegexReplace('src/components/auth/auth-right/AuthLoginForm.test.jsx',
  /const emailInput = screen\.getByPlaceholderText\("Nhập email"\);/,
  'const emailInput = screen.getByPlaceholderText("auth.emailPlaceholder");');

// FeaturesSection.test.jsx
applyRegexReplace('src/components/landing/FeaturesSection.test.jsx',
  /Tổ chức dự án/g, 'landing.managerDesc');
// check other occurrences
let featContent = fs.readFileSync('src/components/landing/FeaturesSection.test.jsx', 'utf8');
featContent = featContent.replace(/Kiểm duyệt nhãn/g, 'landing.reviewerDesc');
featContent = featContent.replace(/Công cụ gán nhãn/g, 'landing.annotatorDesc');
fs.writeFileSync('src/components/landing/FeaturesSection.test.jsx', featContent, 'utf8');

// DashboardLayout.test.jsx
let dashboardTest = fs.readFileSync('src/components/layouts/DashboardLayout.test.jsx', 'utf8');
if(!dashboardTest.includes('react-i18next')) {
  dashboardTest = dashboardTest.replace(/import \{ describe, it, expect \} from "vitest";/, 'import { describe, it, expect, vi } from "vitest";\nvi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key) => key, i18n: { changeLanguage: vi.fn() } }) }));');
  fs.writeFileSync('src/components/layouts/DashboardLayout.test.jsx', dashboardTest, 'utf8');
}

// App.test.jsx
let appTest = fs.readFileSync('src/App.test.jsx', 'utf8');
appTest = appTest.replace(/Anna/g, 'header.user'); // Admin name test
fs.writeFileSync('src/App.test.jsx', appTest, 'utf8');
