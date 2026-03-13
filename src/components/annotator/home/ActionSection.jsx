import { Card, Button } from "react-bootstrap";
import { Zap, PlayCircle, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

const GuideItem = ({ text }) => (
  <div className="d-flex align-items-start gap-3">
    <div className="mt-1 p-1 bg-warning bg-opacity-10 rounded text-warning">
      <AlertTriangle size={14} />
    </div>
    <span className="small fw-semibold text-secondary">{text}</span>
  </div>
);

const ActionSection = () => {
  const { t } = useTranslation();
  return (
  <>
    <Card
      className="card-custom border-0 shadow-lg mb-4 text-white rounded-2rem"
      style={{
        background: "linear-gradient(135deg, #405189 0%, #293552 100%)",
      }}
    >
      <Card.Body className="p-4 position-relative overflow-hidden">
        <Zap
          className="position-absolute"
          size={120}
          style={{
            right: "-20px",
            top: "-20px",
            opacity: 0.1,
            transform: "rotate(15deg)",
          }}
        />
        <div className="z-index-1 position-relative">
          <h4 className="fw-black mb-2">{t('annotatorDashboardComp.workstation')}</h4>
          <p className="small mb-4 opacity-75">
            {t('annotatorDashboardComp.workstationDesc')}
          </p>
          <Button
            variant="light"
            className="w-100 fw-bold text-primary rounded-3 py-2 shadow-sm d-flex align-items-center justify-content-center gap-2 border-0"
          >
            <PlayCircle size={18} /> {t('annotatorDashboardComp.openWorkstation')}
          </Button>
        </div>
      </Card.Body>
    </Card>

    <Card className="card-custom rounded-2rem border-0">
      <Card.Body className="p-4">
        <h6 className="fw-bold text-muted mb-4 small tracking-wider text-uppercase border-bottom pb-2">
          {t('annotatorDashboardComp.quickGuide')}
        </h6>
        <div className="d-grid gap-3">
          <GuideItem text={t('annotatorDashboardComp.guide1')} />
          <GuideItem text={t('annotatorDashboardComp.guide2')} />
          <GuideItem text={t('annotatorDashboardComp.guide3')} />
        </div>
      </Card.Body>
    </Card>
  </>);
};
export default ActionSection;
