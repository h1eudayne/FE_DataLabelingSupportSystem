import { Modal, Button } from "react-bootstrap";
import { UploadCloud, FileSpreadsheet } from "lucide-react";

const AddUser = ({ isOpen, onClose, uploadUser, file, setFile }) => {
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };
  return (
    <Modal show={isOpen} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title className="fs-16 fw-bold">
          Nhập nhân sự từ Excel
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div
          className="border border-2 border-dashed rounded-3 p-4 text-center bg-light"
          style={{ cursor: "pointer" }}
          onClick={() => document.getElementById("excelInput").click()}
        >
          <UploadCloud size={40} className="text-muted mb-2" />
          <p className="mb-0 text-muted">
            Click hoặc kéo thả file Excel vào đây
          </p>
          <small className="text-primary fw-bold">
            {file ? file.name : "Chưa có file nào được chọn"}
          </small>
          <input
            id="excelInput"
            type="file"
            hidden
            accept=".xlsx, .xls"
            onChange={handleFileChange}
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="light" onClick={onClose}>
          Hủy
        </Button>
        <Button
          variant="primary"
          disabled={!file}
          onClick={() => uploadUser(file)}
        >
          <FileSpreadsheet size={16} className="me-2" />
          Xác nhận Import
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddUser;
