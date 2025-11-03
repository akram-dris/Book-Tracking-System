using BookTrackingSystem.Models;

namespace BookTrackingSystem.Repository
{
    public interface IReadingGoalRepository
    {
        Task<ReadingGoal?> GetReadingGoalByBookIdAsync(int bookId);
        Task<ReadingGoal> AddReadingGoalAsync(ReadingGoal readingGoal);
        Task<ReadingGoal> UpdateReadingGoalAsync(ReadingGoal readingGoal);
    }
}
