import axios from "../../axios.customize";

const disputeService = {
  getDisputes: (projectId) =>
    axios.get("/api/disputes", { params: { projectId } }),

  resolveDispute: (data) => axios.post("/api/disputes/resolve", data),

  createDispute: (data) => axios.post("/api/disputes", data),
};

export default disputeService;
