using BookTrackingSystem.DTOs;
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
        public ActionResult<IEnumerable<ReadingStatusDto>> GetAllStatuses()
        {
            var statuses = _readingStatusService.GetAllStatuses();
            return Ok(statuses);
        }

        [HttpGet("{value}")]
        public ActionResult<ReadingStatusDto> GetStatusInfo(int value)
        {
            if (!Enum.IsDefined(typeof(ReadingStatus), value))
            {
                return BadRequest("Invalid status value");
            }

            var status = (ReadingStatus)value;
            var statusInfo = _readingStatusService.GetStatusInfo(status);

            if (statusInfo == null)
            {
                return NotFound();
            }

            return Ok(statusInfo);
        }
    }
}
