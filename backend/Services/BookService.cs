
using BookTrackingSystem.Models;
using BookTrackingSystem.Repository;

namespace BookTrackingSystem.Services
{
    public class BookService : IBookService
    {
        private readonly IBookRepository _bookRepository;

        public BookService(IBookRepository bookRepository)
        {
            _bookRepository = bookRepository;
        }

        public async Task<IEnumerable<Book>> GetBooksAsync()
        {
            return await _bookRepository.GetBooksAsync();
        }

        public async Task<Book?> GetBookAsync(int id)
        {
            return await _bookRepository.GetBookAsync(id);
        }

        public async Task<Book> AddBookAsync(Book book)
        {
            return await _bookRepository.AddBookAsync(book);
        }

        public async Task<Book> UpdateBookAsync(Book book)
        {
            return await _bookRepository.UpdateBookAsync(book);
        }

        public async Task DeleteBookAsync(int id)
        {
            await _bookRepository.DeleteBookAsync(id);
        }
    }
}
