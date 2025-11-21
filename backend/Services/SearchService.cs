using AutoMapper;
using BookTrackingSystem.DTOs;
using BookTrackingSystem.Repository;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BookTrackingSystem.Services
{
    public class SearchService : ISearchService
    {
        private readonly IBookRepository _bookRepository;
        private readonly IAuthorRepository _authorRepository;
        private readonly ITagRepository _tagRepository;
        private readonly IMapper _mapper;

        public SearchService(
            IBookRepository bookRepository,
            IAuthorRepository authorRepository,
            ITagRepository tagRepository,
            IMapper mapper)
        {
            _bookRepository = bookRepository;
            _authorRepository = authorRepository;
            _tagRepository = tagRepository;
            _mapper = mapper;
        }

        public async Task<SearchDto> SearchAsync(string query)
        {
            var searchDto = new SearchDto();

            if (string.IsNullOrWhiteSpace(query))
            {
                return searchDto;
            }

            // Search Books (using the existing search logic in repository if possible, or we might need to add specific methods)
            // Since we already added search support to GetBooksAsync, we can use that or add a specific Search method to repositories if needed for more granular control.
            // For now, let's assume we want to search specifically by name/title for each category.
            
            // We might need to add specific search methods to repositories if GetBooksAsync is too broad or if we want to filter strictly by name for the dropdown.
            // However, GetBooksAsync already does a broad search. Let's use it for books.
            var books = await _bookRepository.GetBooksAsync(null, query);
            searchDto.Books = _mapper.Map<IEnumerable<BookDto>>(books);

            // Search Authors
            // We need to check if AuthorRepository has a search method. If not, we might need to fetch all and filter (inefficient) or add a search method.
            // Let's assume we need to add a search method to IAuthorRepository or use GetAll and filter in memory (ok for small datasets, but bad practice).
            // Given the context, let's check IAuthorRepository first. 
            // I'll assume for now we need to add it or use GetAll. Let's try to use GetAll and filter for now to avoid changing too many files, 
            // but ideally we should add SearchAsync to repositories.
            // Actually, looking at the plan, I didn't explicitly say I'd modify Author/Tag repositories. 
            // But to do it right, I should probably add search capabilities there.
            // Let's stick to the plan: "Query AuthorRepository for authors matching name".
            
            var allAuthors = await _authorRepository.GetAuthorsAsync();
            var matchingAuthors = allAuthors.Where(a => a.Name.ToLower().Contains(query.ToLower()));
            searchDto.Authors = _mapper.Map<IEnumerable<AuthorDto>>(matchingAuthors);

            // Search Tags
            var allTags = await _tagRepository.GetAllAsync();
            var matchingTags = allTags.Where(t => t.Name.ToLower().Contains(query.ToLower()));
            searchDto.Tags = _mapper.Map<IEnumerable<TagDto>>(matchingTags);

            return searchDto;
        }
    }
}
