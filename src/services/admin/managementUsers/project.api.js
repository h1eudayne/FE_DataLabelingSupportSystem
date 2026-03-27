import axios from "../../axios.customize";

const projectApi = {
  getAllProjectsUser: () => axios.get("/api/projects/all"),
  getProjectById: (id) => axios.get(`/api/projects/${id}`),
};

export default projectApi;
