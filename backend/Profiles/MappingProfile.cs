
using AutoMapper;
using BookTrackingSystem.DTOs;
using BookTrackingSystem.Models;

namespace BookTrackingSystem.Profiles
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Book, BookDto>()
                .ForMember(dest => dest.Tags, opt => opt.MapFrom(src => src.BookTagAssignments != null ? src.BookTagAssignments.Select(bta => bta.BookTag) : Enumerable.Empty<BookTag>()));
            CreateMap<Author, AuthorDto>();
            CreateMap<CreateBookDto, Book>();
            CreateMap<UpdateBookDto, Book>();
            CreateMap<CreateAuthorDto, Author>();
            CreateMap<UpdateAuthorDto, Author>();
            CreateMap<BookTag, TagDto>();
            CreateMap<CreateTagDto, BookTag>();
            CreateMap<UpdateTagDto, BookTag>();
        }
    }
}
