import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        common: {
          login: "Login",
          register: "Register",
          logout: "Logout",
          home: "Home",
          dashboard: "Dashboard",
          settings: "Settings",
          profile: "Profile",
        },
        landing: {
          title: "Data Labeling Platform",
          subtitle: "The best platform for data labeling",
          getStarted: "Get Started",
          startFree: "Start Free",
        },
        auth: {
          welcomeBack: "Welcome Back",
          loginSubtitle: "Sign in to continue",
          dontHaveAccount: "Don't have an account?",
          alreadyHaveAccount: "Already have an account?",
        },
        nav: {
          management: "Management",
          reviewTask: "Review Task",
          userManagement: "User Management",
          workplace: "Workplace",
        },
        features: {
          title: "Features",
          subtitle: "Everything you need",
          managers: "Managers",
          reviewers: "Reviewers",
          annotators: "Annotators",
          managerDesc: "Create and manage labeling projects",
          reviewerDesc: "Quality assurance and review",
          annotatorDesc: "Label data efficiently",
        },
        cta: {
          title: "Ready to get started?",
          subtitle: "Join thousands of teams using our platform",
          startFree: "Start for free",
        },
      },
    },
    vi: {
      translation: {
        common: {
          login: "Đăng nhập",
          register: "Đăng ký",
          logout: "Đăng xuất",
          home: "Trang chủ",
          dashboard: "Bảng điều khiển",
          settings: "Cài đặt",
          profile: "Hồ sơ",
        },
        landing: {
          title: "Nền tảng gắn nhãn dữ liệu",
          subtitle: "Nền tảng tốt nhất để gắn nhãn dữ liệu",
          getStarted: "Bắt đầu ngay",
          startFree: "Dùng thử miễn phí",
        },
        auth: {
          welcomeBack: "Chào mừng trở lại",
          loginSubtitle: "Đăng nhập để tiếp tục",
          dontHaveAccount: "Chưa có tài khoản?",
          alreadyHaveAccount: "Đã có tài khoản?",
        },
        nav: {
          management: "Quản lý",
          reviewTask: "Duyệt Task",
          userManagement: "Quản lý User",
          workplace: "Nơi làm việc",
        },
        features: {
          title: "Tính năng",
          subtitle: "Mọi thứ bạn cần",
          managers: "Quản lý",
          reviewers: "Người duyệt",
          annotators: "Người gắn nhãn",
          managerDesc: "Tạo và quản lý dự án gắn nhãn",
          reviewerDesc: "Đảm bảo chất lượng và duyệt",
          annotatorDesc: "Gắn nhãn dữ liệu hiệu quả",
        },
        cta: {
          title: "Sẵn sàng để bắt đầu?",
          subtitle: "Tham gia cùng hàng nghìn đội ngũ đang sử dụng nền tảng",
          startFree: "Bắt đầu miễn phí",
        },
      },
    },
  },
  lng: "vi",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
