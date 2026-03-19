import { useState } from "react";
import {
  Modal,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
} from "reactstrap";

const UserModal = (props) => {
  const { isOpen, toggle, user, handleSave } = props;

  const [formData, setFormData] = useState({ role: "Annotator" });

  // Sync state on open to avoid useEffect sync loop
  const [prevIsOpen, setPrevIsOpen] = useState(false);
  if (isOpen && !prevIsOpen) {
    if (user && formData.role !== user.role) {
      setFormData({ role: user.role || "Annotator" });
    }
    setPrevIsOpen(true);
  } else if (!isOpen && prevIsOpen) {
    setPrevIsOpen(false);
  }

  const handleChange = (e) => {
    setFormData({ role: e.target.value });
  };
  return (
    <>
      <Modal isOpen={isOpen} toggle={toggle} centered>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label>Role</Label>
              <Input
                type="select"
                defaultValue={user?.role || "Annotator"}
                onChange={handleChange}
              >
                <option>Manager</option>
                <option>Annotator</option>
                <option>Reviewer</option>
              </Input>
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <button className="btn btn-light" onClick={toggle}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              handleSave(formData);
              toggle();
            }}
          >
            Save Changes
          </button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default UserModal;
