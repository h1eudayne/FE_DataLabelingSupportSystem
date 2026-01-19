using DAL.Interfaces;
using DTOs.Entities;
using Microsoft.EntityFrameworkCore;

namespace DAL.Repositories
{
    public class AssignmentRepository : Repository<Assignment>, IAssignmentRepository
    {
        public AssignmentRepository(ApplicationDbContext context) : base(context) { }

        public async Task<List<Assignment>> GetAssignmentsByAnnotatorAsync(int projectId, string annotatorId)
        {
            return await _dbSet
                .Include(a => a.DataItem)
                .Where(a => a.AnnotatorId == annotatorId && (projectId == 0 || a.ProjectId == projectId))
                .OrderByDescending(a => a.AssignedDate)
                .ToListAsync();
        }

        public async Task<List<Assignment>> GetAssignmentsForReviewerAsync(int projectId)
        {
            return await _dbSet
                .Include(a => a.DataItem)
                .Include(a => a.Annotator)
                .Where(a => a.ProjectId == projectId && a.Status == "Submitted")
                .ToListAsync();
        }

        public async Task<Assignment?> GetAssignmentWithDetailsAsync(int id)
        {
            return await _dbSet
                .Include(a => a.DataItem)
                .Include(a => a.Project)
                    .ThenInclude(p => p.LabelClasses)
                .Include(a => a.Annotations)
                .Include(a => a.ReviewLogs)
                .FirstOrDefaultAsync(a => a.Id == id);
        }
        public async Task<List<DataItem>> GetUnassignedDataItemsAsync(int projectId, int quantity)
        {
            return await _context.DataItems
                .Where(d => d.ProjectId == projectId && d.Status == "New")
                .Take(quantity)
                .ToListAsync();
        }
    }
}