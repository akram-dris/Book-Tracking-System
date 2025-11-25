using BookTrackingSystem.DTOs;
using BookTrackingSystem.Services;
using BookTrackingSystem.Models.Common;
using BookTrackingSystem.Models.Pagination;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

namespace BookTrackingSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TagsController : ControllerBase
    {
        private readonly ITagService _tagService;

        public TagsController(ITagService tagService)
        {
            _tagService = tagService;
        }

        [HttpGet]
        public async Task<ActionResult<Result<IEnumerable<TagDto>>>> GetTags()
        {
            var result = await _tagService.GetAllTagsAsync();
            return Ok(result);
        }

        [HttpGet("paginated")]
        public async Task<ActionResult<Result<PaginatedResult<TagDto>>>> GetTagsPaginated([FromQuery] PaginationParams paginationParams)
        {
            var result = await _tagService.GetTagsPaginatedAsync(paginationParams);
            if (!result.IsSuccess)
            {
                return BadRequest(result);
            }
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Result<TagDto>>> GetTag(int id)
        {
            var result = await _tagService.GetTagByIdAsync(id);
            if (!result.IsSuccess)
            {
                return Ok(result);
            }
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<Result<TagDto>>> PostTag(CreateTagDto createTagDto)
        {
            var result = await _tagService.CreateTagAsync(createTagDto);
            if (result.IsSuccess)
            {
                return CreatedAtAction(nameof(GetTag), new { id = result.Data!.Id }, result);
            }
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Result>> PutTag(int id, UpdateTagDto updateTagDto)
        {
            var result = await _tagService.UpdateTagAsync(id, updateTagDto);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<Result>> DeleteTag(int id)
        {
            var result = await _tagService.DeleteTagAsync(id);
            return Ok(result);
        }

        [HttpGet("usage")]
        public async Task<ActionResult<Result<Dictionary<int, int>>>> GetTagUsageCounts()
        {
            var result = await _tagService.GetTagUsageCountsAsync();
            return Ok(result);
        }
    }
}
