using DTOs.Entities;

namespace DAL.Interfaces
{
    public interface IAssignmentRepository : IRepository<Assignment>
    {
        Task<List<Assignment>> GetAssignmentsByAnnotatorAsync(int projectId, string annotatorId);
        Task<List<Assignment>> GetAssignmentsForReviewerAsync(int projectId);
        Task<Assignment?> GetAssignmentWithDetailsAsync(int id);
        Task<List<DataItem>> GetUnassignedDataItemsAsync(int projectId, int quantity);
    }
}