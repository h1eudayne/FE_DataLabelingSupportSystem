using DTOs.Requests;
using DTOs.Responses;

namespace BLL.Interfaces
{
    public interface ITaskService
    {
        Task AssignTasksToAnnotatorAsync(AssignTaskRequest request);
        Task<List<TaskResponse>> GetMyTasksAsync(int projectId, string annotatorId);
        Task<TaskResponse?> GetTaskDetailAsync(int assignmentId, string annotatorId);

        Task SubmitTaskAsync(string annotatorId, SubmitAnnotationRequest request);
        Task<AnnotatorStatsResponse> GetAnnotatorStatsAsync(string annotatorId);
    }
}