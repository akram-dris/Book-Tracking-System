using BookTrackingSystem.Services;
using BookTrackingSystem.Models.Common;
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
        public async Task<ActionResult<Result<Dictionary<string, int>>>> GetHeatmapData(int year)
        {
            var result = await _heatmapService.GetHeatmapDataAsync(year);
            return Ok(result);
        }

        [HttpGet("years")]
        public async Task<ActionResult<Result<YearRange>>> GetAvailableYears()
        {
            var result = await _heatmapService.GetAvailableYearsAsync();
            return Ok(result);
        }
    }
}