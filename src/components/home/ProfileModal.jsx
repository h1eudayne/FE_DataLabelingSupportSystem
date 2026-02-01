import { useEffect, useState } from "react";
import { Modal, Form, Row, Col, Button, Badge } from "react-bootstrap";

const ProfileModal = ({ toggleModal, userSelf, isOpen, handleSave }) => {
  const [formData, setFormData] = useState({
    fullName: null,
    avatarUrl: null,
  });

  useEffect(() => {
    if (
      userSelf &&
      userSelf.fullName !== formData.fullName &&
      userSelf.avatarUrl !== formData.avatarUrl
    ) {
      setFormData({
        fullName: userSelf.fullName,
        avatarUrl: userSelf.avatarUrl,
      });
    }
  }, [userSelf]);

  const handleChange = (e) => {
    setFormData({ fullName: e.target.value });
  };
  return (
    <>
      <Modal show={isOpen} onHide={toggleModal} centered size="lg">
        <Modal.Header closeButton className="bg-light p-3">
          <Modal.Title className="fs-18">Chỉnh sửa hồ sơ cá nhân</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Row className="g-3">
              <Col lg={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Họ và tên</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nhập họ tên đầy đủ"
                    defaultValue={userSelf.fullName}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col lg={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Địa chỉ Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={userSelf.email}
                    disabled
                    className="bg-light"
                  />
                  <Form.Text className="text-muted">
                    Email không thể thay đổi.
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col lg={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    Vai trò hệ thống
                  </Form.Label>
                  <Badge
                    bg="soft-primary"
                    className="text-primary d-block p-2 fs-13"
                    style={{ textAlign: "left" }}
                  >
                    <i className="ri-shield-user-line me-1"></i> {userSelf.role}
                  </Badge>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="light" onClick={toggleModal}>
            Hủy bỏ
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              handleSave(formData.fullName, formData.avatarUrl);
              toggleModal();
            }}
          >
            Lưu thay đổi
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ProfileModal;
