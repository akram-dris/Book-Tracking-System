using BookTrackingSystem.DTOs;
using System.Threading.Tasks;

namespace BookTrackingSystem.Services
{
    public interface IStreakService
    {
        Task<StreakDto> GetStreakDataAsync();
    }
}