using System.ComponentModel.DataAnnotations;
using BookTrackingSystem.DTOs;

namespace BookTrackingSystem.ValidationAttributes
{
    public class ReadingGoalHierarchyAttribute : ValidationAttribute
    {
        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            if (value is CreateReadingGoalDto createDto)
            {
                if (createDto.LowGoal >= createDto.MediumGoal)
                {
                    return new ValidationResult("Low goal must be less than Medium goal.");
                }
                if (createDto.MediumGoal >= createDto.HighGoal)
                {
                    return new ValidationResult("Medium goal must be less than High goal.");
                }
            }
            else if (value is UpdateReadingGoalDto updateDto)
            {
                if (updateDto.LowGoal >= updateDto.MediumGoal)
                {
                    return new ValidationResult("Low goal must be less than Medium goal.");
                }
                if (updateDto.MediumGoal >= updateDto.HighGoal)
                {
                    return new ValidationResult("Medium goal must be less than High goal.");
                }
            }

            return ValidationResult.Success;
        }
    }
}
