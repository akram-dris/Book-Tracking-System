namespace BookTrackingSystem.Services
{
    public interface IHeatmapService
    {
        Task<Dictionary<string, int>> GetHeatmapDataAsync(int year);
    }
}