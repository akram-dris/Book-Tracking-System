using BookTrackingSystem.DTOs;

namespace BookTrackingSystem.Services
{
    public interface IStatisticsService
    {
        Task<ReadingOverviewDto> GetReadingOverviewAsync(StatisticsFilterDto? filter = null);
        Task<AuthorStatisticsDto> GetAuthorStatisticsAsync(StatisticsFilterDto? filter = null);
        Task<TagStatisticsDto> GetTagStatisticsAsync(StatisticsFilterDto? filter = null);
        Task<TimeBasedStatisticsDto> GetTimeBasedStatisticsAsync(StatisticsFilterDto? filter = null);
        Task<GoalPerformanceDto> GetGoalPerformanceAsync(StatisticsFilterDto? filter = null);
        Task<BookStatisticsDto> GetBookStatisticsAsync(StatisticsFilterDto? filter = null);
        Task<PersonalRecordsDto> GetPersonalRecordsAsync(StatisticsFilterDto? filter = null);
        Task<StatisticsDto> GetCompleteStatisticsAsync(StatisticsFilterDto? filter = null);
    }
}
