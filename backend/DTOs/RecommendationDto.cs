namespace BookTrackingSystem.DTOs
{
    public class RecommendationDto
    {
        public int BookId { get; set; }
        public string BookTitle { get; set; } = string.Empty;
        public string? AuthorName { get; set; }
        public int TotalPages { get; set; }
        public string? ImageUrl { get; set; }
        public string RecommendationReason { get; set; } = string.Empty;
        public double? AuthorAverageRating { get; set; }
        public double? TagAverageRating { get; set; }
        public ICollection<string> Tags { get; set; } = new List<string>();
    }
}
