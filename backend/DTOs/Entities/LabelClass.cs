using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DTOs.Entities
{
    public class LabelClass
    {
        [Key]
        public int Id { get; set; }

        public int ProjectId { get; set; }

        [ForeignKey("ProjectId")]
        public virtual Project Project { get; set; } = null!;

        [Required]
        public string Name { get; set; } = string.Empty;

        public string Color { get; set; } = "#FFFFFF";

        public string? GuideLine { get; set; }
    }
}