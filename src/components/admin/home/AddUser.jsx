import { Modal, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { UploadCloud, FileSpreadsheet } from "lucide-react";

const AddUser = ({ isOpen, onClose, uploadUser, file, setFile }) => {
  const { t } = useTranslation();
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };
  return (
    <Modal show={isOpen} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title className="fs-16 fw-bold">
          {t("addUser.title")}
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
            {t("addUser.dropHint")}
          </p>
          <small className="text-primary fw-bold">
            {file ? file.name : t("addUser.noFileSelected")}
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
          {t("addUser.cancelBtn")}
        </Button>
        <Button
          variant="primary"
          disabled={!file}
          onClick={() => uploadUser(file)}
        >
          <FileSpreadsheet size={16} className="me-2" />
          {t("addUser.confirmImport")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddUser;
