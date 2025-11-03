
using Microsoft.AspNetCore.Http;

namespace BookTrackingSystem.DTOs
{
    public class CreateBookDto
    {
        public int AuthorId { get; set; }
        public string Title { get; set; } = string.Empty;
        public int TotalPages { get; set; }
        public string? Summary { get; set; }
        public IFormFile? ImageFile { get; set; }
    }
}
