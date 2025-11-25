
using BookTrackingSystem.DTOs;
using BookTrackingSystem.Models.Common;
using BookTrackingSystem.Models.Enums;
using BookTrackingSystem.Models.Pagination;
using Microsoft.AspNetCore.Http;

namespace BookTrackingSystem.Services
{
    public interface IBookService
    {
        Task<Result<IEnumerable<BookDto>>> GetBooksAsync(int? tagId = null, string? search = null);
        Task<Result<PaginatedResult<BookDto>>> GetBooksPaginatedAsync(PaginationParams paginationParams, int? tagId = null);
        Task<Result<Dictionary<int, int>>> GetBookCountsByStatusAsync();
        Task<Result<BookDto>> GetBookAsync(int id);
        Task<Result<BookDto>> AddBookAsync(CreateBookDto book, IFormFile? imageFile);
        Task<Result<BookDto>> UpdateBookAsync(int id, UpdateBookDto book, IFormFile? imageFile);
        Task<Result> DeleteBookAsync(int id);
        Task<Result> AssignTagsAsync(int bookId, IEnumerable<int> tagIds);
        Task<Result> UpdateBookStatusAsync(int bookId, ReadingStatus status, DateTime? startedReadingDate = null, DateTime? completedDate = null, string? summary = null, int? rating = null);
        Task<Result> UpdateBookCompletedDateAsync(int bookId, DateTime? completedDate);
        Task<Result> UpdateBookSummaryAsync(int bookId, string summary);
    }
}
