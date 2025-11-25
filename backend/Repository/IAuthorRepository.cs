
using BookTrackingSystem.Models;
using BookTrackingSystem.Models.Pagination;

namespace BookTrackingSystem.Repository
{
    public interface IAuthorRepository
    {
        Task<IEnumerable<Author>> GetAuthorsAsync();
        Task<Author?> GetAuthorAsync(int id);
        Task<Author> AddAuthorAsync(Author author);
        Task<Author> UpdateAuthorAsync(Author author);
        Task DeleteAuthorAsync(int id);
        Task<PaginatedResult<Author>> GetAuthorsPaginatedAsync(PaginationParams paginationParams);
        Task<IEnumerable<Author>> SearchAuthorsAsync(string query, int limit = 5);
    }
}
