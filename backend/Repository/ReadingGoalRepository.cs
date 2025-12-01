using BookTrackingSystem.Data;
using BookTrackingSystem.Models;
using Microsoft.EntityFrameworkCore;

namespace BookTrackingSystem.Repository
{
    public class ReadingGoalRepository : IReadingGoalRepository
    {
        private readonly ApplicationDbContext _context;

        public ReadingGoalRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ReadingGoal?> GetReadingGoalByBookIdAsync(int bookId)
        {
            return await _context.ReadingGoals
                                 .FirstOrDefaultAsync(rg => rg.BookId == bookId);
        }

        public async Task<ReadingGoal> AddReadingGoalAsync(ReadingGoal readingGoal)
        {
            _context.ReadingGoals.Add(readingGoal);
            await _context.SaveChangesAsync();
            return readingGoal;
        }

        public async Task<ReadingGoal> UpdateReadingGoalAsync(ReadingGoal readingGoal)
        {
            _context.Entry(readingGoal).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return readingGoal;
        }
    }
}
