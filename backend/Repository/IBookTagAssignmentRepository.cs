
using BookTrackingSystem.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BookTrackingSystem.Repository
{
    public interface IBookTagAssignmentRepository
    {
        Task AddAsync(BookTagAssignment bookTagAssignment);
        Task RemoveAsync(BookTagAssignment bookTagAssignment);
        Task<IEnumerable<BookTagAssignment>> GetByBookIdAsync(int bookId);
    }
}
