using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DTOs.Entities
{
    public class Project
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string ManagerId { get; set; } = string.Empty;

        [ForeignKey("ManagerId")]
        public virtual User? Manager { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal PricePerLabel { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalBudget { get; set; }

        public DateTime Deadline { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public string AllowGeometryTypes { get; set; } = "Rectangle";

        public virtual ICollection<LabelClass> LabelClasses { get; set; } = new List<LabelClass>();
        public virtual ICollection<DataItem> DataItems { get; set; } = new List<DataItem>();
    }
}