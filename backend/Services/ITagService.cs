
using BookTrackingSystem.DTOs;
using BookTrackingSystem.Models.Common;
using BookTrackingSystem.Models.Pagination;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BookTrackingSystem.Services
{
    public interface ITagService
    {
        Task<Result<IEnumerable<TagDto>>> GetAllTagsAsync();
        Task<Result<TagDto>> GetTagByIdAsync(int id);
        Task<Result<TagDto>> CreateTagAsync(CreateTagDto createTagDto);
        Task<Result<TagDto>> UpdateTagAsync(int id, UpdateTagDto updateTagDto);
        Task<Result> DeleteTagAsync(int id);
        Task<Result<Dictionary<int, int>>> GetTagUsageCountsAsync();
        Task<Result<PaginatedResult<TagDto>>> GetTagsPaginatedAsync(PaginationParams paginationParams);
    }
}
