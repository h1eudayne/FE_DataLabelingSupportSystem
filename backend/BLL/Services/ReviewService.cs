using BLL.Interfaces;
using DAL.Interfaces;
using DTOs.Entities;
using DTOs.Requests;
using DTOs.Responses;
using System.Text.Json;

namespace BLL.Services
{
    public class ReviewService : IReviewService
    {
        private readonly IAssignmentRepository _assignmentRepo;
        private readonly IRepository<ReviewLog> _reviewLogRepo;
        private readonly IRepository<DataItem> _dataItemRepo;
        private readonly IRepository<UserProjectStat> _statsRepo;
        private readonly IRepository<Project> _projectRepo;

        public ReviewService(
            IAssignmentRepository assignmentRepo,
            IRepository<ReviewLog> reviewLogRepo,
            IRepository<DataItem> dataItemRepo,
            IRepository<UserProjectStat> statsRepo,
            IRepository<Project> projectRepo)
        {
            _assignmentRepo = assignmentRepo;
            _reviewLogRepo = reviewLogRepo;
            _dataItemRepo = dataItemRepo;
            _statsRepo = statsRepo;
            _projectRepo = projectRepo;
        }
        public async Task ReviewAssignmentAsync(string reviewerId, ReviewRequest request)
        {
            var assignment = await _assignmentRepo.GetByIdAsync(request.AssignmentId);
            if (assignment == null) throw new Exception("Assignment not found");
            if (assignment.Status != "Submitted")
                throw new Exception("This task is not ready for review.");
            var project = await _projectRepo.GetByIdAsync(assignment.ProjectId);
            if (project == null) throw new Exception("Project info not found");
            var allStats = await _statsRepo.GetAllAsync();
            var stats = allStats.FirstOrDefault(s => s.UserId == assignment.AnnotatorId && s.ProjectId == assignment.ProjectId);

            if (stats == null)
            {
                stats = new UserProjectStat
                {
                    UserId = assignment.AnnotatorId,
                    ProjectId = assignment.ProjectId,
                    TotalAssigned = 0,
                    EfficiencyScore = 100,
                    EstimatedEarnings = 0
                };
                await _statsRepo.AddAsync(stats);
            }
            var log = new ReviewLog
            {
                AssignmentId = assignment.Id,
                ReviewerId = reviewerId,
                Decision = request.IsApproved ? "Approve" : "Reject",
                Comment = request.Comment,
                ErrorCategory = request.ErrorCategory,
                CreatedAt = DateTime.UtcNow
            };
            await _reviewLogRepo.AddAsync(log);
            if (request.IsApproved)
            {
                assignment.Status = "Completed";
                stats.TotalApproved++;
                stats.EstimatedEarnings = stats.TotalApproved * project.PricePerLabel;
                if (assignment.DataItemId > 0)
                {
                    var dataItem = await _dataItemRepo.GetByIdAsync(assignment.DataItemId);
                    if (dataItem != null)
                    {
                        dataItem.Status = "Done";
                        _dataItemRepo.Update(dataItem);
                    }
                }
            }
            else
            {
                assignment.Status = "Rejected";
                stats.TotalRejected++;
            }
            if (stats.TotalAssigned > 0)
            {
                stats.EfficiencyScore = ((float)stats.TotalApproved / stats.TotalAssigned) * 100;
            }
            stats.Date = DateTime.UtcNow;
            _statsRepo.Update(stats);
            _assignmentRepo.Update(assignment);

            await _assignmentRepo.SaveChangesAsync();
        }

        public async Task<List<TaskResponse>> GetTasksForReviewAsync(int projectId)
        {
            var assignments = await _assignmentRepo.GetAssignmentsForReviewerAsync(projectId);

            return assignments.Select(a => new TaskResponse
            {
                AssignmentId = a.Id,
                DataItemId = a.DataItemId,
                StorageUrl = a.DataItem?.StorageUrl ?? "",
                ProjectName = a.Project?.Name ?? "",
                Status = a.Status,
                Labels = a.Project?.LabelClasses.Select(l => new LabelResponse
                {
                    Id = l.Id,
                    Name = l.Name,
                    Color = l.Color,
                    GuideLine = l.GuideLine
                }).ToList() ?? new List<LabelResponse>(),
                ExistingAnnotations = a.Annotations.Select(an => new
                {
                    an.ClassId,
                    Value = JsonDocument.Parse(an.Value).RootElement
                }).ToList<object>()
            }).ToList();
        }
    }
}