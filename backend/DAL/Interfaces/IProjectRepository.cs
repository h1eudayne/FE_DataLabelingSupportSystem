using DTOs.Entities;

namespace DAL.Interfaces
{
    public interface IProjectRepository : IRepository<Project>
    {
        Task<Project?> GetProjectWithDetailsAsync(int id);
        Task<Project?> GetProjectForExportAsync(int id);
        Task<Project?> GetProjectWithStatsDataAsync(int id);
        Task<List<Project>> GetProjectsByManagerIdAsync(string managerId);

        Task<List<Project>> GetProjectsByAnnotatorAsync(string annotatorId);
    }
}