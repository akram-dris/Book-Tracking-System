
using AutoMapper;
using BookTrackingSystem.DTOs;
using BookTrackingSystem.Models;
using BookTrackingSystem.Repository;
using BookTrackingSystem.Models.Common;
using BookTrackingSystem.Models.Pagination;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BookTrackingSystem.Services
{
    public class TagService : ITagService
    {
        private readonly ITagRepository _tagRepository;
        private readonly IMapper _mapper;
        private readonly ICacheService _cacheService;

        public TagService(ITagRepository tagRepository, IMapper mapper, ICacheService cacheService)
        {
            _tagRepository = tagRepository;
            _mapper = mapper;
            _cacheService = cacheService;
        }

        public async Task<Result<IEnumerable<TagDto>>> GetAllTagsAsync()
        {
            try
            {
                var tags = await _cacheService.GetOrCreateAsync(
                    CacheService.TAGS_LIST,
                    async () =>
                    {
                        var tags = await _tagRepository.GetAllAsync();
                        return _mapper.Map<IEnumerable<TagDto>>(tags);
                    },
                    TimeSpan.FromHours(1)
                ) ?? Enumerable.Empty<TagDto>();
                return Result<IEnumerable<TagDto>>.Success(tags);
            }
            catch (Exception ex)
            {
                return Result<IEnumerable<TagDto>>.Failure($"An error occurred while retrieving tags: {ex.Message}");
            }
        }

        public async Task<Result<TagDto>> GetTagByIdAsync(int id)
        {
            try
            {
                var tagDto = await _cacheService.GetOrCreateAsync(
                    $"{CacheService.TAG_PREFIX}{id}",
                    async () =>
                    {
                        var tag = await _tagRepository.GetByIdAsync(id);
                        if (tag == null)
                        {
                            return null;
                        }
                        return _mapper.Map<TagDto>(tag)!;
                    },
                    TimeSpan.FromHours(1)
                );

                if (tagDto == null)
                {
                    return Result<TagDto>.Failure("Tag not found");
                }

                return Result<TagDto>.Success(tagDto);
            }
            catch (Exception ex)
            {
                return Result<TagDto>.Failure($"An error occurred while retrieving the tag: {ex.Message}");
            }
        }

        public async Task<Result<TagDto>> CreateTagAsync(CreateTagDto createTagDto)
        {
            try
            {
                var tag = _mapper.Map<BookTag>(createTagDto);
                var newTag = await _tagRepository.AddAsync(tag);
                _cacheService.InvalidateTags();
                return Result<TagDto>.Success(_mapper.Map<TagDto>(newTag));
            }
            catch (Exception ex)
            {
                return Result<TagDto>.Failure($"An error occurred while creating the tag: {ex.Message}");
            }
        }

        public async Task<Result<TagDto>> UpdateTagAsync(int id, UpdateTagDto updateTagDto)
        {
            try
            {
                var tag = await _tagRepository.GetByIdAsync(id);
                if (tag == null)
                {
                    return Result<TagDto>.Failure("Tag not found");
                }

                _mapper.Map(updateTagDto, tag);
                var updatedTag = await _tagRepository.UpdateAsync(tag);
                _cacheService.InvalidateTag(id);
                return Result<TagDto>.Success(_mapper.Map<TagDto>(updatedTag));
            }
            catch (Exception ex)
            {
                return Result<TagDto>.Failure($"An error occurred while updating the tag: {ex.Message}");
            }
        }

        public async Task<Result> DeleteTagAsync(int id)
        {
            try
            {
                var tag = await _tagRepository.GetByIdAsync(id);
                if (tag == null)
                {
                    return Result.Failure("Tag not found");
                }

                await _tagRepository.DeleteAsync(id);
                _cacheService.InvalidateTag(id);
                return Result.Success();
            }
            catch (Exception ex)
            {
                return Result.Failure($"An error occurred while deleting the tag: {ex.Message}");
            }
        }

        public async Task<Result<Dictionary<int, int>>> GetTagUsageCountsAsync()
        {
            try
            {
                var counts = await _cacheService.GetOrCreateAsync(
                    CacheService.TAG_USAGE_COUNTS,
                    async () => await _tagRepository.GetTagUsageCountsAsync(),
                    TimeSpan.FromMinutes(30)
                ) ?? new Dictionary<int, int>();
                return Result<Dictionary<int, int>>.Success(counts);
            }
            catch (Exception ex)
            {
                return Result<Dictionary<int, int>>.Failure($"An error occurred while retrieving tag usage counts: {ex.Message}");
            }
        }

        public async Task<Result<PaginatedResult<TagDto>>> GetTagsPaginatedAsync(PaginationParams paginationParams)
        {
            try
            {
                var paginatedTags = await _tagRepository.GetTagsPaginatedAsync(paginationParams);

                var tagDtos = paginatedTags.Items.Select(tag => new TagDto
                {
                    Id = tag.Id,
                    Name = tag.Name,
                    AverageRating = tag.BookTagAssignments != null && tag.BookTagAssignments.Any(bta => bta.Book?.Rating != null)
                        ? tag.BookTagAssignments.Where(bta => bta.Book?.Rating != null).Average(bta => bta.Book!.Rating!.Value)
                        : null
                }).ToList();

                var result = new PaginatedResult<TagDto>
                {
                    Items = tagDtos,
                    TotalCount = paginatedTags.TotalCount,
                    PageNumber = paginatedTags.PageNumber,
                    PageSize = paginatedTags.PageSize
                };

                return Result<PaginatedResult<TagDto>>.Success(result);
            }
            catch (Exception ex)
            {
                return Result<PaginatedResult<TagDto>>.Failure($"An error occurred while retrieving tags: {ex.Message}");
            }
        }
    }
}

