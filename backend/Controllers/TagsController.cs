using BookTrackingSystem.DTOs;
using BookTrackingSystem.Services;
using BookTrackingSystem.Repository;
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
        private readonly ITagRepository _tagRepository;

        public TagsController(ITagService tagService, ITagRepository tagRepository)
        {
            _tagService = tagService;
            _tagRepository = tagRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TagDto>>> GetTags()
        {
            var tags = await _tagRepository.GetAllAsync();
            
            var tagDtos = tags.Select(tag => new TagDto
            {
                Id = tag.Id,
                Name = tag.Name,
                AverageRating = tag.BookTagAssignments != null && tag.BookTagAssignments.Any(bta => bta.Book?.Rating != null)
                    ? tag.BookTagAssignments.Where(bta => bta.Book?.Rating != null).Average(bta => bta.Book!.Rating!.Value)
                    : null
            }).ToList();
            
            return Ok(tagDtos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TagDto>> GetTag(int id)
        {
            var tag = await _tagRepository.GetByIdAsync(id);
            if (tag == null)
            {
                return NotFound();
            }
            
            var tagDto = new TagDto
            {
                Id = tag.Id,
                Name = tag.Name,
                AverageRating = tag.BookTagAssignments != null && tag.BookTagAssignments.Any(bta => bta.Book?.Rating != null)
                    ? tag.BookTagAssignments.Where(bta => bta.Book?.Rating != null).Average(bta => bta.Book!.Rating!.Value)
                    : null
            };
            
            return Ok(tagDto);
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
