
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
    public class AuthorsController : ControllerBase
    {
        private readonly IAuthorService _authorService;
        private readonly ILogger<AuthorsController> _logger;
        private readonly IWebHostEnvironment _webHostEnvironment;

        public AuthorsController(IAuthorService authorService, ILogger<AuthorsController> logger, IWebHostEnvironment webHostEnvironment)
        {
            _authorService = authorService;
            _logger = logger;
            _webHostEnvironment = webHostEnvironment;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AuthorDto>>> GetAuthors()
        {
            var authors = await _authorService.GetAuthorsAsync();
            var authorDtos = authors.Select(author => new AuthorDto
            {
                Id = author.Id,
                Name = author.Name,
                Bio = author.Bio,
                ImageUrl = author.ImageUrl,
                CreatedAt = author.CreatedAt,
                UpdatedAt = author.UpdatedAt
            }).ToList();
            return Ok(authorDtos);
        }
        [HttpGet("{id}")]
        public async Task<ActionResult<AuthorDto>> GetAuthor(int id)
        {
            var author = await _authorService.GetAuthorAsync(id);
            if (author == null)
            {
                return NotFound();
            }
            var authorDto = new AuthorDto
            {
                Id = author.Id,
                Name = author.Name,
                Bio = author.Bio,
                ImageUrl = author.ImageUrl,
                CreatedAt = author.CreatedAt,
                UpdatedAt = author.UpdatedAt
            };
            return Ok(authorDto);
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<AuthorDto>> PostAuthor([FromForm] CreateAuthorDto createAuthorDto)
        {
            try
            {
                string? imageUrl = null;
                if (createAuthorDto.ImageFile != null)
                {
                    var uploadsFolder = Path.Combine(_webHostEnvironment.WebRootPath, "images", "authors");
                    if (!Directory.Exists(uploadsFolder))
                    {
                        Directory.CreateDirectory(uploadsFolder);
                    }
                    var uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(createAuthorDto.ImageFile.FileName);
                    var filePath = Path.Combine(uploadsFolder, uniqueFileName);
                    using (var fileStream = new FileStream(filePath, FileMode.Create))
                    {
                        await createAuthorDto.ImageFile.CopyToAsync(fileStream);
                    }
                    imageUrl = "/images/authors/" + uniqueFileName;
                }

                var author = new Author
                {
                    Name = createAuthorDto.Name,
                    Bio = createAuthorDto.Bio,
                    ImageUrl = imageUrl
                };
                var newAuthor = await _authorService.AddAuthorAsync(author);
                var authorDto = new AuthorDto
                {
                    Id = newAuthor.Id,
                    Name = newAuthor.Name,
                    Bio = newAuthor.Bio,
                    ImageUrl = newAuthor.ImageUrl,
                    CreatedAt = newAuthor.CreatedAt,
                    UpdatedAt = newAuthor.UpdatedAt
                };
                return CreatedAtAction(nameof(GetAuthor), new { id = authorDto.Id }, authorDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding new author");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("{id}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> PutAuthor(int id, [FromForm] UpdateAuthorDto updateAuthorDto)
        {
            var existingAuthor = await _authorService.GetAuthorAsync(id);
            if (existingAuthor == null)
            {
                return NotFound();
            }

            existingAuthor.Name = updateAuthorDto.Name;
            existingAuthor.Bio = updateAuthorDto.Bio;
            existingAuthor.UpdatedAt = DateTime.UtcNow;

            // Handle image update or removal
            if (updateAuthorDto.ImageFile != null)
            {
                // Delete old image if exists
                if (!string.IsNullOrEmpty(existingAuthor.ImageUrl))
                {
                    var oldImagePath = Path.Combine(_webHostEnvironment.WebRootPath, existingAuthor.ImageUrl.TrimStart('/'));
                    if (System.IO.File.Exists(oldImagePath))
                    {
                        System.IO.File.Delete(oldImagePath);
                    }
                }

                var uploadsFolder = Path.Combine(_webHostEnvironment.WebRootPath, "images", "authors");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }
                                    var uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(updateAuthorDto.ImageFile.FileName);                var filePath = Path.Combine(uploadsFolder, uniqueFileName);
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await updateAuthorDto.ImageFile.CopyToAsync(fileStream);
                }
                existingAuthor.ImageUrl = "/images/authors/" + uniqueFileName;
            }
            // If no new image is provided, keep the existing image (do nothing)

            await _authorService.UpdateAuthorAsync(existingAuthor);

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAuthor(int id)
        {
            var authorToDelete = await _authorService.GetAuthorAsync(id);
            if (authorToDelete == null)
            {
                return NotFound();
            }

            // Delete image file if it exists
            if (!string.IsNullOrEmpty(authorToDelete.ImageUrl))
            {
                var imagePath = Path.Combine(_webHostEnvironment.WebRootPath, authorToDelete.ImageUrl.TrimStart('/'));
                if (System.IO.File.Exists(imagePath))
                {
                    System.IO.File.Delete(imagePath);
                }
            }

            await _authorService.DeleteAuthorAsync(id);
            return NoContent();
        }
    }
}
