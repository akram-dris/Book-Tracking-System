using BookTrackingSystem.DTOs;
using BookTrackingSystem.Models.Enums;
using BookTrackingSystem.Models.Common;

namespace BookTrackingSystem.Services
{
    public class ReadingStatusService : IReadingStatusService
    {
        private readonly List<ReadingStatusDto> _statuses;

        public ReadingStatusService()
        {
            _statuses = new List<ReadingStatusDto>
            {
                new ReadingStatusDto
                {
                    Value = (int)ReadingStatus.NotReading,
                    Name = nameof(ReadingStatus.NotReading),
                    DisplayName = "Not Reading",
                    BadgeClass = "badge-neutral"
                },
                new ReadingStatusDto
                {
                    Value = (int)ReadingStatus.Planning,
                    Name = nameof(ReadingStatus.Planning),
                    DisplayName = "Planning",
                    BadgeClass = "badge-info"
                },
                new ReadingStatusDto
                {
                    Value = (int)ReadingStatus.CurrentlyReading,
                    Name = nameof(ReadingStatus.CurrentlyReading),
                    DisplayName = "Currently Reading",
                    BadgeClass = "badge-warning"
                },
                new ReadingStatusDto
                {
                    Value = (int)ReadingStatus.Completed,
                    Name = nameof(ReadingStatus.Completed),
                    DisplayName = "Completed",
                    BadgeClass = "badge-accent"
                },
                new ReadingStatusDto
                {
                    Value = (int)ReadingStatus.Summarized,
                    Name = nameof(ReadingStatus.Summarized),
                    DisplayName = "Summarized",
                    BadgeClass = "badge-secondary"
                }
            };
        }

        public Result<IEnumerable<ReadingStatusDto>> GetAllStatuses()
        {
            return Result<IEnumerable<ReadingStatusDto>>.Success(_statuses);
        }

        public Result<ReadingStatusDto> GetStatusInfo(ReadingStatus status)
        {
            var statusDto = _statuses.FirstOrDefault(s => s.Value == (int)status);
            if (statusDto == null)
            {
                return Result<ReadingStatusDto>.Failure($"Status {status} not found");
            }
            return Result<ReadingStatusDto>.Success(statusDto);
        }
    }
}
