import React, { useEffect, useState } from "react";
import {
  getUsers,
  getUserProfile,
  updateUser,
  updateStatus,
  importUser,
  adminResetPassword,
} from "../../services/admin/managementUsers/user.api";
import UserTable from "../../components/admin/managementUser/UserTable";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Progress,
  Spinner,
  Table,
} from "reactstrap";
import UserFilter from "../../components/admin/managementUser/UserFilter";
import UserModal from "../../components/admin/managementUser/UserModal";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

const SettingUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectUser, setSelectUser] = useState(null);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
  });
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importError, setImportError] = useState("");

  // Reset password state
  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);

  const { t } = useTranslation();

  const MAX_FILE_SIZE = 5 * 1024 * 1024; 
  const ALLOWED_EXTENSIONS = [".xlsx", ".xls"];

  const handleImportFileChange = (e) => {
    const file = e.target.files[0];
    setImportError("");
    setImportResult(null);
    if (!file) return;

    const ext = "." + file.name.split(".").pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setImportError(t("userMgmt.importInvalidType", { defaultValue: "Only .xlsx and .xls files are allowed" }));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setImportError(t("userMgmt.importFileTooLarge", { defaultValue: "File must be less than 5MB" }));
      return;
    }
    setImportFile(file);
  };

  const handleImportSubmit = async () => {
    if (!importFile) return;
    setImportLoading(true);
    setImportError("");
    try {
      const res = await importUser(importFile);
      setImportResult(res.data);
      await fetchUsers();
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || "Import failed";
      setImportError(msg);
    } finally {
      setImportLoading(false);
    }
  };

  const closeImportModal = () => {
    setImportModalOpen(false);
    setImportFile(null);
    setImportResult(null);
    setImportError("");
  };

  const fetchSelf = async () => {
    try {
      const res = await getUserProfile();
      setCurrentRole(res.data.role);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUsers = async (currentPage = pagination.page) => {
    setLoading(true);
    try {
      const res = await getUsers(currentPage, pagination.pageSize);
      const data = res.data;
      const userList = data.items || data;
      setUsers(userList);
      setFilteredUsers(userList);
      setTotalCount(data.totalCount || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchSelf();
  }, []);

  useEffect(() => {
    fetchUsers(pagination.page);
  }, [pagination.page]);

  const handleEdit = (user) => {
    setSelectUser(user);
    setIsModalOpen(true);
  };

  const handleSearch = (searchTerm) => {
    if (!searchTerm) {
      setFilteredUsers(users);
      return;
    }
    const filtered = users.filter(
      (user) =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    setFilteredUsers(filtered);
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    if (isModalOpen) setSelectUser(null);
  };

  const handleSave = async (userData) => {
    try {
      if (selectUser) {
        await updateUser(selectUser.id, userData);
        console.log("Updated Successfully");
      }
      await fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const handleActive = async (userId, isActive) => {
    try {
      if (userId) {
        await updateStatus(userId, isActive);
        console.log("Updated Successfully");
      }
      await fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const handleResetPassword = (user) => {
    setResetPasswordUser(user);
    setNewPassword("");
    setResetPasswordModalOpen(true);
  };

  const handleSubmitResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error(t("userMgmt.passwordMinLength", { defaultValue: "Password must be at least 6 characters" }));
      return;
    }

    setResetPasswordLoading(true);
    try {
      await adminResetPassword(resetPasswordUser.id, newPassword);
      toast.success(t("userMgmt.passwordResetSuccess", { defaultValue: "Password has been reset successfully" }));
      setResetPasswordModalOpen(false);
      setResetPasswordUser(null);
      setNewPassword("");
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || t("userMgmt.passwordResetFailed", { defaultValue: "Failed to reset password" }));
    } finally {
      setResetPasswordLoading(false);
    }
  };

  const onPageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
        <div className="text-center">
          <Spinner animation="border" variant="primary" role="status" />
          <p className="mt-2 text-muted fw-medium">
            {t("adminSettings.loading")}
          </p>
        </div>
      </div>
    );
  }
  return (
    <>
      <Card>
        <CardHeader className="d-flex align-items-center">
          <h4 className="card-title mb-0 flex-grow-1">
            {t("userMgmt.staffList")}
          </h4>
          <Button
            color="success"
            size="sm"
            className="d-flex align-items-center gap-1"
            onClick={() => setImportModalOpen(true)}
          >
            <i className="ri-file-excel-2-line"></i>
            {t("userMgmt.importExcel", { defaultValue: "Import Excel" })}
          </Button>
        </CardHeader>
        <CardBody>
          <UserFilter onSearch={handleSearch} />
          <UserTable
            users={filteredUsers}
            onEdit={handleEdit}
            onActive={handleActive}
            onResetPassword={handleResetPassword}
            currentRole={currentRole}
            pagination={{ ...pagination, onPageChange }}
            totalCount={totalCount}
          />
        </CardBody>
      </Card>

      {/* Reset Password Modal */}
      <Modal isOpen={resetPasswordModalOpen} toggle={() => setResetPasswordModalOpen(false)}>
        <ModalHeader toggle={() => setResetPasswordModalOpen(false)}>
          <i className="ri-lock-password-line me-2 text-warning"></i>
          {t("userMgmt.resetPassword", { defaultValue: "Reset Password" })}
        </ModalHeader>
        <ModalBody>
          <p className="mb-3">
            {t("userMgmt.resetPasswordFor", { defaultValue: "Reset password for" })}: <strong>{resetPasswordUser?.fullName}</strong>
            <br />
            <small className="text-muted">{resetPasswordUser?.email}</small>
          </p>
          <div className="mb-3">
            <label className="form-label fw-medium">
              {t("userMgmt.newPassword", { defaultValue: "New Password" })}
            </label>
            <input
              type="password"
              className="form-control"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t("userMgmt.enterNewPassword", { defaultValue: "Enter new password" })}
              minLength={6}
            />
            <small className="text-muted">
              {t("userMgmt.passwordMinLength", { defaultValue: "Minimum 6 characters" })}
            </small>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setResetPasswordModalOpen(false)}>
            {t("common.cancel", { defaultValue: "Cancel" })}
          </Button>
          <Button color="warning" onClick={handleSubmitResetPassword} disabled={resetPasswordLoading}>
            {resetPasswordLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-1"></span>
                {t("common.loading", { defaultValue: "Loading..." })}
              </>
            ) : (
              <>
                <i className="ri-lock-password-line me-1"></i>
                {t("userMgmt.resetPassword", { defaultValue: "Reset Password" })}
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {}
      <Modal isOpen={importModalOpen} toggle={closeImportModal} size="lg">
        <ModalHeader toggle={closeImportModal}>
          <i className="ri-file-excel-2-line me-2 text-success"></i>
          {t("userMgmt.importExcel", { defaultValue: "Import Users from Excel" })}
        </ModalHeader>
        <ModalBody>
          {importError && (
            <Alert color="danger" className="mb-3">
              <i className="ri-error-warning-line me-1"></i>
              {importError}
            </Alert>
          )}

          <div className="mb-3">
            <label className="form-label fw-medium">
              {t("userMgmt.selectFile", { defaultValue: "Select Excel file" })}
            </label>
            <input
              type="file"
              className="form-control"
              accept=".xlsx,.xls"
              onChange={handleImportFileChange}
              disabled={importLoading}
            />
            <small className="text-muted d-block mt-1">
              {t("userMgmt.importHint", { defaultValue: "Max 5MB, .xlsx or .xls only. Only Annotators and Reviewers can be imported." })}
            </small>
          </div>

          {importLoading && (
            <div className="text-center py-3">
              <Spinner color="primary" size="sm" className="me-2" />
              {t("userMgmt.importing", { defaultValue: "Importing..." })}
              <Progress animated value={100} className="mt-2" />
            </div>
          )}

          {importResult && (
            <div className="mt-3">
              <h6 className="fw-bold mb-2">
                <i className="ri-file-list-3-line me-1"></i>
                {t("userMgmt.importReport", { defaultValue: "Import Report" })}
              </h6>
              <div className="d-flex gap-3 mb-3">
                <Badge color="success" className="px-3 py-2">
                  {t("userMgmt.success", { defaultValue: "Success" })}: {importResult.successCount ?? importResult.success ?? 0}
                </Badge>
                <Badge color="danger" className="px-3 py-2">
                  {t("userMgmt.failed", { defaultValue: "Failed" })}: {importResult.failCount ?? importResult.failed ?? 0}
                </Badge>
              </div>
              {importResult.errors && importResult.errors.length > 0 && (
                <Table size="sm" bordered className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>{t("userMgmt.row", { defaultValue: "Row" })}</th>
                      <th>{t("userMgmt.error", { defaultValue: "Error" })}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importResult.errors.map((err, idx) => (
                      <tr key={idx}>
                        <td>{err.row ?? idx + 1}</td>
                        <td className="text-danger">{err.message ?? err}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={closeImportModal}>
            {t("common.close", { defaultValue: "Close" })}
          </Button>
          {!importResult && (
            <Button
              color="success"
              onClick={handleImportSubmit}
              disabled={!importFile || importLoading}
            >
              {importLoading ? (
                <><Spinner size="sm" className="me-1" /> {t("userMgmt.importing", { defaultValue: "Importing..." })}</>
              ) : (
                <><i className="ri-upload-2-line me-1"></i> {t("userMgmt.import", { defaultValue: "Import" })}</>
              )}
            </Button>
          )}
        </ModalFooter>
      </Modal>

      <UserModal
        isOpen={isModalOpen}
        toggle={toggleModal}
        user={selectUser}
        handleSave={handleSave}
        managers={users.filter((u) => u.role === "Manager")}
      />
    </>
  );
};

export default SettingUserManagement;
