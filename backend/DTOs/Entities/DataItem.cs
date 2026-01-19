using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DTOs.Entities
{
    public class DataItem
    {
        [Key]
        public int Id { get; set; }

        public int ProjectId { get; set; }
        [ForeignKey("ProjectId")]
        public virtual Project? Project { get; set; }

        [Required]
        public string StorageUrl { get; set; } = string.Empty;

        public string Status { get; set; } = "New";

        public string MetaData { get; set; } = "{}";

        public DateTime UploadedDate { get; set; } = DateTime.UtcNow;

        public virtual ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
    }
}