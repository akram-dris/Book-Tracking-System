namespace BookTrackingSystem.DTOs
{
    public class TagStatisticsDto
    {
        public int TotalTags { get; set; }
        public string? FavoriteTag { get; set; }
        public int FavoriteTagBookCount { get; set; }
        public double TagDiversityScore { get; set; }
        public List<TagBookCountDto> TopTagsByBooks { get; set; } = new();
        public List<TagPagesDto> TagsByPages { get; set; } = new();
    }

    public class TagBookCountDto
    {
        public int TagId { get; set; }
        public string TagName { get; set; } = string.Empty;
        public int BookCount { get; set; }
    }

    public class TagPagesDto
    {
        public int TagId { get; set; }
        public string TagName { get; set; } = string.Empty;
        public int TotalPages { get; set; }
    }
}
