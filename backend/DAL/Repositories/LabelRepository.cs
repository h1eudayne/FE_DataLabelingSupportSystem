using DAL.Interfaces;
using DTOs.Entities;
using Microsoft.EntityFrameworkCore;

namespace DAL.Repositories
{
    public class LabelRepository : Repository<LabelClass>, ILabelRepository
    {
        public LabelRepository(ApplicationDbContext context) : base(context) { }

        public async Task<bool> ExistsInProjectAsync(int projectId, string labelName)
        {
            return await _dbSet.AnyAsync(l => l.ProjectId == projectId && l.Name == labelName);
        }
    }
}