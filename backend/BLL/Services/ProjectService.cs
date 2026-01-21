using BLL.Interfaces;
using DAL.Interfaces;
using DTOs.Constants;
using DTOs.Entities;
using DTOs.Requests;
using DTOs.Responses;
using System.Text.Json;
using System.Text;

namespace BLL.Services
{
    public class ProjectService : IProjectService
    {
        private readonly IProjectRepository _projectRepository;
        private readonly IUserRepository _userRepository;
        private readonly IRepository<UserProjectStat> _statsRepo;
        private readonly IRepository<Invoice> _invoiceRepo;

        public ProjectService(
            IProjectRepository projectRepository,
            IUserRepository userRepository,
            IRepository<UserProjectStat> statsRepo,
            IRepository<Invoice> invoiceRepo)
        {
            _projectRepository = projectRepository;
            _userRepository = userRepository;
            _statsRepo = statsRepo;
            _invoiceRepo = invoiceRepo;
        }

        public async Task<ProjectDetailResponse> CreateProjectAsync(string managerId, CreateProjectRequest request)
        {
            var manager = await _userRepository.GetByIdAsync(managerId);
            if (manager == null) throw new Exception("User not found");

            if (manager.Role != UserRoles.Manager && manager.Role != UserRoles.Admin)
                throw new Exception("Only Manager or Admin can create projects.");

            var project = new Project
            {
                ManagerId = managerId,
                Name = request.Name,
                Description = request.Description,
                PricePerLabel = request.PricePerLabel,
                TotalBudget = request.TotalBudget,
                Deadline = request.Deadline,
                CreatedDate = DateTime.UtcNow
            };

            foreach (var label in request.LabelClasses)
            {
                project.LabelClasses.Add(new LabelClass
                {
                    Name = label.Name,
                    Color = label.Color,
                    GuideLine = label.GuideLine
                });
            }

            await _projectRepository.AddAsync(project);
            await _projectRepository.SaveChangesAsync();

            return new ProjectDetailResponse
            {
                Id = project.Id,
                Name = project.Name,
                Description = project.Description,
                PricePerLabel = project.PricePerLabel,
                TotalBudget = project.TotalBudget,
                Deadline = project.Deadline,
                ManagerId = project.ManagerId,
                ManagerName = manager.FullName,
                ManagerEmail = manager.Email,
                Labels = project.LabelClasses.Select(l => new LabelResponse
                {
                    Id = l.Id,
                    Name = l.Name,
                    Color = l.Color,
                    GuideLine = l.GuideLine
                }).ToList(),
                TotalDataItems = 0,
                ProcessedItems = 0
            };
        }

        public async Task<List<ProjectSummaryResponse>> GetAssignedProjectsAsync(string annotatorId)
        {
            var projects = await _projectRepository.GetProjectsByAnnotatorAsync(annotatorId);
            return projects.Select(p => new ProjectSummaryResponse
            {
                Id = p.Id,
                Name = p.Name,
                Deadline = p.Deadline,
                Status = p.Deadline < DateTime.UtcNow ? "Expired" : "Active",
                TotalDataItems = 0,
                Progress = 0
            }).ToList();
        }

        public async Task ImportDataItemsAsync(int projectId, List<string> storageUrls)
        {
            var project = await _projectRepository.GetByIdAsync(projectId);
            if (project == null) throw new Exception("Project not found");

            foreach (var url in storageUrls)
            {
                project.DataItems.Add(new DataItem
                {
                    StorageUrl = url,
                    Status = "New",
                    MetaData = "{}",
                    UploadedDate = DateTime.UtcNow
                });
            }

            _projectRepository.Update(project);
            await _projectRepository.SaveChangesAsync();
        }

        public async Task<ProjectDetailResponse?> GetProjectDetailsAsync(int projectId)
        {
            var project = await _projectRepository.GetProjectWithDetailsAsync(projectId);
            if (project == null) return null;

            int total = project.DataItems.Count;
            int done = project.DataItems.Count(d => d.Status == "Done" || d.Status == "Completed" || d.Status == "Approved");
            int progressPercent = (total > 0) ? (int)((double)done / total * 100) : 0;

            return new ProjectDetailResponse
            {
                Id = project.Id,
                Name = project.Name,
                Description = project.Description,
                PricePerLabel = project.PricePerLabel,
                TotalBudget = project.TotalBudget,
                Deadline = project.Deadline,
                ManagerId = project.ManagerId,
                ManagerName = project.Manager?.FullName ?? "Unknown",
                ManagerEmail = project.Manager?.Email ?? "",
                Labels = project.LabelClasses.Select(l => new LabelResponse
                {
                    Id = l.Id,
                    Name = l.Name,
                    Color = l.Color,
                    GuideLine = l.GuideLine
                }).ToList(),
                TotalDataItems = total,
                ProcessedItems = done,
                Progress = progressPercent,
                Members = project.UserProjectStats?.Select(s => new MemberResponse
                {
                    Id = s.User.Id,
                    FullName = !string.IsNullOrEmpty(s.User.FullName) ? s.User.FullName : s.User.Email,
                    Email = s.User.Email,
                    Role = s.User.Role
                }).ToList() ?? new List<MemberResponse>()
            };
        }

        public async Task<List<ProjectSummaryResponse>> GetProjectsByManagerAsync(string managerId)
        {
            var projects = await _projectRepository.GetProjectsByManagerIdAsync(managerId);

            return projects.Select(p => new ProjectSummaryResponse
            {
                Id = p.Id,
                Name = p.Name,
                Deadline = p.Deadline,
                TotalDataItems = p.DataItems.Count,
                Status = DateTime.UtcNow > p.Deadline ? "Expired" : "Active",
                Progress = p.DataItems.Count > 0
                           ? (decimal)p.DataItems.Count(d => d.Status == "Done") / p.DataItems.Count * 100
                           : 0
            }).ToList();
        }

        public async Task UpdateProjectAsync(int projectId, UpdateProjectRequest request)
        {
            var project = await _projectRepository.GetByIdAsync(projectId);
            if (project == null) throw new Exception("Project not found");

            project.Name = request.Name;

            if (!string.IsNullOrEmpty(request.Description)) project.Description = request.Description;

            project.PricePerLabel = request.PricePerLabel;
            project.TotalBudget = request.TotalBudget;
            project.Deadline = request.Deadline;

            _projectRepository.Update(project);
            await _projectRepository.SaveChangesAsync();
        }

        public async Task DeleteProjectAsync(int projectId)
        {
            var project = await _projectRepository.GetByIdAsync(projectId);
            if (project == null) throw new Exception("Project not found");

            _projectRepository.Delete(project);
            await _projectRepository.SaveChangesAsync();
        }

        public async Task GenerateInvoicesAsync(int projectId)
        {
            var project = await _projectRepository.GetByIdAsync(projectId);
            if (project == null) throw new Exception("Project not found");
            var allStats = await _statsRepo.GetAllAsync();
            var projectStats = allStats.Where(s => s.ProjectId == projectId).ToList();

            foreach (var stat in projectStats)
            {
                if (stat.EstimatedEarnings > 0)
                {
                    var invoice = new Invoice
                    {
                        UserId = stat.UserId,
                        ProjectId = projectId,
                        TotalLabels = stat.TotalApproved,
                        UnitPrice = project.PricePerLabel,
                        TotalAmount = stat.EstimatedEarnings,
                        StartDate = DateTime.UtcNow.AddMonths(-1),
                        EndDate = DateTime.UtcNow,
                        Status = "Pending",
                        CreatedDate = DateTime.UtcNow
                    };
                    await _invoiceRepo.AddAsync(invoice);
                }
            }
            await _invoiceRepo.SaveChangesAsync();
        }
        public async Task<byte[]> ExportProjectDataAsync(int projectId, string userId)
        {
            var project = await _projectRepository.GetProjectForExportAsync(projectId);
            if (project == null) throw new Exception("Project not found");

            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) throw new Exception("User not found");

            if (user.Role != UserRoles.Admin && project.ManagerId != userId)
                throw new Exception("Unauthorized to export this project.");

            var dataItems = project.DataItems
                .Where(d => d.Status == "Done")
                .Select(d => new
                {
                    DataItemId = d.Id,
                    StorageUrl = d.StorageUrl,
                    Annotations = d.Assignments
                        .Where(a => a.Status == "Completed")
                        .SelectMany(a => a.Annotations)
                        .Select(an => new
                        {
                            ClassId = an.ClassId,
                            ClassName = project.LabelClasses.FirstOrDefault(l => l.Id == an.ClassId)?.Name,
                            Value = JsonDocument.Parse(an.Value).RootElement
                        })
                        .ToList()
                })
                .ToList();

            var exportData = new
            {
                ProjectId = project.Id,
                ProjectName = project.Name,
                ExportedAt = DateTime.UtcNow,
                Data = dataItems
            };

            var json = JsonSerializer.Serialize(exportData, new JsonSerializerOptions { WriteIndented = true });
            return Encoding.UTF8.GetBytes(json);
        }

        public async Task<ProjectStatisticsResponse> GetProjectStatisticsAsync(int projectId)
        {
            var project = await _projectRepository.GetProjectWithStatsDataAsync(projectId);
            if (project == null) throw new Exception("Project not found");

            var allStats = await _statsRepo.GetAllAsync();
            var moneyStats = allStats.Where(s => s.ProjectId == projectId).ToList();

            var allAssignments = project.DataItems.SelectMany(d => d.Assignments).ToList();

            var stats = new ProjectStatisticsResponse
            {
                ProjectId = project.Id,
                ProjectName = project.Name,
                TotalItems = project.DataItems.Count,
                CompletedItems = project.DataItems.Count(d => d.Status == "Done"),

                TotalAssignments = allAssignments.Count,
                PendingAssignments = allAssignments.Count(a => a.Status == "Assigned" || a.Status == "InProgress"),
                SubmittedAssignments = allAssignments.Count(a => a.Status == "Submitted"),
                ApprovedAssignments = allAssignments.Count(a => a.Status == "Completed"),
                RejectedAssignments = allAssignments.Count(a => a.Status == "Rejected")
            };

            if (stats.TotalItems > 0)
            {
                stats.ProgressPercentage = Math.Round((decimal)stats.CompletedItems / stats.TotalItems * 100, 2);
            }

            stats.AnnotatorPerformances = allAssignments
                .GroupBy(a => a.AnnotatorId)
                .Select(g =>
                {
                    var userMoneyStat = moneyStats.FirstOrDefault(m => m.UserId == g.Key);

                    return new AnnotatorPerformance
                    {
                        AnnotatorId = g.Key,
                        AnnotatorName = g.FirstOrDefault()?.Annotator.FullName ?? "Unknown",
                        TasksAssigned = g.Count(),
                        TasksCompleted = g.Count(a => a.Status == "Completed"),
                        TasksRejected = g.Count(a => a.Status == "Rejected"),
                        AverageDurationSeconds = 0
                    };
                }).ToList();

            var allAnnotations = allAssignments.SelectMany(a => a.Annotations).ToList();
            var labelCounts = allAnnotations
                .GroupBy(an => an.ClassId)
                .ToDictionary(g => g.Key, g => g.Count());

            stats.LabelDistributions = project.LabelClasses.Select(lc => new LabelDistribution
            {
                ClassName = lc.Name,
                Count = labelCounts.ContainsKey(lc.Id) ? labelCounts[lc.Id] : 0
            }).ToList();

            return stats;
        }
    }
}