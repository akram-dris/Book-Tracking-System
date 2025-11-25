
using BookTrackingSystem.Models;
using BookTrackingSystem.Models.Pagination;

namespace BookTrackingSystem.Repository
{
    public interface IBookRepository
    {
        Task<IEnumerable<Book>> GetBooksAsync(int? tagId = null, string? search = null);
        Task<PaginatedResult<Book>> GetBooksPaginatedAsync(PaginationParams paginationParams, int? tagId = null);
        Task<Dictionary<int, int>> GetBookCountsByStatusAsync();
        Task<Book?> GetBookAsync(int id);
        Task<Book> AddBookAsync(Book book);
        Task<Book> UpdateBookAsync(Book book);
        Task DeleteBookAsync(int id);
        Task<IEnumerable<Book>> SearchBooksAsync(string query, int limit = 5);
    }
}
