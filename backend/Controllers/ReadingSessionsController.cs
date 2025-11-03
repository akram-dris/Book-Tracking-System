using BookTrackingSystem.DTOs;
using BookTrackingSystem.Services;
using Microsoft.AspNetCore.Mvc;
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
        public async Task<ActionResult<IEnumerable<ReadingSessionDto>>> GetReadingSessionsForBook(int bookId)
        {
            var readingSessions = await _readingSessionService.GetReadingSessionsForBookAsync(bookId);
            if (!readingSessions.Any())
            {
                return NotFound();
            }
            return Ok(readingSessions);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ReadingSessionDto>> GetReadingSession(int id)
        {
            var readingSession = await _readingSessionService.GetReadingSessionAsync(id);
            if (readingSession == null)
            {
                return NotFound();
            }
            return Ok(readingSession);
        }

        [HttpPost]
        public async Task<ActionResult<ReadingSessionDto>> PostReadingSession(CreateReadingSessionDto createReadingSessionDto)
        {
            try
            {
                var newReadingSession = await _readingSessionService.AddReadingSessionAsync(createReadingSessionDto);
                return CreatedAtAction(nameof(GetReadingSession), new { id = newReadingSession.Id }, newReadingSession);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message); // 409 Conflict for "one session per book per day" constraint violation
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding new reading session");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutReadingSession(int id, UpdateReadingSessionDto updateReadingSessionDto)
        {
            try
            {
                var updatedReadingSession = await _readingSessionService.UpdateReadingSessionAsync(id, updateReadingSessionDto);
                if (updatedReadingSession == null)
                {
                    return NotFound();
                }
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message); // 409 Conflict for "one session per book per day" constraint violation
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating reading session");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReadingSession(int id)
        {
            var readingSessionToDelete = await _readingSessionService.GetReadingSessionAsync(id);
            if (readingSessionToDelete == null)
            {
                return NotFound();
            }

            await _readingSessionService.DeleteReadingSessionAsync(id);
            return NoContent();
        }
    }
}
