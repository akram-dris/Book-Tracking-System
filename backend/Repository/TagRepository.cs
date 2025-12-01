
using BookTrackingSystem.Data;
using BookTrackingSystem.Models;
using BookTrackingSystem.Models.Pagination;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BookTrackingSystem.Repository
{
    public class TagRepository : ITagRepository
    {
        private readonly ApplicationDbContext _context;

        public TagRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<BookTag>> GetAllAsync()
        {
            return await _context.BookTags
                .Include(t => t.BookTagAssignments!)
                .ThenInclude(bta => bta.Book)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<BookTag?> GetByIdAsync(int id)
        {
            return await _context.BookTags
                .Include(t => t.BookTagAssignments!)
                .ThenInclude(bta => bta.Book)
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<BookTag> AddAsync(BookTag tag)
        {
            _context.BookTags.Add(tag);
            await _context.SaveChangesAsync();
            return tag;
        }

        public async Task<BookTag> UpdateAsync(BookTag tag)
        {
            _context.Entry(tag).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return tag;
        }

        public async Task DeleteAsync(int id)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1. Find all books associated with this tag
                var bookIds = await _context.BookTagAssignments
                    .Where(bta => bta.TagId == id)
                    .Select(bta => bta.BookId)
                    .ToListAsync();

                // 2. Remove all BookTagAssignments for this tag explicitly
                // This is needed to avoid FK constraints before we delete the tag or books
                var assignments = await _context.BookTagAssignments
                    .Where(bta => bta.TagId == id)
                    .ToListAsync();
                
                if (assignments.Any())
                {
                    _context.BookTagAssignments.RemoveRange(assignments);
                }

                // 3. Delete the associated books
                if (bookIds.Any())
                {
                    var books = await _context.Books
                        .Where(b => bookIds.Contains(b.Id))
                        .ToListAsync();
                    
                    if (books.Any())
                    {
                        _context.Books.RemoveRange(books);
                    }
                }

                // 4. Remove the tag itself
                var tag = await _context.BookTags.FindAsync(id);
                if (tag != null)
                {
                    _context.BookTags.Remove(tag);
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

        public async Task<int> GetTagBookCountAsync(int tagId)
        {
            return await _context.BookTagAssignments
                .Where(bta => bta.TagId == tagId)
                .CountAsync();
        }

        public async Task<Dictionary<int, int>> GetTagUsageCountsAsync()
        {
            return await _context.BookTagAssignments
                .GroupBy(bta => bta.TagId)
                .Select(g => new { TagId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.TagId, x => x.Count);
        }

        public async Task<PaginatedResult<BookTag>> GetTagsPaginatedAsync(PaginationParams paginationParams)
        {
            var query = _context.BookTags.Include(t => t.BookTagAssignments).ThenInclude(bta => bta.Book).AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(paginationParams.Search))
            {
                var search = paginationParams.Search.ToLower();
                query = query.Where(t => t.Name.ToLower().Contains(search));
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderBy(t => t.Name)
                .Skip((paginationParams.PageNumber - 1) * paginationParams.PageSize)
                .Take(paginationParams.PageSize)
                .ToListAsync();

            return new PaginatedResult<BookTag>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = paginationParams.PageNumber,
                PageSize = paginationParams.PageSize
            };
        }

        public async Task<IEnumerable<BookTag>> SearchTagsAsync(string query, int limit = 5)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return Enumerable.Empty<BookTag>();
            }

            var searchLower = query.ToLower();
            return await _context.BookTags
                .AsNoTracking()
                .Where(t => t.Name.ToLower().Contains(searchLower))
                .OrderBy(t => t.Name)
                .Take(limit)
                .ToListAsync();
        }
    }
}
