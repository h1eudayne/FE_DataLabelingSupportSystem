using BLL.Interfaces;
using DAL.Interfaces;
using DTOs.Entities;
using DTOs.Requests;
using DTOs.Responses;
using System.Text.Json;

namespace BLL.Services
{
    public class TaskService : ITaskService
    {
        private readonly IAssignmentRepository _assignmentRepo;
        private readonly IRepository<DataItem> _dataItemRepo;
        private readonly IRepository<Annotation> _annotationRepo;
        private readonly IRepository<UserProjectStat> _statsRepo;

        public TaskService(
            IAssignmentRepository assignmentRepo,
            IRepository<DataItem> dataItemRepo,
            IRepository<Annotation> annotationRepo,
            IRepository<UserProjectStat> statsRepo)
        {
            _assignmentRepo = assignmentRepo;
            _dataItemRepo = dataItemRepo;
            _annotationRepo = annotationRepo;
            _statsRepo = statsRepo;
        }

        public async Task AssignTasksToAnnotatorAsync(AssignTaskRequest request)
        {
            var dataItems = await _assignmentRepo.GetUnassignedDataItemsAsync(request.ProjectId, request.Quantity);
            if (!dataItems.Any()) throw new Exception("Not enough available data items.");

            foreach (var item in dataItems)
            {
                var assignment = new Assignment
                {
                    ProjectId = request.ProjectId,
                    DataItemId = item.Id,
                    AnnotatorId = request.AnnotatorId,
                    Status = "Assigned",
                    AssignedDate = DateTime.UtcNow
                };

                item.Status = "Assigned";
                _dataItemRepo.Update(item);
                await _assignmentRepo.AddAsync(assignment);
            }
            var allStats = await _statsRepo.GetAllAsync();
            var stats = allStats.FirstOrDefault(s => s.UserId == request.AnnotatorId && s.ProjectId == request.ProjectId);

            if (stats == null)
            {
                stats = new UserProjectStat
                {
                    UserId = request.AnnotatorId,
                    ProjectId = request.ProjectId,
                    TotalAssigned = 0,
                    EfficiencyScore = 100,
                    EstimatedEarnings = 0,
                    Date = DateTime.UtcNow
                };
                await _statsRepo.AddAsync(stats);
            }

            stats.TotalAssigned += dataItems.Count;
            stats.Date = DateTime.UtcNow;
            _statsRepo.Update(stats);
            await _assignmentRepo.SaveChangesAsync();
        }

        public async Task<List<TaskResponse>> GetMyTasksAsync(int projectId, string annotatorId)
        {
            var assignments = await _assignmentRepo.GetAssignmentsByAnnotatorAsync(projectId, annotatorId);

            return assignments.Select(a => new TaskResponse
            {
                AssignmentId = a.Id,
                DataItemId = a.DataItemId,
                StorageUrl = a.DataItem?.StorageUrl ?? "",
                Status = a.Status
            }).ToList();
        }

        public async Task<TaskResponse?> GetTaskDetailAsync(int assignmentId, string annotatorId)
        {
            var assignment = await _assignmentRepo.GetAssignmentWithDetailsAsync(assignmentId);

            if (assignment == null) return null;
            if (assignment.AnnotatorId != annotatorId) throw new Exception("Unauthorized");

            if (assignment.Status == "Assigned")
            {
                assignment.Status = "InProgress";
                _assignmentRepo.Update(assignment);
                await _assignmentRepo.SaveChangesAsync();
            }

            string? rejectReason = null;
            if (assignment.Status == "Rejected")
            {
                var lastLog = assignment.ReviewLogs.OrderByDescending(r => r.CreatedAt).FirstOrDefault();
                rejectReason = lastLog?.Comment;
            }

            return new TaskResponse
            {
                AssignmentId = assignment.Id,
                DataItemId = assignment.DataItemId,
                StorageUrl = assignment.DataItem?.StorageUrl ?? "",
                ProjectName = assignment.Project?.Name ?? "",
                Status = assignment.Status,
                RejectReason = rejectReason,

                Labels = assignment.Project?.LabelClasses.Select(l => new LabelResponse
                {
                    Id = l.Id,
                    Name = l.Name,
                    Color = l.Color,
                    GuideLine = l.GuideLine
                }).ToList() ?? new List<LabelResponse>(),
                ExistingAnnotations = assignment.Annotations.Select(an => new
                {
                    an.ClassId,
                    Value = JsonDocument.Parse(an.Value).RootElement
                }).ToList<object>()
            };
        }

        public async Task<AnnotatorStatsResponse> GetAnnotatorStatsAsync(string annotatorId)
        {
            var tasks = await _assignmentRepo.GetAssignmentsByAnnotatorAsync(0, annotatorId);

            return new AnnotatorStatsResponse
            {
                TotalAssigned = tasks.Count,
                Pending = tasks.Count(t => t.Status == "Assigned" || t.Status == "InProgress"),
                Submitted = tasks.Count(t => t.Status == "Submitted"),
                Rejected = tasks.Count(t => t.Status == "Rejected"),
                Completed = tasks.Count(t => t.Status == "Completed")
            };
        }

        public async Task SubmitTaskAsync(string annotatorId, SubmitAnnotationRequest request)
        {
            var assignment = await _assignmentRepo.GetAssignmentWithDetailsAsync(request.AssignmentId);
            if (assignment == null) throw new Exception("Task not found");
            if (assignment.AnnotatorId != annotatorId)
                throw new Exception("You are not authorized to submit this task.");
            if (assignment.Status == "Completed")
                throw new Exception("This task is already completed.");
            if (assignment.Annotations != null && assignment.Annotations.Any())
            {
                foreach (var oldAnno in assignment.Annotations)
                {
                    _annotationRepo.Delete(oldAnno);
                }
            }
            foreach (var item in request.Annotations)
            {
                await _annotationRepo.AddAsync(new Annotation
                {
                    AssignmentId = assignment.Id,
                    ClassId = item.LabelClassId,
                    Value = item.ValueJson
                });
            }
            assignment.Status = "Submitted";
            assignment.SubmittedAt = DateTime.UtcNow;
            _assignmentRepo.Update(assignment);
            await _assignmentRepo.SaveChangesAsync();
        }
    }
}