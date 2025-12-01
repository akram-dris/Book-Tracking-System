
using System;

namespace BookTrackingSystem.Models
{
    public class ReadingProgress
    {
        public int Id { get; set; }
        public int BookId { get; set; }
        public int TargetId { get; set; }
        public float PercentageComplete { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? FinishDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public Book? Book { get; set; }
        public ReadingTarget? ReadingTarget { get; set; }
    }
}
