
using Microsoft.AspNetCore.Http;

namespace BookTrackingSystem.DTOs
{
    public class UpdateAuthorDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Bio { get; set; }
        public IFormFile? ImageFile { get; set; }
    }
}
