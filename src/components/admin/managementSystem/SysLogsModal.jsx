import { Modal, Button, Table, Badge } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const SysLogsModal = ({ isOpen, onClose, selectUserLogs }) => {
  const { t } = useTranslation();
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);

    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };
  return (
    <Modal show={isOpen} onHide={onClose} size="lg" centered borderless>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">{t('sysLogs.activityDetail')}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="mb-3">
          <p className="mb-1 text-muted small">{t('sysLogs.user')}</p>
          <h6 className="fw-bold text-primary">{selectUserLogs?.email}</h6>
        </div>

        <div
          className="table-responsive"
          style={{ maxHeight: "400px", overflowY: "auto" }}
        >
          <Table hover className="align-middle">
            <thead className="bg-light sticky-top" style={{ zIndex: 1 }}>
              <tr>
                <th className="border-0 small text-muted">{t('sysLogs.colAction')}</th>
                <th className="border-0 small text-muted">{t('sysLogs.colTime')}</th>
                <th className="border-0 small text-muted">{t('sysLogs.colDetail')}</th>
                <th className="border-0 small text-muted">{t('sysLogs.colIp')}</th>
              </tr>
            </thead>
            <tbody>
              {selectUserLogs?.logs?.length > 0 ? (
                selectUserLogs.logs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <Badge bg="light" className="text-primary border">
                        {log.actionType}
                      </Badge>
                    </td>
                    <td className="small text-muted font-monospace">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="small text-muted font-monospace">
                      {log.description}
                    </td>
                    <td className="small text-muted font-monospace">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-muted">
                    {t('sysLogs.noData')}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Modal.Body>

      <Modal.Footer className="border-0">
        <Button
          variant="secondary"
          onClick={onClose}
          style={{ borderRadius: "8px" }}
        >
          {t('sysLogs.closeBtn')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SysLogsModal;
