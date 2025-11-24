using BookTrackingSystem.DTOs;
using BookTrackingSystem.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using BookTrackingSystem.Models.Common;

namespace BookTrackingSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StatisticsController : ControllerBase
    {
        private readonly IStatisticsService _statisticsService;
        private readonly ILogger<StatisticsController> _logger;

        public StatisticsController(IStatisticsService statisticsService, ILogger<StatisticsController> logger)
        {
            _statisticsService = statisticsService;
            _logger = logger;
        }

        [HttpGet("overview")]
        public async Task<ActionResult<Result<ReadingOverviewDto>>> GetReadingOverview(
            [FromQuery] FilterType filterType = FilterType.Year,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            var filter = new StatisticsFilterDto 
            { 
                FilterType = filterType, 
                StartDate = startDate, 
                EndDate = endDate 
            };
            var result = await _statisticsService.GetReadingOverviewAsync(filter);
            return Ok(result);
        }

        [HttpGet("authors")]
        public async Task<ActionResult<Result<AuthorStatisticsDto>>> GetAuthorStatistics(
            [FromQuery] FilterType filterType = FilterType.Year,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            var filter = new StatisticsFilterDto 
            { 
                FilterType = filterType, 
                StartDate = startDate, 
                EndDate = endDate 
            };
            var result = await _statisticsService.GetAuthorStatisticsAsync(filter);
            return Ok(result);
        }

        [HttpGet("tags")]
        public async Task<ActionResult<Result<TagStatisticsDto>>> GetTagStatistics(
            [FromQuery] FilterType filterType = FilterType.Year,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            var filter = new StatisticsFilterDto 
            { 
                FilterType = filterType, 
                StartDate = startDate, 
                EndDate = endDate 
            };
            var result = await _statisticsService.GetTagStatisticsAsync(filter);
            return Ok(result);
        }

        [HttpGet("time-based")]
        public async Task<ActionResult<Result<TimeBasedStatisticsDto>>> GetTimeBasedStatistics(
            [FromQuery] FilterType filterType = FilterType.Year,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            var filter = new StatisticsFilterDto 
            { 
                FilterType = filterType, 
                StartDate = startDate, 
                EndDate = endDate 
            };
            var result = await _statisticsService.GetTimeBasedStatisticsAsync(filter);
            return Ok(result);
        }

        [HttpGet("goals")]
        public async Task<ActionResult<Result<GoalPerformanceDto>>> GetGoalPerformance(
            [FromQuery] FilterType filterType = FilterType.Year,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            var filter = new StatisticsFilterDto 
            { 
                FilterType = filterType, 
                StartDate = startDate, 
                EndDate = endDate 
            };
            var result = await _statisticsService.GetGoalPerformanceAsync(filter);
            return Ok(result);
        }

        [HttpGet("books")]
        public async Task<ActionResult<Result<BookStatisticsDto>>> GetBookStatistics(
            [FromQuery] FilterType filterType = FilterType.Year,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            var filter = new StatisticsFilterDto 
            { 
                FilterType = filterType, 
                StartDate = startDate, 
                EndDate = endDate 
            };
            var result = await _statisticsService.GetBookStatisticsAsync(filter);
            return Ok(result);
        }

        [HttpGet("records")]
        public async Task<ActionResult<Result<PersonalRecordsDto>>> GetPersonalRecords(
            [FromQuery] FilterType filterType = FilterType.Year,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            var filter = new StatisticsFilterDto 
            { 
                FilterType = filterType, 
                StartDate = startDate, 
                EndDate = endDate 
            };
            var result = await _statisticsService.GetPersonalRecordsAsync(filter);
            return Ok(result);
        }

        [HttpGet("complete")]
        public async Task<ActionResult<Result<StatisticsDto>>> GetCompleteStatistics(
            [FromQuery] FilterType filterType = FilterType.Year,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            var filter = new StatisticsFilterDto 
            { 
                FilterType = filterType, 
                StartDate = startDate, 
                EndDate = endDate 
            };
            var result = await _statisticsService.GetCompleteStatisticsAsync(filter);
            return Ok(result);
        }
    }
}
