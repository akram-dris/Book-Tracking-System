namespace BookTrackingSystem.Models.Pagination
{
    public class PaginationParams
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public string? Search { get; set; }
        public string? Sort { get; set; }
        public int? StatusFilter { get; set; }
        public int? AuthorId { get; set; }
        public int? Rating { get; set; }
    }
}
