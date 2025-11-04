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
        public async Task<ActionResult<ReadingOverviewDto>> GetReadingOverview()
        {
            try
            {
                var overview = await _statisticsService.GetReadingOverviewAsync();
                return Ok(overview);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting reading overview statistics");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("authors")]
        public async Task<ActionResult<AuthorStatisticsDto>> GetAuthorStatistics()
        {
            try
            {
                var authorStats = await _statisticsService.GetAuthorStatisticsAsync();
                return Ok(authorStats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting author statistics");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("tags")]
        public async Task<ActionResult<TagStatisticsDto>> GetTagStatistics()
        {
            try
            {
                var tagStats = await _statisticsService.GetTagStatisticsAsync();
                return Ok(tagStats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting tag statistics");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("time-based")]
        public async Task<ActionResult<TimeBasedStatisticsDto>> GetTimeBasedStatistics()
        {
            try
            {
                var timeStats = await _statisticsService.GetTimeBasedStatisticsAsync();
                return Ok(timeStats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting time-based statistics");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("goals")]
        public async Task<ActionResult<GoalPerformanceDto>> GetGoalPerformance()
        {
            try
            {
                var goalStats = await _statisticsService.GetGoalPerformanceAsync();
                return Ok(goalStats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting goal performance statistics");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("books")]
        public async Task<ActionResult<BookStatisticsDto>> GetBookStatistics()
        {
            try
            {
                var bookStats = await _statisticsService.GetBookStatisticsAsync();
                return Ok(bookStats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting book statistics");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("records")]
        public async Task<ActionResult<PersonalRecordsDto>> GetPersonalRecords()
        {
            try
            {
                var records = await _statisticsService.GetPersonalRecordsAsync();
                return Ok(records);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting personal records");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("complete")]
        public async Task<ActionResult<StatisticsDto>> GetCompleteStatistics()
        {
            try
            {
                var stats = await _statisticsService.GetCompleteStatisticsAsync();
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
