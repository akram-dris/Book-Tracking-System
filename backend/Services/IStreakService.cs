using BookTrackingSystem.Models.Common;
using BookTrackingSystem.DTOs;
using System.Threading.Tasks;

namespace BookTrackingSystem.Services
{
    public interface IStreakService
    {
        Task<Result<StreakDto>> GetStreakDataAsync(DateTime? clientLocalToday = null);
    }
}