
namespace BookTrackingSystem.DTOs
{
    public class TagDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public double? AverageRating { get; set; }
        public int TotalBooks { get; set; }
        public int CompletedBooks { get; set; }
        public int ReadingBooks { get; set; }
        public List<string> PreviewImageUrls { get; set; } = new();
    }
}
