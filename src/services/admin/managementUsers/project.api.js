import axios from "../../axios.customize";

const projectApi = {
  getAllProjectsUser: () => axios.get("/api/projects/all"),
};

export default projectApi;
