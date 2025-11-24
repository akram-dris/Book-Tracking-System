
using BookTrackingSystem.Data;
using BookTrackingSystem.Models;
using BookTrackingSystem.Models.Pagination;
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
                .AsNoTracking()
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
                    (b.BookTagAssignments != null && b.BookTagAssignments.Any(bta => bta.BookTag != null && bta.BookTag.Name.ToLower().Contains(search)))
                );
            }

            return await query.ToListAsync();
        }

        public async Task<PaginatedResult<Book>> GetBooksPaginatedAsync(PaginationParams paginationParams, int? tagId = null)
        {
            var query = _context.Books
                .Include(b => b.Author)
                .Include(b => b.BookTagAssignments!)
                    .ThenInclude(bta => bta.BookTag)
                .AsNoTracking()
                .AsQueryable();

            // Apply tag filter
            if (tagId.HasValue)
            {
                query = query.Where(b => b.BookTagAssignments!.Any(bta => bta.TagId == tagId.Value));
            }

            // Apply status filter
            if (paginationParams.StatusFilter.HasValue)
            {
                query = query.Where(b => (int)b.Status == paginationParams.StatusFilter.Value);
            }

            // Apply author filter
            if (paginationParams.AuthorId.HasValue)
            {
                query = query.Where(b => b.AuthorId == paginationParams.AuthorId.Value);
            }

            // Apply rating filter
            if (paginationParams.Rating.HasValue)
            {
                query = query.Where(b => b.Rating == paginationParams.Rating.Value);
            }

            // Apply search filter
            if (!string.IsNullOrWhiteSpace(paginationParams.Search))
            {
                var search = paginationParams.Search.ToLower();
                query = query.Where(b => 
                    b.Title.ToLower().Contains(search) || 
                    b.Author!.Name.ToLower().Contains(search));
            }

            // Apply sorting
            query = ApplySorting(query, paginationParams.Sort);

            var totalCount = await query.CountAsync();

            var items = await query
                .Skip((paginationParams.PageNumber - 1) * paginationParams.PageSize)
                .Take(paginationParams.PageSize)
                .ToListAsync();

            return new PaginatedResult<Book>(items, totalCount, paginationParams.PageNumber, paginationParams.PageSize);
        }

        private IQueryable<Book> ApplySorting(IQueryable<Book> query, string? sort)
        {
            return sort switch
            {
                "title-asc" => query.OrderBy(b => b.Title),
                "title-desc" => query.OrderByDescending(b => b.Title),
                "author-asc" => query.OrderBy(b => b.Author!.Name),
                "author-desc" => query.OrderByDescending(b => b.Author!.Name),
                "date-newest" => query.OrderByDescending(b => b.CreatedAt),
                "date-oldest" => query.OrderBy(b => b.CreatedAt),
                "rating-desc" => query.OrderByDescending(b => b.Rating ?? 0),
                "rating-asc" => query.OrderBy(b => b.Rating ?? 0),
                _ => query.OrderBy(b => b.Title) // Default sort by title
            };
        }

        public async Task<Dictionary<int, int>> GetBookCountsByStatusAsync()
        {
            return await _context.Books
                .GroupBy(b => b.Status)
                .Select(g => new { Status = (int)g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.Status, x => x.Count);
        }

        public async Task<Book?> GetBookAsync(int id)
        {
            return await _context.Books
                .AsNoTracking()
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
