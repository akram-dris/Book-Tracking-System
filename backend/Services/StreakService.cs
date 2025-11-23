using BookTrackingSystem.DTOs;
using BookTrackingSystem.Repository;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace BookTrackingSystem.Services
{
    public class StreakService : IStreakService
    {
        private readonly IReadingSessionRepository _readingSessionRepository;
        private readonly ICacheService _cacheService;

        public StreakService(IReadingSessionRepository readingSessionRepository, ICacheService cacheService)
        {
            _readingSessionRepository = readingSessionRepository;
            _cacheService = cacheService;
        }

        public async Task<StreakDto> GetStreakDataAsync(DateTime? clientLocalToday = null)
        {
            // Use client's local date if provided, otherwise fallback to UTC today
            var today = clientLocalToday?.Date ?? DateTime.UtcNow.Date;

            // We can't easily cache with a dynamic 'today' parameter unless we include it in the cache key
            // or disable caching for this specific personalized view. 
            // Given the requirement, let's bypass cache or include date in key.
            // For simplicity and correctness with the new requirement, let's fetch fresh data or append date to key.
            string cacheKey = $"{CacheService.STREAK_DATA}_{today:yyyyMMdd}";

            return await _cacheService.GetOrCreateAsync(
                cacheKey,
                async () =>
                {
                    var allSessions = (await _readingSessionRepository.GetAllReadingSessionsAsync()).OrderBy(s => s.Date).ToList();

                    if (allSessions.Count == 0)
                    {
                        return new StreakDto { CurrentStreak = 0, LongestStreak = 0, HasReadToday = false };
                    }

                    int currentStreak = 0;
                    int longestStreak = 0;
                    DateTime? lastReadingDay = null;

                    foreach (var session in allSessions)
                    {
                        if (lastReadingDay.HasValue)
                        {
                            if (session.Date.Date == lastReadingDay.Value.Date.AddDays(1))
                            {
                                currentStreak++;
                            }
                            else if (session.Date.Date > lastReadingDay.Value.Date.AddDays(1))
                            {
                                currentStreak = 1; // Reset streak
                            }
                            // If same day, streak doesn't change
                        }
                        else
                        {
                            currentStreak = 1;
                        }

                        if (currentStreak > longestStreak)
                        {
                            longestStreak = currentStreak;
                        }

                        lastReadingDay = session.Date;
                    }

                    // Check if the streak is current based on the provided 'today'
                    // We compare the last reading date (which is likely UTC or effectively treated as a date) 
                    // with the client's 'today'.
                    
                    // NOTE: This assumes ReadingSession.Date is stored as a Date (midnight) or we only care about the Date part.
                    // If ReadingSession.Date is UTC, and we compare with Client Local Date, we might have a mismatch 
                    // if we don't normalize. However, usually streaks are "did I read on this calendar date?".
                    
                    bool hasReadToday = lastReadingDay.HasValue && lastReadingDay.Value.Date == today;

                    // If the last reading was BEFORE yesterday (relative to 'today'), reset streak to 0.
                    // If last reading was yesterday, streak is preserved but hasReadToday is false.
                    // If last reading was today, streak is preserved/incremented and hasReadToday is true.
                    
                    if (lastReadingDay.HasValue && (today - lastReadingDay.Value.Date).TotalDays > 1)
                    {
                        currentStreak = 0;
                    }

                    return new StreakDto { CurrentStreak = currentStreak, LongestStreak = longestStreak, HasReadToday = hasReadToday };
                },
                TimeSpan.FromHours(1)
            ) ?? new StreakDto();
        }
    }
}