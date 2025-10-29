
using BookTrackingSystem.Models;
using BookTrackingSystem.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using BookTrackingSystem.DTOs;
using Microsoft.AspNetCore.Hosting;

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
        public async Task<ActionResult<IEnumerable<BookDto>>> GetBooks()
        {
            var books = await _bookService.GetBooksAsync();
            var bookDtos = new List<BookDto>();
            foreach (var book in books)
            {
                bookDtos.Add(new BookDto
                {
                    Id = book.Id,
                    AuthorId = book.AuthorId,
                    Title = book.Title,
                    TotalPages = book.TotalPages,
                    ImageUrl = book.ImageUrl,
                    CreatedAt = book.CreatedAt,
                    UpdatedAt = book.UpdatedAt,
                    Author = book.Author != null ? new AuthorDto
                    {
                        Id = book.Author.Id,
                        Name = book.Author.Name,
                        Bio = book.Author.Bio,
                        CreatedAt = book.Author.CreatedAt,
                        UpdatedAt = book.Author.UpdatedAt
                    } : null
                });
            }
            return Ok(bookDtos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<BookDto>> GetBook(int id)
        {
            var book = await _bookService.GetBookAsync(id);
            if (book == null)
            {
                return NotFound();
            }
            var bookDto = new BookDto
            {
                Id = book.Id,
                AuthorId = book.AuthorId,
                Title = book.Title,
                TotalPages = book.TotalPages,
                ImageUrl = book.ImageUrl,
                CreatedAt = book.CreatedAt,
                UpdatedAt = book.UpdatedAt,
                Author = book.Author != null ? new AuthorDto
                {
                    Id = book.Author.Id,
                    Name = book.Author.Name,
                    Bio = book.Author.Bio,
                    CreatedAt = book.Author.CreatedAt,
                    UpdatedAt = book.Author.UpdatedAt
                } : null
            };
            return Ok(bookDto);
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<BookDto>> PostBook([FromForm] CreateBookDto createBookDto)
        {
            try
            {
                string? imageUrl = null;
                if (createBookDto.ImageFile != null)
                {
                    var uploadsFolder = Path.Combine(_webHostEnvironment.WebRootPath, "images", "books");
                    if (!Directory.Exists(uploadsFolder))
                    {
                        Directory.CreateDirectory(uploadsFolder);
                    }
                    var uniqueFileName = Guid.NewGuid().ToString() + "_" + createBookDto.ImageFile.FileName;
                    var filePath = Path.Combine(uploadsFolder, uniqueFileName);
                    using (var fileStream = new FileStream(filePath, FileMode.Create))
                    {
                        await createBookDto.ImageFile.CopyToAsync(fileStream);
                    }
                    imageUrl = "/images/books/" + uniqueFileName;
                }

                var book = new Book
                {
                    AuthorId = createBookDto.AuthorId,
                    Title = createBookDto.Title,
                    TotalPages = createBookDto.TotalPages,
                    ImageUrl = imageUrl
                };
                var newBook = await _bookService.AddBookAsync(book);
                var bookDto = new BookDto
                {
                    Id = newBook.Id,
                    AuthorId = newBook.AuthorId,
                    Title = newBook.Title,
                    TotalPages = newBook.TotalPages,
                    ImageUrl = newBook.ImageUrl,
                    CreatedAt = newBook.CreatedAt,
                    UpdatedAt = newBook.UpdatedAt
                };
                return CreatedAtAction(nameof(GetBook), new { id = bookDto.Id }, bookDto);
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

            var existingBook = await _bookService.GetBookAsync(id);
            if (existingBook == null)
            {
                return NotFound();
            }

            existingBook.AuthorId = updateBookDto.AuthorId;
            existingBook.Title = updateBookDto.Title;
            existingBook.TotalPages = updateBookDto.TotalPages;
            existingBook.UpdatedAt = DateTime.UtcNow;

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

            await _bookService.UpdateBookAsync(existingBook);

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBook(int id)
        {
            await _bookService.DeleteBookAsync(id);
            return NoContent();
        }
    }
}
