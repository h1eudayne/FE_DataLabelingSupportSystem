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
import { useTranslation } from "react-i18next";
import { resolveBackendAssetUrl } from "../../config/runtime";

const ProfileTable = ({ userSelf, onEditProfile, onChangePass }) => {
  const { t } = useTranslation();
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
      alert(t('profileComp.fillPasswordAlert'));
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      alert(t('profileComp.passwordMismatch'));
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
              <h4 className="mb-sm-0">{t('profileComp.profileTitle')}</h4>
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
                        ? resolveBackendAssetUrl(userSelf.avatarUrl)
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
                      <Nav.Link eventKey="info">{t('profileComp.generalInfo')}</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="security">{t('profileComp.security')}</Nav.Link>
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
                        {t('profileComp.changeInfo')}
                      </Button>
                    </Tab.Pane>
                    <Tab.Pane eventKey="security">
                      <div className="mb-4">
                        <h5 className="card-title mb-1">{t('profileComp.changePassword')}</h5>
                        <p className="text-muted">
                          {t('profileComp.passwordSafety')}
                        </p>
                      </div>

                      <Form>
                        <Row className="g-3">
                          <Col lg={12}>
                            <Form.Group>
                              <Form.Label htmlFor="oldpasswordInput">
                                {t('profileComp.currentPassword')}
                              </Form.Label>
                              <Form.Control
                                type="password"
                                id="oldpasswordInput"
                                placeholder={t('profileComp.currentPasswordPlaceholder')}
                                onChange={handleChange}
                                value={formData.oldPassword}
                              />
                            </Form.Group>
                          </Col>

                          <Col lg={6}>
                            <Form.Group>
                              <Form.Label htmlFor="newpasswordInput">
                                {t('profileComp.newPassword')}
                              </Form.Label>
                              <Form.Control
                                type="password"
                                id="newpasswordInput"
                                placeholder={t('profileComp.newPasswordPlaceholder')}
                                onChange={handleChange}
                                value={formData.newPassword}
                              />
                            </Form.Group>
                          </Col>

                          <Col lg={6}>
                            <Form.Group>
                              <Form.Label htmlFor="confirmpasswordInput">
                                {t('profileComp.confirmNewPassword')}
                              </Form.Label>
                              <Form.Control
                                type="password"
                                id="confirmpasswordInput"
                                placeholder={t('profileComp.confirmNewPasswordPlaceholder')}
                                onChange={handleChange}
                                value={formData.confirmPassword}
                              />
                            </Form.Group>
                          </Col>

                          <Col lg={12}>
                            <div className="mt-2">
                              <p className="fw-semibold text-muted mb-2">
                                {t('profileComp.passwordReq')}
                              </p>
                              <ul
                                className="text-muted ps-4 mb-0"
                                style={{ fontSize: "13px" }}
                              >
                                <li>{t('profileComp.minChars')}</li>
                                <li>{t('profileComp.upperCase')}</li>
                                <li>{t('profileComp.specialChar')}</li>
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
                                {t('profileComp.updatePassword')}
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
