
using BookTrackingSystem.Models;
using BookTrackingSystem.Models.Pagination;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BookTrackingSystem.Repository
{
    public interface ITagRepository
    {
        Task<IEnumerable<BookTag>> GetAllAsync();
        Task<BookTag?> GetByIdAsync(int id);
        Task<BookTag> AddAsync(BookTag tag);
        Task<BookTag> UpdateAsync(BookTag tag);
        Task DeleteAsync(int id);
        Task<Dictionary<int, int>> GetTagUsageCountsAsync();
        Task<PaginatedResult<BookTag>> GetTagsPaginatedAsync(PaginationParams paginationParams);
        Task<IEnumerable<BookTag>> SearchTagsAsync(string query, int limit = 5);
        Task<int> GetTagBookCountAsync(int tagId);
    }
}
