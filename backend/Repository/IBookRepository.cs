
using BookTrackingSystem.Models;

namespace BookTrackingSystem.Repository
{
    public interface IBookRepository
    {
        Task<IEnumerable<Book>> GetBooksAsync();
        Task<Book?> GetBookAsync(int id);
        Task<Book> AddBookAsync(Book book);
        Task<Book> UpdateBookAsync(Book book);
        Task DeleteBookAsync(int id);
    }
}
