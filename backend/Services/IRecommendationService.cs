using BookTrackingSystem.Models.Common;
using BookTrackingSystem.DTOs;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace BookTrackingSystem.Services
{
    public interface IRecommendationService
    {
        Task<Result<IEnumerable<RecommendationDto>>> GetRecommendationsAsync();
    }
}
