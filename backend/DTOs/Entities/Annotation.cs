using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DTOs.Entities
{
    public class Annotation
    {
        [Key]
        public int Id { get; set; }
        public int AssignmentId { get; set; }
        [ForeignKey("AssignmentId")]
        public virtual Assignment Assignment { get; set; } = null!;
        public int ClassId { get; set; }
        [ForeignKey("ClassId")]
        public virtual LabelClass LabelClass { get; set; } = null!;
        [Required]
        public string Value { get; set; } = "{}";
    }
}