
using BookTrackingSystem.DTOs;
using BookTrackingSystem.Services;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

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
        public async Task<ActionResult<IEnumerable<TagDto>>> GetTags()
        {
            var tags = await _tagService.GetAllTagsAsync();
            return Ok(tags);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TagDto>> GetTag(int id)
        {
            var tag = await _tagService.GetTagByIdAsync(id);
            if (tag == null)
            {
                return NotFound();
            }
            return Ok(tag);
        }

        [HttpPost]
        public async Task<ActionResult<TagDto>> PostTag(CreateTagDto createTagDto)
        {
            var newTag = await _tagService.CreateTagAsync(createTagDto);
            return CreatedAtAction(nameof(GetTag), new { id = newTag.Id }, newTag);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutTag(int id, UpdateTagDto updateTagDto)
        {
            var updatedTag = await _tagService.UpdateTagAsync(id, updateTagDto);
            if (updatedTag == null)
            {
                return NotFound();
            }
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTag(int id)
        {
            await _tagService.DeleteTagAsync(id);
            return NoContent();
        }

        [HttpGet("usage")]
        public async Task<ActionResult<Dictionary<int, int>>> GetTagUsageCounts()
        {
            var usageCounts = await _tagService.GetTagUsageCountsAsync();
            return Ok(usageCounts);
        }
    }
}
