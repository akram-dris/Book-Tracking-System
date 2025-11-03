using BookTrackingSystem.Models.Enums;
using System;

namespace BookTrackingSystem.DTOs
{
    public class UpdateBookStatusDto
    {
        public ReadingStatus Status { get; set; }
        public DateTime? StartedReadingDate { get; set; }
        public DateTime? CompletedDate { get; set; }
        public string? Summary { get; set; }
    }
}
