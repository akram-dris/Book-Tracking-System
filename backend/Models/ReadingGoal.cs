namespace BookTrackingSystem.Models
{
    public class ReadingGoal
    {
        public int Id { get; set; }
        public int BookId { get; set; }
        public int LowGoal { get; set; }
        public int MediumGoal { get; set; }
        public int HighGoal { get; set; }
        public Book? Book { get; set; }
    }
}
