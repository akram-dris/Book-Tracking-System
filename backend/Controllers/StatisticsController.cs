using BookTrackingSystem.DTOs;
using BookTrackingSystem.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

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
        public async Task<ActionResult<ReadingOverviewDto>> GetReadingOverview(
            [FromQuery] FilterType filterType = FilterType.Year,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var filter = new StatisticsFilterDto 
                { 
                    FilterType = filterType, 
                    StartDate = startDate, 
                    EndDate = endDate 
                };
                var overview = await _statisticsService.GetReadingOverviewAsync(filter);
                return Ok(overview);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting reading overview statistics");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("authors")]
        public async Task<ActionResult<AuthorStatisticsDto>> GetAuthorStatistics(
            [FromQuery] FilterType filterType = FilterType.Year,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var filter = new StatisticsFilterDto 
                { 
                    FilterType = filterType, 
                    StartDate = startDate, 
                    EndDate = endDate 
                };
                var authorStats = await _statisticsService.GetAuthorStatisticsAsync(filter);
                return Ok(authorStats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting author statistics");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("tags")]
        public async Task<ActionResult<TagStatisticsDto>> GetTagStatistics(
            [FromQuery] FilterType filterType = FilterType.Year,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var filter = new StatisticsFilterDto 
                { 
                    FilterType = filterType, 
                    StartDate = startDate, 
                    EndDate = endDate 
                };
                var tagStats = await _statisticsService.GetTagStatisticsAsync(filter);
                return Ok(tagStats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting tag statistics");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("time-based")]
        public async Task<ActionResult<TimeBasedStatisticsDto>> GetTimeBasedStatistics(
            [FromQuery] FilterType filterType = FilterType.Year,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var filter = new StatisticsFilterDto 
                { 
                    FilterType = filterType, 
                    StartDate = startDate, 
                    EndDate = endDate 
                };
                var timeStats = await _statisticsService.GetTimeBasedStatisticsAsync(filter);
                return Ok(timeStats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting time-based statistics");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("goals")]
        public async Task<ActionResult<GoalPerformanceDto>> GetGoalPerformance(
            [FromQuery] FilterType filterType = FilterType.Year,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var filter = new StatisticsFilterDto 
                { 
                    FilterType = filterType, 
                    StartDate = startDate, 
                    EndDate = endDate 
                };
                var goalStats = await _statisticsService.GetGoalPerformanceAsync(filter);
                return Ok(goalStats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting goal performance statistics");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("books")]
        public async Task<ActionResult<BookStatisticsDto>> GetBookStatistics(
            [FromQuery] FilterType filterType = FilterType.Year,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var filter = new StatisticsFilterDto 
                { 
                    FilterType = filterType, 
                    StartDate = startDate, 
                    EndDate = endDate 
                };
                var bookStats = await _statisticsService.GetBookStatisticsAsync(filter);
                return Ok(bookStats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting book statistics");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("records")]
        public async Task<ActionResult<PersonalRecordsDto>> GetPersonalRecords(
            [FromQuery] FilterType filterType = FilterType.Year,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var filter = new StatisticsFilterDto 
                { 
                    FilterType = filterType, 
                    StartDate = startDate, 
                    EndDate = endDate 
                };
                var records = await _statisticsService.GetPersonalRecordsAsync(filter);
                return Ok(records);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting personal records");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("complete")]
        public async Task<ActionResult<StatisticsDto>> GetCompleteStatistics(
            [FromQuery] FilterType filterType = FilterType.Year,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var filter = new StatisticsFilterDto 
                { 
                    FilterType = filterType, 
                    StartDate = startDate, 
                    EndDate = endDate 
                };
                var stats = await _statisticsService.GetCompleteStatisticsAsync(filter);
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting complete statistics");
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
