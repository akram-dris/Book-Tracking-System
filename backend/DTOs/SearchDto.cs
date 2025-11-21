using System.Collections.Generic;

namespace BookTrackingSystem.DTOs
{
    public class SearchDto
    {
        public IEnumerable<BookDto> Books { get; set; } = new List<BookDto>();
        public IEnumerable<AuthorDto> Authors { get; set; } = new List<AuthorDto>();
        public IEnumerable<TagDto> Tags { get; set; } = new List<TagDto>();
    }
}
