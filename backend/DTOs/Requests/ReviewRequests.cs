namespace DTOs.Requests
{
    public class ReviewRequest
    {
        public int AssignmentId { get; set; }
        public bool IsApproved { get; set; }
        public string? Comment { get; set; }
        public string? ErrorCategory { get; set; }
    }
}