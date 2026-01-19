using DTOs.Requests;
using DTOs.Responses;

namespace BLL.Interfaces
{
    public interface IProjectService
    {
        Task<ProjectDetailResponse> CreateProjectAsync(string managerId, CreateProjectRequest request);
        Task<List<ProjectSummaryResponse>> GetAssignedProjectsAsync(string annotatorId);
        Task ImportDataItemsAsync(int projectId, List<string> storageUrls);
        Task<ProjectDetailResponse?> GetProjectDetailsAsync(int projectId);

        Task<List<ProjectSummaryResponse>> GetProjectsByManagerAsync(string managerId);
        Task UpdateProjectAsync(int projectId, UpdateProjectRequest request);
        Task DeleteProjectAsync(int projectId);

        Task<byte[]> ExportProjectDataAsync(int projectId, string userId);
        Task<ProjectStatisticsResponse> GetProjectStatisticsAsync(int projectId);
        Task GenerateInvoicesAsync(int projectId);
 
    }
}