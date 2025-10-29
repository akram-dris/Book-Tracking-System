
using BookTrackingSystem.Models;

namespace BookTrackingSystem.Repository
{
    public interface IAuthorRepository
    {
        Task<IEnumerable<Author>> GetAuthorsAsync();
        Task<Author?> GetAuthorAsync(int id);
        Task<Author> AddAuthorAsync(Author author);
        Task<Author> UpdateAuthorAsync(Author author);
        Task DeleteAuthorAsync(int id);
    }
}
