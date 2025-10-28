
using System;
using System.Collections.Generic;

namespace BookTrackingSystem.Models
{
    public class Book
    {
        public int Id { get; set; }
        public int AuthorId { get; set; }
        public string Name { get; set; } = string.Empty;
        public int TotalPages { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public Author? Author { get; set; }
        public ICollection<BookTagAssignment>? BookTagAssignments { get; set; }
        public ICollection<ReadingSession>? ReadingSessions { get; set; }
        public ICollection<ReadingTarget>? ReadingTargets { get; set; }
        public ICollection<ReadingProgress>? ReadingProgresses { get; set; }
        public ICollection<Note>? Notes { get; set; }
    }
}
