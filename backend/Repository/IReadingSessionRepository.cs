using BookTrackingSystem.Models;

namespace BookTrackingSystem.Repository
{
    public interface IReadingSessionRepository
    {
        Task<IEnumerable<ReadingSession>> GetReadingSessionsForBookAsync(int bookId);
        Task<ReadingSession?> GetReadingSessionAsync(int id);
        Task<ReadingSession> AddReadingSessionAsync(ReadingSession readingSession);
        Task<ReadingSession> UpdateReadingSessionAsync(ReadingSession readingSession);
        Task DeleteReadingSessionAsync(int id);
        Task<ReadingSession?> GetReadingSessionByBookAndDateAsync(int bookId, DateTime date);
        Task<IEnumerable<ReadingSession>> GetReadingSessionsByYearAsync(int year);
    }
}
