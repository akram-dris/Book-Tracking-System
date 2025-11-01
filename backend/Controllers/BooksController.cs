
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
        private readonly IWebHostEnvironment _webHostEnvironment;

        public BooksController(IBookService bookService, ILogger<BooksController> logger, IWebHostEnvironment webHostEnvironment)
        {
            _bookService = bookService;
            _logger = logger;
            _webHostEnvironment = webHostEnvironment;
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
                var existingBook = await _bookService.GetBookAsync(id);
                if (existingBook == null)
                {
                    return NotFound();
                }

                // Handle image update or removal
                if (updateBookDto.ImageFile != null)
                {
                    // Delete old image if exists
                    if (!string.IsNullOrEmpty(existingBook.ImageUrl))
                    {
                        var oldImagePath = Path.Combine(_webHostEnvironment.WebRootPath, existingBook.ImageUrl.TrimStart('/'));
                        if (System.IO.File.Exists(oldImagePath))
                        {
                            System.IO.File.Delete(oldImagePath);
                        }
                    }

                    var uploadsFolder = Path.Combine(_webHostEnvironment.WebRootPath, "images", "books");
                    if (!Directory.Exists(uploadsFolder))
                    {
                        Directory.CreateDirectory(uploadsFolder);
                    }
                    var uniqueFileName = Guid.NewGuid().ToString() + "_" + updateBookDto.ImageFile.FileName;
                    var filePath = Path.Combine(uploadsFolder, uniqueFileName);
                    using (var fileStream = new FileStream(filePath, FileMode.Create))
                    {
                        await updateBookDto.ImageFile.CopyToAsync(fileStream);
                    }
                    existingBook.ImageUrl = "/images/books/" + uniqueFileName;
                }
                else if (!string.IsNullOrEmpty(existingBook.ImageUrl)) // If no new image is provided, but an old one exists
                {
                    var oldImagePath = Path.Combine(_webHostEnvironment.WebRootPath, existingBook.ImageUrl.TrimStart('/'));
                    if (System.IO.File.Exists(oldImagePath))
                    {
                        System.IO.File.Delete(oldImagePath);
                    }
                    existingBook.ImageUrl = null; // Set ImageUrl to null
                }

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
            var bookToDelete = await _bookService.GetBookAsync(id);
            if (bookToDelete == null)
            {
                return NotFound();
            }

            // Delete image file if it exists
            if (!string.IsNullOrEmpty(bookToDelete.ImageUrl))
            {
                var imagePath = Path.Combine(_webHostEnvironment.WebRootPath, bookToDelete.ImageUrl.TrimStart('/'));
                if (System.IO.File.Exists(imagePath))
                {
                    System.IO.File.Delete(imagePath);
                }
            }

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
