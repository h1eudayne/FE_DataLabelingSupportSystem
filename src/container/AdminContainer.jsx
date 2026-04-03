import React, { useCallback, useEffect, useState } from "react";
import NavigationTabs from "../components/admin/home/NavigationTabs";
import { Alert, Badge, Button, Container, Modal, Spinner } from "react-bootstrap";
import {
  getUsers,
  getUserProfile,
  updateUser,
  updateStatus,
  importUser,
  getAdmins,
} from "../services/admin/managementUsers/user.api";
import UserManagementView from "../components/admin/home/UserManagementView";
import AdminHeader from "../components/admin/home/AdminHeader";
import LogsView from "../components/admin/home/LogsView";
import UserModal from "../components/admin/managementUser/UserModal";
import AddUser from "../components/admin/home/AddUser";
import projectApi from "../services/admin/managementUsers/project.api";
import { ADMIN_PAGE_SIZE } from "../constants/pagination";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { getProjectStatusBadgeClass } from "../utils/projectWorkflowStatus";

const AdminContainer = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [managers, setManagers] = useState([]);

  const [filteredUsers, setFilteredUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = ADMIN_PAGE_SIZE;
  const [systemStats, setSystemStats] = useState({ admins: 0, workers: 0 });

  const [selectUser, setSelectUser] = useState(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState(null);
  const [currentName, setCurrentName] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [userProjects, setUserProjects] = useState([]);
  const [file, setFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lockModalOpen, setLockModalOpen] = useState(false);
  const [lockTargetUser, setLockTargetUser] = useState(null);
  const [lockTargetActive, setLockTargetActive] = useState(false);
  const [lockLoading, setLockLoading] = useState(false);
  const [statusNotice, setStatusNotice] = useState(null);

  const { t } = useTranslation();

  const fetchSelf = useCallback(async () => {
    try {
      const res = await getUserProfile();
      setCurrentRole(res.data.role);
      setCurrentName(res.data.fullName);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchUsers = useCallback(
    async (currentPage = page) => {
      setLoading(true);
      try {
        const resAdmins = await getAdmins();
        const adminUsers = resAdmins.data.filter(
          (user) => user.role === "Admin",
        );
        const managerUsers = resAdmins.data.filter(
          (user) => user.role === "Manager",
        );

        const resUser = await getUsers(currentPage, pageSize);
        const items = resUser.data.items || [];
        setAdmins(adminUsers);
        setManagers(managerUsers);
        setUsers(items);
        setFilteredUsers(items);
        setTotalCount(resUser.data.totalCount || 0);
        if (resUser.data.stats) {
          setSystemStats({
            admins: resUser.data.stats.totalAdmins,
            workers: resUser.data.stats.totalWorkers,
          });
        }
        setPage(resUser.data.page);
      } catch (error) {
        console.error("Error fetching user list:", error);
        setUsers([]);
        setFilteredUsers([]);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 300);
      }
    },
    [page, pageSize],
  );

  const refreshUsersFromFirstPage = useCallback(async () => {
    setPage(1);
    await fetchUsers(1);
  }, [fetchUsers]);

  const fetchProjectsUser = async (userId) => {
    try {
      const res = await projectApi.getAllProjectsUser(userId);
      if (res.data) {
        setUserProjects(res.data);
      }
    } catch (error) {
      console.error(error);
      setUserProjects([]);
    }
  };

  const handleEdit = (user) => {
    setSelectUser(user);
    setIsUserModalOpen(true);
  };

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers(page);
      fetchSelf();
    }
  }, [activeTab, page, fetchSelf, fetchUsers]);

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
    setIsUserModalOpen(!isUserModalOpen);
    if (isUserModalOpen) setSelectUser(null);
  };

  const handleSave = async (userData) => {
    try {
      if (selectUser) {
        await updateUser(selectUser.id, userData);
        console.log("Updated Successfully");
      }
      await fetchUsers();
    } catch (error) {
      const serverMessage = error.response?.data?.message || error.message;

      if (
        serverMessage.includes("pending tasks") ||
        error.response?.status === 400
      ) {
        toast.warning(t("admin.cannotChangeRole"));
      } else {
        toast.error(`${t("admin.errorOccurred")}: ${serverMessage}`);
      }

      console.error("Error updating:", error);
    }
  };

  const handleActive = (user, isActive) => {
    setLockTargetUser(user);
    setLockTargetActive(isActive);
    setLockModalOpen(true);
  };

  const closeLockModal = (force = false) => {
    if (lockLoading && !force) {
      return;
    }

    setLockModalOpen(false);
    setLockTargetUser(null);
  };

  const handleConfirmLockUnlock = async () => {
    if (!lockTargetUser) {
      return;
    }

    setLockLoading(true);

    try {
      const response = await updateStatus(lockTargetUser.id, lockTargetActive);
      const payload = response?.data || {};

      await fetchUsers(page);

      if (payload.requiresManagerApproval) {
        const pendingMessage =
          payload.message || t("userMgmt.lockRequestSent");

        setStatusNotice({
          variant: "info",
          title: t("userMgmt.pendingApprovalTitle"),
          message: pendingMessage,
          detail: t("userMgmt.pendingApprovalNote"),
        });
        toast.info(pendingMessage);
      } else {
        const successMessage =
          payload.message ||
          (lockTargetActive
            ? t("userMgmt.unlockSuccess")
            : t("userMgmt.lockSuccess"));

        setStatusNotice({
          variant: "success",
          message: successMessage,
        });
        toast.success(successMessage);
      }

      closeLockModal(true);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        t("userMgmt.statusUpdateFailed");

      toast.error(message);
      console.error(error);
    } finally {
      setLockLoading(false);
    }
  };

  const onCloseCreateModal = () => {
    setFile(null);
    setIsCreateModalOpen(false);
  };

  const uploadUser = async (file) => {
    setIsImporting(true);
    try {
      const res = await importUser(file);
      const successCount = res.data?.successCount || 0;
      const failureCount = res.data?.failureCount || 0;
      const firstError = res.data?.errors?.[0];

      if (res.data) {
        if (successCount > 0) {
          await refreshUsersFromFirstPage();
        }

        if (successCount > 0 && failureCount > 0) {
          toast.warning(
            `Imported ${successCount} users, ${failureCount} rows failed.${firstError ? ` First error: ${firstError}` : ""}`,
          );
        } else if (successCount > 0) {
          toast.success(`Imported ${successCount} users successfully.`);
        } else if (failureCount > 0) {
          toast.error(
            `Import failed for ${failureCount} rows.${firstError ? ` First error: ${firstError}` : ""}`,
          );
        }
      }
      onCloseCreateModal();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || "Import fail",
      );
    } finally {
      setIsImporting(false);
    }
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
              <Spinner animation="border" variant="primary" role="status" />
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
    <Container fluid className="admin-shell">
      <div className="admin-shell__inner">
        <AdminHeader fullName={currentName} />

        <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {activeTab === "users" && (
          <>
            <UserManagementView
              stats={systemStats}
              totalCount={totalCount}
              users={filteredUsers}
              onSearch={handleSearch}
              onActive={handleActive}
              onEdit={handleEdit}
              currentRole={currentRole}
              openCreateModal={setIsCreateModalOpen}
              getProjects={fetchProjectsUser}
              userProjects={userProjects}
              admins={admins}
              notice={statusNotice}
              onDismissNotice={() => setStatusNotice(null)}
              pagination={{
                totalCount,
                page,
                pageSize,
                onPageChange: (newPage) => setPage(newPage),
              }}
            />
            <UserModal
              isOpen={isUserModalOpen}
              toggle={toggleModal}
              user={selectUser}
              handleSave={handleSave}
              managers={managers}
            />
            <AddUser
              isOpen={isCreateModalOpen}
              onClose={onCloseCreateModal}
              uploadUser={uploadUser}
              file={file}
              setFile={setFile}
              isImporting={isImporting}
            />
          </>
        )}

        {activeTab === "logs" && <LogsView embedded />}
      </div>

      <Modal show={lockModalOpen} onHide={() => closeLockModal()} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i
              className={`me-2 ${lockTargetActive ? "ri-lock-unlock-line text-success" : "ri-lock-line text-danger"}`}
            ></i>
            {lockTargetActive
              ? t("userMgmt.unlockAccount")
              : t("userMgmt.lockAccount")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
                  <Badge bg="light" text="dark" className="border">
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

                <Alert variant="info" className="mt-3 mb-0 small text-start">
                  <i className="ri-route-line me-1"></i>
                  {t("userMgmt.managerDecisionFlow")}
                </Alert>
              </div>
            )}

            {hasPendingGlobalBanRequest && !lockTargetActive && (
              <Alert variant="warning" className="mt-3 mb-0 text-start">
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
              </Alert>
            )}

            {requiresManagerApproval && !hasPendingGlobalBanRequest && (
              <Alert variant="warning" className="mt-3 mb-0 text-start">
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
              </Alert>
            )}

            {lockTargetUser?.unfinishedProjectCount > 0 && lockTargetActive && (
              <Alert variant="info" className="mt-3 mb-0 text-start small">
                <i className="ri-information-line me-1"></i>
                {t("userMgmt.unlockInProjectNote", {
                  count: lockTargetUser.unfinishedProjectCount,
                })}
              </Alert>
            )}

            {(!lockTargetUser?.unfinishedProjectCount ||
              lockTargetUser?.unfinishedProjectCount === 0) &&
              !lockTargetActive && (
              <Alert variant="danger" className="mt-3 mb-0 text-start">
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
              </Alert>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <Button variant="light" onClick={() => closeLockModal()} className="px-4">
            <i className="ri-close-line me-1"></i>
            {t("common.cancel")}
          </Button>
          <Button
            variant={lockTargetActive ? "success" : "danger"}
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
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminContainer;
