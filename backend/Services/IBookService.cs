
using BookTrackingSystem.Models;

namespace BookTrackingSystem.Services
{
    public interface IBookService
    {
        Task<IEnumerable<Book>> GetBooksAsync();
        Task<Book?> GetBookAsync(int id);
        Task<Book> AddBookAsync(Book book);
        Task<Book> UpdateBookAsync(Book book);
        Task DeleteBookAsync(int id);
    }
}
