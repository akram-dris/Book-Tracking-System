using BookTrackingSystem.DTOs;
using BookTrackingSystem.Models.Common;

namespace BookTrackingSystem.Services
{
    public interface IStatisticsService
    {
        Task<Result<ReadingOverviewDto>> GetReadingOverviewAsync(StatisticsFilterDto? filter = null);
        Task<Result<AuthorStatisticsDto>> GetAuthorStatisticsAsync(StatisticsFilterDto? filter = null);
        Task<Result<TagStatisticsDto>> GetTagStatisticsAsync(StatisticsFilterDto? filter = null);
        Task<Result<TimeBasedStatisticsDto>> GetTimeBasedStatisticsAsync(StatisticsFilterDto? filter = null);
        Task<Result<GoalPerformanceDto>> GetGoalPerformanceAsync(StatisticsFilterDto? filter = null);
        Task<Result<BookStatisticsDto>> GetBookStatisticsAsync(StatisticsFilterDto? filter = null);
        Task<Result<PersonalRecordsDto>> GetPersonalRecordsAsync(StatisticsFilterDto? filter = null);
        Task<Result<StatisticsDto>> GetCompleteStatisticsAsync(StatisticsFilterDto? filter = null);
    }
}
