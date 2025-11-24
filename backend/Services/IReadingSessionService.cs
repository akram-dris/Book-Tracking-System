using BookTrackingSystem.DTOs;
using BookTrackingSystem.Models.Common;

namespace BookTrackingSystem.Services
{
    public interface IReadingSessionService
    {
        Task<Result<IEnumerable<ReadingSessionDto>>> GetReadingSessionsForBookAsync(int bookId);
        Task<Result<ReadingSessionDto>> GetReadingSessionAsync(int id);
        Task<Result<ReadingSessionDto>> AddReadingSessionAsync(CreateReadingSessionDto readingSessionDto);
        Task<Result<ReadingSessionDto>> UpdateReadingSessionAsync(int id, UpdateReadingSessionDto readingSessionDto);
        Task<Result> DeleteReadingSessionAsync(int id);
    }
}
