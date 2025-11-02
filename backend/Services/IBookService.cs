
using BookTrackingSystem.DTOs;
using BookTrackingSystem.Models.Enums;
using Microsoft.AspNetCore.Http;

namespace BookTrackingSystem.Services
{
    public interface IBookService
    {
        Task<IEnumerable<BookDto>> GetBooksAsync(int? tagId = null);
        Task<BookDto?> GetBookAsync(int id);
        Task<BookDto> AddBookAsync(CreateBookDto book, IFormFile? imageFile);
        Task<BookDto> UpdateBookAsync(int id, UpdateBookDto book, IFormFile? imageFile);
        Task DeleteBookAsync(int id);
        Task AssignTagsAsync(int bookId, IEnumerable<int> tagIds);
        Task UpdateBookStatusAsync(int bookId, ReadingStatus status, DateTime? startedReadingDate = null, DateTime? completedDate = null);
        Task UpdateBookCompletedDateAsync(int bookId, DateTime? completedDate);
    }
}
