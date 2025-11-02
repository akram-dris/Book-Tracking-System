using AutoMapper;
using BookTrackingSystem.DTOs;
using BookTrackingSystem.Models;
using BookTrackingSystem.Repository;

namespace BookTrackingSystem.Services
{
    public class ReadingSessionService : IReadingSessionService
    {
        private readonly IReadingSessionRepository _readingSessionRepository;
        private readonly IMapper _mapper;

        public ReadingSessionService(IReadingSessionRepository readingSessionRepository, IMapper mapper)
        {
            _readingSessionRepository = readingSessionRepository;
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

            if (existingSession != null)
            {
                // Aggregate pages if a session for this book and date already exists
                existingSession.PagesRead += readingSessionDto.PagesRead;
                var updatedSession = await _readingSessionRepository.UpdateReadingSessionAsync(existingSession);
                return _mapper.Map<ReadingSessionDto>(updatedSession);
            }
            else
            {
                // Create a new session if none exists for this book and date
                var readingSession = _mapper.Map<ReadingSession>(readingSessionDto);
                var newReadingSession = await _readingSessionRepository.AddReadingSessionAsync(readingSession);
                return _mapper.Map<ReadingSessionDto>(newReadingSession);
            }
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
            return _mapper.Map<ReadingSessionDto>(updatedReadingSession);
        }

        public async Task DeleteReadingSessionAsync(int id)
        {
            await _readingSessionRepository.DeleteReadingSessionAsync(id);
        }
    }
}
