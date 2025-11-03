using BookTrackingSystem.Data;
using BookTrackingSystem.Models;
using Microsoft.EntityFrameworkCore;

namespace BookTrackingSystem.Repository
{
    public class ReadingSessionRepository : IReadingSessionRepository
    {
        private readonly ApplicationDbContext _context;

        public ReadingSessionRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ReadingSession>> GetReadingSessionsForBookAsync(int bookId)
        {
            return await _context.ReadingSessions
                                 .Where(rs => rs.BookId == bookId)
                                 .OrderByDescending(rs => rs.Date) // Corrected to use 'Date' property
                                 .ToListAsync();
        }

        public async Task<ReadingSession?> GetReadingSessionAsync(int id)
        {
            return await _context.ReadingSessions
                                 .FirstOrDefaultAsync(rs => rs.Id == id);
        }

        public async Task<ReadingSession> AddReadingSessionAsync(ReadingSession readingSession)
        {
            _context.ReadingSessions.Add(readingSession);
            await _context.SaveChangesAsync();
            return readingSession;
        }

        public async Task<ReadingSession> UpdateReadingSessionAsync(ReadingSession readingSession)
        {
            _context.Entry(readingSession).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return readingSession;
        }

        public async Task DeleteReadingSessionAsync(int id)
        {
            var readingSession = await _context.ReadingSessions.FindAsync(id);
            if (readingSession != null)
            {
                _context.ReadingSessions.Remove(readingSession);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<ReadingSession?> GetReadingSessionByBookAndDateAsync(int bookId, DateTime date)
        {
            // Normalize the date to compare only the date part
            var normalizedDate = date.Date;
            return await _context.ReadingSessions
                                 .FirstOrDefaultAsync(rs => rs.BookId == bookId &&
                                                            rs.Date.Date == normalizedDate);
        }

        public async Task<IEnumerable<ReadingSession>> GetReadingSessionsByYearAsync(int year)
        {
            return await _context.ReadingSessions
                                 .Where(rs => rs.Date.Year == year)
                                 .ToListAsync();
        }

        public async Task<IEnumerable<ReadingSession>> GetAllReadingSessionsAsync()
        {
            return await _context.ReadingSessions.ToListAsync();
        }
    }
}
