
using AutoMapper;
using BookTrackingSystem.DTOs;
using BookTrackingSystem.Models;
using BookTrackingSystem.Repository;
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

        public async Task<IEnumerable<TagDto>> GetAllTagsAsync()
        {
            return await _cacheService.GetOrCreateAsync(
                CacheService.TAGS_LIST,
                async () =>
                {
                    var tags = await _tagRepository.GetAllAsync();
                    return _mapper.Map<IEnumerable<TagDto>>(tags);
                },
                TimeSpan.FromHours(1)
            ) ?? Enumerable.Empty<TagDto>();
        }

        public async Task<TagDto?> GetTagByIdAsync(int id)
        {
            return await _cacheService.GetOrCreateAsync(
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
        }

        public async Task<TagDto> CreateTagAsync(CreateTagDto createTagDto)
        {
            var tag = _mapper.Map<BookTag>(createTagDto);
            var newTag = await _tagRepository.AddAsync(tag);
            _cacheService.InvalidateTags();
            return _mapper.Map<TagDto>(newTag);
        }

        public async Task<TagDto> UpdateTagAsync(int id, UpdateTagDto updateTagDto)
        {
            var tag = await _tagRepository.GetByIdAsync(id)!;


            _mapper.Map(updateTagDto, tag);
            var updatedTag = await _tagRepository.UpdateAsync(tag!);
            _cacheService.InvalidateTag(id);
            return _mapper.Map<TagDto>(updatedTag);
        }

        public async Task DeleteTagAsync(int id)
        {
            await _tagRepository.DeleteAsync(id);
            _cacheService.InvalidateTag(id);
        }

        public async Task<Dictionary<int, int>> GetTagUsageCountsAsync()
        {
            return await _cacheService.GetOrCreateAsync(
                CacheService.TAG_USAGE_COUNTS,
                async () => await _tagRepository.GetTagUsageCountsAsync(),
                TimeSpan.FromMinutes(30)
            ) ?? new Dictionary<int, int>();
        }
    }
}
