using System.ComponentModel.DataAnnotations;
using BookTrackingSystem.ValidationAttributes;

namespace BookTrackingSystem.DTOs
{
    public class CreateReadingSessionDto
    {
        [Required]
        public int BookId { get; set; }
        [Required]
        [NoFutureDate(ErrorMessage = "Date cannot be in the future.")]
        public DateTime Date { get; set; }
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Pages read must be at least 1.")]
        public int PagesRead { get; set; }
        public string? Summary { get; set; } // New property
    }
}
