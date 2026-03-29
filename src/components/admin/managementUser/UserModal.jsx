import { useEffect, useState } from "react";
import {
  Modal,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import { useTranslation } from "react-i18next";

const UserModal = (props) => {
  const { isOpen, toggle, user, handleSave, managers = [] } = props;
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    role: "Annotator",
    managerId: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        role: user.role || "Annotator",
        managerId: user.managerId || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const showManagerField =
    formData.role === "Annotator" || formData.role === "Reviewer";

  return (
    <>
      <Modal isOpen={isOpen} toggle={toggle} centered>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label>{t("userMgmt.role")}</Label>
              <Input
                type="select"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option>Manager</option>
                <option>Annotator</option>
                <option>Reviewer</option>
              </Input>
            </FormGroup>
            {showManagerField && (
              <FormGroup>
                <Label>{t("userMgmt.assignManager")}</Label>
                <Input
                  type="select"
                  name="managerId"
                  value={formData.managerId}
                  onChange={handleChange}
                >
                  <option value="">{t("userMgmt.noManager")}</option>
                  {managers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.email})
                    </option>
                  ))}
                </Input>
              </FormGroup>
            )}
          </Form>
        </ModalBody>
        <ModalFooter>
          <button className="btn btn-light" onClick={toggle}>
            {t("common.cancel")}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              const payload = { role: formData.role };
              if (showManagerField) {
                payload.managerId = formData.managerId || "";
              }
              handleSave(payload);
              toggle();
            }}
          >
            {t("common.save")}
          </button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default UserModal;
