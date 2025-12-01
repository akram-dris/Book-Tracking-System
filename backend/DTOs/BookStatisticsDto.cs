namespace BookTrackingSystem.DTOs
{
    public class BookStatisticsDto
    {
        public double AverageBookLength { get; set; }
        public BookInfoDto? ShortestBook { get; set; }
        public BookInfoDto? LongestBook { get; set; }
        public double AverageReadingSpeed { get; set; }
        public double CompletionRate { get; set; }
        public Dictionary<string, int> BooksByStatus { get; set; } = new();
        public double AverageRating { get; set; }
        public BookInfoDto? HighestRatedBook { get; set; }
        public BookInfoDto? LowestRatedBook { get; set; }
        public Dictionary<int, int> RatingDistribution { get; set; } = new();
    }

    public class BookInfoDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public int TotalPages { get; set; }
        public string? AuthorName { get; set; }
        public int? Rating { get; set; }
    }
}
