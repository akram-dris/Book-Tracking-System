using AutoMapper;
using BookTrackingSystem.DTOs;
using BookTrackingSystem.Models;
using BookTrackingSystem.Repository;

namespace BookTrackingSystem.Services
{
    public class ReadingSessionService : IReadingSessionService
    {
        private readonly IReadingSessionRepository _readingSessionRepository;
        private readonly IBookRepository _bookRepository; // New
        private readonly IBookService _bookService; // New
        private readonly IMapper _mapper;

        public ReadingSessionService(IReadingSessionRepository readingSessionRepository, IBookRepository bookRepository, IBookService bookService, IMapper mapper)
        {
            _readingSessionRepository = readingSessionRepository;
            _bookRepository = bookRepository;
            _bookService = bookService;
            _mapper = mapper;
        }

        public async Task<IEnumerable<ReadingSessionDto>> GetReadingSessionsForBookAsync(int bookId)
        {
            var readingSessions = await _readingSessionRepository.GetReadingSessionsForBookAsync(bookId);
            return _mapper.Map<IEnumerable<ReadingSessionDto>>(readingSessions);
        }

        public async Task<ReadingSessionDto?> GetReadingSessionAsync(int id)
        {
            var readingSession = await _readingSessionRepository.GetReadingSessionAsync(id);
            return _mapper.Map<ReadingSessionDto>(readingSession);
        }

        public async Task<ReadingSessionDto> AddReadingSessionAsync(CreateReadingSessionDto readingSessionDto)
        {
            var existingSession = await _readingSessionRepository.GetReadingSessionByBookAndDateAsync(readingSessionDto.BookId, readingSessionDto.Date);

            ReadingSession resultSession;

            if (existingSession != null)
            {
                // Aggregate pages if a session for this book and date already exists
                existingSession.PagesRead += readingSessionDto.PagesRead;
                if (!string.IsNullOrWhiteSpace(readingSessionDto.Summary))
                {
                    if (!string.IsNullOrWhiteSpace(existingSession.Summary))
                    {
                        existingSession.Summary += $"\n{readingSessionDto.Summary}";
                    }
                    else
                    {
                        existingSession.Summary = readingSessionDto.Summary;
                    }
                }
                resultSession = await _readingSessionRepository.UpdateReadingSessionAsync(existingSession);
            }
            else
            {
                // Create a new session if none exists for this book and date
                var readingSession = _mapper.Map<ReadingSession>(readingSessionDto);
                var newReadingSession = await _readingSessionRepository.AddReadingSessionAsync(readingSession);
                resultSession = newReadingSession;
            }

            await CheckBookCompletion(readingSessionDto.BookId);
            return _mapper.Map<ReadingSessionDto>(resultSession);
        }

        public async Task<ReadingSessionDto> UpdateReadingSessionAsync(int id, UpdateReadingSessionDto readingSessionDto)
        {
            var existingSession = await _readingSessionRepository.GetReadingSessionAsync(id);
            if (existingSession == null)
            {
                throw new KeyNotFoundException($"Reading session with ID {id} not found.");
            }

            // Check for "one session per book per day" constraint if date or bookId is changed
            if (existingSession.BookId != readingSessionDto.BookId || existingSession.Date.Date != readingSessionDto.Date.Date)
            {
                var sessionWithSameBookAndDate = await _readingSessionRepository.GetReadingSessionByBookAndDateAsync(readingSessionDto.BookId, readingSessionDto.Date);
                if (sessionWithSameBookAndDate != null && sessionWithSameBookAndDate.Id != id)
                {
                    throw new InvalidOperationException("Another reading session for this book on this date already exists.");
                }
            }

            _mapper.Map(readingSessionDto, existingSession);
            var updatedReadingSession = await _readingSessionRepository.UpdateReadingSessionAsync(existingSession);
            await CheckBookCompletion(updatedReadingSession.BookId);
            return _mapper.Map<ReadingSessionDto>(updatedReadingSession);
        }

        public async Task DeleteReadingSessionAsync(int id)
        {
            var sessionToDelete = await _readingSessionRepository.GetReadingSessionAsync(id);
            if (sessionToDelete == null)
            {
                throw new KeyNotFoundException($"Reading session with ID {id} not found.");
            }

            await _readingSessionRepository.DeleteReadingSessionAsync(id);
            await CheckBookCompletion(sessionToDelete.BookId);
        }

        private async Task CheckBookCompletion(int bookId)
        {
            var book = await _bookRepository.GetBookAsync(bookId);
            if (book == null) return;

            var allSessions = await _readingSessionRepository.GetReadingSessionsForBookAsync(bookId);
            var totalPagesRead = allSessions.Sum(s => s.PagesRead);

            if (totalPagesRead >= book.TotalPages && book.Status != Models.Enums.ReadingStatus.Completed)
            {
                // Mark as completed
                await _bookService.UpdateBookStatusAsync(bookId, Models.Enums.ReadingStatus.Completed, book.StartedReadingDate, DateTime.UtcNow);
            }
            else if (totalPagesRead < book.TotalPages && book.Status == Models.Enums.ReadingStatus.Completed)
            {
                // Revert from completed if pages read drop below total pages
                await _bookService.UpdateBookStatusAsync(bookId, Models.Enums.ReadingStatus.CurrentlyReading, book.StartedReadingDate, null);
            }
        }
    }
}
