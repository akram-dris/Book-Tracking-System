namespace BookTrackingSystem.DTOs
{
    public class StreakDto
    {
        public int CurrentStreak { get; set; }
        public int LongestStreak { get; set; }
        public bool HasReadToday { get; set; }
    }
}