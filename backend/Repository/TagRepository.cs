
using BookTrackingSystem.Data;
using BookTrackingSystem.Models;
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
            return await _context.BookTags.ToListAsync();
        }

        public async Task<BookTag> GetByIdAsync(int id)
        {
            return await _context.BookTags.FindAsync(id);
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
            var tag = await _context.BookTags.FindAsync(id);
            if (tag != null)
            {
                _context.BookTags.Remove(tag);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<Dictionary<int, int>> GetTagUsageCountsAsync()
        {
            return await _context.BookTagAssignments
                .GroupBy(bta => bta.TagId)
                .Select(g => new { TagId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.TagId, x => x.Count);
        }
    }
}
