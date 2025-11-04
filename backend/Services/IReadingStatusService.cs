using BookTrackingSystem.DTOs;
using BookTrackingSystem.Models.Enums;

namespace BookTrackingSystem.Services
{
    public interface IReadingStatusService
    {
        IEnumerable<ReadingStatusDto> GetAllStatuses();
        ReadingStatusDto? GetStatusInfo(ReadingStatus status);
    }
}
