using DAL.Interfaces;
using DTOs.Entities;
using DTOs.Responses;
using Microsoft.EntityFrameworkCore;

namespace DAL.Repositories
{
    public class AssignmentRepository : Repository<Assignment>, IAssignmentRepository
    {
        private readonly ApplicationDbContext _context;

        public AssignmentRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<List<Assignment>> GetAssignmentsByAnnotatorAsync(string annotatorId, int projectId = 0, string? status = null)
        {
            var query = _context.Assignments
                .Include(a => a.DataItem)
                .Include(a => a.Project)
                .Include(a => a.ReviewLogs)
                .Where(a => a.AnnotatorId == annotatorId);

            if (projectId > 0)
            {
                query = query.Where(a => a.ProjectId == projectId);
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(a => a.Status == status);
            }

            return await query.OrderByDescending(a => a.AssignedDate).ToListAsync();
        }

        public async Task<List<Assignment>> GetAssignmentsForReviewerAsync(int projectId)
        {
            return await _context.Assignments
                .Include(a => a.DataItem)   
                .Include(a => a.Annotator)  
                .Where(a => a.ProjectId == projectId && a.Status == "Submitted")
                .OrderBy(a => a.SubmittedAt)
                .ToListAsync();
        }

        public async Task<Assignment?> GetAssignmentWithDetailsAsync(int assignmentId)
        {
            return await _context.Assignments
                .Include(a => a.DataItem)
                .Include(a => a.Project)
                    .ThenInclude(p => p.LabelClasses)
                .Include(a => a.Annotations)
                .Include(a => a.ReviewLogs)
                .FirstOrDefaultAsync(a => a.Id == assignmentId);
        }
        public async Task<List<DataItem>> GetUnassignedDataItemsAsync(int projectId, int quantity)
        {
            return await _context.DataItems
                .Where(d => d.ProjectId == projectId && d.Status == "New")
                .Take(quantity)
                .ToListAsync();
        }

        public async Task<AnnotatorStatsResponse> GetAnnotatorStatsAsync(string annotatorId)
        {
            var stats = await _context.Assignments
                .Where(a => a.AnnotatorId == annotatorId)
                .GroupBy(a => 1)
                .Select(g => new
                {
                    Total = g.Count(),
                    Submitted = g.Count(x => x.Status == "Submitted"),
                    Rejected = g.Count(x => x.Status == "Rejected"),
                    Completed = g.Count(x => x.Status == "Completed" || x.Status == "Approved")
                })
                .Select(x => new AnnotatorStatsResponse
                {
                    TotalAssigned = x.Total,
                    Submitted = x.Submitted,
                    Rejected = x.Rejected,
                    Completed = x.Completed,
                    Pending = x.Total - (x.Submitted + x.Rejected + x.Completed)
                })
                .FirstOrDefaultAsync();

            return stats ?? new AnnotatorStatsResponse();
        }
    }
}