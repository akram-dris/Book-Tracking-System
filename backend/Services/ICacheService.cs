namespace BookTrackingSystem.Services
{
    public interface ICacheService
    {
        /// <summary>
        /// Gets a cached value or creates it if it doesn't exist
        /// </summary>
        Task<T?> GetOrCreateAsync<T>(string key, Func<Task<T>> factory, TimeSpan? absoluteExpiration = null);

        /// <summary>
        /// Removes a specific cache entry
        /// </summary>
        void Remove(string key);

        /// <summary>
        /// Removes all cache entries matching a pattern
        /// </summary>
        void RemoveByPattern(string pattern);

        /// <summary>
        /// Invalidates all author-related caches
        /// </summary>
        void InvalidateAuthors();

        /// <summary>
        /// Invalidates a specific author cache
        /// </summary>
        void InvalidateAuthor(int authorId);

        /// <summary>
        /// Invalidates all tag-related caches
        /// </summary>
        void InvalidateTags();

        /// <summary>
        /// Invalidates a specific tag cache
        /// </summary>
        void InvalidateTag(int tagId);

        /// <summary>
        /// Invalidates all statistics caches
        /// </summary>
        void InvalidateStatistics();

        /// <summary>
        /// Invalidates heatmap cache for a specific year
        /// </summary>
        void InvalidateHeatmap(int year);

        /// <summary>
        /// Invalidates all heatmap caches
        /// </summary>
        void InvalidateAllHeatmaps();

        /// <summary>
        /// Invalidates streak cache
        /// </summary>
        void InvalidateStreak();

        /// <summary>
        /// Invalidates all reading-related caches (statistics, heatmap, streak)
        /// </summary>
        void InvalidateReadingData();
    }
}
