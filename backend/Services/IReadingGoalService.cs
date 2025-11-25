using BookTrackingSystem.DTOs;
using BookTrackingSystem.Models.Common;

namespace BookTrackingSystem.Services
{
    public interface IReadingGoalService
    {
        Task<Result<ReadingGoalDto>> GetReadingGoalByBookIdAsync(int bookId);
        Task<Result<ReadingGoalDto>> AddReadingGoalAsync(CreateReadingGoalDto readingGoalDto);
        Task<Result<ReadingGoalDto>> UpdateReadingGoalAsync(int bookId, UpdateReadingGoalDto readingGoalDto);
    }
}
