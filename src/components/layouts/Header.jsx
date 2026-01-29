import React, { useState, useEffect } from "react";
import { Container, Dropdown, Form, InputGroup, Button } from "react-bootstrap";
import {
  LogOut,
  User,
  Settings,
  Bell,
  Menu,
  Maximize,
  Minimize,
  Search,
  ChevronRight,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/auth/auth.slice";

const Header = ({ toggleSidebar, sidebarSize }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); // State cho Theme

  const [currentLang, setCurrentLang] = useState({
    code: "vi",
    flag: "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.4.3/flags/4x3/vn.svg",
    name: "Tiếng Việt",
  });

  // Xử lý chuyển đổi Theme
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // Bạn có thể thêm logic lưu vào localStorage hoặc thay đổi thuộc tính data-theme ở đây
    // document.documentElement.setAttribute('data-theme', isDarkMode ? 'light' : 'dark');
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      dispatch(logout());
      navigate("/", { replace: true });
    }
  };

  const popperConfig = {
    modifiers: [{ name: "offset", options: { offset: [0, 25] } }],
  };

  return (
    <>
      <style>{`
        .hide-extra-icon::after, .hide-extra-icon::before { display: none !important; content: none !important; }
        .no-caret::after { display: none !important; }

        .custom-toggle-btn {
          background-color: #f5f7ff !important;
          border-radius: 10px !important;
          transition: all 0.3s ease !important;
        }
        .custom-toggle-btn:hover { background-color: #4e73df !important; transform: rotate(90deg); }
        .custom-toggle-btn:hover .toggle-icon { color: white !important; }

        .dropdown-menu-animated {
          display: block !important; visibility: hidden; opacity: 0;
          transform: translateY(10px); transition: all 0.25s ease;
        }
        .dropdown-menu-animated.show { visibility: visible; opacity: 1; transform: translateY(0); }

        .theme-toggle-btn:hover { background-color: #f8f9fa !important; color: #4e73df !important; }
        
        .avatar-wrapper { position: relative; }
        .status-indicator {
          position: absolute; bottom: 0; right: 0;
          width: 10px; height: 10px; background-color: #22c55e;
          border: 2px solid #fff; border-radius: 50%;
        }

        .dropdown-item { margin: 0 8px; width: calc(100% - 16px); border-radius: 6px; transition: 0.2s ease; }
        .dropdown-item:hover { background-color: #f4f6ff !important; color: #4e73df !important; transform: translateX(4px); }

        .pulse-animation { animation: pulse 2s infinite; }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(220, 53, 69, 0); }
          100% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0); }
        }
      `}</style>

      <header
        className="border-bottom shadow-sm position-fixed top-0 end-0 bg-white"
        style={{
          zIndex: 1001,
          height: "70px",
          left: sidebarSize === "lg" ? "250px" : "70px",
          width: `calc(100% - ${sidebarSize === "lg" ? "250px" : "70px"})`,
          transition: "all 0.3s ease-in-out",
        }}
      >
        <Container fluid className="h-100 px-4">
          <div className="d-flex justify-content-between align-items-center h-100">
            <div className="d-flex align-items-center gap-3">
              <Button
                onClick={toggleSidebar}
                variant="light"
                className="d-flex align-items-center justify-content-center p-0 border-0 custom-toggle-btn shadow-none"
                style={{ width: "40px", height: "40px" }}
              >
                {sidebarSize === "sm" ? (
                  <ChevronRight
                    size={20}
                    className="toggle-icon text-primary"
                  />
                ) : (
                  <Menu size={20} className="toggle-icon text-primary" />
                )}
              </Button>

              <Form className="d-none d-md-block ms-2">
                <InputGroup
                  size="sm"
                  className="bg-light rounded-pill px-3 py-1 border-0"
                >
                  <Search size={16} className="text-muted me-2" />
                  <Form.Control
                    className="bg-transparent border-0 shadow-none p-0"
                    placeholder="Tìm kiếm..."
                    style={{ width: "180px" }}
                  />
                </InputGroup>
              </Form>
            </div>

            <div className="d-flex align-items-center gap-2">
              {/* NÚT CHỈNH THEME (Mặt trời/Mặt trăng) */}
              <Button
                variant="light"
                className="bg-transparent border-0 p-2 shadow-none rounded-circle theme-toggle-btn"
                onClick={toggleTheme}
              >
                {isDarkMode ? (
                  <Sun size={20} className="text-warning" fill="currentColor" />
                ) : (
                  <Moon size={20} className="text-muted" fill="none" />
                )}
              </Button>

              <Button
                variant="light"
                className="bg-transparent border-0 p-2 shadow-none rounded-circle"
                onClick={handleFullscreen}
              >
                {isFullscreen ? (
                  <Minimize size={20} className="text-muted" />
                ) : (
                  <Maximize size={20} className="text-muted" />
                )}
              </Button>

              {/* NGÔN NGỮ - Mũi tên nhỏ mảnh */}
              <Dropdown>
                <Dropdown.Toggle
                  variant="light"
                  className="d-flex align-items-center gap-1 p-1 border-0 bg-transparent shadow-none hide-extra-icon"
                >
                  <img
                    src={currentLang.flag}
                    width="22"
                    className="rounded-1 shadow-sm"
                    alt="flag"
                  />
                  <ChevronDown
                    size={12}
                    className="text-muted"
                    strokeWidth={2}
                  />
                </Dropdown.Toggle>
                <Dropdown.Menu
                  align="end"
                  className="shadow-lg border-0 dropdown-menu-animated"
                  popperConfig={popperConfig}
                >
                  <Dropdown.Item
                    onClick={() =>
                      setCurrentLang({
                        code: "vi",
                        name: "Tiếng Việt",
                        flag: "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.4.3/flags/4x3/vn.svg",
                      })
                    }
                    className="d-flex align-items-center gap-2 py-2"
                  >
                    <img
                      src="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.4.3/flags/4x3/vn.svg"
                      width="20"
                      alt="VN"
                    />{" "}
                    Tiếng Việt
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() =>
                      setCurrentLang({
                        code: "en",
                        name: "English",
                        flag: "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.4.3/flags/4x3/us.svg",
                      })
                    }
                    className="d-flex align-items-center gap-2 py-2"
                  >
                    <img
                      src="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.4.3/flags/4x3/us.svg"
                      width="20"
                      alt="US"
                    />{" "}
                    English
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

              <Button
                variant="light"
                className="bg-transparent border-0 p-2 position-relative shadow-none rounded-circle"
              >
                <Bell size={20} className="text-muted" />
                <span
                  className="position-absolute top-2 end-2 bg-danger rounded-circle border border-white pulse-animation"
                  style={{ width: "8px", height: "8px" }}
                ></span>
              </Button>

              <div
                className="vr mx-2 opacity-10 d-none d-md-block"
                style={{ height: "20px" }}
              ></div>

              {/* USER PROFILE - Mũi tên to đậm */}
              {isAuthenticated && user && (
                <Dropdown align="end">
                  <Dropdown.Toggle
                    variant="none"
                    className="p-0 border-0 shadow-none d-flex align-items-center gap-2 no-caret"
                  >
                    <div className="avatar-wrapper">
                      <img
                        src={
                          user?.avatar ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`
                        }
                        className="rounded-circle shadow-sm border border-2 border-white"
                        width="36"
                        height="36"
                        alt="avatar"
                      />
                      <span className="status-indicator"></span>
                    </div>
                    <div className="d-none d-lg-block text-start">
                      <div className="fw-bold text-dark small lh-1 mb-1">
                        {user?.name || "Người dùng"}
                      </div>
                      <small
                        className="text-muted"
                        style={{ fontSize: "10px" }}
                      >
                        {user?.role || "Annotator"}
                      </small>
                    </div>
                    <ChevronDown
                      size={14}
                      className="text-muted ms-1"
                      strokeWidth={3}
                    />
                  </Dropdown.Toggle>
                  <Dropdown.Menu
                    align="end"
                    className="shadow-lg border-0 py-2 dropdown-menu-animated"
                    style={{
                      borderRadius: "12px",
                      minWidth: "210px",
                      marginTop: "15px",
                    }}
                    popperConfig={popperConfig}
                  >
                    <div className="px-3 py-2 border-bottom mb-2">
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "10px" }}
                      >
                        Tài khoản:
                      </small>
                      <div className="fw-bold text-primary small">
                        {user?.email || "staff1@gmail.com"}
                      </div>
                    </div>
                    <Dropdown.Item
                      as={Link}
                      to="/profile"
                      className="py-2 px-3 d-flex align-items-center gap-2"
                    >
                      <User size={16} /> Hồ sơ cá nhân
                    </Dropdown.Item>
                    <Dropdown.Item
                      as={Link}
                      to="/settings"
                      className="py-2 px-3 d-flex align-items-center gap-2"
                    >
                      <Settings size={16} /> Cài đặt hệ thống
                    </Dropdown.Item>
                    <Dropdown.Divider className="mx-3" />
                    <Dropdown.Item
                      onClick={handleLogout}
                      className="py-2 px-3 text-danger fw-bold d-flex align-items-center gap-2"
                    >
                      <LogOut size={16} /> Đăng xuất
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              )}
            </div>
          </div>
        </Container>
      </header>
    </>
  );
};

export default Header;
