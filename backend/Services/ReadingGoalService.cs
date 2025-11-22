using AutoMapper;
using BookTrackingSystem.DTOs;
using BookTrackingSystem.Models;
using BookTrackingSystem.Repository;

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

        public async Task<ReadingGoalDto?> GetReadingGoalByBookIdAsync(int bookId)
        {
            var readingGoal = await _readingGoalRepository.GetReadingGoalByBookIdAsync(bookId);
            return _mapper.Map<ReadingGoalDto>(readingGoal);
        }

        public async Task<ReadingGoalDto> AddReadingGoalAsync(CreateReadingGoalDto readingGoalDto)
        {
            var existingGoal = await _readingGoalRepository.GetReadingGoalByBookIdAsync(readingGoalDto.BookId);
            if (existingGoal != null)
            {
                throw new InvalidOperationException("A reading goal for this book already exists.");
            }

            await ValidateGoalAgainstBookPages(readingGoalDto.BookId, readingGoalDto.HighGoal);

            var readingGoal = _mapper.Map<ReadingGoal>(readingGoalDto);
            var newReadingGoal = await _readingGoalRepository.AddReadingGoalAsync(readingGoal);
            return _mapper.Map<ReadingGoalDto>(newReadingGoal);
        }

        public async Task<ReadingGoalDto> UpdateReadingGoalAsync(int bookId, UpdateReadingGoalDto readingGoalDto)
        { 
            var existingGoal = await _readingGoalRepository.GetReadingGoalByBookIdAsync(bookId);
            if (existingGoal == null)
            {
                throw new KeyNotFoundException($"Reading goal for book with ID {bookId} not found.");
            }

            await ValidateGoalAgainstBookPages(bookId, readingGoalDto.HighGoal);

            _mapper.Map(readingGoalDto, existingGoal);
            var updatedReadingGoal = await _readingGoalRepository.UpdateReadingGoalAsync(existingGoal);
            return _mapper.Map<ReadingGoalDto>(updatedReadingGoal);
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
