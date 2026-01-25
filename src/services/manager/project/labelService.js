import axios from "../../axios.customize";

const labelService = {
  createLabel: (data) => axios.post("/api/Label", data),
  updateLabel: (id, data) => axios.put(`/api/Label/${id}`, data),
  deleteLabel: (id) => axios.delete(`/api/Label/${id}`),
};

export default labelService;
