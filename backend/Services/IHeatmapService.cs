using BookTrackingSystem.Models.Common;

namespace BookTrackingSystem.Services
{
    public interface IHeatmapService
    {
        Task<Result<Dictionary<string, int>>> GetHeatmapDataAsync(int year);
    }
}