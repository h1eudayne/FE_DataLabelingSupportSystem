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
                    src="data:image/jpeg;base64,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" // Base64 của bạn
                    alt="user-profile"
                    className="img-thumbnail rounded-circle shadow-sm"
                    style={{
                      width: "160px",
                      height: "160px",
                      objectFit: "cover",
                      border: "4px solid var(--vz-card-bg-custom)", // Tạo viền trắng dày cho sang trọng
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
                      <Button onClick={onEditProfile}>Change Profile</Button>
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
