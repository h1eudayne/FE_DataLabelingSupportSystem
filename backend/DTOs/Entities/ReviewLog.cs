using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DTOs.Entities
{
    public class ReviewLog
    {
        [Key]
        public int Id { get; set; }

        public int AssignmentId { get; set; }
        [ForeignKey("AssignmentId")]
        public Assignment? Assignment { get; set; }

        public string ReviewerId { get; set; } = string.Empty;
        [ForeignKey("ReviewerId")]
        public User? Reviewer { get; set; }

        public string Decision { get; set; } = string.Empty;
        public string? Comment { get; set; }
        public string? ErrorCategory { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}