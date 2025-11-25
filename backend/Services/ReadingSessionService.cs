using AutoMapper;
using BookTrackingSystem.DTOs;
using BookTrackingSystem.Models;
using BookTrackingSystem.Repository;
using BookTrackingSystem.Models.Common;

namespace BookTrackingSystem.Services
{
    public class ReadingSessionService : IReadingSessionService
    {
        private readonly IReadingSessionRepository _readingSessionRepository;
        private readonly IBookRepository _bookRepository; // New
        private readonly IBookService _bookService; // New
        private readonly IMapper _mapper;
        private readonly ICacheService _cacheService;

        public ReadingSessionService(IReadingSessionRepository readingSessionRepository, IBookRepository bookRepository, IBookService bookService, IMapper mapper, ICacheService cacheService)
        {
            _readingSessionRepository = readingSessionRepository;
            _bookRepository = bookRepository;
            _bookService = bookService;
            _mapper = mapper;
            _cacheService = cacheService;
        }

        public async Task<Result<IEnumerable<ReadingSessionDto>>> GetReadingSessionsForBookAsync(int bookId)
        {
            try
            {
                var readingSessions = await _readingSessionRepository.GetReadingSessionsForBookAsync(bookId);
                return Result<IEnumerable<ReadingSessionDto>>.Success(_mapper.Map<IEnumerable<ReadingSessionDto>>(readingSessions));
            }
            catch (Exception ex)
            {
                return Result<IEnumerable<ReadingSessionDto>>.Failure($"An error occurred while retrieving reading sessions: {ex.Message}");
            }
        }

        public async Task<Result<ReadingSessionDto>> GetReadingSessionAsync(int id)
        {
            try
            {
                var readingSession = await _readingSessionRepository.GetReadingSessionAsync(id);
                if (readingSession == null)
                {
                    return Result<ReadingSessionDto>.Failure("Reading session not found");
                }
                return Result<ReadingSessionDto>.Success(_mapper.Map<ReadingSessionDto>(readingSession));
            }
            catch (Exception ex)
            {
                return Result<ReadingSessionDto>.Failure($"An error occurred while retrieving the reading session: {ex.Message}");
            }
        }

        public async Task<Result<ReadingSessionDto>> AddReadingSessionAsync(CreateReadingSessionDto readingSessionDto)
        {
            try
            {
                var existingSession = await _readingSessionRepository.GetReadingSessionByBookAndDateAsync(readingSessionDto.BookId, readingSessionDto.Date);

                ReadingSession resultSession;

                if (existingSession != null)
                {
                    // Validate before aggregating
                    await ValidateTotalPagesLimit(readingSessionDto.BookId, existingSession.PagesRead + readingSessionDto.PagesRead, existingSession.Id);

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
                    // Validate before creating
                    await ValidateTotalPagesLimit(readingSessionDto.BookId, readingSessionDto.PagesRead);

                    // Create a new session if none exists for this book and date
                    var readingSession = _mapper.Map<ReadingSession>(readingSessionDto);
                    var newReadingSession = await _readingSessionRepository.AddReadingSessionAsync(readingSession);
                    resultSession = newReadingSession;
                }

                await CheckBookCompletion(readingSessionDto.BookId);
                
                // Invalidate caches
                _cacheService.InvalidateHeatmap(readingSessionDto.Date.Year);
                _cacheService.InvalidateStreak();
                
                return Result<ReadingSessionDto>.Success(_mapper.Map<ReadingSessionDto>(resultSession));
            }
            catch (InvalidOperationException ex)
            {
                return Result<ReadingSessionDto>.Failure(ex.Message);
            }
            catch (Exception ex)
            {
                return Result<ReadingSessionDto>.Failure($"An error occurred while adding the reading session: {ex.Message}");
            }
        }

        public async Task<Result<ReadingSessionDto>> UpdateReadingSessionAsync(int id, UpdateReadingSessionDto readingSessionDto)
        {
            try
            {
                var existingSession = await _readingSessionRepository.GetReadingSessionAsync(id);
                if (existingSession == null)
                {
                    return Result<ReadingSessionDto>.Failure($"Reading session with ID {id} not found.");
                }

                // Check for "one session per book per day" constraint if date or bookId is changed
                if (existingSession.BookId != readingSessionDto.BookId || existingSession.Date.Date != readingSessionDto.Date.Date)
                {
                    var sessionWithSameBookAndDate = await _readingSessionRepository.GetReadingSessionByBookAndDateAsync(readingSessionDto.BookId, readingSessionDto.Date);
                    if (sessionWithSameBookAndDate != null && sessionWithSameBookAndDate.Id != id)
                    {
                        return Result<ReadingSessionDto>.Failure("Another reading session for this book on this date already exists.");
                    }
                }

                // Validate total pages
                await ValidateTotalPagesLimit(readingSessionDto.BookId, readingSessionDto.PagesRead, id);

                _mapper.Map(readingSessionDto, existingSession);
                var updatedReadingSession = await _readingSessionRepository.UpdateReadingSessionAsync(existingSession);
                await CheckBookCompletion(updatedReadingSession.BookId);
                
                // Invalidate caches
                _cacheService.InvalidateHeatmap(readingSessionDto.Date.Year);
                _cacheService.InvalidateStreak();
                
                return Result<ReadingSessionDto>.Success(_mapper.Map<ReadingSessionDto>(updatedReadingSession));
            }
            catch (InvalidOperationException ex)
            {
                return Result<ReadingSessionDto>.Failure(ex.Message);
            }
            catch (Exception ex)
            {
                return Result<ReadingSessionDto>.Failure($"An error occurred while updating the reading session: {ex.Message}");
            }
        }

        public async Task<Result> DeleteReadingSessionAsync(int id)
        {
            try
            {
                var sessionToDelete = await _readingSessionRepository.GetReadingSessionAsync(id);
                if (sessionToDelete == null)
                {
                    return Result.Failure($"Reading session with ID {id} not found.");
                }

                await _readingSessionRepository.DeleteReadingSessionAsync(id);
                await CheckBookCompletion(sessionToDelete.BookId);
                
                // Invalidate caches
                _cacheService.InvalidateHeatmap(sessionToDelete.Date.Year);
                _cacheService.InvalidateStreak();
                return Result.Success();
            }
            catch (Exception ex)
            {
                return Result.Failure($"An error occurred while deleting the reading session: {ex.Message}");
            }
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

        private async Task ValidateTotalPagesLimit(int bookId, int newSessionPages, int? sessionIdToExclude = null)
        {
            var book = await _bookRepository.GetBookAsync(bookId);
            if (book == null) throw new KeyNotFoundException($"Book with ID {bookId} not found.");

            var allSessions = await _readingSessionRepository.GetReadingSessionsForBookAsync(bookId);
            var otherSessionsTotal = allSessions.Where(s => s.Id != sessionIdToExclude).Sum(s => s.PagesRead);

            if (otherSessionsTotal + newSessionPages > book.TotalPages)
            {
                throw new InvalidOperationException($"Total pages read cannot exceed book total pages ({book.TotalPages}). Remaining pages: {book.TotalPages - otherSessionsTotal}.");
            }
        }
    }
}
