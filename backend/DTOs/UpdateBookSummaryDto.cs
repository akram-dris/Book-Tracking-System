using System.ComponentModel.DataAnnotations;

namespace BookTrackingSystem.DTOs
{
    public class UpdateBookSummaryDto
    {
        [StringLength(10000, ErrorMessage = "Summary cannot exceed 10000 characters.")]
        public string Summary { get; set; } = string.Empty;
    }
}
