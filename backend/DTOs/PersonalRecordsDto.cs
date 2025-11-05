namespace BookTrackingSystem.DTOs
{
    public class PersonalRecordsDto
    {
        public RecordDetailDto? MostPagesInDay { get; set; }
        public RecordDetailDto? MostPagesInWeek { get; set; }
        public RecordDetailDto? MostPagesInMonth { get; set; }
        public FastestCompletionDto? FastestBookCompletion { get; set; }
        public int TotalReadingDays { get; set; }
    }

    public class RecordDetailDto
    {
        public int Pages { get; set; }
        public DateTime Date { get; set; }
    }

    public class FastestCompletionDto
    {
        public int BookId { get; set; }
        public string BookTitle { get; set; } = string.Empty;
        public int Days { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? CompletedDate { get; set; }
    }
}
