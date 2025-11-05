namespace BookTrackingSystem.DTOs
{
    public class GoalPerformanceDto
    {
        public double OverallCompletionRate { get; set; }
        public int LowGoalSuccessCount { get; set; }
        public int MediumGoalSuccessCount { get; set; }
        public int HighGoalSuccessCount { get; set; }
        public double AverageDaysToComplete { get; set; }
        public int BooksCompletedOnTime { get; set; }
        public int BooksOverdue { get; set; }
        public List<CurrentGoalProgressDto> CurrentGoalsProgress { get; set; } = new();
    }

    public class CurrentGoalProgressDto
    {
        public int BookId { get; set; }
        public string BookTitle { get; set; } = string.Empty;
        public string BookStatus { get; set; } = string.Empty;
        public int LowGoal { get; set; }
        public int MediumGoal { get; set; }
        public int HighGoal { get; set; }
        public int CurrentPages { get; set; }
        public double LowProgress { get; set; }
        public double MediumProgress { get; set; }
        public double HighProgress { get; set; }
    }
}
