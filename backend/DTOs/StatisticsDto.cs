namespace BookTrackingSystem.DTOs
{
    public class StatisticsDto
    {
        public ReadingOverviewDto Overview { get; set; } = new();
        public AuthorStatisticsDto Authors { get; set; } = new();
        public TagStatisticsDto Tags { get; set; } = new();
        public TimeBasedStatisticsDto TimeBased { get; set; } = new();
        public GoalPerformanceDto Goals { get; set; } = new();
        public BookStatisticsDto Books { get; set; } = new();
        public PersonalRecordsDto Records { get; set; } = new();
    }
}
