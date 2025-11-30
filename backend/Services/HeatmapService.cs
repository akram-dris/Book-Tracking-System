using BookTrackingSystem.Repository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BookTrackingSystem.Models.Common;

namespace BookTrackingSystem.Services
{
    public class HeatmapService : IHeatmapService
    {
        private readonly IReadingSessionRepository _readingSessionRepository;
        private readonly ICacheService _cacheService;

        public HeatmapService(IReadingSessionRepository readingSessionRepository, ICacheService cacheService)
        {
            _readingSessionRepository = readingSessionRepository;
            _cacheService = cacheService;
        }

        public async Task<Result<Dictionary<string, int>>> GetHeatmapDataAsync(int year)
        {
            try
            {
                var data = await _cacheService.GetOrCreateAsync(
                    $"{CacheService.HEATMAP_PREFIX}{year}",
                    async () =>
                    {
                        var sessions = await _readingSessionRepository.GetReadingSessionsByYearAsync(year);

                        var heatmapData = sessions
                            .GroupBy(s => s.Date.Date) // Group by date only
                            .ToDictionary(
                                g => g.Key.ToString("yyyy-MM-dd"), // Key: "YYYY-MM-DD"
                                g => g.Sum(s => s.PagesRead) // Value: Total pages read for the day
                            );

                        return heatmapData;
                    },
                    TimeSpan.FromMinutes(30)
                );

                return Result<Dictionary<string, int>>.Success(data ?? new Dictionary<string, int>());
            }
            catch (Exception ex)
            {
                return Result<Dictionary<string, int>>.Failure($"An error occurred while retrieving heatmap data: {ex.Message}");
            }
        }

        public async Task<Result<YearRange>> GetAvailableYearsAsync()
        {
            try
            {
                var yearRange = await _cacheService.GetOrCreateAsync(
                    $"{CacheService.HEATMAP_PREFIX}years",
                    async () =>
                    {
                        var oldestSession = await _readingSessionRepository.GetOldestSessionAsync();

                        // Use oldest session year as min, current year as max
                        // This ensures all years from start to now are shown, even if there's no activity
                        int minYear = oldestSession?.Date.Year ?? DateTime.Now.Year;
                        int maxYear = DateTime.Now.Year;

                        return new YearRange
                        {
                            MinYear = minYear,
                            MaxYear = maxYear
                        };
                    },
                    TimeSpan.FromHours(1) // Cache for 1 hour
                );

                return Result<YearRange>.Success(yearRange!);
            }
            catch (Exception ex)
            {
                return Result<YearRange>.Failure($"An error occurred while retrieving available years: {ex.Message}");
            }
        }
    }
}