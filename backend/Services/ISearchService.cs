using BookTrackingSystem.DTOs;
using System.Threading.Tasks;

namespace BookTrackingSystem.Services
{
    public interface ISearchService
    {
        Task<SearchDto> SearchAsync(string query);
    }
}
