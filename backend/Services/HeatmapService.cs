using BookTrackingSystem.Repository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BookTrackingSystem.Services
{
    public class HeatmapService : IHeatmapService
    {
        private readonly IReadingSessionRepository _readingSessionRepository;

        public HeatmapService(IReadingSessionRepository readingSessionRepository)
        {
            _readingSessionRepository = readingSessionRepository;
        }

        public async Task<Dictionary<string, int>> GetHeatmapDataAsync(int year)
        {
            var sessions = await _readingSessionRepository.GetReadingSessionsByYearAsync(year);

            var heatmapData = sessions
                .GroupBy(s => s.Date.Date) // Group by date only
                .ToDictionary(
                    g => g.Key.ToString("yyyy-MM-dd"), // Key: "YYYY-MM-DD"
                    g => g.Sum(s => s.PagesRead) // Value: Total pages read for the day
                );

            return heatmapData;
        }
    }
}