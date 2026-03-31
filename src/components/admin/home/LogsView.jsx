import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Badge,
  InputGroup,
  Form,
  Button,
  Container,
  Spinner,
} from "react-bootstrap";
import { History, Activity, Search } from "lucide-react";
import { getSysLogs } from "../../../services/admin/managementSystem/systemLog.api";
import SysLogsModal from "../managementSystem/SysLogsModal";
import { useTranslation } from "react-i18next";
import { resolveBackendAssetUrl } from "../../../config/runtime";

const LogsView = ({ embedded = false }) => {
  const { t } = useTranslation();
  const [logData, setLogData] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [selectUserLogs, setSelectUserLogs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLog();
  }, []);

  const filteredLogs = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return logData;

    return logData.filter((log) =>
      `${log.email || ""} ${log.role || ""}`.toLowerCase().includes(keyword),
    );
  }, [logData, searchTerm]);

  const fetchLog = async () => {
    setLoading(true);
    try {
      const res = await getSysLogs();
      if (res.data) {
        const groupedData = res.data.reduce((acc, currentLog) => {
          const userId = currentLog.userId;

          if (!acc[userId]) {
            acc[userId] = {
              id: userId,
              avatar: currentLog.user.avatarUrl,
              email: currentLog.user.email,
              role: currentLog.user.role,
              userInfo: currentLog.user,
              logs: [],
            };
          }

          acc[userId].logs.push({
            id: currentLog.id,
            actionType: currentLog.actionType,
            timestamp: currentLog.timestamp,
            ipAddress: currentLog.ipAddress,
            description: currentLog.description,
          });

          return acc;
        }, {});

        setLogData(Object.values(groupedData));
      }
    } catch (error) {
      console.error(error);
      setLogData([]);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  const onCloseModal = () => {
    setSelectUserLogs(null);
    setIsOpenModal(false);
  };

  const content = loading ? (
    <div className="admin-loading-state">
      <div className="text-center">
        <Spinner animation="border" variant="primary" role="status" />
        <p className="mt-2 text-muted fw-medium">{t("adminSettings.loading")}</p>
      </div>
    </div>
  ) : (
    <section className="admin-section-card">
      <div className="admin-section-card__header">
        <div className="admin-toolbar">
          <div className="admin-toolbar__group">
            <div className="d-flex align-items-center gap-2">
              <History className="text-primary" size={22} />
              <h2 className="admin-section-card__title">{t("adminLogs.title")}</h2>
            </div>
            <p className="admin-section-card__description">
              {t("adminLogs.subtitle")}
            </p>
          </div>

          <div className="admin-toolbar__actions">
            <InputGroup className="admin-search-group">
              <InputGroup.Text>
                <Search size={18} />
              </InputGroup.Text>
              <Form.Control
                placeholder={t("adminLogs.searchPlaceholder")}
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </InputGroup>
          </div>
        </div>
      </div>

      <div className="admin-log-list">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => (
            <article className="admin-log-item" key={log.id}>
              <div className="admin-log-item__main">
                <img
                  src={
                    log.avatar
                      ? resolveBackendAssetUrl(log.avatar)
                      : `https://api.dicebear.com/7.x/initials/svg?seed=${log.email}`
                  }
                  alt={t("header.avatarAlt")}
                  className="admin-log-item__avatar"
                  onError={(event) => {
                    event.target.onerror = null;
                    event.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${log.email}`;
                  }}
                />

                <div className="min-w-0">
                  <div className="admin-log-item__title">
                    <span className="admin-log-item__email">
                      {log.email || t("header.noEmail")}
                    </span>
                    <Badge
                      bg={log.role === "Admin" ? "danger" : "info"}
                      className="text-uppercase"
                    >
                      {log.role}
                    </Badge>
                  </div>
                  <div className="admin-log-item__subtext">
                    <Activity size={14} className="me-1" />
                    {t("adminLogs.activityCount", {
                      count: log.logs?.length,
                    })}
                  </div>
                </div>
              </div>

              <Button
                variant="light"
                className="admin-secondary-btn"
                onClick={() => {
                  setIsOpenModal(true);
                  setSelectUserLogs(log);
                }}
              >
                {t("adminLogs.detail")}
              </Button>
            </article>
          ))
        ) : (
          <div className="admin-mobile-card m-3 text-center text-muted">
            {t("common.noData")}
          </div>
        )}
      </div>
    </section>
  );

  if (embedded) {
    return (
      <>
        {content}
        <SysLogsModal
          isOpen={isOpenModal}
          onClose={onCloseModal}
          selectUserLogs={selectUserLogs}
        />
      </>
    );
  }

  return (
    <Container fluid className="admin-shell">
      <div className="admin-shell__inner">
        <div className="admin-page-header">
          <div className="admin-page-header__content">
            <div className="admin-page-header__eyebrow">
              {t("adminNavTabs.activityLogs")}
            </div>
            <h1 className="admin-page-header__title">{t("adminLogs.title")}</h1>
            <p className="admin-page-header__subtitle">
              {t("adminLogs.subtitle")}
            </p>
          </div>
        </div>
        {content}
        <SysLogsModal
          isOpen={isOpenModal}
          onClose={onCloseModal}
          selectUserLogs={selectUserLogs}
        />
      </div>
    </Container>
  );
};

export default LogsView;
