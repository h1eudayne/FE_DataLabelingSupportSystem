using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DTOs.Entities
{
    public class UserProjectStat
    {
        [Key]
        public int Id { get; set; }

        public string UserId { get; set; } = string.Empty;

        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;

        public int ProjectId { get; set; }

        [ForeignKey("ProjectId")]
        public virtual Project Project { get; set; } = null!;

        public DateTime Date { get; set; }

        public int TotalAssigned { get; set; }
        public int TotalApproved { get; set; }
        public int TotalRejected { get; set; }
        public float EfficiencyScore { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal EstimatedEarnings { get; set; }
    }
}