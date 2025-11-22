
using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace BookTrackingSystem.DTOs
{
    public class CreateAuthorDto
    {
        [Required(ErrorMessage = "Name is required.")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 100 characters.")]
        public string Name { get; set; } = string.Empty;

        [StringLength(1000, ErrorMessage = "Bio cannot exceed 1000 characters.")]
        public string? Bio { get; set; }
        public IFormFile? ImageFile { get; set; }
    }
}
