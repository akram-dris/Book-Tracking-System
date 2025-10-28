
using System;

namespace BookTrackingSystem.Models
{
    public class Note
    {
        public int Id { get; set; }
        public int? BookId { get; set; }
        public int? SessionId { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public Book? Book { get; set; }
        public ReadingSession? ReadingSession { get; set; }
    }
}
