using System.ComponentModel.DataAnnotations;

namespace BookTrackingSystem.DTOs
{
    public class UpdateReadingGoalDto
    {
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Low goal must be at least 1.")]
        public int LowGoal { get; set; }
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Medium goal must be at least 1.")]
        public int MediumGoal { get; set; }
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "High goal must be at least 1.")]
        public int HighGoal { get; set; }
    }
}
