using System.ComponentModel.DataAnnotations;

namespace DTOs.Entities
{
    public class User
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        public string Role { get; set; } = "Annotator"; 
        public virtual PaymentInfo? PaymentInfo { get; set; }
        public virtual ICollection<Project> ManagedProjects { get; set; } = new List<Project>();
        public virtual ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
        public virtual ICollection<ReviewLog> ReviewsGiven { get; set; } = new List<ReviewLog>();
        public virtual ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
        public virtual ICollection<UserProjectStat> ProjectStats { get; set; } = new List<UserProjectStat>();
    }
}