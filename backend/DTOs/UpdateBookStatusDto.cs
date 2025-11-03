using BookTrackingSystem.Models.Enums;
using System;

namespace BookTrackingSystem.DTOs
{
    public class UpdateBookStatusDto
    {
        public ReadingStatus Status { get; set; }
        public DateTime? StartedReadingDate { get; set; }
    }
}
