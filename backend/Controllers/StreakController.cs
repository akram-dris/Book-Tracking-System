using BookTrackingSystem.DTOs;
using BookTrackingSystem.Models.Common;
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
        public async Task<ActionResult<Result<StreakDto>>> GetStreakData([FromQuery] DateTime? localDate = null)
        {
            var result = await _streakService.GetStreakDataAsync(localDate);
            return Ok(result);
        }
    }
}