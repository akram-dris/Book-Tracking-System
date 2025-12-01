namespace BookTrackingSystem.DTOs
{
    public class ReadingOverviewDto
    {
        public int TotalBooksRead { get; set; }
        public int TotalPagesRead { get; set; }
        public double AveragePagesPerDay { get; set; }
        public int CurrentStreak { get; set; }
        public int LongestStreak { get; set; }
        public int BooksCurrentlyReading { get; set; }
        public int BooksPending { get; set; }
    }
}
