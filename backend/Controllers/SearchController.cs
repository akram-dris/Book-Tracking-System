using BookTrackingSystem.DTOs;
using BookTrackingSystem.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace BookTrackingSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SearchController : ControllerBase
    {
        private readonly ISearchService _searchService;

        public SearchController(ISearchService searchService)
        {
            _searchService = searchService;
        }

        [HttpGet]
        public async Task<ActionResult<SearchDto>> Search([FromQuery] string query)
        {
            var result = await _searchService.SearchAsync(query);
            return Ok(result);
        }
    }
}
