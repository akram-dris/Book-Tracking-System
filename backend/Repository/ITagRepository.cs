
using BookTrackingSystem.Models;
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
    }
}
