
using BookTrackingSystem.Data;
using BookTrackingSystem.Models;
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
            return await _context.Authors.AsNoTracking().ToListAsync();
        }

        public async Task<Author?> GetAuthorAsync(int id)
        {
            return await _context.Authors.FirstOrDefaultAsync(a => a.Id == id);
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
            var author = await _context.Authors.FindAsync(id);
            if (author != null)
            {
                _context.Authors.Remove(author);
                await _context.SaveChangesAsync();
            }
        }
    }
}
