
using BookTrackingSystem.Data;
using BookTrackingSystem.Models;
using BookTrackingSystem.Models.Pagination;
using Microsoft.EntityFrameworkCore;

namespace BookTrackingSystem.Repository
{
    public class AuthorRepository : IAuthorRepository
    {
        private readonly ApplicationDbContext _context;

        public AuthorRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Author>> GetAuthorsAsync()
        {
            return await _context.Authors.Include(a => a.Books).AsNoTracking().ToListAsync();
        }

        public async Task<Author?> GetAuthorAsync(int id)
        {
            return await _context.Authors.Include(a => a.Books).FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<Author> AddAuthorAsync(Author author)
        {
            _context.Authors.Add(author);
            await _context.SaveChangesAsync();
            return author;
        }

        public async Task<Author> UpdateAuthorAsync(Author author)
        {
            _context.Entry(author).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return author;
        }

        public async Task DeleteAuthorAsync(int id)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1. Find all books by this author
                var books = await _context.Books
                    .Where(b => b.AuthorId == id)
                    .ToListAsync();

                // 2. Delete all books
                if (books.Any())
                {
                    _context.Books.RemoveRange(books);
                }

                // 3. Delete the author
                var author = await _context.Authors.FindAsync(id);
                if (author != null)
                {
                    _context.Authors.Remove(author);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<int> GetAuthorBookCountAsync(int authorId)
        {
            return await _context.Books
                .CountAsync(b => b.AuthorId == authorId);
        }

        public async Task<PaginatedResult<Author>> GetAuthorsPaginatedAsync(PaginationParams paginationParams)
        {
            var query = _context.Authors.Include(a => a.Books).AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(paginationParams.Search))
            {
                var search = paginationParams.Search.ToLower();
                query = query.Where(a => a.Name.ToLower().Contains(search));
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderBy(a => a.Name)
                .Skip((paginationParams.PageNumber - 1) * paginationParams.PageSize)
                .Take(paginationParams.PageSize)
                .ToListAsync();

            return new PaginatedResult<Author>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = paginationParams.PageNumber,
                PageSize = paginationParams.PageSize
            };
        }

        public async Task<IEnumerable<Author>> SearchAuthorsAsync(string query, int limit = 5)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return Enumerable.Empty<Author>();
            }

            var searchLower = query.ToLower();
            return await _context.Authors
                .AsNoTracking()
                .Where(a => a.Name.ToLower().Contains(searchLower))
                .OrderBy(a => a.Name)
                .Take(limit)
                .ToListAsync();
        }
    }
}
