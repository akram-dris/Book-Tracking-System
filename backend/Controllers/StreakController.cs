using BookTrackingSystem.DTOs;
using BookTrackingSystem.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;

namespace BookTrackingSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StreakController : ControllerBase
    {
        private readonly IStreakService _streakService;
        private readonly ILogger<StreakController> _logger;

        public StreakController(IStreakService streakService, ILogger<StreakController> logger)
        {
            _streakService = streakService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<StreakDto>> GetStreakData()
        {
            try
            {
                var streakData = await _streakService.GetStreakDataAsync();
                return Ok(streakData);
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Error getting streak data");
                return StatusCode(500, "Internal server error");
            }
        }
    }
}