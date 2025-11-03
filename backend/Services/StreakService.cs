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

        public StreakService(IReadingSessionRepository readingSessionRepository)
        {
            _readingSessionRepository = readingSessionRepository;
        }

        public async Task<StreakDto> GetStreakDataAsync()
        {
            var allSessions = (await _readingSessionRepository.GetAllReadingSessionsAsync()).OrderBy(s => s.Date).ToList();

            if (allSessions.Count == 0)
            {
                return new StreakDto { CurrentStreak = 0, LongestStreak = 0 };
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

            // Check if the streak is current
            if (lastReadingDay.HasValue && (DateTime.UtcNow.Date - lastReadingDay.Value.Date).TotalDays > 1)
            {
                currentStreak = 0;
            }

            return new StreakDto { CurrentStreak = currentStreak, LongestStreak = longestStreak };
        }
    }
}