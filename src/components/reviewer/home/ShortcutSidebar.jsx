import React from "react";
import { Card, Button } from "react-bootstrap";
import { Info, CheckCircle2, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

const ShortcutItem = ({ icon, keyCap, label }) => (
  <div className="d-flex align-items-center justify-content-between p-3 bg-light border border-dashed rounded-3">
    <div className="d-flex align-items-center gap-3">
      <div className="bg-white border shadow-sm rounded-2 px-2 py-1 fw-bold text-primary small">
        {keyCap}
      </div>
      <span className="small fw-bold">{label}</span>
    </div>
    {icon}
  </div>
);

const ShortcutSidebar = () => {
  const { t } = useTranslation();
  return (
    <Card
      className="border-0 shadow-sm p-4 sticky-top rounded-4"
      style={{ top: "20px" }}
    >
      <div className="d-flex align-items-center gap-2 mb-4">
        <div className="p-2 bg-warning bg-opacity-10 text-warning rounded">
          <Info size={20} />
        </div>
        <h6 className="fw-bold mb-0">{t('reviewerShortcut.quickGuide')}</h6>
      </div>
      <div className="d-grid gap-3">
        <ShortcutItem
          icon={<CheckCircle2 className="text-success" />}
          keyCap="A"
          label={t('reviewerShortcut.approveProject')}
        />
        <ShortcutItem
          icon={<XCircle className="text-danger" />}
          keyCap="R"
          label={t('reviewerShortcut.rejectProject')}
        />
      </div>
      <div
        className="mt-5 p-4 rounded-4 text-white text-center shadow-lg"
        style={{
          background: "linear-gradient(135deg, #405189 0%, #2a375e 100%)",
        }}
      >
        <p className="small mb-3 opacity-75">{t('reviewerShortcut.readyToWork')}</p>
        <Button
          variant="light"
          className="w-100 fw-bold border-0 text-primary py-2 rounded-3"
        >
          {t('reviewerShortcut.startNow')}
        </Button>
      </div>
    </Card>
  );
};

export default ShortcutSidebar;
