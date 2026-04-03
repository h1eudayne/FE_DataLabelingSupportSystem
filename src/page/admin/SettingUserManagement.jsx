import React, { useCallback, useEffect, useState } from "react";
import {
  getUsers,
  getAdmins,
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

const getProjectStatusBadgeClass = (status) => {
  const normalizedStatus = String(status || "").toLowerCase();

  if (normalizedStatus === "active" || normalizedStatus === "inprogress") {
    return "bg-primary-subtle text-primary";
  }

  if (normalizedStatus === "submitted" || normalizedStatus === "assigned") {
    return "bg-warning-subtle text-warning";
  }

  if (normalizedStatus === "completed" || normalizedStatus === "approved") {
    return "bg-success-subtle text-success";
  }

  return "bg-light text-muted";
};

const SettingUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [selectUser, setSelectUser] = useState(null);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 30,
  });
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importError, setImportError] = useState("");

  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState(null);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);

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
      setImportError(
        t("userMgmt.importInvalidType"),
      );
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setImportError(
        t("userMgmt.importFileTooLarge"),
      );
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
      await refreshUsersFromFirstPage();
    } catch (error) {
      const msg =
        error?.response?.data?.message || error.message || "Import failed";
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

  const fetchUsers = useCallback(async (currentPage = pagination.page) => {
    setLoading(true);
    try {
      const resAdmins = await getAdmins();
      const managerUsers = resAdmins.data.filter(
        (user) => user.role === "Manager",
      );
      const res = await getUsers(currentPage, pagination.pageSize);
      const data = res.data;
      const userList = data.items || data;

      setManagers(managerUsers);
      setUsers(userList);
      setFilteredUsers(userList);
      setTotalCount(data.totalCount || data.stats?.totalWorkers || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  }, [pagination.page, pagination.pageSize]);

  const refreshUsersFromFirstPage = useCallback(async () => {
    setPagination((prev) =>
      prev.page === 1 ? prev : { ...prev, page: 1 },
    );
    await fetchUsers(1);
  }, [fetchUsers]);

  useEffect(() => {
    fetchSelf();
  }, []);

  useEffect(() => {
    fetchUsers(pagination.page);
  }, [fetchUsers, pagination.page]);

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
      const response = await updateStatus(lockTargetUser.id, lockTargetActive);
      const payload = response?.data || {};
      await fetchUsers(pagination.page);

      if (payload.requiresManagerApproval) {
        toast.info(payload.message || t("userMgmt.lockRequestSent"));
      } else {
        toast.success(
          payload.message ||
          (lockTargetActive
            ? t("userMgmt.unlockSuccess")
            : t("userMgmt.lockSuccess")),
        );
      }

      setLockModalOpen(false);
      setLockTargetUser(null);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        error.message ||
        t("userMgmt.statusUpdateFailed"),
      );
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
      const response = await adminResetPassword(resetPasswordUser.id);
      const message =
        response?.data?.message || t("userMgmt.passwordResetSuccess");
      if (response?.data?.emailDeliveryMode === "PickupDirectory") {
        toast.info(message);
      } else if (response?.data?.emailDelivered === false) {
        toast.warn(message);
      } else {
        toast.success(message);
      }
      setResetPasswordModalOpen(false);
      setResetPasswordUser(null);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        error.message ||
        t("userMgmt.passwordResetFailed"),
      );
    } finally {
      setResetPasswordLoading(false);
    }
  };

  const onPageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const requiresManagerApproval =
    !lockTargetActive &&
    lockTargetUser?.isActive &&
    lockTargetUser?.managerId &&
    (lockTargetUser?.unfinishedProjectCount || 0) > 0;
  const hasPendingGlobalBanRequest = Boolean(lockTargetUser?.hasPendingGlobalBanRequest);
  const impactedProjects = Array.isArray(lockTargetUser?.unfinishedProjects)
    ? lockTargetUser.unfinishedProjects
    : [];
  const responsibleManagerName = lockTargetUser?.managerName || t("userMgmt.noManager");
  const responsibleManagerEmail = lockTargetUser?.managerEmail;

  if (loading) {
    return (
      <div className="admin-shell">
        <div className="admin-shell__inner">
          <div className="admin-loading-state">
            <div className="text-center">
              <Spinner color="primary" />
              <p className="mt-2 text-muted fw-medium">
                {t("adminSettings.loading")}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <>
      <div className="admin-shell">
        <div className="admin-shell__inner">
          <section className="admin-page-header">
            <div className="admin-page-header__content">
              <div className="admin-page-header__eyebrow">
                {t("adminNavTabs.userManagement")}
              </div>
              <h1 className="admin-page-header__title">
                {t("userMgmt.staffList")}
              </h1>
              <p className="admin-page-header__subtitle">
                {t("userMgmt.staffListDesc")}
              </p>
            </div>
          </section>

          <Card className="admin-section-card border-0 shadow-none">
            <CardHeader className="admin-section-card__header bg-transparent border-0">
              <div className="admin-toolbar">
                <div className="admin-toolbar__group">
                  <h2 className="admin-section-card__title">
                    {t("userMgmt.staffList")}
                  </h2>
                  <p className="admin-section-card__description">
                    {t("userMgmt.staffListDesc")}
                  </p>
                </div>

                <div className="admin-toolbar__actions">
                  <Button
                    color="success"
                    className="admin-primary-btn"
                    onClick={() => setImportModalOpen(true)}
                  >
                    <i className="ri-file-excel-2-line"></i>
                    {t("userMgmt.importExcel")}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardBody className="admin-section-card__body">
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
        </div>
      </div>

      <Modal isOpen={lockModalOpen} toggle={() => setLockModalOpen(false)}>
        <ModalHeader toggle={() => setLockModalOpen(false)}>
          <i
            className={`me-2 ${lockTargetActive ? "ri-lock-unlock-line text-success" : "ri-lock-line text-danger"}`}
          ></i>
          {lockTargetActive
            ? t("userMgmt.unlockAccount")
            : t("userMgmt.lockAccount")}
        </ModalHeader>
        <ModalBody>
          <div className="text-center py-2">
            <div className="avatar-lg mx-auto mb-3">
              <div
                className={`avatar-title rounded-circle fs-24 ${lockTargetActive ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}
              >
                <i
                  className={
                    lockTargetActive ? "ri-lock-unlock-line" : "ri-lock-line"
                  }
                ></i>
              </div>
            </div>
            <h5 className="mb-2">
              {lockTargetActive
                ? t("userMgmt.confirmUnlock")
                : t("userMgmt.confirmLock")}
            </h5>
            <p className="mb-1">
              <strong className="fs-15">{lockTargetUser?.fullName}</strong>
            </p>
            <small className="text-muted">{lockTargetUser?.email}</small>
            <div className="mt-1">
              <span className="badge bg-info-subtle text-info px-2 py-1">
                {lockTargetUser?.role}
              </span>
            </div>

            {(requiresManagerApproval || hasPendingGlobalBanRequest) && (
              <div className="border rounded-3 p-3 mt-3 text-start bg-light-subtle">
                <div className="d-flex align-items-start justify-content-between gap-2 flex-wrap">
                  <div>
                    <div className="text-muted text-uppercase fw-semibold small">
                      {t("userMgmt.responsibleManager")}
                    </div>
                    <div className="fw-semibold">
                      {responsibleManagerName}
                    </div>
                    {responsibleManagerEmail && (
                      <div className="small text-muted">{responsibleManagerEmail}</div>
                    )}
                  </div>
                  <Badge color="light" className="text-dark border">
                    {t("userMgmt.projectsAwaitingDecision", {
                      count: impactedProjects.length,
                    })}
                  </Badge>
                </div>

                <div className="mt-3">
                  <div className="text-muted text-uppercase fw-semibold small mb-2">
                    {t("userMgmt.affectedProjects")}
                  </div>
                  {impactedProjects.length > 0 ? (
                    <div className="d-flex flex-column gap-2">
                      {impactedProjects.map((project) => (
                        <div
                          key={`${lockTargetUser?.id || "user"}-${project.id}`}
                          className="d-flex justify-content-between align-items-center gap-2 rounded-3 border bg-white px-3 py-2"
                        >
                          <div>
                            <div className="fw-semibold">
                              {project.name}
                            </div>
                            <div className="small text-muted">
                              #{project.id}
                            </div>
                          </div>
                          <span className={`badge ${getProjectStatusBadgeClass(project.status)}`}>
                            {project.status || t("userMgmt.unknownProjectStatus")}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="small text-muted">
                      {t("userMgmt.noAffectedProjects")}
                    </div>
                  )}
                </div>

                <div className="alert alert-info mt-3 mb-0 small text-start">
                  <i className="ri-route-line me-1"></i>
                  {t("userMgmt.managerDecisionFlow")}
                </div>
              </div>
            )}

            {hasPendingGlobalBanRequest && !lockTargetActive && (
              <div className="alert alert-warning mt-3 mb-0 text-start">
                <div className="d-flex align-items-start gap-2">
                  <i className="ri-time-line fs-18 mt-1 flex-shrink-0"></i>
                  <div>
                    <strong className="d-block mb-1">
                      {t("userMgmt.pendingApprovalTitle")}
                    </strong>
                    <span className="small">
                      {t("userMgmt.pendingApprovalNote")}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {requiresManagerApproval && !hasPendingGlobalBanRequest && (
              <div className="alert alert-warning mt-3 mb-0 text-start">
                <div className="d-flex align-items-start gap-2">
                  <i className="ri-shield-user-line fs-18 mt-1 flex-shrink-0"></i>
                  <div>
                    <strong className="d-block mb-1">
                      {t("userMgmt.managerApprovalRequired", {
                        count: lockTargetUser?.unfinishedProjectCount || 0,
                      })}
                    </strong>
                    <span className="small">
                      {t("userMgmt.managerApprovalNote", {
                        managerName: responsibleManagerName,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {lockTargetUser?.unfinishedProjectCount > 0 && lockTargetActive && (
              <div className="alert alert-info mt-3 mb-0 text-start small">
                <i className="ri-information-line me-1"></i>
                {t("userMgmt.unlockInProjectNote", {
                  count: lockTargetUser.unfinishedProjectCount,
                })}
              </div>
            )}

            {(!lockTargetUser?.unfinishedProjectCount ||
              lockTargetUser?.unfinishedProjectCount === 0) &&
              !lockTargetActive && (
              <div className="alert alert-danger mt-3 mb-0 text-start">
                <div className="d-flex align-items-start gap-2">
                  <i className="ri-error-warning-fill fs-18 mt-1 flex-shrink-0"></i>
                  <div>
                    <strong className="d-block mb-1">
                      {t("userMgmt.lockDirectlyTitle")}
                    </strong>
                    <span className="small">
                      {t("userMgmt.lockDirectlyNote")}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter className="justify-content-center">
          <Button
            color="light"
            onClick={() => setLockModalOpen(false)}
            className="px-4"
          >
            <i className="ri-close-line me-1"></i>
            {t("common.cancel")}
          </Button>
          <Button
            color={lockTargetActive ? "success" : "danger"}
            onClick={handleConfirmLockUnlock}
            disabled={lockLoading}
            className="px-4"
          >
            {lockLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-1"></span>
                {t("common.loading")}
              </>
            ) : (
              <>
                <i
                  className={`me-1 ${lockTargetActive ? "ri-lock-unlock-line" : "ri-lock-line"}`}
                ></i>
                {t("common.confirm")}
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={resetPasswordModalOpen}
        toggle={() => setResetPasswordModalOpen(false)}
      >
        <ModalHeader toggle={() => setResetPasswordModalOpen(false)}>
          <i className="ri-lock-password-line me-2 text-warning"></i>
          {t("userMgmt.resetPassword")}
        </ModalHeader>
        <ModalBody>
          <div className="text-center py-2">
            <div className="avatar-lg mx-auto mb-3">
              <div className="avatar-title bg-warning-subtle text-warning rounded-circle fs-24">
                <i className="ri-error-warning-line"></i>
              </div>
            </div>
            <h5 className="mb-2">
              {t("userMgmt.resetPasswordConfirmTitle")}
            </h5>
            <p className="text-muted mb-2">
              {t("userMgmt.resetPasswordFor")}
              :
            </p>
            <p className="mb-1">
              <strong className="fs-15">{resetPasswordUser?.fullName}</strong>
            </p>
            <small className="text-muted">{resetPasswordUser?.email}</small>
            <div className="alert alert-warning mt-3 mb-0 text-start small">
              <i className="ri-information-line me-1"></i>
              {t("userMgmt.resetPasswordDefaultNote")}
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="justify-content-center">
          <Button
            color="light"
            onClick={() => setResetPasswordModalOpen(false)}
            className="px-4"
          >
            <i className="ri-close-line me-1"></i>
            {t("common.cancel")}
          </Button>
          <Button
            color="warning"
            onClick={handleSubmitResetPassword}
            disabled={resetPasswordLoading}
            className="px-4"
          >
            {resetPasswordLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-1"></span>
                {t("common.loading")}
              </>
            ) : (
              <>
                <i className="ri-check-line me-1"></i>
                {t("common.confirm")}
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>

      { }
      <Modal isOpen={importModalOpen} toggle={closeImportModal} size="lg">
        <ModalHeader toggle={closeImportModal}>
          <i className="ri-file-excel-2-line me-2 text-success"></i>
          {t("userMgmt.importExcel")}
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
              {t("userMgmt.selectFile")}
            </label>
            <input
              type="file"
              className="form-control"
              accept=".xlsx,.xls"
              onChange={handleImportFileChange}
              disabled={importLoading}
            />
            <small className="text-muted d-block mt-1">
              {t("userMgmt.importHint")}
            </small>
          </div>

          {importLoading && (
            <div className="text-center py-3">
              <Spinner color="primary" size="sm" className="me-2" />
              {t("userMgmt.importing")}
              <Progress animated value={100} className="mt-2" />
            </div>
          )}

          {importResult && (
            <div className="mt-3">
              <h6 className="fw-bold mb-2">
                <i className="ri-file-list-3-line me-1"></i>
                {t("userMgmt.importReport")}
              </h6>
              <div className="d-flex gap-3 mb-3">
                <Badge color="success" className="px-3 py-2">
                  {t("userMgmt.success")}:{" "}
                  {importResult.successCount ?? importResult.success ?? 0}
                </Badge>
                <Badge color="danger" className="px-3 py-2">
                  {t("userMgmt.failed")}:{" "}
                  {importResult.failCount ?? importResult.failed ?? 0}
                </Badge>
              </div>
              {importResult.errors && importResult.errors.length > 0 && (
                <Table size="sm" bordered className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>{t("userMgmt.row")}</th>
                      <th>{t("userMgmt.error")}</th>
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
            {t("common.close")}
          </Button>
          {!importResult && (
            <Button
              color="success"
              onClick={handleImportSubmit}
              disabled={!importFile || importLoading}
            >
              {importLoading ? (
                <>
                  <Spinner size="sm" className="me-1" />{" "}
                  {t("userMgmt.importing")}
                </>
              ) : (
                <>
                  <i className="ri-upload-2-line me-1"></i>{" "}
                  {t("userMgmt.import")}
                </>
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
        managers={managers}
      />
    </>
  );
};

export default SettingUserManagement;
