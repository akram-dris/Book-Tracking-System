using BookTrackingSystem.Models.Common;
using BookTrackingSystem.DTOs;
using BookTrackingSystem.Models.Enums;
using System.Collections.Generic;

namespace BookTrackingSystem.Services
{
    public interface IReadingStatusService
    {
        Result<IEnumerable<ReadingStatusDto>> GetAllStatuses();
        Result<ReadingStatusDto> GetStatusInfo(ReadingStatus status);
    }
}
