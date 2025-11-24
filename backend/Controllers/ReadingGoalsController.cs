using BookTrackingSystem.DTOs;
using BookTrackingSystem.Services;
using Microsoft.AspNetCore.Mvc;
using BookTrackingSystem.Models.Common;
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
        public async Task<ActionResult<Result<ReadingGoalDto>>> GetReadingGoal(int bookId)
        {
            var result = await _readingGoalService.GetReadingGoalByBookIdAsync(bookId);
            if (!result.IsSuccess)
            {
                return Ok(result);
            }
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<Result<ReadingGoalDto>>> PostReadingGoal(CreateReadingGoalDto createReadingGoalDto)
        {
            var result = await _readingGoalService.AddReadingGoalAsync(createReadingGoalDto);
            if (result.IsSuccess)
            {
                return CreatedAtAction(nameof(GetReadingGoal), new { bookId = result.Data!.BookId }, result);
            }
            return Ok(result);
        }

        [HttpPut("{bookId}")]
        public async Task<ActionResult<Result>> PutReadingGoal(int bookId, UpdateReadingGoalDto updateReadingGoalDto)
        {
            var result = await _readingGoalService.UpdateReadingGoalAsync(bookId, updateReadingGoalDto);
            return Ok(result);
        }
    }
}
