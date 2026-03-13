import React, { useState } from "react";
import { Card, Row, Col, Form, Button, Table, Badge } from "react-bootstrap";
import {
  Settings,
  Database,
  ShieldAlert,
  Save,
  Tag,
  Trash2,
  Plus,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const SettingsView = () => {
  const { t } = useTranslation();
  const [labels] = useState([
    { id: 1, name: "Car", color: "#405189" },
    { id: 2, name: "Truck", color: "#0ab39c" },
  ]);

  return (
    <Card className="border-0 shadow-sm p-4" style={{ borderRadius: "15px" }}>
      <h5 className="fw-bold mb-4">
        <Settings className="me-2 text-primary" /> {t('adminSettings.title')}
      </h5>

      <Row className="g-4">
        <Col lg={12}>
          <div className="p-3 border rounded-3 mb-3 bg-light bg-opacity-10">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold text-primary mb-0 uppercase">
                <Tag size={16} className="me-2" /> {t('adminSettings.labelManagement')}
              </h6>
              <Button variant="outline-primary" size="sm" className="fw-bold">
                <Plus size={14} /> {t('adminSettings.addLabel')}
              </Button>
            </div>
            <Table hover responsive className="bg-white rounded shadow-sm">
              <thead className="small text-uppercase">
                <tr>
                  <th>{t('adminSettings.labelName')}</th>
                  <th>{t('adminSettings.colorCode')}</th>
                  <th className="text-end">{t('adminSettings.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {labels.map((label) => (
                  <tr key={label.id}>
                    <td className="fw-bold">{label.name}</td>
                    <td>
                      <Badge style={{ backgroundColor: label.color }}>
                        {label.color}
                      </Badge>
                    </td>
                    <td className="text-end">
                      <Button variant="link" className="text-danger p-0">
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Col>

        <Col md={6}>
          <div className="p-3 border rounded-3 h-100">
            <h6 className="fw-bold text-secondary small uppercase">
              <Database size={16} className="me-2" /> {t('adminSettings.projectStorage')}
            </h6>
            <Form.Group className="mt-3">
              <Form.Label className="small fw-bold">
                {t('adminSettings.uploadLimit')}
              </Form.Label>
              <Form.Control defaultValue="500MB" />
              <Form.Text className="text-muted">
                {t('adminSettings.uploadLimitDesc')}
              </Form.Text>
            </Form.Group>
          </div>
        </Col>

        <Col md={6}>
          <div className="p-3 border rounded-3 h-100">
            <h6 className="fw-bold text-success small uppercase">
              <ShieldAlert size={16} className="me-2" /> {t('adminSettings.securityAuth')}
            </h6>
            <Form.Check
              type="switch"
              label={t('adminSettings.require2FA')}
              className="mt-3 fw-bold"
              defaultChecked
            />
            <small className="text-muted">
              {t('adminSettings.require2FADesc')}
            </small>
          </div>
        </Col>
      </Row>

      <div className="mt-4 border-top pt-3 text-end">
        <Button variant="dark" className="fw-bold px-5 py-2">
          <Save size={18} className="me-2" /> {t('adminSettings.saveConfig')}
        </Button>
      </div>
    </Card>
  );
};

export default SettingsView;
