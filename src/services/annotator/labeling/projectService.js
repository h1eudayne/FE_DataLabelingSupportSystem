import axios from "../../axios.customize";

const projectService = {
  getById: (id) => axios.get(`/api/projects/${id}`),
};

export default projectService;
