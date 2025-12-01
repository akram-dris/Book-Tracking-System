
using BookTrackingSystem.Data;
using BookTrackingSystem.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BookTrackingSystem.Repository
{
    public class BookTagAssignmentRepository : IBookTagAssignmentRepository
    {
        private readonly ApplicationDbContext _context;

        public BookTagAssignmentRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(BookTagAssignment bookTagAssignment)
        {
            _context.BookTagAssignments.Add(bookTagAssignment);
            await _context.SaveChangesAsync();
        }

        public async Task RemoveAsync(BookTagAssignment bookTagAssignment)
        {
            _context.BookTagAssignments.Remove(bookTagAssignment);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<BookTagAssignment>> GetByBookIdAsync(int bookId)
        {
            return await _context.BookTagAssignments
                .Where(bta => bta.BookId == bookId)
                .ToListAsync();
        }
    }
}
