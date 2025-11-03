using BookTrackingSystem.DTOs;

namespace BookTrackingSystem.Services
{
    public interface IReadingSessionService
    {
        Task<IEnumerable<ReadingSessionDto>> GetReadingSessionsForBookAsync(int bookId);
        Task<ReadingSessionDto?> GetReadingSessionAsync(int id);
        Task<ReadingSessionDto> AddReadingSessionAsync(CreateReadingSessionDto readingSessionDto);
        Task<ReadingSessionDto> UpdateReadingSessionAsync(int id, UpdateReadingSessionDto readingSessionDto);
        Task DeleteReadingSessionAsync(int id);
    }
}
