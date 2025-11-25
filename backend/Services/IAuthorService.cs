
using BookTrackingSystem.Models;
using BookTrackingSystem.Models.Common;
using BookTrackingSystem.Models.Pagination;
using BookTrackingSystem.DTOs;

namespace BookTrackingSystem.Services
{
    public interface IAuthorService
    {
        Task<Result<IEnumerable<AuthorDto>>> GetAuthorsAsync();
        Task<Result<AuthorDto>> GetAuthorAsync(int id);
        Task<Result<AuthorDto>> AddAuthorAsync(CreateAuthorDto authorDto);
        Task<Result<AuthorDto>> UpdateAuthorAsync(int id, UpdateAuthorDto authorDto);
        Task<Result> DeleteAuthorAsync(int id);
        Task<Result<PaginatedResult<AuthorDto>>> GetAuthorsPaginatedAsync(PaginationParams paginationParams);
    }
}
