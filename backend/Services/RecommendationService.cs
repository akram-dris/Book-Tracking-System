using BookTrackingSystem.Data;
using BookTrackingSystem.DTOs;
using BookTrackingSystem.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace BookTrackingSystem.Services
{
    public class RecommendationService : IRecommendationService
    {
        private readonly ApplicationDbContext _context;

        public RecommendationService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<RecommendationDto>> GetRecommendationsAsync()
        {
            var recommendations = new List<RecommendationDto>();

            // Get all unread books (Planning or NotReading status)
            var unreadBooks = await _context.Books
                .Include(b => b.Author)
                .Include(b => b.BookTagAssignments)
                .ThenInclude(bta => bta.BookTag)
                .Where(b => b.Status == ReadingStatus.Planning || b.Status == ReadingStatus.NotReading)
                .ToListAsync();

            // Calculate author average ratings
            var authorRatings = (await _context.Books
                .Where(b => b.Rating.HasValue)
                .GroupBy(b => b.AuthorId)
                .Select(g => new { AuthorId = g.Key, AverageRating = g.Average(b => b.Rating!.Value) })
                .ToListAsync())
                .ToDictionary(x => x.AuthorId, x => x.AverageRating);

            // Calculate tag average ratings
            var tagRatings = (await _context.BookTagAssignments
                .Include(bta => bta.Book)
                .Where(bta => bta.Book!.Rating.HasValue)
                .GroupBy(bta => bta.TagId)
                .Select(g => new { TagId = g.Key, AverageRating = g.Average(bta => bta.Book!.Rating!.Value) })
                .ToListAsync())
                .ToDictionary(x => x.TagId, x => x.AverageRating);

            // Find recommendations based on high-rated authors
            foreach (var book in unreadBooks)
            {
                double? authorRating = null;
                double? highestTagRating = null;
                string? reason = null;

                // Check author rating
                if (authorRatings.TryGetValue(book.AuthorId, out var avgAuthorRating))
                {
                    authorRating = avgAuthorRating;
                    if (avgAuthorRating >= 4.5)
                    {
                        reason = $"Top-rated author ({avgAuthorRating:F1}⭐)";
                    }
                }

                // Check tag ratings
                if (book.BookTagAssignments != null && book.BookTagAssignments.Any())
                {
                    var bookTagRatings = book.BookTagAssignments
                        .Where(bta => tagRatings.ContainsKey(bta.TagId))
                        .Select(bta => tagRatings[bta.TagId])
                        .ToList();

                    if (bookTagRatings.Any())
                    {
                        highestTagRating = bookTagRatings.Max();
                        if (highestTagRating >= 4.0 && reason == null)
                        {
                            var topTag = book.BookTagAssignments
                                .FirstOrDefault(bta => tagRatings.ContainsKey(bta.TagId) && 
                                                     Math.Abs(tagRatings[bta.TagId] - highestTagRating.Value) < 0.01);
                            reason = $"Highly rated tag: {topTag?.BookTag?.Name} ({highestTagRating:F1}⭐)";
                        }
                    }
                }

                // Add to recommendations if there's a reason
                if (reason != null)
                {
                    recommendations.Add(new RecommendationDto
                    {
                        BookId = book.Id,
                        BookTitle = book.Title,
                        AuthorName = book.Author?.Name,
                        TotalPages = book.TotalPages,
                        ImageUrl = book.ImageUrl,
                        RecommendationReason = reason,
                        AuthorAverageRating = authorRating,
                        TagAverageRating = highestTagRating,
                        Tags = book.BookTagAssignments?
                            .Select(bta => bta.BookTag?.Name ?? "")
                            .Where(name => !string.IsNullOrEmpty(name))
                            .ToList() ?? new List<string>()
                    });
                }
            }

            // Sort by rating (author rating first, then tag rating) and limit to 20
            return recommendations
                .OrderByDescending(r => r.AuthorAverageRating ?? r.TagAverageRating ?? 0)
                .Take(20)
                .ToList();
        }
    }
}
