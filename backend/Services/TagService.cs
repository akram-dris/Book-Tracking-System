
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

        public TagService(ITagRepository tagRepository, IMapper mapper)
        {
            _tagRepository = tagRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<TagDto>> GetAllTagsAsync()
        {
            var tags = await _tagRepository.GetAllAsync();
            return _mapper.Map<IEnumerable<TagDto>>(tags);
        }

        public async Task<TagDto> GetTagByIdAsync(int id)
        {
            var tag = await _tagRepository.GetByIdAsync(id);
            return _mapper.Map<TagDto>(tag);
        }

        public async Task<TagDto> CreateTagAsync(CreateTagDto createTagDto)
        {
            var tag = _mapper.Map<BookTag>(createTagDto);
            var newTag = await _tagRepository.AddAsync(tag);
            return _mapper.Map<TagDto>(newTag);
        }

        public async Task<TagDto> UpdateTagAsync(int id, UpdateTagDto updateTagDto)
        {
            var tag = await _tagRepository.GetByIdAsync(id);
            if (tag == null)
            {
                return null;
            }

            _mapper.Map(updateTagDto, tag);
            var updatedTag = await _tagRepository.UpdateAsync(tag);
            return _mapper.Map<TagDto>(updatedTag);
        }

        public async Task DeleteTagAsync(int id)
        {
            await _tagRepository.DeleteAsync(id);
        }

        public async Task<Dictionary<int, int>> GetTagUsageCountsAsync()
        {
            return await _tagRepository.GetTagUsageCountsAsync();
        }
    }
}
