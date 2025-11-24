
using BookTrackingSystem.Models;
using BookTrackingSystem.Models;
using BookTrackingSystem.Repository;
using BookTrackingSystem.Models.Common;
using BookTrackingSystem.Models.Pagination;
using BookTrackingSystem.DTOs;

namespace BookTrackingSystem.Services
{
    public class AuthorService : IAuthorService
    {
        private readonly IAuthorRepository _authorRepository;
        private readonly ICacheService _cacheService;

        public AuthorService(IAuthorRepository authorRepository, ICacheService cacheService)
        {
            _authorRepository = authorRepository;
            _cacheService = cacheService;
        }

        public async Task<IEnumerable<Author>> GetAuthorsAsync()
        {
            return await _cacheService.GetOrCreateAsync(
                CacheService.AUTHORS_LIST,
                async () => await _authorRepository.GetAuthorsAsync(),
                TimeSpan.FromHours(1)
            ) ?? Enumerable.Empty<Author>();
        }

        public async Task<Author?> GetAuthorAsync(int id)
        {
            return await _cacheService.GetOrCreateAsync(
                $"{CacheService.AUTHOR_PREFIX}{id}",
                async () => await _authorRepository.GetAuthorAsync(id),
                TimeSpan.FromHours(1)
            );
        }

        public async Task<Author> AddAuthorAsync(Author author)
        {
            var newAuthor = await _authorRepository.AddAuthorAsync(author);
            _cacheService.InvalidateAuthors();
            return newAuthor;
        }

        public async Task<Author> UpdateAuthorAsync(Author author)
        {
            var updatedAuthor = await _authorRepository.UpdateAuthorAsync(author);
            _cacheService.InvalidateAuthor(author.Id);
            return updatedAuthor;
        }

        public async Task DeleteAuthorAsync(int id)
        {
            await _authorRepository.DeleteAuthorAsync(id);
            _cacheService.InvalidateAuthor(id);
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
                        : null
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
    }
}
