import { Badge } from "react-bootstrap";
import { User } from "lucide-react";
import { useTranslation } from "react-i18next";

const AnnotatorHeader = ({ email }) => {
  const { t } = useTranslation();
  return (
    <div className="mb-4 d-flex justify-content-between align-items-end">
      <div>
        <h4 className="fw-black text-slate-800 mb-1">
          Welcome back, {email?.split("@")[0] || "Staff1"}
        </h4>
        <p className="text-muted mb-0 small">
          {t('annotatorHeaderComp.subtitle')}
        </p>
      </div>
      <div className="d-none d-sm-block">
        <Badge
          style={{
            backgroundColor: "#405189",
            color: "#fff",
            padding: "8px 16px",
            borderRadius: "8px",
            fontWeight: "600",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          }}
        >
          <User size={14} className="me-2" /> {t('annotatorHeaderComp.role')}
        </Badge>
      </div>
    </div>
  );
};
export default AnnotatorHeader;
