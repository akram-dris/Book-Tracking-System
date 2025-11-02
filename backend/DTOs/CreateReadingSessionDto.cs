using System.ComponentModel.DataAnnotations;

namespace BookTrackingSystem.DTOs
{
    public class CreateReadingSessionDto
    {
        [Required]
        public int BookId { get; set; }
        [Required]
        public DateTime Date { get; set; }
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Pages read must be at least 1.")]
        public int PagesRead { get; set; }
    }
}
