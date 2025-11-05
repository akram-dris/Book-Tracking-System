namespace BookTrackingSystem.DTOs
{
    public class StatisticsFilterDto
    {
        public FilterType FilterType { get; set; } = FilterType.Year;
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }

    public enum FilterType
    {
        Today,
        Week,
        Month,
        Year,
        Custom
    }
}
