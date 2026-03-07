import { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Nav,
  Tab,
  Button,
  Form,
} from "react-bootstrap";
import { BACKEND_URL } from "../../services/axios.customize";

const ProfileTable = ({ userSelf, onEditProfile, onChangePass }) => {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    const fieldData = {
      oldpasswordInput: "oldPassword",
      newpasswordInput: "newPassword",
      confirmpasswordInput: "confirmPassword",
    };
    setFormData({ ...formData, [fieldData[id]]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.oldPassword || !formData.newPassword) {
      alert("Vui lòng nhập đầy đủ mật khẩu!");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      alert("Mật khẩu mới và xác nhận mật khẩu không khớp!");
      return;
    }
    onChangePass(formData.oldPassword, formData.newPassword);
    setFormData({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };
  return (
    <div className="page-content">
      <Container fluid>
        <Row>
          <Col xs={12}>
            <div className="page-title-box d-sm-flex align-items-center justify-content-between">
              <h4 className="mb-sm-0">Hồ sơ cá nhân</h4>
            </div>
          </Col>
        </Row>

        <Row>
          <Col lg={4}>
            <Card>
              <Card.Body className="text-center">
                <div className="avatar-xl">
                  <img
                    src={
                      userSelf.avatarUrl
                        ? userSelf.avatarUrl.startsWith("http") ||
                          userSelf.avatarUrl.startsWith("blob:")
                          ? userSelf.avatarUrl
                          : `${BACKEND_URL}${userSelf.avatarUrl.startsWith("/") ? "" : "/"}${userSelf.avatarUrl}`
                        : `https://api.dicebear.com/7.x/avataaars/svg?seed=${userSelf?.email}`
                    }
                    alt="user-profile"
                    className="img-thumbnail rounded-circle shadow-sm"
                    style={{
                      width: "160px",
                      height: "160px",
                      objectFit: "cover",
                      border: "4px solid var(--vz-card-bg-custom)",
                    }}
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={8}>
            <Card>
              <Card.Body>
                <Tab.Container defaultActiveKey="info">
                  <Nav
                    variant="tabs"
                    className="nav-tabs-custom nav-success mb-3"
                  >
                    <Nav.Item>
                      <Nav.Link eventKey="info">Thông tin chung</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="security">Bảo mật</Nav.Link>
                    </Nav.Item>
                  </Nav>
                  <Tab.Content>
                    <Tab.Pane eventKey="info">
                      <p className="text-muted">
                        FullName: {userSelf.fullName}
                      </p>
                      <p className="text-muted">Email: {userSelf.email}</p>
                      <p className="text-muted">Role: {userSelf.role}</p>
                      <Button onClick={onEditProfile}>
                        Thay đổi thông tin
                      </Button>
                    </Tab.Pane>
                    <Tab.Pane eventKey="security">
                      <div className="mb-4">
                        <h5 className="card-title mb-1">Thay đổi mật khẩu</h5>
                        <p className="text-muted">
                          Để đảm bảo an toàn, vui lòng không chia sẻ mật khẩu
                          với người khác.
                        </p>
                      </div>

                      <Form>
                        <Row className="g-3">
                          <Col lg={12}>
                            <Form.Group>
                              <Form.Label htmlFor="oldpasswordInput">
                                Mật khẩu hiện tại
                              </Form.Label>
                              <Form.Control
                                type="password"
                                id="oldpasswordInput"
                                placeholder="Nhập mật khẩu hiện tại"
                                onChange={handleChange}
                                value={formData.oldPassword}
                              />
                            </Form.Group>
                          </Col>

                          <Col lg={6}>
                            <Form.Group>
                              <Form.Label htmlFor="newpasswordInput">
                                Mật khẩu mới
                              </Form.Label>
                              <Form.Control
                                type="password"
                                id="newpasswordInput"
                                placeholder="Nhập mật khẩu mới"
                                onChange={handleChange}
                                value={formData.newPassword}
                              />
                            </Form.Group>
                          </Col>

                          <Col lg={6}>
                            <Form.Group>
                              <Form.Label htmlFor="confirmpasswordInput">
                                Xác nhận mật khẩu mới
                              </Form.Label>
                              <Form.Control
                                type="password"
                                id="confirmpasswordInput"
                                placeholder="Xác nhận mật khẩu mới"
                                onChange={handleChange}
                                value={formData.confirmPassword}
                              />
                            </Form.Group>
                          </Col>

                          <Col lg={12}>
                            <div className="mt-2">
                              <p className="fw-semibold text-muted mb-2">
                                Yêu cầu mật khẩu:
                              </p>
                              <ul
                                className="text-muted ps-4 mb-0"
                                style={{ fontSize: "13px" }}
                              >
                                <li>Ít nhất 8 ký tự</li>
                                <li>Ít nhất 1 chữ cái viết hoa (A-Z)</li>
                                <li>Ít nhất 1 số và 1 ký tự đặc biệt</li>
                              </ul>
                            </div>
                          </Col>

                          <Col lg={12} className="mt-4">
                            <div className="text-end">
                              <Button
                                variant="success"
                                type="submit"
                                onClick={handleSubmit}
                              >
                                Cập nhật mật khẩu
                              </Button>
                            </div>
                          </Col>
                        </Row>
                      </Form>
                    </Tab.Pane>
                  </Tab.Content>
                </Tab.Container>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ProfileTable;
