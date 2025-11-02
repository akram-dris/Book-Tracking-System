namespace BookTrackingSystem.DTOs
{
    public class ReadingGoalDto
    {
        public int Id { get; set; }
        public int BookId { get; set; }
        public int LowGoal { get; set; }
        public int MediumGoal { get; set; }
        public int HighGoal { get; set; }
    }
}
