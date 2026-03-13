import { Card, Nav } from "react-bootstrap";
import { Users, Settings, History } from "lucide-react";
import { useTranslation } from "react-i18next";

const NavigationTabs = ({ activeTab, setActiveTab }) => {
  const { t } = useTranslation();
  return (
    <Card className="mb-4 border-0 shadow-sm" style={{ borderRadius: "15px" }}>
      <Card.Body className="p-2">
        <Nav
          variant="pills"
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
        >
          <Nav.Item>
            <Nav.Link
              eventKey="users"
              className="d-flex align-items-center gap-2 px-4 py-2 fw-bold"
            >
              <Users size={18} /> {t("adminNavTabs.userManagement")}
            </Nav.Link>
          </Nav.Item>

          <Nav.Item>
            <Nav.Link
              eventKey="logs"
              className="d-flex align-items-center gap-2 px-4 py-2 fw-bold"
            >
              <History size={18} /> {t("adminNavTabs.activityLogs")}
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </Card.Body>
    </Card>
  );
};
export default NavigationTabs;
