using System.ComponentModel.DataAnnotations;

namespace DTOs.Requests
{
    public class CreateLabelRequest
    {
        [Required]
        public int ProjectId { get; set; }
        [Required]
        public string Name { get; set; } = string.Empty;
        public string Color { get; set; } = "#FFFFFF";
        public string? GuideLine { get; set; }
    }

    public class UpdateLabelRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public string? GuideLine { get; set; }
    }
}