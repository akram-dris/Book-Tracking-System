using BookTrackingSystem.DTOs;
using BookTrackingSystem.Models.Enums;

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

        public IEnumerable<ReadingStatusDto> GetAllStatuses()
        {
            return _statuses;
        }

        public ReadingStatusDto? GetStatusInfo(ReadingStatus status)
        {
            return _statuses.FirstOrDefault(s => s.Value == (int)status);
        }
    }
}
