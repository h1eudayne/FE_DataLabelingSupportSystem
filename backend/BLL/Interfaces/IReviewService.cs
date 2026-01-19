using DTOs.Requests;
using DTOs.Responses;

namespace BLL.Interfaces
{
    public interface IReviewService
    {
        Task ReviewAssignmentAsync(string reviewerId, ReviewRequest request);
        Task<List<TaskResponse>> GetTasksForReviewAsync(int projectId);
    }
}