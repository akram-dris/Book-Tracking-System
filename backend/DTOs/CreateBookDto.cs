
using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace BookTrackingSystem.DTOs
{
    public class CreateBookDto
    {
        public int AuthorId { get; set; }
        [Required(ErrorMessage = "Title is required.")]
        [StringLength(200, ErrorMessage = "Title cannot exceed 200 characters.")]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "Total pages is required.")]
        [Range(1, 10000, ErrorMessage = "Total pages must be between 1 and 10000.")]
        public int TotalPages { get; set; }

        [StringLength(2000, ErrorMessage = "Summary cannot exceed 2000 characters.")]
        public string? Summary { get; set; }
        public IFormFile? ImageFile { get; set; }
    }
}
