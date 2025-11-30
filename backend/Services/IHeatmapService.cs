using BookTrackingSystem.Models.Common;

namespace BookTrackingSystem.Services
{
    public interface IHeatmapService
    {
        Task<Result<Dictionary<string, int>>> GetHeatmapDataAsync(int year);
        Task<Result<YearRange>> GetAvailableYearsAsync();
    }

    public class YearRange
    {
        public int MinYear { get; set; }
        public int MaxYear { get; set; }
    }
}