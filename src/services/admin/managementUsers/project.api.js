import axios from "../../axios.customize";

const projectApi = {
  getAllProjectsUser: (id) => axios.get(`/api/projects/user/${id}`),
};

export default projectApi;
