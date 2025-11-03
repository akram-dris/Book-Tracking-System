using BookTrackingSystem.DTOs;
using BookTrackingSystem.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace BookTrackingSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReadingGoalsController : ControllerBase
    {
        private readonly IReadingGoalService _readingGoalService;
        private readonly ILogger<ReadingGoalsController> _logger;

        public ReadingGoalsController(IReadingGoalService readingGoalService, ILogger<ReadingGoalsController> logger)
        {
            _readingGoalService = readingGoalService;
            _logger = logger;
        }

        [HttpGet("{bookId}")]
        public async Task<ActionResult<ReadingGoalDto>> GetReadingGoal(int bookId)
        {
            var readingGoal = await _readingGoalService.GetReadingGoalByBookIdAsync(bookId);
            if (readingGoal == null)
            {
                return NotFound();
            }
            return Ok(readingGoal);
        }

        [HttpPost]
        public async Task<ActionResult<ReadingGoalDto>> PostReadingGoal(CreateReadingGoalDto createReadingGoalDto)
        {
            try
            {
                var newReadingGoal = await _readingGoalService.AddReadingGoalAsync(createReadingGoalDto);
                return CreatedAtAction(nameof(GetReadingGoal), new { bookId = newReadingGoal.BookId }, newReadingGoal);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding new reading goal");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("{bookId}")]
        public async Task<IActionResult> PutReadingGoal(int bookId, UpdateReadingGoalDto updateReadingGoalDto)
        {
            try
            {
                var updatedReadingGoal = await _readingGoalService.UpdateReadingGoalAsync(bookId, updateReadingGoalDto);
                if (updatedReadingGoal == null)
                {
                    return NotFound();
                }
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating reading goal");
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
