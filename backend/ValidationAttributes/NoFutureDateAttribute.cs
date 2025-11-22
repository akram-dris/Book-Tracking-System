using System.ComponentModel.DataAnnotations;

namespace BookTrackingSystem.ValidationAttributes
{
    public class NoFutureDateAttribute : ValidationAttribute
    {
        public override bool IsValid(object? value)
        {
            if (value is DateTime date)
            {
                return date <= DateTime.Now;
            }
            return true;
        }
    }
}
