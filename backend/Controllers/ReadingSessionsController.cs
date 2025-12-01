using BookTrackingSystem.DTOs;
using BookTrackingSystem.Services;
using Microsoft.AspNetCore.Mvc;
using BookTrackingSystem.Models.Common;
using Microsoft.Extensions.Logging;

namespace BookTrackingSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReadingSessionsController : ControllerBase
    {
        private readonly IReadingSessionService _readingSessionService;
        private readonly ILogger<ReadingSessionsController> _logger;

        public ReadingSessionsController(IReadingSessionService readingSessionService, ILogger<ReadingSessionsController> logger)
        {
            _readingSessionService = readingSessionService;
            _logger = logger;
        }

        [HttpGet("book/{bookId}")]
        public async Task<ActionResult<Result<IEnumerable<ReadingSessionDto>>>> GetReadingSessionsForBook(int bookId)
        {
            var result = await _readingSessionService.GetReadingSessionsForBookAsync(bookId);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Result<ReadingSessionDto>>> GetReadingSession(int id)
        {
            var result = await _readingSessionService.GetReadingSessionAsync(id);
            if (!result.IsSuccess)
            {
                return Ok(result);
            }
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<Result<ReadingSessionDto>>> PostReadingSession(CreateReadingSessionDto createReadingSessionDto)
        {
            var result = await _readingSessionService.AddReadingSessionAsync(createReadingSessionDto);
            if (result.IsSuccess)
            {
                return CreatedAtAction(nameof(GetReadingSession), new { id = result.Data!.Id }, result);
            }
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Result>> PutReadingSession(int id, UpdateReadingSessionDto updateReadingSessionDto)
        {
            var result = await _readingSessionService.UpdateReadingSessionAsync(id, updateReadingSessionDto);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<Result>> DeleteReadingSession(int id)
        {
            var result = await _readingSessionService.DeleteReadingSessionAsync(id);
            return Ok(result);
        }

        [HttpGet("any")]
        public async Task<ActionResult<Result<bool>>> HasAnySessions()
        {
            var result = await _readingSessionService.HasAnySessionsAsync();
            return Ok(result);
        }
    }
}
