
using System;

namespace BookTrackingSystem.DTOs
{
    public class BookDto
    {
        public int Id { get; set; }
        public int AuthorId { get; set; }
        public string Title { get; set; } = string.Empty;
        public int TotalPages { get; set; }
        public string? ImageUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public AuthorDto? Author { get; set; }
    }
}
