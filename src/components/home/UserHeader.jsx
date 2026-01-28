import React from "react";
import { Container, Badge, Dropdown } from "react-bootstrap";
import { LogOut, User, Settings, Bell } from "lucide-react";
import { useDispatch } from "react-redux";
import { logout } from "../../store/auth/auth.slice";

const UserHeader = ({ user, role }) => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      dispatch(logout());
    }
  };

  return (
    <div
      className="bg-white border-bottom shadow-sm mb-4 sticky-top"
      style={{ zIndex: 1020 }}
    >
      <Container fluid className="px-4 py-2">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <div
              className="fw-bold fs-4 text-primary"
              style={{ letterSpacing: "-1px" }}
            >
              AI<span className="text-dark">LABEL</span>
            </div>
            <div
              className="vr d-none d-md-block"
              style={{ height: "20px", opacity: 0.2 }}
            ></div>
            <Badge
              bg="primary"
              className="bg-opacity-10 text-primary px-3 py-2 text-uppercase"
            >
              {role || "Thành viên"}
            </Badge>
          </div>

          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-light rounded-circle p-2 position-relative">
              <Bell size={18} />
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                style={{ fontSize: "10px" }}
              >
                3
              </span>
            </button>

            <Dropdown align="end">
              <Dropdown.Toggle
                variant="link"
                className="p-0 border-0 shadow-none d-flex align-items-center gap-2 text-decoration-none"
              >
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
                  className="rounded-circle border border-2 border-primary border-opacity-25"
                  alt="avatar"
                  width="35"
                  height="35"
                />
                <div className="d-none d-lg-block text-start">
                  <div className="fw-bold text-dark small leading-none">
                    {user?.email?.split("@")[0]}
                  </div>
                  <div className="text-muted style={{ fontSize: '10px' }}">
                    Trực tuyến
                  </div>
                </div>
              </Dropdown.Toggle>

              <Dropdown.Menu className="shadow-lg border-0 rounded-3 mt-2">
                <Dropdown.Header>Tài khoản</Dropdown.Header>
                <Dropdown.Item
                  href="#/profile"
                  className="d-flex align-items-center gap-2 py-2"
                >
                  <User size={16} /> Hồ sơ cá nhân
                </Dropdown.Item>
                <Dropdown.Item
                  href="#/settings"
                  className="d-flex align-items-center gap-2 py-2"
                >
                  <Settings size={16} /> Cài đặt
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item
                  onClick={handleLogout}
                  className="d-flex align-items-center gap-2 py-2 text-danger"
                >
                  <LogOut size={16} /> Đăng xuất
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default UserHeader;
