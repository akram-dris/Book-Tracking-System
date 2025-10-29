
using System;

namespace BookTrackingSystem.DTOs
{
    public class AuthorDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Bio { get; set; }
        public string? ImageUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
