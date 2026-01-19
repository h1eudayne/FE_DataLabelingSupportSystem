using System.ComponentModel.DataAnnotations;

namespace DTOs.Requests
{

    public class AssignTaskRequest
    {
        [Required]
        public int ProjectId { get; set; }
        [Required]
        public string AnnotatorId { get; set; } = string.Empty;
        [Required]
        public int Quantity { get; set; }
    }

    public class SubmitAnnotationRequest
    {
        [Required]
        public int AssignmentId { get; set; }
        public List<AnnotationDetail> Annotations { get; set; } = new List<AnnotationDetail>();
    }

    public class AnnotationDetail
    {
        public int LabelClassId { get; set; }
        public string ValueJson { get; set; } = string.Empty;
    }
}