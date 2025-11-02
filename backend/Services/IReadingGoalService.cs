using BookTrackingSystem.DTOs;

namespace BookTrackingSystem.Services
{
    public interface IReadingGoalService
    {
        Task<ReadingGoalDto?> GetReadingGoalByBookIdAsync(int bookId);
        Task<ReadingGoalDto> AddReadingGoalAsync(CreateReadingGoalDto readingGoalDto);
        Task<ReadingGoalDto> UpdateReadingGoalAsync(int bookId, UpdateReadingGoalDto readingGoalDto);
    }
}
