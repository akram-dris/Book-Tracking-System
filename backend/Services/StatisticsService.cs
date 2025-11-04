using BookTrackingSystem.Data;
using BookTrackingSystem.DTOs;
using BookTrackingSystem.Models;
using BookTrackingSystem.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace BookTrackingSystem.Services
{
    public class StatisticsService : IStatisticsService
    {
        private readonly ApplicationDbContext _context;
        private readonly IStreakService _streakService;

        public StatisticsService(ApplicationDbContext context, IStreakService streakService)
        {
            _context = context;
            _streakService = streakService;
        }

        // Helper method to calculate date range from filter
        private (DateTime start, DateTime end) GetDateRangeFromFilter(StatisticsFilterDto filter)
        {
            var now = DateTime.UtcNow;
            var today = now.Date;

            return filter.FilterType switch
            {
                FilterType.Today => (today, today.AddDays(1).AddTicks(-1)),
                FilterType.Week => (today.AddDays(-7), now),
                FilterType.Month => (today.AddDays(-30), now),
                FilterType.Year => (today.AddDays(-365), now),
                FilterType.Custom => (filter.StartDate?.ToUniversalTime() ?? today.AddYears(-1), 
                                     filter.EndDate?.ToUniversalTime() ?? now),
                _ => (today.AddDays(-365), now)
            };
        }

        public async Task<ReadingOverviewDto> GetReadingOverviewAsync(StatisticsFilterDto? filter = null)
        {
            filter ??= new StatisticsFilterDto { FilterType = FilterType.Year };
            var (startDate, endDate) = GetDateRangeFromFilter(filter);

            var books = await _context.Books.ToListAsync();
            var sessions = await _context.ReadingSessions
                .Where(s => s.Date >= startDate && s.Date <= endDate)
                .ToListAsync();
            var streakData = await _streakService.GetStreakDataAsync();

            var totalBooksRead = books.Count(b => (b.Status == ReadingStatus.Completed || b.Status == ReadingStatus.Summarized) &&
                                                  b.CompletedDate.HasValue && b.CompletedDate.Value >= startDate && b.CompletedDate.Value <= endDate);
            var totalPagesRead = sessions.Sum(s => s.PagesRead);
            
            var daysSinceStart = (endDate.Date - startDate.Date).Days + 1;
            var averagePagesPerDay = daysSinceStart > 0 ? (double)totalPagesRead / daysSinceStart : 0;

            return new ReadingOverviewDto
            {
                TotalBooksRead = totalBooksRead,
                TotalPagesRead = totalPagesRead,
                AveragePagesPerDay = Math.Round(averagePagesPerDay, 2),
                CurrentStreak = streakData.CurrentStreak,
                LongestStreak = streakData.LongestStreak,
                BooksCurrentlyReading = books.Count(b => b.Status == ReadingStatus.CurrentlyReading),
                BooksPending = books.Count(b => b.Status == ReadingStatus.Planning || b.Status == ReadingStatus.NotReading)
            };
        }

        public async Task<AuthorStatisticsDto> GetAuthorStatisticsAsync(StatisticsFilterDto? filter = null)
        {
            filter ??= new StatisticsFilterDto { FilterType = FilterType.Year };
            var (startDate, endDate) = GetDateRangeFromFilter(filter);

            var books = await _context.Books
                .Include(b => b.Author)
                .Where(b => (b.Status == ReadingStatus.Completed || b.Status == ReadingStatus.Summarized) &&
                           b.CompletedDate.HasValue && b.CompletedDate.Value >= startDate && b.CompletedDate.Value <= endDate)
                .ToListAsync();

            var sessions = await _context.ReadingSessions
                .Include(s => s.Book)
                .ThenInclude(b => b.Author)
                .Where(s => s.Date >= startDate && s.Date <= endDate)
                .ToListAsync();

            var totalUniqueAuthors = books.Select(b => b.AuthorId).Distinct().Count();
            var totalBooks = books.Count;

            var authorBookCounts = books
                .GroupBy(b => new { b.AuthorId, AuthorName = b.Author!.Name })
                .Select(g => new AuthorBookCountDto
                {
                    AuthorId = g.Key.AuthorId,
                    AuthorName = g.Key.AuthorName,
                    BookCount = g.Count()
                })
                .OrderByDescending(a => a.BookCount)
                .ToList();

            var authorPageCounts = sessions
                .Where(s => s.Book != null && s.Book.Author != null && 
                           (s.Book.Status == ReadingStatus.Completed || s.Book.Status == ReadingStatus.Summarized))
                .GroupBy(s => new { s.Book!.AuthorId, AuthorName = s.Book!.Author!.Name })
                .Select(g => new AuthorPagesDto
                {
                    AuthorId = g.Key.AuthorId,
                    AuthorName = g.Key.AuthorName,
                    TotalPages = g.Sum(s => s.PagesRead)
                })
                .OrderByDescending(a => a.TotalPages)
                .ToList();

            var mostReadAuthor = authorBookCounts.FirstOrDefault();

            return new AuthorStatisticsDto
            {
                TotalAuthorsRead = totalUniqueAuthors,
                MostReadAuthor = mostReadAuthor?.AuthorName,
                MostReadAuthorBookCount = mostReadAuthor?.BookCount ?? 0,
                AuthorDiversityScore = totalBooks > 0 ? Math.Round((double)totalUniqueAuthors / totalBooks, 2) : 0,
                TopAuthorsByBooks = authorBookCounts.Take(10).ToList(),
                AuthorsByPages = authorPageCounts.Take(10).ToList()
            };
        }

        public async Task<TagStatisticsDto> GetTagStatisticsAsync(StatisticsFilterDto? filter = null)
        {
            filter ??= new StatisticsFilterDto { FilterType = FilterType.Year };
            var (startDate, endDate) = GetDateRangeFromFilter(filter);

            var bookTagAssignments = await _context.BookTagAssignments
                .Include(bta => bta.Book)
                .Include(bta => bta.BookTag)
                .Where(bta => (bta.Book!.Status == ReadingStatus.Completed || bta.Book!.Status == ReadingStatus.Summarized) &&
                             bta.Book.CompletedDate.HasValue && bta.Book.CompletedDate.Value >= startDate && bta.Book.CompletedDate.Value <= endDate)
                .ToListAsync();

            var sessions = await _context.ReadingSessions
                .Include(s => s.Book)
                .ThenInclude(b => b.BookTagAssignments)
                .ThenInclude(bta => bta.BookTag)
                .Where(s => s.Date >= startDate && s.Date <= endDate)
                .ToListAsync();

            var totalUniqueTags = bookTagAssignments.Select(bta => bta.TagId).Distinct().Count();
            var totalBooks = bookTagAssignments.Select(bta => bta.BookId).Distinct().Count();

            var tagBookCounts = bookTagAssignments
                .GroupBy(bta => new { bta.TagId, TagName = bta.BookTag!.Name })
                .Select(g => new TagBookCountDto
                {
                    TagId = g.Key.TagId,
                    TagName = g.Key.TagName,
                    BookCount = g.Select(x => x.BookId).Distinct().Count()
                })
                .OrderByDescending(t => t.BookCount)
                .ToList();

            var tagPageCounts = sessions
                .Where(s => s.Book != null && s.Book.BookTagAssignments != null &&
                           (s.Book.Status == ReadingStatus.Completed || s.Book.Status == ReadingStatus.Summarized))
                .SelectMany(s => s.Book!.BookTagAssignments!.Select(bta => new { bta.TagId, bta.BookTag!.Name, s.PagesRead }))
                .GroupBy(x => new { x.TagId, x.Name })
                .Select(g => new TagPagesDto
                {
                    TagId = g.Key.TagId,
                    TagName = g.Key.Name,
                    TotalPages = g.Sum(x => x.PagesRead)
                })
                .OrderByDescending(t => t.TotalPages)
                .ToList();

            var favoriteTag = tagBookCounts.FirstOrDefault();

            return new TagStatisticsDto
            {
                TotalTags = totalUniqueTags,
                FavoriteTag = favoriteTag?.TagName,
                FavoriteTagBookCount = favoriteTag?.BookCount ?? 0,
                TagDiversityScore = totalBooks > 0 ? Math.Round((double)totalUniqueTags / totalBooks, 2) : 0,
                TopTagsByBooks = tagBookCounts.Take(10).ToList(),
                TagsByPages = tagPageCounts.Take(10).ToList()
            };
        }

        public async Task<TimeBasedStatisticsDto> GetTimeBasedStatisticsAsync(StatisticsFilterDto? filter = null)
        {
            filter ??= new StatisticsFilterDto { FilterType = FilterType.Year };
            var (startDate, endDate) = GetDateRangeFromFilter(filter);

            var sessions = await _context.ReadingSessions
                .Where(s => s.Date >= startDate && s.Date <= endDate)
                .ToListAsync();

            // Monthly trend
            var monthlyTrend = sessions
                .GroupBy(s => s.Date.ToString("yyyy-MM"))
                .OrderBy(g => g.Key)
                .ToDictionary(g => g.Key, g => g.Sum(s => s.PagesRead));

            // Weekly pattern (day of week)
            var weeklyPattern = sessions
                .GroupBy(s => s.Date.DayOfWeek.ToString())
                .ToDictionary(g => g.Key, g => g.Sum(s => s.PagesRead));

            // Year over year
            var yearOverYear = sessions
                .GroupBy(s => s.Date.Year)
                .OrderBy(g => g.Key)
                .ToDictionary(g => g.Key, g => g.Sum(s => s.PagesRead));

            // Best reading month
            var bestMonth = sessions
                .GroupBy(s => new { s.Date.Year, s.Date.Month })
                .Select(g => new { Date = new DateTime(g.Key.Year, g.Key.Month, 1), Pages = g.Sum(s => s.PagesRead) })
                .OrderByDescending(x => x.Pages)
                .FirstOrDefault();

            // Best reading day of week
            var bestDay = sessions
                .GroupBy(s => s.Date.DayOfWeek)
                .Select(g => new { Day = g.Key.ToString(), Pages = g.Sum(s => s.PagesRead) })
                .OrderByDescending(x => x.Pages)
                .FirstOrDefault();

            return new TimeBasedStatisticsDto
            {
                BestReadingMonth = bestMonth != null ? bestMonth.Date.ToString("MMMM yyyy") : null,
                BestReadingMonthPages = bestMonth?.Pages ?? 0,
                BestReadingDayOfWeek = bestDay?.Day,
                BestReadingDayPages = bestDay?.Pages ?? 0,
                MonthlyTrend = monthlyTrend,
                WeeklyPattern = weeklyPattern,
                YearOverYear = yearOverYear
            };
        }

        public async Task<GoalPerformanceDto> GetGoalPerformanceAsync(StatisticsFilterDto? filter = null)
        {
            filter ??= new StatisticsFilterDto { FilterType = FilterType.Year };
            var (startDate, endDate) = GetDateRangeFromFilter(filter);

            var goals = await _context.ReadingGoals
                .Include(g => g.Book)
                .ThenInclude(b => b.ReadingSessions)
                .ToListAsync();

            var completedBooks = await _context.Books
                .Where(b => (b.Status == ReadingStatus.Completed || b.Status == ReadingStatus.Summarized) &&
                           b.CompletedDate.HasValue && b.CompletedDate.Value >= startDate && b.CompletedDate.Value <= endDate)
                .Where(b => b.StartedReadingDate.HasValue && b.CompletedDate.HasValue)
                .ToListAsync();

            var filteredGoals = goals.Where(g => 
                g.Book != null && 
                g.Book.CompletedDate.HasValue && 
                g.Book.CompletedDate.Value >= startDate && 
                g.Book.CompletedDate.Value <= endDate
            ).ToList();

            var totalGoals = filteredGoals.Count;
            var completedGoals = filteredGoals.Count(g => g.Book!.Status == ReadingStatus.Completed || g.Book!.Status == ReadingStatus.Summarized);
            var completionRate = totalGoals > 0 ? Math.Round((double)completedGoals / totalGoals * 100, 2) : 0;

            var avgDaysToComplete = completedBooks.Any() 
                ? Math.Round(completedBooks.Average(b => (b.CompletedDate!.Value - b.StartedReadingDate!.Value).TotalDays), 2)
                : 0;

            var currentGoalsProgress = goals
                .Where(g => g.Book!.Status == ReadingStatus.CurrentlyReading || 
                           g.Book!.Status == ReadingStatus.Completed ||
                           g.Book!.Status == ReadingStatus.Summarized)
                .Select(g =>
                {
                    var currentPages = g.Book!.ReadingSessions?.Sum(s => s.PagesRead) ?? 0;
                    return new CurrentGoalProgressDto
                    {
                        BookId = g.BookId,
                        BookTitle = g.Book!.Title,
                        BookStatus = g.Book!.Status.ToString(),
                        LowGoal = g.LowGoal,
                        MediumGoal = g.MediumGoal,
                        HighGoal = g.HighGoal,
                        CurrentPages = currentPages,
                        LowProgress = g.LowGoal > 0 ? Math.Round((double)currentPages / g.LowGoal * 100, 2) : 0,
                        MediumProgress = g.MediumGoal > 0 ? Math.Round((double)currentPages / g.MediumGoal * 100, 2) : 0,
                        HighProgress = g.HighGoal > 0 ? Math.Round((double)currentPages / g.HighGoal * 100, 2) : 0
                    };
                })
                .ToList();

            // Calculate goal success counts based on completed/summarized books in the date range
            var goalsWithCompletedBooks = filteredGoals.Where(g => g.Book!.Status == ReadingStatus.Completed || 
                                                  g.Book!.Status == ReadingStatus.Summarized).ToList();
            
            var lowGoalSuccessCount = 0;
            var mediumGoalSuccessCount = 0;
            var highGoalSuccessCount = 0;

            foreach (var goal in goalsWithCompletedBooks)
            {
                var totalPagesRead = goal.Book!.ReadingSessions?
                    .Where(s => s.Date >= startDate && s.Date <= endDate)
                    .Sum(s => s.PagesRead) ?? 0;
                
                if (totalPagesRead >= goal.LowGoal)
                    lowGoalSuccessCount++;
                
                if (totalPagesRead >= goal.MediumGoal)
                    mediumGoalSuccessCount++;
                
                if (totalPagesRead >= goal.HighGoal)
                    highGoalSuccessCount++;
            }

            return new GoalPerformanceDto
            {
                OverallCompletionRate = completionRate,
                LowGoalSuccessCount = lowGoalSuccessCount,
                MediumGoalSuccessCount = mediumGoalSuccessCount,
                HighGoalSuccessCount = highGoalSuccessCount,
                AverageDaysToComplete = avgDaysToComplete,
                BooksCompletedOnTime = 0, // TODO: Implement on-time tracking
                BooksOverdue = 0,
                CurrentGoalsProgress = currentGoalsProgress
            };
        }

        public async Task<BookStatisticsDto> GetBookStatisticsAsync(StatisticsFilterDto? filter = null)
        {
            filter ??= new StatisticsFilterDto { FilterType = FilterType.Year };
            var (startDate, endDate) = GetDateRangeFromFilter(filter);

            var books = await _context.Books.Include(b => b.Author).ToListAsync();
            var sessions = await _context.ReadingSessions
                .Where(s => s.Date >= startDate && s.Date <= endDate)
                .ToListAsync();

            var completedBooks = books.Where(b => (b.Status == ReadingStatus.Completed || b.Status == ReadingStatus.Summarized) &&
                                                  b.CompletedDate.HasValue && b.CompletedDate.Value >= startDate && b.CompletedDate.Value <= endDate).ToList();
            var avgBookLength = completedBooks.Any() ? Math.Round(completedBooks.Average(b => b.TotalPages), 2) : 0;

            var shortestBook = completedBooks.OrderBy(b => b.TotalPages).FirstOrDefault();
            var longestBook = completedBooks.OrderByDescending(b => b.TotalPages).FirstOrDefault();

            var avgReadingSpeed = sessions.Any() ? Math.Round(sessions.Average(s => s.PagesRead), 2) : 0;
            var completionRate = books.Any() ? Math.Round((double)completedBooks.Count / books.Count * 100, 2) : 0;

            var booksByStatus = books
                .GroupBy(b => b.Status.ToString())
                .ToDictionary(g => g.Key, g => g.Count());

            return new BookStatisticsDto
            {
                AverageBookLength = avgBookLength,
                ShortestBook = shortestBook != null ? new BookInfoDto
                {
                    Id = shortestBook.Id,
                    Title = shortestBook.Title,
                    TotalPages = shortestBook.TotalPages,
                    AuthorName = shortestBook.Author?.Name
                } : null,
                LongestBook = longestBook != null ? new BookInfoDto
                {
                    Id = longestBook.Id,
                    Title = longestBook.Title,
                    TotalPages = longestBook.TotalPages,
                    AuthorName = longestBook.Author?.Name
                } : null,
                AverageReadingSpeed = avgReadingSpeed,
                CompletionRate = completionRate,
                BooksByStatus = booksByStatus
            };
        }

        public async Task<PersonalRecordsDto> GetPersonalRecordsAsync(StatisticsFilterDto? filter = null)
        {
            filter ??= new StatisticsFilterDto { FilterType = FilterType.Year };
            var (startDate, endDate) = GetDateRangeFromFilter(filter);

            var sessions = await _context.ReadingSessions
                .Where(s => s.Date >= startDate && s.Date <= endDate)
                .ToListAsync();

            // Most pages in a day
            var mostPagesInDay = sessions
                .GroupBy(s => s.Date.Date)
                .Select(g => new { Date = g.Key, Pages = g.Sum(s => s.PagesRead) })
                .OrderByDescending(x => x.Pages)
                .FirstOrDefault();

            // Most pages in a week
            var sessionsByWeek = sessions
                .GroupBy(s => GetWeekOfYear(s.Date))
                .Select(g => new { Week = g.Key, Pages = g.Sum(s => s.PagesRead) })
                .OrderByDescending(x => x.Pages)
                .FirstOrDefault();

            // Most pages in a month
            var mostPagesInMonth = sessions
                .GroupBy(s => new { s.Date.Year, s.Date.Month })
                .Select(g => new { Date = new DateTime(g.Key.Year, g.Key.Month, 1), Pages = g.Sum(s => s.PagesRead) })
                .OrderByDescending(x => x.Pages)
                .FirstOrDefault();

            // Fastest book completion
            var completedBooks = (await _context.Books
                .Where(b => (b.Status == ReadingStatus.Completed || b.Status == ReadingStatus.Summarized) &&
                           b.StartedReadingDate.HasValue && b.CompletedDate.HasValue)
                .ToListAsync())
                .OrderBy(b => (b.CompletedDate!.Value - b.StartedReadingDate!.Value).TotalDays)
                .FirstOrDefault();

            // Total reading days
            var totalReadingDays = sessions.Select(s => s.Date.Date).Distinct().Count();

            return new PersonalRecordsDto
            {
                MostPagesInDay = mostPagesInDay != null ? new RecordDetailDto
                {
                    Pages = mostPagesInDay.Pages,
                    Date = mostPagesInDay.Date
                } : null,
                MostPagesInWeek = sessionsByWeek != null ? new RecordDetailDto
                {
                    Pages = sessionsByWeek.Pages,
                    Date = DateTime.MinValue // Week doesn't have exact date
                } : null,
                MostPagesInMonth = mostPagesInMonth != null ? new RecordDetailDto
                {
                    Pages = mostPagesInMonth.Pages,
                    Date = mostPagesInMonth.Date
                } : null,
                FastestBookCompletion = completedBooks != null ? new FastestCompletionDto
                {
                    BookId = completedBooks.Id,
                    BookTitle = completedBooks.Title,
                    Days = (int)(completedBooks.CompletedDate!.Value - completedBooks.StartedReadingDate!.Value).TotalDays,
                    StartDate = completedBooks.StartedReadingDate,
                    CompletedDate = completedBooks.CompletedDate
                } : null,
                TotalReadingDays = totalReadingDays
            };
        }

        public async Task<StatisticsDto> GetCompleteStatisticsAsync(StatisticsFilterDto? filter = null)
        {
            filter ??= new StatisticsFilterDto { FilterType = FilterType.Year };
            
            return new StatisticsDto
            {
                Overview = await GetReadingOverviewAsync(filter),
                Authors = await GetAuthorStatisticsAsync(filter),
                Tags = await GetTagStatisticsAsync(filter),
                TimeBased = await GetTimeBasedStatisticsAsync(filter),
                Goals = await GetGoalPerformanceAsync(filter),
                Books = await GetBookStatisticsAsync(filter),
                Records = await GetPersonalRecordsAsync(filter)
            };
        }

        private static int GetWeekOfYear(DateTime date)
        {
            var culture = System.Globalization.CultureInfo.CurrentCulture;
            return culture.Calendar.GetWeekOfYear(date, System.Globalization.CalendarWeekRule.FirstDay, DayOfWeek.Monday);
        }
    }
}
