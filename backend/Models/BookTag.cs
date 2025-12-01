
using System;
using System.Collections.Generic;

namespace BookTrackingSystem.Models
{
    public class BookTag
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<BookTagAssignment>? BookTagAssignments { get; set; }
    }
}
