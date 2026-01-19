using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DTOs.Entities
{
    public class Assignment
    {
        [Key]
        public int Id { get; set; }

        public int ProjectId { get; set; }
        [ForeignKey("ProjectId")]
        public virtual Project Project { get; set; } = null!;

        public int DataItemId { get; set; }
        [ForeignKey("DataItemId")]
        public virtual DataItem DataItem { get; set; } = null!;

        public string AnnotatorId { get; set; } = string.Empty;
        [ForeignKey("AnnotatorId")]
        public virtual User Annotator { get; set; } = null!;
        public DateTime AssignedDate { get; set; } = DateTime.UtcNow;
        public DateTime? SubmittedAt { get; set; }
        public int DurationSeconds { get; set; }

        public string Status { get; set; } = "Assigned";

        public virtual ICollection<Annotation> Annotations { get; set; } = new List<Annotation>();
        public virtual ICollection<ReviewLog> ReviewLogs { get; set; } = new List<ReviewLog>();
    }
}