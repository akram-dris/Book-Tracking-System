
namespace BookTrackingSystem.Models
{
    public class BookTagAssignment
    {
        public int BookId { get; set; }
        public Book? Book { get; set; }
        public int TagId { get; set; }
        public BookTag? BookTag { get; set; }
    }
}
