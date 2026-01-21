using DAL.Interfaces;
using DTOs.Entities;
using Microsoft.EntityFrameworkCore;

namespace DAL.Repositories
{
    public class ProjectRepository : Repository<Project>, IProjectRepository
    {
        public ProjectRepository(ApplicationDbContext context) : base(context) { }
        public async Task<Project?> GetProjectWithDetailsAsync(int id)
        {
            return await _context.Projects
                .Include(p => p.Manager)
                .Include(p => p.LabelClasses)
                .Include(p => p.DataItems)
                .Include(p => p.UserProjectStats)
                    .ThenInclude(s => s.User)
                .FirstOrDefaultAsync(p => p.Id == id);
        }
        public async Task<Project?> GetProjectForExportAsync(int id)
        {
            return await _context.Projects
                .Include(p => p.LabelClasses)
                .Include(p => p.DataItems)
                    .ThenInclude(d => d.Assignments)
                        .ThenInclude(a => a.Annotations)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<Project?> GetProjectWithStatsDataAsync(int id)
        {
            return await _context.Projects
                .Include(p => p.LabelClasses)
                .Include(p => p.DataItems)
                    .ThenInclude(d => d.Assignments)
                        .ThenInclude(a => a.Annotator)
                 .Include(p => p.DataItems)
                    .ThenInclude(d => d.Assignments)
                        .ThenInclude(a => a.Annotations)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<List<Project>> GetProjectsByManagerIdAsync(string managerId)
        {
            return await _context.Projects
                .Include(p => p.DataItems)
                .Where(p => p.ManagerId == managerId)
                .OrderByDescending(p => p.Id)
                .ToListAsync();
        }

        public async Task<List<Project>> GetProjectsByAnnotatorAsync(string annotatorId)
        {
            return await _context.Assignments
                .Where(a => a.AnnotatorId == annotatorId)
                .Include(a => a.Project)
                .Select(a => a.Project)
                .Distinct()
                .OrderByDescending(p => p.Id)
                .ToListAsync();
        }
    }
}