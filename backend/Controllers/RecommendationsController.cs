using BookTrackingSystem.DTOs;
using BookTrackingSystem.Models.Common;
using BookTrackingSystem.Services;
using Microsoft.AspNetCore.Mvc;

namespace BookTrackingSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RecommendationsController : ControllerBase
    {
        private readonly IRecommendationService _recommendationService;
        private readonly ILogger<RecommendationsController> _logger;

        public RecommendationsController(
            IRecommendationService recommendationService,
            ILogger<RecommendationsController> logger)
        {
            _recommendationService = recommendationService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<Result<IEnumerable<RecommendationDto>>>> GetRecommendations()
        {
            var result = await _recommendationService.GetRecommendationsAsync();
            return Ok(result);
        }
    }
}
