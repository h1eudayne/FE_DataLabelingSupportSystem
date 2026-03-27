import axios from "./axios.customize";

/**
 * REST API service for activity log management.
 * Maps to backend ActivityLogController (api/logs).
 */
const activityLogService = {
  /**
   * Retrieves system-wide activity logs.
   * Only accessible by Admins.
   * @returns {Promise<{data: Array<any>}>}
   */
  getSystemLogs: () => {
    return axios.get("/api/logs/system");
  },

  /**
   * Retrieves activity logs for a specific project.
   * Accessible by Admins and Managers.
   * @param {number|string} projectId - The ID of the target project.
   * @returns {Promise<{data: Array<any>}>}
   */
  getProjectLogs: (projectId) => {
    return axios.get(`/api/logs/projects/${projectId}`);
  },
};

export default activityLogService;
