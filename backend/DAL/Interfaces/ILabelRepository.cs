using DTOs.Entities;

namespace DAL.Interfaces
{
    public interface ILabelRepository : IRepository<LabelClass>
    {
        Task<bool> ExistsInProjectAsync(int projectId, string labelName);
    }
}