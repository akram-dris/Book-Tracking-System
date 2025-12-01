
using BookTrackingSystem.Models;
using BookTrackingSystem.Repository;
using BookTrackingSystem.Models.Common;
using BookTrackingSystem.Models.Pagination;
using BookTrackingSystem.DTOs;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System.IO;

namespace BookTrackingSystem.Services
{
    public class AuthorService : IAuthorService
    {
        private readonly IAuthorRepository _authorRepository;
        private readonly ICacheService _cacheService;
        private readonly IWebHostEnvironment _webHostEnvironment;

        public AuthorService(IAuthorRepository authorRepository, ICacheService cacheService, IWebHostEnvironment webHostEnvironment)
        {
            _authorRepository = authorRepository;
            _cacheService = cacheService;
            _webHostEnvironment = webHostEnvironment;
        }

        public async Task<Result<IEnumerable<AuthorDto>>> GetAuthorsAsync()
        {
            try
            {
                var authors = await _cacheService.GetOrCreateAsync(
                    CacheService.AUTHORS_LIST,
                    async () => await _authorRepository.GetAuthorsAsync(),
                    TimeSpan.FromHours(1)
                ) ?? Enumerable.Empty<Author>();

                var authorDtos = authors.Select(author => new AuthorDto
                {
                    Id = author.Id,
                    Name = author.Name,
                    Bio = author.Bio,
                    ImageUrl = author.ImageUrl,
                    CreatedAt = author.CreatedAt,
                    UpdatedAt = author.UpdatedAt,
                    AverageRating = author.Books != null && author.Books.Any(b => b.Rating != null)
                        ? author.Books.Where(b => b.Rating != null).Average(b => b.Rating)
                        : null,
                    BookCount = author.Books != null ? author.Books.Count : 0
                }).ToList();

                return Result<IEnumerable<AuthorDto>>.Success(authorDtos);
            }
            catch (Exception ex)
            {
                return Result<IEnumerable<AuthorDto>>.Failure($"An error occurred while retrieving authors: {ex.Message}");
            }
        }

        public async Task<Result<AuthorDto>> GetAuthorAsync(int id)
        {
            try
            {
                var author = await _cacheService.GetOrCreateAsync(
                    $"{CacheService.AUTHOR_PREFIX}{id}",
                    async () => await _authorRepository.GetAuthorAsync(id),
                    TimeSpan.FromHours(1)
                );

                if (author == null)
                {
                    return Result<AuthorDto>.Failure("Author not found");
                }

                var authorDto = new AuthorDto
                {
                    Id = author.Id,
                    Name = author.Name,
                    Bio = author.Bio,
                    ImageUrl = author.ImageUrl,
                    CreatedAt = author.CreatedAt,
                    UpdatedAt = author.UpdatedAt,
                    AverageRating = author.Books != null && author.Books.Any(b => b.Rating != null)
                        ? author.Books.Where(b => b.Rating != null).Average(b => b.Rating)
                        : null,
                    BookCount = author.Books != null ? author.Books.Count : 0
                };

                return Result<AuthorDto>.Success(authorDto);
            }
            catch (Exception ex)
            {
                return Result<AuthorDto>.Failure($"An error occurred while retrieving the author: {ex.Message}");
            }
        }

        public async Task<Result<AuthorDto>> AddAuthorAsync(CreateAuthorDto authorDto)
        {
            try
            {
                string? imageUrl = null;
                if (authorDto.ImageFile != null)
                {
                    var uploadsFolder = Path.Combine(_webHostEnvironment.WebRootPath, "images", "authors");
                    if (!Directory.Exists(uploadsFolder))
                    {
                        Directory.CreateDirectory(uploadsFolder);
                    }
                    var uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(authorDto.ImageFile.FileName);
                    var filePath = Path.Combine(uploadsFolder, uniqueFileName);
                    using (var fileStream = new FileStream(filePath, FileMode.Create))
                    {
                        await authorDto.ImageFile.CopyToAsync(fileStream);
                    }
                    imageUrl = "/images/authors/" + uniqueFileName;
                }

                var author = new Author
                {
                    Name = authorDto.Name,
                    Bio = authorDto.Bio,
                    ImageUrl = imageUrl
                };

                var newAuthor = await _authorRepository.AddAuthorAsync(author);
                _cacheService.InvalidateAuthors();

                var newAuthorDto = new AuthorDto
                {
                    Id = newAuthor.Id,
                    Name = newAuthor.Name,
                    Bio = newAuthor.Bio,
                    ImageUrl = newAuthor.ImageUrl,
                    CreatedAt = newAuthor.CreatedAt,
                    UpdatedAt = newAuthor.UpdatedAt,
                    BookCount = 0
                };

                return Result<AuthorDto>.Success(newAuthorDto);
            }
            catch (Exception ex)
            {
                return Result<AuthorDto>.Failure($"An error occurred while creating the author: {ex.Message}");
            }
        }

        public async Task<Result<AuthorDto>> UpdateAuthorAsync(int id, UpdateAuthorDto authorDto)
        {
            try
            {
                var existingAuthor = await _authorRepository.GetAuthorAsync(id);
                if (existingAuthor == null)
                {
                    return Result<AuthorDto>.Failure("Author not found");
                }

                existingAuthor.Name = authorDto.Name;
                existingAuthor.Bio = authorDto.Bio;
                existingAuthor.UpdatedAt = DateTime.UtcNow;

                if (authorDto.ImageFile != null)
                {
                    if (!string.IsNullOrEmpty(existingAuthor.ImageUrl))
                    {
                        var oldImagePath = Path.Combine(_webHostEnvironment.WebRootPath, existingAuthor.ImageUrl.TrimStart('/'));
                        if (File.Exists(oldImagePath))
                        {
                            File.Delete(oldImagePath);
                        }
                    }

                    var uploadsFolder = Path.Combine(_webHostEnvironment.WebRootPath, "images", "authors");
                    if (!Directory.Exists(uploadsFolder))
                    {
                        Directory.CreateDirectory(uploadsFolder);
                    }
                    var uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(authorDto.ImageFile.FileName);
                    var filePath = Path.Combine(uploadsFolder, uniqueFileName);
                    using (var fileStream = new FileStream(filePath, FileMode.Create))
                    {
                        await authorDto.ImageFile.CopyToAsync(fileStream);
                    }
                    existingAuthor.ImageUrl = "/images/authors/" + uniqueFileName;
                }

                var updatedAuthor = await _authorRepository.UpdateAuthorAsync(existingAuthor);
                _cacheService.InvalidateAuthor(id);

                var updatedAuthorDto = new AuthorDto
                {
                    Id = updatedAuthor.Id,
                    Name = updatedAuthor.Name,
                    Bio = updatedAuthor.Bio,
                    ImageUrl = updatedAuthor.ImageUrl,
                    CreatedAt = updatedAuthor.CreatedAt,
                    UpdatedAt = updatedAuthor.UpdatedAt,
                    BookCount = updatedAuthor.Books != null ? updatedAuthor.Books.Count : 0
                };

                return Result<AuthorDto>.Success(updatedAuthorDto);
            }
            catch (Exception ex)
            {
                return Result<AuthorDto>.Failure($"An error occurred while updating the author: {ex.Message}");
            }
        }

        public async Task<Result> DeleteAuthorAsync(int id)
        {
            try
            {
                var authorToDelete = await _authorRepository.GetAuthorAsync(id);
                if (authorToDelete == null)
                {
                    return Result.Failure("Author not found");
                }

                if (!string.IsNullOrEmpty(authorToDelete.ImageUrl))
                {
                    var imagePath = Path.Combine(_webHostEnvironment.WebRootPath, authorToDelete.ImageUrl.TrimStart('/'));
                    if (File.Exists(imagePath))
                    {
                        File.Delete(imagePath);
                    }
                }

                await _authorRepository.DeleteAuthorAsync(id);
                _cacheService.InvalidateAuthor(id);
                return Result.Success();
            }
            catch (Exception ex)
            {
                return Result.Failure($"An error occurred while deleting the author: {ex.Message}");
            }
        }

        public async Task<Result<PaginatedResult<AuthorDto>>> GetAuthorsPaginatedAsync(PaginationParams paginationParams)
        {
            try
            {
                var paginatedAuthors = await _authorRepository.GetAuthorsPaginatedAsync(paginationParams);

                var authorDtos = paginatedAuthors.Items.Select(author => new AuthorDto
                {
                    Id = author.Id,
                    Name = author.Name,
                    Bio = author.Bio,
                    ImageUrl = author.ImageUrl,
                    CreatedAt = author.CreatedAt,
                    UpdatedAt = author.UpdatedAt,
                    AverageRating = author.Books != null && author.Books.Any(b => b.Rating != null)
                        ? author.Books.Where(b => b.Rating != null).Average(b => b.Rating)
                        : null,
                    BookCount = author.Books != null ? author.Books.Count : 0
                }).ToList();

                var result = new PaginatedResult<AuthorDto>
                {
                    Items = authorDtos,
                    TotalCount = paginatedAuthors.TotalCount,
                    PageNumber = paginatedAuthors.PageNumber,
                    PageSize = paginatedAuthors.PageSize
                };

                return Result<PaginatedResult<AuthorDto>>.Success(result);
            }
            catch (Exception ex)
            {
                return Result<PaginatedResult<AuthorDto>>.Failure($"An error occurred while retrieving authors: {ex.Message}");
            }
        }
        public async Task<Result<int>> GetAuthorBookCountAsync(int id)
        {
            try
            {
                var count = await _authorRepository.GetAuthorBookCountAsync(id);
                return Result<int>.Success(count);
            }
            catch (Exception ex)
            {
                return Result<int>.Failure($"An error occurred while retrieving author book count: {ex.Message}");
            }
        }
    }
}
