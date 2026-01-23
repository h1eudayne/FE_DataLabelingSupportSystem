import { useEffect, useState } from "react";
import { Modal, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from "reactstrap";

const UserModal = (props) => {
    const { isOpen, toggle, user, handleSave } = props;

    const [formData, setFormData] = useState({ role: "Annotator" });

    useEffect(() => {
        if (user) {
            setFormData({ role: user.role || "Annotator" });
        }
    }, []);

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
                            <Input type="select" defaultValue={user?.role || "Annotator"} onChange={handleChange}>
                                <option>Manager</option>
                                <option>Annotator</option>
                                <option>Reviewer</option>
                            </Input>
                        </FormGroup>
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <button className="btn btn-light" onClick={toggle}>Cancel</button>
                    <button className="btn btn-primary" onClick={() => {
                        handleSave(formData);
                        toggle();
                    }}>Save Changes</button>
                </ModalFooter>
            </Modal>
        </>
    )

};

export default UserModal;