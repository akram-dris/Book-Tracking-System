namespace BookTrackingSystem.DTOs
{
    public class AuthorStatisticsDto
    {
        public int TotalAuthorsRead { get; set; }
        public string? MostReadAuthor { get; set; }
        public int MostReadAuthorBookCount { get; set; }
        public double AuthorDiversityScore { get; set; }
        public List<AuthorBookCountDto> TopAuthorsByBooks { get; set; } = new();
        public List<AuthorPagesDto> AuthorsByPages { get; set; } = new();
    }

    public class AuthorBookCountDto
    {
        public int AuthorId { get; set; }
        public string AuthorName { get; set; } = string.Empty;
        public int BookCount { get; set; }
    }

    public class AuthorPagesDto
    {
        public int AuthorId { get; set; }
        public string AuthorName { get; set; } = string.Empty;
        public int TotalPages { get; set; }
    }
}
