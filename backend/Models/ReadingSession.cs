
using System;

namespace BookTrackingSystem.Models
{
    public class ReadingSession
    {
        public int Id { get; set; }
        public int BookId { get; set; }
        public DateTime Date { get; set; }
        public int PagesRead { get; set; }
        public string? Summary { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public Book? Book { get; set; }
        public Note? Note { get; set; }
    }
}
