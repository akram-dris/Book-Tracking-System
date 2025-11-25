using AutoMapper;
using BookTrackingSystem.DTOs;
using BookTrackingSystem.Repository;
using System.Collections.Generic;
using System.Linq;
using System.Linq;
using System.Threading.Tasks;
using BookTrackingSystem.Models.Common;
using System;
using Microsoft.Extensions.Caching.Memory;

namespace BookTrackingSystem.Services
{
    public class SearchService : ISearchService
    {
        private readonly IBookRepository _bookRepository;
        private readonly IAuthorRepository _authorRepository;
        private readonly ITagRepository _tagRepository;
        private readonly IMapper _mapper;
        private readonly IMemoryCache _cache;
        private const int SEARCH_RESULT_LIMIT = 5;
        private const int CACHE_EXPIRATION_MINUTES = 5;

        public SearchService(
            IBookRepository bookRepository,
            IAuthorRepository authorRepository,
            ITagRepository tagRepository,
            IMapper mapper,
            IMemoryCache cache)
        {
            _bookRepository = bookRepository;
            _authorRepository = authorRepository;
            _tagRepository = tagRepository;
            _mapper = mapper;
            _cache = cache;
        }

        public async Task<Result<SearchDto>> SearchAsync(string query)
        {
            try
            {
                var searchDto = new SearchDto();

                if (string.IsNullOrWhiteSpace(query))
                {
                    return Result<SearchDto>.Success(searchDto);
                }

                // Create cache key based on query
                var cacheKey = $"search_{query.ToLower()}";

                // Try to get cached results
                if (_cache.TryGetValue(cacheKey, out SearchDto? cachedResult) && cachedResult != null)
                {
                    return Result<SearchDto>.Success(cachedResult);
                }

                // Use optimized search methods with limits
                var books = await _bookRepository.SearchBooksAsync(query, SEARCH_RESULT_LIMIT);
                searchDto.Books = _mapper.Map<IEnumerable<BookDto>>(books);

                var authors = await _authorRepository.SearchAuthorsAsync(query, SEARCH_RESULT_LIMIT);
                searchDto.Authors = _mapper.Map<IEnumerable<AuthorDto>>(authors);

                var tags = await _tagRepository.SearchTagsAsync(query, SEARCH_RESULT_LIMIT);
                searchDto.Tags = _mapper.Map<IEnumerable<TagDto>>(tags);

                // Cache the results
                var cacheOptions = new MemoryCacheEntryOptions()
                    .SetAbsoluteExpiration(TimeSpan.FromMinutes(CACHE_EXPIRATION_MINUTES))
                    .SetSize(1); // Each cache entry counts as 1 unit
                _cache.Set(cacheKey, searchDto, cacheOptions);

                return Result<SearchDto>.Success(searchDto);
            }
            catch (Exception ex)
            {
                return Result<SearchDto>.Failure($"An error occurred while performing search: {ex.Message}");
            }
        }
    }
}
