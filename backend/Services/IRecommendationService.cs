namespace BookTrackingSystem.Services
{
    public interface IRecommendationService
    {
        Task<IEnumerable<DTOs.RecommendationDto>> GetRecommendationsAsync();
    }
}
