using BookTrackingSystem.DTOs;
using BookTrackingSystem.Models.Common;
using BookTrackingSystem.Models.Enums;
using BookTrackingSystem.Services;
using Microsoft.AspNetCore.Mvc;

namespace BookTrackingSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReadingStatusController : ControllerBase
    {
        private readonly IReadingStatusService _readingStatusService;

        public ReadingStatusController(IReadingStatusService readingStatusService)
        {
            _readingStatusService = readingStatusService;
        }

        [HttpGet]
        public ActionResult<Result<IEnumerable<ReadingStatusDto>>> GetAllStatuses()
        {
            var result = _readingStatusService.GetAllStatuses();
            return Ok(result);
        }

        [HttpGet("{value}")]
        public ActionResult<Result<ReadingStatusDto>> GetStatusInfo(int value)
        {
            if (!Enum.IsDefined(typeof(ReadingStatus), value))
            {
                return Ok(Result<ReadingStatusDto>.Failure("Invalid status value"));
            }

            var status = (ReadingStatus)value;
            var result = _readingStatusService.GetStatusInfo(status);
            return Ok(result);
        }
    }
}
