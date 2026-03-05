import axios from "../../axios.customize";

const labelService = {
  createLabel: (data) => axios.post("/api/labels", data),
  updateLabel: (id, data) => axios.put(`/api/labels/${id}`, data),
  deleteLabel: (id) => axios.delete(`/api/labels/${id}`),
};

export default labelService;
