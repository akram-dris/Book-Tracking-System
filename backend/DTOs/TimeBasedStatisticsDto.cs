namespace BookTrackingSystem.DTOs
{
    public class TimeBasedStatisticsDto
    {
        public string? BestReadingMonth { get; set; }
        public int BestReadingMonthPages { get; set; }
        public string? BestReadingDayOfWeek { get; set; }
        public int BestReadingDayPages { get; set; }
        public Dictionary<string, int> MonthlyTrend { get; set; } = new();
        public Dictionary<string, int> WeeklyPattern { get; set; } = new();
        public Dictionary<int, int> YearOverYear { get; set; } = new();
        public Dictionary<string, StatusTimelineDataDto> StatusTimeline { get; set; } = new();
    }

    public class StatusTimelineDataDto
    {
        public Dictionary<string, int> Completed { get; set; } = new();
        public Dictionary<string, int> Summarized { get; set; } = new();
        public Dictionary<string, int> CurrentlyReading { get; set; } = new();
        public Dictionary<string, int> Planning { get; set; } = new();
        public Dictionary<string, int> NotReading { get; set; } = new();
    }
}
