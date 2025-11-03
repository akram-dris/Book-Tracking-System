using BookTrackingSystem.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BookTrackingSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HeatmapController : ControllerBase
    {
        private readonly IHeatmapService _heatmapService;
        private readonly ILogger<HeatmapController> _logger;

        public HeatmapController(IHeatmapService heatmapService, ILogger<HeatmapController> logger)
        {
            _heatmapService = heatmapService;
            _logger = logger;
        }

        [HttpGet("{year}")]
        public async Task<ActionResult<Dictionary<string, int>>> GetHeatmapData(int year)
        {
            try
            {
                var heatmapData = await _heatmapService.GetHeatmapDataAsync(year);
                return Ok(heatmapData);
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Error getting heatmap data for year {Year}", year);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}