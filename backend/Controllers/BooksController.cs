
using BookTrackingSystem.Models;
using BookTrackingSystem.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using BookTrackingSystem.DTOs;

namespace BookTrackingSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BooksController : ControllerBase
    {
        private readonly IBookService _bookService;
        private readonly ILogger<BooksController> _logger;

        public BooksController(IBookService bookService, ILogger<BooksController> logger)
        {
            _bookService = bookService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<BookDto>>> GetBooks([FromQuery] int? tagId = null)
        {
            var books = await _bookService.GetBooksAsync(tagId);
            return Ok(books);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<BookDto>> GetBook(int id)
        {
            var book = await _bookService.GetBookAsync(id);
            if (book == null)
            {
                return NotFound();
            }
            return Ok(book);
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<BookDto>> PostBook([FromForm] CreateBookDto createBookDto)
        {
            try
            {
                var newBook = await _bookService.AddBookAsync(createBookDto, createBookDto.ImageFile);
                return CreatedAtAction(nameof(GetBook), new { id = newBook.Id }, newBook);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding new book");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("{id}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> PutBook(int id, [FromForm] UpdateBookDto updateBookDto)
        {
            if (id != updateBookDto.Id)
            {
                return BadRequest();
            }

            try
            {
                var updatedBook = await _bookService.UpdateBookAsync(id, updateBookDto, updateBookDto.ImageFile);
                if (updatedBook == null)
                {
                    return NotFound();
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating book");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBook(int id)
        {
            await _bookService.DeleteBookAsync(id);
            return NoContent();
        }

        [HttpPost("{bookId}/tags")]
        public async Task<IActionResult> AssignTags(int bookId, [FromBody] IEnumerable<int> tagIds)
        {
            await _bookService.AssignTagsAsync(bookId, tagIds);
            return NoContent();
        }
    }
}
