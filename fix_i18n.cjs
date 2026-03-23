const fs = require('fs');

let appTest = fs.readFileSync('src/App.test.jsx', 'utf8');

// The reason App.test.jsx fails is it needs an i18next mock.
// Actually, it doesn't fail on i18next error, it fails on finding text. Wait, "Landing Container" passed but gave i18n warning.

if (!appTest.includes('react-i18next')) {
  appTest = appTest.replace(/vi\.mock\("@\/services\/axios\.customize"/, `vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { changeLanguage: vi.fn() },
  }),
}));

vi.mock("@/services/axios.customize"`);
}

// Since we mock i18n to return the key, `t("auth.loginBtn")` returns `"auth.loginBtn"`.
// So we should search for "auth.loginBtn" and "landing.login" etc.

fs.writeFileSync('src/App.test.jsx', appTest, 'utf8');
