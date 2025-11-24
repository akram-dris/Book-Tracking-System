
using BookTrackingSystem.DTOs;
using BookTrackingSystem.Models.Common;
using BookTrackingSystem.Models.Pagination;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BookTrackingSystem.Services
{
    public interface ITagService
    {
        Task<IEnumerable<TagDto>> GetAllTagsAsync();
        Task<TagDto?> GetTagByIdAsync(int id);
        Task<TagDto> CreateTagAsync(CreateTagDto createTagDto);
        Task<TagDto> UpdateTagAsync(int id, UpdateTagDto updateTagDto);
        Task DeleteTagAsync(int id);
        Task<Dictionary<int, int>> GetTagUsageCountsAsync();
        Task<Result<PaginatedResult<TagDto>>> GetTagsPaginatedAsync(PaginationParams paginationParams);
    }
}
