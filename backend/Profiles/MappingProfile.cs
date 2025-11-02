
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
                .ForMember(dest => dest.Tags, opt => opt.MapFrom(src => src.BookTagAssignments != null ? src.BookTagAssignments.Select(bta => bta.BookTag) : Enumerable.Empty<BookTag>()))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status))
                .ForMember(dest => dest.StartedReadingDate, opt => opt.MapFrom(src => src.StartedReadingDate))
                .ForMember(dest => dest.CompletedDate, opt => opt.MapFrom(src => src.CompletedDate)); // New mapping
            CreateMap<Author, AuthorDto>();
            CreateMap<CreateBookDto, Book>();
            CreateMap<UpdateBookDto, Book>();
            CreateMap<CreateAuthorDto, Author>();
            CreateMap<UpdateAuthorDto, Author>();
            CreateMap<BookTag, TagDto>();
            CreateMap<CreateTagDto, BookTag>();
            CreateMap<UpdateTagDto, BookTag>();

            // ReadingSession Mappings
            CreateMap<ReadingSession, ReadingSessionDto>();
            CreateMap<CreateReadingSessionDto, ReadingSession>();
            CreateMap<UpdateReadingSessionDto, ReadingSession>();

            // ReadingGoal Mappings
            CreateMap<ReadingGoal, ReadingGoalDto>();
            CreateMap<CreateReadingGoalDto, ReadingGoal>();
            CreateMap<UpdateReadingGoalDto, ReadingGoal>();
        }
    }
}
