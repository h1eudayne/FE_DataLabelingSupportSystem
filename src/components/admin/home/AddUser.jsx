import { Modal, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { UploadCloud, FileSpreadsheet, AlertTriangle } from "lucide-react";
import { useState } from "react";

const AddUser = ({ isOpen, onClose, uploadUser, file, setFile }) => {
  const { t } = useTranslation();
  const [error, setError] = useState("");

  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setError("");

    if (!selectedFile) return;

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError(t("addUser.errorSize"));
      setFile(null);
      e.target.value = "";
      return;
    }

    const fileExtension = selectedFile.name.split(".").pop().toLowerCase();
    if (!["xlsx", "xls"].includes(fileExtension)) {
      setError(t("addUser.errorType"));
      setFile(null);
      return;
    }

    setFile(selectedFile);
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
          className={`border border-2 border-dashed rounded-3 p-4 text-center ${
            error ? "border-danger bg-danger-subtle" : "bg-light"
          }`}
          style={{ cursor: "pointer" }}
          onClick={() => document.getElementById("excelInput").click()}
        >
          <UploadCloud
            size={40}
            className={`${error ? "text-danger" : "text-muted"} mb-2`}
          />
          <p className="mb-0 text-muted">{t("addUser.dropHint")}</p>

          <div className="mt-2">
            {file ? (
              <small className="text-primary fw-bold d-block">
                <FileSpreadsheet size={14} className="me-1" />
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </small>
            ) : (
              <small className="text-muted">
                {t("addUser.noFileSelected")}
              </small>
            )}
          </div>

          {error && (
            <div className="text-danger small mt-2 d-flex align-items-center justify-content-center gap-1">
              <AlertTriangle size={14} />
              <span>{error}</span>
            </div>
          )}

          <input
            id="excelInput"
            type="file"
            hidden
            accept=".xlsx, .xls"
            onChange={handleFileChange}
          />
        </div>

        <div className="mt-3">
          <ul className="small text-muted ps-3">
            <li>
              {t("addUser.maxSizeLabel")} <strong>5MB</strong>
            </li>
            <li>
              {t("addUser.maxRowLabel")}{" "}
              <strong>1000 {t("addUser.rows")}</strong>
            </li>
          </ul>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="light" onClick={onClose}>
          {t("addUser.cancelBtn")}
        </Button>
        <Button
          variant="primary"
          disabled={!file || !!error}
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
