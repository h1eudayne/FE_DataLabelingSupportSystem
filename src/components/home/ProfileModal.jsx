import { useEffect, useState } from "react";
import { Modal, Form, Row, Col, Button, Badge } from "react-bootstrap";
import { BACKEND_URL } from "../../services/axios.customize";

const ProfileModal = ({ toggleModal, userSelf, isOpen, handleSave }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    avatarUrl: "",
  });
  const [selectFile, setSelectFile] = useState(null);

  useEffect(() => {
    if (userSelf && isOpen) {
      setFormData({
        fullName: userSelf.fullName || "",
        avatarUrl: userSelf.avatarUrl || "",
      });
      setSelectFile(null);
    }
  }, [userSelf, isOpen]);

  const handleChangeAvatar = (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectFile(null);
      return;
    }
    const file = e.target.files[0];
    if (file) {
      setSelectFile(file);
      const previewUrl = URL.createObjectURL(file);

      setFormData((prev) => ({ ...prev, avatarUrl: previewUrl }));
    }
  };

  const getAvatarDisplay = () => {
    if (!formData.avatarUrl)
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${userSelf?.email}`;

    if (
      formData.avatarUrl.startsWith("blob:") ||
      formData.avatarUrl.startsWith("http")
    ) {
      return formData.avatarUrl;
    }

    // Xử lý để đảm bảo luôn có đúng 1 dấu gạch chéo ở giữa
    const baseUrl = BACKEND_URL.endsWith("/")
      ? BACKEND_URL.slice(0, -1)
      : BACKEND_URL;
    const path = formData.avatarUrl.startsWith("/")
      ? formData.avatarUrl
      : `/${formData.avatarUrl}`;

    return `${baseUrl}${path}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  return (
    <>
      <Modal show={isOpen} onHide={toggleModal} centered size="lg">
        <Modal.Header closeButton className="bg-light p-3">
          <Modal.Title className="fs-18">Chỉnh sửa hồ sơ cá nhân</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <div className="text-center mb-4">
              <div className="position-relative d-inline-block">
                <img
                  src={getAvatarDisplay()}
                  alt="avatar-preview"
                  className="rounded-circle img-thumbnail shadow-sm"
                  style={{
                    width: "120px",
                    height: "120px",
                    objectFit: "cover",
                  }}
                />
                <div className="position-absolute bottom-0 end-0">
                  <Badge
                    bg="primary"
                    className="rounded-circle p-2 shadow"
                    style={{ cursor: "pointer" }}
                  ></Badge>
                </div>
              </div>
              <p className="text-muted small mt-2">Xem trước ảnh đại diện</p>
            </div>
            <Row className="g-3">
              <Col lg={12}>
                <Col lg={12}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">
                      Đường dẫn ảnh đại diện (URL)
                    </Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleChangeAvatar}
                    />
                  </Form.Group>
                </Col>
                <Form.Group>
                  <Form.Label className="fw-semibold">Họ và tên</Form.Label>
                  <Form.Control
                    type="text"
                    name="fullName"
                    placeholder="Nhập họ tên đầy đủ"
                    value={formData.fullName}
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
            onClick={async () => {
              const dataToSend = selectFile ? selectFile : formData.avatarUrl;
              await handleSave(formData.fullName, dataToSend);
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
