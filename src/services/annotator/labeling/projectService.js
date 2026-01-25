import axios from "../../axios.customize";

const projectService = {
  getById: (id) => axios.get(`/api/Project/${id}`),
};

export default projectService;
