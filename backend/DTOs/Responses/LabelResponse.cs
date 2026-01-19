namespace DTOs.Responses
{
    public class LabelResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public string? GuideLine { get; set; }
    }
}