namespace BookTrackingSystem.DTOs
{
    public class ReadingSessionDto
    {
        public int Id { get; set; }
        public int BookId { get; set; }
        public DateTime Date { get; set; }
        public int PagesRead { get; set; }
    }
}
