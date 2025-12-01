
using System.ComponentModel.DataAnnotations;

namespace BookTrackingSystem.DTOs
{
    public class UpdateTagDto
    {
        [Required]
        [StringLength(50, ErrorMessage = "Tag name cannot be longer than 50 characters.")]
        public string Name { get; set; } = string.Empty;
    }
}
