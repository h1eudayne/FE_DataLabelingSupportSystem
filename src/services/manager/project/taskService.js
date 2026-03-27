import axios from "../../axios.customize";

const taskService = {
  assignTask: (data) => {
    console.log('=== TASK ASSIGNMENT REQUEST ===');
    console.log('Endpoint: POST /api/tasks/assign-team');
    console.log('Payload:', JSON.stringify(data, null, 2));
    return axios.post("/api/tasks/assign-team", data)
      .then(response => {
        console.log('=== TASK ASSIGNMENT SUCCESS ===');
        console.log('Response:', response.data);
        return response;
      })
      .catch(error => {
        console.error('=== TASK ASSIGNMENT ERROR ===');
        console.error('Status:', error.response?.status);
        console.error('Error data:', error.response?.data);
        console.error('Full error:', error);
        throw error;
      });
  },

  getMyTasks: () => axios.get("/api/tasks/projects"),

  getTaskDetail: (assignmentId) =>
    axios.get(`/api/tasks/assignments/${assignmentId}`),

  submitTask: (data) => axios.post("/api/tasks/submissions", data),
};

export default taskService;
