using Microsoft.Extensions.Caching.Memory;
using System.Collections.Concurrent;

namespace BookTrackingSystem.Services
{
    public class CacheService : ICacheService
    {
        private readonly IMemoryCache _cache;
        private readonly ConcurrentDictionary<string, byte> _cacheKeys;

        // Cache key constants
        public const string AUTHORS_LIST = "authors_list";
        public const string AUTHOR_PREFIX = "author_";
        public const string TAGS_LIST = "tags_list";
        public const string TAG_PREFIX = "tag_";
        public const string TAG_USAGE_COUNTS = "tag_usage_counts";
        public const string STATISTICS_PREFIX = "statistics_";
        public const string HEATMAP_PREFIX = "heatmap_";
        public const string STREAK_DATA = "streak_data";

        public CacheService(IMemoryCache cache)
        {
            _cache = cache;
            _cacheKeys = new ConcurrentDictionary<string, byte>();
        }

        public async Task<T?> GetOrCreateAsync<T>(string key, Func<Task<T>> factory, TimeSpan? absoluteExpiration = null)
        {
            if (_cache.TryGetValue(key, out T? cachedValue))
            {
                return cachedValue;
            }

            var value = await factory();

            var cacheEntryOptions = new MemoryCacheEntryOptions
            {
                Size = 1 // For size limit management
            };

            if (absoluteExpiration.HasValue)
            {
                cacheEntryOptions.SetAbsoluteExpiration(absoluteExpiration.Value);
            }

            _cache.Set(key, value, cacheEntryOptions);
            _cacheKeys.TryAdd(key, 0);

            return value;
        }

        public void Remove(string key)
        {
            _cache.Remove(key);
            _cacheKeys.TryRemove(key, out _);
        }

        public void RemoveByPattern(string pattern)
        {
            var keysToRemove = _cacheKeys.Keys.Where(k => k.StartsWith(pattern)).ToList();
            foreach (var key in keysToRemove)
            {
                Remove(key);
            }
        }

        public void InvalidateAuthors()
        {
            Remove(AUTHORS_LIST);
        }

        public void InvalidateAuthor(int authorId)
        {
            Remove($"{AUTHOR_PREFIX}{authorId}");
            Remove(AUTHORS_LIST); // Also invalidate the list
        }

        public void InvalidateTags()
        {
            Remove(TAGS_LIST);
        }

        public void InvalidateTag(int tagId)
        {
            Remove($"{TAG_PREFIX}{tagId}");
            Remove(TAGS_LIST); // Also invalidate the list
            Remove(TAG_USAGE_COUNTS); // Also invalidate usage counts
        }

        public void InvalidateStatistics()
        {
            RemoveByPattern(STATISTICS_PREFIX);
        }

        public void InvalidateHeatmap(int year)
        {
            Remove($"{HEATMAP_PREFIX}{year}");
        }

        public void InvalidateAllHeatmaps()
        {
            RemoveByPattern(HEATMAP_PREFIX);
        }

        public void InvalidateStreak()
        {
            Remove(STREAK_DATA);
        }

        public void InvalidateReadingData()
        {
            InvalidateStatistics();
            InvalidateAllHeatmaps();
            InvalidateStreak();
        }
    }
}
