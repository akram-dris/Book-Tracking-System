using AutoMapper;
using BookTrackingSystem.DTOs;
using BookTrackingSystem.Models;
using BookTrackingSystem.Repository;
using BookTrackingSystem.Models.Common;

namespace BookTrackingSystem.Services
{
    public class ReadingGoalService : IReadingGoalService
    {
        private readonly IReadingGoalRepository _readingGoalRepository;
        private readonly IBookRepository _bookRepository; // New
        private readonly IMapper _mapper;

        public ReadingGoalService(IReadingGoalRepository readingGoalRepository, IBookRepository bookRepository, IMapper mapper)
        {
            _readingGoalRepository = readingGoalRepository;
            _bookRepository = bookRepository;
            _mapper = mapper;
        }

        public async Task<Result<ReadingGoalDto>> GetReadingGoalByBookIdAsync(int bookId)
        {
            try
            {
                var readingGoal = await _readingGoalRepository.GetReadingGoalByBookIdAsync(bookId);
                if (readingGoal == null)
                {
                    return Result<ReadingGoalDto>.Failure("Reading goal not found");
                }
                return Result<ReadingGoalDto>.Success(_mapper.Map<ReadingGoalDto>(readingGoal));
            }
            catch (Exception ex)
            {
                return Result<ReadingGoalDto>.Failure($"An error occurred while retrieving the reading goal: {ex.Message}");
            }
        }

        public async Task<Result<ReadingGoalDto>> AddReadingGoalAsync(CreateReadingGoalDto readingGoalDto)
        {
            try
            {
                var existingGoal = await _readingGoalRepository.GetReadingGoalByBookIdAsync(readingGoalDto.BookId);
                if (existingGoal != null)
                {
                    return Result<ReadingGoalDto>.Failure("A reading goal for this book already exists.");
                }

                await ValidateGoalAgainstBookPages(readingGoalDto.BookId, readingGoalDto.HighGoal);

                var readingGoal = _mapper.Map<ReadingGoal>(readingGoalDto);
                var newReadingGoal = await _readingGoalRepository.AddReadingGoalAsync(readingGoal);
                return Result<ReadingGoalDto>.Success(_mapper.Map<ReadingGoalDto>(newReadingGoal));
            }
            catch (InvalidOperationException ex)
            {
                return Result<ReadingGoalDto>.Failure(ex.Message);
            }
            catch (Exception ex)
            {
                return Result<ReadingGoalDto>.Failure($"An error occurred while adding the reading goal: {ex.Message}");
            }
        }

        public async Task<Result<ReadingGoalDto>> UpdateReadingGoalAsync(int bookId, UpdateReadingGoalDto readingGoalDto)
        { 
            try
            {
                var existingGoal = await _readingGoalRepository.GetReadingGoalByBookIdAsync(bookId);
                if (existingGoal == null)
                {
                    return Result<ReadingGoalDto>.Failure($"Reading goal for book with ID {bookId} not found.");
                }

                await ValidateGoalAgainstBookPages(bookId, readingGoalDto.HighGoal);

                _mapper.Map(readingGoalDto, existingGoal);
                var updatedReadingGoal = await _readingGoalRepository.UpdateReadingGoalAsync(existingGoal);
                return Result<ReadingGoalDto>.Success(_mapper.Map<ReadingGoalDto>(updatedReadingGoal));
            }
            catch (InvalidOperationException ex)
            {
                return Result<ReadingGoalDto>.Failure(ex.Message);
            }
            catch (Exception ex)
            {
                return Result<ReadingGoalDto>.Failure($"An error occurred while updating the reading goal: {ex.Message}");
            }
        }

        private async Task ValidateGoalAgainstBookPages(int bookId, int highGoal)
        {
            var book = await _bookRepository.GetBookAsync(bookId);
            if (book == null) throw new KeyNotFoundException($"Book with ID {bookId} not found.");

            if (highGoal > book.TotalPages)
            {
                throw new InvalidOperationException($"High goal ({highGoal}) cannot exceed book total pages ({book.TotalPages}).");
            }
        }
    }
}
