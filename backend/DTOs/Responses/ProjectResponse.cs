namespace DTOs.Responses
{
    public class ProjectDetailResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }

        public decimal PricePerLabel { get; set; }
        public decimal TotalBudget { get; set; }
        public DateTime Deadline { get; set; }

        public string ManagerId { get; set; } = string.Empty;
        public string ManagerName { get; set; } = string.Empty;
        public string ManagerEmail { get; set; } = string.Empty;

        public List<LabelResponse> Labels { get; set; } = new List<LabelResponse>();
        public int TotalDataItems { get; set; }
        public int ProcessedItems { get; set; }
        public int Progress { get; set; }
        public List<MemberResponse> Members { get; set; } = new List<MemberResponse>();
    }

    public class MemberResponse
    {
        public string Id { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }

    public class ProjectSummaryResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime Deadline { get; set; }
        public string Status { get; set; } = "Active";
        public int TotalDataItems { get; set; }
        public decimal Progress { get; set; }
    }
}