
using BookTrackingSystem.Models;
using BookTrackingSystem.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using BookTrackingSystem.DTOs;
using BookTrackingSystem.Models.Common;
using BookTrackingSystem.Models.Enums;
using BookTrackingSystem.Models.Pagination;

namespace BookTrackingSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BooksController : ControllerBase
    {
        private readonly IBookService _bookService;
        private readonly ILogger<BooksController> _logger;
        private readonly IWebHostEnvironment _webHostEnvironment;

        public BooksController(IBookService bookService, ILogger<BooksController> logger, IWebHostEnvironment webHostEnvironment)
        {
            _bookService = bookService;
            _logger = logger;
            _webHostEnvironment = webHostEnvironment;
        }

        [HttpGet]
        public async Task<ActionResult<Result<IEnumerable<BookDto>>>> GetBooks([FromQuery] int? tagId = null, [FromQuery] string? search = null)
        {
            var result = await _bookService.GetBooksAsync(tagId, search);
            return Ok(result);
        }

        [HttpGet("paginated")]
        public async Task<ActionResult<Result<PaginatedResult<BookDto>>>> GetBooksPaginated(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? search = null,
            [FromQuery] int? tagId = null,
            [FromQuery] int? statusFilter = null,
            [FromQuery] string? sort = null,
            [FromQuery] int? authorId = null,
            [FromQuery] int? rating = null)
        {
            var paginationParams = new PaginationParams
            {
                PageNumber = pageNumber,
                PageSize = pageSize,
                Search = search,
                Sort = sort,
                StatusFilter = statusFilter,
                AuthorId = authorId,
                Rating = rating
            };

            var result = await _bookService.GetBooksPaginatedAsync(paginationParams, tagId);
            
            if (!result.IsSuccess)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpGet("status-counts")]
        public async Task<ActionResult<Result<Dictionary<int, int>>>> GetBookCountsByStatus()
        {
            var result = await _bookService.GetBookCountsByStatusAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Result<BookDto>>> GetBook(int id)
        {
            var result = await _bookService.GetBookAsync(id);
            if (!result.IsSuccess)
            {
                // Optionally map specific errors to status codes if needed, but returning Ok(result) is fine for now as per plan
                return Ok(result);
            }
            return Ok(result);
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<Result<BookDto>>> PostBook([FromForm] CreateBookDto createBookDto)
        {
            var result = await _bookService.AddBookAsync(createBookDto, createBookDto.ImageFile);
            if (result.IsSuccess)
            {
                return CreatedAtAction(nameof(GetBook), new { id = result.Data!.Id }, result);
            }
            return Ok(result);
        }

        [HttpPut("{id}")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<Result<BookDto>>> PutBook(int id, [FromForm] UpdateBookDto updateBookDto)
        {
            var result = await _bookService.UpdateBookAsync(id, updateBookDto, updateBookDto.ImageFile);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<Result>> DeleteBook(int id)
        {
            var result = await _bookService.DeleteBookAsync(id);
            return Ok(result);
        }

        [HttpPost("{id}/tags")]
        public async Task<ActionResult<Result>> AssignTags(int id, [FromBody] List<int> tagIds)
        {
            var result = await _bookService.AssignTagsAsync(id, tagIds);
            return Ok(result);
        }

        [HttpPut("{id}/status")]
        public async Task<ActionResult<Result>> UpdateBookStatus(int id, [FromBody] UpdateBookStatusDto statusDto)
        {
            var result = await _bookService.UpdateBookStatusAsync(id, statusDto.Status, statusDto.StartedReadingDate, statusDto.CompletedDate, statusDto.Summary, statusDto.Rating);
            return Ok(result);
        }

        [HttpPut("{id}/summary")]
        public async Task<ActionResult<Result>> UpdateBookSummary(int id, [FromBody] UpdateBookSummaryDto updateBookSummaryDto)
        {
            var result = await _bookService.UpdateBookSummaryAsync(id, updateBookSummaryDto.Summary);
            return Ok(result);
        }
    }
}
