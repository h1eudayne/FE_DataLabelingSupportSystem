import { Card, Nav } from "react-bootstrap";
import { Users, History } from "lucide-react";
import { useTranslation } from "react-i18next";

const NavigationTabs = ({ activeTab, setActiveTab }) => {
  const { t } = useTranslation();
  return (
    <Card className="admin-tab-shell">
      <Card.Body>
        <Nav
          variant="pills"
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="admin-tab-nav"
        >
          <Nav.Item>
            <Nav.Link
              eventKey="users"
              className="admin-tab-nav__link"
            >
              <Users size={18} /> {t("adminNavTabs.userManagement")}
            </Nav.Link>
          </Nav.Item>

          <Nav.Item>
            <Nav.Link
              eventKey="logs"
              className="admin-tab-nav__link"
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
