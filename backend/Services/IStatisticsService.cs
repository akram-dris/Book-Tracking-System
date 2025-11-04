using BookTrackingSystem.DTOs;

namespace BookTrackingSystem.Services
{
    public interface IStatisticsService
    {
        Task<ReadingOverviewDto> GetReadingOverviewAsync();
        Task<AuthorStatisticsDto> GetAuthorStatisticsAsync();
        Task<TagStatisticsDto> GetTagStatisticsAsync();
        Task<TimeBasedStatisticsDto> GetTimeBasedStatisticsAsync();
        Task<GoalPerformanceDto> GetGoalPerformanceAsync();
        Task<BookStatisticsDto> GetBookStatisticsAsync();
        Task<PersonalRecordsDto> GetPersonalRecordsAsync();
        Task<StatisticsDto> GetCompleteStatisticsAsync();
    }
}
