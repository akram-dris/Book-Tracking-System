
using BookTrackingSystem.Models;
using BookTrackingSystem.Repository;

namespace BookTrackingSystem.Services
{
    public class AuthorService : IAuthorService
    {
        private readonly IAuthorRepository _authorRepository;

        public AuthorService(IAuthorRepository authorRepository)
        {
            _authorRepository = authorRepository;
        }

        public async Task<IEnumerable<Author>> GetAuthorsAsync()
        {
            return await _authorRepository.GetAuthorsAsync();
        }

        public async Task<Author?> GetAuthorAsync(int id)
        {
            return await _authorRepository.GetAuthorAsync(id);
        }

        public async Task<Author> AddAuthorAsync(Author author)
        {
            return await _authorRepository.AddAuthorAsync(author);
        }

        public async Task<Author> UpdateAuthorAsync(Author author)
        {
            return await _authorRepository.UpdateAuthorAsync(author);
        }

        public async Task DeleteAuthorAsync(int id)
        {
            await _authorRepository.DeleteAuthorAsync(id);
        }
    }
}
