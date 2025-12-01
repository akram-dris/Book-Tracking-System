
using System;
using System.Collections.Generic;

namespace BookTrackingSystem.Models
{
    public class ReadingTarget
    {
        public int Id { get; set; }
        public int BookId { get; set; }
        public int LevelId { get; set; }
        public int PagesPerDay { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public Book? Book { get; set; }
        public TargetLevel? TargetLevel { get; set; }
        public ICollection<ReadingProgress>? ReadingProgresses { get; set; }
    }
}
