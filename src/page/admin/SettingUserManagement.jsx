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
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);

  // Lock/Unlock confirmation state
  const [lockModalOpen, setLockModalOpen] = useState(false);
  const [lockTargetUser, setLockTargetUser] = useState(null);
  const [lockTargetActive, setLockTargetActive] = useState(false);
  const [lockLoading, setLockLoading] = useState(false);

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

  const handleActive = (user, isActive) => {
    setLockTargetUser(user);
    setLockTargetActive(isActive);
    setLockModalOpen(true);
  };

  const handleConfirmLockUnlock = async () => {
    if (!lockTargetUser) return;
    setLockLoading(true);
    try {
      await updateStatus(lockTargetUser.id, lockTargetActive);
      const updateList = (list) =>
        list.map((u) => (u.id === lockTargetUser.id ? { ...u, isActive: lockTargetActive } : u));
      setUsers((prev) => updateList(prev));
      setFilteredUsers((prev) => updateList(prev));
      toast.success(
        lockTargetActive
          ? t("userMgmt.unlockSuccess", { defaultValue: "Tài khoản đã được mở khóa" })
          : t("userMgmt.lockSuccess", { defaultValue: "Tài khoản đã bị khóa" })
      );
      setLockModalOpen(false);
      setLockTargetUser(null);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || t("userMgmt.statusUpdateFailed", { defaultValue: "Cập nhật trạng thái thất bại" }));
    } finally {
      setLockLoading(false);
    }
  };

  const handleResetPassword = (user) => {
    setResetPasswordUser(user);
    setResetPasswordModalOpen(true);
  };

  const handleSubmitResetPassword = async () => {
    setResetPasswordLoading(true);
    try {
      await adminResetPassword(resetPasswordUser.id, "Password@123");
      toast.success(t("userMgmt.passwordResetSuccess", { defaultValue: "Password has been reset to default successfully" }));
      setResetPasswordModalOpen(false);
      setResetPasswordUser(null);
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

      {/* Lock/Unlock Confirmation Modal */}
      <Modal isOpen={lockModalOpen} toggle={() => setLockModalOpen(false)}>
        <ModalHeader toggle={() => setLockModalOpen(false)}>
          <i className={`me-2 ${lockTargetActive ? 'ri-lock-unlock-line text-success' : 'ri-lock-line text-danger'}`}></i>
          {lockTargetActive
            ? t("userMgmt.unlockAccount", { defaultValue: "Mở khóa tài khoản" })
            : t("userMgmt.lockAccount", { defaultValue: "Khóa tài khoản" })}
        </ModalHeader>
        <ModalBody>
          <div className="text-center py-2">
            <div className="avatar-lg mx-auto mb-3">
              <div className={`avatar-title rounded-circle fs-24 ${lockTargetActive ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                <i className={lockTargetActive ? 'ri-lock-unlock-line' : 'ri-lock-line'}></i>
              </div>
            </div>
            <h5 className="mb-2">
              {lockTargetActive
                ? t("userMgmt.confirmUnlock", { defaultValue: "Xác nhận mở khóa tài khoản?" })
                : t("userMgmt.confirmLock", { defaultValue: "Xác nhận khóa tài khoản?" })}
            </h5>
            <p className="mb-1">
              <strong className="fs-15">{lockTargetUser?.fullName}</strong>
            </p>
            <small className="text-muted">{lockTargetUser?.email}</small>
            <div className="mt-1">
              <span className="badge bg-info-subtle text-info px-2 py-1">{lockTargetUser?.role}</span>
            </div>

            {/* Warning if user is in projects */}
            {lockTargetUser?.totalProjects > 0 && !lockTargetActive && (
              <div className="alert alert-danger mt-3 mb-0 text-start">
                <div className="d-flex align-items-start gap-2">
                  <i className="ri-error-warning-fill fs-18 mt-1 flex-shrink-0"></i>
                  <div>
                    <strong className="d-block mb-1">
                      {t("userMgmt.userInProjectWarning", {
                        defaultValue: "Người dùng đang tham gia {{count}} dự án!",
                        count: lockTargetUser.totalProjects,
                      })}
                    </strong>
                    <span className="small">
                      {t("userMgmt.userInProjectNote", {
                        defaultValue: "Việc khóa tài khoản này cần được bàn giao cho Manager quản lý dự án của người dùng. Hãy liên hệ Manager trước khi khóa.",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {lockTargetUser?.totalProjects > 0 && lockTargetActive && (
              <div className="alert alert-info mt-3 mb-0 text-start small">
                <i className="ri-information-line me-1"></i>
                {t("userMgmt.unlockInProjectNote", {
                  defaultValue: "Người dùng đang trong {{count}} dự án. Mở khóa sẽ cho phép họ tiếp tục làm việc.",
                  count: lockTargetUser.totalProjects,
                })}
              </div>
            )}

            {(!lockTargetUser?.totalProjects || lockTargetUser?.totalProjects === 0) && !lockTargetActive && (
              <div className="alert alert-warning mt-3 mb-0 text-start small">
                <i className="ri-information-line me-1"></i>
                {t("userMgmt.lockNoProjectNote", {
                  defaultValue: "Người dùng không tham gia dự án nào. Có thể khóa an toàn.",
                })}
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter className="justify-content-center">
          <Button color="light" onClick={() => setLockModalOpen(false)} className="px-4">
            <i className="ri-close-line me-1"></i>
            {t("common.cancel", { defaultValue: "Không" })}
          </Button>
          <Button
            color={lockTargetActive ? 'success' : 'danger'}
            onClick={handleConfirmLockUnlock}
            disabled={lockLoading}
            className="px-4"
          >
            {lockLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-1"></span>
                {t("common.loading", { defaultValue: "Đang xử lý..." })}
              </>
            ) : (
              <>
                <i className={`me-1 ${lockTargetActive ? 'ri-lock-unlock-line' : 'ri-lock-line'}`}></i>
                {t("common.confirm", { defaultValue: "Đồng ý" })}
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Reset Password Modal */}
      <Modal isOpen={resetPasswordModalOpen} toggle={() => setResetPasswordModalOpen(false)}>
        <ModalHeader toggle={() => setResetPasswordModalOpen(false)}>
          <i className="ri-lock-password-line me-2 text-warning"></i>
          {t("userMgmt.resetPassword", { defaultValue: "Reset Password" })}
        </ModalHeader>
        <ModalBody>
          <div className="text-center py-2">
            <div className="avatar-lg mx-auto mb-3">
              <div className="avatar-title bg-warning-subtle text-warning rounded-circle fs-24">
                <i className="ri-error-warning-line"></i>
              </div>
            </div>
            <h5 className="mb-2">
              {t("userMgmt.resetPasswordConfirmTitle", { defaultValue: "Xác nhận đặt lại mật khẩu?" })}
            </h5>
            <p className="text-muted mb-2">
              {t("userMgmt.resetPasswordFor", { defaultValue: "Reset password for" })}:
            </p>
            <p className="mb-1">
              <strong className="fs-15">{resetPasswordUser?.fullName}</strong>
            </p>
            <small className="text-muted">{resetPasswordUser?.email}</small>
            <div className="alert alert-warning mt-3 mb-0 text-start small">
              <i className="ri-information-line me-1"></i>
              {t("userMgmt.resetPasswordDefaultNote", { defaultValue: "Mật khẩu sẽ được đặt lại về mặc định" })}
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="justify-content-center">
          <Button color="light" onClick={() => setResetPasswordModalOpen(false)} className="px-4">
            <i className="ri-close-line me-1"></i>
            {t("common.cancel", { defaultValue: "Không" })}
          </Button>
          <Button color="warning" onClick={handleSubmitResetPassword} disabled={resetPasswordLoading} className="px-4">
            {resetPasswordLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-1"></span>
                {t("common.loading", { defaultValue: "Loading..." })}
              </>
            ) : (
              <>
                <i className="ri-check-line me-1"></i>
                {t("common.confirm", { defaultValue: "Đồng ý" })}
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
