using BookTrackingSystem.Models.Common;
using BookTrackingSystem.DTOs;
using System.Threading.Tasks;

namespace BookTrackingSystem.Services
{
    public interface ISearchService
    {
        Task<Result<SearchDto>> SearchAsync(string query);
    }
}
