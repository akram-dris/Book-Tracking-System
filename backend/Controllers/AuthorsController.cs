
using BookTrackingSystem.Models;
using BookTrackingSystem.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using BookTrackingSystem.DTOs;
using BookTrackingSystem.Models.Common;
using BookTrackingSystem.Models.Pagination;

namespace BookTrackingSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthorsController : ControllerBase
    {
        private readonly IAuthorService _authorService;
        private readonly ILogger<AuthorsController> _logger;

        public AuthorsController(IAuthorService authorService, ILogger<AuthorsController> logger)
        {
            _authorService = authorService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<Result<IEnumerable<AuthorDto>>>> GetAuthors()
        {
            var result = await _authorService.GetAuthorsAsync();
            return Ok(result);
        }

        [HttpGet("paginated")]
        public async Task<ActionResult<Result<PaginatedResult<AuthorDto>>>> GetAuthorsPaginated([FromQuery] PaginationParams paginationParams)
        {
            var result = await _authorService.GetAuthorsPaginatedAsync(paginationParams);
            if (!result.IsSuccess)
            {
                return BadRequest(result);
            }
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Result<AuthorDto>>> GetAuthor(int id)
        {
            var result = await _authorService.GetAuthorAsync(id);
            if (!result.IsSuccess)
            {
                return Ok(result);
            }
            return Ok(result);
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<Result<AuthorDto>>> PostAuthor([FromForm] CreateAuthorDto createAuthorDto)
        {
            var result = await _authorService.AddAuthorAsync(createAuthorDto);
            if (result.IsSuccess)
            {
                return CreatedAtAction(nameof(GetAuthor), new { id = result.Data!.Id }, result);
            }
            return Ok(result);
        }

        [HttpPut("{id}")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<Result<AuthorDto>>> PutAuthor(int id, [FromForm] UpdateAuthorDto updateAuthorDto)
        {
            var result = await _authorService.UpdateAuthorAsync(id, updateAuthorDto);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<Result>> DeleteAuthor(int id)
        {
            var result = await _authorService.DeleteAuthorAsync(id);
            return Ok(result);
        }

        [HttpGet("{id}/book-count")]
        public async Task<ActionResult<Result<int>>> GetAuthorBookCount(int id)
        {
            var result = await _authorService.GetAuthorBookCountAsync(id);
            return Ok(result);
        }
    }
}
