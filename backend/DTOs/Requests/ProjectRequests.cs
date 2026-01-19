using System.ComponentModel.DataAnnotations;

namespace DTOs.Requests
{
    public class CreateProjectRequest
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal PricePerLabel { get; set; }
        public decimal TotalBudget { get; set; }
        public DateTime Deadline { get; set; }
        public string AllowGeometryTypes { get; set; } = "Rectangle";
        public List<LabelRequest> LabelClasses { get; set; } = new List<LabelRequest>();
    }

    public class UpdateProjectRequest
    {
        public string Name { get; set; } = string.Empty;
        public decimal PricePerLabel { get; set; }
        public decimal TotalBudget { get; set; }
        public DateTime Deadline { get; set; }
    }

    public class LabelRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Color { get; set; } = "#000000";
        public string GuideLine { get; set; } = string.Empty;
    }

    public class ImportDataRequest
    {
        public List<string> StorageUrls { get; set; } = new List<string>();
    }

}