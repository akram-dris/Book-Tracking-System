
using BookTrackingSystem.Data;
using BookTrackingSystem.Models;
using Microsoft.EntityFrameworkCore;

namespace BookTrackingSystem.Repository
{
    public class BookRepository : IBookRepository
    {
        private readonly ApplicationDbContext _context;

        public BookRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Book>> GetBooksAsync(int? tagId = null, string? search = null)
        {
            var query = _context.Books
                .Include(b => b.Author)
                .Include(b => b.BookTagAssignments!)
                    .ThenInclude(bta => bta.BookTag)
                .AsQueryable();

            if (tagId.HasValue)
            {
                query = query.Where(b => b.BookTagAssignments != null && b.BookTagAssignments.Any(bta => bta.TagId == tagId.Value));
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.ToLower();
                query = query.Where(b => 
                    b.Title.ToLower().Contains(search) || 
                    (b.Author != null && b.Author.Name.ToLower().Contains(search)) ||
                    (b.BookTagAssignments != null && b.BookTagAssignments.Any(bta => bta.BookTag.Name.ToLower().Contains(search)))
                );
            }

            return await query.ToListAsync();
        }

        public async Task<Book?> GetBookAsync(int id)
        {
            return await _context.Books
                .Include(b => b.Author)
                .Include(b => b.BookTagAssignments!)
                    .ThenInclude(bta => bta.BookTag)
                .FirstOrDefaultAsync(b => b.Id == id);
        }

        public async Task<Book> AddBookAsync(Book book)
        {
            _context.Books.Add(book);
            await _context.SaveChangesAsync();
            
            return await _context.Books
                .Include(b => b.Author)
                .Include(b => b.BookTagAssignments!)
                    .ThenInclude(bta => bta.BookTag)
                .FirstOrDefaultAsync(b => b.Id == book.Id) ?? book;
        }

        public async Task<Book> UpdateBookAsync(Book book)
        {
            _context.Entry(book).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            
            return await _context.Books
                .Include(b => b.Author)
                .Include(b => b.BookTagAssignments!)
                    .ThenInclude(bta => bta.BookTag)
                .FirstOrDefaultAsync(b => b.Id == book.Id) ?? book;
        }

        public async Task DeleteBookAsync(int id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book != null)
            {
                _context.Books.Remove(book);
                await _context.SaveChangesAsync();
            }
        }
    }
}
