
using BookTrackingSystem.Models;
using BookTrackingSystem.Models.Common;
using BookTrackingSystem.Models.Pagination;
using BookTrackingSystem.DTOs;

namespace BookTrackingSystem.Services
{
    public interface IAuthorService
    {
        Task<IEnumerable<Author>> GetAuthorsAsync();
        Task<Author?> GetAuthorAsync(int id);
        Task<Author> AddAuthorAsync(Author author);
        Task<Author> UpdateAuthorAsync(Author author);
        Task DeleteAuthorAsync(int id);
        Task<Result<PaginatedResult<AuthorDto>>> GetAuthorsPaginatedAsync(PaginationParams paginationParams);
    }
}
