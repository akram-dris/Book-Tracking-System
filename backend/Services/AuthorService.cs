
using BookTrackingSystem.Models;
using BookTrackingSystem.Repository;

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
    }
}
